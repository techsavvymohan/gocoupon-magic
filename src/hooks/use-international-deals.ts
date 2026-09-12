/**
 * @file src/hooks/use-international-deals.ts
 * @description TanStack Query hook for fetching international deals from /api/international-deals.
 */

import { useQuery } from "@tanstack/react-query";
import {
  fetchInternationalDeals,
  type FetchInternationalDealsOptions,
} from "@/lib/api/international-deals-api";
import { type Deal } from "@/lib/api/deals-api";

export interface UseInternationalDealsResult {
  deals: Deal[];
  total: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  provider?: string;
  lastSyncedAt?: string;
  refetch: () => void;
}

export function useInternationalDeals(
  options: FetchInternationalDealsOptions = {}
): UseInternationalDealsResult {
  const result = useQuery({
    queryKey: [
      "international-deals",
      options.category ?? "all",
      options.q ?? "",
      options.store ?? "",
      options.sortBy ?? "trending",
    ],
    queryFn: () => fetchInternationalDeals(options),
    staleTime: 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
  });

  return {
    deals: result.data?.deals ?? [],
    total: result.data?.total ?? 0,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    isError: result.isError,
    error: result.error,
    provider: result.data?.provider,
    lastSyncedAt: result.data?.lastSyncedAt,
    refetch: result.refetch,
  };
}
