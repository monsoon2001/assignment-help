import Link from "next/link";
import { redirect } from "next/navigation";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import {
  Briefcase,
  DollarSign,
  Clock,
  ArrowUpRight,
  FileText,
  Inbox,
  Sparkles,
} from "lucide-react";
import Button from "@/components/ui/button";
import { EmptyState, PanelEmpty } from "@/components/ui/states";
import { createClient } from "@/lib/supabase/server";
import { unwrapRow } from "@/lib/embedded";
import { formatCurrency, normalizeCurrency, type CurrencyCode } from "@/lib/currency";
import { orderStatusMeta } from "@/lib/status-meta";

export const dynamic = "force-dynamic";

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

  const [{ data: orderRows }, { data: reqRows }, { data: notifRows }, { data: payRows }] =
    await Promise.all([
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

  const firstName = (user.user_metadata?.name ?? user.email ?? "helper").toString().trim().split(/\s+/)[0];

  const notifications = (notifRows ?? []) as { id: string; message: string; link: string | null; read: boolean; created_at: string }[];

  const stats = [
    { label: "Active Projects", value: String(activeOrders.length), icon: Briefcase, href: "/helper/orders", color: "bg-primary-container text-on-primary" },
    { label: "This Month", value: earningsThisMonth, icon: DollarSign, href: "/helper/earnings", color: "bg-emerald-100 text-emerald-700", small: true },
    { label: "Awaiting Review", value: String(awaitingReview), icon: Clock, href: "/helper/orders", color: "bg-amber-100 text-amber-700" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Greeting + primary action */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-on-surface">
            Hi, {firstName}
          </h1>
          <p className="text-on-surface-variant text-sm sm:text-base mt-1">
            {incoming.length > 0
              ? `You have ${incoming.length} incoming request${incoming.length === 1 ? "" : "s"} waiting for a proposal.`
              : "Here&apos;s what needs your attention today."}
          </p>
        </div>
        <Link href="/helper/requests">
          <Button>
            <Inbox size={16} />
            Review Incoming Requests
          </Button>
        </Link>
      </div>

      {/* At a glance */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-label="At a glance">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} className="group">
              <Card className="p-5 transition-shadow group-hover:shadow-md" hover>
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
            </Link>
          );
        })}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Active projects */}
        <section className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-lg font-semibold text-on-surface">Active Projects</h2>
            <Link href="/helper/orders" className="text-sm text-primary font-medium min-h-11 -my-2 inline-flex items-center gap-1 hover:underline">
              View all <ArrowUpRight size={14} />
            </Link>
          </div>
          {activeOrders.length === 0 && (
            <EmptyState
              icon={<Briefcase size={24} className="text-primary" />}
              title="No active orders yet"
              message="Accepted proposals move here as orders. Send a few proposals to line up your next project."
              actionHref="/helper/requests"
              actionLabel="Check incoming requests"
            />
          )}
          <div className="space-y-4">
            {activeOrders.map((order) => {
              const meta = orderStatusMeta(order.status);
              return (
                <Card key={order.id} className="p-5" hover>
                  <Link href={`/helper/orders/${order.id}`} className="min-h-11 -my-2 flex items-start justify-between gap-4">
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
                    <ArrowUpRight size={18} className="text-on-surface-variant shrink-0 mt-1.5" />
                  </Link>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Right rail: incoming + activity */}
        <div className="space-y-6">
          <section>
            <div className="flex items-center justify-between gap-4 mb-3">
              <h2 className="font-display text-lg font-semibold text-on-surface">Incoming Requests</h2>
              <Link href="/helper/requests" className="text-sm text-primary font-medium min-h-11 -my-2 inline-flex items-center gap-1 hover:underline">
                View all <ArrowUpRight size={14} />
              </Link>
            </div>
            <Card className="overflow-hidden">
              {incoming.length === 0 && (
                <PanelEmpty
                  icon={<Inbox size={18} className="text-primary" />}
                  title="No new requests right now"
                  message="Assigned requests appear here as soon as a student picks you."
                  actionHref="/helper/profile"
                  actionLabel="Complete your profile"
                />
              )}
              {incoming.length > 0 && (
                <div className="flex flex-col divide-y divide-outline-variant/30 px-4">
                  {incoming.map((r) => (
                    <Link key={r.id} href={`/helper/requests/${r.id}`} className="py-3 flex items-center gap-3 group min-h-11">
                      <FileText size={15} className="text-primary shrink-0" />
                      <span className="text-sm font-medium text-on-surface truncate group-hover:underline">{r.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </section>

          <section>
            <div className="flex items-center justify-between gap-4 mb-3">
              <h2 className="font-display text-lg font-semibold text-on-surface">Recent Activity</h2>
              <Link href="/helper/notifications" className="text-sm text-primary font-medium min-h-11 -my-2 inline-flex items-center gap-1 hover:underline">
                View all <ArrowUpRight size={14} />
              </Link>
            </div>
            <Card className="divide-y divide-outline-variant/30 overflow-hidden">
              {notifications.length === 0 && (
                <PanelEmpty
                  icon={<Sparkles size={18} className="text-primary" />}
                  title="No activity yet"
                  message="Payment, order and chat updates for your requests will show up here."
                  actionHref="/helper/notifications"
                  actionLabel="View notifications"
                />
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
          </section>
        </div>
      </div>
    </div>
  );
}