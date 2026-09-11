import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import { ArrowLeft, Mail, Package, Star } from "lucide-react";
import { requireAdmin, adminClient } from "@/lib/admin";
import { unwrapRow } from "@/lib/embedded";
import { EmptyState } from "@/components/ui/states";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Detail | PeerCraft Admin",
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_VARIANT: Record<string, "primary" | "warning" | "success" | "secondary" | "danger" | "outline"> = {
  payment_pending: "warning",
  in_progress: "secondary",
  delivered: "primary",
  revision_requested: "warning",
  completed: "success",
  disputed: "danger",
};

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const { data: order } = await adminClient
    .from("orders")
    .select("id, status, price, deadline, created_at, student:users(id, name, email), helper:users(id, name, email), proposal:proposals(id, description, revisions_included, created_at, request:requests(title, description))")
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();

  const [messages, deliveries, payments, reviews] = await Promise.all([
    adminClient.from("messages").select("id").eq("order_id", id),
    adminClient.from("deliveries").select("id, message, file_urls, created_at").eq("order_id", id).order("created_at", { ascending: true }),
    adminClient.from("payments").select("id, amount, status, stripe_payment_intent_id, created_at").eq("order_id", id).order("created_at", { ascending: true }),
    adminClient.from("reviews").select("id, rating, comment, created_at").eq("order_id", id).maybeSingle(),
  ]);

  const proposal = unwrapRow<{ description: string | null; revisions_included: number; created_at: string; request: unknown }>(order.proposal);
  const request = unwrapRow<{ title: string; description: string | null }>(proposal?.request);
  const student = unwrapRow<{ id: string; name: string | null; email: string | null }>(order.student);
  const helper = unwrapRow<{ id: string; name: string | null; email: string | null }>(order.helper);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mb-3">
          <ArrowLeft size={14} /> Back to orders
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-bold text-on-surface">Order</h1>
          <Badge variant={STATUS_VARIANT[order.status] ?? "outline"}>{order.status.replaceAll("_", " ")}</Badge>
        </div>
        <p className="text-sm text-on-surface-variant mt-1">
          <span className="font-mono text-xs">{order.id}</span> · Created {formatDate(order.created_at)}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-on-surface mb-4">Work</h2>
          <p className="text-sm font-medium text-on-surface">{request?.title ?? "Untitled request"}</p>
          <p className="text-sm text-on-surface-variant mt-1 line-clamp-4">{proposal?.description ?? request?.description}</p>
          <p className="text-xs text-on-surface-variant mt-3">
            {(proposal?.revisions_included ?? 0) > 0 ? `${proposal?.revisions_included} revision(s) included` : "No revisions included"}
          </p>
          <p className="text-xs text-on-surface-variant mt-1">Deadline: {formatDate(order.deadline)}</p>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-on-surface mb-4">Student</h2>
          <div className="flex items-center gap-3">
            <Avatar name={student?.name ?? "Student"} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-on-surface truncate">{student?.name ?? "Unnamed"}</p>
              <p className="text-xs text-on-surface-variant truncate flex items-center gap-1">
                <Mail size={11} /> {student?.email}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-on-surface mb-4">Helper</h2>
          <div className="flex items-center gap-3">
            <Avatar name={helper?.name ?? "Helper"} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-on-surface truncate">{helper?.name ?? "Unnamed"}</p>
              <p className="text-xs text-on-surface-variant truncate flex items-center gap-1">
                <Mail size={11} /> {helper?.email}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-on-surface">Payments</h2>
          <Badge variant="outline">Price ${Number(order.price).toFixed(2)}</Badge>
        </div>
        {(payments.data ?? []).length > 0 ? (
          <div className="divide-y divide-outline-variant/20">
            {(payments.data ?? []).map((payment) => (
              <div key={payment.id} className="p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    ${Number(payment.amount).toFixed(2)} <span className="font-normal text-on-surface-variant">· {formatDate(payment.created_at)}</span>
                  </p>
                  <p className="text-xs text-on-surface-variant font-mono mt-0.5">{payment.stripe_payment_intent_id ?? "No payment intent"}</p>
                </div>
                <Badge variant={payment.status === "paid" ? "success" : payment.status === "refunded" ? "warning" : "outline"}>
                  {payment.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6">
            <EmptyState icon={<Package size={22} className="text-primary" />} title="No payments yet" message="The student hasn't paid for this order yet." />
          </div>
        )}
      </Card>

      <Card>
        <div className="p-6 border-b border-outline-variant/30">
          <h2 className="font-display text-lg font-semibold text-on-surface">
            Deliveries ({(deliveries.data ?? []).length})
          </h2>
        </div>
        {(deliveries.data ?? []).length > 0 ? (
          <div className="divide-y divide-outline-variant/20">
            {(deliveries.data ?? []).map((delivery) => (
              <div key={delivery.id} className="p-5">
                <p className="text-sm text-on-surface">{delivery.message || "No message."}</p>
                <p className="text-xs text-on-surface-variant mt-1">{formatDate(delivery.created_at)}</p>
                {(delivery.file_urls ?? []).map((url: string) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer" className="block text-xs text-primary hover:underline mt-1 break-all">
                    {url}
                  </a>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6">
            <EmptyState icon={<Package size={22} className="text-primary" />} title="Not delivered yet" message="The helper hasn't submitted deliverables." />
          </div>
        )}
      </Card>

      <Card>
        <div className="p-6 border-b border-outline-variant/30">
          <h2 className="font-display text-lg font-semibold text-on-surface">Review</h2>
        </div>
        {reviews.data ? (
          <div className="p-5 flex items-start gap-3">
            <span className="text-sm font-bold text-amber-500">{"★".repeat(reviews.data.rating)}</span>
            <div>
              <p className="text-sm text-on-surface">{reviews.data.comment || "No comment."}</p>
              <p className="text-xs text-on-surface-variant mt-1">{formatDate(reviews.data.created_at)}</p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <EmptyState icon={<Star size={22} className="text-primary" />} title="No review yet" message="The student hasn't reviewed this order." />
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold text-on-surface mb-1">Activity</h2>
        <p className="text-sm text-on-surface-variant">
          {messages.count ?? 0} chat message{(messages.count ?? 0) === 1 ? "" : "s"} exchanged on this order.
        </p>
      </Card>
    </div>
  );
}