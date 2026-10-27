"use server";

import { revalidatePath } from "next/cache";
import { adminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/audit";

export type PayoutResult = { ok: boolean; message: string };

const ALLOWED_METHODS = ["wise", "bank_transfer", "other"];

function clean(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

export async function recordPayout(_prev: PayoutResult, formData: FormData): Promise<PayoutResult> {
  const adminId = await requireAdmin();

  const helperId = clean(formData.get("helperId"));
  const orderIds = formData
    .getAll("orderIds")
    .map((v) => clean(v))
    .filter(Boolean);

  const amountSent = Number(clean(formData.get("amountSent")));
  const method = clean(formData.get("method")) || "wise";
  const reference = clean(formData.get("reference")) || null;
  const notes = clean(formData.get("notes")) || null;
  const amountReceivedRaw = clean(formData.get("amountReceived"));
  const amountReceived = amountReceivedRaw ? Number(amountReceivedRaw) : null;
  const receivedCurrency = clean(formData.get("receivedCurrency")) || null;

  if (!helperId) return { ok: false, message: "Missing helper." };
  if (orderIds.length === 0) return { ok: false, message: "Select at least one order." };
  if (!Number.isFinite(amountSent) || amountSent < 0) {
    return { ok: false, message: "Enter a valid amount sent (CAD)." };
  }
  if (amountReceived !== null && (!Number.isFinite(amountReceived) || amountReceived < 0)) {
    return { ok: false, message: "Enter a valid amount received." };
  }
  if (!ALLOWED_METHODS.includes(method)) {
    return { ok: false, message: "Invalid payout method." };
  }

  const { data, error } = await adminClient.rpc("record_helper_payout", {
    p_helper_id: helperId,
    p_order_ids: orderIds,
    p_amount_sent_cad: amountSent,
    p_method: method,
    p_reference: reference,
    p_notes: notes,
    p_amount_received: amountReceived,
    p_received_currency: receivedCurrency,
    p_created_by: adminId,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  await logAdminAction(adminId, "helper_payout", helperId, {
    payout_id: data,
    order_ids: orderIds,
    amount_sent_cad: amountSent,
    method,
  });

  revalidatePath("/admin/helper-balances");
  return { ok: true, message: "Payout recorded." };
}
