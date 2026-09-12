import Link from "next/link";
import type { Metadata } from "next";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import { Briefcase, Eye } from "lucide-react";
import { requireAdmin, adminClient } from "@/lib/admin";
import { unwrapRow } from "@/lib/embedded";
import { formatCurrency, normalizeCurrency } from "@/lib/currency";
import { EmptyState } from "@/components/ui/states";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Orders | PeerCraft Admin",
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

export default async function AdminOrdersPage() {
  await requireAdmin();

  const { data: orders, error } = await adminClient
    .from("orders")
    .select("id, status, price, currency, deadline, created_at, student:users!orders_student_id_fkey(id, name), helper:users!orders_helper_id_fkey(id, name)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-on-surface">Orders</h1>
        <p className="text-on-surface-variant mt-1">Track every order and its status.</p>
      </div>

      {error ? (
        <Card className="p-6 text-sm text-error">{error.message}</Card>
      ) : orders && orders.length > 0 ? (
        <Card className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/30">
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Student</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Helper</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Amount</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Created</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Deadline</th>
                <th className="text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const student = unwrapRow<{ id: string; name: string | null }>(order.student);
                const helper = unwrapRow<{ id: string; name: string | null }>(order.helper);
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
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{formatDate(order.created_at)}</td>
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
        </Card>
      ) : (
        <EmptyState
          icon={<Briefcase size={24} className="text-primary" />}
          title="No orders yet"
          message="Orders will appear here once students pay for approved proposals."
        />
      )}
    </div>
  );
}