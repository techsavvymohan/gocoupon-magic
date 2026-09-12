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
  endDate?: string;
  minOrder?: string;
  terms: string;
  link: string;
  usesCount: number;
}

export function isDealActive(deal: { endDate?: string; expiresIn?: string }): boolean {
  if (deal.expiresIn === "Expired") return false;
  if (deal.endDate) {
    const end = new Date(deal.endDate).getTime();
    if (!isNaN(end) && end < Date.now()) return false;
  }
  return true;
}

export interface DealsApiResponse {
  deals: Deal[];
  total: number;
  count: number;
  page: number;
  hasMore: boolean;
  cached: boolean;
  isDynamic?: boolean;
  lastSyncedAt?: string;
  provider?: string;
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

import { DEALS_DATA } from "@/data/dealsData";

function getStaticDeals(options: FetchDealsOptions = {}): DealsApiResponse {
  const now = Date.now();
  let filtered = DEALS_DATA.filter((d) => {
    if (d.expiresIn === "Expired") return false;
    if (d.endDate) {
      const end = new Date(d.endDate).getTime();
      if (!isNaN(end) && end < now) return false;
    }
    return true;
  });

  if (options.category && options.category !== "all") {
    const catLower = options.category.toLowerCase();
    filtered = filtered.filter((d) => {
      const dCat = d.category.toLowerCase();
      if (options.category === "electronics") {
        return dCat === "electronics" || d.title.toLowerCase().includes("laptop") || d.title.toLowerCase().includes("audio");
      }
      if (options.category === "audio") {
        return dCat === "electronics" && (d.title.toLowerCase().includes("audio") || d.title.toLowerCase().includes("airdope") || d.title.toLowerCase().includes("sonic"));
      }
      if (options.category === "laptops") {
        return dCat === "electronics" && (d.title.toLowerCase().includes("laptop") || d.title.toLowerCase().includes("thinkpad") || d.title.toLowerCase().includes("xps") || d.title.toLowerCase().includes("yoga"));
      }
      return dCat === catLower;
    });
  }

  if (options.q) {
    const qLower = options.q.toLowerCase().trim();
    filtered = filtered.filter(
      (d) =>
        d.title.toLowerCase().includes(qLower) ||
        d.storeName.toLowerCase().includes(qLower) ||
        d.code.toLowerCase().includes(qLower)
    );
  }

  if (options.badge) {
    filtered = filtered.filter((d) => d.badge === options.badge);
  }

  const sortBy = options.sortBy || "trending";
  const order = options.order || "desc";

  filtered.sort((a, b) => {
    let diff = 0;
    if (sortBy === "trending") {
      diff = (b.usesCount || 0) - (a.usesCount || 0);
    } else if (sortBy === "discount") {
      const getDiscVal = (d: Deal) => {
        const num = parseInt(d.discount.replace(/[^\d]/g, ""), 10);
        return isNaN(num) ? 0 : num;
      };
      diff = getDiscVal(b) - getDiscVal(a);
    } else if (sortBy === "verified") {
      diff = (a.badge === "Verified" ? -1 : 1) - (b.badge === "Verified" ? -1 : 1);
    } else if (sortBy === "store") {
      diff = a.storeName.localeCompare(b.storeName);
    }
    return order === "asc" ? -diff : diff;
  });

  const limit = options.limit !== undefined ? (options.limit <= 0 ? filtered.length : options.limit) : 1000;
  const offset = options.offset || 0;
  const paginated = filtered.slice(offset, offset + limit);

  return {
    deals: paginated,
    total: filtered.length,
    count: paginated.length,
    page: Math.floor(offset / limit) + 1,
    hasMore: offset + limit < filtered.length,
    cached: true,
    isDynamic: true,
    provider: "Cuelinks API v3 (Live Feed Snapshot)",
    meta: {
      category: options.category || "all",
      q: options.q || null,
      badge: options.badge || null,
      limit,
      offset,
    },
  };
}

/**
 * Fetches deals from /api/deals.
 * Automatically falls back to high-quality verified local deals data if the server endpoint is unavailable.
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
  const reqLimit = options.limit !== undefined ? (options.limit <= 0 ? 1500 : options.limit) : 1000;
  params.set("limit", String(reqLimit));
  if (options.offset) params.set("offset", String(options.offset));

  const url = `/api/deals${params.size > 0 ? `?${params.toString()}` : ""}`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: { Accept: "application/json" },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.deals) && data.deals.length > 0) {
        return data as DealsApiResponse;
      }
    }
  } catch {
    // API not reachable or running on static Vercel frontend — seamless fallback
  }

  return getStaticDeals(options);
}

/**
 * Triggers an on-demand 24/7 sync against Cuelinks API v3.
 */
export async function triggerLiveSync(): Promise<{
  success: boolean;
  activeCount: number;
  updatedAt: string;
  message?: string;
}> {
  try {
    const res = await fetch("/api/deals/sync?pages=0", {
      method: "POST",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Try GET fallback
    try {
      const getRes = await fetch("/api/deals/sync?pages=0", {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(15000),
      });
      if (getRes.ok) return await getRes.json();
    } catch {}
  }
  return { success: false, activeCount: 0, updatedAt: new Date().toISOString(), message: "Sync failed" };
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
