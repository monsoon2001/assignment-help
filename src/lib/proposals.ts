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
): Promise<{ id: string; revised: boolean; finalCad?: number } | { error: string }> {
  const price = Math.round(input.price);
  if (!Number.isFinite(input.price) || !Number.isSafeInteger(price) || price <= 0) {
    return { error: "Enter a valid whole-number proposal price." };
  }

  try {
    const res = await fetch("/api/proposals/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        request_id: input.request_id,
        price,
        currency: input.currency ?? "CAD",
        description: input.description ?? null,
        revisions_included: input.revisions_included ?? 0,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data || data.error) {
      return { error: data?.error ?? "Could not send quote. Please try again." };
    }

    notifyActivity(data.revised ? "proposal.revised" : "proposal.created", data.id);
    return { id: data.id, revised: data.revised, finalCad: data.finalCad };
  } catch (err) {
    console.error("submitProposal failed:", err);
    return { error: "Network error submitting proposal." };
  }
}
