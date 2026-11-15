"use client";

import { formatCurrency, normalizeCurrency } from "@/lib/currency";
import type { RequestProposal } from "@/components/requests/proposal-card";

function eventTitle(proposal: RequestProposal): string {
  const amount = formatCurrency(
    Number(proposal.final_cad ?? proposal.price),
    normalizeCurrency(proposal.currency),
  );
  switch (proposal.status) {
    case "pending":
      return `The helper sent a quote of ${amount}.`;
    case "revision_requested":
      return "The student asked for a revised price.";
    case "replaced":
      return `The ${amount} quote was replaced by a revised quote.`;
    case "accepted":
      return `The student accepted the proposal at ${amount}.`;
    case "declined":
      return "The student declined the proposal.";
    case "withdrawn":
      return "The helper withdrew the proposal.";
    default:
      return `Proposal status: ${proposal.status}.`;
  }
}

function eventDate(proposal: RequestProposal): string {
  const value = proposal.revision_requested_at ?? proposal.created_at;
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Plain-language proposal history for the request workspace, the chat area and
 * the order overview. Both parties see the same events, including the student's
 * note or decline reason.
 */
export default function ProposalActivity({
  proposals,
  className = "",
}: {
  proposals: RequestProposal[];
  className?: string;
}) {
  const rows = [...proposals].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  if (rows.length === 0) return null;

  return (
    <div
      className={`rounded-xl border border-outline-variant bg-surface-container-lowest p-3 ${className}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
        Proposal activity
      </p>
      <ul className="mt-2 flex flex-col gap-2.5">
        {rows.map((proposal) => (
          <li key={proposal.id} className="border-l-2 border-primary-container/40 pl-2.5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-medium text-on-surface leading-snug">
                {eventTitle(proposal)}
              </p>
              <span className="shrink-0 text-[11px] text-on-surface-variant">
                {eventDate(proposal)}
              </span>
            </div>
            {proposal.student_note && (
              <p className="mt-0.5 text-xs text-on-surface-variant whitespace-pre-line">
                “{proposal.student_note}”
              </p>
            )}
            {proposal.decline_reason && (
              <p className="mt-0.5 text-xs text-on-surface-variant whitespace-pre-line">
                Reason: “{proposal.decline_reason}”
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
