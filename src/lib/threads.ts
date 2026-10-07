import type { SupabaseClient } from "@supabase/supabase-js";
import { unwrapRow } from "@/lib/embedded";
import { orderStatusVariant, requestStatusVariant, type BadgeVariant } from "@/lib/status-meta";

export type ThreadCounterpart = { id: string; name: string | null; avatar_url: string | null } | null;

export type Thread = {
  key: string;
  kind: "order" | "request";
  title: string;
  counterpart: ThreadCounterpart;
  statusLabel: string;
  statusVariant: BadgeVariant;
  link: string;
  lastAt: number;
  lastPreview: string | null;
};

const REQUEST_LABEL: Record<string, string> = {
  requested: "Open",
  proposal_sent: "Reviewing",
  accepted: "Accepted",
  declined: "Declined",
};

const HELPER_REQUEST_LABEL: Record<string, string> = {
  requested: "Open",
  proposal_sent: "Proposal Sent",
};

const ORDER_LABEL: Record<string, string> = {
  payment_pending: "Payment Pending",
  in_progress: "In Progress",
  delivered: "Delivered",
  revision_requested: "Revision",
  completed: "Completed",
  disputed: "Under Review",
};

type MsgRow = { request_id?: string; order_id?: string; body: string; created_at: string };

export async function buildThreads(
  client: SupabaseClient,
  userId: string,
  isHelper: boolean
): Promise<Thread[]> {
  const orderStatuses = ["payment_pending", "in_progress", "delivered", "revision_requested", "disputed", "completed"];
  const requestStatuses = isHelper
    ? ["requested", "proposal_sent"]
    : ["requested", "proposal_sent", "accepted", "declined"];

  const counterpart = isHelper ? "student" : "helper";

  const reqQuery = client
    .from("requests")
    .select(
      `id, title, status, created_at, ${counterpart}:users!requests_${counterpart}_id_fkey(id, name, avatar_url)`
    )
    .eq(`${isHelper ? "helper" : "student"}_id`, userId)
    .in("status", requestStatuses)
    .order("created_at", { ascending: false });

  const orderQuery = client
    .from("orders")
    .select(
      `id, status, created_at, ${counterpart}:users!orders_${counterpart}_id_fkey(id, name, avatar_url), proposal:proposals(id, request_id, request:requests(title))`
    )
    .eq(`${isHelper ? "helper" : "student"}_id`, userId)
    .in("status", orderStatuses)
    .order("created_at", { ascending: false });

  const [{ data: reqRows }, { data: orderRows }] = await Promise.all([reqQuery, orderQuery]);

  const requests = (reqRows ?? []).map((r) => ({
    ...r,
    counterpart: unwrapRow<ThreadCounterpart>((r as Record<string, unknown>)[counterpart]),
  }));
  const orders = (orderRows ?? []).map((o) => {
    const proposal = unwrapRow<{
      id: string | null;
      request_id: string | null;
      request: { title: string | null } | null;
    }>((o as Record<string, unknown>).proposal);
    return {
      ...o,
      counterpart: unwrapRow<ThreadCounterpart>((o as Record<string, unknown>)[counterpart]),
      requestId: proposal?.request_id ?? null,
      makeTitle: proposal?.request?.title ?? "Untitled Order",
    };
  });

  const ordersByRequest = new Map<string, string>();
  for (const o of orders) {
    if (o.requestId) ordersByRequest.set(o.requestId, o.id);
  }
  const visibleRequests = requests.filter((r) => !ordersByRequest.has((r as { id: string }).id));
  const requestIds = visibleRequests.map((r) => (r as { id: string }).id);
  const orderIds = orders.map((o) => (o as { id: string }).id);
  const allRequestIds = [...requestIds, ...ordersByRequest.keys()];

  const { data: requestMsgs } =
    allRequestIds.length > 0
      ? await client
          .from("messages")
          .select("id, body, sender_id, created_at, request_id, order_id")
          .in("request_id", allRequestIds)
          .order("created_at", { ascending: false })
          .limit(300)
      : { data: null };

  const { data: orderMsgs } =
    orderIds.length > 0
      ? await client
          .from("messages")
          .select("id, body, sender_id, created_at, request_id, order_id")
          .in("order_id", orderIds)
          .order("created_at", { ascending: false })
          .limit(300)
      : { data: null };

  const setLatest = (map: Map<string, { body: string; created_at: string }>, key: string, body: string, created_at: string) => {
    const cur = map.get(key);
    if (!cur || new Date(created_at).getTime() > new Date(cur.created_at).getTime()) {
      map.set(key, { body, created_at });
    }
  };

  const latestByRequest = new Map<string, { body: string; created_at: string }>();
  for (const m of (requestMsgs ?? []) as MsgRow[]) {
    if (m.request_id) setLatest(latestByRequest, m.request_id, m.body, m.created_at);
  }
  const latestByOrder = new Map<string, { body: string; created_at: string }>();
  for (const m of (orderMsgs ?? []) as MsgRow[]) {
    if (m.order_id) setLatest(latestByOrder, m.order_id, m.body, m.created_at);
  }
  for (const m of (requestMsgs ?? []) as MsgRow[]) {
    if (m.request_id && ordersByRequest.has(m.request_id)) {
      setLatest(latestByOrder, ordersByRequest.get(m.request_id)!, m.body, m.created_at);
    }
  }

  const threads: Thread[] = [
    ...visibleRequests.map((r) => {
      const row = r as { id: string; title: string; status: string; created_at: string };
      const last = latestByRequest.get(row.id);
      const label = (isHelper ? HELPER_REQUEST_LABEL : REQUEST_LABEL)[row.status] ?? row.status;
      const meta = { label, variant: requestStatusVariant(row.status) };
      return {
        key: `request-${row.id}`,
        kind: "request" as const,
        title: row.title,
        counterpart: r.counterpart,
        statusLabel: meta?.label ?? row.status,
        statusVariant: (meta?.variant ?? "outline") as Thread["statusVariant"],
        link: isHelper ? `/helper/requests/${row.id}` : `/requests/${row.id}`,
        lastAt: last ? new Date(last.created_at).getTime() : new Date(row.created_at).getTime(),
        lastPreview: last?.body ?? "No messages yet",
      };
    }),
    ...orders.map((o) => {
      const row = o as { id: string; status: string; created_at: string };
      const last = latestByOrder.get(row.id);
      const meta = { label: ORDER_LABEL[row.status] ?? row.status, variant: orderStatusVariant(row.status) };
      return {
        key: `order-${row.id}`,
        kind: "order" as const,
        title: o.makeTitle,
        counterpart: o.counterpart,
        statusLabel: meta?.label ?? row.status,
        statusVariant: (meta?.variant ?? "outline") as Thread["statusVariant"],
        link: isHelper ? `/helper/orders/${row.id}` : `/orders/${row.id}`,
        lastAt: last ? new Date(last.created_at).getTime() : new Date(row.created_at).getTime(),
        lastPreview: last?.body ?? "No messages yet",
      };
    }),
  ].sort((a, b) => b.lastAt - a.lastAt);

  return threads;
}