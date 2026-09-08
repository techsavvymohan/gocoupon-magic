/**
 * @file src/hooks/use-stores.ts
 * @description TanStack Query hooks for fetching stores from /api/stores.
 *
 * Components use these hooks instead of importing STORES_DATA directly.
 * This makes store data live — fetched from the backend on every page load,
 * cached for 5 minutes, and revalidated in the background.
 *
 * @example
 * function StoresPage() {
 *   const { stores, isLoading, total } = useStores();
 *   if (isLoading) return <StoreGridSkeleton />;
 *   return stores.map(s => <StoreCard key={s.id} store={s} />);
 * }
 */

import { useQuery } from "@tanstack/react-query";
import { fetchStores, type Store, type FetchStoresOptions } from "@/lib/api/stores-api";

export interface UseStoresResult {
  stores: Store[];
  total: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetches and caches stores from /api/stores.
 *
 * Cache behavior:
 *   staleTime: 5 minutes — stores are considered fresh for 5 min
 *   gcTime:    30 minutes — evicted from cache after 30 min of no use
 *   retry:     1 — one retry on network failure, then graceful empty state
 */
export function useStores(options: FetchStoresOptions = {}): UseStoresResult {
  const result = useQuery<Awaited<ReturnType<typeof fetchStores>>, Error>({
    queryKey: [
      "stores",
      options.category ?? "all",
      options.q ?? "",
      options.sortBy ?? "popularity",
      options.order ?? "desc",
      options.limit ?? 200,
      options.offset ?? 0,
    ],
    queryFn: () => fetchStores(options),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    placeholderData: {
      stores: [],
      total: 0,
      count: 0,
      cached: false,
      meta: { category: "all", q: null, limit: 200, offset: 0 },
    },
  });

  return {
    stores: result.data?.stores ?? [],
    total: result.data?.total ?? 0,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
}

/**
 * Fetches stores filtered by category.
 */
export function useStoresByCategory(category: string): UseStoresResult {
  return useStores({ category, limit: 200 });
}

/**
 * Searches stores by keyword query.
 */
export function useStoreSearch(q: string): UseStoresResult {
  return useStores({ q: q.trim(), limit: 50 });
}
