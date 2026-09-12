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
  minOrder?: string;
  terms: string;
  link: string;
  usesCount: number;
}

// ---------------------------------------------------------------------------
// Phase 1: Static data served via API (NOT bundled into the browser JS)
// ---------------------------------------------------------------------------
// Previously this lived in src/data/dealsData.ts and was imported directly
// in components — bundled into every page's JS chunk.
//
// Now it lives here and is served via GET /api/deals as JSON, fetched at
// runtime by the TanStack Query useDeals() hook.
// ---------------------------------------------------------------------------

export const DEALS_DB: DealRecord[] = [
  {
    id: "deal-fk-1",
    storeName: "Flipkart",
    storeSlug: "flipkart-coupons",
    storeLogo: "/Brand logos/flipkart.webp",
    category: "Electronics",
    title: "Flat ₹1,500 Instant Discount on Smart TVs & Laptops",
    code: "FKTECH1500",
    discount: "₹1,500 OFF",
    badge: "Verified",
    verifiedDate: "Today",
    expiresIn: "3 days left",
    minOrder: "₹15,000",
    terms: "Valid on prepaid HDFC/ICICI Bank cards and NetBanking. Cannot be combined with exchange bonus.",
    link: "/flipkart-coupons",
    usesCount: 4230,
  },
  {
    id: "deal-amz-1",
    storeName: "Amazon India",
    storeSlug: "amazon-coupons",
    storeLogo: "/Brand logos/Amazon_logo.svg.webp",
    category: "Home",
    title: "Save Flat ₹400 on Kitchen Essentials & Cookware",
    code: "AMZKITCHEN400",
    discount: "₹400 OFF",
    badge: "Exclusive",
    verifiedDate: "Today",
    expiresIn: "5 days left",
    minOrder: "₹1,999",
    terms: "Applicable on select kitchen appliances and cookware sets for Amazon Prime members.",
    link: "/amazon-coupons",
    usesCount: 3120,
  },
  {
    id: "deal-myn-1",
    storeName: "Myntra",
    storeSlug: "myntra-coupons",
    storeLogo: "/Brand logos/myntra.webp",
    category: "Fashion",
    title: "Flat ₹500 OFF on Branded Sneakers & Footwear",
    code: "MYNSHOE500",
    discount: "₹500 OFF",
    badge: "Trending",
    verifiedDate: "Today",
    expiresIn: "2 days left",
    minOrder: "₹2,499",
    terms: "Valid on Nike, Puma, Adidas, and Skechers collections on Myntra.",
    link: "/myntra-coupons",
    usesCount: 5890,
  },
  {
    id: "deal-mee-1",
    storeName: "Meesho",
    storeSlug: "meesho-coupons",
    storeLogo: "/Brand logos/Meesho_logo.webp",
    category: "Fashion",
    title: "Flat 20% Instant Discount on Ethnic Wear & Sarees",
    code: "MEESHOTRAD20",
    discount: "20% OFF",
    badge: "Verified",
    verifiedDate: "Today",
    expiresIn: "6 days left",
    minOrder: "₹499",
    terms: "Valid on ethnic wear, sarees, and traditional collections. No minimum on select items.",
    link: "/meesho-coupons",
    usesCount: 6740,
  },
  {
    id: "deal-croma-1",
    storeName: "Croma",
    storeSlug: "croma-coupons",
    storeLogo: "/Brand logos/croma-logo.webp",
    category: "Electronics",
    title: "Extra ₹3,000 Instant Bank Discount on ACs & Refrigerators",
    code: "CROMAOFF3000",
    discount: "₹3,000 OFF",
    badge: "Bank Offer",
    verifiedDate: "Today",
    expiresIn: "7 days left",
    minOrder: "₹20,000",
    terms: "Valid on HDFC, ICICI, SBI, and Axis Bank credit cards on Croma.com and Croma stores.",
    link: "https://www.croma.com",
    usesCount: 2100,
  },
  {
    id: "deal-nyk-1",
    storeName: "Nykaa",
    storeSlug: "nykaa-coupons",
    storeLogo: "/Brand logos/nykaa-logo.webp",
    category: "Beauty",
    title: "20% OFF on Luxury Skincare & International Cosmetics",
    code: "NYKAASKIN20",
    discount: "20% OFF",
    badge: "Exclusive",
    verifiedDate: "Today",
    expiresIn: "4 days left",
    minOrder: "₹999",
    terms: "Valid on L'Oreal Paris, Maybelline, Lakme, and MAC brands. Excludes combos and gift sets.",
    link: "https://www.nykaa.com",
    usesCount: 4500,
  },
  {
    id: "deal-amz-bank-1",
    storeName: "Amazon India",
    storeSlug: "amazon-coupons",
    storeLogo: "/Brand logos/Amazon_logo.svg.webp",
    category: "Electronics",
    title: "HDFC Bank Card 10% Instant Discount on Electronics",
    code: "HDFC10AMZ",
    discount: "10% OFF",
    badge: "Bank Offer",
    verifiedDate: "Today",
    expiresIn: "5 days left",
    minOrder: "₹5,000",
    terms: "Applicable on HDFC Bank debit and credit cards. Max discount ₹1,500 per transaction.",
    link: "/amazon-coupons",
    usesCount: 7890,
  },
  {
    id: "deal-ttc-1",
    storeName: "Tata CLiQ",
    storeSlug: "tata-cliq-coupons",
    storeLogo: "/Brand logos/Tata-cliq.webp",
    category: "Electronics",
    title: "10% Instant Discount on Apple & Samsung Audio",
    code: "CLIQSONIC",
    discount: "10% OFF",
    badge: "Verified",
    verifiedDate: "Today",
    expiresIn: "4 days left",
    minOrder: "₹3,000",
    terms: "Max discount ₹1,000. Earn 5% NeuCoins on Tata NeuPass.",
    link: "https://www.tatacliq.com",
    usesCount: 1740,
  },
  {
    id: "deal-swg-1",
    storeName: "Swiggy",
    storeSlug: "swiggy-coupons",
    category: "Food",
    title: "60% OFF on Your Next 3 Swiggy Food Orders",
    code: "SWIGGYONE",
    discount: "60% OFF",
    badge: "Trending",
    verifiedDate: "Today",
    expiresIn: "1 day left",
    minOrder: "₹199",
    terms: "Max discount ₹120 per order. Valid for new Swiggy One subscribers only.",
    link: "https://www.swiggy.com",
    usesCount: 9200,
  },
  {
    id: "deal-mmt-1",
    storeName: "MakeMyTrip",
    storeSlug: "makemytrip-coupons",
    category: "Travel",
    title: "₹2,000 Flat OFF on International Flight Bookings",
    code: "MMTINTL2000",
    discount: "₹2,000 OFF",
    badge: "Exclusive",
    verifiedDate: "Today",
    expiresIn: "10 days left",
    minOrder: "₹15,000",
    terms: "Valid on international flights booked for travel between Oct–Dec 2026. Per account, once.",
    link: "https://www.makemytrip.com",
    usesCount: 1340,
  },
];

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
  let results = customDeals ? [...customDeals] : [...DEALS_DB];

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
