"use server";

import { revalidatePath } from "next/cache";
import { adminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/audit";
import { DEFAULT_PRICING_RATES } from "@/lib/pricing.server";

export interface FxSettings {
  surchargePercent: number;
  stripePct: number;
  stripeFixed: number;
  intlCardPct: number;
  conversionPct: number;
}

export type FxResult = { ok: boolean; message: string };

/**
 * Reads the admin-only FX/processing buffer and pricing rates. Uses the service-role client so
 * the table stays fully revoked from `authenticated`; only server code that has
 * passed requireAdmin() ever sees it.
 */
export async function getFxSettings(): Promise<FxSettings> {
  await requireAdmin();
  const { data } = await adminClient
    .from("platform_settings")
    .select("fx_surcharge_percent, stripe_pct, stripe_fixed, intl_card_pct, conversion_pct")
    .eq("id", true)
    .maybeSingle();

  const stripePct = Number(data?.stripe_pct);
  const stripeFixed = Number(data?.stripe_fixed);
  const intlCardPct = Number(data?.intl_card_pct);
  const conversionPct = Number(data?.conversion_pct);

  return {
    surchargePercent: Number(data?.fx_surcharge_percent ?? 0),
    stripePct: Number.isFinite(stripePct) && stripePct >= 0 ? stripePct : DEFAULT_PRICING_RATES.stripePct,
    stripeFixed: Number.isFinite(stripeFixed) && stripeFixed >= 0 ? stripeFixed : DEFAULT_PRICING_RATES.stripeFixed,
    intlCardPct: Number.isFinite(intlCardPct) && intlCardPct >= 0 ? intlCardPct : DEFAULT_PRICING_RATES.intlCardPct,
    conversionPct: Number.isFinite(conversionPct) && conversionPct >= 0 ? conversionPct : DEFAULT_PRICING_RATES.conversionPct,
  };
}

export async function updateFxSettings(_prev: FxResult, formData: FormData): Promise<FxResult> {
  const adminId = await requireAdmin();

  const surchargePercent = Number(String(formData.get("surchargePercent") ?? "").trim());
  const stripePct = Number(String(formData.get("stripePct") ?? "").trim());
  const stripeFixed = Number(String(formData.get("stripeFixed") ?? "").trim());
  const intlCardPct = Number(String(formData.get("intlCardPct") ?? "").trim());
  const conversionPct = Number(String(formData.get("conversionPct") ?? "").trim());

  if (!Number.isFinite(surchargePercent) || surchargePercent < 0 || surchargePercent > 100) {
    return { ok: false, message: "Processing buffer must be a number between 0 and 100." };
  }
  if (!Number.isFinite(stripePct) || stripePct < 0 || stripePct > 1) {
    return { ok: false, message: "STRIPE_PCT must be a decimal between 0 and 1 (e.g. 0.029)." };
  }
  if (!Number.isFinite(stripeFixed) || stripeFixed < 0 || stripeFixed > 100) {
    return { ok: false, message: "STRIPE_FIXED must be a positive number (e.g. 0.30)." };
  }
  if (!Number.isFinite(intlCardPct) || intlCardPct < 0 || intlCardPct > 1) {
    return { ok: false, message: "INTL_CARD_PCT must be a decimal between 0 and 1 (e.g. 0.008)." };
  }
  if (!Number.isFinite(conversionPct) || conversionPct < 0 || conversionPct > 1) {
    return { ok: false, message: "CONVERSION_PCT must be a decimal between 0 and 1 (e.g. 0.02)." };
  }

  const { error } = await adminClient
    .from("platform_settings")
    .update({
      fx_surcharge_percent: surchargePercent,
      stripe_pct: stripePct,
      stripe_fixed: stripeFixed,
      intl_card_pct: intlCardPct,
      conversion_pct: conversionPct,
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);

  if (error) return { ok: false, message: error.message };

  await logAdminAction(adminId, "fx_settings_update", null, {
    fx_surcharge_percent: surchargePercent,
    stripe_pct: stripePct,
    stripe_fixed: stripeFixed,
    intl_card_pct: intlCardPct,
    conversion_pct: conversionPct,
  });

  revalidatePath("/admin/settings");
  return { ok: true, message: "Pricing and FX settings saved." };
}
