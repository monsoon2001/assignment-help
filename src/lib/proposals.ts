import { createClient } from "@/lib/supabase/client";

export interface NewProposalInput {
  request_id: string;
  price: number;
  description?: string;
  revisions_included?: number;
  expires_at?: string | null;
}

export async function submitProposal(
  input: NewProposalInput
): Promise<{ id: string } | { error: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be signed in to send a proposal." };
  }

  const { data, error } = await supabase
    .from("proposals")
    .insert({
      request_id: input.request_id,
      helper_id: user.id,
      price: input.price,
      description: input.description ?? null,
      revisions_included: input.revisions_included ?? 0,
      expires_at: input.expires_at ?? null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "You already sent a proposal for this request." };
    }
    return { error: error.message };
  }

  const { error: updateError } = await supabase
    .from("requests")
    .update({ status: "proposal_sent" })
    .eq("id", input.request_id);

  if (updateError) {
    return { error: updateError.message };
  }

  return { id: data.id };
}