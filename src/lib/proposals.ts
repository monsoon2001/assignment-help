import { createClient } from "@/lib/supabase/client";
import { normalizeCurrency } from "@/lib/currency";
import { notifyActivity } from "@/lib/notify-client";

export interface NewProposalInput {
  request_id: string;
  price: number;
  currency?: string;
  description?: string;
  revisions_included?: number;
  expires_at?: string | null;
}

export async function submitProposal(
  input: NewProposalInput,
): Promise<{ id: string } | { error: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be signed in to send a proposal." };
  }

  const price = Math.round(input.price);
  if (!Number.isFinite(input.price) || !Number.isSafeInteger(price) || price <= 0) {
    return { error: "Enter a valid whole-number proposal price." };
  }

  // If a previous proposal was declined, allow resubmitting by updating it.
  const { data: existing } = await supabase
    .from("proposals")
    .select("id, status")
    .eq("request_id", input.request_id)
    .eq("helper_id", user.id)
    .maybeSingle();

  let resultId: string;
  if (existing && existing.status === "declined") {
    const { data, error } = await supabase
      .from("proposals")
      .update({
        price,
        currency: normalizeCurrency(input.currency),
        description: input.description ?? null,
        revisions_included: input.revisions_included ?? 0,
        expires_at: input.expires_at ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: "pending",
      })
      .eq("id", existing.id)
      .select("id")
      .single();
    if (error) return { error: error.message };
    resultId = data.id;
  } else if (existing) {
    return { error: "You already sent a proposal for this request." };
  } else {
    const { data, error } = await supabase
      .from("proposals")
      .insert({
        request_id: input.request_id,
        helper_id: user.id,
        price,
        currency: normalizeCurrency(input.currency),
        description: input.description ?? null,
        revisions_included: input.revisions_included ?? 0,
        expires_at: input.expires_at ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
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
    resultId = data.id;
  }

  const { error: updateError } = await supabase
    .from("requests")
    .update({ status: "proposal_sent" })
    .eq("id", input.request_id);

  if (updateError) {
    return { error: updateError.message };
  }

  notifyActivity("proposal.created", resultId);
  return { id: resultId };
}
