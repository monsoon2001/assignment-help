import { createClient } from "@/lib/supabase/client";
import { unwrapRow } from "@/lib/embedded";

export interface ProposalForAccept {
  proposal_id: string;
  helper_id: string;
  request_id: string;
  price: number;
  currency?: string | null;
  request_deadline?: string | null;
}

export async function acceptProposal(
  input: ProposalForAccept
): Promise<{ orderId: string } | { error: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be signed in to accept a proposal." };
  }

  // Never trust client-supplied proposal fields. Pull the authoritative values
  // from the DB and verify the student actually owns the request.
  const { data: proposal, error: proposalError } = await supabase
    .from("proposals")
    .select(
      "id, helper_id, price, currency, status, request:requests(id, student_id, status, deadline)"
    )
    .eq("id", input.proposal_id)
    .maybeSingle();

  if (proposalError || !proposal) {
    return { error: "Proposal not found." };
  }
  const request = unwrapRow<{ id: string; student_id: string; status: string; deadline: string | null }>(proposal.request);
  if (!request) {
    return { error: "Proposal not found." };
  }
  if (proposal.status !== "pending") {
    return { error: "This proposal can no longer be accepted." };
  }
  if (request.student_id !== user.id) {
    return { error: "You can only accept proposals on your own requests." };
  }
  if (request.id !== input.request_id) {
    return { error: "Proposal does not match this request." };
  }
  if (request.status !== "requested" && request.status !== "proposal_sent") {
    return { error: "This request has already been resolved." };
  }

  const { data: order, error: insertError } = await supabase
    .from("orders")
    .insert({
      proposal_id: input.proposal_id,
      student_id: user.id,
      helper_id: proposal.helper_id,
      status: "payment_pending",
      price: proposal.price,
      currency: proposal.currency ?? "USD",
      deadline: request.deadline ?? null,
    })
    .select("id")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      return { error: "This proposal has already been accepted." };
    }
    return { error: insertError.message };
  }

  const { error: requestError } = await supabase
    .from("requests")
    .update({ status: "accepted" })
    .eq("id", input.request_id);

  if (requestError) {
    return { error: requestError.message };
  }

  const { error: proposalError2 } = await supabase
    .from("proposals")
    .update({ status: "accepted" })
    .eq("id", input.proposal_id);

  if (proposalError2) {
    return { error: proposalError2.message };
  }

  return { orderId: order.id };
}

export async function declineProposal(
  proposal_id: string,
  request_id: string
): Promise<{ ok: true } | { error: string }> {
  const supabase = createClient();

  const { data: proposal } = await supabase
    .from("proposals")
    .select("id, status")
    .eq("id", proposal_id)
    .maybeSingle();

  if (!proposal || proposal.status !== "pending") {
    return { error: "This proposal has already been resolved." };
  }

  const { error } = await supabase
    .from("proposals")
    .update({ status: "declined" })
    .eq("id", proposal_id);

  if (error) {
    return { error: error.message };
  }

  const { count, error: countError } = await supabase
    .from("proposals")
    .select("id", { count: "exact", head: true })
    .eq("request_id", request_id)
    .eq("status", "pending");

  if (!countError && (count ?? 0) === 0) {
    await supabase
      .from("requests")
      .update({ status: "requested" })
      .eq("id", request_id);
  }

  return { ok: true };
}