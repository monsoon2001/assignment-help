import Link from "next/link";
import { redirect } from "next/navigation";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { DollarSign, TrendingUp, Clock, CheckCircle, ArrowUpRight, Receipt } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/currency";
import { ErrorState, PanelEmpty } from "@/components/ui/states";

export const dynamic = "force-dynamic";

type PayoutRow = {
  id: string;
  amount_sent_cad: number;
  amount_received: number | null;
  received_currency: string | null;
  method: string;
  reference: string | null;
  order_ids: string[] | null;
  paid_at: string;
  notes: string | null;
};

function monthLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function methodLabel(method: string): string {
  if (method === "wise") return "Wise";
  if (method === "bank_transfer") return "Bank transfer";
  return "Other";
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

  // The view is already scoped to the signed-in helper.
  const { data: payouts, error } = await supabase
    .from("helper_payouts")
    .select(
      "id, amount_sent_cad, amount_received, received_currency, method, reference, order_ids, paid_at, notes",
    )
    .order("paid_at", { ascending: false });

  const rows = (payouts ?? []) as unknown as PayoutRow[];

  const { count: completedCount } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("helper_id", user.id)
    .eq("status", "completed");

  // Earnings are the payouts actually recorded by the Acadivo team (in CAD).
  let totalEarned = 0;
  let monthTotal = 0;
  for (const p of rows) {
    const amount = Number(p.amount_sent_cad);
    totalEarned += amount;
    if (new Date(p.paid_at).getTime() >= monthStart.getTime()) {
      monthTotal += amount;
    }
  }
  const fmtTotal = formatCurrency(totalEarned);
  const fmtMonth = formatCurrency(monthTotal);

  const monthly = new Map<string, number>();
  for (const p of rows) {
    const key = monthLabel(p.paid_at);
    monthly.set(key, (monthly.get(key) ?? 0) + Number(p.amount_sent_cad));
  }
  const chart = Array.from(monthly.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  const maxMonth = chart.reduce((m, [, v]) => Math.max(m, v), 0);

  const summaryStats = [
    {
      label: "Total Earned",
      value: fmtTotal,
      icon: DollarSign,
      color: "bg-success-tint text-success",
    },
    {
      label: "This Month",
      value: fmtMonth,
      icon: TrendingUp,
      color: "bg-primary-container text-on-primary",
    },
    {
      label: "Completed Orders",
      value: String(completedCount ?? 0),
      icon: CheckCircle,
      color: "bg-secondary-container text-on-secondary-container",
    },
    {
      label: "Payouts",
      value: String(rows.length),
      icon: Clock,
      color: "bg-accent-tint text-on-accent-tint",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-on-surface">Earnings</h1>
          <p className="text-on-surface-variant mt-1">
            {formatCurrency(totalEarned)} sent to you across {rows.length} payout
            {rows.length === 1 ? "" : "s"}.
          </p>
        </div>
        <Link
          href="/helper/orders"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline min-h-11 -my-2"
        >
          View orders <ArrowUpRight size={14} />
        </Link>
      </div>

      {error ? (
        <ErrorState
          title="Couldn't load your earnings"
          message="We hit a snag fetching your payout history. Please try again in a moment."
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
                      <p className="text-lg font-bold text-on-surface mt-1 truncate">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}
                    >
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
                  Monthly Payouts
                </h2>
                <span className="text-xs text-on-surface-variant">In CAD</span>
              </div>
              <p className="text-sm text-on-surface-variant mb-6">
                Amounts the Acadivo team sent you, grouped by month.
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
                        title={formatCurrency(total)}
                      >
                        {formatCurrency(total)}
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
                Payout History {rows.length > 0 && `(${rows.length})`}
              </h2>
            </div>
            {rows.length === 0 ? (
              <PanelEmpty
                icon={<Receipt size={18} className="text-primary" />}
                title="No payouts yet"
                message="Payouts recorded by the Acadivo team will appear here."
                actionHref="/helper/orders"
                actionLabel="View your orders"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px]">
                  <thead>
                    <tr className="border-b border-outline-variant/30">
                      <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-3 sm:px-6 py-3">
                        Payout
                      </th>
                      <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-3 sm:px-6 py-3">
                        Date
                      </th>
                      <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-3 sm:px-6 py-3">
                        Method
                      </th>
                      <th className="text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-3 sm:px-6 py-3">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((p) => {
                      const orderCount = Array.isArray(p.order_ids) ? p.order_ids.length : 0;
                      return (
                        <tr
                          key={p.id}
                          className="border-b border-outline-variant/20 last:border-0 hover:bg-surface-container-low/50 transition-colors"
                        >
                          <td className="px-3 sm:px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-on-surface">
                                {orderCount} order{orderCount === 1 ? "" : "s"} paid out
                              </p>
                              <p className="text-xs text-on-surface-variant font-mono">
                                {p.id.slice(0, 8).toUpperCase()}
                              </p>
                              {p.reference && (
                                <p className="text-xs text-on-surface-variant mt-1">
                                  Ref: {p.reference}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 text-sm text-on-surface-variant">
                            {new Date(p.paid_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-3 sm:px-6 py-4">
                            <Badge variant="outline">{methodLabel(p.method)}</Badge>
                          </td>
                          <td className="px-3 sm:px-6 py-4 text-right">
                            <span className="text-sm font-semibold text-success">
                              +{formatCurrency(Number(p.amount_sent_cad))}
                            </span>
                            {p.amount_received !== null && p.received_currency && (
                              <span className="block text-xs text-on-surface-variant">
                                received {p.amount_received} {p.received_currency}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
