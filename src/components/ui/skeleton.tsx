type SkeletonProps = {
  className?: string;
};

/** Base placeholder block. Pulses unless the user asked for reduced motion. */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-lg bg-surface-container-high motion-safe:animate-pulse ${className}`}
    />
  );
}

/** Stacked text bars; the last one is short so it reads like a paragraph. */
export function SkeletonText({ lines = 3, className = "" }: { lines?: number } & SkeletonProps) {
  return (
    <div aria-hidden="true" className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3.5 ${i === lines - 1 ? "w-2/5" : "w-full"}`} />
      ))}
    </div>
  );
}

export function SkeletonCircle({ className = "" }: SkeletonProps) {
  return <Skeleton className={`rounded-full aspect-square ${className}`} />;
}

/** Generic page placeholder: title block, paragraph, then a panel. */
export function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <Skeleton className="h-9 w-64" />
      <SkeletonText lines={2} className="mt-5 max-w-2xl" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-outline-variant p-6">
            <SkeletonCircle className="w-12 h-12" />
            <Skeleton className="h-4 w-32 mt-4" />
            <SkeletonText lines={3} className="mt-3" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Two-pane workspace placeholder used by the student and helper dashboards. */
export function WorkspaceSkeleton() {
  return (
    <div className="w-full" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="w-full rounded-2xl border border-outline-variant p-6">
        <div className="flex flex-wrap items-center gap-4">
          <SkeletonCircle className="w-12 h-12" />
          <div className="flex-1 min-w-48 space-y-2">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-3.5 w-40" />
          </div>
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-outline-variant/40 p-4">
                <Skeleton className="h-3.5 w-24" />
                <SkeletonText lines={2} className="mt-3" />
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-outline-variant/40 p-4">
            <Skeleton className="h-4 w-28" />
            <SkeletonText lines={5} className="mt-4" />
            <Skeleton className="mt-5 h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Stats row plus table rows, for the admin dashboard. */
export function AdminSkeleton() {
  return (
    <div className="w-full" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <Skeleton className="h-8 w-48" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-outline-variant p-5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-8 w-16 mt-3" />
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl border border-outline-variant p-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-outline-variant/40 py-4 last:border-0">
            <SkeletonCircle className="w-10 h-10" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}