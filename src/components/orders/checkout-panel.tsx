"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import Select from "@/components/ui/select";
import PayButton from "@/components/orders/pay-button";
import {
  SUPPORTED_CURRENCIES,
  CURRENCY_LABELS,
  normalizeCurrency,
  convertCurrency,
  formatCurrency,
} from "@/lib/currency";

export default function CheckoutPanel({
  orderId,
  basePrice,
  baseCurrency,
}: {
  orderId: string;
  basePrice: number;
  baseCurrency: string;
}) {
  const [selected, setSelected] = useState<string>(normalizeCurrency(baseCurrency));
  const currency = normalizeCurrency(selected);

  const serviceFee = 0;

  const total = useMemo(
    () => convertCurrency(basePrice, normalizeCurrency(baseCurrency), currency),
    [basePrice, baseCurrency, currency]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-outline-variant overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-outline-variant bg-surface-container-lowest">
          <span className="text-sm font-medium text-on-surface">Payment summary</span>
          <span className="text-xs text-on-surface-variant">Billed once in {currency}</span>
        </div>
        <div className="px-5 py-4 flex flex-col gap-2.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant">Helper Fee</span>
            <span className="font-medium text-on-surface">
              {formatCurrency(total, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant inline-flex items-center gap-1">
              Platform Service &amp; Quality Assurance <SlidersHorizontal size={13} />
            </span>
            <span className="font-medium text-on-surface">
              {formatCurrency(serviceFee, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2.5 border-t border-outline-variant">
            <span className="font-semibold text-on-surface">Total Due</span>
            <span className="font-display text-xl font-bold text-primary">
              {formatCurrency(total + serviceFee, currency)}
            </span>
          </div>
        </div>
      </div>

      <Select
        label="Pay in"
        value={currency}
        onChange={(e) => setSelected(e.target.value)}
        options={SUPPORTED_CURRENCIES.map((c) => ({ value: c, label: CURRENCY_LABELS[c] }))}
      />

      <PayButton orderId={orderId} amount={total + serviceFee} currency={currency} />
    </div>
  );
}