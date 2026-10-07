import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import {
  CheckCircle2, Verified, CalendarCheck, MailCheck, MessageSquare, ShieldCheck, Timer,
} from "lucide-react";
import { stripe } from "@/lib/stripe";
import { unwrapRow } from "@/lib/embedded";
import { createClient } from "@/lib/supabase/server";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Avatar from "@/components/ui/avatar";
import PaymentConfirming from "./pending-confirm";
import { normalizeCurrency, formatCurrency } from "@/lib/currency";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment Confirmed | Acadivo",
};

export default async function OrderConfirmedPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { id } = await params;
  const { session_id } = await searchParams;

  // User-scoped client only: RLS guarantees this row is the signed-in student's.
  // Order/payment changes happen exclusively in the verified Stripe webhook.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  if (!session_id) {
    redirect(`/orders/${id}/payment`);
  }

  const { data: orderRow } = await supabase
    .from("orders")
    .select("id, price, currency, status, proposal_id, proposal:proposals(request:requests(title), helper:users(id, name))")
    .eq("id", id)
    .eq("student_id", user.id)
    .maybeSingle();

  if (!orderRow) notFound();

  const proposal = unwrapRow<{ request: { title: string }[] | { title: string } | null; helper: { id: string; name: string }[] | { id: string; name: string } | null }>(orderRow.proposal);
  const helper = unwrapRow<{ id: string; name: string }>(proposal?.helper);
  const title = unwrapRow<{ title: string }>(proposal?.request)?.title ?? "Acadivo Order";

  // Confirm the checkout session is genuinely bound to this order before
  // showing any "paid" state. The webhook performs the authoritative write.
  let sessionVerified = false;
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    sessionVerified =
      session.payment_status === "paid" && session.metadata?.order_id === id;
  } catch {
    sessionVerified = false;
  }

  if (!sessionVerified) {
    redirect(`/orders/${id}/payment`);
  }

  const { data: paymentRow } = await supabase
    .from("payments")
    .select("amount, currency, status, receipt_url, created_at")
    .eq("order_id", id)
    .maybeSingle();

  const finalized = paymentRow?.status === "paid" || orderRow.status !== "payment_pending";

  if (!finalized) {
    return (
      <div className="w-full max-w-xl mx-auto flex flex-col gap-5 py-4">
        <div className="text-center flex flex-col items-center gap-3">
          <Badge variant="secondary" className="gap-1">
            <Verified size={12} /> Redirecting to secure checkout… done
          </Badge>
          <h1 className="font-display text-2xl font-bold text-on-surface max-w-sm">
            {orderRow.status === "payment_pending" ? "Payment received — finalizing…" : "Order confirmed"}
          </h1>
        </div>
        <PaymentConfirming />
      </div>
    );
  }

  const receiptUrl =
    typeof paymentRow?.receipt_url === "string" && paymentRow.receipt_url.length > 0
      ? paymentRow.receipt_url
      : null;

  const currency = normalizeCurrency(orderRow.currency);
  const price = formatCurrency(Number(orderRow.price), currency);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-5 py-4">
      <div className="text-center flex flex-col items-center gap-3">
        <span className="w-16 h-16 rounded-full bg-success/10 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 size={34} className="fill-emerald-50" />
        </span>
        <div className="inline-flex items-center gap-2">
          <Badge variant="secondary" className="gap-1"><Verified size={12} /> Payment confirmed</Badge>
        </div>
        <h1 className="font-display text-2xl font-bold text-on-surface max-w-sm">
          You&apos;re all set — your order is officially active.
        </h1>
        <p className="text-sm text-on-surface-variant max-w-md">
          {helper?.name} has received your assignment brief and work has started.
        </p>
      </div>

      <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-outline-variant">
          <p className="text-xs text-on-surface-variant">Order #{orderRow.id.slice(0, 8).toUpperCase()}</p>
          <p className="font-display font-semibold text-on-surface mt-0.5">{title}</p>
        </div>
        <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-3 gap-5">
          <div>
            <p className="text-xs text-on-surface-variant uppercase tracking-wide">Amount</p>
            <p className="font-display text-lg font-bold text-primary mt-0.5">{price}</p>
            <p className="text-xs text-on-surface-variant">Paid via Card</p>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant uppercase tracking-wide">Milestone</p>
            <p className="text-sm font-semibold text-on-surface mt-0.5 inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> In Progress
            </p>
            <p className="text-xs text-on-surface-variant">Step 2 of 4</p>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant uppercase tracking-wide">Helper</p>
            <div className="flex items-center gap-2 mt-1">
              <Avatar name={helper?.name || "Helper"} size="sm" />
              <p className="text-sm font-semibold text-on-surface truncate">{helper?.name || "Acadivo Helper"}</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-low/40 flex flex-col gap-1.5">
          <p className="text-xs text-on-surface-variant inline-flex items-center gap-1.5">
            <CalendarCheck size={13} /> Guaranteed delivery per agreed deadline &middot; work may begin immediately
          </p>
          {receiptUrl ? (
            <a
              href={receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary inline-flex items-center gap-1.5 font-semibold hover:underline"
            >
              <MailCheck size={13} /> View your payment receipt
            </a>
          ) : (
            <p className="text-xs text-on-surface-variant inline-flex items-center gap-1.5">
              <MailCheck size={13} /> Receipt sent to your account email
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href={`/orders/${orderRow.id}`}>
          <Button className="w-full justify-center">
            Open Project Workspace
          </Button>
        </Link>
        <Link href={`/orders/${orderRow.id}`}>
          <Button variant="outline" className="w-full justify-center">
            <MessageSquare size={15} /> Message {(helper?.name || "Helper").split(" ")[0]}
          </Button>
        </Link>
      </div>

      <div className="flex items-start gap-2 p-4 rounded-xl bg-surface-container-low">
        <ShieldCheck size={17} className="text-primary shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed text-on-surface-variant">
          Protected by the <span className="font-semibold text-on-surface">Acadivo Academic Guarantee</span>:{" "}
          <span className="font-semibold text-on-surface inline-flex items-center gap-1"><Timer size={11} /> unlimited revisions</span>{" "}
          until you&apos;re satisfied. Funds release to the mentor only after your review.
        </p>
      </div>
    </div>
  );
}