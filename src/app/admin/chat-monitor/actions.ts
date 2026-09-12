"use server";

import { revalidatePath } from "next/cache";
import { adminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin";

export type ActionResult = { ok: boolean; message: string };

function clean(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

export async function flagMessage(formData: FormData): Promise<void> {
  await requireAdmin();
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
      },
      { onConflict: "message_id" }
    );

  revalidatePath("/admin/chat-monitor");
}

export async function updateFlagStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const flagId = clean(formData.get("flagId"));
  const status = clean(formData.get("status"));
  if (!flagId || !["confirmed", "dismissed"].includes(status)) return;

  await adminClient.from("chat_flags").update({ status }).eq("id", flagId);
  revalidatePath("/admin/chat-monitor");
}

export async function issueWarning(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const userId = clean(formData.get("userId"));
  const messageId = clean(formData.get("messageId"));
  const reason = clean(formData.get("reason"));
  if (!userId || !reason) return { ok: false, message: "Missing details." };

  const admin = await requireAdmin();

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
    message: "You received a warning from PeerCraft support.",
    link: null,
  });

  revalidatePath("/admin/chat-monitor");
  return { ok: true, message: "Warning issued." };
}

export async function resolveAllFlags(formData: FormData): Promise<void> {
  await requireAdmin();
  const reason = clean(formData.get("reason"));
  if (!reason) return;
  await adminClient
    .from("chat_flags")
    .update({ status: "confirmed" })
    .eq("status", "pending")
    .ilike("reason", `%${reason}%`);
  revalidatePath("/admin/chat-monitor");
}