import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Avatar from "@/components/ui/avatar";
import { Eye, MessageSquare, Clock, DollarSign, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Active Orders | PeerCraft",
};

const STATUS: Record<string, { label: string; variant: "primary" | "warning" | "success" | "danger" }> = {
  payment_pending: { label: "Payment Pending", variant: "warning" },
  in_progress: { label: "In Progress", variant: "primary" },
  delivered: { label: "Delivered", variant: "success" },
  revision_requested: { label: "Revision Requested", variant: "warning" },
  completed: { label: "Completed", variant: "success" },
  disputed: { label: "Under Review", variant: "danger" },
};

function timeAgo(value: string): string {
  const diff = Date.now() - new Date(value).getTime();
  const hrs = Math.max(1, Math.round(diff / 3600000));
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

type OrderRow = {
  id: string;
  status: string;
  price: number;
  deadline: string | null;
  created_at: string;
  student: { id: string; name: string | null } | null;
  proposal: { request: { title: string | null; subject: string | null } | null } | null;
};

export default async function HelperOrders() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data } = await supabase
    .from("orders")
    .select("id, status, price, deadline, created_at, student:users(id, name), proposal:proposals(request:requests(title, subject))")
    .eq("helper_id", user.id)
    .order("created_at", { ascending: false });

  const orders = ((data ?? []) as unknown as OrderRow[]).map((o) => ({
    ...o,
    student: Array.isArray(o.student) ? (o.student[0] ?? null) : o.student,
    proposal: Array.isArray(o.proposal) ? (o.proposal[0] ?? null) : o.proposal,
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-on-surface">
          Active Orders
        </h1>
        <p className="text-on-surface-variant mt-1">
          Track progress and manage your ongoing orders.
        </p>
      </div>

      {orders.length === 0 && (
        <Card className="p-10 text-center">
          <p className="text-on-surface-variant">
            No orders yet. Keep sending proposals — you&apos;ll see accepted work here.
          </p>
        </Card>
      )}

      <div className="space-y-4">
        {orders.map((order) => {
          const meta = STATUS[order.status] ?? { label: order.status, variant: "primary" as const };
          const title = order.proposal?.request?.title ?? "Untitled Order";
          const subject = order.proposal?.request?.subject ?? "General";
          return (
            <Card key={order.id} className="p-6" hover>
              <div className="flex items-start gap-4">
                <Avatar name={order.student?.name || "Student"} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-on-surface">
                          {title}
                        </h3>
                        <Badge variant={meta.variant} dot>{meta.label}</Badge>
                      </div>
                      <p className="text-sm text-on-surface-variant">
                        #{order.id.slice(0, 8).toUpperCase()} &middot; Student: {order.student?.name || "Student"} &middot; {subject}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-on-surface shrink-0 inline-flex items-center gap-1">
                      <DollarSign size={14} />
                      {order.price.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <span className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant">
                      <Clock size={14} />
                      Deadline:{" "}
                      {order.deadline
                        ? new Date(order.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : "Flexible"}
                    </span>
                    <span className="text-sm text-on-surface-variant">
                      Updated {timeAgo(order.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    <Link href={`/helper/orders/${order.id}`}>
                      <Button size="sm">
                        <Eye size={14} /> Open Workspace <ChevronRight size={14} />
                      </Button>
                    </Link>
                    <Link href={`/helper/orders/${order.id}`}>
                      <Button size="sm" variant="outline">
                        <MessageSquare size={14} /> Chat
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}