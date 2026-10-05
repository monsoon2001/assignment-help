"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import Avatar from "@/components/ui/avatar";

export type Testimonial = {
  id: string;
  rating: number;
  comment: string;
  studentName: string | null;
  studentAvatarUrl: string | null;
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
      className="mx-auto max-w-6xl"
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
              className="grid w-full shrink-0 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2"
              aria-hidden={groupIndex !== activePage}
            >
              {group.map((t) => (
                <figure
                  key={t.id}
                  className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-outline-variant/40 bg-surface-container-lowest p-6 sm:p-7 transition-all duration-300 hover:shadow-xl hover:shadow-primary-container/20 hover:-translate-y-0.5"
                >
                  <span
                    className="material-symbols-outlined pointer-events-none absolute -top-1 -right-1 text-7xl leading-none text-primary/10"
                    aria-hidden="true"
                  >
                    format_quote
                  </span>

                  <div className="relative flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
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
                    <span className="text-sm font-semibold text-on-surface-variant">
                      {t.rating.toFixed(1)}
                    </span>
                  </div>

                  <div className="relative mt-4 flex-1"></div>

                  <figcaption className="mt-6 border-t border-outline-variant/30 pt-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container/15 text-sm font-semibold text-primary">
                        {(() => {
                          const name = t.studentName ?? "Student";
                          const parts = name.trim().split(/\s+/);
                          return parts.length === 1 ? parts[0].slice(0, 1).toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                        })()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="font-semibold text-on-surface">
                            Verified student
                          </p>
                          {t.createdAt && (
                            <span className="text-xs text-on-surface-variant">
                              • {new Date(t.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {(t.subject || t.service || t.length) && (
                          <p className="mt-1 text-xs text-on-surface-variant">
                            {[t.subject, t.service, t.length].filter(Boolean).join(" • ")}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              aria-hidden="true"
                              className={
                                i < Math.round(t.rating)
                                  ? "h-3.5 w-3.5 fill-amber-400 text-amber-400"
                                  : "h-3.5 w-3.5 text-outline-variant"
                              }
                            />
                          ))}
                          <span className="ml-0.5 text-xs font-medium text-on-surface-variant">
                            {t.rating.toFixed(1)}
                          </span>
                        </div>
                        <blockquote className="mt-3 text-base leading-relaxed text-on-surface">
                          {t.comment}
                        </blockquote>
                      </div>
                    </div>
                  </figcaption>
                </figure>
              ))}
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
            className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant transition-colors hover:border-primary-container hover:text-primary"
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
                  i === activePage ? "w-7 bg-primary" : "w-2 bg-outline-variant hover:bg-on-surface-variant/50"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(activePage + 1)}
            aria-label="Next testimonials"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant transition-colors hover:border-primary-container hover:text-primary"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}