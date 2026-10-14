import { requireAdmin } from "@/lib/admin";
import { adminClient } from "@/lib/supabase/admin";
import { unwrapRow } from "@/lib/embedded";
import { getCadRates } from "@/lib/fx.server";
import { convertViaCad, normalizeCurrency } from "@/lib/currency";
import HelperBalancesClient, {
  type HelperBalance,
  type RecentPayout,
} from "./balances-client";

export const dynamic = "force-dynamic";

interface UnpaidPayment {
  order_id: string;
  order: unknown;
}

export default async function HelperBalancesPage() {
  await requireAdmin();

  const [{ data: unpaidRows }, rates] = await Promise.all([
    adminClient
      .from("payments")
      .select(
        "order_id, order:orders(id, status, price, currency, base_amount, base_currency, helper:users!orders_helper_id_fkey(id, name), proposal:proposals(request:requests(title)))"
      )
      .eq("status", "paid")
      .eq("helper_payout_status", "unpaid")
      .eq("disputed", false)
      .order("created_at", { ascending: true }),
    getCadRates(),
  ]);

  const byHelper = new Map<string, HelperBalance>();
  for (const row of (unpaidRows ?? []) as unknown as UnpaidPayment[]) {
    const order = unwrapRow<{
      id: string;
      status: string;
      price: number;
      currency: string | null;
      base_amount: number | null;
      base_currency: string | null;
      helper: unknown;
      proposal: unknown;
    }>(row.order);
    if (!order) continue;
    const helper = unwrapRow<{ id: string; name: string | null }>(order.helper);
    if (!helper) continue;
    const title =
      unwrapRow<{ request: unknown }>(order.proposal)?.request
        ? String(
            unwrapRow<{ request: { title: string | null } | null }>(order.proposal)?.request?.title ??
              "Untitled order"
          )
        : "Untitled order";

    // Reference value: the helper's quoted amount converted to CAD. The admin
    // still decides the exact amount sent — this is only a starting figure.
    const baseAmount = Number(order.base_amount ?? order.price);
    const baseCurrency = normalizeCurrency(order.base_currency ?? order.currency);
    const cadValue =
      baseCurrency === "CAD"
        ? Math.round(baseAmount * 100) / 100
        : convertViaCad(baseAmount, baseCurrency, "CAD", rates);

    const existing = byHelper.get(helper.id) ?? {
      helperId: helper.id,
      helperName: helper.name ?? "Helper",
      owedCad: 0,
      orders: [],
    };
    const referenceCad = cadValue === null ? 0 : Math.round(cadValue * 100) / 100;
    existing.owedCad = Math.round((existing.owedCad + referenceCad) * 100) / 100;
    existing.orders.push({
      orderId: order.id,
      title,
      status: order.status,
      amountCad: referenceCad,
    });
    byHelper.set(helper.id, existing);
  }

  const balances = Array.from(byHelper.values()).sort((a, b) => b.owedCad - a.owedCad);

  const { data: payoutRows } = await adminClient
    .from("manual_payouts")
    .select("id, helper_id, amount_sent_cad, amount_received, received_currency, method, reference, paid_at, order_ids, helper:users!manual_payouts_helper_id_fkey(name)")
    .order("paid_at", { ascending: false })
    .limit(50);

  const recentPayouts: RecentPayout[] = ((payoutRows ?? []) as unknown[]).map((raw) => {
    const p = raw as {
      id: string;
      helper_id: string;
      amount_sent_cad: number;
      amount_received: number | null;
      received_currency: string | null;
      method: string;
      reference: string | null;
      paid_at: string;
      order_ids: string[];
      helper: unknown;
    };
    const helper = unwrapRow<{ name: string | null }>(p.helper);
    return {
      id: p.id,
      helperName: helper?.name ?? "Helper",
      amountSentCad: Number(p.amount_sent_cad ?? 0),
      amountReceived: p.amount_received === null ? null : Number(p.amount_received),
      receivedCurrency: p.received_currency,
      method: p.method,
      reference: p.reference,
      paidAt: p.paid_at,
      orderCount: Array.isArray(p.order_ids) ? p.order_ids.length : 0,
    };
  });

  return <HelperBalancesClient balances={balances} recentPayouts={recentPayouts} />;
}
