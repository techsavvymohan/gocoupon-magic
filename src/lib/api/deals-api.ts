/**
 * @file src/lib/api/deals-api.ts
 * @description Typed fetch client for the /api/deals endpoint.
 *
 * All frontend code that needs deals/offers calls these functions.
 * NEVER import src/data/dealsData.ts directly in components — use this client.
 */

export type DealBadge = "Verified" | "Exclusive" | "Trending" | "Expiring Soon" | "Bank Offer";
export type DealCategory = "Fashion" | "Electronics" | "Food" | "Travel" | "Beauty" | "Home" | "Recharge" | "General";

export interface Deal {
  id: string;
  storeName: string;
  storeSlug: string;
  storeLogo?: string;
  category: DealCategory;
  title: string;
  code: string;
  discount: string;
  badge: DealBadge;
  verifiedDate: string;
  expiresIn: string;
  minOrder?: string;
  terms: string;
  link: string;
  usesCount: number;
}

export interface DealsApiResponse {
  deals: Deal[];
  total: number;
  count: number;
  page: number;
  hasMore: boolean;
  cached: boolean;
  meta: {
    category: string;
    q: string | null;
    badge: string | null;
    limit: number;
    offset: number;
  };
}

export type DealSortField = "discount" | "trending" | "verified" | "expiry" | "store";

export interface FetchDealsOptions {
  category?: string;
  q?: string;
  badge?: DealBadge;
  sortBy?: DealSortField;
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

/**
 * Fetches deals from /api/deals.
 * This replaces any direct import of DEALS_DATA or CURATED_DEALS from dealsData.ts.
 */
export async function fetchDeals(options: FetchDealsOptions = {}): Promise<DealsApiResponse> {
  const params = new URLSearchParams();
  if (options.category && options.category !== "all") {
    params.set("category", options.category);
  }
  if (options.q) params.set("q", options.q);
  if (options.badge) params.set("badge", options.badge);
  if (options.sortBy) params.set("sortBy", options.sortBy);
  if (options.order) params.set("order", options.order);
  if (options.limit) params.set("limit", String(options.limit));
  if (options.offset) params.set("offset", String(options.offset));

  const url = `/api/deals${params.size > 0 ? `?${params.toString()}` : ""}`;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(8000),
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`/api/deals returned ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<DealsApiResponse>;
}

/**
 * Convenience: fetches only "Trending" deals.
 */
export async function fetchTrendingDeals(limit = 8): Promise<Deal[]> {
  const { deals } = await fetchDeals({ badge: "Trending", limit });
  return deals;
}

/**
 * Convenience: fetches deals by category.
 */
export async function fetchDealsByCategory(category: DealCategory, limit = 20): Promise<Deal[]> {
  const { deals } = await fetchDeals({ category, limit });
  return deals;
}
