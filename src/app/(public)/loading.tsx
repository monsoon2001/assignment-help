import { Skeleton, SkeletonCircle, SkeletonText } from "@/components/ui/skeleton";

/**
 * Marketing homepage placeholder shown while the public route streams in.
 * Mirrors the hero + trust bar + feature grid so the first paint doesn't jump.
 */
export default function PublicLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>

      <section className="relative overflow-hidden band-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-28">
          <div className="max-w-3xl space-y-5">
            <Skeleton className="h-7 w-56 rounded-full" />
            <Skeleton className="h-12 w-full max-w-2xl" />
            <Skeleton className="h-12 w-3/4 max-w-xl" />
            <SkeletonText lines={2} className="max-w-2xl pt-2" />
            <div className="flex flex-wrap gap-3 pt-3">
              <Skeleton className="h-12 w-44 rounded-xl" />
              <Skeleton className="h-12 w-36 rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 border-y border-outline-variant/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3.5 w-28" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-8 sm:mb-12 space-y-3">
            <Skeleton className="h-8 w-72" />
            <SkeletonText lines={2} />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-outline-variant p-6">
                <SkeletonCircle className="w-12 h-12" />
                <Skeleton className="h-4 w-36 mt-4" />
                <SkeletonText lines={3} className="mt-3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
