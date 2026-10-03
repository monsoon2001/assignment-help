"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";

/** Shows while we wait for the verified Stripe webhook to finalize the order.
 *  Order/payment status is changed ONLY by the webhook — never by this page. */
export default function PaymentConfirming() {
  const router = useRouter();
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    if (ticks >= 6) return;
    const t = setTimeout(() => {
      router.refresh();
      setTicks((v) => v + 1);
    }, 1500);
    return () => clearTimeout(t);
  }, [ticks, router]);

  return (
    <div className="text-center flex flex-col items-center gap-4 py-10">
      <Loader2 size={36} className="animate-spin text-primary" />
      <div>
        <p className="font-display font-semibold text-on-surface text-lg">Confirming your payment…</p>
        <p className="text-sm text-on-surface-variant mt-1 max-w-md mx-auto">
          Your payment is being verified securely. This page refreshes automatically
          and will show your workspace once Stripe confirms the charge.
        </p>
      </div>
      <p className="text-xs text-on-surface-variant inline-flex items-center gap-1.5">
        <ShieldCheck size={13} className="text-success" />
        Secure, encrypted payment processing
      </p>
    </div>
  );
}