import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, MessageSquare, Briefcase } from "lucide-react";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { unwrapRow } from "@/lib/embedded";
import MessagesLiveRefresh from "@/components/requests/messages-live-refresh";

export const dynamic = "force-dynamic";

type Counterpart = { id: string; name: string | null; avatar_url: string | null } | null;

type Thread = {
  key: string;
  kind: "order" | "request";
  title: string;
  counterpart: Counterpart;
  statusLabel: string;
  statusVariant: "primary" | "warning" | "success" | "secondary" | "outline";
  link: string;
  lastAt: number;
  lastPreview: string | null;
};

const REQUEST_META: Record<string, { label: string; variant: "primary" | "warning" | "success" | "secondary" | "outline" }> = {
  requested: { label: "Open", variant: "primary" },
  proposal_sent: { label: "Proposal Sent", variant: "warning" },
};

const ORDER_META: Record<string, { label: string; variant: "primary" | "warning" | "success" | "danger" | "outline" }> = {
  payment_pending: { label: "Payment Pending", variant: "warning" },
  in_progress: { label: "In Progress", variant: "primary" },
  delivered: { label: "Delivered", variant: "success" },
  revision_requested: { label: "Revision", variant: "warning" },
  completed: { label: "Completed", variant: "success" },
  disputed: { label: "Under Review", variant: "danger" },
};

export default async function HelperMessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const orderStatuses = ["payment_pending", "in_progress", "delivered", "revision_requested", "disputed", "completed"];
  const requestStatuses = ["requested", "proposal_sent"];
  const userRole = String(user.user_metadata?.role ?? user.user_metadata?.account_type ?? "") === "helper";

  const [{ data: reqRows }, { data: orderRows }] = await Promise.all([
    supabase
      .from("requests")
      .select("id, title, status, created_at, student:users!requests_student_id_fkey(id, name, avatar_url)")
      .eq("helper_id", user.id)
      .in("status", requestStatuses)
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select(
        "id, status, created_at, student:users!orders_student_id_fkey(id, name, avatar_url), proposal:proposals(id, request_id, request:requests(title))"
      )
      .eq("helper_id", user.id)
      .in("status", orderStatuses)
      .order("created_at", { ascending: false }),
  ]);

  const requests = (reqRows ?? []).map((r) => ({
    ...r,
    student: unwrapRow<Counterpart>(r.student),
  }));
  const orders = (orderRows ?? []).map((o) => {
    const proposal = unwrapRow<{
      id: string | null;
      request_id: string | null;
      request: { title: string | null } | null;
    }>(o.proposal);
    return {
      ...o,
      student: unwrapRow<Counterpart>(o.student),
      requestId: proposal?.request_id ?? null,
      makeTitle: proposal?.request?.title ?? "Untitled Order",
    };
  });

  const ordersByRequest = new Map<string, string>();
  for (const o of orders) {
    if (o.requestId) ordersByRequest.set(o.requestId, o.id);
  }

  const requestIds = requests.map((r) => r.id);
  const orderIds = orders.map((o) => o.id);
  const allRequestIds = [...requestIds, ...ordersByRequest.keys()];

  const { data: requestMsgs } =
    allRequestIds.length > 0
      ? await supabase
          .from("messages")
          .select("id, body, created_at, request_id, order_id")
          .in("request_id", allRequestIds)
          .order("created_at", { ascending: false })
          .limit(300)
      : { data: null };

  const { data: orderMsgs } =
    orderIds.length > 0
      ? await supabase
          .from("messages")
          .select("id, body, created_at, order_id")
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
  for (const m of (requestMsgs ?? []) as { request_id?: string; body: string; created_at: string }[]) {
    if (m.request_id) setLatest(latestByRequest, m.request_id, m.body, m.created_at);
  }
  const latestByOrder = new Map<string, { body: string; created_at: string }>();
  for (const m of (orderMsgs ?? []) as { order_id?: string; body: string; created_at: string }[]) {
    if (m.order_id) setLatest(latestByOrder, m.order_id, m.body, m.created_at);
  }
  for (const m of (requestMsgs ?? []) as { request_id?: string; body: string; created_at: string }[]) {
    if (m.request_id && ordersByRequest.has(m.request_id)) {
      setLatest(latestByOrder, ordersByRequest.get(m.request_id)!, m.body, m.created_at);
    }
  }

  const threads: Thread[] = [
    ...requests.map((r) => {
      const last = latestByRequest.get(r.id);
      return {
        key: `request-${r.id}`,
        kind: "request" as const,
        title: r.title,
        counterpart: r.student,
        statusLabel: REQUEST_META[r.status]?.label ?? r.status,
        statusVariant: (REQUEST_META[r.status]?.variant ?? "outline") as Thread["statusVariant"],
        link: `/helper/requests/${r.id}`,
        lastAt: last ? new Date(last.created_at).getTime() : new Date(r.created_at).getTime(),
        lastPreview: last?.body ?? "No messages yet",
      };
    }),
    ...orders.map((o) => {
      const last = latestByOrder.get(o.id);
      return {
        key: `order-${o.id}`,
        kind: "order" as const,
        title: o.makeTitle,
        counterpart: o.student,
        statusLabel: ORDER_META[o.status]?.label ?? o.status,
        statusVariant: (ORDER_META[o.status]?.variant ?? "outline") as Thread["statusVariant"],
        link: `/helper/orders/${o.id}`,
        lastAt: last ? new Date(last.created_at).getTime() : new Date(o.created_at).getTime(),
        lastPreview: last?.body ?? "No messages yet",
      };
    }),
  ].sort((a, b) => b.lastAt - a.lastAt);

  return (
    <div className="max-w-6xl mx-auto">
      <MessagesLiveRefresh />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="font-display font-bold text-2xl text-on-surface">Messages</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Conversations with students about your requests and orders
          </p>
        </div>
        {!userRole && (
          <Link href="/helper/requests">
            <Button size="sm"><Briefcase size={15} /> Browse Requests</Button>
          </Link>
        )}
      </div>

      {threads.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare size={28} className="mx-auto text-on-surface-variant/60 mb-3" />
          <p className="text-on-surface-variant">No conversations yet.</p>
          <p className="text-sm text-on-surface-variant mt-1">
            Students you work with will appear here.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="lg:col-span-1 divide-y divide-outline-variant/40 overflow-hidden lg:max-h-[70vh] overflow-y-auto">
            {threads.map((t) => (
              <Link
                key={t.key}
                href={t.link}
                className="flex items-start gap-3 p-4 hover:bg-surface-container-low transition-colors group"
              >
                <Avatar name={t.counterpart?.name ?? "Student"} size="md" src={t.counterpart?.avatar_url ?? undefined} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-on-surface truncate group-hover:underline">
                      {t.counterpart?.name ?? "Student"}
                    </p>
                    <span className="text-[11px] text-on-surface-variant shrink-0">
                      {new Date(t.lastAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-on-surface truncate">{t.title}</p>
                  <p className="text-xs text-on-surface-variant truncate mt-0.5">{t.lastPreview}</p>
                  <Badge variant={t.statusVariant} className="mt-2">{t.statusLabel}</Badge>
                </div>
              </Link>
            ))}
          </Card>

          <div className="lg:col-span-2 flex flex-col gap-4">
            <Card className="p-8 text-center flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-primary-container/30 flex items-center justify-center">
                <MessageSquare size={26} className="text-primary" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-on-surface">Live chats live in the workspace</h2>
                <p className="text-sm text-on-surface-variant mt-1 max-w-md">
                  Select a conversation to open its request or order workspace, where
                  the realtime chat, files, and deliverables live.
                </p>
              </div>
              {threads[0] && (
                <Link href={threads[0].link} className="mt-2">
                  <Button>Open latest conversation <ArrowRight size={15} /></Button>
                </Link>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}