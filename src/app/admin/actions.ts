"use server";

import { revalidatePath } from "next/cache";
import { adminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin";
import { stripe } from "@/lib/stripe";
import { logAdminAction } from "@/lib/audit";

export type ActionResult = { ok: boolean; message: string };

const ALLOWED_ROLES = ["student", "helper", "admin"];
const ALLOWED_STATUSES = ["active", "suspended", "pending"];

function clean(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

export async function setUserStatus(formData: FormData): Promise<void> {
  const adminId = await requireAdmin();
  const userId = clean(formData.get("userId"));
  const status = clean(formData.get("status"));
  if (!userId || !ALLOWED_STATUSES.includes(status)) return;

  const { data: target } = await adminClient
    .from("users")
    .select("id, status")
    .eq("id", userId)
    .maybeSingle();
  if (!target || target.status === status) return;

  await adminClient.from("users").update({ status }).eq("id", userId);
  await logAdminAction(adminId, "user_status_change", userId ?? null, {
    from: target.status,
    to: status,
  });
  revalidatePath("/admin", "layout");
}

export async function updateUser(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const adminId = await requireAdmin();
  const userId = clean(formData.get("userId"));
  const name = clean(formData.get("name"));
  const role = clean(formData.get("role"));
  const status = clean(formData.get("status"));

  if (!userId) return { ok: false, message: "Missing user." };
  if (!ALLOWED_ROLES.includes(role)) return { ok: false, message: "Invalid role." };
  if (!ALLOWED_STATUSES.includes(status)) return { ok: false, message: "Invalid status." };

  const { data: before } = await adminClient
    .from("users")
    .select("name, role, status")
    .eq("id", userId)
    .maybeSingle();

  const { error } = await adminClient
    .from("users")
    .update({ name: name || null, role, status })
    .eq("id", userId);

  if (error) return { ok: false, message: error.message };

  await logAdminAction(adminId, "user_update", userId, {
    from: { name: before?.name ?? null, role: before?.role ?? null, status: before?.status ?? null },
    to: { name: name || null, role, status },
  });

  revalidatePath("/admin", "layout");
  return { ok: true, message: "User updated." };
}

export async function requestRefund(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const adminId = await requireAdmin();
  const paymentId = clean(formData.get("paymentId"));
  if (!paymentId) return { ok: false, message: "Missing payment." };

  const { data: payment } = await adminClient
    .from("payments")
    .select("id, order_id, stripe_payment_intent_id, status")
    .eq("id", paymentId)
    .maybeSingle();

  if (!payment) return { ok: false, message: "Payment not found." };
  if (payment.status !== "paid" || !payment.stripe_payment_intent_id) {
    return { ok: false, message: "Only paid payments can be refunded." };
  }

  try {
    await stripe.refunds.create(
      { payment_intent: payment.stripe_payment_intent_id },
      // Idempotency: a retried request or replayed form submit can't double-refund.
      { idempotencyKey: `refund-${paymentId}` }
    );
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Stripe refund failed." };
  }

  const { error } = await adminClient
    .from("payments")
    .update({ status: "refunded" })
    .eq("id", paymentId);

  if (error) return { ok: false, message: error.message };

  await logAdminAction(adminId, "refund", payment.order_id ?? paymentId, {
    payment_id: paymentId,
    stripe_payment_intent_id: payment.stripe_payment_intent_id,
  });

  revalidatePath("/admin/payments");
  revalidatePath("/admin/orders", "layout");
  return { ok: true, message: "Refund processed." };
}