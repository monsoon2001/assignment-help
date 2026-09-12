import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, MessageSquare } from "lucide-react";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { unwrapRow } from "@/lib/embedded";

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
  proposal_sent: { label: "Reviewing", variant: "warning" },
  accepted: { label: "Accepted", variant: "success" },
  declined: { label: "Declined", variant: "secondary" },
};

const ORDER_META: Record<string, { label: string; variant: "primary" | "warning" | "success" | "danger" | "outline" }> = {
  payment_pending: { label: "Payment Pending", variant: "warning" },
  in_progress: { label: "In Progress", variant: "primary" },
  delivered: { label: "Delivered", variant: "success" },
  revision_requested: { label: "Revision", variant: "warning" },
  completed: { label: "Completed", variant: "success" },
  disputed: { label: "Under Review", variant: "danger" },
};

export default async function StudentMessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const orderStatuses = ["payment_pending", "in_progress", "delivered", "revision_requested", "disputed", "completed"];
  const requestStatuses = ["requested", "proposal_sent", "accepted", "declined"];

  const [{ data: reqRows }, { data: orderRows }] = await Promise.all([
    supabase
      .from("requests")
      .select("id, title, status, created_at, helper:users!requests_helper_id_fkey(id, name, avatar_url)")
      .eq("student_id", user.id)
      .in("status", requestStatuses)
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select(
        "id, status, created_at, helper:users!orders_helper_id_fkey(id, name, avatar_url), proposal:proposals(request:requests(title))"
      )
      .eq("student_id", user.id)
      .in("status", orderStatuses)
      .order("created_at", { ascending: false }),
  ]);

  const requests = (reqRows ?? []).map((r) => ({
    ...r,
    helper: unwrapRow<Counterpart>(r.helper),
  }));
  const orders = (orderRows ?? []).map((o) => ({
    ...o,
    helper: unwrapRow<Counterpart>(o.helper),
    makeTitle:
      unwrapRow<{ request: { title: string | null } | null }>(
        o.proposal
      )?.request?.title ?? "Untitled Order",
  }));

  const requestIds = requests.map((r) => r.id);
  const orderIds = orders.map((o) => o.id);

  const { data: requestMsgs } =
    requestIds.length > 0
      ? await supabase
          .from("messages")
          .select("id, body, sender_id, created_at")
          .in("request_id", requestIds)
          .order("created_at", { ascending: false })
          .limit(200)
      : { data: null };

  const { data: orderMsgs } =
    orderIds.length > 0
      ? await supabase
          .from("messages")
          .select("id, body, sender_id, created_at")
          .in("order_id", orderIds)
          .order("created_at", { ascending: false })
          .limit(200)
      : { data: null };

  const latestByRequest = new Map<string, { body: string; created_at: string }>();
  for (const m of (requestMsgs ?? []) as { request_id?: string; body: string; created_at: string }[]) {
    if (!latestByRequest.has((m as { request_id: string }).request_id)) {
      latestByRequest.set((m as { request_id: string }).request_id, { body: m.body, created_at: m.created_at });
    }
  }
  const latestByOrder = new Map<string, { body: string; created_at: string }>();
  for (const m of (orderMsgs ?? []) as { order_id?: string; body: string; created_at: string }[]) {
    if (!latestByOrder.has((m as { order_id: string }).order_id)) {
      latestByOrder.set((m as { order_id: string }).order_id, { body: m.body, created_at: m.created_at });
    }
  }

  const threads: Thread[] = [
    ...requests.map((r) => {
      const last = latestByRequest.get(r.id);
      return {
        key: `request-${r.id}`,
        kind: "request" as const,
        title: r.title,
        counterpart: r.helper,
        statusLabel: REQUEST_META[r.status]?.label ?? r.status,
        statusVariant: (REQUEST_META[r.status]?.variant ?? "outline") as Thread["statusVariant"],
        link: `/requests/${r.id}`,
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
        counterpart: o.helper,
        statusLabel: ORDER_META[o.status]?.label ?? o.status,
        statusVariant: (ORDER_META[o.status]?.variant ?? "outline") as Thread["statusVariant"],
        link: `/orders/${o.id}`,
        lastAt: last ? new Date(last.created_at).getTime() : new Date(o.created_at).getTime(),
        lastPreview: last?.body ?? "No messages yet",
      };
    }),
  ].sort((a, b) => b.lastAt - a.lastAt);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="font-display font-bold text-2xl text-on-surface">Messages</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Conversations about your requests and orders
          </p>
        </div>
        <Link href="/requests/new">
          <Button size="sm"><MessageSquare size={15} /> New Request</Button>
        </Link>
      </div>

      {threads.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare size={28} className="mx-auto text-on-surface-variant/60 mb-3" />
          <p className="text-on-surface-variant">No conversations yet.</p>
          <p className="text-sm text-on-surface-variant mt-1">
            Request help and chat with your helper here.
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
                <Avatar name={t.counterpart?.name ?? "PeerCraft"} size="md" src={t.counterpart?.avatar_url ?? undefined} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-on-surface truncate group-hover:underline">
                      {t.counterpart?.name ?? "PeerCraft Helper"}
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