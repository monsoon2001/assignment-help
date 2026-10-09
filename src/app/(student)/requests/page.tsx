import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, RefreshCcw } from "lucide-react";
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
  const orderStatusByRequest: Record<string, string> = {};
  for (const o of (orderRows ?? []) as { id: string; proposal_id: string; status: string }[]) {
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

  const counts = {
    all: real.length,
    in_progress: real.filter((r) => ["requested", "proposal_sent", "accepted"].includes(r.status)).length,
    delivered: real.filter((r) => orderStatusByRequest[r.id] === "delivered").length,
    completed: real.filter(
      (r) => orderStatusByRequest[r.id] === "completed" || ["declined", "cancelled"].includes(r.status)
    ).length,
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
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
        orderStatusByRequest={orderStatusByRequest}
        counts={counts}
      />

      <Card className="p-5 flex items-start gap-3 bg-surface-container-low border border-outline-variant">
        <RefreshCcw size={18} className="text-primary shrink-0 mt-0.5" />
        <div>
          <h2 className="font-semibold text-sm text-on-surface">Revision policy</h2>
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