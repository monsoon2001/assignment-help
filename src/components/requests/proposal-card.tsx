"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Timer, ShieldCheck, Loader2, DollarSign } from "lucide-react";
import Button from "@/components/ui/button";
import Avatar from "@/components/ui/avatar";
import { acceptProposal, declineProposal } from "@/lib/orders";
import {
  computeLocalCharge,
  normalizeCurrency,
  formatCurrency,
  DEFAULT_CURRENCY,
} from "@/lib/currency";
import { proposalStatusMeta } from "@/lib/status-meta";
import { ACADIVO_HELPER_NAME } from "@/lib/avatars";

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
  if (!value) return "in 24 hours";
  const ms = new Date(value).getTime() - Date.now();
  if (ms <= 0) return "expired";
  const hours = Math.round(ms / 3_600_000);
  if (hours <= 24) {
    const h = Math.max(1, hours);
    return `in ${h} hour${h > 1 ? "s" : ""}`;
  }
  const days = Math.round(hours / 24);
  return `in ${days} day${days > 1 ? "s" : ""}`;
}

export default function ProposalCard({
  proposal,
  requestDeadline,
  orderId,
  orderStatus,
  orderPaid = false,
  localCurrency = DEFAULT_CURRENCY,
  rates = null,
  surchargePercent = 0,
  className = "",
  onDeclined,
}: {
  proposal: RequestProposal;
  requestTitle?: string | null;
  requestDeadline?: string | null;
  orderId?: string | null;
  orderStatus?: string | null;
  orderPaid?: boolean;
  localCurrency?: string;
  rates?: Record<string, number> | null;
  surchargePercent?: number;
  className?: string;
  onDeclined?: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"accept" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currency = normalizeCurrency(proposal.currency);
  const basePrice = Number(proposal.price);

  // Show the student what they will actually be charged, in their local
  // currency. Falls back to the helper's quoted amount when no local rate is
  // available. No CAD equivalent is shown.
  const localAmount = computeLocalCharge(
    basePrice,
    currency,
    localCurrency,
    rates,
    surchargePercent,
  );
  const localResolved =
    localAmount !== null && localAmount > 0
      ? { currency: localCurrency, amount: localAmount }
      : null;

  const displayAmount = localResolved ? localResolved.amount : basePrice;
  const displayCurrency = localResolved ? localResolved.currency : currency;
  const price = formatCurrency(displayAmount, displayCurrency);

  const statusMeta = proposalStatusMeta(proposal.status);
  const awaitingPayment =
    proposal.status === "accepted" && !!orderId && orderStatus === "payment_pending" && !orderPaid;
  const canDecide = proposal.status === "pending" || awaitingPayment;

  async function handleAccept() {
    setBusy("accept");
    setError(null);
    if (awaitingPayment && orderId) {
      router.push(`/orders/${orderId}/payment`);
      return;
    }
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
    onDeclined?.();
    router.refresh();
  }

  return (
    <div
      className={`flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm overflow-hidden ${className}`}
    >
      <div className="p-2.5 flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-container/10 text-primary text-xs font-semibold uppercase tracking-wide">
            <ShieldCheck size={14} />
            Acadivo Helper Proposal
          </div>
          <span className="text-xs text-on-surface-variant font-medium">
            #{proposal.id.replace(/-/g, "").slice(0, 5).toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg bg-surface-container-low p-2">
          <div className="flex flex-col justify-center">
            <span className="text-xs text-secondary uppercase font-semibold tracking-wider">
              {localResolved ? "You Pay" : "Total Fixed Price"}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-display text-xl font-bold text-primary tracking-tight">
                {price}
              </span>
              <span className="text-xs text-on-surface-variant font-medium">{displayCurrency}</span>
            </div>
          </div>
          <div className="flex flex-col justify-center sm:pl-3">
            <span className="text-xs text-secondary uppercase font-semibold tracking-wider">
              Offer Details
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <Timer size={14} className="text-primary" />
              <span className="text-sm font-medium text-on-surface">
                Expires {expiryLabel(proposal.expires_at)}
              </span>
            </div>
          </div>
        </div>

        {proposal.description && (
          <p className="text-xs text-on-surface-variant leading-snug bg-surface-container-low p-2 rounded">
            {proposal.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2.5 px-3 pb-2.5">
        <Avatar name={ACADIVO_HELPER_NAME} role="helper" size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-on-surface truncate">{ACADIVO_HELPER_NAME}</p>
          <p className="text-xs text-on-surface-variant">
            Proposed{" "}
            {new Date(proposal.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
        {orderId && proposal.status === "accepted" && (
          <Button size="sm" onClick={() => router.push(`/orders/${orderId}`)}>
            Open Order
          </Button>
        )}
      </div>

      <div className="mt-auto border-t border-outline-variant px-3 pt-2.5 pb-2">
        {canDecide ? (
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
                {busy === "accept"
                  ? awaitingPayment
                    ? "Opening Checkout..."
                    : "Accepting..."
                  : awaitingPayment
                    ? "Continue to Checkout"
                    : "Accept & Continue to Checkout"}
              </Button>
            </div>
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
