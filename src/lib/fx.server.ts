import "server-only";
import { CHARGE_CURRENCIES, currencyDecimals, DEFAULT_CURRENCY } from "@/lib/currency";

/**
 * Server-only foreign exchange.
 *
 * Helpers quote in any supported currency; the platform charges the student in
 * their local currency and keeps a CAD ledger. Rates come from the Frankfurter
 * API (ECB reference rates) with CAD as the base and are cached for 24h. When
 * rates are unavailable the caller must refuse to lock a non-CAD charge rather
 * than guess.
 */

const FOREIGN_CURRENCIES = CHARGE_CURRENCIES.filter((c) => c !== "CAD");

const RATES_URL = `https://api.frankfurter.dev/v1/latest?base=CAD&symbols=${FOREIGN_CURRENCIES.join(
  ",",
)}`;

const DAY_SECONDS = 60 * 60 * 24;

/** Value of 1 CAD in each foreign currency, or null when unavailable. */
export async function getCadRates(): Promise<Record<string, number> | null> {
  try {
    const res = await fetch(RATES_URL, {
      next: { revalidate: DAY_SECONDS },
      headers: { accept: "application/json" },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { rates?: Record<string, unknown> } | null;
    const raw = data?.rates;
    if (!raw) return null;

    const rates: Record<string, number> = {};
    for (const currency of FOREIGN_CURRENCIES) {
      const value = Number(raw[currency]);
      if (Number.isFinite(value) && value > 0) rates[currency] = value;
    }
    return Object.keys(rates).length > 0 ? rates : null;
  } catch {
    return null;
  }
}

/**
 * How many `to` units one `from` unit buys. Returns null when a required rate is
 * missing (including when `from`/`to` is not a supported currency).
 */
export async function rateBetween(from: string, to: string): Promise<number | null> {
  const fromCode = from.toUpperCase();
  const toCode = to.toUpperCase();
  if (fromCode === toCode) return 1;

  const rates = await getCadRates();
  if (!rates) return null;

  const fromPerCad = fromCode === "CAD" ? 1 : rates[fromCode];
  const toPerCad = toCode === "CAD" ? 1 : rates[toCode];
  if (!Number.isFinite(fromPerCad) || !Number.isFinite(toPerCad) || fromPerCad <= 0) {
    return null;
  }
  return toPerCad / fromPerCad;
}

export function roundMoney(amount: number, currency: string): number {
  const decimals = currencyDecimals(currency);
  const factor = 10 ** decimals;
  return Math.round((amount + Number.EPSILON) * factor) / factor;
}

/**
 * Convert an amount between currencies using the CAD-based rate. Returns null
 * when a rate is unavailable so callers can fall back to charging CAD.
 */
export async function convert(amount: number, from: string, to: string): Promise<number | null> {
  const rate = await rateBetween(from, to);
  if (rate === null) return null;
  return amount * rate;
}

// Stripe minimum charge amounts (major units) per presentment currency. Used as
// a guard so we can surface a friendly error before Stripe rejects the session.
const MIN_CHARGE_MAJOR: Record<string, number> = {
  CAD: 0.5,
  USD: 0.5,
  EUR: 0.5,
  GBP: 0.3,
  AUD: 0.5,
  NZD: 0.5,
  JPY: 50,
  CNY: 5,
  INR: 0.5,
  BRL: 0.5,
  MXN: 10,
  SGD: 0.5,
  HKD: 4,
  KRW: 500,
  THB: 10,
  MYR: 2,
  IDR: 5000,
  PHP: 20,
  CHF: 0.5,
  SEK: 3,
  NOK: 3,
  DKK: 2.5,
  PLN: 2,
  CZK: 15,
  HUF: 175,
  RON: 2,
  TRY: 5,
  ILS: 2,
  ZAR: 5,
  BGN: 1,
  ISK: 100,
};

export function minimumChargeMajor(currency: string): number {
  return MIN_CHARGE_MAJOR[currency.toUpperCase()] ?? MIN_CHARGE_MAJOR[DEFAULT_CURRENCY];
}
