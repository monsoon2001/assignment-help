"use server";

import { revalidatePath } from "next/cache";
import { adminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/audit";

export interface CompensationSettings {
  sharePercent: number;
  basis: "gross" | "net_of_stripe_fees";
}

export type CompensationResult = { ok: boolean; message: string };

/**
 * Reads the admin-only helper compensation config. Uses the service-role client
 * so the table stays fully revoked from `authenticated`; only server code that
 * has passed requireAdmin() ever sees it.
 */
export async function getCompensationSettings(): Promise<CompensationSettings> {
  await requireAdmin();
  const { data } = await adminClient
    .from("platform_settings")
    .select("default_helper_share_percent, helper_share_basis")
    .eq("id", true)
    .maybeSingle();

  return {
    sharePercent: Number(data?.default_helper_share_percent ?? 80),
    basis: data?.helper_share_basis === "gross" ? "gross" : "net_of_stripe_fees",
  };
}

export async function updateCompensationSettings(
  _prev: CompensationResult,
  formData: FormData
): Promise<CompensationResult> {
  const adminId = await requireAdmin();

  const sharePercent = Number(String(formData.get("sharePercent") ?? "").trim());
  const basis = String(formData.get("basis") ?? "").trim();

  if (!Number.isFinite(sharePercent) || sharePercent < 0 || sharePercent > 100) {
    return { ok: false, message: "Helper share must be a number between 0 and 100." };
  }
  if (basis !== "gross" && basis !== "net_of_stripe_fees") {
    return { ok: false, message: "Invalid share basis." };
  }

  const { error } = await adminClient
    .from("platform_settings")
    .update({
      default_helper_share_percent: sharePercent,
      helper_share_basis: basis,
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);

  if (error) return { ok: false, message: error.message };

  await logAdminAction(adminId, "compensation_settings_update", null, {
    share_percent: sharePercent,
    basis,
  });

  revalidatePath("/admin/settings");
  return { ok: true, message: "Compensation settings saved." };
}
