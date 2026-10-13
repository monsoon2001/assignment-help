import "server-only";
import { adminClient } from "@/lib/supabase/admin";

export type HelperShareBasis = "gross" | "net_of_stripe_fees";

export interface HelperShareConfig {
  sharePercent: number;
  basis: HelperShareBasis;
}

/**
 * Admin-only compensation config. Resolved server-side from the private
 * platform_settings / helper_compensation tables and never sent to a
 * student or helper client.
 */
export async function getHelperShareConfig(helperId: string): Promise<HelperShareConfig> {
  const [{ data: settings }, { data: perHelper }] = await Promise.all([
    adminClient
      .from("platform_settings")
      .select("default_helper_share_percent, helper_share_basis")
      .eq("id", true)
      .maybeSingle(),
    adminClient
      .from("helper_compensation")
      .select("share_percent")
      .eq("helper_id", helperId)
      .maybeSingle(),
  ]);

  const basis: HelperShareBasis =
    settings?.helper_share_basis === "gross" ? "gross" : "net_of_stripe_fees";

  const sharePercent = Number(
    perHelper?.share_percent ?? settings?.default_helper_share_percent ?? 80
  );

  return {
    sharePercent: Number.isFinite(sharePercent) ? sharePercent : 80,
    basis,
  };
}

/**
 * Compute the helper's share from the real gross charge and (when available)
 * the Stripe fee. Server-side only — the result lives in the private ledger.
 */
export function computeHelperShare(
  grossCad: number,
  stripeFeeCad: number | null,
  config: HelperShareConfig
): { netCad: number; helperShareCad: number } {
  const gross = round2(grossCad);
  const fee = stripeFeeCad === null ? null : round2(stripeFeeCad);
  const net = round2(gross - (fee ?? 0));
  const basisAmount = config.basis === "net_of_stripe_fees" ? net : gross;
  const helperShare = round2((basisAmount * config.sharePercent) / 100);
  return { netCad: net, helperShareCad: helperShare };
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
