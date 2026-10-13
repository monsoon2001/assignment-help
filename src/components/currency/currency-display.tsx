"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  DEFAULT_DISPLAY_CURRENCY,
  DISPLAY_CURRENCIES,
  DISPLAY_CURRENCY_LABELS,
  DISPLAY_CURRENCY_SYMBOLS,
  formatApproxCurrency,
  isDisplayCurrency,
  type DisplayCurrency,
  type DisplayRates,
} from "@/lib/currency";

const STORAGE_KEY = "pc:display-currency";
const CHANGE_EVENT = "pc:display-currency-change";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function getStoredCurrency(): DisplayCurrency | null {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return isDisplayCurrency(saved) ? saved : null;
  } catch {
    return null;
  }
}

function getServerCurrency(): DisplayCurrency | null {
  return null;
}

interface CurrencyDisplayContextValue {
  currency: DisplayCurrency;
  setCurrency: (currency: DisplayCurrency) => void;
  rates: DisplayRates | null;
  /** Rate for the currently selected currency, or null for CAD / no rate. */
  rate: number | null;
}

const CurrencyDisplayContext = createContext<CurrencyDisplayContextValue | null>(null);

export function CurrencyDisplayProvider({
  defaultCurrency,
  rates,
  children,
}: {
  defaultCurrency: DisplayCurrency;
  rates: DisplayRates | null;
  children: ReactNode;
}) {
  const stored = useSyncExternalStore(
    subscribe,
    getStoredCurrency,
    getServerCurrency
  );
  const currency = stored ?? defaultCurrency;

  const setCurrency = useCallback((next: DisplayCurrency) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore unavailable storage
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const value = useMemo<CurrencyDisplayContextValue>(() => {
    const rate =
      currency === "CAD" || !rates ? null : rates[currency] ?? null;
    return { currency, setCurrency, rates, rate };
  }, [currency, rates, setCurrency]);

  return (
    <CurrencyDisplayContext.Provider value={value}>
      {children}
    </CurrencyDisplayContext.Provider>
  );
}

export function useCurrencyDisplay(): CurrencyDisplayContextValue {
  const ctx = useContext(CurrencyDisplayContext);
  if (!ctx) {
    return {
      currency: DEFAULT_DISPLAY_CURRENCY,
      setCurrency: () => {},
      rates: null,
      rate: null,
    };
  }
  return ctx;
}

/**
 * Small control letting the visitor preview a CAD quote in another currency.
 * Reads and writes shared state, so every approx line on the page updates.
 */
export function CurrencySelector({ className = "" }: { className?: string }) {
  const { currency, setCurrency, rates } = useCurrencyDisplay();

  return (
    <label
      className={`inline-flex items-center gap-2 text-xs text-on-surface-variant ${className}`}
    >
      <span className="hidden sm:inline">View approximate price in</span>
      <span className="sm:hidden">Approx. currency</span>
      <select
        aria-label="View approximate price in"
        value={currency}
        onChange={(event) => setCurrency(event.target.value as DisplayCurrency)}
        className="h-8 rounded-lg border border-outline-variant bg-surface-container-low px-2 text-xs text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {DISPLAY_CURRENCIES.map((value) => (
          <option key={value} value={value} disabled={value !== "CAD" && !rates?.[value]}>
            {value} · {DISPLAY_CURRENCY_SYMBOLS[value]}
          </option>
        ))}
      </select>
      <span className="sr-only">{DISPLAY_CURRENCY_LABELS[currency]}</span>
    </label>
  );
}

/**
 * Renders an approximate equivalent of a CAD amount under a quote. Renders
 * nothing when the selected currency is CAD or no rate is available. The
 * charged amount, Pay button and receipt always remain in CAD.
 */
export function ApproxPrice({
  amountCad,
  className = "",
  withSelector = false,
}: {
  amountCad: number;
  className?: string;
  withSelector?: boolean;
}) {
  const { currency, rate } = useCurrencyDisplay();
  const approx = rate && Number.isFinite(amountCad) ? amountCad * rate : null;

  if (currency === "CAD" || approx === null) {
    return withSelector ? <CurrencySelector className={className} /> : null;
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <p className="text-xs text-on-surface-variant">
        ≈ {formatApproxCurrency(approx, currency)}{" "}
        <span className="text-on-surface-variant/70">
          approximate, your bank sets the final amount
        </span>
      </p>
      {withSelector ? <CurrencySelector /> : null}
    </div>
  );
}
