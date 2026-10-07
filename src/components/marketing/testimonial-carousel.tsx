"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { BadgeCheck, ChevronLeft, ChevronRight, Star } from "lucide-react";
import Avatar from "@/components/ui/avatar";

export type Testimonial = {
  id: string;
  rating: number;
  comment: string;
  studentName: string | null;
  studentAvatarUrl?: string | null;
  subject?: string | null;
  service?: string | null;
  createdAt?: string | null;
  length?: string | null;
};

const ROTATE_MS = 6500;
const DESKTOP_QUERY = "(min-width: 1024px)";

function subscribeToViewport(callback: () => void) {
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

// Phones read one review at a time and slide between them; from lg up every
// review sits side by side, so there is nothing left to rotate.
function usePerView() {
  return useSyncExternalStore(
    subscribeToViewport,
    () => (window.matchMedia(DESKTOP_QUERY).matches ? 3 : 1),
    () => 1,
  );
}

export default function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const count = testimonials.length;
  const perView = usePerView();
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);

  const pages = useMemo(() => {
    const result: Testimonial[][] = [];
    for (let i = 0; i < count; i += perView) {
      result.push(testimonials.slice(i, i + perView));
    }
    return result;
  }, [count, perView, testimonials]);

  // Switching from one card per view to three shrinks the page count, so the
  // current page is clamped during render instead of in an effect.
  const activePage = Math.min(page, pages.length - 1);

  const go = useCallback(
    (next: number) => {
      setPage(((next % pages.length) + pages.length) % pages.length);
    },
    [pages.length],
  );

  useEffect(() => {
    if (paused || pages.length <= 1) return;
    const timer = setInterval(() => {
      setPage((current) => (current + 1) % pages.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [pages.length, paused]);

  if (count === 0) return null;

  return (
    <div
      className="mx-auto max-w-7xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activePage * 100}%)` }}
        >
          {pages.map((group, groupIndex) => (
            <div
              key={groupIndex}
              className="grid w-full shrink-0 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
              aria-hidden={groupIndex !== activePage}
            >
              {group.map((t) => {
                const name = t.studentName?.trim() || "Acadivo student";
                const firstName = name.split(/\s+/)[0];
                return (
                  <figure
                    key={t.id}
                    className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-outline-variant/40 bg-white p-6 sm:p-8 shadow-md shadow-ink-900/5 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-container/20 hover:-translate-y-1"
                  >
                    <span
                      className="material-symbols-outlined pointer-events-none absolute -top-1 -right-1 text-7xl leading-none text-primary/10"
                      aria-hidden="true"
                    >
                      format_quote
                    </span>

                    <div className="relative flex items-center justify-between gap-3">
                      <div className="flex items-center gap-0.5" aria-label={`${t.rating.toFixed(1)} out of 5`}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            aria-hidden="true"
                            className={
                              i < Math.round(t.rating)
                                ? "h-4 w-4 fill-amber-400 text-amber-400"
                                : "h-4 w-4 text-outline-variant"
                            }
                          />
                        ))}
                      </div>
                      {t.subject && (
                        <span className="shrink-0 rounded-full bg-primary-fixed px-2.5 py-1 text-xs font-semibold text-primary">
                          {t.subject}
                        </span>
                      )}
                    </div>

                    <blockquote className="relative mt-4 flex-1 text-base leading-relaxed text-on-surface">
                      {t.comment}
                    </blockquote>

                    <figcaption className="mt-6 border-t border-outline-variant/30 pt-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={name}
                          src={t.studentAvatarUrl ?? undefined}
                          size="md"
                          className="shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-semibold text-on-surface truncate leading-relaxed">{firstName}</p>
                          <p className="text-xs text-on-surface-variant">
                            {[t.service, t.length].filter(Boolean).join(" · ") || "Verified student"}
                          </p>
                        </div>
                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                          <BadgeCheck size={11} /> Verified
                        </span>
                      </div>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {pages.length > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => go(activePage - 1)}
            aria-label="Previous testimonials"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-white text-on-surface-variant transition-colors hover:border-primary-container text-primary"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            {pages.map((group, i) => (
              <button
                key={group[0]?.id ?? i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show testimonials ${i + 1}`}
                aria-current={i === activePage}
                className={`h-2 rounded-full transition-all ${
                  i === activePage ? "w-7 bg-primary hover:bg-primary-container" : "w-2 bg-outline-variant hover:bg-on-surface-variant/50"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(activePage + 1)}
            aria-label="Next testimonials"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-white text-on-surface-variant transition-colors hover:border-primary-container text-primary"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
