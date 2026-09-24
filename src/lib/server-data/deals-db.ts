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
  category: DealCategory | string;
  title: string;
  code: string;
  discount: string;
  badge: DealBadge | string;
  verifiedDate: string;
  expiresIn: string;
  endDate?: string;
  minOrder?: string;
  terms: string;
  link: string;
  usesCount: number;
  description?: string;
  url?: string;
  merchantUrl?: string;
  imageUrl?: string;
  verified?: boolean;
  votesCount?: number;
  rating?: number;
  source?: string;
  status?: string;
  type?: string;
  isFeatured?: boolean;
  featuredPriority?: number;
  campaignSource?: string;
  targetCountry?: string;
  verificationStatus?: string;
  seoKeywords?: string[];
  directAnswer?: string;
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

export interface UserCouponSubmission {
  id: string;
  storeName: string;
  code: string;
  discount?: string;
  url?: string;
  terms?: string;
  category?: string;
  email?: string;
  submittedAt: string;
  status: "pending" | "verified" | "approved" | "rejected";
}

const userSubmissionsPool: UserCouponSubmission[] = [];

export function recordUserCouponSubmission(
  data: Omit<UserCouponSubmission, "id" | "submittedAt" | "status">
): UserCouponSubmission {
  const submission: UserCouponSubmission = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ...data,
    submittedAt: new Date().toISOString(),
    status: "pending",
  };
  userSubmissionsPool.unshift(submission);
  return submission;
}

export function getUserCouponSubmissions(): UserCouponSubmission[] {
  return [...userSubmissionsPool];
}

export interface PopularBrandSummary {
  name: string;
  slug: string;
  query: string;
  logo: string;
  tagline: string;
  couponsCount: number;
  offersCount: number;
  maxDiscount: string;
  category: string;
}

export interface StoreSummary {
  name: string;
  slug: string;
  query: string;
  logo: string;
  couponsCount: number;
  offersCount: number;
  maxDiscount: string;
  category: string;
  topTitle?: string;
  affiliateUrl?: string;
}

export interface CategorySummary {
  name: string;
  slug: string;
  offersCount: number;
  couponsCount: number;
  storesCount: number;
  topStores: string[];
  maxDiscount: string;
  description: string;
}

export function getAllStoresFromPool(customDeals?: DealRecord[]): StoreSummary[] {
  const deals = customDeals || getLiveDeals();
  const map = new Map<
    string,
    {
      name: string;
      slug: string;
      query: string;
      logo: string;
      couponsCount: number;
      offersCount: number;
      maxDiscount: string;
      category: string;
      topTitle?: string;
      affiliateUrl?: string;
    }
  >();

  for (const d of deals) {
    const rawName = (d.storeName || "").trim();
    if (!rawName) continue;
    const key = rawName.toLowerCase();
    const existing = map.get(key);

    const hasCode = Boolean(d.code && d.code.length > 1);
    const disc = d.discount || "";

    if (!existing) {
      map.set(key, {
        name: rawName,
        slug: d.storeSlug || rawName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        query: key,
        logo:
          d.storeLogo ||
          `https://www.google.com/s2/favicons?domain=${rawName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com&sz=128`,
        couponsCount: hasCode ? 1 : 0,
        offersCount: 1,
        maxDiscount: disc,
        category: d.category || "General",
        topTitle: d.title,
        affiliateUrl: d.link,
      });
    } else {
      existing.offersCount += 1;
      if (hasCode) existing.couponsCount += 1;
      if (d.storeLogo && !existing.logo.includes("/Brand logos/")) {
        existing.logo = d.storeLogo;
      }
      if (disc && (!existing.maxDiscount || parseDealDiscount(disc) > parseDealDiscount(existing.maxDiscount))) {
        existing.maxDiscount = disc;
      }
    }
  }

  const stores = Array.from(map.values());
  // Sort by most active stores first (coupons + offers)
  stores.sort((a, b) => b.couponsCount * 2 + b.offersCount - (a.couponsCount * 2 + a.offersCount));
  return stores;
}

export function getAllCategoriesFromPool(customDeals?: DealRecord[]): CategorySummary[] {
  const deals = customDeals || getLiveDeals();
  const map = new Map<
    string,
    {
      offersCount: number;
      couponsCount: number;
      stores: Set<string>;
      maxDisc: string;
    }
  >();

  const CATEGORY_DESCRIPTIONS: Record<string, string> = {
    Beauty: "Skincare, cosmetics, personal care & fragrances with verified coupons",
    Fashion: "Clothing, footwear, ethnic wear & accessories across top fashion brands",
    Electronics: "Mobiles, laptops, audio gear, TVs & smart home tech deals",
    Food: "Dining discounts, meal deliveries, beverages, snacks & gourmet vouchers",
    Travel: "Flight bookings, hotel stays, holidays, trains & cab discount coupons",
    Home: "Furniture, home decor, kitchen appliances & bedding super savers",
    Recharge: "Mobile prepaid recharges, bill payments, DTH & broadband savings",
    General: "Online hypermarkets, mega stores & multi-category deal vouchers",
  };

  for (const d of deals) {
    const cat = (d.category || "General").trim();
    if (!cat) continue;
    const existing = map.get(cat) || {
      offersCount: 0,
      couponsCount: 0,
      stores: new Set<string>(),
      maxDisc: "",
    };

    existing.offersCount += 1;
    if (d.code && d.code.length > 1) {
      existing.couponsCount += 1;
    }
    if (d.storeName) {
      existing.stores.add(d.storeName);
    }
    if (d.discount && parseDealDiscount(d.discount) > parseDealDiscount(existing.maxDisc)) {
      existing.maxDisc = d.discount;
    }
    map.set(cat, existing);
  }

  const list: CategorySummary[] = [];
  for (const [name, val] of map.entries()) {
    list.push({
      name,
      slug: name.toLowerCase(),
      offersCount: val.offersCount,
      couponsCount: val.couponsCount,
      storesCount: val.stores.size,
      topStores: Array.from(val.stores).slice(0, 4),
      maxDiscount: val.maxDisc || "Up to 70% OFF",
      description: CATEGORY_DESCRIPTIONS[name] || "Hand-verified coupons and savings for top brands",
    });
  }

  list.sort((a, b) => b.offersCount - a.offersCount);
  return list;
}

export function getPopularBrandsFromPool(customDeals?: DealRecord[]): PopularBrandSummary[] {
  const deals = customDeals || getLiveDeals();
  const allStores = getAllStoresFromPool(deals);
  
  // Extract top 8 stores directly from real live data pool
  return allStores.slice(0, 8).map((s) => ({
    name: s.name,
    slug: s.slug,
    query: s.query,
    logo: s.logo,
    tagline: `${s.category} • ${s.maxDiscount || 'Verified Offers'}`,
    couponsCount: s.couponsCount,
    offersCount: s.offersCount,
    maxDiscount: s.maxDiscount,
    category: s.category,
  }));
}

/**
 * Returns deals, optionally filtered by category, search query, badge, letter, brand, festive status, and pagination,
 * sorted by discount, trending (popularity), verified status, expiry, or store name.
 */
export function queryDeals(
  options: {
    category?: string;
    q?: string;
    store?: string;
    brand?: string;
    letter?: string;
    festive?: boolean;
    featured?: boolean;
    includeExpired?: boolean;
    city?: string;
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

  // Enforce dynamic expiry pruning so expired deals are never returned (unless admin explicitly includes expired)
  if (!options.includeExpired) {
    results = results.filter((d) => {
      if (d.expiresIn === "Expired") return false;
      if (d.endDate) {
        const end = new Date(d.endDate).getTime();
        if (!isNaN(end) && end < now) return false;
      }
      return true;
    });
  }

  // Filter by featured status
  if (options.featured !== undefined) {
    results = results.filter((d) => Boolean(d.isFeatured) === options.featured);
  }

  // Filter by store or merchant
  if (options.store && options.store.toLowerCase() !== "all") {
    const s = options.store.toLowerCase().replace(/[^a-z0-9]/g, "");
    results = results.filter((d) => {
      const dStore = (d.storeName || d.storeSlug).toLowerCase().replace(/[^a-z0-9]/g, "");
      return dStore.includes(s) || s.includes(dStore);
    });
  }

  // Filter by brand name
  if (options.brand && options.brand.toLowerCase() !== "all") {
    const b = options.brand.toLowerCase().trim();
    results = results.filter((d) => {
      const dStore = (d.storeName || "").toLowerCase();
      const dTitle = (d.title || "").toLowerCase();
      return dStore.includes(b) || dTitle.includes(b);
    });
  }

  // Filter by letter (A-Z)
  if (options.letter && options.letter.toUpperCase() !== "ALL") {
    const char = options.letter.trim().charAt(0).toUpperCase();
    results = results.filter((d) => {
      const firstChar = (d.storeName || "").trim().charAt(0).toUpperCase();
      return firstChar === char;
    });
  }

  // Filter by festive sales
  if (options.festive) {
    results = results.filter((d) => {
      const text = `${d.title} ${d.category} ${d.terms || ""}`.toLowerCase();
      return (
        text.includes("sale") ||
        text.includes("festival") ||
        text.includes("festive") ||
        text.includes("diwali") ||
        text.includes("dhamaka") ||
        text.includes("mega") ||
        text.includes("super") ||
        d.badge === "Exclusive" ||
        d.badge === "Trending"
      );
    });
  }

  // Filter by category
  if (options.category && options.category.toLowerCase() !== "all") {
    const catLower = options.category.toLowerCase();
    results = results.filter((d) => {
      const dCat = d.category.toLowerCase();
      return dCat === catLower || dCat.includes(catLower) || catLower.includes(dCat);
    });
  }

  // Filter by badge
  if (options.badge) {
    results = results.filter((d) => d.badge === options.badge);
  }

  // Filter by search query
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
  const offset = options.offset && options.offset > 0 ? options.offset : 0;
  const limit = options.limit && options.limit > 0 ? options.limit : (results.length - offset);

  return {
    deals: results.slice(offset, offset + limit),
    total,
  };
}
