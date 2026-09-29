/**
 * @file src/data/dealsData.ts
 * @description Dynamic Live Deals Data Module.
 *
 * The live-deals.json file is served as a static asset from /data/live-deals.json
 * and fetched at runtime — NOT bundled — to keep the JS bundle small.
 */

import type { DealCategory, DealBadge } from "@/lib/server-data/deals-db";

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

// Filter out expired deals from a deal array
const _now = Date.now();
function filterActive(deals: Deal[]): Deal[] {
  return deals.filter((d) => {
    if (d.expiresIn === "Expired") return false;
    if (d.endDate) {
      const end = new Date(d.endDate).getTime();
      if (!isNaN(end) && end < _now) return false;
    }
    return true;
  });
}

// In-memory cache so we only fetch once per session
let _dealsCache: Deal[] | null = null;

/**
 * Fetch live deals from the static JSON endpoint (never bundled).
 * Falls back to empty array if the file is unavailable.
 */
export async function loadDealsData(): Promise<Deal[]> {
  if (_dealsCache) return _dealsCache;
  try {
    const res = await fetch("/data/live-deals.json", {
      cache: "no-cache",
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const json = await res.json();
      const raw: Deal[] = Array.isArray(json?.deals) ? json.deals : [];
      _dealsCache = filterActive(raw);
      return _dealsCache;
    }
  } catch {
    // Fetch failed — API will serve deals instead
  }
  return [];
}

/**
 * @deprecated Use loadDealsData() (async) or fetchDeals() from deals-api.ts instead.
 * Kept for backward compatibility — returns an empty array synchronously.
 */
export const DEALS_DATA: Deal[] = [];

export const LAST_CUELINKS_SYNC_TIME = new Date().toISOString();
export const TOTAL_LIVE_DEALS_COUNT = 0;
