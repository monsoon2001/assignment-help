import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Card from "@/components/ui/card";
import StatusBadge from "@/components/ui/status-badge";
import Button from "@/components/ui/button";
import Avatar from "@/components/ui/avatar";
import { Clock, DollarSign } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { normalizeCurrency, formatCurrency } from "@/lib/currency";
import { orderStatusMeta } from "@/lib/status-meta";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Active Orders | Acadivo",
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
  currency: string;
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
    .select("id, status, price, currency, deadline, created_at, student:users!orders_student_id_fkey(id, name), proposal:proposals(request:requests(title, subject))")
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
        <Card className="p-6 sm:p-10 text-center flex flex-col items-center gap-3">
          <span className="w-14 h-14 rounded-2xl bg-primary-container/20 flex items-center justify-center">
            <DollarSign size={24} className="text-primary" />
          </span>
          <h2 className="font-display font-semibold text-on-surface">No orders yet</h2>
          <p className="text-sm text-on-surface-variant max-w-md">
            Accepted proposals become paid orders and appear here. Send proposals on incoming requests
            to land your first one.
          </p>
          <Link href="/helper/requests" className="mt-1">
            <Button size="sm" variant="outline">Check incoming requests</Button>
          </Link>
        </Card>
      )}

      <div className="space-y-4">
        {orders.map((order) => {
          const meta = orderStatusMeta(order.status);
          const title = order.proposal?.request?.title ?? "Untitled Order";
          const subject = order.proposal?.request?.subject ?? "General";
          return (
            <Link key={order.id} href={`/helper/orders/${order.id}`} className="block">
              <Card className="p-6" hover>
                <div className="flex items-start gap-4">
                  <Avatar name={order.student?.name || "Student"} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h2 className="font-semibold text-on-surface">
                            {title}
                          </h2>
                          <StatusBadge tone={meta.tone} dot>{meta.label}</StatusBadge>
                        </div>
                        <p className="text-sm text-on-surface-variant">
                          #{order.id.slice(0, 8).toUpperCase()} &middot; Student: {order.student?.name || "Student"} &middot; {subject}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-on-surface shrink-0 inline-flex items-center gap-1">
                        <DollarSign size={14} />
                        {formatCurrency(Number(order.price), normalizeCurrency(order.currency))}
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
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}