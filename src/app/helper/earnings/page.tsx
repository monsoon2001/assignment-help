import Link from "next/link";
import { redirect } from "next/navigation";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowUpRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { unwrapRow } from "@/lib/embedded";
import { formatCurrency, normalizeCurrency, type CurrencyCode } from "@/lib/currency";

export const dynamic = "force-dynamic";

type PaymentRow = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  order: {
    status: string;
    proposal: { request: { title: string | null } | null } | null;
  } | null;
};

function monthLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default async function HelperEarnings() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const { data: payments, error } = await supabase
    .from("payments")
    .select("id, amount, currency, status, created_at, order:orders!inner(status, proposal:proposals(request:requests(title)))")
    .eq("status", "paid")
    .order("created_at", { ascending: false });

  const rows = ((payments ?? []) as unknown as PaymentRow[]).map((p) => ({
    ...p,
    order: unwrapRow<PaymentRow["order"]>(p.order),
  }));

  const { count: completedCount } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("helper_id", user.id)
    .eq("status", "completed");

  const totalByCurrency = new Map<CurrencyCode, number>();
  const monthByCurrency = new Map<CurrencyCode, number>();
  let monthTotal = 0;
  for (const p of rows) {
    const c = normalizeCurrency(p.currency);
    totalByCurrency.set(c, (totalByCurrency.get(c) ?? 0) + Number(p.amount));
    if (new Date(p.created_at).getTime() >= monthStart.getTime()) {
      monthByCurrency.set(c, (monthByCurrency.get(c) ?? 0) + Number(p.amount));
      monthTotal += Number(p.amount);
    }
  }
  const fmtTotal =
    totalByCurrency.size === 0
      ? formatCurrency(0)
      : Array.from(totalByCurrency.entries())
          .map(([c, amt]) => formatCurrency(amt, c))
          .join(" · ");
  const fmtMonth =
    monthByCurrency.size === 0
      ? formatCurrency(0)
      : Array.from(monthByCurrency.entries())
          .map(([c, amt]) => formatCurrency(amt, c))
          .join(" · ");

  const monthlyEarnings = new Map<string, number>();
  for (const p of rows) {
    const key = monthLabel(p.created_at);
    monthlyEarnings.set(key, (monthlyEarnings.get(key) ?? 0) + Number(p.amount));
  }
  const monthlyByCurrency = new Map<string, Map<CurrencyCode, number>>();
  for (const p of rows) {
    const key = monthLabel(p.created_at);
    const inner = monthlyByCurrency.get(key) ?? new Map<CurrencyCode, number>();
    inner.set(normalizeCurrency(p.currency), (inner.get(normalizeCurrency(p.currency)) ?? 0) + Number(p.amount));
    monthlyByCurrency.set(key, inner);
  }
  const chart = Array.from(monthlyByCurrency.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  const maxMonth = chart.reduce((m, [, inner]) => Math.max(m, Math.max(...Array.from(inner.values()))), 0);

  const summaryStats = [
    { label: "Total Earnings", value: fmtTotal, icon: DollarSign, color: "bg-emerald-100 text-emerald-700" },
    { label: "This Month", value: fmtMonth, icon: TrendingUp, color: "bg-primary-container text-on-primary" },
    { label: "Completed Orders", value: String(completedCount ?? 0), icon: CheckCircle, color: "bg-secondary-container text-on-secondary-container" },
    { label: "Net Monthly (USD)", value: `$${monthTotal.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, icon: Clock, color: "bg-amber-100 text-amber-700" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-on-surface">Earnings</h1>
          <p className="text-on-surface-variant mt-1">
            Track your earnings and transaction history.
          </p>
        </div>
        <Link href="/helper/orders" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          View orders <ArrowUpRight size={14} />
        </Link>
      </div>

      {error ? (
        <Card className="p-6 text-sm text-error">{error.message}</Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="text-sm text-on-surface-variant">{stat.label}</p>
                      <p className="text-lg font-bold text-on-surface mt-1 truncate">{stat.value}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                      <Icon size={20} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {chart.length > 0 && (
            <Card className="p-6">
              <h2 className="font-display text-lg font-semibold text-on-surface mb-4">Monthly Earnings</h2>
              <div className="flex items-end gap-3 h-48">
                {chart.map(([label, inner]) => {
                  const totalMonth = Array.from(inner.values()).reduce((a, b) => a + b, 0);
                  return (
                    <div key={label} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs font-medium text-on-surface-variant">{formatCurrency(totalMonth)}</span>
                      <div
                        className="w-full bg-surface-container rounded-lg overflow-hidden relative"
                        style={{ height: `${maxMonth > 0 ? (totalMonth / maxMonth) * 120 : 0}px` }}
                      >
                        <div className="absolute inset-0 bg-primary-container/80 rounded-lg" />
                      </div>
                      <span className="text-xs text-on-surface-variant">{label}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          <Card>
            <div className="p-6 border-b border-outline-variant/30">
              <h2 className="font-display text-lg font-semibold text-on-surface">
                Transaction History {rows.length > 0 && `(${rows.length})`}
              </h2>
            </div>
            {rows.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-on-surface-variant">
                  No payments yet. Paid orders will appear here as earnings.
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant/30">
                    <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Transaction</th>
                    <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Date</th>
                    <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Status</th>
                    <th className="text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((txn) => {
                    const title =
                      unwrapRow<{ request: { title: string | null } | null }>(txn.order?.proposal)?.request?.title ??
                      "PeerCraft order";
                    return (
                      <tr key={txn.id} className="border-b border-outline-variant/20 last:border-0 hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-on-surface truncate max-w-[320px]">{title}</p>
                            <p className="text-xs text-on-surface-variant font-mono">{txn.id.slice(0, 8).toUpperCase()}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">
                          {new Date(txn.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="success">Paid</Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-semibold text-emerald-600">
                            +{formatCurrency(Number(txn.amount), normalizeCurrency(txn.currency))}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Card>
        </>
      )}
    </div>
  );
}