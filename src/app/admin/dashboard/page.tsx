import Link from "next/link";
import type { Metadata } from "next";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
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
} from "lucide-react";
import { requireAdmin, adminClient } from "@/lib/admin";
import { unwrapRow } from "@/lib/embedded";
import { formatCurrency, normalizeCurrency } from "@/lib/currency";
import { EmptyState } from "@/components/ui/states";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Dashboard | PeerCraft",
};

const STATUS_VARIANT: Record<string, "primary" | "warning" | "success" | "secondary" | "danger"> = {
  payment_pending: "warning",
  in_progress: "secondary",
  delivered: "primary",
  revision_requested: "warning",
  completed: "success",
  disputed: "danger",
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

  const { data: recentOrders } = await adminClient
    .from("orders")
    .select("id, status, price, currency, deadline, created_at, student:users!orders_student_id_fkey(name), helper:users!orders_helper_id_fkey(name)")
    .order("created_at", { ascending: false })
    .limit(8);

  const metrics = [
    {
      label: "Total Students",
      value: students.toString(),
      icon: Users,
      color: "bg-primary-container text-on-primary",
    },
    {
      label: "Total Helpers",
      value: helpers.toString(),
      icon: UserCheck,
      color: "bg-secondary-container text-on-secondary-container",
    },
    {
      label: "Active Requests",
      value: activeRequests.toString(),
      icon: FileText,
      color: "bg-emerald-100 text-emerald-700",
      sub: `${inProgress} orders in progress`,
    },
    {
      label: "Completed Orders",
      value: completedOrders.toString(),
      icon: Briefcase,
      color: "bg-amber-100 text-amber-700",
    },
    {
      label: "Paid Revenue",
      value: `$${revenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Helpers Awaiting Approval",
      value: pendingHelpers.toString(),
      icon: Hourglass,
      color: "bg-error-container text-error",
      href: "/admin/helpers",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-on-surface">Admin Dashboard</h1>
        <p className="text-on-surface-variant mt-1">Platform overview and management at a glance.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const inner = (
            <Card className="p-4 h-full" hover>
              <div className="flex items-start justify-between mb-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${metric.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <p className="text-2xl font-bold text-on-surface">{metric.value}</p>
              <p className="text-xs text-on-surface-variant mt-1">{metric.label}</p>
              {metric.sub && <p className="text-[11px] text-on-surface-variant mt-0.5">{metric.sub}</p>}
            </Card>
          );
          return metric.href ? (
            <Link key={metric.label} href={metric.href} className="block">
              {inner}
            </Link>
          ) : (
            <div key={metric.label}>{inner}</div>
          );
        })}
      </div>

      <Card>
        <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-on-surface">Recent Orders</h2>
          <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {recentOrders && recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/30">
                  <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Student</th>
                  <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Helper</th>
                  <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Deadline</th>
                  <th className="text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const student = unwrapRow<{ id: string; name: string | null }>(order.student);
                  const helper = unwrapRow<{ name: string | null }>(order.helper);
                  return (
                    <tr key={order.id} className="border-b border-outline-variant/20 last:border-0 hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar name={student?.name ?? "Student"} size="sm" />
                          <span className="text-sm text-on-surface">{student?.name ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar name={helper?.name ?? "Helper"} size="sm" />
                          <span className="text-sm text-on-surface">{helper?.name ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-on-surface">{formatCurrency(Number(order.price), normalizeCurrency(order.currency))}</td>
                      <td className="px-6 py-4">
                        <Badge variant={STATUS_VARIANT[order.status] ?? "outline"}>
                          {order.status.replaceAll("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">{formatDate(order.deadline)}</td>
                      <td className="px-6 py-4 text-right">
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
            />
          </div>
        )}
      </Card>
    </div>
  );
}