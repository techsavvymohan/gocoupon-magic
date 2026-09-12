/**
 * @file store-registry.ts
 * @description Central Store Registry & Direct Search URL Generator with Affiliate Tracking.
 * Covers top Indian and International e-commerce merchants.
 */

export interface RegisteredStore {
  id: string;
  name: string;
  category: "electronics" | "fashion" | "beauty" | "general" | "home" | "travel";
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

export function wrapAffiliateTracking(targetUrl: string, subId = "gocoupon_web"): string {
  if (!targetUrl || targetUrl.startsWith("#") || targetUrl.startsWith("javascript:")) return "";

  // Already an active affiliate redirect
  if (targetUrl.includes("linksredirect.com") || targetUrl.includes("clnk.in")) {
    return targetUrl;
  }

  // Amazon India / US already uses direct ?tag= parameter
  if (targetUrl.includes("amazon.in") || targetUrl.includes("amazon.com")) {
    return targetUrl;
  }

  // If Cuelinks publisher ID is present, wrap the merchant search link with subid attribution
  if (CUELINKS_PUB_ID && /^https?:\/\//i.test(targetUrl)) {
    return `https://linksredirect.com/?pub_id=${CUELINKS_PUB_ID}&subid=${encodeURIComponent(subId)}&url=${encodeURIComponent(targetUrl)}`;
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
  {
    id: "netmeds",
    name: "Netmeds",
    category: "beauty",
    region: "IN",
    tier: 2,
    logo: "/Brand logos/Nykaa.webp",
    defaultCoupon: { code: "NETMEDS20", description: "Flat 20% off on prescription and wellness products", discountPct: 0.2 },
    cashbackRate: "Up to 4.73%",
    cashbackPct: 0.0473,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.netmeds.com/catalogsearch/result?q=${encodeURIComponent(q)}`),
  },

  // ─── India: Lifestyle, Home & Specialized ─────────────────────────────────
  {
    id: "bewakoof",
    name: "Bewakoof",
    category: "fashion",
    region: "IN",
    tier: 2,
    logo: "/Brand logos/flipkart.webp",
    defaultCoupon: { code: "BEWAKOOF100", description: "Flat ₹100 instant discount on denim & graphic tees", discountAmount: 100 },
    cashbackRate: "Up to 11.55%",
    cashbackPct: 0.1155,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.bewakoof.com/search/${encodeURIComponent(q)}`),
  },
  {
    id: "levis",
    name: "Levi's India",
    category: "fashion",
    region: "IN",
    tier: 2,
    logo: "/Brand logos/myntra.webp",
    defaultCoupon: { code: "LEVIS500", description: "Flat ₹500 off on jeans and jackets above ₹2,999", discountAmount: 500 },
    cashbackRate: "Up to 12.75%",
    cashbackPct: 0.1275,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.levi.in/search?q=${encodeURIComponent(q)}`),
  },
  {
    id: "firstcry",
    name: "FirstCry",
    category: "general",
    region: "IN",
    tier: 2,
    logo: "/Brand logos/flipkart.webp",
    defaultCoupon: { code: "FIRSTCRY300", description: "Save on baby essentials, clothing & toys", discountAmount: 300 },
    cashbackRate: "₹22.50 per sale",
    cashbackPct: 0.04,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.firstcry.com/search?q=${encodeURIComponent(q)}`),
  },
  {
    id: "lenovo",
    name: "Lenovo India",
    category: "electronics",
    region: "IN",
    tier: 2,
    logo: "/Brand logos/croma.svg",
    defaultCoupon: { code: "LENOVOTECH", description: "Save up to ₹2,500 on IdeaPad & Legion laptops", discountAmount: 2500 },
    cashbackRate: "Up to 3.0%",
    cashbackPct: 0.03,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.lenovo.com/in/en/search?fq=&text=${encodeURIComponent(q)}`),
  },
  {
    id: "pepperfry",
    name: "Pepperfry",
    category: "home",
    region: "IN",
    tier: 2,
    logo: "/Brand logos/Tata-cliq.webp",
    defaultCoupon: { code: "PEPPERHOMES", description: "Extra ₹1,000 off on solid wood furniture", discountAmount: 1000 },
    cashbackRate: "₹262.50 per sale",
    cashbackPct: 0.06,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.pepperfry.com/site_product/search?q=${encodeURIComponent(q)}`),
  },
  {
    id: "makemytrip",
    name: "MakeMyTrip",
    category: "travel",
    region: "IN",
    tier: 1,
    logo: "/Brand logos/Amazon_logo.svg.webp",
    defaultCoupon: { code: "MMTHOTEL", description: "Up to 25% off on domestic and international hotels", discountAmount: 1200 },
    cashbackRate: "₹112.50 per booking",
    cashbackPct: 0.05,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.makemytrip.com/hotels/${encodeURIComponent(q)}`),
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

  if (normCat.includes("fashion") || normCat.includes("shoe") || normCat.includes("apparel") || normCat.includes("footwear") || normCat.includes("denim")) {
    return stores.filter((s) => s.category === "fashion" || s.category === "general");
  }

  if (normCat.includes("beauty") || normCat.includes("care") || normCat.includes("skin") || normCat.includes("cosmetic") || normCat.includes("health") || normCat.includes("medicine")) {
    return stores.filter((s) => s.category === "beauty" || s.category === "general");
  }

  if (normCat.includes("furniture") || normCat.includes("home") || normCat.includes("decor") || normCat.includes("bed") || normCat.includes("appliance")) {
    return stores.filter((s) => s.category === "home" || s.category === "general" || s.category === "electronics");
  }

  if (normCat.includes("travel") || normCat.includes("hotel") || normCat.includes("flight") || normCat.includes("trip")) {
    return stores.filter((s) => s.category === "travel" || s.category === "general");
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
