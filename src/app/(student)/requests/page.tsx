import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Search, SlidersHorizontal, FileText, RefreshCcw, ChevronLeft, ChevronRight, Clock, CheckCircle2, Users, CalendarDays, Paperclip } from "lucide-react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import ProposalCard, { type RequestProposal } from "@/components/requests/proposal-card";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const STATUS_META: Record<
  string,
  { label: string; variant: "primary" | "secondary" | "success" | "warning" | "danger" | "outline" }
> = {
  requested: { label: "Requested", variant: "primary" },
  proposal_sent: { label: "Reviewing Proposals", variant: "warning" },
  accepted: { label: "Hired", variant: "success" },
  declined: { label: "Declined", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "outline" },
};

function refCode(id: string) {
  return `#PC-${id.replace(/-/g, "").slice(0, 5).toUpperCase()}`;
}

function formatDate(value: string | null): string {
  if (!value) return "Flexible";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function isPastResponseWindow(sentAt: string | null): boolean {
  return !!sentAt && Date.now() - new Date(sentAt).getTime() > 2 * 60 * 60 * 1000;
}

const tabs = ["All Requests", "In Progress", "Delivered & Review", "Completed"];

export default async function RequestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: requests } = await supabase
    .from("requests")
    .select("id, title, subject, description, deadline, file_urls, status, created_at, sent_at, helper:users!requests_helper_id_fkey(id, name)")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  const real = requests ?? [];

  const requestIdsForProposals = real
    .filter((r) => ["proposal_sent", "accepted"].includes(r.status))
    .map((r) => r.id);

  const { data: proposalRows } =
    requestIdsForProposals.length > 0
      ? await supabase
          .from("proposals")
          .select("id, request_id, helper_id, price, currency, description, revisions_included, expires_at, status, created_at, helper:users(id, name)")
          .in("request_id", requestIdsForProposals)
      : { data: null };

  const acceptedProposalIds = (proposalRows ?? [])
    .filter((p) => p.status === "accepted")
    .map((p) => p.id) as string[];

  const { data: orderRows } =
    acceptedProposalIds.length > 0 && acceptedProposalIds.length <= 320
      ? await supabase
          .from("orders")
          .select("id, proposal_id")
          .in("proposal_id", acceptedProposalIds)
      : { data: null };

  const orderByProposal = new Map<string, string>();
  for (const o of (orderRows ?? []) as { id: string; proposal_id: string }[]) {
    orderByProposal.set(o.proposal_id, o.id);
  }

  const proposalsByRequest = new Map<string, RequestProposal[]>();
  for (const raw of (proposalRows ?? []) as unknown as RequestProposal[]) {
    const p: RequestProposal = {
      ...raw,
      helper: Array.isArray(raw.helper) ? (raw.helper[0] ?? null) : raw.helper,
    };
    const list = proposalsByRequest.get(p.request_id) ?? [];
    list.push(p);
    proposalsByRequest.set(p.request_id, list);
  }

  const activeCount = real.filter((r) =>
    ["requested", "proposal_sent", "accepted"].includes(r.status)
  ).length;
  const awaitingCount = real.filter((r) => r.status === "requested").length;
  const totalCount = real.length;

  const stats = [
    { icon: FileText, label: "Active Requests", value: String(activeCount), tone: "bg-primary-container text-on-primary" },
    { icon: CheckCircle2, label: "Awaiting Proposals", value: String(awaitingCount), tone: "bg-success text-white" },
    { icon: Users, label: "Total Requests", value: String(totalCount), tone: "bg-secondary-container text-on-secondary-container" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-on-surface">My Requests</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">Track help requests, deliveries, and revisions</p>
        </div>
        <Link href="/requests/new">
          <Button size="lg" className="justify-between">
            New Request <Plus size={16} />
          </Button>
        </Link>
      </section>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              i === 0
                ? "bg-primary-container text-on-primary"
                : "bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex-1 flex items-center gap-2 bg-surface-container-lowest border border-outline-variant rounded-lg px-3.5 py-2.5 max-w-md">
          <Search size={16} className="text-on-surface-variant" />
          <input placeholder="Search by title, subject, or request ID..." className="bg-transparent outline-none flex-1 text-sm text-on-surface placeholder:text-outline" />
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm font-medium text-on-surface hover:bg-surface-container-low cursor-pointer">
            <SlidersHorizontal size={15} />
            Subject
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm font-medium text-on-surface hover:bg-surface-container-low cursor-pointer">
            <Clock size={15} />
            Newest first
          </button>
        </div>
      </div>

      {real.length === 0 && (
        <div className="flex flex-col items-center gap-3 p-10 rounded-xl bg-surface-container-low border border-outline-variant text-center">
          <span className="w-14 h-14 rounded-2xl bg-primary-container/10 flex items-center justify-center">
            <FileText size={26} className="text-primary" />
          </span>
          <div>
            <h3 className="font-semibold text-on-surface">No requests yet</h3>
            <p className="text-sm text-on-surface-variant mt-1">
              Submit your first help request and choose the helper right for you.
            </p>
          </div>
          <Link href="/requests/new">
            <Button>
              Create Your First Request <Plus size={15} />
            </Button>
          </Link>
        </div>
      )}

      <section className="flex flex-col gap-4">
        {real.map((r) => {
          const meta = STATUS_META[r.status] ?? { label: r.status, variant: "outline" as const };
          const proposals = proposalsByRequest.get(r.id) ?? [];
          const helper = Array.isArray(r.helper) ? (r.helper[0] ?? null) : r.helper;
          const overdue =
            r.status === "requested" && isPastResponseWindow(r.sent_at);
          return (
            <div key={r.id} className="flex flex-col gap-3">
              {overdue && (
                <div className="p-4 rounded-xl border border-warning/50 bg-warning-container/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <RefreshCcw size={17} className="text-warning shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-on-surface">This helper hasn&apos;t responded</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        It&apos;s been over 2 hours — choose a different helper to keep this moving.
                      </p>
                    </div>
                  </div>
                  <Link href={`/requests/${r.id}?resend=1`}>
                    <Button size="sm" variant="outline" className="shrink-0">
                      Choose a different helper
                    </Button>
                  </Link>
                </div>
              )}
              <Card hover className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <Avatar name={r.subject || r.title} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-display font-semibold text-on-surface truncate">{r.title}</h3>
                      <Badge variant={meta.variant} dot>
                        {meta.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1 truncate">
                      {refCode(r.id)} · {r.subject || "General"} · Requested {formatDate(r.created_at)}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-on-surface-variant">
                      <span className="inline-flex items-center gap-1"><CalendarDays size={11} /> Due {formatDate(r.deadline)}</span>
                      {r.file_urls.length > 0 && (
                        <span className="inline-flex items-center gap-1"><Paperclip size={11} /> {r.file_urls.length} attachment{r.file_urls.length > 1 ? "s" : ""}</span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Users size={11} /> {helper?.name ?? "No helper yet"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-5 lg:ml-auto shrink-0">
                  {r.description && (
                    <div className="hidden md:block max-w-[280px]">
                      <p className="text-xs text-on-surface-variant line-clamp-2">{r.description}</p>
                    </div>
                  )}
                  <Link href={`/requests/${r.id}`}>
                    <Button size="sm">
                      <RefreshCcw size={13} /> Open Chat
                    </Button>
                  </Link>
                  <Link href={`/requests/sent?id=${r.id}`}>
                    <Button variant="outline" size="sm">
                      View Request
                    </Button>
                  </Link>
                </div>
              </div>
              </Card>
              {proposals.length > 0 && (
                <div className="flex flex-col gap-2 px-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Proposals ({proposals.length})
                  </p>
                  {proposals.map((p) => (
                    <ProposalCard
                      key={p.id}
                      proposal={p}
                      requestTitle={r.title}
                      requestDeadline={r.deadline}
                      orderId={orderByProposal.get(p.id) ?? null}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </section>

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-on-surface-variant">
          Showing {real.length === 0 ? 0 : 1}–{real.length} of {real.length} request{real.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-1">
          <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low cursor-pointer">
            <ChevronLeft size={16} />
          </button>
          <button className={`w-9 h-9 rounded-lg text-sm font-medium cursor-pointer ${real.length > 0 ? "bg-primary-container text-on-primary" : "text-on-surface-variant hover:bg-surface-container-low"}`}>
            1
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low cursor-pointer">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <Card className="p-5 flex items-start gap-3 bg-surface-container-low border border-outline-variant">
        <RefreshCcw size={18} className="text-primary shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-sm text-on-surface">Revision policy</h3>
          <p className="text-xs leading-relaxed text-on-surface-variant mt-1">
            Revisions are <span className="font-semibold text-on-surface">unlimited until you&apos;re fully satisfied</span>{" "}
            with the delivered work. Helpers are expected to address scope-matching feedback; entirely new
            requirements may open a new request. Disputes are mediated by the Academic Integrity Office.
          </p>
        </div>
      </Card>
    </div>
  );
}