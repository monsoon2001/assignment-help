"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { BadgeCheck, ChevronLeft, ChevronRight, Star } from "lucide-react";
import Avatar from "@/components/ui/avatar";
import { MaterialIcon } from "@/lib/icons-map";

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

const ROTATE_MS = 5000;
const DESKTOP_QUERY = "(min-width: 1024px)";

function subscribeToViewport(callback: () => void) {
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

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
  const maxIndex = Math.max(0, count - perView);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const safeIndex = Math.min(index, maxIndex);

  const go = useCallback(
    (next: number) => {
      setIndex(((next % (maxIndex + 1)) + (maxIndex + 1)) % (maxIndex + 1));
    },
    [maxIndex],
  );

  const indexRef = useRef(safeIndex);
  indexRef.current = safeIndex;

  useEffect(() => {
    if (paused || maxIndex <= 0) return;
    const timer = setInterval(() => {
      setIndex((current) => {
        const next = current + 1;
        return next > maxIndex ? 0 : next;
      });
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [paused, maxIndex]);

  if (count === 0) return null;

  const dotCount = maxIndex + 1;

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
          style={{ transform: `translateX(-${(safeIndex / Math.max(count, 1)) * 100}%)` }}
        >
          {testimonials.map((t) => {
            const name = t.studentName?.trim() || "Acadivo student";
            const firstName = name.split(/\s+/)[0];
            return (
              <div
                key={t.id}
                className={`shrink-0 px-2 ${perView === 3 ? "w-1/3" : "w-full"}`}
              >
                <figure className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-outline-variant/40 bg-white p-6 sm:p-8 shadow-md shadow-ink-900/5 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-container/20 hover:-translate-y-1">
                  <MaterialIcon
                    name="format_quote"
                    size={72}
                    className="pointer-events-none absolute -top-1 -right-1 text-primary/10"
                  />

                  <div className="relative flex items-center justify-between gap-3">
                    <div className="flex items-center gap-0.5" aria-label={`${t.rating.toFixed(1)} out of 5`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          aria-hidden="true"
                          className={
                            i < Math.round(t.rating)
                              ? "h-4 w-4 fill-accent text-accent"
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
                      <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-success-tint px-2 py-1 text-xs font-semibold text-success">
                        <BadgeCheck size={11} /> Verified
                      </span>
                    </div>
                  </figcaption>
                </figure>
              </div>
            );
          })}
        </div>
      </div>

      {dotCount > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => go(safeIndex - 1)}
            aria-label="Previous testimonials"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-outline-variant/60 bg-white text-primary shadow-sm transition-all duration-200 hover:border-primary/40 hover:bg-primary-tint active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: dotCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show testimonials ${i + 1}`}
                aria-current={i === safeIndex}
                className={`h-2 rounded-full transition-all ${
                  i === safeIndex ? "w-7 bg-primary hover:bg-primary-hover" : "w-2 bg-outline-variant hover:bg-on-surface-variant/50"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(safeIndex + 1)}
            aria-label="Next testimonials"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-outline-variant/60 bg-white text-primary shadow-sm transition-all duration-200 hover:border-primary/40 hover:bg-primary-tint active:scale-95"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
      )}
    </div>
  );
}