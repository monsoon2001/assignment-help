import "server-only";
import {
  DISPLAY_CURRENCIES,
  type DisplayCurrency,
  type DisplayRates,
  type ForeignDisplayCurrency,
} from "@/lib/currency";

/**
 * Daily-cached CAD-based exchange rates, fetched server-side.
 *
 * Rates are the value of 1 CAD in each foreign currency (e.g. rates.GBP is how
 * many GBP one Canadian dollar buys). They are cached for 24h via Next's fetch
 * cache and are used *only* to render the approximate price line — the charged
 * amount is always CAD.
 */

export type { DisplayRates } from "@/lib/currency";

const FOREIGN_CURRENCIES = DISPLAY_CURRENCIES.filter(
  (c): c is ForeignDisplayCurrency => c !== "CAD"
);

const RATES_URL = `https://api.frankfurter.dev/v1/latest?base=CAD&symbols=${FOREIGN_CURRENCIES.join(
  ","
)}`;

const DAY_SECONDS = 60 * 60 * 24;

/** Returns null when rates are unavailable; callers then hide the approx line. */
export async function getDisplayRates(): Promise<DisplayRates | null> {
  try {
    const res = await fetch(RATES_URL, {
      next: { revalidate: DAY_SECONDS },
      headers: { accept: "application/json" },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { rates?: Record<string, unknown> } | null;
    const raw = data?.rates;
    if (!raw) return null;

    const rates: DisplayRates = {};
    for (const currency of FOREIGN_CURRENCIES) {
      const value = Number(raw[currency]);
      if (Number.isFinite(value) && value > 0) {
        rates[currency] = value;
      }
    }

    return Object.keys(rates).length > 0 ? rates : null;
  } catch {
    return null;
  }
}

export function displayRateFor(
  rates: DisplayRates | null,
  currency: DisplayCurrency
): number | null {
  if (!rates || currency === "CAD") return null;
  const rate = rates[currency];
  return Number.isFinite(rate) ? (rate as number) : null;
}
