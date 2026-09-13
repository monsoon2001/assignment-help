"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2, CalendarDays, Timer, ShieldCheck, RotateCcw, Loader2, DollarSign,
} from "lucide-react";
import Button from "@/components/ui/button";
import Avatar from "@/components/ui/avatar";
import { acceptProposal, declineProposal } from "@/lib/orders";
import { normalizeCurrency, formatCurrency } from "@/lib/currency";

export type RequestProposal = {
  id: string;
  request_id: string;
  helper_id: string;
  price: number;
  currency?: string | null;
  description: string | null;
  revisions_included: number;
  expires_at: string | null;
  status: string;
  created_at: string;
  helper: { id: string; name: string | null } | null;
};

function expiryLabel(value: string | null): string {
  if (!value) return "No expiry";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const ACTIONS: Record<string, { label: string; variant: "primary" | "success" | "outline" }> = {
  pending: { label: "Pending", variant: "primary" },
  accepted: { label: "Accepted", variant: "success" },
  declined: { label: "Declined", variant: "outline" },
};

export default function ProposalCard({
  proposal,
  requestTitle,
  requestDeadline,
  orderId,
}: {
  proposal: RequestProposal;
  requestTitle?: string | null;
  requestDeadline?: string | null;
  orderId?: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"accept" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currency = normalizeCurrency(proposal.currency);
  const price = formatCurrency(Number(proposal.price), currency);

  const statusMeta = ACTIONS[proposal.status] ?? { label: proposal.status, variant: "primary" as const };

  async function handleAccept() {
    setBusy("accept");
    setError(null);
    const result = await acceptProposal({
      proposal_id: proposal.id,
      helper_id: proposal.helper_id,
      request_id: proposal.request_id,
      price: Number(proposal.price),
      currency,
      request_deadline: requestDeadline ?? null,
    });
    setBusy(null);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    router.push(`/orders/${result.orderId}/payment`);
  }

  async function handleDecline() {
    setBusy("decline");
    setError(null);
    const result = await declineProposal(proposal.id, proposal.request_id);
    setBusy(null);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm overflow-hidden">
      <div className="relative p-4 sm:p-5 flex flex-col gap-4">
        <div className="absolute -top-20 -right-16 h-40 w-40 rounded-full bg-primary-fixed/20 blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-container/10 text-primary text-[11px] font-semibold uppercase tracking-wide">
            <ShieldCheck size={14} />
            Official Mentor Proposal
          </div>
          <span className="text-[11px] text-on-surface-variant font-medium">
            #{proposal.id.replace(/-/g, "").slice(0, 5).toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg bg-surface-container-low p-3">
          <div className="flex flex-col justify-center">
            <span className="text-[11px] text-secondary uppercase font-semibold tracking-wider">
              Total Fixed Price
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-display text-2xl font-bold text-primary tracking-tight">
                {price}
              </span>
              <span className="text-[11px] text-on-surface-variant font-medium">{currency}</span>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-0.5">
              No hidden charges &middot; Pay securely on the platform
            </p>
          </div>
          <div className="flex flex-col justify-center sm:pl-3">
            <span className="text-[11px] text-secondary uppercase font-semibold tracking-wider">
              Offer Details
            </span>
            <div className="flex items-center gap-2 mt-1">
              <Timer size={15} className="text-primary" />
              <span className="text-sm font-medium text-on-surface">
                Expires {expiryLabel(proposal.expires_at)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-on-surface-variant text-[11px] mt-0.5">
              <RotateCcw size={12} />
              Unlimited revisions until you&apos;re satisfied
            </div>
          </div>
        </div>

        {proposal.description && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-on-surface">
                Included in this Proposal
              </h4>
              <span className="text-[11px] text-primary font-medium">
                Proposal Message
              </span>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed bg-surface-container-low p-2.5 rounded">
              {proposal.description}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
          <span>
            <span className="font-semibold text-on-surface">Unlimited revisions</span>{" "}
            until you&apos;re fully satisfied with the delivered work, at zero supplemental cost.
          </span>
          <span className="text-outline-variant">&middot;</span>
          <CalendarDays size={14} className="shrink-0" />
          <span>{requestTitle || "Delivery"} coordinated in workspace chat.</span>
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 sm:px-5 pb-4">
        <Avatar name={proposal.helper?.name || "Helper"} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-on-surface truncate">
            {proposal.helper?.name || "PeerCraft Helper"}
          </p>
          <p className="text-[11px] text-on-surface-variant">
            Proposed {new Date(proposal.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        </div>
        {orderId && proposal.status === "accepted" && (
          <Button size="sm" onClick={() => router.push(`/orders/${orderId}`)}>
            Open Order
          </Button>
        )}
      </div>

      <div className="border-t border-outline-variant px-4 sm:px-5 py-4">
        {proposal.status === "pending" ? (
          <div className="flex flex-col gap-2">
            {error && <p className="text-sm text-error">{error}</p>}
            <div className="flex flex-col-reverse sm:flex-row items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full sm:w-auto text-error hover:bg-error-container/20"
                disabled={busy !== null}
                onClick={handleDecline}
              >
                {busy === "decline" ? <Loader2 size={15} className="animate-spin" /> : null}
                Decline Proposal
              </Button>
              <Button
                size="sm"
                className="w-full sm:w-auto"
                disabled={busy !== null}
                onClick={handleAccept}
              >
                {busy === "accept" ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <DollarSign size={15} />
                )}
                {busy === "accept" ? "Accepting..." : "Accept & Continue to Checkout"}
              </Button>
            </div>
            <p className="text-[11px] text-on-surface-variant inline-flex items-center gap-1">
              <ShieldCheck size={12} className="text-primary shrink-0" />
              Funds are released only after you review and approve the finalized draft.
            </p>
          </div>
        ) : (
          <p className="text-sm font-medium text-on-surface-variant">
            Proposal {statusMeta.label.toLowerCase()}.
          </p>
        )}
      </div>
    </div>
  );
}