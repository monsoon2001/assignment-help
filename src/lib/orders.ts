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
  try {
    const response = await fetch("/api/proposals/decline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposal_id, request_id }),
    });
    const data = (await response.json().catch(() => null)) as {
      ok?: boolean;
      error?: string;
    } | null;
    if (!response.ok || data?.ok !== true) {
      return { error: data?.error ?? "Could not decline this proposal. Please try again." };
    }
  } catch (error) {
    console.error("proposal decline request failed", error);
    return { error: "Could not decline this proposal. Please try again." };
  }

  notifyActivity("proposal.declined", proposal_id);
  return { ok: true };
}
