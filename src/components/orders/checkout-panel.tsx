"use client";

import { BookOpen, CreditCard, Lock, Globe2 } from "lucide-react";
import Avatar from "@/components/ui/avatar";
import PayButton from "@/components/orders/pay-button";
import { ApproxPrice } from "@/components/currency/currency-display";
import { formatCurrency } from "@/lib/currency";

export default function CheckoutPanel({
  orderId,
  basePrice,
  title,
  helperName,
}: {
  orderId: string;
  basePrice: number;
  baseCurrency?: string;
  country?: string | null;
  title: string;
  helperName?: string;
}) {
  const total = formatCurrency(basePrice);

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

          {helperName && (
            <div className="flex items-center gap-3 px-1">
              <Avatar name={helperName} role="helper" size="sm" />
              <span className="text-sm text-on-surface-variant">Helper</span>
              <span className="text-sm font-medium text-on-surface truncate">{helperName}</span>
            </div>
          )}

          <div className="flex items-center justify-between px-1 py-1 border-t border-outline-variant/60 pt-4">
            <span className="text-sm font-semibold text-on-surface">Total</span>
            <span className="font-display text-2xl font-bold text-primary">{total}</span>
          </div>

          <ApproxPrice amountCad={basePrice} withSelector className="px-1" />

          <div className="flex items-center justify-center gap-1.5 text-xs text-on-surface-variant">
            <Lock size={13} className="shrink-0" />
            <span>Payment protected by Stripe</span>
          </div>
        </div>
      </div>

      <PayButton orderId={orderId} amount={basePrice} />

      <p className="flex items-start gap-1.5 text-xs text-on-surface-variant leading-relaxed">
        <Globe2 size={13} className="shrink-0 mt-0.5 text-primary" />
        Charged in Canadian dollars (CAD). Your bank will convert from your local
        currency and may add a foreign-transaction fee.
      </p>
    </div>
  );
}
