import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, FileText, CheckCircle2, Users, RefreshCcw } from "lucide-react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import RequestsList, { type StudentRequestRow } from "./requests-list";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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

  const real: StudentRequestRow[] = (requests ?? []).map((r) => {
    const helper = Array.isArray(r.helper) ? (r.helper[0] ?? null) : r.helper;
    return {
      id: r.id,
      title: r.title,
      subject: r.subject,
      description: r.description,
      deadline: r.deadline,
      file_urls: r.file_urls ?? [],
      status: r.status,
      created_at: r.created_at,
      sent_at: r.sent_at,
      helper: helper ? { id: helper.id, name: helper.name } : null,
    };
  });

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

  const proposals = (proposalRows ?? []) as unknown as (ProposalRow)[];

  const acceptedProposalIds = proposals
    .filter((p) => p.status === "accepted")
    .map((p) => p.id) as string[];

  const { data: orderRows } =
    acceptedProposalIds.length > 0 && acceptedProposalIds.length <= 320
      ? await supabase
          .from("orders")
          .select("id, proposal_id, status")
          .in("proposal_id", acceptedProposalIds)
      : { data: null };

  const requestIdByProposal = new Map(proposals.map((p) => [p.id, p.request_id]));
  const orderByProposal: Record<string, string> = {};
  const orderStatusByRequest: Record<string, string> = {};
  for (const o of (orderRows ?? []) as { id: string; proposal_id: string; status: string }[]) {
    orderByProposal[o.proposal_id] = o.id;
    const requestId = requestIdByProposal.get(o.proposal_id);
    if (requestId) orderStatusByRequest[requestId] = o.status;
  }

  const proposalsByRequest: Record<string, ProposalRow[]> = {};
  for (const raw of proposals) {
    const p = {
      ...raw,
      helper: Array.isArray(raw.helper) ? (raw.helper[0] ?? null) : raw.helper,
    };
    const list = proposalsByRequest[p.request_id] ?? [];
    list.push(p);
    proposalsByRequest[p.request_id] = list;
  }

  const activeCount = real.filter((r) =>
    ["requested", "proposal_sent", "accepted"].includes(r.status)
  ).length;
  const awaitingCount = real.filter((r) => r.status === "requested").length;

  const stats = [
    { icon: FileText, label: "Active Requests", value: String(activeCount), tone: "bg-primary-container text-on-primary" },
    { icon: CheckCircle2, label: "Awaiting Proposals", value: String(awaitingCount), tone: "bg-success text-white" },
    { icon: Users, label: "Total Requests", value: String(real.length), tone: "bg-secondary-container text-on-secondary-container" },
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

      <RequestsList
        requests={real}
        proposalsByRequest={proposalsByRequest}
        orderByProposal={orderByProposal}
        orderStatusByRequest={orderStatusByRequest}
      />

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

type ProposalRow = import("@/components/requests/proposal-card").RequestProposal & {
  helper: { id: string; name: string | null } | { id: string; name: string | null }[] | null;
};