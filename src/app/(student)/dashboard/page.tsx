import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  FileText,
  CheckCircle2,
  Sparkles,
  Clock,
  RefreshCcw,
  MessageSquare,
  ShoppingBag,
  RotateCcw,
  Package,
  AlertTriangle,
  ChevronRight,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { unwrapRow } from "@/lib/embedded";
import { requestStatusVariant } from "@/lib/status-meta";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  requested: "Requested",
  proposal_sent: "Reviewing Proposals",
  accepted: "Hired",
  declined: "Declined",
  cancelled: "Cancelled",
};

function isPastResponseWindow(sentAt: string | null): boolean {
  return !!sentAt && Date.now() - new Date(sentAt).getTime() > 2 * 60 * 60 * 1000;
}

function timeAgo(value: string): string {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

type ActionCardItem = {
  id: string;
  key: string;
  href: string;
  title: string;
  body: string;
  createdAt: string;
  tone: string;
  icon: LucideIcon;
  dot?: boolean;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const [{ data: reqRows }, { data: completedOrders }] = await Promise.all([
    supabase
      .from("requests")
      .select(
        "id, title, subject, description, deadline, file_urls, status, created_at, sent_at, helper:users!requests_helper_id_fkey(id, name), helper_id"
      )
      .eq("student_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("orders")
      .select("id")
      .eq("student_id", user.id)
      .eq("status", "completed"),
  ]);

  const requests = (reqRows ?? []).map((r) => ({
    ...r,
    helper: unwrapRow<{ id: string; name: string | null }>(r.helper),
  }));

  const activeIds = requests
    .filter((r) => ["proposal_sent", "accepted"].includes(r.status))
    .map((r) => r.id);

  const proposalRowsRes =
    activeIds.length > 0
      ? await supabase
          .from("proposals")
          .select("id, request_id, status, created_at, helper_id, price, currency, description")
          .in("request_id", activeIds)
          .order("created_at", { ascending: false })
      : { data: null };

  const proposals = (proposalRowsRes.data ?? []) as Array<{
    id: string;
    request_id: string;
    status: string;
    created_at: string;
    helper_id: string | null;
  }>;

  const acceptedByRequest = new Map<string, string>();
  for (const p of proposals) {
    if (p.status === "accepted") {
      if (!acceptedByRequest.has(p.request_id)) {
        acceptedByRequest.set(p.request_id, p.id);
      }
    }
  }

  const orderByProposal = new Map<string, string>();
  if (acceptedByRequest.size > 0) {
    const { data: orderRows } = await supabase
      .from("orders")
      .select("id, proposal_id, status, updated_at, created_at")
      .in("proposal_id", Array.from(acceptedByRequest.values()));
    for (const o of (orderRows ?? []) as Array<{ id: string; proposal_id: string; status: string }>) {
      orderByProposal.set(o.proposal_id, o.id);
    }
  }

  const actionCards: ActionCardItem[] = [];
  const seenKeys = new Set<string>();

  // Proposals for requests that are still open (proposal_sent or just have pending proposal)
  for (const req of requests) {
    if (req.status === "cancelled" || req.status === "declined") continue;
    const reqProposals = proposals.filter((p) => p.request_id === req.id && p.status !== "declined");
    for (const p of reqProposals) {
      const key = `proposal:${p.id}:${req.id}`;
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);
      actionCards.push({
        id: p.id,
        key,
        href: `/requests/${req.id}`,
        title: "New proposal",
        body: `Helper sent a proposal for "${req.title}". Review and respond.`,
        createdAt: p.created_at,
        tone: "bg-secondary-container text-on-secondary-container",
        icon: FileText,
        dot: true,
      });
    }
  }

  // Orders that need action from student
  const orderListRes = await supabase
    .from("orders")
    .select("id, status, updated_at, created_at, proposal:proposals(id, request_id, request:requests(id,title))")
    .eq("student_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(30);

  const orders = (orderListRes.data ?? []).map((o) => {
    const prop = unwrapRow<{ id: string | null; request_id: string | null; request: unknown }>(o.proposal);
    const req = unwrapRow<{ id: string | null; title: string | null }>(prop?.request);
    return {
      id: o.id,
      status: o.status,
      updated_at: o.updated_at,
      created_at: o.created_at,
      requestId: req?.id ?? null,
      requestTitle: req?.title ?? "your request",
      proposalId: prop?.id ?? null,
    };
  });

  for (const o of orders) {
    if (!o.requestId) continue;
    if (o.status === "payment_pending") {
      const key = `order:pay:${o.id}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        actionCards.push({
          id: o.id,
          key,
          href: `/orders/${o.id}/payment`,
          title: "Complete payment",
          body: `Payment pending for "${o.requestTitle}". Pay to start the work.`,
          createdAt: o.created_at,
          tone: "bg-amber-100 text-amber-700",
          icon: AlertTriangle,
          dot: true,
        });
      }
    }
    if (o.status === "delivered") {
      const key = `order:delivered:${o.id}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        actionCards.push({
          id: o.id,
          key,
          href: `/requests/${o.requestId}`,
          title: "Work delivered",
          body: `Work delivered for "${o.requestTitle}". Review and approve or request revision.`,
          createdAt: o.updated_at,
          tone: "bg-emerald-100 text-emerald-700",
          icon: Package,
          dot: true,
        });
      }
    }
    if (o.status === "revision_requested") {
      const key = `order:revision:${o.id}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        actionCards.push({
          id: o.id,
          key,
          href: `/requests/${o.requestId}`,
          title: "Revision in progress",
          body: `Revision requested for "${o.requestTitle}". Helper is working on it.`,
          createdAt: o.updated_at,
          tone: "bg-amber-100 text-amber-700",
          icon: RotateCcw,
          dot: true,
        });
      }
    }
  }

  // Recent messages from helpers (request messages + order messages) that need attention
  const { data: reqMsgRows } = await supabase
    .from("messages")
    .select("id, request_id, sender_id, created_at, content")
    .in(
      "request_id",
      requests.map((r) => r.id)
    )
    .order("created_at", { ascending: false })
    .limit(15);
  for (const m of (reqMsgRows ?? []) as Array<{ id: string; request_id: string | null; sender_id: string; created_at: string }>) {
    if (!m.request_id) continue;
    const req = requests.find((r) => r.id === m.request_id);
    if (!req) continue;
    if (m.sender_id === user.id) continue;
    if (req.helper_id && m.sender_id === req.helper_id) {
      const key = `msg:req:${m.id}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        actionCards.push({
          id: m.id,
          key,
          href: `/requests/${req.id}`,
          title: "New message",
          body: `Helper replied on "${req.title}".`,
          createdAt: m.created_at,
          tone: "bg-primary-container text-on-primary",
          icon: MessageSquare,
          dot: true,
        });
      }
    }
  }

  const orderIdsForMsgs = orders.map((o) => o.id);
  if (orderIdsForMsgs.length > 0) {
    const { data: ordMsgRows } = await supabase
      .from("messages")
      .select("id, order_id, sender_id, created_at")
      .in("order_id", orderIdsForMsgs)
      .order("created_at", { ascending: false })
      .limit(15);
    for (const m of (ordMsgRows ?? []) as Array<{ id: string; order_id: string | null; sender_id: string; created_at: string }>) {
      if (!m.order_id) continue;
      const o = orders.find((x) => x.id === m.order_id);
      if (!o || !o.requestId) continue;
      if (m.sender_id === user.id) continue;
      const key = `msg:ord:${m.id}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        actionCards.push({
          id: m.id,
          key,
          href: `/requests/${o.requestId}`,
          title: "New message",
          body: `Helper replied on "${o.requestTitle}".`,
          createdAt: m.created_at,
          tone: "bg-primary-container text-on-primary",
          icon: MessageSquare,
          dot: true,
        });
      }
    }
  }

  // Remove delivered/completed/declined/cancelled context from action cards by cross-checking - keep only actionable
  const actionable = actionCards
    .filter((card) => {
      // Remove if it's about a completed order
      if (card.key.startsWith("order:")) {
        const oId = card.id;
        const o = orders.find((x) => x.id === oId);
        if (o && ["completed", "cancelled", "declined", "disputed"].includes(o.status)) return false;
        if (o && o.status === "delivered" && card.key.startsWith("order:revision")) return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 12);

  const firstName = (user.user_metadata?.name ?? user.email ?? "there").toString().trim().split(/\s+/)[0];
  const activeCount = requests.filter((r) => ["requested", "proposal_sent", "accepted"].includes(r.status)).length;
  const awaitingCount = requests.filter((r) => r.status === "requested").length;
  const completedCount = completedOrders?.length ?? 0;
  const nextAction = requests.find((r) => ["requested", "proposal_sent", "accepted"].includes(r.status));

  const stats = [
    { icon: FileText, label: "Open requests", value: String(activeCount), href: "/requests", tone: "bg-primary-container text-on-primary" },
    { icon: Clock, label: "Awaiting reply", value: String(awaitingCount), href: "/requests", tone: "bg-secondary-container text-on-secondary-container" },
    { icon: CheckCircle2, label: "Completed orders", value: String(completedCount), href: "/orders", tone: "bg-emerald-100 text-emerald-700" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-on-surface">Hi, {firstName}</h1>
          <p className="text-on-surface-variant text-sm sm:text-base mt-1">
            {nextAction
              ? `"${nextAction.title}" is ${STATUS_LABEL[nextAction.status]?.toLowerCase() ?? "in progress"}.`
              : "Submit a request to get matched with the right helper."}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/requests/new" className="shrink-0">
            <Button>
              <Sparkles size={16} />
              Request Help
            </Button>
          </Link>
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-label="At a glance">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href} className="group">
              <Card className="p-5 flex items-center gap-4 transition-shadow group-hover:shadow-md" hover>
                <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.tone}`}>
                  <Icon size={20} />
                </span>
                <div className="min-w-0">
                  <p className="text-2xl font-display font-bold text-on-surface">{s.value}</p>
                  <p className="text-xs text-on-surface-variant truncate">{s.label}</p>
                </div>
              </Card>
            </Link>
          );
        })}
      </section>

      {actionable.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display font-bold text-lg text-on-surface">Action Required</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {actionable.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.key} href={card.href}>
                  <Card className="action-card p-5 transition-shadow hover:shadow-lg" hover>
                    <div className="flex items-start gap-3">
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.tone}`}>
                        <Icon size={18} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-on-surface truncate">{card.title}</p>
                          {card.dot && <span className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <p className="text-sm text-on-surface-variant line-clamp-2 mt-1">{card.body}</p>
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-xs text-on-surface-variant">{timeAgo(card.createdAt)}</p>
                          <span className="text-sm font-medium text-primary inline-flex items-center gap-1">
                            Act now <ChevronRight size={14} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <section className="xl:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display font-bold text-lg text-on-surface">Your Requests</h2>
            <Link
              href="/requests"
              className="text-sm font-semibold text-primary inline-flex items-center gap-1 min-h-11 -my-2 hover:underline"
            >
              View all requests <ArrowRight size={14} />
            </Link>
          </div>

          {requests.length === 0 && (
            <Card className="p-6 sm:p-10 text-center">
              <p className="text-on-surface-variant">You haven&apos;t requested help yet.</p>
              <Link href="/requests/new" className="inline-block mt-4">
                <Button>Create Your First Request <Sparkles size={15} /></Button>
              </Link>
            </Card>
          )}

          {requests.map((r) => {
            const meta = { label: STATUS_LABEL[r.status] ?? r.status, variant: requestStatusVariant(r.status) };
            const proposalId = acceptedByRequest.get(r.id);
            const orderId = proposalId ? orderByProposal.get(proposalId) : undefined;
            const overdue = r.status === "requested" && isPastResponseWindow(r.sent_at);
            const target = orderId ? `/requests/${r.id}` : `/requests/${r.id}`;
            return (
              <Card key={r.id} hover className="p-5">
                <Link href={target} className="flex items-center justify-between gap-4 min-h-11 -my-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 font-semibold text-sm">
                      {(r.subject || r.title).slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-semibold text-on-surface truncate">{r.title}</h3>
                        <Badge variant={meta.variant} dot>
                          {meta.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {r.subject || "General"}
                        {r.helper?.name ? ` · ${r.helper.name}` : ""}
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-on-surface-variant shrink-0" />
                </Link>
                {overdue && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-warning/10 border border-warning/40 px-3 py-2.5">
                    <p className="text-xs text-on-surface inline-flex items-center gap-1.5">
                      <RefreshCcw size={13} className="text-warning" />
                      This helper hasn&apos;t responded in 2 hours.
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </section>

        <section>
          <div className="flex items-center justify-between gap-4 mb-3">
            <h2 className="font-display font-bold text-lg text-on-surface">Quick Links</h2>
            <Link href="/notifications" className="text-sm font-semibold text-primary min-h-11 -my-2 inline-flex items-center hover:underline">
              View all notifications
            </Link>
          </div>
          <Card className="p-4 flex flex-col gap-2">
            <Link href="/messages" className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-primary" />
                <span className="text-sm text-on-surface">Messages</span>
              </div>
              <ArrowRight size={14} className="text-on-surface-variant" />
            </Link>
            <Link href="/orders" className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-primary" />
                <span className="text-sm text-on-surface">Orders</span>
              </div>
              <ArrowRight size={14} className="text-on-surface-variant" />
            </Link>
            <Link href="/requests" className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-2">
                <Inbox size={16} className="text-primary" />
                <span className="text-sm text-on-surface">My Requests</span>
              </div>
              <ArrowRight size={14} className="text-on-surface-variant" />
            </Link>
          </Card>
        </section>
      </div>
    </div>
  );
}
