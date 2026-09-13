"use client";

import { useState } from "react";
import { Loader2, Lock, ArrowRight } from "lucide-react";
import Button from "@/components/ui/button";
import { normalizeCurrency, formatCurrency } from "@/lib/currency";

export default function PayButton({
  orderId,
  amount,
  currency,
}: {
  orderId: string;
  amount: number;
  currency: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, currency }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not start checkout.");
      setLoading(false);
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-error">{error}</p>}
      <Button
        size="lg"
        className="w-full justify-center"
        disabled={loading}
        onClick={handlePay}
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            Pay {formatCurrency(amount, normalizeCurrency(currency))}
            <ArrowRight size={16} />
          </>
        )}
      </Button>
      <p className="text-xs text-on-surface-variant text-center inline-flex items-center justify-center gap-1">
        <Lock size={12} /> 256-bit encrypted checkout. Unlimited revisions until you&apos;re satisfied.
      </p>
    </div>
  );
}