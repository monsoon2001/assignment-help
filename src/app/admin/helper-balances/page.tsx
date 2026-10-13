import { requireAdmin } from "@/lib/admin";
import { adminClient } from "@/lib/supabase/admin";
import { unwrapRow } from "@/lib/embedded";
import HelperBalancesClient, {
  type HelperBalance,
  type RecentPayout,
} from "./balances-client";

export const dynamic = "force-dynamic";

interface UnpaidPayment {
  order_id: string;
  helper_share_cad: number | null;
  order: unknown;
}

export default async function HelperBalancesPage() {
  await requireAdmin();

  const { data: unpaidRows } = await adminClient
    .from("payments")
    .select(
      "order_id, helper_share_cad, order:orders(id, status, price, helper:users!orders_helper_id_fkey(id, name), proposal:proposals(request:requests(title)))"
    )
    .eq("status", "paid")
    .eq("helper_payout_status", "unpaid")
    .eq("disputed", false)
    .order("created_at", { ascending: true });

  const byHelper = new Map<string, HelperBalance>();
  for (const row of (unpaidRows ?? []) as unknown as UnpaidPayment[]) {
    const order = unwrapRow<{
      id: string;
      status: string;
      price: number;
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

    const share = Number(row.helper_share_cad ?? 0);
    const existing = byHelper.get(helper.id) ?? {
      helperId: helper.id,
      helperName: helper.name ?? "Helper",
      owedCad: 0,
      orders: [],
    };
    existing.owedCad = Math.round((existing.owedCad + share) * 100) / 100;
    existing.orders.push({
      orderId: order.id,
      title,
      status: order.status,
      amountCad: share,
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
