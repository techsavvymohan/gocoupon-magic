/**
 * @file src/lib/api/stores-api.ts
 * @description Typed fetch client for the /api/stores endpoint.
 *
 * All frontend code that needs store data calls these functions.
 * NEVER import src/data/storesData.ts directly in components — use this client.
 */

export interface Store {
  id: string;
  name: string;
  slug: string;
  category: "Fashion" | "Electronics" | "Food" | "Travel" | "Beauty" | "Home" | "Recharge" | "General";
  logo?: string;
  fallbackIcon: string;
  badge?: string;
  rating: number;
  couponsCount: number;
  maxDiscount: string;
  cashbackRate: string;
  description: string;
  features: string[];
  popularCoupon: {
    code: string;
    description: string;
    discount: string;
  };
  link: string;
  isInternalRoute?: boolean;
}

export interface StoresApiResponse {
  stores: Store[];
  total: number;
  count: number;
  cached: boolean;
  meta: {
    category: string;
    q: string | null;
    limit: number;
    offset: number;
  };
}

export type StoreSortField = "popularity" | "rating" | "couponsCount" | "maxDiscount" | "cashback" | "name";

export interface FetchStoresOptions {
  category?: string;
  q?: string;
  sortBy?: StoreSortField;
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

/**
 * Fetches the store directory from /api/stores.
 * This replaces any direct import of STORES_DATA from storesData.ts.
 */
export async function fetchStores(options: FetchStoresOptions = {}): Promise<StoresApiResponse> {
  const params = new URLSearchParams();
  if (options.category && options.category !== "All") {
    params.set("category", options.category);
  }
  if (options.q) params.set("q", options.q);
  if (options.sortBy) params.set("sortBy", options.sortBy);
  if (options.order) params.set("order", options.order);
  if (options.limit) params.set("limit", String(options.limit));
  if (options.offset) params.set("offset", String(options.offset));

  const url = `/api/stores${params.size > 0 ? `?${params.toString()}` : ""}`;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(8000),
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`/api/stores returned ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<StoresApiResponse>;
}

/**
 * Fetches a single store by its ID.
 * Searches within the full stores list and returns the matching store.
 */
export async function fetchStoreById(id: string): Promise<Store | null> {
  const { stores } = await fetchStores({ limit: 200 });
  return stores.find((s) => s.id === id) ?? null;
}

/**
 * Returns a list of unique store categories from the API.
 */
export async function fetchStoreCategories(): Promise<string[]> {
  const { stores } = await fetchStores({ limit: 200 });
  const cats = Array.from(new Set(stores.map((s) => s.category)));
  return ["All", ...cats];
}
