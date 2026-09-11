import type { Metadata } from "next";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import { CreditCard } from "lucide-react";
import { requireAdmin, adminClient } from "@/lib/admin";
import { unwrapRow } from "@/lib/embedded";
import RefundButton from "@/app/admin/components/refund-button";
import { EmptyState } from "@/components/ui/states";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payments | PeerCraft Admin",
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_VARIANT: Record<string, "success" | "warning" | "outline" | "danger"> = {
  paid: "success",
  pending: "warning",
  refunded: "danger",
};

export default async function AdminPaymentsPage() {
  await requireAdmin();

  const { data: payments, error } = await adminClient
    .from("payments")
    .select("id, amount, status, stripe_payment_intent_id, created_at, order:orders(id, status, student:users(name), helper:users(name))")
    .order("created_at", { ascending: false })
    .limit(200);

  const paidSum = (payments ?? []).filter((p) => p.status === "paid").reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold text-on-surface">Payments</h1>
          <p className="text-on-surface-variant mt-1">All payment transactions and refunds.</p>
        </div>
        <Badge variant="success">Collected ${paidSum.toFixed(2)}</Badge>
      </div>

      {error ? (
        <Card className="p-6 text-sm text-error">{error.message}</Card>
      ) : payments && payments.length > 0 ? (
        <Card className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/30">
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Student</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Helper</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Amount</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Order</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => {
                const order = unwrapRow<{ id: string; status: string; student: unknown; helper: unknown }>(payment.order);
                const orderStudent = unwrapRow<{ name: string | null }>(order?.student);
                const orderHelper = unwrapRow<{ name: string | null }>(order?.helper);
                return (
                  <tr key={payment.id} className="border-b border-outline-variant/20 last:border-0 hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar name={orderStudent?.name ?? "Student"} size="sm" />
                        <span className="text-sm text-on-surface">{orderStudent?.name ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar name={orderHelper?.name ?? "Helper"} size="sm" />
                        <span className="text-sm text-on-surface">{orderHelper?.name ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-on-surface">${Number(payment.amount).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">{order?.status ?? "—"}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{formatDate(payment.created_at)}</td>
                    <td className="px-6 py-4">
                      <Badge variant={STATUS_VARIANT[payment.status] ?? "outline"}>{payment.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {payment.status === "paid" ? (
                        <RefundButton paymentId={payment.id} />
                      ) : (
                        <span className="text-xs text-on-surface-variant">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      ) : (
        <EmptyState
          icon={<CreditCard size={24} className="text-primary" />}
          title="No payments yet"
          message="Payments will appear here once students check out."
        />
      )}
    </div>
  );
}