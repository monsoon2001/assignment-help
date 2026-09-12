import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft, Lock, ShieldCheck, CreditCard, Wallet, School, Star, CalendarDays, BookOpen,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { unwrapRow } from "@/lib/embedded";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import CheckoutPanel from "@/components/orders/checkout-panel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment | PeerCraft",
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
    .select("id, price, currency, status, deadline, proposal:proposals(request:requests(title), helper:users(id, name))")
    .eq("id", id)
    .maybeSingle();

  if (!orderRow) {
    redirect("/requests");
  }

  const proposal = unwrapRow<{ request: { title: string }[] | { title: string } | null; helper: { id: string; name: string }[] | { id: string; name: string } | null }>(orderRow.proposal);
  const requestTitle = unwrapRow<{ title: string }>(proposal?.request)?.title ?? null;
  const helper = unwrapRow<{ id: string; name: string }>(proposal?.helper);

  const order = {
    id: orderRow.id,
    price: Number(orderRow.price),
    currency: typeof orderRow.currency === "string" ? orderRow.currency : "USD",
    status: orderRow.status,
    deadline: orderRow.deadline as string | null,
    title: requestTitle ?? "PeerCraft Order",
    helperName: helper?.name ?? "PeerCraft Helper",
  };

  if (order.status !== "payment_pending") {
    redirect(`/orders/${id}`);
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-5">
      <Link
        href="/requests"
        className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface"
      >
        <ArrowLeft size={15} />
        Back to My Requests
      </Link>

      <div className="flex items-center gap-2">
        <Badge variant="secondary" dot className="shrink-0">Session Locked &amp; Secure</Badge>
        <span className="text-sm text-on-surface-variant">Review and Pay</span>
      </div>

      <Card className="p-6 flex flex-col gap-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 h-52 w-52 rounded-full bg-primary-fixed/30 blur-3xl pointer-events-none" />

        <div>
          <h1 className="font-display text-xl font-bold text-on-surface">Confirm your project details to begin work.</h1>
          <div className="inline-flex items-center gap-2 mt-3">
            <Lock size={15} className="text-primary" />
            <span className="text-xs text-on-surface-variant">Verified and secure checkout</span>
          </div>
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
          <Avatar name={order.helperName} size="md" online />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-on-surface truncate">{order.helperName}</p>
              <ShieldCheck size={15} className="text-primary shrink-0" />
            </div>
            <p className="text-xs text-on-surface-variant">PeerCraft verified mentor</p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-on-surface">
            <Star size={15} className="fill-amber-400 text-amber-400" />
            4.9
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3.5 rounded-xl border border-outline-variant bg-surface-container-lowest cursor-pointer">
            <CreditCard size={18} className="text-primary" />
            <div>
              <p className="text-sm font-medium text-on-surface">Card</p>
              <p className="text-xs text-on-surface-variant">Visa · Mastercard</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3.5 rounded-xl border border-outline-variant opacity-50">
            <Wallet size={18} className="text-on-surface-variant" />
            <div>
              <p className="text-sm font-medium text-on-surface-variant">Digital Wallets</p>
              <p className="text-xs text-on-surface-variant">Apple Pay · Google Pay</p>
            </div>
          </div>
        </div>

        <CheckoutPanel orderId={order.id} basePrice={order.price} baseCurrency={order.currency} />

        <div className="flex items-start gap-2 p-3.5 rounded-xl bg-surface-container-low">
          <School size={16} className="text-primary shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed text-on-surface-variant">
            Your payment confirms an order with <span className="font-semibold text-on-surface">{order.helperName}</span>.
            Funds are released only after you review and approve the finalized draft.
          </p>
        </div>
      </Card>
    </div>
  );
}