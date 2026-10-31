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
): Promise<{ id: string; revised: boolean } | { error: string }> {
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

  const { data, error } = await supabase.rpc("submit_or_revise_proposal", {
    p_request_id: input.request_id,
    p_price: price,
    p_currency: normalizeCurrency(input.currency),
    p_description: input.description ?? null,
    p_revisions_included: input.revisions_included ?? 0,
  });
  if (error) return { error: error.message };

  const result = data as { id?: unknown; revised?: unknown } | null;
  if (typeof result?.id !== "string" || typeof result.revised !== "boolean") {
    return { error: "The proposal was saved, but its result could not be confirmed." };
  }

  notifyActivity(result.revised ? "proposal.revised" : "proposal.created", result.id);
  return { id: result.id, revised: result.revised };
}
