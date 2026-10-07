"use client";

import { useMemo, useState } from "react";
import { BookOpen, Globe2, CreditCard, Lock } from "lucide-react";
import Select from "@/components/ui/select";
import PayButton from "@/components/orders/pay-button";
import {
  SUPPORTED_CURRENCIES,
  CURRENCY_LABELS,
  CURRENCY_FLAGS,
  normalizeCurrency,
  convertCurrency,
  formatCurrency,
  defaultCurrencyForCountry,
  PLATFORM_FEE_RATE,
} from "@/lib/currency";

export default function CheckoutPanel({
  orderId,
  basePrice,
  baseCurrency,
  country,
  title,
}: {
  orderId: string;
  basePrice: number;
  baseCurrency: string;
  country?: string | null;
  title: string;
}) {
  const [selected, setSelected] = useState<string>(
    (country ? defaultCurrencyForCountry(country) : null) ?? normalizeCurrency(baseCurrency)
  );
  const currency = normalizeCurrency(selected);
  const base = normalizeCurrency(baseCurrency);
  const suggested = country ? defaultCurrencyForCountry(country) : null;

  const price = useMemo(
    () => convertCurrency(basePrice, normalizeCurrency(baseCurrency), currency),
    [basePrice, baseCurrency, currency]
  );
  const fee = price * PLATFORM_FEE_RATE;
  const helperReceives = price - fee;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-outline-variant">
          <CreditCard size={20} className="text-primary" />
          <h2 className="font-display font-semibold text-on-surface text-lg">Confirm Payment</h2>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-2">
              Task
            </p>
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/60">
              <span className="w-8 h-8 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
                <BookOpen size={15} />
              </span>
              <p className="font-medium text-on-surface truncate">{title}</p>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <span className="text-sm text-on-surface-variant">Agreed price</span>
            <span className="text-sm font-semibold text-on-surface">{formatCurrency(price, currency)}</span>
          </div>
        </div>

        <div className="px-5 pb-5 flex flex-col gap-3">
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
            Payment breakdown
          </p>
          <div className="rounded-xl border border-outline-variant/80 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/80 text-sm">
              <span className="text-on-surface-variant">Helper receives</span>
              <span className="font-medium text-on-surface">{formatCurrency(helperReceives, currency)}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/80 text-sm">
              <span className="text-on-surface-variant">Acadivo service fee</span>
              <span className="font-medium text-on-surface">{formatCurrency(fee, currency)}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-primary-container/10 text-sm">
              <span className="font-semibold text-on-surface">You pay</span>
              <span className="font-display text-lg font-bold text-primary">{formatCurrency(price, currency)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 pt-1 text-xs text-on-surface-variant">
            <Lock size={13} className="shrink-0" />
            <span>Payment protected by Stripe</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Select
          label="Pay in"
          value={currency}
          onChange={(e) => setSelected(e.target.value)}
          options={SUPPORTED_CURRENCIES.map((c) => ({
            value: c,
            label: `${CURRENCY_FLAGS[c]} ${CURRENCY_LABELS[c]}`,
          }))}
        />
        {suggested && (
          <p className="flex items-center gap-1.5 text-xs text-on-surface-variant">
            <Globe2 size={13} className="shrink-0 text-primary" />
            {country === "Other" ? (
              <>
                You selected &ldquo;Other&rdquo;, so we defaulted to{" "}
                <span className="font-semibold text-on-surface">{suggested}</span>. Pick another
                currency above if you prefer.
              </>
            ) : (
              <>
                Defaulted to{" "}
                <span className="font-semibold text-on-surface">{suggested}</span> based on your
                country, {country}.
              </>
            )}
          </p>
        )}
        {base !== currency && (
          <p className="text-xs text-on-surface-variant">
            Converted from the agreed price of {formatCurrency(basePrice, base)}.
          </p>
        )}
      </div>

      <PayButton orderId={orderId} amount={price} currency={currency} />
    </div>
  );
}