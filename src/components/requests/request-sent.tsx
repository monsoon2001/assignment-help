"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Copy,
  BookOpen,
  CalendarDays,
  Timer,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

function formatDate(value: string | null): string {
  if (!value) return "Flexible";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function RequestSent({
  id,
  title,
  subject,
  deadline,
  helperName,
  error,
}: {
  id: string;
  title: string;
  subject?: string | null;
  deadline?: string | null;
  helperName?: string | null;
  error?: string;
}) {
  const [copied, setCopied] = useState(false);
  const refCode = `#PC-${id.replace(/-/g, "").slice(0, 5).toUpperCase()}`;

  const copy = () => {
    navigator.clipboard.writeText(refCode.replace("#", ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
        <div className="w-full max-w-xl mx-auto bg-surface-container-lowest rounded-2xl shadow-md p-8 text-center">
          <h1 className="font-display font-bold text-2xl text-on-surface">Request not found</h1>
          <p className="text-sm text-on-surface-variant mt-2">{error}</p>
          <Link href="/requests" className="inline-block mt-6">
            <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-container text-on-primary font-semibold text-sm hover:bg-primary transition-colors">
              Back to My Requests <ArrowRight size={16} />
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      {/* Status Icon Badge with Subtle Pulse Animation */}
      <div className="relative flex items-center justify-center mb-6">
        <div className="absolute w-20 h-20 rounded-full bg-primary/10 animate-ping opacity-75" />
        <div className="relative w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center shadow-md">
          <CheckCircle2 size={32} className="text-primary" fill="currentColor" />
        </div>
      </div>

      {/* Header & Reassurance Body */}
      <div className="text-center mb-8">
        <span className="inline-block font-semibold text-xs text-primary uppercase tracking-wider bg-surface-container-low px-3 py-1 rounded-full mb-3">
          Submission Confirmed
        </span>
        <h1 className="font-display font-bold text-3xl text-on-surface mb-2 tracking-tight">
          Your request has been sent!
        </h1>
        <p className="text-base text-on-surface-variant max-w-md mx-auto leading-relaxed">
          {helperName ? (
            <>
              It&apos;s on its way to <span className="font-semibold text-on-surface">{helperName}</span>. You can chat
              with them right away on this request — no price until they propose.
            </>
          ) : (
            <>
              We&apos;re reaching out to your chosen helper on your behalf. They&apos;ll respond here on this request.
            </>
          )}
        </p>
      </div>

      {/* Assignment Recap Card */}
      <div className="w-full bg-surface-container-lowest rounded-xl shadow-md p-6 mb-6">
        {/* Reference Header Row */}
        <div className="flex items-center justify-between pb-3 mb-3 bg-surface-container-low/60 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant text-lg">receipt_long</span>
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Reference Code
            </span>
          </div>
          <div className="flex items-center gap-2 relative">
            <span className="text-sm font-semibold text-on-surface tracking-wide">{refCode}</span>
            <button
              type="button"
              onClick={copy}
              className="p-1 rounded hover:bg-surface-container transition-colors text-on-surface-variant hover:text-primary cursor-pointer"
              title="Copy reference"
            >
              <Copy size={16} />
            </button>
            {copied && (
              <span className="absolute -top-7 -left-5 bg-inverse-surface text-inverse-on-surface text-xs px-2 py-1 rounded shadow whitespace-nowrap">
                Copied!
              </span>
            )}
          </div>
        </div>

        {/* Detail Rows */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <BookOpen size={16} />
              <span className="text-sm">Assignment</span>
            </div>
            <span className="text-sm font-medium text-on-surface text-right max-w-[260px] truncate">
              {title}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <CalendarDays size={16} />
              <span className="text-sm">Requested Deadline</span>
            </div>
            <span className="text-sm font-medium text-on-surface text-right">{formatDate(deadline ?? null)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <Timer size={16} />
              <span className="text-sm">Estimated Response</span>
            </div>
            <span className="text-sm font-semibold text-primary flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Within 2 hours
            </span>
          </div>
        </div>

        {/* Assigned Helper Preview */}
        <div className="mt-4 pt-4 bg-surface-container-low rounded-lg p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex h-7 w-7 rounded-full items-center justify-center bg-primary-container text-on-primary text-xs font-semibold shrink-0">
              {(helperName ?? "H").split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2)}
            </span>
            <span className="text-xs text-on-surface-variant truncate">
              {helperName ? (
                <>
                  Sent to <span className="font-semibold text-on-surface">{helperName}</span> ·{" "}
                  {subject || "General"} expert
                </>
              ) : (
                subject ? `${subject} specialist` : "Assigned expert"
              )}
            </span>
          </div>
          <span className="text-xs bg-surface-container-lowest text-on-surface-variant px-2 py-1 rounded font-medium shrink-0">
            Active Now
          </span>
        </div>
      </div>

      {/* Action Group */}
      <div className="w-full flex flex-col sm:flex-row items-center gap-3 mb-6">
        <Link
          href={`/requests/${id}`}
          className="w-full sm:flex-1 py-3 px-5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-medium text-sm flex items-center justify-center gap-2 shadow transition-all duration-150 text-center"
        >
          <span>Open Chat with Helper</span>
          <ArrowRight size={16} />
        </Link>
        <Link
          href="/requests"
          className="w-full sm:w-auto py-3 px-5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-150 text-center"
        >
          <span>View in My Requests</span>
        </Link>
      </div>

      {/* Security / Payment Guarantee Reassurance Banner */}
      <div className="w-full max-w-md flex items-start gap-2 bg-surface-container-low/70 rounded-lg p-3">
        <ShieldCheck size={16} className="text-primary shrink-0 mt-0.5" fill="currentColor" />
        <p className="text-sm text-on-surface-variant leading-snug">
          <span className="font-semibold text-on-surface">No upfront fee:</span> You won&apos;t be
          charged anything until you review and accept a helper&apos;s formal proposal.
        </p>
      </div>
    </div>
  );
}