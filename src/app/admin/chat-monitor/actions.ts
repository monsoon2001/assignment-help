"use server";

import { revalidatePath } from "next/cache";
import { adminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/audit";

export type ActionResult = { ok: boolean; message: string };

function clean(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

export async function flagMessage(formData: FormData): Promise<void> {
  const adminId = await requireAdmin();
  const messageId = clean(formData.get("messageId"));
  const reason = clean(formData.get("reason")) || "Reported by admin";
  if (!messageId) return;

  const { data: message } = await adminClient
    .from("messages")
    .select("id, request_id, order_id")
    .eq("id", messageId)
    .maybeSingle();

  if (!message) return;

  await adminClient
    .from("chat_flags")
    .upsert(
      {
        message_id: messageId,
        request_id: message.request_id,
        order_id: message.order_id,
        reason,
        status: "pending",
        flagged_by: adminId,
      },
      { onConflict: "message_id" }
    );

  await logAdminAction(adminId, "message_flag", messageId, { reason });
  revalidatePath("/admin/chat-monitor");
}

export async function updateFlagStatus(formData: FormData): Promise<void> {
  const adminId = await requireAdmin();
  const flagId = clean(formData.get("flagId"));
  const status = clean(formData.get("status"));
  if (!flagId || !["confirmed", "dismissed"].includes(status)) return;

  await adminClient.from("chat_flags").update({ status }).eq("id", flagId);
  await logAdminAction(adminId, "flag_status_change", flagId, { to: status });
  revalidatePath("/admin/chat-monitor");
}

export async function issueWarning(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const userId = clean(formData.get("userId"));
  const messageId = clean(formData.get("messageId"));
  const reason = clean(formData.get("reason"));
  if (!userId || !reason) return { ok: false, message: "Missing details." };

  const { error } = await adminClient.from("user_warnings").insert({
    user_id: userId,
    message_id: messageId || null,
    reason,
    issued_by: admin,
  });

  if (error) return { ok: false, message: error.message };

  await adminClient.from("notifications").insert({
    user_id: userId,
    type: "warning",
    message: "You received a warning from Acadibo support.",
    link: null,
  });

  await logAdminAction(admin, "issue_warning", userId, { message_id: messageId || null, reason });

  revalidatePath("/admin/chat-monitor");
  return { ok: true, message: "Warning issued." };
}

export async function resolveAllFlags(formData: FormData): Promise<void> {
  const adminId = await requireAdmin();
  const reason = clean(formData.get("reason"));
  if (!reason) return;
  await adminClient
    .from("chat_flags")
    .update({ status: "confirmed" })
    .eq("status", "pending")
    .ilike("reason", `%${reason}%`);
  await logAdminAction(adminId, "resolve_all_flags", null, { reason_pattern: reason });
  revalidatePath("/admin/chat-monitor");
}