/**
 * @file use-products.ts
 * @description TanStack Query hook for fetching affiliate products.
 *
 * Components import this hook instead of calling product-service directly.
 * Provides caching, loading states, and error handling out of the box.
 *
 * @example
 * function MyComponent() {
 *   const { products, isLoading } = useProducts({ provider: "amazon" });
 *   if (isLoading) return <Skeleton />;
 *   return <AffiliateProductGrid products={products} />;
 * }
 */

import { useQuery } from "@tanstack/react-query";
import type { GoCouponProduct } from "@/lib/products/product-types";
import type { ProductSearchQuery } from "@/lib/affiliates/types";
import { getDealsForDisplay } from "@/lib/products/product-service";
import { getDisplayProvider } from "@/lib/affiliates/index";

export interface UseProductsOptions {
  /** Provider slug. Defaults to the active display provider. */
  provider?: string;
  /** Search/filter query. */
  query?: ProductSearchQuery;
  /** Override the stale time in ms. Default: 5 minutes. */
  staleTime?: number;
  /** Whether to enable this query (default: true) */
  enabled?: boolean;
}

export interface UseProductsResult {
  products: GoCouponProduct[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetches and caches affiliate products for display.
 *
 * Cache behavior:
 *   - staleTime: 5 minutes (products considered fresh for 5 min)
 *   - gcTime: 30 minutes (removed from cache after 30 min of no use)
 *   - retry: 1 (one retry on failure, then graceful empty state)
 *
 * Phase 2 note: When the Vercel serverless function is implemented,
 * this hook will call it via fetch() instead of the static data.
 * The hook signature and return type remain identical.
 */
export function useProducts({
  provider,
  query,
  staleTime = 5 * 60 * 1000, // 5 minutes
  enabled = true,
}: UseProductsOptions = {}): UseProductsResult {
  const resolvedProvider = provider ?? getDisplayProvider();

  const result = useQuery<GoCouponProduct[], Error>({
    queryKey: ["affiliate-products", resolvedProvider, query],
    queryFn: () => getDealsForDisplay({ provider: resolvedProvider, query }),
    staleTime,
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
    enabled: enabled && !!resolvedProvider,
    // On error, return empty array (never crash the page)
    placeholderData: [],
  });

  return {
    products: result.data ?? [],
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
}

/**
 * Fetches a subset of products for the animated carousel.
 * Applies a default limit suitable for carousels.
 */
export function useCarouselProducts(options: Omit<UseProductsOptions, "query"> & {
  limit?: number;
  country?: "IN" | "US";
} = {}): UseProductsResult {
  return useProducts({
    ...options,
    query: {
      country: options.country ?? "IN",
      limit: options.limit ?? 8,
    },
  });
}

/**
 * Fetches featured/grid products (typically 3–6 for a product grid section).
 */
export function useFeaturedProducts(options: Omit<UseProductsOptions, "query"> & {
  limit?: number;
  country?: "IN" | "US";
} = {}): UseProductsResult {
  return useProducts({
    ...options,
    query: {
      country: options.country ?? "IN",
      limit: options.limit ?? 3,
    },
  });
}
