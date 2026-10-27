import { createClient } from "@/lib/supabase/client";
import { notifyActivity } from "@/lib/notify-client";

export interface ProposalForAccept {
  proposal_id: string;
  helper_id: string;
  request_id: string;
  price: number;
  currency?: string | null;
  request_deadline?: string | null;
}

/**
 * Accepts a proposal through the server so the local charge currency/amount is
 * derived and locked on the order authoritatively. The client-supplied price
 * and currency are ignored.
 */
export async function acceptProposal(
  input: ProposalForAccept,
): Promise<{ orderId: string } | { error: string }> {
  try {
    const res = await fetch("/api/orders/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        proposal_id: input.proposal_id,
        request_id: input.request_id,
      }),
    });

    const data = (await res.json().catch(() => null)) as {
      orderId?: string;
      error?: string;
    } | null;

    if (!res.ok || !data?.orderId) {
      return { error: data?.error ?? "Could not accept this proposal. Please try again." };
    }
    return { orderId: data.orderId };
  } catch {
    return { error: "Could not accept this proposal. Please try again." };
  }
}

export async function declineProposal(
  proposal_id: string,
  request_id: string,
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
    await supabase.from("requests").update({ status: "requested" }).eq("id", request_id);
  }

  notifyActivity("proposal.declined", proposal_id);
  return { ok: true };
}
