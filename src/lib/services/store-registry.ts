/**
 * @file store-registry.ts
 * @description Central Store Registry & Direct Search URL Generator with Affiliate Tracking.
 * Covers top Indian and International e-commerce merchants.
 */

export interface RegisteredStore {
  id: string;
  name: string;
  category: "electronics" | "fashion" | "beauty" | "general";
  region: "IN" | "US" | "GLOBAL";
  tier: number; // 1 = High Volume, 2 = Specialized, 3 = Budget
  logo: string;
  defaultCoupon?: {
    code: string;
    description: string;
    discountAmount?: number;
    discountPct?: number;
  };
  cashbackRate: string;
  cashbackPct: number;
  buildSearchUrl: (query: string) => string;
}

const AMAZON_IN_PARTNER_TAG = process.env.VITE_AMAZON_IN_PARTNER_TAG || "gocoupon0e-21";
const AMAZON_US_PARTNER_TAG = process.env.VITE_AMAZON_US_PARTNER_TAG || "";
const CUELINKS_PUB_ID = process.env.VITE_CUELINKS_PUB_ID || "148920";

/**
 * Wraps arbitrary merchant URLs with affiliate tracking (e.g., Cuelinks) when applicable.
 */
export function wrapAffiliateTracking(targetUrl: string): string {
  if (!targetUrl) return "";

  // Amazon India already uses the ?tag= parameter
  if (targetUrl.includes("amazon.in") || targetUrl.includes("amazon.com")) {
    return targetUrl;
  }

  // If Cuelinks publisher ID is present, wrap the merchant search link
  if (CUELINKS_PUB_ID && /^https?:\/\//i.test(targetUrl)) {
    return `https://linksredirect.com/?pub_id=${CUELINKS_PUB_ID}&url=${encodeURIComponent(targetUrl)}`;
  }

  return targetUrl;
}

export const REGISTERED_STORES: RegisteredStore[] = [
  // ─── India: General & Electronics ──────────────────────────────────────────
  {
    id: "amazon_in",
    name: "Amazon India",
    category: "general",
    region: "IN",
    tier: 1,
    logo: "/Brand logos/Amazon_logo.svg.webp",
    defaultCoupon: { code: "AMZSAVE", description: "Flat ₹500 off on select electronics & appliances", discountAmount: 500 },
    cashbackRate: "Up to 7.0%",
    cashbackPct: 0.05,
    buildSearchUrl: (q) => `https://www.amazon.in/s?k=${encodeURIComponent(q)}&tag=${AMAZON_IN_PARTNER_TAG}`,
  },
  {
    id: "flipkart",
    name: "Flipkart",
    category: "general",
    region: "IN",
    tier: 1,
    logo: "/Brand logos/flipkart.webp",
    defaultCoupon: { code: "FLIPEXTRA", description: "Extra ₹500 off on cards and SuperCoins", discountAmount: 500 },
    cashbackRate: "Up to 8.5%",
    cashbackPct: 0.06,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.flipkart.com/search?q=${encodeURIComponent(q)}`),
  },
  {
    id: "croma",
    name: "Croma",
    category: "electronics",
    region: "IN",
    tier: 1,
    logo: "/Brand logos/croma.svg",
    defaultCoupon: { code: "CROMA1K", description: "Flat ₹1,000 off on orders above ₹20,000", discountAmount: 1000 },
    cashbackRate: "Up to 4.0%",
    cashbackPct: 0.035,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.croma.com/searchB?q=${encodeURIComponent(q)}`),
  },
  {
    id: "reliance_digital",
    name: "Reliance Digital",
    category: "electronics",
    region: "IN",
    tier: 2,
    logo: "/Brand logos/reliance.svg",
    defaultCoupon: { code: "RELIANCE500", description: "Instant discount on electronics & appliances", discountAmount: 500 },
    cashbackRate: "Up to 5.0%",
    cashbackPct: 0.04,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.reliancedigital.in/search?q=${encodeURIComponent(q)}`),
  },
  {
    id: "vijaysales",
    name: "Vijay Sales",
    category: "electronics",
    region: "IN",
    tier: 2,
    logo: "/Brand logos/croma.svg",
    defaultCoupon: { code: "VIJAYSAVE", description: "Save up to ₹750 with bank credit cards", discountAmount: 750 },
    cashbackRate: "Up to 3.5%",
    cashbackPct: 0.03,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.vijaysales.com/search/${encodeURIComponent(q)}`),
  },
  {
    id: "tatacliq",
    name: "Tata CLiQ",
    category: "electronics",
    region: "IN",
    tier: 2,
    logo: "/Brand logos/Tata-cliq.webp",
    defaultCoupon: { code: "CLIQSAVE", description: "Flat ₹500 off on electronics and fashion", discountAmount: 500 },
    cashbackRate: "Up to 5.5%",
    cashbackPct: 0.04,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.tatacliq.com/search/?searchCategory=all&text=${encodeURIComponent(q)}`),
  },

  // ─── India: Fashion & Lifestyle ────────────────────────────────────────────
  {
    id: "myntra",
    name: "Myntra",
    category: "fashion",
    region: "IN",
    tier: 1,
    logo: "/Brand logos/myntra.webp",
    defaultCoupon: { code: "MYNTRA500", description: "Flat ₹500 off on orders above ₹1,999", discountAmount: 500 },
    cashbackRate: "Up to 6.2%",
    cashbackPct: 0.05,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.myntra.com/${encodeURIComponent(q)}`),
  },
  {
    id: "ajio",
    name: "Ajio",
    category: "fashion",
    region: "IN",
    tier: 2,
    logo: "/Brand logos/Ajio.webp",
    defaultCoupon: { code: "AJIOMANIA", description: "Up to 30% off on premium fashion brands", discountPct: 0.15 },
    cashbackRate: "Up to 8.0%",
    cashbackPct: 0.06,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.ajio.com/search/?text=${encodeURIComponent(q)}`),
  },
  {
    id: "meesho",
    name: "Meesho",
    category: "fashion",
    region: "IN",
    tier: 3,
    logo: "/Brand logos/Meesho_logo.webp",
    defaultCoupon: { code: "MEESHO100", description: "Flat ₹100 instant discount on prepaid orders", discountAmount: 100 },
    cashbackRate: "Up to 5.0%",
    cashbackPct: 0.035,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.meesho.com/search?q=${encodeURIComponent(q)}`),
  },

  // ─── India: Beauty & Personal Care ─────────────────────────────────────────
  {
    id: "nykaa",
    name: "Nykaa",
    category: "beauty",
    region: "IN",
    tier: 1,
    logo: "/Brand logos/Nykaa.webp",
    defaultCoupon: { code: "NYKAAFIRST", description: "10% off on makeup and premium skincare", discountPct: 0.1 },
    cashbackRate: "Up to 6.0%",
    cashbackPct: 0.05,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.nykaa.com/search/result/?q=${encodeURIComponent(q)}`),
  },
  {
    id: "purplle",
    name: "Purplle",
    category: "beauty",
    region: "IN",
    tier: 2,
    logo: "/Brand logos/Nykaa.webp",
    defaultCoupon: { code: "PURPLLE10", description: "Flat 10% off on skincare and cosmetics", discountPct: 0.1 },
    cashbackRate: "Up to 7.0%",
    cashbackPct: 0.05,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.purplle.com/search?q=${encodeURIComponent(q)}`),
  },

  // ─── International / US ───────────────────────────────────────────────────
  {
    id: "amazon_us",
    name: "Amazon US",
    category: "general",
    region: "US",
    tier: 1,
    logo: "/Brand logos/Amazon_logo.svg.webp",
    defaultCoupon: { code: "AMZSAVE15", description: "Save on qualifying items with Prime", discountPct: 0.05 },
    cashbackRate: "Up to 5.0%",
    cashbackPct: 0.04,
    buildSearchUrl: (q) =>
      AMAZON_US_PARTNER_TAG
        ? `https://www.amazon.com/s?k=${encodeURIComponent(q)}&tag=${AMAZON_US_PARTNER_TAG}`
        : `https://www.amazon.com/s?k=${encodeURIComponent(q)}`,
  },
  {
    id: "walmart",
    name: "Walmart",
    category: "general",
    region: "US",
    tier: 1,
    logo: "/Brand logos/Amazon_logo.svg.webp",
    defaultCoupon: { code: "ROLLBACK20", description: "Save $20 on qualifying orders over $75", discountAmount: 20 },
    cashbackRate: "Up to 6.5%",
    cashbackPct: 0.045,
    buildSearchUrl: (q) => `https://www.walmart.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    id: "bestbuy",
    name: "Best Buy",
    category: "electronics",
    region: "US",
    tier: 1,
    logo: "/Brand logos/croma.svg",
    defaultCoupon: { code: "TECHBOOST", description: "Save on smart tech & computing accessories", discountAmount: 30 },
    cashbackRate: "Up to 5.5%",
    cashbackPct: 0.035,
    buildSearchUrl: (q) => `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(q)}`,
  },
];

/**
 * Returns the relevant stores for a given product category.
 */
export function getRelevantStoresForCategory(category: string, region: "IN" | "US" = "IN"): RegisteredStore[] {
  const normCat = (category || "").toLowerCase();
  const stores = REGISTERED_STORES.filter((s) => s.region === region || s.region === "GLOBAL");

  if (normCat.includes("fashion") || normCat.includes("shoe") || normCat.includes("apparel") || normCat.includes("footwear")) {
    return stores.filter((s) => s.category === "fashion" || s.category === "general");
  }

  if (normCat.includes("beauty") || normCat.includes("care") || normCat.includes("skin") || normCat.includes("cosmetic")) {
    return stores.filter((s) => s.category === "beauty" || s.category === "general");
  }

  if (
    normCat.includes("electronic") ||
    normCat.includes("mobile") ||
    normCat.includes("smartphone") ||
    normCat.includes("laptop") ||
    normCat.includes("audio") ||
    normCat.includes("headphone") ||
    normCat.includes("watch") ||
    normCat.includes("tv")
  ) {
    return stores.filter((s) => s.category === "electronics" || s.category === "general");
  }

  return stores.filter((s) => s.category === "general" || s.tier === 1);
}
