import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft, ShieldCheck, CreditCard, CalendarDays, BookOpen,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { unwrapRow } from "@/lib/embedded";
import { normalizeCurrency } from "@/lib/currency";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import { ACADIVO_HELPER_NAME } from "@/lib/avatars";
import CheckoutPanel from "@/components/orders/checkout-panel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment | Acadivo",
};

export default async function OrderPaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: orderRow } = await supabase
    .from("orders")
    .select("id, price, currency, base_amount, base_currency, charge_amount, charge_currency, status, deadline, proposal:proposals(request:requests(title, country), helper:users(id, name))")
    .eq("id", id)
    .maybeSingle();

  if (!orderRow) {
    redirect("/requests");
  }

  const proposal = unwrapRow<{ request: { title: string; country: string | null }[] | { title: string; country: string | null } | null }>(orderRow.proposal);
  const request = unwrapRow<{ title: string; country: string | null }>(proposal?.request);

  const chargeAmount =
    orderRow.charge_amount !== null && Number.isFinite(Number(orderRow.charge_amount))
      ? Number(orderRow.charge_amount)
      : Number(orderRow.price);
  const chargeCurrency = normalizeCurrency(orderRow.charge_currency ?? orderRow.currency);

  const order = {
    id: orderRow.id,
    price: chargeAmount,
    currency: chargeCurrency,
    status: orderRow.status,
    deadline: orderRow.deadline as string | null,
    title: request?.title ?? "Acadivo Order",
    country: request?.country ?? null,
    helperName: ACADIVO_HELPER_NAME,
  };

  if (order.status !== "payment_pending") {
    redirect(`/orders/${id}`);
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-4">
      <Link
        href="/requests"
        className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface"
      >
        <ArrowLeft size={15} />
        Back to My Requests
      </Link>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <Card className="p-5 sm:p-6 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-primary" />

          <div>
            <Badge variant="secondary" dot className="shrink-0">Encrypted checkout</Badge>
            <h1 className="font-display text-lg font-bold text-on-surface mt-3">Review and Pay</h1>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-container-low">
            <div className="w-11 h-11 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
              <BookOpen size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-on-surface-variant">Academic Service</p>
              <p className="font-semibold text-on-surface truncate">{order.title}</p>
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant text-xs">
              <CalendarDays size={13} />
              Due {order.deadline ? new Date(order.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Flexible"}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Avatar name={order.helperName} role="helper" size="md" online />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-on-surface truncate">{order.helperName}</p>
                <ShieldCheck size={15} className="text-primary shrink-0" />
              </div>
              <p className="text-xs text-on-surface-variant">Acadivo verified mentor</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl border border-outline-variant bg-surface-container-lowest">
            <CreditCard size={18} className="text-primary" />
            <div>
              <p className="text-sm font-medium text-on-surface">Card</p>
              <p className="text-xs text-on-surface-variant">Visa · Mastercard</p>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-on-surface-variant">
            Payment confirms your order with{" "}
            <span className="font-semibold text-on-surface">{order.helperName}</span>. Revisions or a
            refund under our Refund Policy if the delivered work doesn&apos;t match the agreed scope.
          </p>
        </Card>

        <CheckoutPanel orderId={order.id} amount={order.price} currency={order.currency} />
      </div>
    </div>
  );
}