"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Timer,
  ShieldCheck,
  Loader2,
  CreditCard,
  Lock,
  CheckCircle2,
  RotateCcw,
  XCircle,
} from "lucide-react";
import Button from "@/components/ui/button";
import Avatar from "@/components/ui/avatar";
import { acceptProposal, declineProposal, requestProposalRevision } from "@/lib/orders";
import { normalizeCurrency, formatCurrency, currencyName, DEFAULT_CURRENCY } from "@/lib/currency";
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
  student_note?: string | null;
  target_price?: number | null;
  decline_reason?: string | null;
  revision_requested_at?: string | null;
  replaced_by?: string | null;
  revision_of?: string | null;
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
  lockedAmount,
  lockedCurrency,
  localCurrency = DEFAULT_CURRENCY,
  className = "",
  onRevisionRequested,
  onDeclined,
}: {
  proposal: RequestProposal;
  requestTitle?: string | null;
  requestDeadline?: string | null;
  orderId?: string | null;
  orderStatus?: string | null;
  orderPaid?: boolean;
  lockedAmount?: number;
  lockedCurrency?: string;
  localCurrency?: string;
  className?: string;
  onRevisionRequested?: () => void;
  onDeclined?: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"accept" | "revise" | "decline" | "cancel" | "pay" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [panel, setPanel] = useState<"none" | "revise" | "decline">("none");
  const [revisionNote, setRevisionNote] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [declineReason, setDeclineReason] = useState("");

  const currency = normalizeCurrency(proposal.currency);
  const basePrice = Number(proposal.price);

  const awaitingPayment =
    proposal.status === "accepted" && !!orderId && orderStatus === "payment_pending" && !orderPaid;
  const paid = proposal.status === "accepted" && orderPaid;
  const lockedAmountIsValid =
    typeof lockedAmount === "number" && Number.isFinite(lockedAmount) && lockedAmount > 0;

  // Once accepted, show the amount actually locked on the order (the real
  // checkout amount). Before that, show the helper's CAD quote.
  const chargeCurrency = awaitingPayment
    ? normalizeCurrency(lockedCurrency ?? localCurrency)
    : currency;
  const displayAmount =
    awaitingPayment && lockedAmountIsValid ? (lockedAmount as number) : basePrice;
  const displayCurrency = awaitingPayment ? chargeCurrency : currency;

  const statusMeta = proposalStatusMeta(proposal.status);
  const canDecide = proposal.status === "pending";
  const isRevisionRequested = proposal.status === "revision_requested";
  const isDeclined = proposal.status === "declined";
  const isReplaced = proposal.status === "replaced";

  function resetPanels() {
    setPanel("none");
    setRevisionNote("");
    setTargetPrice("");
    setDeclineReason("");
    setError(null);
  }

  async function handleAccept() {
    if (busy) return;
    setBusy("accept");
    setError(null);
    const result = await acceptProposal({
      proposal_id: proposal.id,
      helper_id: proposal.helper_id,
      request_id: proposal.request_id,
      price: basePrice,
      currency,
      request_deadline: requestDeadline ?? null,
    });
    if ("error" in result) {
      setBusy(null);
      setError(result.error);
      return;
    }
    // Keep the button busy until the payment page mounts.
    router.push(`/orders/${result.orderId}/payment`);
  }

  async function handleRequestRevision() {
    if (busy) return;
    const trimmedTarget = targetPrice.trim();
    const parsedTarget = trimmedTarget ? Number(trimmedTarget) : null;
    if (
      parsedTarget !== null &&
      (!Number.isFinite(parsedTarget) ||
        parsedTarget <= 0 ||
        !Number.isSafeInteger(Math.round(parsedTarget)))
    ) {
      setError("Enter a valid whole-number target price, or leave it blank.");
      return;
    }

    setBusy("revise");
    setError(null);
    const result = await requestProposalRevision(
      proposal.id,
      proposal.request_id,
      revisionNote.trim() || undefined,
      parsedTarget === null ? undefined : Math.round(parsedTarget),
    );
    setBusy(null);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    resetPanels();
    onRevisionRequested?.();
    router.refresh();
  }

  async function handleDecline() {
    if (busy) return;
    setBusy("decline");
    setError(null);
    const result = await declineProposal(
      proposal.id,
      proposal.request_id,
      declineReason.trim() || undefined,
    );
    setBusy(null);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    resetPanels();
    onDeclined?.();
    router.refresh();
  }

  async function handleCancelOrder() {
    if (busy) return;
    if (
      !window.confirm(
        "Cancel this unpaid order? The proposal will be marked declined and the order will be removed.",
      )
    ) {
      return;
    }
    setBusy("cancel");
    setError(null);
    const result = await declineProposal(
      proposal.id,
      proposal.request_id,
      "Order cancelled before payment",
    );
    if ("error" in result) {
      setBusy(null);
      setError(result.error);
      return;
    }
    router.push(`/requests/${proposal.request_id}`);
    router.refresh();
  }

  async function handlePay() {
    if (!orderId || busy) return;
    setBusy("pay");
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (!res.ok || !data?.url) {
        setBusy(null);
        setError(data?.error ?? "Could not start checkout. Please try again.");
        return;
      }
      window.location.assign(data.url);
    } catch (payError) {
      console.error("proposal card: checkout failed", payError);
      setBusy(null);
      setError("Could not start checkout. Please try again.");
    }
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
            <span className="text-xs text-on-surface-variant uppercase font-semibold tracking-wider">
              {awaitingPayment ? "Amount due" : "Price"}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-display text-xl font-bold text-primary tracking-tight">
                {formatCurrency(displayAmount, displayCurrency)}
              </span>
              <span className="text-xs text-on-surface-variant font-medium">{displayCurrency}</span>
            </div>
            <p className="mt-0.5 text-xs text-on-surface-variant">
              {awaitingPayment
                ? "Locked at acceptance."
                : `Quoted in ${currency === "CAD" ? "Canadian dollars" : displayCurrency}.`}
            </p>
          </div>
          <div className="flex flex-col justify-center sm:pl-3">
            <span className="text-xs text-on-surface-variant uppercase font-semibold tracking-wider">
              Status
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              {proposal.status === "pending" && <Timer size={14} className="text-primary" />}
              {proposal.status === "accepted" && (
                <CheckCircle2 size={14} className="text-success" />
              )}
              {isRevisionRequested && <RotateCcw size={14} className="text-warning" />}
              {isDeclined && <XCircle size={14} className="text-on-surface-variant" />}
              <span className="text-sm font-medium text-on-surface">{statusMeta.label}</span>
            </div>
            {proposal.status === "pending" && (
              <p className="text-xs text-on-surface-variant mt-0.5">
                Expires {expiryLabel(proposal.expires_at)}
              </p>
            )}
          </div>
        </div>

        {proposal.description && (
          <p className="text-xs text-on-surface-variant leading-snug bg-surface-container-low p-2 rounded">
            {proposal.description}
          </p>
        )}

        {isRevisionRequested && (
          <div className="rounded-lg border border-warning/30 bg-warning-container/20 p-2.5">
            <p className="text-sm font-medium text-on-surface">
              The student asked for a revised price.
            </p>
            {proposal.student_note && (
              <p className="mt-1 text-xs text-on-surface-variant whitespace-pre-line">
                “{proposal.student_note}”
              </p>
            )}
            {typeof proposal.target_price === "number" && proposal.target_price > 0 && (
              <p className="mt-1 text-xs text-on-surface-variant">
                Target: {formatCurrency(proposal.target_price, "CAD")}
              </p>
            )}
          </div>
        )}

        {isDeclined && (
          <div className="rounded-lg border border-outline-variant bg-surface-container-low p-2.5">
            <p className="text-sm font-medium text-on-surface">The student declined this proposal.</p>
            {proposal.decline_reason && (
              <p className="mt-1 text-xs text-on-surface-variant whitespace-pre-line">
                “{proposal.decline_reason}”
              </p>
            )}
          </div>
        )}

        {isReplaced && (
          <p className="text-xs text-on-surface-variant bg-surface-container-low p-2 rounded">
            This quote was replaced by a revised quote.
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
        {orderId && proposal.status === "accepted" && !awaitingPayment && (
          <Button size="sm" variant="outline" onClick={() => router.push(`/orders/${orderId}`)}>
            Open Order
          </Button>
        )}
      </div>

      <div className="mt-auto border-t border-outline-variant px-3 pt-2.5 pb-2">
        {error && <p className="text-sm text-error mb-2">{error}</p>}

        {canDecide && panel === "revise" && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-on-surface-variant">
              Ask the helper for a different price. Both fields are optional.
            </p>
            <label className="text-sm font-medium text-on-surface" htmlFor="revision-note">
              Note for the helper
            </label>
            <textarea
              id="revision-note"
              rows={3}
              value={revisionNote}
              onChange={(e) => {
                setRevisionNote(e.target.value);
                setError(null);
              }}
              placeholder="e.g. This is above my budget because the assignment is shorter than expected."
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
            />
            <label className="text-sm font-medium text-on-surface" htmlFor="target-price">
              Target price in CAD (optional)
            </label>
            <input
              id="target-price"
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={targetPrice}
              onChange={(e) => {
                setTargetPrice(e.target.value);
                setError(null);
              }}
              placeholder="e.g. 80"
              className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
            />
            <div className="flex flex-col-reverse sm:flex-row items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full sm:w-auto"
                disabled={busy !== null}
                onClick={resetPanels}
              >
                Keep proposal
              </Button>
              <Button
                size="sm"
                className="w-full sm:w-auto"
                disabled={busy !== null}
                onClick={handleRequestRevision}
              >
                {busy === "revise" ? <Loader2 size={15} className="animate-spin" /> : null}
                Send revision request
              </Button>
            </div>
          </div>
        )}

        {canDecide && panel === "decline" && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-on-surface-variant">
              Decline this proposal. You can optionally tell the helper why.
            </p>
            <label className="text-sm font-medium text-on-surface" htmlFor="decline-reason">
              Reason (optional)
            </label>
            <textarea
              id="decline-reason"
              rows={3}
              value={declineReason}
              onChange={(e) => {
                setDeclineReason(e.target.value);
                setError(null);
              }}
              placeholder="e.g. The price is outside my budget."
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
            />
            <div className="flex flex-col-reverse sm:flex-row items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full sm:w-auto"
                disabled={busy !== null}
                onClick={resetPanels}
              >
                Keep proposal
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-error hover:bg-error-container/20"
                disabled={busy !== null}
                onClick={handleDecline}
              >
                {busy === "decline" ? <Loader2 size={15} className="animate-spin" /> : null}
                Decline proposal
              </Button>
            </div>
          </div>
        )}

        {canDecide && panel === "none" && (
          <div className="flex flex-col gap-2">
            <Button
              size="lg"
              className="w-full justify-center"
              disabled={busy !== null}
              onClick={handleAccept}
            >
              {busy === "accept" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              {busy === "accept" ? "Accepting..." : "Accept"}
            </Button>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:flex-1 justify-center"
                disabled={busy !== null}
                onClick={() => {
                  setError(null);
                  setPanel("revise");
                }}
              >
                <RotateCcw size={14} /> Ask for a different price
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full sm:flex-1 justify-center text-on-surface-variant hover:bg-error-container/20 hover:text-error"
                disabled={busy !== null}
                onClick={() => {
                  setError(null);
                  setPanel("decline");
                }}
              >
                Decline
              </Button>
            </div>
          </div>
        )}

        {awaitingPayment && (
          <div className="flex flex-col gap-2">
            <Button
              size="lg"
              className="w-full justify-center"
              disabled={busy !== null}
              onClick={handlePay}
            >
              {busy === "pay" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CreditCard size={16} />
              )}
              {busy === "pay"
                ? "Opening Checkout..."
                : `Pay ${formatCurrency(displayAmount, displayCurrency)}`}
            </Button>
            <p className="flex items-center justify-center gap-1.5 text-xs text-on-surface-variant">
              <Lock size={12} />
              {displayCurrency === "CAD"
                ? "Charged in Canadian dollars (CAD)."
                : `Charged in ${currencyName(displayCurrency)} (${displayCurrency}); settled in CAD.`}
            </p>
            <button
              type="button"
              disabled={busy !== null}
              onClick={handleCancelOrder}
              className="mx-auto text-xs font-medium text-on-surface-variant underline underline-offset-2 hover:text-error disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {busy === "cancel" ? "Cancelling..." : "Cancel this order"}
            </button>
          </div>
        )}

        {paid && (
          <p className="flex items-center gap-1.5 text-sm font-medium text-success">
            <CheckCircle2 size={15} /> Paid. No further payment is needed.
          </p>
        )}

        {isRevisionRequested && (
          <p className="text-sm font-medium text-on-surface-variant">
            Waiting for the helper to send a revised quote.
          </p>
        )}

        {isDeclined && (
          <p className="text-sm font-medium text-on-surface-variant">
            This proposal is declined.
          </p>
        )}

        {isReplaced && (
          <p className="text-sm font-medium text-on-surface-variant">
            This quote has been replaced.
          </p>
        )}
      </div>
    </div>
  );
}
