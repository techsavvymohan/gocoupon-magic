/**
 * @file src/hooks/use-coupons.ts
 * @description TanStack Query hooks for fetching coupons from /api/coupons.
 *
 * @example
 * function CouponsList({ store }) {
 *   const { coupons, isLoading } = useCoupons({ store });
 *   if (isLoading) return <Skeleton />;
 *   return coupons.map(c => <CouponCard key={c.id} coupon={c} />);
 * }
 */

import { useQuery } from "@tanstack/react-query";
import { fetchCoupons, type Coupon, type FetchCouponsOptions } from "@/lib/api/coupons-api";

export interface UseCouponsResult {
  coupons: Coupon[];
  total: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetches and caches coupons from /api/coupons.
 *
 * Cache behavior:
 *   staleTime: 5 minutes
 *   gcTime:    20 minutes
 *   retry:     1
 */
export function useCoupons(options: FetchCouponsOptions = {}): UseCouponsResult {
  const result = useQuery<Awaited<ReturnType<typeof fetchCoupons>>, Error>({
    queryKey: ["coupons", options.store ?? "all", options.domain ?? "", options.limit ?? 50],
    queryFn: () => fetchCoupons(options),
    staleTime: 5 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    retry: 1,
    placeholderData: { store: "all", count: 0, coupons: [] },
  });

  return {
    coupons: result.data?.coupons ?? [],
    total: result.data?.count ?? 0,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
}

/**
 * Fetches coupons for a specific store.
 */
export function useStoreCoupons(store: string, limit = 20): UseCouponsResult {
  return useCoupons({ store, limit });
}
