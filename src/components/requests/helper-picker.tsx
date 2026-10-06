"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Send, Star } from "lucide-react";
import Button from "@/components/ui/button";
import Avatar from "@/components/ui/avatar";
import Badge from "@/components/ui/badge";
import { fetchHelperCandidates, type HelperCandidate } from "@/lib/requests";
import { Skeleton, SkeletonCircle, SkeletonText } from "@/components/ui/skeleton";

export default function HelperPicker({
  subject,
  onSelect,
  pickLabel = "Send Request",
  heading = "Choose your helper",
}: {
  subject?: string | null;
  onSelect: (helper: HelperCandidate) => Promise<void> | void;
  pickLabel?: string;
  heading?: string;
}) {
  const [helpers, setHelpers] = useState<HelperCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await fetchHelperCandidates(subject);
      if (cancelled) return;
      if ("error" in result) {
        setError(result.error);
      } else {
        setHelpers(result.helpers);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [subject]);

  async function handleSelect(helper: HelperCandidate) {
    setWorking(helper.user_id);
    try {
      await onSelect(helper);
    } finally {
      setWorking(null);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-busy="true" aria-live="polite">
        <span className="sr-only">Finding subject experts…</span>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl border border-outline-variant bg-surface-container-lowest flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              <SkeletonCircle className="w-12 h-12" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-6 w-16 rounded-full" />
              ))}
            </div>
            <SkeletonText lines={2} />
            <Skeleton className="h-9 w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm text-error">{error}</p>
      </div>
    );
  }

  if (helpers.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm text-on-surface-variant">
          No helpers are available right now. Please try again shortly.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-display font-semibold text-on-surface mb-3">{heading}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {helpers.map((helper) => {
          const name = helper.user?.name || "Acadivo Helper";
          const initials = name
            .split(/\s+/)
            .map((p) => p[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
          return (
            <div
              key={helper.user_id}
              className="p-4 rounded-2xl border border-outline-variant bg-surface-container-lowest hover:border-primary-container hover:shadow-lg transition-all flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                <Avatar name={name} size="lg" src={helper.user?.avatar_url ?? undefined} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-on-surface truncate">{name}</p>
                  <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span className="font-medium">
                      {helper.rating_avg > 0 ? helper.rating_avg.toFixed(1) : "New"}
                    </span>
                    <span className="text-on-surface-variant/60">· {initials} Helped students</span>
                  </div>
                </div>
              </div>

              {helper.subjects.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {helper.subjects.slice(0, 3).map((s) => (
                    <Badge key={s} variant="outline">{s}</Badge>
                  ))}
                </div>
              )}

              {helper.bio && (
                <p className="text-sm text-on-surface-variant line-clamp-2">{helper.bio}</p>
              )}

              <Button
                size="sm"
                disabled={working !== null}
                onClick={() => handleSelect(helper)}
                className="justify-center"
              >
                {working === helper.user_id ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
                {pickLabel === "Send Request" ? `Send Request to ${name.split(" ")[0]}` : pickLabel}
              </Button>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-on-surface-variant mt-4">
        Not sure?{" "}
        <Link href="/browse-helpers" className="text-primary font-medium hover:underline">
          Browse all helpers
        </Link>
      </p>
    </div>
  );
}