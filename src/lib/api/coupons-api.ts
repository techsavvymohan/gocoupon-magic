/**
 * @file src/lib/api/coupons-api.ts
 * @description Typed fetch client for the /api/coupons endpoint.
 *
 * All frontend code that needs coupon data calls these functions.
 * Never call /api/coupons inline — always use this typed client.
 */

export interface Coupon {
  id: string;
  storeId: string;
  storeName: string;
  code: string;
  description: string;
  discountType: "percentage" | "flat" | "free_shipping" | "cashback";
  discountValue: number;
  currency?: string;
  minOrderValue?: number;
  maxDiscount?: number;
  category?: string;
  expiresAt?: string;
  isVerified: boolean;
  successRate?: number;
  usesCount?: number;
  tags?: string[];
}

export interface CouponsApiResponse {
  store: string;
  count: number;
  coupons: Coupon[];
}

export interface FetchCouponsOptions {
  store?: string;
  domain?: string;
  limit?: number;
}

/**
 * Fetches coupons from /api/coupons.
 * Optionally filter by store name or domain.
 *
 * @example
 * // Get all Amazon coupons
 * const { coupons } = await fetchCoupons({ store: "amazon" });
 *
 * // Get all coupons across all stores
 * const { coupons } = await fetchCoupons();
 */
export async function fetchCoupons(options: FetchCouponsOptions = {}): Promise<CouponsApiResponse> {
  const params = new URLSearchParams();
  if (options.store) params.set("store", options.store);
  if (options.domain) params.set("domain", options.domain);
  if (options.limit) params.set("limit", String(options.limit));

  const url = `/api/coupons${params.size > 0 ? `?${params.toString()}` : ""}`;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(6000),
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`/api/coupons returned ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<CouponsApiResponse>;
}

/**
 * Fetches the best coupon for a given store (highest success rate).
 */
export async function fetchBestCouponForStore(store: string): Promise<Coupon | null> {
  const { coupons } = await fetchCoupons({ store, limit: 10 });
  if (!coupons.length) return null;
  // Already sorted by successRate desc on the server
  return coupons[0];
}
