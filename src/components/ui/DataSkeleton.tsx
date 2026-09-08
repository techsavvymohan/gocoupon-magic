/**
 * @file src/components/ui/DataSkeleton.tsx
 * @description Loading skeleton components for API-driven data sections.
 *
 * Shown while TanStack Query is fetching data from the backend.
 * This is a visual indicator that data is being fetched — not hardcoded.
 */

interface SkeletonProps {
  className?: string;
}

function SkeletonBox({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-muted/60 ${className}`}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton for a store card in the stores grid.
 */
export function StoreCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <SkeletonBox className="h-10 w-10 rounded-xl shrink-0" />
        <div className="flex-1 flex flex-col gap-1.5">
          <SkeletonBox className="h-4 w-32" />
          <SkeletonBox className="h-3 w-20" />
        </div>
        <SkeletonBox className="h-5 w-14 rounded-full" />
      </div>
      <SkeletonBox className="h-3 w-full" />
      <SkeletonBox className="h-3 w-4/5" />
      <div className="flex gap-2 mt-1">
        <SkeletonBox className="h-6 w-20 rounded-full" />
        <SkeletonBox className="h-6 w-24 rounded-full" />
      </div>
      <SkeletonBox className="h-9 w-full rounded-xl mt-1" />
    </div>
  );
}

/**
 * Skeleton for the stores grid.
 */
export function StoreGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <StoreCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for a deal/coupon card.
 */
export function DealCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <SkeletonBox className="h-10 w-10 rounded-xl shrink-0" />
        <div className="flex-1 flex flex-col gap-1.5">
          <SkeletonBox className="h-4 w-3/4" />
          <SkeletonBox className="h-3 w-1/2" />
        </div>
        <SkeletonBox className="h-6 w-16 rounded-full shrink-0" />
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-muted/40 p-3">
        <SkeletonBox className="h-4 flex-1" />
        <SkeletonBox className="h-7 w-14 rounded-lg" />
      </div>
      <div className="flex items-center justify-between">
        <SkeletonBox className="h-3 w-24" />
        <SkeletonBox className="h-3 w-20" />
      </div>
      <SkeletonBox className="h-9 w-full rounded-xl" />
    </div>
  );
}

/**
 * Skeleton for a grid of deal cards.
 */
export function DealGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <DealCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for a carousel card (horizontal scroll).
 */
export function CarouselCardSkeleton() {
  return (
    <div className="w-[280px] shrink-0 rounded-2xl border border-border/60 bg-card p-4 flex flex-col gap-3">
      <SkeletonBox className="aspect-[16/10] w-full rounded-xl" />
      <SkeletonBox className="h-4 w-full" />
      <SkeletonBox className="h-3 w-2/3" />
      <div className="flex items-center justify-between mt-1">
        <SkeletonBox className="h-5 w-16" />
        <SkeletonBox className="h-7 w-20 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Error state component — shown when an API fetch fails.
 */
export function FetchError({
  message = "Failed to load data. Please try again.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="text-3xl">⚠️</div>
      <p className="text-sm text-muted-foreground max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
