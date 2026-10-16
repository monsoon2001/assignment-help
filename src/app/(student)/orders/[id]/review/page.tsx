import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { ShieldCheck, Star, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { unwrapRow } from "@/lib/embedded";
import Card from "@/components/ui/card";
import Avatar from "@/components/ui/avatar";
import { ACADIVO_HELPER_NAME } from "@/lib/avatars";
import ReviewForm from "@/components/orders/review-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leave a Review | Acadivo",
};

export default async function OrderReviewPage({
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
    .select("id, status, student_id, proposal:proposals(request:requests(title))")
    .eq("id", id)
    .maybeSingle();

  if (!orderRow || orderRow.student_id !== user.id) {
    notFound();
  }

  const proposal = unwrapRow<{ request: { title: string }[] | { title: string } | null }>(orderRow.proposal);
  const title = unwrapRow<{ title: string }>(proposal?.request)?.title ?? "Order";

  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("order_id", id)
    .maybeSingle();

  if (existing) {
    redirect(`/orders/${id}`);
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-5">
      <div className="text-center flex flex-col items-center gap-2">
        <span className="w-14 h-14 rounded-full bg-success/10 text-success flex items-center justify-center">
          <CheckCircle2 size={28} className="fill-success-tint" />
        </span>
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
          <Star size={13} className="text-accent" /> Order Complete
        </div>
        <h1 className="font-display text-2xl font-bold text-on-surface">
          How was your experience?
        </h1>
        <p className="text-sm text-on-surface-variant max-w-md">
          Your honest feedback helps fellow students choose the right helper and
          rewards mentors for outstanding guidance.
        </p>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <Avatar name={ACADIVO_HELPER_NAME} role="helper" size="lg" online />
          <div className="min-w-0 flex-1">
            <p className="font-display font-semibold text-on-surface">{ACADIVO_HELPER_NAME}</p>
            <p className="text-xs text-on-surface-variant truncate">{title}</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-on-surface-variant">
            <ShieldCheck size={14} className="text-success" />
            Verified mentor
          </div>
        </div>
        <ReviewForm orderId={id} helperName={ACADIVO_HELPER_NAME} />
      </Card>
    </div>
  );
}