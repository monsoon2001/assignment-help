export const SUPPORTED_CURRENCIES = ["USD", "AUD", "CAD", "GBP", "NZD"] as const;

// PeerCraft's platform fee, deducted from the helper's share of an order.
// The student always pays the agreed price; the helper receives (1 - fee) of it.
export const PLATFORM_FEE_RATE = 0.2;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  USD: "USD — US Dollar ($)",
  AUD: "AUD — Australian Dollar (A$)",
  CAD: "CAD — Canadian Dollar (C$)",
  GBP: "GBP — British Pound (£)",
  NZD: "NZD — New Zealand Dollar (NZ$)",
};

export const CURRENCY_FLAGS: Record<CurrencyCode, string> = {
  USD: "🇺🇸",
  AUD: "🇦🇺",
  CAD: "🇨🇦",
  GBP: "🇬🇧",
  NZD: "🇳🇿",
};

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: "$",
  AUD: "A$",
  CAD: "C$",
  GBP: "£",
  NZD: "NZ$",
};

// Approximate units per 1 USD (static snapshot). Used to convert a helper's
// quoted price into the currency the student chooses to pay with.
const UNITS_PER_USD: Record<CurrencyCode, number> = {
  USD: 1,
  AUD: 1.52,
  CAD: 1.36,
  GBP: 0.79,
  NZD: 1.64,
};

export function isSupportedCurrency(value: string): value is CurrencyCode {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(value);
}

export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): number {
  if (from === to) return amount;
  const usd = amount / UNITS_PER_USD[from];
  return usd * UNITS_PER_USD[to];
}

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = "USD"
): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  });
}

export function currencySymbol(currency: CurrencyCode): string {
  return CURRENCY_SYMBOLS[currency];
}

export function normalizeCurrency(value: string | null | undefined): CurrencyCode {
  return isSupportedCurrency(value ?? "") ? (value as CurrencyCode) : "USD";
}