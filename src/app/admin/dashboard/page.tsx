import Link from "next/link";
import type { Metadata } from "next";
import Card from "@/components/ui/card";
import StatusBadge from "@/components/ui/status-badge";
import Avatar from "@/components/ui/avatar";
import {
  Users,
  UserCheck,
  FileText,
  Briefcase,
  DollarSign,
  Hourglass,
  Eye,
  ArrowRight,
  ArrowUpRight,
  Crown,
  CreditCard,
  ShieldAlert,
  Settings,
} from "lucide-react";
import { requireAdmin, adminClient } from "@/lib/admin";
import { unwrapRow } from "@/lib/embedded";
import { formatCurrency, normalizeCurrency } from "@/lib/currency";
import { orderStatusTone } from "@/lib/status-meta";
import { EmptyState } from "@/components/ui/states";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Dashboard | Acadivo",
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function AdminDashboardPage() {
  await requireAdmin();

  const countByRole = (role: string) =>
    adminClient
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role", role)
      .then((r) => r.count ?? 0);

  const [
    students,
    helpers,
    activeRequests,
    pendingHelpers,
    completedOrders,
    inProgress,
    revenueAgg,
  ] = await Promise.all([
    countByRole("student"),
    countByRole("helper"),
    adminClient.from("requests").select("id", { count: "exact", head: true }).in("status", ["requested", "proposal_sent", "accepted"]).then((r) => r.count ?? 0),
    adminClient.from("users").select("id", { count: "exact", head: true }).eq("role", "helper").eq("status", "pending").then((r) => r.count ?? 0),
    adminClient.from("orders").select("id", { count: "exact", head: true }).eq("status", "completed").then((r) => r.count ?? 0),
    adminClient.from("orders").select("id", { count: "exact", head: true }).eq("status", "in_progress").then((r) => r.count ?? 0),
    adminClient.from("payments").select("amount").eq("status", "paid"),
  ]);

  const revenue = (revenueAgg.data ?? []).reduce((sum, p) => sum + Number(p.amount), 0);

  const [{ data: recentOrders }, { data: settings }] = await Promise.all([
    adminClient
      .from("orders")
      .select("id, status, price, currency, deadline, created_at, student:users!orders_student_id_fkey(name, avatar_url), helper:users!orders_helper_id_fkey(name, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(8),
    adminClient.from("platform_settings").select("active_helper_id").eq("id", true).maybeSingle(),
  ]);

  const activeHelperId = settings?.active_helper_id ?? null;
  const { data: activeHelper } = activeHelperId
    ? await adminClient
        .from("users")
        .select("id, name, email, avatar_url")
        .eq("id", activeHelperId)
        .maybeSingle()
    : { data: null };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const metrics = [
    {
      label: "Total Students",
      value: students.toString(),
      icon: Users,
      color: "bg-primary-container text-on-primary",
      href: "/admin/students",
    },
    {
      label: "Total Helpers",
      value: helpers.toString(),
      icon: UserCheck,
      color: "bg-secondary-container text-on-secondary-container",
      href: "/admin/helpers",
    },
    {
      label: "Active Requests",
      value: activeRequests.toString(),
      icon: FileText,
      color: "bg-success-tint text-success",
      sub: `${inProgress} orders in progress`,
      href: "/admin/requests",
    },
    {
      label: "Completed Orders",
      value: completedOrders.toString(),
      icon: Briefcase,
      color: "bg-accent-tint text-on-accent-tint",
      href: "/admin/orders",
    },
    {
      label: "Paid Revenue",
      value: `$${revenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: "bg-success-tint text-success",
      href: "/admin/payments",
    },
    {
      label: "Awaiting Approval",
      value: pendingHelpers.toString(),
      icon: Hourglass,
      color: pendingHelpers > 0 ? "bg-error-container text-error" : "bg-surface-container-low text-on-surface-variant",
      href: "/admin/helpers",
    },
  ];

  const quickLinks = [
    { href: "/admin/payments", label: "Payments", icon: CreditCard, hint: "Refunds & ledger" },
    { href: "/admin/helper-balances", label: "Helper Balances", icon: DollarSign, hint: "Manual payouts" },
    { href: "/admin/chat-monitor", label: "Chat Monitor", icon: ShieldAlert, hint: "Flagged threads" },
    { href: "/admin/settings", label: "Settings", icon: Settings, hint: "FX & platform" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-on-surface">Admin overview</h1>
          <p className="text-on-surface-variant mt-1">Platform health at a glance · {today}</p>
        </div>
        <Link
          href="/admin/requests"
          className="inline-flex items-center gap-2 rounded-xl bg-primary-container text-on-primary px-4 min-h-11 text-sm font-semibold hover:bg-primary-hover transition-colors self-start sm:self-auto"
        >
          <FileText size={16} />
          Review requests
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const inner = (
            <Card className="h-full p-4" hover>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${metric.color}`}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-bold text-on-surface mt-3">{metric.value}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{metric.label}</p>
              {metric.sub && <p className="text-[11px] text-on-surface-variant mt-1">{metric.sub}</p>}
            </Card>
          );
          return (
            <Link key={metric.label} href={metric.href ?? "#"} className="block group">
              {inner}
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <section className="lg:col-span-2 space-y-4">
          <Card>
            <div className="p-5 sm:p-6 border-b border-outline-variant/30 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-on-surface">Recent Orders</h2>
              <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                View all <ArrowRight size={14} />
              </Link>
            </div>

            {recentOrders && recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b border-outline-variant/30">
                      <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-3 sm:px-6 py-3">Student</th>
                      <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-3 sm:px-6 py-3">Helper</th>
                      <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-3 sm:px-6 py-3">Amount</th>
                      <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-3 sm:px-6 py-3">Status</th>
                      <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-3 sm:px-6 py-3">Deadline</th>
                      <th className="text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-3 sm:px-6 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => {
                      const student = unwrapRow<{ id: string; name: string | null; avatar_url: string | null }>(order.student);
                      const helper = unwrapRow<{ name: string | null; avatar_url: string | null }>(order.helper);
                      return (
                        <tr key={order.id} className="border-b border-outline-variant/20 last:border-0 hover:bg-surface-container-low/50 transition-colors">
                          <td className="px-3 sm:px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Avatar name={student?.name ?? "Student"} src={student?.avatar_url ?? undefined} size="sm" />
                              <span className="text-sm text-on-surface">{student?.name ?? "—"}</span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Avatar name={helper?.name ?? "Helper"} src={helper?.avatar_url ?? undefined} role="helper" size="sm" />
                              <span className="text-sm text-on-surface">{helper?.name ?? "—"}</span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 text-sm font-semibold text-on-surface">{formatCurrency(Number(order.price), normalizeCurrency(order.currency))}</td>
                          <td className="px-3 sm:px-6 py-4">
                            <StatusBadge tone={orderStatusTone(order.status)}>
                              {order.status.replaceAll("_", " ")}
                            </StatusBadge>
                          </td>
                          <td className="px-3 sm:px-6 py-4 text-sm text-on-surface-variant">{formatDate(order.deadline)}</td>
                          <td className="px-3 sm:px-6 py-4 text-right">
                            <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                              <Eye size={14} /> View
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6">
                <EmptyState
                  icon={<Briefcase size={24} className="text-primary" />}
                  title="No orders yet"
                  message="Orders appear here once students pay for approved proposals."
                  actionHref="/admin/requests"
                  actionLabel="Review requests"
                />
              </div>
            )}
          </Card>
        </section>

        <aside className="space-y-4">
          {/* Active helper routing */}
          <Card className="overflow-hidden">
            <div className="p-5 bg-primary-tint/60">
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                  <Crown size={20} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">Active helper</p>
                  <p className="font-display font-semibold text-on-surface truncate">
                    {activeHelper?.name ?? "No helper set"}
                  </p>
                </div>
              </div>
              {activeHelper ? (
                <div className="mt-3 flex items-center gap-2">
                  <Avatar name={activeHelper.name ?? "Helper"} src={activeHelper.avatar_url ?? undefined} role="helper" size="sm" />
                  <span className="text-xs text-on-surface-variant truncate">{activeHelper.email}</span>
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant mt-3">Set an active helper so new requests have a destination.</p>
              )}
              <p className="text-xs text-on-surface-variant mt-3">
                All new student requests route to this helper.
              </p>
            </div>
            <Link
              href="/admin/helpers"
              className="flex items-center justify-between px-5 py-3 border-t border-outline-variant/30 text-sm font-medium text-primary hover:bg-surface-container-low transition-colors"
            >
              Manage helpers
              <ArrowUpRight size={15} />
            </Link>
          </Card>

          {/* Quick actions */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-outline-variant/30">
              <h2 className="font-display font-semibold text-on-surface">Quick actions</h2>
            </div>
            <div className="divide-y divide-outline-variant/20">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors group"
                  >
                    <span className="w-9 h-9 rounded-xl bg-surface-container-low text-primary flex items-center justify-center shrink-0">
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-on-surface">{link.label}</p>
                      <p className="text-xs text-on-surface-variant truncate">{link.hint}</p>
                    </div>
                    <ArrowUpRight size={15} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                  </Link>
                );
              })}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
