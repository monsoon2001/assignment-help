"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
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

const ROTATE_MS = 6000;
const TABLET_QUERY = "(min-width: 640px) and (max-width: 1023px)";
const DESKTOP_QUERY = "(min-width: 1024px)";

function subscribeToViewport(callback: () => void) {
  const mTablet = window.matchMedia(TABLET_QUERY);
  const mDesktop = window.matchMedia(DESKTOP_QUERY);
  mTablet.addEventListener("change", callback);
  mDesktop.addEventListener("change", callback);
  return () => {
    mTablet.removeEventListener("change", callback);
    mDesktop.removeEventListener("change", callback);
  };
}

function getSnapshot() {
  if (typeof window === "undefined") return 1;
  if (window.matchMedia(DESKTOP_QUERY).matches) return 3;
  if (window.matchMedia(TABLET_QUERY).matches) return 2;
  return 1;
}

function usePerView() {
  return useSyncExternalStore(subscribeToViewport, getSnapshot, () => 1);
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
      setIndex(Math.max(0, Math.min(next, maxIndex)));
    },
    [maxIndex],
  );

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
  const canGoPrev = safeIndex > 0;
  const canGoNext = safeIndex < maxIndex;

  return (
    <div
      className="mx-auto max-w-7xl relative px-2 sm:px-12 md:px-14"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Outer row with outside navigation buttons */}
      <div className="relative">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => go(safeIndex - 1)}
          disabled={!canGoPrev}
          aria-label="Previous testimonials"
          className="absolute -left-4 sm:-left-11 md:-left-13 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-outline-variant/60 bg-white text-primary shadow-md transition-all duration-200 hover:border-primary/50 hover:bg-slate-50 active:scale-95 disabled:opacity-30 disabled:pointer-events-none disabled:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2} />
        </button>

        {/* Carousel Viewport */}
        <div className="overflow-hidden py-2 -my-2">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${safeIndex * (100 / perView)}%)`,
            }}
          >
            {testimonials.map((t) => {
              const name = t.studentName?.trim() || "Acadivo student";
              const firstName = name.split(/\s+/)[0];
              return (
                <div
                  key={t.id}
                  className="shrink-0 px-2 sm:px-3 flex"
                  style={{ width: `${100 / perView}%` }}
                >
                  <figure className="relative flex flex-col justify-between w-full h-full overflow-hidden rounded-2xl sm:rounded-3xl border border-outline-variant/40 bg-white p-5 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-md">
                    <div>
                      <MaterialIcon
                        name="format_quote"
                        size={64}
                        className="pointer-events-none absolute -top-1 -right-1 text-primary/10 select-none"
                      />

                      <div className="relative flex items-center justify-between gap-2">
                        <div
                          className="flex items-center gap-0.5"
                          aria-label={`${t.rating.toFixed(1)} out of 5`}
                        >
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
                          <span className="shrink-0 rounded-full bg-primary-fixed px-2.5 py-0.5 text-xs font-semibold text-primary">
                            {t.subject}
                          </span>
                        )}
                      </div>

                      <blockquote className="relative mt-3.5 text-sm sm:text-base leading-relaxed text-on-surface line-clamp-5">
                        {t.comment}
                      </blockquote>
                    </div>

                    <figcaption className="mt-5 border-t border-outline-variant/30 pt-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={name}
                          src={t.studentAvatarUrl ?? undefined}
                          size="md"
                          className="shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm sm:text-base font-semibold text-on-surface truncate leading-tight">
                            {firstName}
                          </p>
                          <p className="text-xs text-on-surface-variant truncate">
                            {[t.service, t.length].filter(Boolean).join(" · ") ||
                              "Verified student"}
                          </p>
                        </div>
                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-success-tint px-2 py-0.5 text-xs font-semibold text-success">
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

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => go(safeIndex + 1)}
          disabled={!canGoNext}
          aria-label="Next testimonials"
          className="absolute -right-4 sm:-right-11 md:-right-13 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-outline-variant/60 bg-white text-primary shadow-md transition-all duration-200 hover:border-primary/50 hover:bg-slate-50 active:scale-95 disabled:opacity-30 disabled:pointer-events-none disabled:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>

      {/* Pagination Dots */}
      {dotCount > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: dotCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show testimonials slide ${i + 1}`}
              aria-current={i === safeIndex}
              className={`h-2.5 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                i === safeIndex
                  ? "w-8 bg-primary"
                  : "w-2.5 bg-outline-variant hover:bg-on-surface-variant/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
