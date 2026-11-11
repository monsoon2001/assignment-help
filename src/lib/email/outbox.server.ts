import "server-only";
import { adminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email.server";

export interface EnqueueEmailInput {
  eventType: string;
  recipientUserId?: string | null;
  toEmail: string;
  subject: string;
  template: string;
  payload?: Record<string, unknown>;
  dedupeKey: string;
}

export async function enqueueEmail(input: EnqueueEmailInput): Promise<void> {
  try {
    await adminClient.from("email_outbox").insert({
      event_type: input.eventType,
      recipient_user_id: input.recipientUserId ?? null,
      to_email: input.toEmail,
      subject: input.subject,
      template: input.template,
      payload: input.payload ?? {},
      dedupe_key: input.dedupeKey,
    });
  } catch (err) {
    // dedupe conflict or other failure must not block caller
    console.error("[email-outbox] enqueue failed", err);
  }
}

function isAllowlisted(email: string): boolean {
  const allow = process.env.EMAIL_ALLOWLIST?.trim();
  if (!allow) return true; // production: allow all
  const list = allow.split(",").map((s) => s.trim().toLowerCase());
  return list.includes(email.toLowerCase());
}

export async function processOutbox(limit = 50): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;
  const { data: rows } = await adminClient
    .from("email_outbox")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(limit);

  for (const row of rows ?? []) {
    if (row.attempts >= 5) {
      await adminClient.from("email_outbox").update({ status: "failed" }).eq("id", row.id);
      failed++;
      continue;
    }
    if (!isAllowlisted(row.to_email)) {
      console.info(`[email-outbox] skipped (not allowlisted): ${row.to_email}`);
      await adminClient.from("email_outbox").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", row.id);
      sent++;
      continue;
    }
    const payload = (row.payload ?? {}) as Record<string, unknown>;
    const ok = await sendEmail({
      to: [row.to_email],
      subject: row.subject,
      text: typeof payload.text === "string" ? payload.text : "",
      link: typeof payload.link === "string" ? payload.link : undefined,
      linkLabel: typeof payload.linkLabel === "string" ? payload.linkLabel : undefined,
    });
    await adminClient.from("email_outbox").update({
      attempts: row.attempts + 1,
      status: ok ? "sent" : "pending",
      sent_at: ok ? new Date().toISOString() : null,
      last_error: ok ? null : "send failed",
    }).eq("id", row.id);
    if (ok) sent++; else failed++;
  }
  return { sent, failed };
}