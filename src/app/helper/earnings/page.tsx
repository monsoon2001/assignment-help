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
import { Receipt } from "lucide-react";
import { formatCurrency, normalizeCurrency, convertCurrency, type CurrencyCode } from "@/lib/currency";
import { ErrorState, PanelEmpty } from "@/components/ui/states";

export const dynamic = "force-dynamic";

type PaymentRow = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  receipt_url: string | null;
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
    .select("id, amount, currency, status, created_at, receipt_url, order:orders!inner(status, proposal:proposals(request:requests(title)))")
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
  let monthTotalUsd = 0;
  for (const p of rows) {
    const c = normalizeCurrency(p.currency);
    const amount = Number(p.amount);
    totalByCurrency.set(c, (totalByCurrency.get(c) ?? 0) + amount);
    if (new Date(p.created_at).getTime() >= monthStart.getTime()) {
      monthByCurrency.set(c, (monthByCurrency.get(c) ?? 0) + amount);
      monthTotalUsd += convertCurrency(amount, c, "USD");
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

  // The chart needs a single comparable scale, so every payment is converted to
  // USD before being grouped by month. Summing raw amounts across different
  // currency codes would be meaningless.
  const monthlyUsd = new Map<string, number>();
  for (const p of rows) {
    const key = monthLabel(p.created_at);
    const usd = convertCurrency(Number(p.amount), normalizeCurrency(p.currency), "USD");
    monthlyUsd.set(key, (monthlyUsd.get(key) ?? 0) + usd);
  }
  const chart = Array.from(monthlyUsd.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  const maxMonth = chart.reduce((m, [, v]) => Math.max(m, v), 0);

  const summaryStats = [
    { label: "Total Earnings", value: fmtTotal, icon: DollarSign, color: "bg-emerald-100 text-emerald-700" },
    { label: "This Month", value: fmtMonth, icon: TrendingUp, color: "bg-primary-container text-on-primary" },
    { label: "Completed Orders", value: String(completedCount ?? 0), icon: CheckCircle, color: "bg-secondary-container text-on-secondary-container" },
    { label: "This Month (USD equiv.)", value: formatCurrency(monthTotalUsd, "USD"), icon: Clock, color: "bg-amber-100 text-amber-700" },
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
        <ErrorState
          title="Couldn't load your earnings"
          message="We hit a snag fetching your payment history. Please try again in a moment."
        />
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
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-1">
                <h2 className="font-display text-lg font-semibold text-on-surface">
                  Monthly Earnings
                </h2>
                <span className="text-xs text-on-surface-variant">
                  Shown in USD equivalent
                </span>
              </div>
              <p className="text-sm text-on-surface-variant mb-6">
                Net payouts grouped by month. Payments in other currencies are converted so the
                bars share one scale.
              </p>

              <div className="flex items-end gap-3 sm:gap-5 h-48">
                {chart.map(([label, total]) => {
                  const pct = maxMonth > 0 ? (total / maxMonth) * 100 : 0;
                  return (
                    <div
                      key={label}
                      className="flex-1 min-w-0 h-full flex flex-col items-center justify-end gap-2"
                    >
                      <span
                        className="text-xs font-semibold text-on-surface tabular-nums truncate max-w-full"
                        title={formatCurrency(total, "USD")}
                      >
                        {formatCurrency(total, "USD")}
                      </span>
                      <div
                        className="w-full rounded-lg bg-surface-container flex items-end overflow-hidden"
                        style={{ height: "120px" }}
                      >
                        <div
                          className="w-full rounded-lg bg-primary"
                          style={{ height: `${Math.max(pct, 3)}%` }}
                        />
                      </div>
                      <span className="text-xs text-on-surface-variant truncate max-w-full text-center">
                        {label}
                      </span>
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
              <PanelEmpty
                icon={<Receipt size={18} className="text-primary" />}
                title="No payments yet"
                message="Paid orders will appear here as earnings once a student completes checkout."
                actionHref="/helper/orders"
                actionLabel="View your orders"
              />
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
                      "Acadivo order";
                    return (
                      <tr key={txn.id} className="border-b border-outline-variant/20 last:border-0 hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-on-surface truncate max-w-80">{title}</p>
                            <p className="text-xs text-on-surface-variant font-mono">{txn.id.slice(0, 8).toUpperCase()}</p>
                            {txn.receipt_url && (
                              <a
                                href={txn.receipt_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline mt-1"
                              >
                                <Receipt size={12} /> View receipt
                              </a>
                            )}
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