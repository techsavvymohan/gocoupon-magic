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

import fs from "node:fs";
import path from "node:path";
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

// Hydrate live custom stores from src/data/live-stores.json if present
try {
  const customStoresPath = path.resolve(process.cwd(), "src/data/live-stores.json");
  if (fs.existsSync(customStoresPath)) {
    const raw = JSON.parse(fs.readFileSync(customStoresPath, "utf-8"));
    if (Array.isArray(raw?.stores)) {
      for (const s of raw.stores) {
        const idx = STORES_DB.findIndex((item) => item.slug === s.slug || item.id === s.id);
        if (idx >= 0) {
          STORES_DB[idx] = { ...STORES_DB[idx], ...s };
        } else {
          STORES_DB.unshift(s);
        }
      }
    }
  }
} catch {
  // Silent fallback
}

/**
 * Persists a new or updated store to STORES_DB and live-stores.json
 */
export function upsertStoreInDb(storeInput: any): StoreRecord {
  const slug = (storeInput.slug || storeInput.name || `store-${Date.now()}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const id = storeInput.id || slug;
  const name = storeInput.name || "Merchant Store";
  const logo = storeInput.logo || storeInput.storeLogo || storeInput.logoImage || storeInput.imageUrl || "";
  const category = storeInput.category || "General";
  const link = storeInput.link || storeInput.affiliateLink || `/store/${slug}`;
  const description =
    storeInput.description ||
    storeInput.tagline ||
    `Verified promo codes, deals, and vouchers for ${name}.`;

  const existingIdx = STORES_DB.findIndex(
    (s) => s.slug?.toLowerCase() === slug || s.id?.toLowerCase() === id
  );

  const mergedStore: StoreRecord = {
    id,
    name,
    slug,
    category,
    logo: logo || (existingIdx >= 0 ? STORES_DB[existingIdx].logo : ""),
    fallbackIcon: "🛍️",
    badge: storeInput.badge || (existingIdx >= 0 ? STORES_DB[existingIdx].badge : "Verified Partner"),
    rating: Number(storeInput.rating || (existingIdx >= 0 ? STORES_DB[existingIdx].rating : 4.8)),
    couponsCount: Number(
      storeInput.couponsCount || (existingIdx >= 0 ? STORES_DB[existingIdx].couponsCount + 1 : 1)
    ),
    maxDiscount:
      storeInput.maxDiscount || (existingIdx >= 0 ? STORES_DB[existingIdx].maxDiscount : "Special Offer"),
    cashbackRate:
      storeInput.cashbackRate || (existingIdx >= 0 ? STORES_DB[existingIdx].cashbackRate : "Available"),
    description,
    features: storeInput.features || (existingIdx >= 0 ? STORES_DB[existingIdx].features : []),
    popularCoupon: {
      code:
        storeInput.popularCoupon?.code ||
        storeInput.code ||
        (existingIdx >= 0 ? STORES_DB[existingIdx].popularCoupon.code : ""),
      description:
        storeInput.popularCoupon?.description ||
        storeInput.couponDescription ||
        storeInput.title ||
        (existingIdx >= 0 ? STORES_DB[existingIdx].popularCoupon.description : "Latest verified offers"),
      discount:
        storeInput.popularCoupon?.discount ||
        storeInput.discount ||
        (existingIdx >= 0 ? STORES_DB[existingIdx].popularCoupon.discount : "Exclusive Deal"),
    },
    link,
    isInternalRoute: Boolean(storeInput.isInternalRoute ?? (link.startsWith("/") || !link)),
  };

  if (existingIdx >= 0) {
    STORES_DB[existingIdx] = { ...STORES_DB[existingIdx], ...mergedStore };
  } else {
    STORES_DB.unshift(mergedStore);
  }

  // Persist to disk in src/data/live-stores.json
  try {
    const customStoresPath = path.resolve(process.cwd(), "src/data/live-stores.json");
    let diskData: any = { stores: [], updatedAt: new Date().toISOString() };
    if (fs.existsSync(customStoresPath)) {
      diskData = JSON.parse(fs.readFileSync(customStoresPath, "utf-8"));
      if (!Array.isArray(diskData.stores)) diskData.stores = [];
    }
    const diskIdx = diskData.stores.findIndex(
      (s: any) => s.slug?.toLowerCase() === slug || s.id?.toLowerCase() === id
    );
    if (diskIdx >= 0) {
      diskData.stores[diskIdx] = { ...diskData.stores[diskIdx], ...mergedStore };
    } else {
      diskData.stores.unshift(mergedStore);
    }
    diskData.updatedAt = new Date().toISOString();
    fs.writeFileSync(customStoresPath, JSON.stringify(diskData, null, 2), "utf-8");

    // Also persist in dist if present
    const distPath = path.resolve(process.cwd(), "dist/data/live-stores.json");
    if (fs.existsSync(path.dirname(distPath))) {
      fs.writeFileSync(distPath, JSON.stringify(diskData, null, 2), "utf-8");
    }
  } catch (err: any) {
    console.warn("[Stores DB Disk Write Warning]:", err.message);
  }

  return mergedStore;
}

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
