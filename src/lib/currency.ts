// Multi-currency support.
//
// Helpers may quote a price in any currency below. The platform then charges
// the student in *their* local currency (resolved from their saved sign-in
// location), converts to CAD for its own ledger, and absorbs any processing or
// foreign-exchange cost. Students never see a fee, a commission or a CAD
// equivalent — only the single local total they pay.
//
// Fees baked into that total:
//   * Students in Canada pay a flat 3.9% Stripe processing fee.
//   * Students everywhere else pay 5.9% (processing + currency conversion).

export interface CurrencyMeta {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  /** Number of minor units: 2 for most, 0 for zero-decimal currencies (JPY, KRW). */
  decimals: number;
}

// The currencies a helper can quote in and a student can (potentially) be
// charged in. This is the intersection of the Frankfurter rate feed and the
// presentment currencies Stripe can charge on a Canadian account.
export const CURRENCIES: Record<string, CurrencyMeta> = {
  CAD: { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦", decimals: 2 },
  USD: { code: "USD", name: "US Dollar", symbol: "US$", flag: "🇺🇸", decimals: 2 },
  EUR: { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", decimals: 2 },
  GBP: { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧", decimals: 2 },
  AUD: { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺", decimals: 2 },
  NZD: { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", flag: "🇳🇿", decimals: 2 },
  JPY: { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵", decimals: 0 },
  CNY: { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳", decimals: 2 },
  INR: { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳", decimals: 2 },
  BRL: { code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "🇧🇷", decimals: 2 },
  MXN: { code: "MXN", name: "Mexican Peso", symbol: "MX$", flag: "🇲🇽", decimals: 2 },
  SGD: { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬", decimals: 2 },
  HKD: { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", flag: "🇭🇰", decimals: 2 },
  KRW: { code: "KRW", name: "South Korean Won", symbol: "₩", flag: "🇰🇷", decimals: 0 },
  THB: { code: "THB", name: "Thai Baht", symbol: "฿", flag: "🇹🇭", decimals: 2 },
  MYR: { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", flag: "🇲🇾", decimals: 2 },
  IDR: { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", flag: "🇮🇩", decimals: 2 },
  PHP: { code: "PHP", name: "Philippine Peso", symbol: "₱", flag: "🇵🇭", decimals: 2 },
  CHF: { code: "CHF", name: "Swiss Franc", symbol: "CHF", flag: "🇨🇭", decimals: 2 },
  SEK: { code: "SEK", name: "Swedish Krona", symbol: "kr", flag: "🇸🇪", decimals: 2 },
  NOK: { code: "NOK", name: "Norwegian Krone", symbol: "kr", flag: "🇳🇴", decimals: 2 },
  DKK: { code: "DKK", name: "Danish Krone", symbol: "kr", flag: "🇩🇰", decimals: 2 },
  PLN: { code: "PLN", name: "Polish Złoty", symbol: "zł", flag: "🇵🇱", decimals: 2 },
  CZK: { code: "CZK", name: "Czech Koruna", symbol: "Kč", flag: "🇨🇿", decimals: 2 },
  HUF: { code: "HUF", name: "Hungarian Forint", symbol: "Ft", flag: "🇭🇺", decimals: 2 },
  RON: { code: "RON", name: "Romanian Leu", symbol: "lei", flag: "🇷🇴", decimals: 2 },
  TRY: { code: "TRY", name: "Turkish Lira", symbol: "₺", flag: "🇹🇷", decimals: 2 },
  ILS: { code: "ILS", name: "Israeli New Shekel", symbol: "₪", flag: "🇮🇱", decimals: 2 },
  ZAR: { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦", decimals: 2 },
  BGN: { code: "BGN", name: "Bulgarian Lev", symbol: "лв", flag: "🇧🇬", decimals: 2 },
  ISK: { code: "ISK", name: "Icelandic Króna", symbol: "kr", flag: "🇮🇸", decimals: 2 },
};

/** Every chargeable currency code. */
export const CHARGE_CURRENCIES = Object.keys(CURRENCIES);

export const CURRENCY_CODES = CHARGE_CURRENCIES;

export const DEFAULT_CURRENCY = "CAD";

export function isSupportedCurrency(value: unknown): value is string {
  return typeof value === "string" && value.toUpperCase() in CURRENCIES;
}

/** Uppercase a currency code, falling back to CAD when unknown. */
export function normalizeCurrency(value?: string | null): string {
  if (typeof value === "string" && value.trim().toUpperCase() in CURRENCIES) {
    return value.trim().toUpperCase();
  }
  return DEFAULT_CURRENCY;
}

export function currencyMeta(code?: string | null): CurrencyMeta {
  return CURRENCIES[normalizeCurrency(code)] ?? CURRENCIES.CAD;
}

export function currencyDecimals(code?: string | null): number {
  return currencyMeta(code).decimals;
}

export function currencySymbol(code?: string | null): string {
  return currencyMeta(code).symbol;
}

export function currencyName(code?: string | null): string {
  return currencyMeta(code).name;
}

export function currencyFlag(code?: string | null): string {
  return currencyMeta(code).flag;
}

/** Format an amount in its own currency, e.g. "$150.00" / "¥15,000". */
export function formatCurrency(amount: number, currency: string = DEFAULT_CURRENCY): string {
  const meta = currencyMeta(currency);
  const safe = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: meta.code,
      minimumFractionDigits: meta.decimals,
      maximumFractionDigits: meta.decimals,
    }).format(safe);
  } catch {
    return `${meta.symbol}${safe.toFixed(meta.decimals)}`;
  }
}

/** Convert a major-unit amount to the currency's Stripe minor-unit integer. */
export function toMinorUnits(amount: number, currency: string): number {
  return Math.round(amount * 10 ** currencyDecimals(currency));
}

/** Convert a Stripe minor-unit integer back to a major-unit amount. */
export function fromMinorUnits(minor: number, currency: string): number {
  return minor / 10 ** currencyDecimals(currency);
}

// ============================================================================
// Country <-> currency.
// ============================================================================

interface CountryMeta {
  name: string;
  currency: string;
}

// Only countries whose national currency is in CURRENCIES above are mapped;
// unknown countries fall back to CAD.
const COUNTRY_META: Record<string, CountryMeta> = {
  CA: { name: "Canada", currency: "CAD" },
  US: { name: "United States", currency: "USD" },
  EC: { name: "Ecuador", currency: "USD" },
  SV: { name: "El Salvador", currency: "USD" },
  PA: { name: "Panama", currency: "USD" },
  PR: { name: "Puerto Rico", currency: "USD" },
  TL: { name: "Timor-Leste", currency: "USD" },
  ZW: { name: "Zimbabwe", currency: "USD" },
  AD: { name: "Andorra", currency: "EUR" },
  AT: { name: "Austria", currency: "EUR" },
  BE: { name: "Belgium", currency: "EUR" },
  CY: { name: "Cyprus", currency: "EUR" },
  DE: { name: "Germany", currency: "EUR" },
  EE: { name: "Estonia", currency: "EUR" },
  ES: { name: "Spain", currency: "EUR" },
  FI: { name: "Finland", currency: "EUR" },
  FR: { name: "France", currency: "EUR" },
  GR: { name: "Greece", currency: "EUR" },
  HR: { name: "Croatia", currency: "EUR" },
  IE: { name: "Ireland", currency: "EUR" },
  IT: { name: "Italy", currency: "EUR" },
  LT: { name: "Lithuania", currency: "EUR" },
  LU: { name: "Luxembourg", currency: "EUR" },
  LV: { name: "Latvia", currency: "EUR" },
  MC: { name: "Monaco", currency: "EUR" },
  ME: { name: "Montenegro", currency: "EUR" },
  MT: { name: "Malta", currency: "EUR" },
  NL: { name: "Netherlands", currency: "EUR" },
  PT: { name: "Portugal", currency: "EUR" },
  SI: { name: "Slovenia", currency: "EUR" },
  SK: { name: "Slovakia", currency: "EUR" },
  SM: { name: "San Marino", currency: "EUR" },
  VA: { name: "Vatican City", currency: "EUR" },
  XK: { name: "Kosovo", currency: "EUR" },
  GB: { name: "United Kingdom", currency: "GBP" },
  AU: { name: "Australia", currency: "AUD" },
  NZ: { name: "New Zealand", currency: "NZD" },
  JP: { name: "Japan", currency: "JPY" },
  CN: { name: "China", currency: "CNY" },
  IN: { name: "India", currency: "INR" },
  BR: { name: "Brazil", currency: "BRL" },
  MX: { name: "Mexico", currency: "MXN" },
  SG: { name: "Singapore", currency: "SGD" },
  HK: { name: "Hong Kong", currency: "HKD" },
  KR: { name: "South Korea", currency: "KRW" },
  TH: { name: "Thailand", currency: "THB" },
  MY: { name: "Malaysia", currency: "MYR" },
  ID: { name: "Indonesia", currency: "IDR" },
  PH: { name: "Philippines", currency: "PHP" },
  CH: { name: "Switzerland", currency: "CHF" },
  LI: { name: "Liechtenstein", currency: "CHF" },
  SE: { name: "Sweden", currency: "SEK" },
  NO: { name: "Norway", currency: "NOK" },
  DK: { name: "Denmark", currency: "DKK" },
  PL: { name: "Poland", currency: "PLN" },
  CZ: { name: "Czech Republic", currency: "CZK" },
  HU: { name: "Hungary", currency: "HUF" },
  RO: { name: "Romania", currency: "RON" },
  TR: { name: "Turkey", currency: "TRY" },
  IL: { name: "Israel", currency: "ILS" },
  ZA: { name: "South Africa", currency: "ZAR" },
  LS: { name: "Lesotho", currency: "ZAR" },
  NA: { name: "Namibia", currency: "ZAR" },
  SZ: { name: "Eswatini", currency: "ZAR" },
  BG: { name: "Bulgaria", currency: "BGN" },
  IS: { name: "Iceland", currency: "ISK" },
};

const COUNTRY_NAME_ALIASES: Record<string, string> = {
  "united states of america": "US",
  usa: "US",
  "u.s.a.": "US",
  "united kingdom": "GB",
  uk: "GB",
  "great britain": "GB",
  england: "GB",
  "south korea": "KR",
  "korea": "KR",
  "republic of korea": "KR",
  "czechia": "CZ",
};

export const OTHER_COUNTRY = "Other";

export const DEFAULT_COUNTRY = "United States";

/**
 * Resolve a country (ISO alpha-2 code or English name) to a known ISO code that
 * maps to a currency. Returns null for unknown/unmapped countries.
 */
export function isoForCountry(country?: string | null): string | null {
  if (!country) return null;
  const raw = country.trim();
  if (!raw) return null;
  if (/^[a-zA-Z]{2}$/.test(raw)) {
    const code = raw.toUpperCase();
    return COUNTRY_META[code] ? code : null;
  }
  const lower = raw.toLowerCase();
  const alias = COUNTRY_NAME_ALIASES[lower];
  if (alias) return alias;
  const found = Object.entries(COUNTRY_META).find(([, meta]) => meta.name.toLowerCase() === lower);
  return found ? found[0] : null;
}

/**
 * Map a country to a charge currency. Returns null when the country is unknown
 * or has no supported currency (callers default to CAD).
 */
export function currencyForCountry(country?: string | null): string | null {
  const iso = isoForCountry(country);
  return iso ? COUNTRY_META[iso]?.currency ?? null : null;
}

export function defaultCurrencyForCountry(country?: string | null): string {
  return currencyForCountry(country) ?? DEFAULT_CURRENCY;
}

/** True when a saved country resolves to Canada. */
export function isCanada(country?: string | null): boolean {
  return isoForCountry(country) === "CA";
}

/**
 * Stripe processing fee absorbed by the platform for Canadian students. There is
 * no currency-conversion fee because the platform settles in CAD.
 */
export const CA_PROCESSING_FEE_PERCENT = 3.9;

/**
 * Processing + currency-conversion buffer for students outside Canada. Used as a
 * fallback when the admin setting is missing or non-positive.
 */
export const INTERNATIONAL_FEE_PERCENT = 5.9;

export function countryNameFor(code?: string | null): string | null {
  if (!code) return null;
  return COUNTRY_META[code.trim().toUpperCase()]?.name ?? null;
}

/** Selectable countries for the profile/request forms. */
export const COUNTRY_OPTIONS: { code: string; name: string; currency: string }[] =
  Object.entries(COUNTRY_META)
    .map(([code, meta]) => ({ code, name: meta.name, currency: meta.currency }))
    .sort((a, b) => a.name.localeCompare(b.name));

// ============================================================================
// Local charge computation (pure, safe on both server and client).
// ============================================================================

export function roundMoney(amount: number, currency: string): number {
  const factor = 10 ** currencyDecimals(currency);
  return Math.round((amount + Number.EPSILON) * factor) / factor;
}

/** CAD-based rates: value of 1 CAD in each currency. */
export type CadRates = Record<string, number>;

/** Convert between two currencies through CAD. Returns null if a rate is missing. */
export function convertViaCad(
  amount: number,
  from: string,
  to: string,
  rates: CadRates | null
): number | null {
  const fromCode = normalizeCurrency(from);
  const toCode = normalizeCurrency(to);
  if (fromCode === toCode) return amount;
  if (!rates) return null;
  const fromPerCad = fromCode === "CAD" ? 1 : rates[fromCode];
  const toPerCad = toCode === "CAD" ? 1 : rates[toCode];
  if (!Number.isFinite(fromPerCad) || !Number.isFinite(toPerCad) || (fromPerCad as number) <= 0) {
    return null;
  }
  return (amount / (fromPerCad as number)) * (toPerCad as number);
}

/**
 * The amount a student pays in their local currency: the helper's quoted base
 * converted at the daily rate, plus the platform's processing/conversion fee.
 * The fee is never itemised — only the final local total is shown.
 *
 * `surchargePercent` must already reflect the student's location: 3.9% for
 * Canada, 5.9% (or the configured international buffer) otherwise.
 */
export function computeLocalCharge(
  baseAmount: number,
  baseCurrency: string,
  localCurrency: string,
  rates: CadRates | null,
  surchargePercent: number
): number | null {
  const converted = convertViaCad(baseAmount, baseCurrency, localCurrency, rates);
  if (converted === null) return null;
  const pct = Number.isFinite(surchargePercent) ? surchargePercent : 0;
  const withFee = converted * (1 + pct / 100);
  return roundMoney(withFee, localCurrency);
}
