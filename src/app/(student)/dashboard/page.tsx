import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, FileText, CheckCircle2, Sparkles, Users, Clock, RefreshCcw } from "lucide-react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import StarRating from "@/components/ui/star-rating";
import { createClient } from "@/lib/supabase/server";
import { unwrapRow } from "@/lib/embedded";

export const dynamic = "force-dynamic";

const STATUS_META: Record<
  string,
  { label: string; variant: "primary" | "warning" | "success" | "outline" }
> = {
  requested: { label: "Requested", variant: "primary" },
  proposal_sent: { label: "Reviewing Proposals", variant: "warning" },
  accepted: { label: "Hired", variant: "success" },
  declined: { label: "Declined", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "outline" },
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

  const [{ data: reqRows }, { data: completedOrders }, { data: notifRows }, { data: helperRows }] =
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
      supabase
        .from("users")
        .select("id, name, avatar_url, helper_profiles(rating_avg, subjects)")
        .eq("role", "helper")
        .order("helper_profiles(rating_avg)", { ascending: false, foreignTable: "helper_profiles" })
        .limit(4),
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

  const stats = [
    { icon: FileText, label: "Active Requests", value: String(activeCount), tone: "bg-primary-container text-on-primary" },
    { icon: Clock, label: "Awaiting Response", value: String(awaitingCount), tone: "bg-secondary-container text-on-secondary-container" },
    { icon: CheckCircle2, label: "Completed Orders", value: String(completedCount), tone: "bg-emerald-100 text-emerald-700" },
  ];

  const helpers = (helperRows ?? []).map((h) => ({
    id: h.id,
    name: h.name ?? "PeerCraft Helper",
    avatar_url: h.avatar_url,
    rating_avg: Number(unwrapRow<{ rating_avg: number }>(h.helper_profiles)?.rating_avg ?? 0),
    reviewCount: 0,
  }));

  const notifications = (notifRows ?? []) as NotifRow[];
  const nextAction = requests.find((r) =>
    ["requested", "proposal_sent", "accepted"].includes(r.status)
  );

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      <section className="rounded-2xl bg-gradient-to-br from-primary-container to-secondary-container text-on-primary p-8 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute right-24 bottom-0 w-20 h-20 rounded-full bg-white/10" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-on-primary/80 mb-1">
              Academic Workspace
            </p>
            <h1 className="font-display font-bold text-3xl">Welcome back, {firstName}</h1>
            <p className="text-on-primary/80 text-sm mt-1.5">
              {nextAction
                ? `"${nextAction.title}" is ${STATUS_META[nextAction.status]?.label.toLowerCase() ?? "in progress"}.`
                : "Submit a request to get matched with the right helper."}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/browse-helpers">
              <Button variant="outline" className="bg-surface-container-lowest/10 border-white/40 text-on-primary hover:bg-white/20">
                <Users size={16} />
                Browse Helpers
              </Button>
            </Link>
            <Link href="/requests/new">
              <Button variant="ghost" className="bg-white text-primary-container hover:bg-surface-container-lowest">
                <Sparkles size={16} />
                Request Help
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-5 flex items-center gap-4">
              <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.tone}`}>
                <Icon size={20} />
              </span>
              <div>
                <p className="text-2xl font-display font-bold text-on-surface">{s.value}</p>
                <p className="text-xs text-on-surface-variant">{s.label}</p>
              </div>
            </Card>
          );
        })}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-on-surface">Your Current Work</h2>
            <Link href="/requests" className="text-sm font-semibold text-primary inline-flex items-center gap-1 hover:underline">
              View all <ArrowRight size={14} />
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
            const meta = STATUS_META[r.status] ?? { label: r.status, variant: "outline" as const };
            const proposalId = acceptedByRequest.get(r.id);
            const orderId = proposalId ? orderByProposal.get(proposalId) : undefined;
            const overdue = r.status === "requested" && isPastResponseWindow(r.sent_at);
            return (
              <Card key={r.id} hover className="p-5">
                <div className="flex items-center justify-between gap-4">
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
                  <div className="flex items-center gap-2 shrink-0">
                    {orderId ? (
                      <Link href={`/orders/${orderId}`}>
                        <Button size="sm" variant="outline">Open Order <ArrowRight size={14} /></Button>
                      </Link>
                    ) : (
                      <Link href={`/requests/${r.id}`}>
                        <Button size="sm" variant="outline">Open Chat <ArrowRight size={14} /></Button>
                      </Link>
                    )}
                  </div>
                </div>
                {overdue && (
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg bg-warning-container/20 border border-warning/40 px-3 py-2.5">
                    <p className="text-xs text-on-surface inline-flex items-center gap-1.5">
                      <RefreshCcw size={13} className="text-warning" />
                      This helper hasn&apos;t responded in 2 hours.
                    </p>
                    <Link href={`/requests/${r.id}?resend=1`} className="text-xs font-semibold text-primary hover:underline">
                      Choose a different helper
                    </Link>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <h2 className="font-display font-bold text-lg text-on-surface mb-3">Recent Activity</h2>
            <Card className="divide-y divide-outline-variant/50 overflow-hidden">
              {notifications.length === 0 && (
                <p className="text-sm text-on-surface-variant p-4">No notifications yet.</p>
              )}
              {notifications.map((n) => (
                <Link href={n.link ?? "/notifications"} key={n.id} className="flex items-start gap-3 p-4 hover:bg-surface-container-low transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm line-clamp-2 ${n.read ? "text-on-surface-variant" : "font-semibold text-on-surface"}`}>
                      {n.message}
                    </p>
                    <p className="text-[11px] text-on-surface-variant mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary-container shrink-0 mt-1.5" />}
                </Link>
              ))}
            </Card>
            <Link href="/notifications" className="inline-block mt-2 text-sm font-semibold text-primary hover:underline">
              View all notifications
            </Link>
          </div>

          <div>
            <h2 className="font-display font-bold text-lg text-on-surface mb-3">Top-Rated Helpers</h2>
            <Card className="divide-y divide-outline-variant/50 overflow-hidden">
              {helpers.length === 0 && (
                <p className="text-sm text-on-surface-variant p-4">No helpers yet.</p>
              )}
              {helpers.map((m) => (
                <div key={m.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.name} size="md" src={m.avatar_url ?? undefined} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">{m.name}</p>
                      <p className="text-xs text-on-surface-variant truncate">PeerCraft verified helper</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <StarRating rating={m.rating_avg} size={14} />
                    <Link href={`/helpers/${m.id}`} className="text-xs font-semibold text-primary hover:underline">
                      View profile
                    </Link>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}