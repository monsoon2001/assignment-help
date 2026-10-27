"use client";

import { CreditCard, Lock } from "lucide-react";
import PayButton from "@/components/orders/pay-button";
import { formatCurrency, currencyName } from "@/lib/currency";

export default function CheckoutPanel({
  orderId,
  amount,
  currency,
}: {
  orderId: string;
  amount: number;
  currency: string;
}) {
  const total = formatCurrency(amount, currency);

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-outline-variant">
        <CreditCard size={18} className="text-primary" />
        <h2 className="font-display font-semibold text-on-surface text-base">Confirm Payment</h2>
      </div>

      <div className="px-5 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-on-surface-variant">Total</span>
          <span className="font-display text-2xl font-bold text-primary">{total}</span>
        </div>

        <PayButton orderId={orderId} amount={amount} currency={currency} />

        <p className="flex items-start gap-1.5 text-xs text-on-surface-variant leading-relaxed">
          <Lock size={12} className="shrink-0 mt-0.5 text-primary" />
          You&apos;ll be charged {total} in {currencyName(currency)}. Revisions or a refund under
          our Refund Policy if the delivered work doesn&apos;t match the agreed scope.
        </p>
      </div>
    </div>
  );
}
