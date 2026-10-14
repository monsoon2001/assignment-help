import "server-only";
import { adminClient } from "@/lib/supabase/admin";
import { getCadRates } from "@/lib/fx.server";
import {
  computeLocalCharge,
  currencyForCountry,
  DEFAULT_CURRENCY,
  normalizeCurrency,
} from "@/lib/currency";

/**
 * The platform's hidden processing/FX buffer applied to non-Canadian students.
 * Read from the admin-only settings table with the service role; it is never
 * itemised and is only used to derive the single local total.
 */
export async function getFxSurchargePercent(): Promise<number> {
  const { data } = await adminClient
    .from("platform_settings")
    .select("fx_surcharge_percent")
    .eq("id", true)
    .maybeSingle();

  const pct = Number(data?.fx_surcharge_percent);
  return Number.isFinite(pct) ? pct : 0;
}

export interface ResolvedCharge {
  currency: string;
  amount: number;
}

export interface ChargeContext {
  localCurrency: string;
  rates: Record<string, number> | null;
  surchargePercent: number;
}

/**
 * The client-safe inputs a student UI needs to preview a local charge: their
 * local currency, the daily CAD-based rates and the hidden buffer. Used by the
 * proposal card so the quote matches what will be locked at acceptance.
 */
export async function getChargeContext(country: string | null): Promise<ChargeContext> {
  const [rates, surchargePercent] = await Promise.all([
    getCadRates(),
    getFxSurchargePercent(),
  ]);
  return {
    localCurrency: currencyForCountry(country) ?? DEFAULT_CURRENCY,
    rates,
    surchargePercent,
  };
}

/**
 * Resolve the amount and currency a student is charged, from the helper's quoted
 * base amount and the student's saved location. Falls back to CAD when the
 * local currency has no usable rate. Returns null when no charge can be derived.
 */
export async function resolveLocalCharge(
  baseAmount: number,
  baseCurrency: string,
  country: string | null
): Promise<ResolvedCharge | null> {
  if (!Number.isFinite(baseAmount) || baseAmount <= 0) return null;

  const rates = await getCadRates();
  if (!rates && normalizeCurrency(baseCurrency) !== DEFAULT_CURRENCY) {
    return null;
  }

  const surcharge = await getFxSurchargePercent();
  const localCurrency = currencyForCountry(country) ?? DEFAULT_CURRENCY;

  const localAmount = computeLocalCharge(
    baseAmount,
    baseCurrency,
    localCurrency,
    rates,
    surcharge
  );
  if (localAmount !== null && localAmount > 0) {
    return { currency: localCurrency, amount: localAmount };
  }

  // Local currency was unsupported or had no rate — fall back to CAD.
  if (localCurrency !== DEFAULT_CURRENCY) {
    const cadAmount = computeLocalCharge(
      baseAmount,
      baseCurrency,
      DEFAULT_CURRENCY,
      rates,
      0
    );
    if (cadAmount !== null && cadAmount > 0) {
      return { currency: DEFAULT_CURRENCY, amount: cadAmount };
    }
  }

  return null;
}
