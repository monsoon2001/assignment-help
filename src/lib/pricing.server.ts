import "server-only";
import { adminClient } from "@/lib/supabase/admin";
import { isCanada } from "@/lib/currency";

export interface PricingRates {
  stripePct: number;
  stripeFixed: number;
  intlCardPct: number;
  conversionPct: number;
}

export const DEFAULT_PRICING_RATES: PricingRates = {
  stripePct: 0.029,
  stripeFixed: 0.3,
  intlCardPct: 0.008,
  conversionPct: 0.02,
};

/**
 * Loads admin-configured pricing rates from platform_settings, falling back
 * to the standard defaults if unconfigured.
 */
export async function getPricingRates(): Promise<PricingRates> {
  const { data } = await adminClient
    .from("platform_settings")
    .select("stripe_pct, stripe_fixed, intl_card_pct, conversion_pct")
    .eq("id", true)
    .maybeSingle();

  const stripePct = Number(data?.stripe_pct);
  const stripeFixed = Number(data?.stripe_fixed);
  const intlCardPct = Number(data?.intl_card_pct);
  const conversionPct = Number(data?.conversion_pct);

  return {
    stripePct:
      Number.isFinite(stripePct) && stripePct >= 0 ? stripePct : DEFAULT_PRICING_RATES.stripePct,
    stripeFixed:
      Number.isFinite(stripeFixed) && stripeFixed >= 0
        ? stripeFixed
        : DEFAULT_PRICING_RATES.stripeFixed,
    intlCardPct:
      Number.isFinite(intlCardPct) && intlCardPct >= 0
        ? intlCardPct
        : DEFAULT_PRICING_RATES.intlCardPct,
    conversionPct:
      Number.isFinite(conversionPct) && conversionPct >= 0
        ? conversionPct
        : DEFAULT_PRICING_RATES.conversionPct,
  };
}

/**
 * Ceils an amount to the next cent: ceil_to_cent(val) = Math.ceil(val * 100) / 100
 */
export function ceilToCent(val: number): number {
  return Math.ceil(val * 100) / 100;
}

/**
 * Formula:
 * final = ceil_to_cent((base + FIXED) / (1 - PCT_TOTAL))
 * FIXED = stripeFixed (default 0.30)
 * For Canadian student: PCT_TOTAL = stripePct (default 0.029)
 * For student outside Canada: PCT_TOTAL = stripePct + intlCardPct + conversionPct (default 0.029 + 0.008 + 0.02 = 0.057)
 */
export function calculateQuotePrice(
  baseCad: number,
  studentCountry: string | null | undefined,
  rates: PricingRates = DEFAULT_PRICING_RATES,
): { baseCad: number; finalCad: number; feeCad: number } {
  const base = Math.round(baseCad);
  const inCanada = isCanada(studentCountry);
  const pctTotal = inCanada
    ? rates.stripePct
    : rates.stripePct + rates.intlCardPct + rates.conversionPct;

  const raw = (base + rates.stripeFixed) / (1 - pctTotal);
  const finalCad = ceilToCent(raw);
  const feeCad = Math.round((finalCad - base) * 100) / 100;

  return {
    baseCad: base,
    finalCad,
    feeCad,
  };
}
