import { createClient } from "@/lib/supabase/client";

export interface ProposalForAccept {
  proposal_id: string;
  helper_id: string;
  request_id: string;
  price: number;
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

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      proposal_id: input.proposal_id,
      student_id: user.id,
      helper_id: input.helper_id,
      status: "payment_pending",
      price: input.price,
      deadline: input.request_deadline ?? null,
    })
    .select("id")
    .single();

  if (orderError) {
    return { error: orderError.message };
  }

  const { error: requestError } = await supabase
    .from("requests")
    .update({ status: "accepted" })
    .eq("id", input.request_id);

  if (requestError) {
    return { error: requestError.message };
  }

  const { error: proposalError } = await supabase
    .from("proposals")
    .update({ status: "accepted" })
    .eq("id", input.proposal_id);

  if (proposalError) {
    return { error: proposalError.message };
  }

  return { orderId: order.id };
}

export async function declineProposal(
  proposal_id: string,
  request_id: string
): Promise<{ ok: true } | { error: string }> {
  const supabase = createClient();

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