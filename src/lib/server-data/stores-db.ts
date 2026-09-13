/**
 * @file src/lib/server-data/stores-db.ts
 * @description Server-side store data module.
 *
 * This is the single source of truth for store data that the API reads.
 * The frontend no longer imports storesData.ts directly — it fetches
 * from /api/stores instead, which reads from this module.
 *
 * Phase 2 upgrade: Replace the exported array with a Supabase query:
 *   const { data } = await supabase.from("stores").select("*");
 *   return data;
 */

import { STORES_DATA } from "../../data/storesData.js";

export interface StoreRecord {
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

// ---------------------------------------------------------------------------
// Phase 1: Static data served through the API (NOT bundled into the browser)
// ---------------------------------------------------------------------------
// This data is identical to what was in src/data/storesData.ts, but now it
// lives server-side. The frontend no longer imports it directly — it calls
// GET /api/stores which returns this as JSON.
//
// Phase 2: Replace this with:
//   const { data, error } = await supabase.from("stores").select("*").order("rating", { ascending: false });
//   if (error) throw error;
//   return data as StoreRecord[];
// ---------------------------------------------------------------------------

export const STORES_DB: StoreRecord[] = [...STORES_DATA];

export type StoreSortOption = "popularity" | "rating" | "couponsCount" | "maxDiscount" | "cashback" | "name";

function parsePercent(text: string): number {
  if (!text) return 0;
  const match = text.match(/([0-9.]+)\s*%/);
  return match ? parseFloat(match[1]) : 0;
}

function getStorePopularity(store: StoreRecord): number {
  const badgeWeight = store.badge?.includes("Top") ? 5 : store.badge ? 2 : 0;
  return store.rating * Math.log2(store.couponsCount + 2) + badgeWeight;
}

/**
 * Returns all stores, optionally filtered by category and/or search query,
 * and sorted by popularity, rating, coupons count, max discount, cashback, or name.
 */
export function queryStores(options: {
  category?: string;
  q?: string;
  sortBy?: StoreSortOption;
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}): { stores: StoreRecord[]; total: number } {
  let results = [...STORES_DB];

  if (options.category && options.category.toLowerCase() !== "all") {
    const catLower = options.category.toLowerCase();
    results = results.filter((s) => {
      const sCat = s.category.toLowerCase();
      return sCat === catLower || sCat.includes(catLower) || catLower.includes(sCat);
    });
  }

  if (options.q) {
    const q = options.q.toLowerCase();
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.popularCoupon.code.toLowerCase().includes(q)
    );
  }

  // Sorting
  const sortBy = options.sortBy || "popularity";
  const order = options.order || "desc";

  results.sort((a, b) => {
    let comp = 0;
    switch (sortBy) {
      case "rating":
        comp = a.rating - b.rating;
        break;
      case "couponsCount":
        comp = a.couponsCount - b.couponsCount;
        break;
      case "maxDiscount":
        comp = parsePercent(a.maxDiscount) - parsePercent(b.maxDiscount);
        break;
      case "cashback":
        comp = parsePercent(a.cashbackRate) - parsePercent(b.cashbackRate);
        break;
      case "name":
        comp = a.name.localeCompare(b.name);
        break;
      case "popularity":
      default:
        comp = getStorePopularity(a) - getStorePopularity(b);
        break;
    }
    return order === "asc" ? comp : -comp;
  });

  const total = results.length;
  const offset = options.offset ?? 0;
  const limit = options.limit ?? results.length;

  return {
    stores: results.slice(offset, offset + limit),
    total,
  };
}
