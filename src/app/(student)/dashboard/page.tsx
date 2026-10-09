import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, FileText, CheckCircle2, Sparkles, Users, Clock, RefreshCcw } from "lucide-react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { PanelEmpty } from "@/components/ui/states";
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

type NotifRow = { id: string; type: string; message: string; link: string | null; read: boolean; created_at: string };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const [{ data: reqRows }, { data: completedOrders }, { data: notifRows }] =
    await Promise.all([
      supabase
        .from("requests")
        .select("id, title, subject, description, deadline, file_urls, status, created_at, sent_at, helper:users!requests_helper_id_fkey(id, name)")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("orders")
        .select("id")
        .eq("student_id", user.id)
        .eq("status", "completed"),
      supabase
        .from("notifications")
        .select("id, type, message, link, read, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const requests = (reqRows ?? []).map((r) => ({
    ...r,
    helper: unwrapRow<{ id: string; name: string | null }>(r.helper),
  }));

  const activeIds = requests
    .filter((r) => ["proposal_sent", "accepted"].includes(r.status))
    .map((r) => r.id);

  const { data: proposalRows } =
    activeIds.length > 0
      ? await supabase
          .from("proposals")
          .select("id, request_id, status")
          .in("request_id", activeIds)
      : { data: null };

  const acceptedByRequest = new Map<string, string>();
  for (const p of (proposalRows ?? []) as { id: string; request_id: string; status: string }[]) {
    if (p.status === "accepted") acceptedByRequest.set(p.request_id, p.id);
  }

  const orderByProposal = new Map<string, string>();
  if (acceptedByRequest.size > 0) {
    const { data: orderRows } = await supabase
      .from("orders")
      .select("id, proposal_id")
      .in("proposal_id", Array.from(acceptedByRequest.values()));
    for (const o of (orderRows ?? []) as { id: string; proposal_id: string }[]) {
      orderByProposal.set(o.proposal_id, o.id);
    }
  }

  const firstName = (user.user_metadata?.name ?? user.email ?? "there").toString().trim().split(/\s+/)[0];
  const activeCount = requests.filter((r) => ["requested", "proposal_sent", "accepted"].includes(r.status)).length;
  const awaitingCount = requests.filter((r) => r.status === "requested").length;
  const completedCount = completedOrders?.length ?? 0;

  const notifications = (notifRows ?? []) as NotifRow[];
  const nextAction = requests.find((r) =>
    ["requested", "proposal_sent", "accepted"].includes(r.status)
  );

  const stats = [
    { icon: FileText, label: "Open requests", value: String(activeCount), href: "/requests", tone: "bg-primary-container text-on-primary" },
    { icon: Clock, label: "Awaiting reply", value: String(awaitingCount), href: "/requests", tone: "bg-secondary-container text-on-secondary-container" },
    { icon: CheckCircle2, label: "Completed orders", value: String(completedCount), href: "/orders", tone: "bg-emerald-100 text-emerald-700" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8">
      {/* Greeting + primary action */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-on-surface">
            Hi, {firstName}
          </h1>
          <p className="text-on-surface-variant text-sm sm:text-base mt-1">
            {nextAction
              ? `"${nextAction.title}" is ${STATUS_LABEL[nextAction.status]?.toLowerCase() ?? "in progress"}.`
              : "Submit a request to get matched with the right helper."}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/browse-helpers" className="shrink-0">
            <Button variant="outline">
              <Users size={16} />
              Browse Helpers
            </Button>
          </Link>
          <Link href="/requests/new" className="shrink-0">
            <Button>
              <Sparkles size={16} />
              Request Help
            </Button>
          </Link>
        </div>
      </div>

      {/* At a glance */}
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Your requests */}
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
            <Card className="p-10 text-center">
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
            const target = orderId ? `/orders/${orderId}` : `/requests/${r.id}`;
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
                        <Badge variant={meta.variant} dot>{meta.label}</Badge>
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
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg bg-warning/10 border border-warning/40 px-3 py-2.5">
                    <p className="text-xs text-on-surface inline-flex items-center gap-1.5">
                      <RefreshCcw size={13} className="text-warning" />
                      This helper hasn&apos;t responded in 2 hours.
                    </p>
                    <Link href={`/requests/${r.id}?resend=1`} className="text-xs font-semibold text-primary min-h-11 -my-2 inline-flex items-center hover:underline">
                      Choose a different helper
                    </Link>
                  </div>
                )}
              </Card>
            );
          })}
        </section>

        {/* Recent activity */}
        <section>
          <div className="flex items-center justify-between gap-4 mb-3">
            <h2 className="font-display font-bold text-lg text-on-surface">Recent Activity</h2>
            <Link href="/notifications" className="text-sm font-semibold text-primary min-h-11 -my-2 inline-flex items-center hover:underline">
              View all
            </Link>
          </div>
          <Card className="divide-y divide-outline-variant/50 overflow-hidden">
            {notifications.length === 0 && (
              <PanelEmpty
                icon={<Sparkles size={18} className="text-primary" />}
                title="No notifications yet"
                message="Request updates, proposal alerts and payment confirmations will show up here."
                actionHref="/requests/new"
                actionLabel="Start a request"
              />
            )}
            {notifications.map((n) => (
              <Link href={n.link ?? "/notifications"} key={n.id} className="flex items-start gap-3 p-4 hover:bg-surface-container-low transition-colors">
                <div className="min-w-0 flex-1">
                  <p className={`text-sm line-clamp-2 ${n.read ? "text-on-surface-variant" : "font-semibold text-on-surface"}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1">{timeAgo(n.created_at)}</p>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-primary-container shrink-0 mt-1.5" />}
              </Link>
            ))}
          </Card>
        </section>
      </div>
    </div>
  );
}