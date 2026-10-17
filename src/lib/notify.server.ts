import "server-only";
import { adminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email.server";

/**
 * Fan-out notifications for a marketplace activity.
 *
 * Emails the student, the helper and every admin so nobody has to keep the
 * portal open. Best-effort: failures are logged and never propagate.
 *
 * Some events already create in-app notification rows via Postgres triggers
 * (new request, proposal, payment, delivery, revision, completion). For those
 * pass an empty `inAppRoles` to avoid duplicates and let this only send email.
 * For events with no trigger (accept, decline, refund, dispute, payout) include
 * the relevant roles in `inAppRoles` so the bell updates too.
 */

export type PartyRole = "student" | "helper" | "admin";

interface Party {
  id: string;
  email: string | null;
  name: string | null;
}

export interface ActivityNotice {
  type: string;
  /** In-app message text (stored on notification rows). */
  message: string;
  /** App path used for both the in-app link and the email CTA. */
  link: string;
  emailSubject: string;
  /** Plain-text email body, without greeting/sign-off. */
  emailBody: string;
  emailLinkLabel?: string;
  /** Roles that receive an email. */
  audience: PartyRole[];
  /** Roles that also get an in-app notification row. */
  inAppRoles?: PartyRole[];
  /** Actor's in-app row is skipped (still emailed) to avoid self-notifying. */
  actorId?: string | null;
}

async function loadUsers(ids: (string | null | undefined)[]): Promise<Map<string, Party>> {
  const unique = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  if (unique.length === 0) return new Map();
  const { data } = await adminClient.from("users").select("id, email, name").in("id", unique);
  return new Map(
    (data ?? []).map((u) => [u.id, { id: u.id, email: u.email, name: u.name } as Party])
  );
}

async function loadAdmins(): Promise<Party[]> {
  const { data } = await adminClient.from("users").select("id, email, name").eq("role", "admin");
  return (data ?? []).map((u) => ({ id: u.id, email: u.email, name: u.name } as Party));
}

function greeting(party: Party): string {
  const first = party.name?.trim().split(/\s+/)[0];
  return first ? `Hi ${first},` : "Hello,";
}

async function notifyParties(
  parties: { party: Party; role: PartyRole }[],
  notice: ActivityNotice
): Promise<void> {
  const inAppRoles = new Set(notice.inAppRoles ?? []);
  const audience = new Set(notice.audience);

  const tasks = parties.map(async ({ party, role }) => {
    if (!audience.has(role)) return;

    if (
      inAppRoles.has(role) &&
      party.id !== notice.actorId
    ) {
      const { error } = await adminClient.from("notifications").insert({
        user_id: party.id,
        type: notice.type,
        message: notice.message.slice(0, 500),
        link: notice.link,
      });
      if (error) console.error("[notify] in-app insert failed", error.message);
    }

    if (party.id !== notice.actorId || role === "admin") {
      await sendEmail({
        to: [party.email],
        subject: notice.emailSubject,
        text: `${greeting(party)}\n\n${notice.emailBody}`,
        link: notice.link,
        linkLabel: notice.emailLinkLabel ?? "Open Acadivo",
      });
    }
  });

  await Promise.all(tasks);
}

async function loadRequestParties(
  requestId: string
): Promise<{ student: Party | null; helper: Party | null; title: string } | null> {
  const { data } = await adminClient
    .from("requests")
    .select("title, student_id, helper_id")
    .eq("id", requestId)
    .maybeSingle();
  if (!data) return null;
  const users = await loadUsers([data.student_id, data.helper_id]);
  return {
    title: data.title,
    student: data.student_id ? users.get(data.student_id) ?? null : null,
    helper: data.helper_id ? users.get(data.helper_id) ?? null : null,
  };
}

async function loadOrderParties(
  orderId: string
): Promise<{ student: Party | null; helper: Party | null; title: string } | null> {
  const { data } = await adminClient
    .from("orders")
    .select("student_id, helper_id, request:requests(title)")
    .eq("id", orderId)
    .maybeSingle();
  if (!data) return null;
  const users = await loadUsers([data.student_id, data.helper_id]);
  const request = Array.isArray(data.request) ? data.request[0] : data.request;
  return {
    title: (request as { title?: string } | null)?.title ?? "your order",
    student: data.student_id ? users.get(data.student_id) ?? null : null,
    helper: data.helper_id ? users.get(data.helper_id) ?? null : null,
  };
}

/** Notify the student + helper + all admins about a request-level activity. */
export async function notifyRequestActivity(
  requestId: string,
  build: (ctx: { title: string }) => ActivityNotice
): Promise<void> {
  try {
    const ctx = await loadRequestParties(requestId);
    if (!ctx) return;
    const notice = build({ title: ctx.title });
    const admins = notice.audience.includes("admin") ? await loadAdmins() : [];
    const parties: { party: Party; role: PartyRole }[] = [];
    if (ctx.student) parties.push({ party: ctx.student, role: "student" });
    if (ctx.helper) parties.push({ party: ctx.helper, role: "helper" });
    admins.forEach((admin) => parties.push({ party: admin, role: "admin" }));
    await notifyParties(parties, notice);
  } catch (error) {
    console.error("[notify] request activity failed", error);
  }
}

/** Notify the student + helper + all admins about an order-level activity. */
export async function notifyOrderActivity(
  orderId: string,
  build: (ctx: { title: string }) => ActivityNotice
): Promise<void> {
  try {
    const ctx = await loadOrderParties(orderId);
    if (!ctx) return;
    const notice = build({ title: ctx.title });
    const admins = notice.audience.includes("admin") ? await loadAdmins() : [];
    const parties: { party: Party; role: PartyRole }[] = [];
    if (ctx.student) parties.push({ party: ctx.student, role: "student" });
    if (ctx.helper) parties.push({ party: ctx.helper, role: "helper" });
    admins.forEach((admin) => parties.push({ party: admin, role: "admin" }));
    await notifyParties(parties, notice);
  } catch (error) {
    console.error("[notify] order activity failed", error);
  }
}
