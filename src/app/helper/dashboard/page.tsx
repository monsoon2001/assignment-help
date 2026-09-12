import Link from "next/link";
import { redirect } from "next/navigation";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import {
  Briefcase,
  DollarSign,
  Clock,
  Star,
  ArrowUpRight,
  FileText,
  Send,
  Settings,
  Inbox,
} from "lucide-react";
import Button from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { unwrapRow } from "@/lib/embedded";
import { formatCurrency, normalizeCurrency, type CurrencyCode } from "@/lib/currency";

export const dynamic = "force-dynamic";

const STATUS_META: Record<string, { label: string; variant: "warning" | "primary" | "success" | "danger" | "outline" }> = {
  payment_pending: { label: "Payment Pending", variant: "warning" },
  in_progress: { label: "In Progress", variant: "primary" },
  delivered: { label: "Delivered", variant: "success" },
  revision_requested: { label: "Revision Requested", variant: "warning" },
  completed: { label: "Completed", variant: "success" },
  disputed: { label: "Under Review", variant: "danger" },
};

function timeAgo(value: string): string {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default async function HelperDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

  const [{ data: profileRow }, { data: orderRows }, { data: reqRows }, { data: notifRows }, { data: payRows }] =
    await Promise.all([
      supabase
        .from("helper_profiles")
        .select("rating_avg, subjects")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("orders")
        .select("id, status, price, currency, deadline, created_at, student:users!orders_student_id_fkey(id, name), proposal:proposals(request:requests(title))")
        .eq("helper_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("requests")
        .select("id, title, subject, status")
        .eq("helper_id", user.id)
        .in("status", ["requested", "proposal_sent"]),
      supabase
        .from("notifications")
        .select("id, type, message, link, read, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("payments")
        .select("amount, currency, created_at")
        .eq("status", "paid"),
    ]);

  const orders = (orderRows ?? []).map((o) => ({
    ...o,
    student: unwrapRow<{ id: string; name: string | null }>(o.student),
    makeTitle: unwrapRow<{ request: unknown }>(o.proposal)?.request
      ? String((unwrapRow<{ request: { title: string | null } | null }>(o.proposal)?.request)?.title ?? "Untitled Order")
      : "Untitled Order",
  }));

  const activeOrders = orders.filter((o) => o.status !== "completed");
  const awaitingReview = orders.filter((o) => o.status === "delivered").length;
  const completed = orders.filter((o) => o.status === "completed").length;
  const incoming = reqRows ?? [];

  const monthPaid = (payRows ?? []).filter(
    (p) => new Date(p.created_at).getTime() >= new Date(monthStart).getTime()
  );
  const byCurrency = new Map<CurrencyCode, number>();
  for (const p of monthPaid) {
    const c = normalizeCurrency(p.currency);
    byCurrency.set(c, (byCurrency.get(c) ?? 0) + Number(p.amount));
  }
  const earningsThisMonth =
    byCurrency.size === 0
      ? formatCurrency(0)
      : Array.from(byCurrency.entries())
          .map(([c, amt]) => formatCurrency(amt, c))
          .join(" · ");

  const rating = Number(profileRow?.rating_avg ?? 0);
  const firstName = (user.user_metadata?.name ?? user.email ?? "helper").toString().trim().split(/\s+/)[0];

  const stats = [
    { label: "Active Projects", value: String(activeOrders.length), icon: Briefcase, color: "bg-primary-container text-on-primary" },
    { label: "Earnings This Month", value: earningsThisMonth, icon: DollarSign, color: "bg-emerald-100 text-emerald-700", small: true },
    { label: "Awaiting Review", value: String(awaitingReview), icon: Clock, color: "bg-amber-100 text-amber-700" },
    { label: "Average Rating", value: rating > 0 ? rating.toFixed(1) : "New", icon: Star, color: "bg-secondary-container text-on-secondary-container" },
  ];

  const notifications = (notifRows ?? []) as { id: string; message: string; link: string | null; read: boolean; created_at: string }[];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-on-surface">
          Welcome back, {firstName}
        </h1>
        <p className="text-on-surface-variant mt-1">
          Here&apos;s an overview of your activity and earnings.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-5">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-sm text-on-surface-variant">{stat.label}</p>
                  <p className={`${stat.small ? "text-lg" : "text-2xl"} font-bold text-on-surface mt-1 truncate`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-on-surface">Active Projects</h2>
            <Link href="/helper/orders" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
              View all <ArrowUpRight size={14} />
            </Link>
          </div>
          {activeOrders.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-sm text-on-surface-variant">
                No active orders yet. New accepted proposals will appear here.
              </p>
            </Card>
          )}
          <div className="space-y-4">
            {activeOrders.map((order) => {
              const meta = STATUS_META[order.status] ?? { label: order.status, variant: "outline" as const };
              return (
                <Card key={order.id} className="p-5" hover>
                  <Link href={`/helper/orders/${order.id}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-on-surface truncate">{order.makeTitle}</h3>
                          <Badge variant={meta.variant} dot>{meta.label}</Badge>
                        </div>
                        <p className="text-sm text-on-surface-variant">
                          Student: {order.student?.name ?? "Student"}
                        </p>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-sm text-on-surface-variant">
                            {order.deadline
                              ? `Due ${new Date(order.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                              : "Deadline flexible"}
                          </span>
                          <span className="text-sm font-semibold text-on-surface">
                            {formatCurrency(Number(order.price), normalizeCurrency(order.currency))}
                          </span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="shrink-0">Open <ArrowUpRight size={14} /></Button>
                    </div>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-on-surface">Incoming Requests</h2>
              <Link href="/helper/requests" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                View all <ArrowUpRight size={14} />
              </Link>
            </div>
            <Card className="p-4">
              {incoming.length === 0 && (
                <p className="text-sm text-on-surface-variant">No new requests right now.</p>
              )}
              <div className="flex flex-col divide-y divide-outline-variant/30">
                {incoming.map((r) => (
                  <Link key={r.id} href={`/helper/requests/${r.id}`} className="py-3 first:pt-0 last:pb-0 flex items-center gap-2 group">
                    <FileText size={15} className="text-primary shrink-0" />
                    <span className="text-sm font-medium text-on-surface truncate group-hover:underline">{r.title}</span>
                  </Link>
                ))}
              </div>
            </Card>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-on-surface">Recent Activity</h2>
              <Link href="/helper/notifications" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                View all <ArrowUpRight size={14} />
              </Link>
            </div>
            <Card className="divide-y divide-outline-variant/30">
              {notifications.length === 0 && (
                <p className="text-sm text-on-surface-variant p-4">No activity yet.</p>
              )}
              {notifications.map((n) => (
                <Link href={n.link ?? "/helper/notifications"} key={n.id} className="p-4 flex items-start gap-3 hover:bg-surface-container-low transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm line-clamp-2 ${n.read ? "text-on-surface-variant" : "font-medium text-on-surface"}`}>
                      {n.message}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary-container shrink-0 mt-1.5" />}
                </Link>
              ))}
            </Card>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-on-surface mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/helper/requests" className="flex flex-col items-center gap-2 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 hover:border-primary-container/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary-container/10 flex items-center justify-center">
                  <Inbox size={20} className="text-primary" />
                </div>
                <span className="text-sm font-medium text-on-surface">Incoming</span>
              </Link>
              <Link href="/helper/orders" className="flex flex-col items-center gap-2 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 hover:border-primary-container/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary-container/10 flex items-center justify-center">
                  <Briefcase size={20} className="text-primary" />
                </div>
                <span className="text-sm font-medium text-on-surface">Orders</span>
              </Link>
              <Link href="/helper/earnings" className="flex flex-col items-center gap-2 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 hover:border-primary-container/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <DollarSign size={20} className="text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-on-surface">Earnings</span>
              </Link>
              <Link href="/helper/profile" className="flex flex-col items-center gap-2 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 hover:border-primary-container/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-secondary-container/50 flex items-center justify-center">
                  <Settings size={20} className="text-secondary" />
                </div>
                <span className="text-sm font-medium text-on-surface">Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Card className="p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={firstName} size="sm" />
          <div>
            <p className="text-sm font-medium text-on-surface">{completed} completed order{completed === 1 ? "" : "s"}</p>
            <p className="text-xs text-on-surface-variant">{activeOrders.length} order{activeOrders.length === 1 ? "" : "s"} currently active</p>
          </div>
        </div>
        <Link href="/helper/profile">
          <Button size="sm" variant="outline"><Send size={14} /> Edit profile</Button>
        </Link>
      </Card>
    </div>
  );
}