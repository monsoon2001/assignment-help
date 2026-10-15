import type { Metadata } from "next";
import Card from "@/components/ui/card";
import StatusBadge from "@/components/ui/status-badge";
import Avatar from "@/components/ui/avatar";
import { CreditCard } from "lucide-react";
import { requireAdmin, adminClient } from "@/lib/admin";
import { unwrapRow } from "@/lib/embedded";
import { formatCurrency, normalizeCurrency } from "@/lib/currency";
import { paymentStatusTone, orderStatusTone } from "@/lib/status-meta";
import RefundButton from "@/app/admin/components/refund-button";
import { EmptyState } from "@/components/ui/states";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payments | Acadivo Admin",
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function AdminPaymentsPage() {
  await requireAdmin();

  const { data: payments, error } = await adminClient
    .from("payments")
    .select("id, amount, currency, status, stripe_payment_intent_id, gross_cad, stripe_fee_cad, net_cad, charge_currency, charge_amount, platform_fee_cad, helper_payout_status, refunded_amount_cad, disputed, created_at, order:orders(id, status, student:users!orders_student_id_fkey(name), helper:users!orders_helper_id_fkey(name))")
    .order("created_at", { ascending: false })
    .limit(200);

  const paidCount = (payments ?? []).filter((p) => p.status === "paid").length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold text-on-surface">Payments</h1>
          <p className="text-on-surface-variant mt-1">All payment transactions and refunds.</p>
        </div>
        <StatusBadge tone="green">{paidCount} paid</StatusBadge>
      </div>

      {error ? (
        <Card className="p-6 text-sm text-error">{error.message}</Card>
      ) : payments && payments.length > 0 ? (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-outline-variant/30">
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-3 sm:px-4 py-3">Student</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-3 sm:px-4 py-3">Helper</th>
                <th className="text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-3 sm:px-4 py-3">Total</th>
                <th className="text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-3 sm:px-4 py-3">Stripe fee</th>
                <th className="text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-3 sm:px-4 py-3">Net</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-3 sm:px-4 py-3">Charged</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-3 sm:px-4 py-3">Payout</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-3 sm:px-4 py-3">Order</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-3 sm:px-4 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-3 sm:px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-3 sm:px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => {
                const order = unwrapRow<{ id: string; status: string; student: unknown; helper: unknown }>(payment.order);
                const orderStudent = unwrapRow<{ name: string | null }>(order?.student);
                const orderHelper = unwrapRow<{ name: string | null }>(order?.helper);
                const gross = Number(payment.gross_cad ?? payment.amount ?? 0);
                const fee = payment.stripe_fee_cad === null || payment.stripe_fee_cad === undefined ? null : Number(payment.stripe_fee_cad);
                const net = payment.net_cad === null || payment.net_cad === undefined ? null : Number(payment.net_cad);
                const platformFee = payment.platform_fee_cad === null || payment.platform_fee_cad === undefined ? null : Number(payment.platform_fee_cad);
                const chargedCurrency = normalizeCurrency(payment.charge_currency ?? payment.currency);
                const chargedAmount = payment.charge_amount === null || payment.charge_amount === undefined ? null : Number(payment.charge_amount);
                const payout = payment.helper_payout_status as string | null;
                const refunded = Number(payment.refunded_amount_cad ?? 0);
                const fmt = (v: number | null) => (v === null ? "—" : formatCurrency(v));
                return (
                  <tr key={payment.id} className="border-b border-outline-variant/20 last:border-0 hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-3 sm:px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar name={orderStudent?.name ?? "Student"} size="sm" />
                        <span className="text-sm text-on-surface">{orderStudent?.name ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar name={orderHelper?.name ?? "Helper"} role="helper" size="sm" />
                        <span className="text-sm text-on-surface">{orderHelper?.name ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-4 text-right text-sm font-semibold text-on-surface">
                      {formatCurrency(gross)}
                      {refunded > 0 && (
                        <span className="block text-xs font-normal text-error">-{formatCurrency(refunded)} refunded</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-4 text-right text-sm text-on-surface-variant">{fmt(fee)}</td>
                    <td className="px-3 sm:px-4 py-4 text-right text-sm text-on-surface-variant">{fmt(net)}</td>
                    <td className="px-3 sm:px-4 py-4 text-sm text-on-surface-variant">
                      {chargedAmount === null
                        ? "—"
                        : `${formatCurrency(chargedAmount, chargedCurrency)} (${chargedCurrency})`}
                      {platformFee !== null && (
                        <span className="block text-xs text-on-surface-variant">
                          buffer {formatCurrency(platformFee)}
                        </span>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-4">
                      {payment.disputed ? (
                        <StatusBadge tone="red">Disputed</StatusBadge>
                      ) : payout === "paid" ? (
                        <StatusBadge tone="green">Paid</StatusBadge>
                      ) : payout === "on_hold" ? (
                        <StatusBadge tone="blueStrong">On hold</StatusBadge>
                      ) : (
                        <StatusBadge tone="slate">Unpaid</StatusBadge>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-4">
                      <StatusBadge tone={orderStatusTone(order?.status)}>{order?.status ?? "—"}</StatusBadge>
                    </td>
                    <td className="px-3 sm:px-4 py-4 text-sm text-on-surface-variant">{formatDate(payment.created_at)}</td>
                    <td className="px-3 sm:px-4 py-4">
                      <StatusBadge tone={paymentStatusTone(payment.status)}>{payment.status}</StatusBadge>
                    </td>
                    <td className="px-3 sm:px-4 py-4 text-right">
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
          actionHref="/admin/orders"
          actionLabel="Review orders"
        />
      )}
    </div>
  );
}