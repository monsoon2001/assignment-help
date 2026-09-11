import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { ShieldCheck, Star, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { unwrapRow } from "@/lib/embedded";
import Card from "@/components/ui/card";
import Avatar from "@/components/ui/avatar";
import ReviewForm from "@/components/orders/review-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leave a Review | PeerCraft",
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
    .select("id, status, student_id, helper:users(id, name), proposal:proposals(request:requests(title))")
    .eq("id", id)
    .maybeSingle();

  if (!orderRow || orderRow.student_id !== user.id) {
    notFound();
  }

  const helper = unwrapRow<{ id: string; name: string }>(orderRow.helper);
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
        <span className="w-14 h-14 rounded-full bg-success/10 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 size={28} className="fill-emerald-50" />
        </span>
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
          <Star size={13} className="text-amber-500" /> Order Complete
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
          <Avatar name={helper?.name || "Helper"} size="lg" online />
          <div className="min-w-0 flex-1">
            <p className="font-display font-semibold text-on-surface">{helper?.name || "PeerCraft Helper"}</p>
            <p className="text-xs text-on-surface-variant truncate">{title}</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-on-surface-variant">
            <ShieldCheck size={14} className="text-success" />
            Verified mentor
          </div>
        </div>
        <ReviewForm orderId={id} helperName={helper?.name ?? "Helper"} />
      </Card>

      <div className="flex items-start gap-2 p-4 rounded-xl bg-surface-container-low">
        <ShieldCheck size={17} className="text-primary shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed text-on-surface-variant">
          The <span className="font-semibold text-on-surface">PeerCraft Honor Shield</span> verifies authentic,
          syllabus-compliant assessments. Your review is displayed anonymously as a verified student.
        </p>
      </div>
    </div>
  );
}