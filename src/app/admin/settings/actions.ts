"use server";

import { revalidatePath } from "next/cache";
import { adminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/audit";

export interface FxSettings {
  surchargePercent: number;
}

export type FxResult = { ok: boolean; message: string };

/**
 * Reads the admin-only FX/processing buffer. Uses the service-role client so
 * the table stays fully revoked from `authenticated`; only server code that has
 * passed requireAdmin() ever sees it.
 */
export async function getFxSettings(): Promise<FxSettings> {
  await requireAdmin();
  const { data } = await adminClient
    .from("platform_settings")
    .select("fx_surcharge_percent")
    .eq("id", true)
    .maybeSingle();

  return {
    surchargePercent: Number(data?.fx_surcharge_percent ?? 0),
  };
}

export async function updateFxSettings(_prev: FxResult, formData: FormData): Promise<FxResult> {
  const adminId = await requireAdmin();

  const surchargePercent = Number(String(formData.get("surchargePercent") ?? "").trim());

  if (!Number.isFinite(surchargePercent) || surchargePercent < 0 || surchargePercent > 100) {
    return { ok: false, message: "Processing buffer must be a number between 0 and 100." };
  }

  const { error } = await adminClient
    .from("platform_settings")
    .update({
      fx_surcharge_percent: surchargePercent,
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);

  if (error) return { ok: false, message: error.message };

  await logAdminAction(adminId, "fx_settings_update", null, {
    fx_surcharge_percent: surchargePercent,
  });

  revalidatePath("/admin/settings");
  return { ok: true, message: "FX settings saved." };
}
