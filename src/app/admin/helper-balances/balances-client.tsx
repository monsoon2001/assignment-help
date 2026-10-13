"use client";

import { useActionState, useMemo, useState } from "react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import { ChevronDown, HandCoins, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { recordPayout, type PayoutResult } from "./actions";

export interface HelperBalanceOrder {
  orderId: string;
  title: string;
  status: string;
  amountCad: number;
}

export interface HelperBalance {
  helperId: string;
  helperName: string;
  owedCad: number;
  orders: HelperBalanceOrder[];
}

export interface RecentPayout {
  id: string;
  helperName: string;
  amountSentCad: number;
  amountReceived: number | null;
  receivedCurrency: string | null;
  method: string;
  reference: string | null;
  paidAt: string;
  orderCount: number;
}

const initialResult: PayoutResult = { ok: false, message: "" };

export default function HelperBalancesClient({
  balances,
  recentPayouts,
}: {
  balances: HelperBalance[];
  recentPayouts: RecentPayout[];
}) {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-on-surface">Helper Balances</h1>
          <p className="text-on-surface-variant mt-1">
            Private ledger of what each helper is owed. Record manual payouts here — amounts are
            never shown to students or helpers.
          </p>
        </div>
      </div>

      {balances.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-surface-container-low text-on-surface-variant flex items-center justify-center mx-auto mb-3">
            <Wallet size={20} />
          </div>
          <p className="font-medium text-on-surface">No outstanding balances</p>
          <p className="text-sm text-on-surface-variant mt-1">
            Every paid order has been settled.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {balances.map((balance) => (
            <HelperBalanceCard key={balance.helperId} balance={balance} />
          ))}
        </div>
      )}

      <Card>
        <div className="p-5 border-b border-outline-variant/30">
          <h2 className="font-display text-lg font-semibold text-on-surface">Recent Payouts</h2>
        </div>
        {recentPayouts.length === 0 ? (
          <p className="p-6 text-sm text-on-surface-variant">No payouts recorded yet.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/30">
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-5 py-3">Helper</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-5 py-3">Sent (CAD)</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-5 py-3">Received</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-5 py-3">Orders</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentPayouts.map((p) => (
                <tr key={p.id} className="border-b border-outline-variant/20 last:border-0">
                  <td className="px-5 py-3 text-sm text-on-surface">
                    {p.helperName}
                    {p.reference && (
                      <span className="block text-xs text-on-surface-variant font-mono">{p.reference}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-sm font-semibold text-on-surface">{formatCurrency(p.amountSentCad)}</td>
                  <td className="px-5 py-3 text-sm text-on-surface-variant">
                    {p.amountReceived === null
                      ? `— · ${p.method}`
                      : `${p.amountReceived} ${p.receivedCurrency ?? ""} · ${p.method}`}
                  </td>
                  <td className="px-5 py-3 text-sm text-on-surface-variant">{p.orderCount}</td>
                  <td className="px-5 py-3 text-sm text-on-surface-variant">
                    {new Date(p.paidAt).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function HelperBalanceCard({ balance }: { balance: HelperBalance }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(balance.orders.map((o) => o.orderId));
  const [state, formAction, pending] = useActionState(recordPayout, initialResult);

  const selectedTotal = useMemo(
    () =>
      Math.round(
        balance.orders
          .filter((o) => selected.includes(o.orderId))
          .reduce((sum, o) => sum + o.amountCad, 0) * 100
      ) / 100,
    [balance.orders, selected]
  );

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-surface-container-low/50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-10 h-10 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
            <HandCoins size={18} />
          </span>
          <div className="min-w-0">
            <p className="font-medium text-on-surface truncate">{balance.helperName}</p>
            <p className="text-xs text-on-surface-variant">
              {balance.orders.length} unpaid order{balance.orders.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-display text-lg font-bold text-primary">{formatCurrency(balance.owedCad)}</span>
          <ChevronDown size={18} className={`text-on-surface-variant transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <form action={formAction} className="border-t border-outline-variant/30 p-5 space-y-4">
          <input type="hidden" name="helperId" value={balance.helperId} />

          <div className="space-y-2">
            {balance.orders.map((o) => (
              <label
                key={o.orderId}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-outline-variant/60 bg-surface-container-low/40"
              >
                <span className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    name="orderIds"
                    value={o.orderId}
                    checked={selected.includes(o.orderId)}
                    onChange={(e) =>
                      setSelected((prev) =>
                        e.target.checked
                          ? [...prev, o.orderId]
                          : prev.filter((id) => id !== o.orderId)
                      )
                    }
                    className="w-4 h-4 rounded accent-[var(--color-primary)]"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm text-on-surface truncate">{o.title}</span>
                    <span className="block text-xs text-on-surface-variant font-mono">
                      #{o.orderId.slice(0, 8).toUpperCase()}
                    </span>
                  </span>
                </span>
                <span className="text-sm font-semibold text-on-surface shrink-0">
                  {formatCurrency(o.amountCad)}
                </span>
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Amount sent (CAD)"
              name="amountSent"
              type="number"
              step="0.01"
              min="0"
              defaultValue={selectedTotal.toFixed(2)}
              key={selectedTotal}
            />
            <Select
              label="Method"
              name="method"
              defaultValue="wise"
              options={[
                { value: "wise", label: "Wise" },
                { value: "bank_transfer", label: "Bank transfer" },
                { value: "other", label: "Other" },
              ]}
            />
            <Input label="Amount received (optional)" name="amountReceived" type="number" step="0.01" min="0" />
            <Input label="Received currency (optional)" name="receivedCurrency" placeholder="AUD" />
            <Input label="Reference (optional)" name="reference" />
            <Input label="Notes (optional)" name="notes" />
          </div>

          <div className="flex items-center gap-3">
            <Button disabled={pending || selected.length === 0} type="submit">
              {pending ? "Recording…" : `Record payout · ${formatCurrency(selectedTotal)}`}
            </Button>
            {state.message && (
              <span className={`text-sm ${state.ok ? "text-success" : "text-error"}`}>
                {state.message}
              </span>
            )}
          </div>

          <p className="text-xs text-on-surface-variant">
            Recording a payout marks exactly the selected orders as paid and removes them from the
            helper&apos;s balance. Orders can never be paid out twice.
          </p>
        </form>
      )}
    </Card>
  );
}
