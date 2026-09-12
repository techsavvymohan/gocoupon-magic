/**
 * @file src/hooks/use-deals.ts
 * @description TanStack Query hooks for fetching deals from /api/deals.
 *
 * Components use these hooks instead of importing DEALS_DATA or CURATED_DEALS.
 * Data is fetched from /api/deals, cached for 3 minutes, and revalidated
 * in the background.
 *
 * @example
 * function DealsGrid() {
 *   const { deals, isLoading } = useDeals({ limit: 8 });
 *   if (isLoading) return <DealCardSkeleton count={8} />;
 *   return deals.map(d => <DealCard key={d.id} deal={d} />);
 * }
 */

import { useQuery } from "@tanstack/react-query";
import {
  fetchDeals,
  type Deal,
  type FetchDealsOptions,
  type DealCategory,
  type DealBadge,
} from "@/lib/api/deals-api";

export interface UseDealsResult {
  deals: Deal[];
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  lastSyncedAt?: string;
  isDynamic?: boolean;
  provider?: string;
  refetch: () => void;
}

/**
 * Fetches and caches deals from /api/deals.
 *
 * Cache behavior:
 *   staleTime: 3 minutes — deals expire faster than stores
 *   gcTime:    15 minutes — evicted from cache after 15 min of no use
 *   retry:     1 — one retry on network failure
 */
export function useDeals(options: FetchDealsOptions = {}): UseDealsResult {
  const result = useQuery<Awaited<ReturnType<typeof fetchDeals>>, Error>({
    queryKey: [
      "deals",
      options.category ?? "all",
      options.q ?? "",
      options.badge ?? "",
      options.sortBy ?? "trending",
      options.order ?? "desc",
      options.limit ?? 20,
      options.offset ?? 0,
    ],
    queryFn: () => fetchDeals(options),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    placeholderData: {
      deals: [],
      total: 0,
      count: 0,
      page: 1,
      hasMore: false,
      cached: false,
      meta: { category: "all", q: null, badge: null, limit: 20, offset: 0 },
    },
  });

  return {
    deals: result.data?.deals ?? [],
    total: result.data?.total ?? 0,
    hasMore: result.data?.hasMore ?? false,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    isError: result.isError,
    error: result.error,
    lastSyncedAt: result.data?.lastSyncedAt,
    isDynamic: result.data?.isDynamic,
    provider: result.data?.provider,
    refetch: result.refetch,
  };
}

/**
 * Fetches deals filtered by category.
 */
export function useDealsByCategory(category: DealCategory, limit = 20): UseDealsResult {
  return useDeals({ category, limit });
}

/**
 * Fetches deals filtered by badge type (e.g. "Trending", "Bank Offer").
 */
export function useDealsByBadge(badge: DealBadge, limit = 10): UseDealsResult {
  return useDeals({ badge, limit });
}

/**
 * Fetches a small set of deals for carousel/homepage use.
 */
export function useCarouselDeals(limit = 8): UseDealsResult {
  return useDeals({ limit });
}
