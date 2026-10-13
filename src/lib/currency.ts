// Acadivo charges in a single currency: Canadian dollars (CAD). All proposal
// prices, estimates and order amounts are quoted and charged in CAD. There is
// no multicurrency presentment, conversion or Adaptive Pricing.

export const SUPPORTED_CURRENCIES = ["CAD"] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  CAD: "CAD — Canadian Dollar (C$)",
};

export const CURRENCY_FLAGS: Record<CurrencyCode, string> = {
  CAD: "🇨🇦",
};

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  CAD: "C$",
};

export function isSupportedCurrency(value: unknown): value is CurrencyCode {
  return typeof value === "string" && (SUPPORTED_CURRENCIES as readonly string[]).includes(value);
}

/** Amounts are always CAD, so this is an identity function kept for call sites. */
export function convertCurrency(amount: number, _from?: string, _to?: string): number {
  void _from;
  void _to;
  return amount;
}

export function formatCurrency(amount: number, _currency?: string): string {
  void _currency;
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function currencySymbol(_currency?: string): string {
  void _currency;
  return CURRENCY_SYMBOLS.CAD;
}

export function normalizeCurrency(_value?: string | null): CurrencyCode {
  void _value;
  return "CAD";
}

// Countries offered in the request form. Kept for the request form UI; they no
// longer affect the payment currency.
export const OTHER_COUNTRY = "Other";

export const COUNTRIES = [
  "Australia",
  "Canada",
  "New Zealand",
  "United Kingdom",
  "United States",
  OTHER_COUNTRY,
] as const;

export type CountryName = (typeof COUNTRIES)[number];

export const DEFAULT_COUNTRY = "United States";

export function isKnownCountry(value: string | null | undefined): value is CountryName {
  return (COUNTRIES as readonly string[]).includes(value ?? "");
}

export function defaultCurrencyForCountry(_country?: string | null): CurrencyCode {
  void _country;
  return "CAD";
}

// ============================================================================
// Approximate display currencies.
//
// The platform always *charges* CAD. A student may additionally see an
// approximate equivalent in their own currency under each quote. These are the
// only currencies we can render, and they are display-only — they never affect
// the amount charged, the Pay button label or the Stripe receipt.
// ============================================================================

export const DISPLAY_CURRENCIES = ["CAD", "GBP", "AUD", "USD", "NZD", "EUR"] as const;

export type DisplayCurrency = (typeof DISPLAY_CURRENCIES)[number];

export const DEFAULT_DISPLAY_CURRENCY: DisplayCurrency = "CAD";

/** The non-CAD currencies a quote can be approximated in. */
export type ForeignDisplayCurrency = Exclude<DisplayCurrency, "CAD">;

/** CAD-based rates (value of 1 CAD in each foreign currency). */
export type DisplayRates = Partial<Record<ForeignDisplayCurrency, number>>;

export const DISPLAY_CURRENCY_LABELS: Record<DisplayCurrency, string> = {
  CAD: "CAD — Canadian Dollar",
  GBP: "GBP — British Pound",
  AUD: "AUD — Australian Dollar",
  USD: "USD — US Dollar",
  NZD: "NZD — New Zealand Dollar",
  EUR: "EUR — Euro",
};

export const DISPLAY_CURRENCY_SYMBOLS: Record<DisplayCurrency, string> = {
  CAD: "C$",
  GBP: "£",
  AUD: "A$",
  USD: "US$",
  NZD: "NZ$",
  EUR: "€",
};

export function isDisplayCurrency(value: unknown): value is DisplayCurrency {
  return (
    typeof value === "string" &&
    (DISPLAY_CURRENCIES as readonly string[]).includes(value)
  );
}

export function normalizeDisplayCurrency(value: unknown): DisplayCurrency {
  return isDisplayCurrency(value) ? value : DEFAULT_DISPLAY_CURRENCY;
}

// ISO 3166-1 alpha-2 country -> display currency. Only countries whose national
// currency is one of the six display currencies are mapped; everything else
// falls back to CAD. Extend this map (and COUNTRY_NAMES) to widen coverage.
const COUNTRY_CURRENCY: Record<string, DisplayCurrency> = {
  // Canadian dollar
  CA: "CAD",
  // US dollar (incl. countries that use it as legal tender)
  US: "USD",
  EC: "USD",
  SV: "USD",
  PA: "USD",
  PR: "USD",
  TL: "USD",
  ZW: "USD",
  // Pound sterling
  GB: "GBP",
  // Australian dollar
  AU: "AUD",
  // New Zealand dollar
  NZ: "NZD",
  // Euro
  AD: "EUR",
  AT: "EUR",
  BE: "EUR",
  CY: "EUR",
  DE: "EUR",
  EE: "EUR",
  ES: "EUR",
  FI: "EUR",
  FR: "EUR",
  GR: "EUR",
  HR: "EUR",
  IE: "EUR",
  IT: "EUR",
  LT: "EUR",
  LU: "EUR",
  LV: "EUR",
  MC: "EUR",
  ME: "EUR",
  MT: "EUR",
  NL: "EUR",
  PT: "EUR",
  SI: "EUR",
  SK: "EUR",
  SM: "EUR",
  VA: "EUR",
  XK: "EUR",
};

const COUNTRY_NAMES: Record<string, string> = {
  CA: "Canada",
  US: "United States",
  EC: "Ecuador",
  SV: "El Salvador",
  PA: "Panama",
  PR: "Puerto Rico",
  TL: "Timor-Leste",
  ZW: "Zimbabwe",
  GB: "United Kingdom",
  AU: "Australia",
  NZ: "New Zealand",
  AD: "Andorra",
  AT: "Austria",
  BE: "Belgium",
  CY: "Cyprus",
  DE: "Germany",
  EE: "Estonia",
  ES: "Spain",
  FI: "Finland",
  FR: "France",
  GR: "Greece",
  HR: "Croatia",
  IE: "Ireland",
  IT: "Italy",
  LT: "Lithuania",
  LU: "Luxembourg",
  LV: "Latvia",
  MC: "Monaco",
  ME: "Montenegro",
  MT: "Malta",
  NL: "Netherlands",
  PT: "Portugal",
  SI: "Slovenia",
  SK: "Slovakia",
  SM: "San Marino",
  VA: "Vatican City",
  XK: "Kosovo",
};

const COUNTRY_NAME_ALIASES: Record<string, string> = {
  "united states of america": "US",
  usa: "US",
  "u.s.a.": "US",
  "united kingdom": "GB",
  uk: "GB",
  "great britain": "GB",
  england: "GB",
};

/**
 * Resolve a country (ISO alpha-2 code or English name) to a known ISO code that
 * maps to a display currency. Returns null for unknown/unmapped countries.
 */
export function isoForCountry(country?: string | null): string | null {
  if (!country) return null;
  const raw = country.trim();
  if (!raw) return null;
  if (/^[a-zA-Z]{2}$/.test(raw)) {
    const code = raw.toUpperCase();
    return COUNTRY_CURRENCY[code] ? code : null;
  }
  const lower = raw.toLowerCase();
  const alias = COUNTRY_NAME_ALIASES[lower];
  if (alias) return alias;
  const found = Object.entries(COUNTRY_NAMES).find(([, name]) => name.toLowerCase() === lower);
  return found ? found[0] : null;
}

/**
 * Map a country to one of the display currencies. Returns null when the country
 * is unknown or has no supported display currency (callers default to CAD).
 */
export function currencyForCountry(country?: string | null): DisplayCurrency | null {
  const iso = isoForCountry(country);
  return iso ? COUNTRY_CURRENCY[iso] ?? null : null;
}

/** Selectable countries for the profile, derived from the currency map. */
export const COUNTRY_OPTIONS: { code: string; name: string; currency: DisplayCurrency }[] =
  Object.entries(COUNTRY_CURRENCY)
    .map(([code, currency]) => ({ code, name: COUNTRY_NAMES[code] ?? code, currency }))
    .sort((a, b) => a.name.localeCompare(b.name));

export function countryNameFor(code?: string | null): string | null {
  if (!code) return null;
  return COUNTRY_NAMES[code.trim().toUpperCase()] ?? null;
}

/** Format an approximate foreign amount (never used for the charged CAD value). */
export function formatApproxCurrency(amount: number, currency: DisplayCurrency): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(safe);
  } catch {
    return `${DISPLAY_CURRENCY_SYMBOLS[currency]}${safe.toFixed(2)}`;
  }
}
