/**
 * @file src/lib/server-data/deals-db.ts
 * @description Server-side deals data module.
 *
 * This is the single source of truth for deals/coupons data that the API reads.
 * The frontend no longer imports dealsData.ts directly — it fetches from
 * /api/deals instead, which reads from this module.
 *
 * Phase 2 upgrade: Replace the static array with a Supabase query:
 *   const { data } = await supabase
 *     .from("deals")
 *     .select("*")
 *     .gt("expires_at", new Date().toISOString())
 *     .order("uses_count", { ascending: false });
 *   return data;
 */

export type DealBadge = "Verified" | "Exclusive" | "Trending" | "Expiring Soon" | "Bank Offer";
export type DealCategory = "Fashion" | "Electronics" | "Food" | "Travel" | "Beauty" | "Home" | "Recharge" | "General";

export interface DealRecord {
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

// ---------------------------------------------------------------------------
// Dynamic Cuelinks 24/7 Live Deals Store (Replaces Static Mock Offers)
// ---------------------------------------------------------------------------
import liveDealsSnapshot from "../../data/live-deals.json";

let activeLiveDeals: DealRecord[] = Array.isArray((liveDealsSnapshot as any)?.deals)
  ? ((liveDealsSnapshot as any).deals as DealRecord[])
  : [];

export function setLiveDeals(deals: DealRecord[]): void {
  activeLiveDeals = [...deals];
}

export function getLiveDeals(): DealRecord[] {
  const now = Date.now();
  return activeLiveDeals.filter((d) => {
    if (d.expiresIn === "Expired") return false;
    if (d.endDate) {
      const end = new Date(d.endDate).getTime();
      if (!isNaN(end) && end < now) return false;
    }
    return true;
  });
}

export const DEALS_DB: DealRecord[] = activeLiveDeals;


export type DealSortOption = "discount" | "trending" | "verified" | "expiry" | "store";

function parseDealDiscount(text: string): number {
  if (!text) return 0;
  const pctMatch = text.match(/([0-9]+)\s*%/);
  if (pctMatch) return parseInt(pctMatch[1], 10);
  const rupeeMatch = text.match(/(?:₹|Rs\.?)\s*([0-9,]+)/i);
  if (rupeeMatch) {
    const val = parseInt(rupeeMatch[1].replace(/,/g, ""), 10);
    return Math.min(100, Math.round(val / 50));
  }
  return 0;
}

function parseExpiryDays(expiresIn: string): number {
  if (!expiresIn) return 999;
  if (expiresIn.includes("day left") || expiresIn.includes("1 day")) return 1;
  const match = expiresIn.match(/([0-9]+)\s*days?/i);
  return match ? parseInt(match[1], 10) : 30;
}

/**
 * Returns deals, optionally filtered by category, search query, badge, and pagination,
 * sorted by discount, trending (popularity), verified status, expiry, or store name.
 */
export function queryDeals(
  options: {
    category?: string;
    q?: string;
    store?: string;
    badge?: DealBadge;
    sortBy?: DealSortOption;
    order?: "asc" | "desc";
    limit?: number;
    offset?: number;
  },
  customDeals?: DealRecord[]
): { deals: DealRecord[]; total: number } {
  const now = Date.now();
  let results = customDeals ? [...customDeals] : getLiveDeals();

  // Enforce dynamic expiry pruning so expired deals are never returned
  results = results.filter((d) => {
    if (d.expiresIn === "Expired") return false;
    if (d.endDate) {
      const end = new Date(d.endDate).getTime();
      if (!isNaN(end) && end < now) return false;
    }
    return true;
  });

  if (options.store && options.store.toLowerCase() !== "all") {
    const s = options.store.toLowerCase().replace(/[^a-z0-9]/g, "");
    results = results.filter((d) => {
      const dStore = (d.storeName || d.storeSlug).toLowerCase().replace(/[^a-z0-9]/g, "");
      return dStore.includes(s) || s.includes(dStore);
    });
  }

  if (options.category && options.category.toLowerCase() !== "all") {
    const catLower = options.category.toLowerCase();
    results = results.filter((d) => {
      const dCat = d.category.toLowerCase();
      return dCat === catLower || dCat.includes(catLower) || catLower.includes(dCat);
    });
  }

  if (options.badge) {
    results = results.filter((d) => d.badge === options.badge);
  }

  if (options.q) {
    const q = options.q.toLowerCase();
    results = results.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.storeName.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.discount.toLowerCase().includes(q)
    );
  }

  const sortBy = options.sortBy || "trending";
  const order = options.order || "desc";

  results.sort((a, b) => {
    let comp = 0;
    switch (sortBy) {
      case "discount":
        comp = parseDealDiscount(a.discount) - parseDealDiscount(b.discount);
        break;
      case "verified":
        comp = (a.badge?.toLowerCase() === "verified" ? 1 : 0) - (b.badge?.toLowerCase() === "verified" ? 1 : 0);
        break;
      case "expiry":
        comp = parseExpiryDays(a.expiresIn) - parseExpiryDays(b.expiresIn);
        break;
      case "store":
        comp = a.storeName.localeCompare(b.storeName);
        break;
      case "trending":
      default:
        comp = a.usesCount - b.usesCount;
        break;
    }
    return order === "asc" ? comp : -comp;
  });

  const total = results.length;
  const offset = options.offset ?? 0;
  const limit = options.limit ?? results.length;

  return {
    deals: results.slice(offset, offset + limit),
    total,
  };
}
