/**
 * @file store-registry.ts
 * @description Central Store Registry & Direct Search URL Generator with Cuelinks Affiliate Tracking.
 * Covers top Indian and International e-commerce merchants with verified Instant Open & Available status.
 */

export interface RegisteredStore {
  id: string;
  name: string;
  category: "electronics" | "fashion" | "beauty" | "general" | "home" | "travel" | "food" | "education";
  region: "IN" | "US" | "GLOBAL";
  tier: number; // 1 = High Volume, 2 = Specialized, 3 = Budget
  logo: string;
  domain: string;
  storeUrl: string;
  isInstantOpen: boolean;
  status: "instant_open" | "available";
  aliases?: string[];
  internalRoute?: string;
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

const AMAZON_IN_PARTNER_TAG =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_AMAZON_IN_PARTNER_TAG) ||
  (typeof process !== "undefined" && process.env?.VITE_AMAZON_IN_PARTNER_TAG) ||
  "gocoupon0e-21";

const AMAZON_US_PARTNER_TAG =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_AMAZON_US_PARTNER_TAG) ||
  (typeof process !== "undefined" && process.env?.VITE_AMAZON_US_PARTNER_TAG) ||
  "";

const CUELINKS_PUB_ID =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_CUELINKS_PUB_ID) ||
  (typeof process !== "undefined" && process.env?.VITE_CUELINKS_PUB_ID) ||
  "148920";

/**
 * Wraps any target merchant link with Cuelinks or Amazon affiliate attribution.
 * Safe against double-wrapping and handles direct domain tagging.
 */
export function wrapAffiliateTracking(targetUrl: string, subId = "gocoupon_web"): string {
  if (!targetUrl || targetUrl.startsWith("#") || targetUrl.startsWith("javascript:")) return "";

  // Already an active affiliate redirect
  if (targetUrl.includes("linksredirect.com") || targetUrl.includes("clnk.in")) {
    return targetUrl;
  }

  // Amazon India tagging
  if (targetUrl.includes("amazon.in")) {
    if (!targetUrl.includes("tag=")) {
      const sep = targetUrl.includes("?") ? "&" : "?";
      return `${targetUrl}${sep}tag=${AMAZON_IN_PARTNER_TAG}`;
    }
    return targetUrl;
  }

  // Amazon US tagging
  if (targetUrl.includes("amazon.com")) {
    if (AMAZON_US_PARTNER_TAG && !targetUrl.includes("tag=")) {
      const sep = targetUrl.includes("?") ? "&" : "?";
      return `${targetUrl}${sep}tag=${AMAZON_US_PARTNER_TAG}`;
    }
    return targetUrl;
  }

  // Cuelinks redirect wrapping with publisher ID and subid
  if (CUELINKS_PUB_ID && /^https?:\/\//i.test(targetUrl)) {
    return `https://linksredirect.com/?pub_id=${CUELINKS_PUB_ID}&subid=${encodeURIComponent(subId)}&url=${encodeURIComponent(targetUrl)}`;
  }

  return targetUrl;
}

/**
 * Generates the 1-click Instant Open URL for any store.
 */
export function buildStoreAffiliateUrl(store: RegisteredStore, subId = "gocoupon_instant_search"): string {
  if (store.id === "amazon_in") {
    return `https://www.amazon.in/?tag=${AMAZON_IN_PARTNER_TAG}`;
  }
  if (store.id === "amazon_us") {
    return AMAZON_US_PARTNER_TAG
      ? `https://www.amazon.com/?tag=${AMAZON_US_PARTNER_TAG}`
      : `https://www.amazon.com/`;
  }
  return wrapAffiliateTracking(store.storeUrl, subId);
}

export const REGISTERED_STORES: RegisteredStore[] = [
  // ─── Instant Open: Top Priority Cuelinks Merchants (Pre-Approved / Instant Track) ────
  {
    id: "tatacliq",
    name: "Tata CLiQ",
    category: "electronics",
    region: "IN",
    tier: 1,
    logo: "/Brand logos/Tata-cliq.webp",
    domain: "tatacliq.com",
    storeUrl: "https://www.tatacliq.com",
    isInstantOpen: true,
    status: "instant_open",
    aliases: ["tatacliq", "tata cliq", "cliq", "tata luxury", "tatacliq luxury"],
    internalRoute: "/stores",
    defaultCoupon: { code: "CLIQSAVE", description: "Flat ₹500 off on electronics & fashion with NeuPass", discountAmount: 500 },
    cashbackRate: "Up to 5.5%",
    cashbackPct: 0.04,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.tatacliq.com/search/?searchCategory=all&text=${encodeURIComponent(q)}`),
  },
  {
    id: "nykaa",
    name: "Nykaa",
    category: "beauty",
    region: "IN",
    tier: 1,
    logo: "/Brand logos/Nykaa.webp",
    domain: "nykaa.com",
    storeUrl: "https://www.nykaa.com",
    isInstantOpen: true,
    status: "instant_open",
    aliases: ["nykaa", "nyka", "nykaa cosmetics", "nykaa beauty", "nykaa man"],
    internalRoute: "/stores",
    defaultCoupon: { code: "NYKAAFIRST", description: "10% off on makeup, skincare & luxury cosmetics", discountPct: 0.1 },
    cashbackRate: "Up to 6.0%",
    cashbackPct: 0.05,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.nykaa.com/search/result/?q=${encodeURIComponent(q)}`),
  },
  {
    id: "levis",
    name: "Levi's India",
    category: "fashion",
    region: "IN",
    tier: 2,
    logo: "/Brand logos/myntra.webp",
    domain: "levi.in",
    storeUrl: "https://www.levi.in",
    isInstantOpen: true,
    status: "instant_open",
    aliases: ["levis", "levi", "levi's", "levi strauss", "levis jeans"],
    internalRoute: "/stores",
    defaultCoupon: { code: "LEVIS500", description: "Flat ₹500 off on jeans and jackets above ₹2,999", discountAmount: 500 },
    cashbackRate: "12.75%",
    cashbackPct: 0.1275,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.levi.in/search?q=${encodeURIComponent(q)}`),
  },
  {
    id: "bewakoof",
    name: "Bewakoof",
    category: "fashion",
    region: "IN",
    tier: 2,
    logo: "/Brand logos/flipkart.webp",
    domain: "bewakoof.com",
    storeUrl: "https://www.bewakoof.com",
    isInstantOpen: true,
    status: "instant_open",
    aliases: ["bewakoof", "bewkoof", "bewakoof.com", "bewakoof tees"],
    internalRoute: "/stores",
    defaultCoupon: { code: "BEWAKOOF100", description: "Flat ₹100 instant discount on denim & graphic tees", discountAmount: 100 },
    cashbackRate: "11.55%",
    cashbackPct: 0.1155,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.bewakoof.com/search/${encodeURIComponent(q)}`),
  },
  {
    id: "firstcry",
    name: "FirstCry",
    category: "general",
    region: "IN",
    tier: 1,
    logo: "/Brand logos/FirstCry_logo.svg.webp",
    domain: "firstcry.com",
    storeUrl: "https://www.firstcry.com",
    isInstantOpen: true,
    status: "instant_open",
    aliases: ["firstcry", "first cry", "firstcry.com", "baby products"],
    internalRoute: "/stores",
    defaultCoupon: { code: "FIRSTCRY300", description: "Save ₹300 on baby essentials, clothing & toys", discountAmount: 300 },
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
    domain: "lenovo.com",
    storeUrl: "https://www.lenovo.com/in/en",
    isInstantOpen: true,
    status: "instant_open",
    aliases: ["lenovo", "thinkpad", "ideapad", "legion", "lenovo laptops", "yoga"],
    internalRoute: "/stores",
    defaultCoupon: { code: "LENOVOTECH", description: "Save up to ₹2,500 on IdeaPad & Legion laptops", discountAmount: 2500 },
    cashbackRate: "3.0%",
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
    domain: "pepperfry.com",
    storeUrl: "https://www.pepperfry.com",
    isInstantOpen: true,
    status: "instant_open",
    aliases: ["pepperfry", "pepper fry", "furniture", "pepperfry home"],
    internalRoute: "/stores",
    defaultCoupon: { code: "PEPPERHOMES", description: "Extra ₹1,000 off on solid wood furniture & decor", discountAmount: 1000 },
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
    domain: "makemytrip.com",
    storeUrl: "https://www.makemytrip.com",
    isInstantOpen: true,
    status: "instant_open",
    aliases: ["makemytrip", "mmt", "make my trip", "flights", "hotels"],
    internalRoute: "/stores",
    defaultCoupon: { code: "MMTHOTEL", description: "Up to 25% off on domestic and international hotels", discountAmount: 1200 },
    cashbackRate: "₹112.50 per booking",
    cashbackPct: 0.05,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.makemytrip.com/hotels/${encodeURIComponent(q)}`),
  },
  {
    id: "coursera",
    name: "Coursera",
    category: "education",
    region: "GLOBAL",
    tier: 2,
    logo: "/gc-logo.webp",
    domain: "coursera.org",
    storeUrl: "https://www.coursera.org",
    isInstantOpen: true,
    status: "instant_open",
    aliases: ["coursera", "online courses", "certificates", "degrees"],
    internalRoute: "/stores",
    defaultCoupon: { code: "LEARN2026", description: "Save on Coursera Plus and university professional certificates", discountPct: 0.15 },
    cashbackRate: "7.13%",
    cashbackPct: 0.0713,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.coursera.org/search?query=${encodeURIComponent(q)}`),
  },
  {
    id: "purplle",
    name: "Purplle",
    category: "beauty",
    region: "IN",
    tier: 2,
    logo: "/Brand logos/Nykaa.webp",
    domain: "purplle.com",
    storeUrl: "https://www.purplle.com",
    isInstantOpen: true,
    status: "instant_open",
    aliases: ["purplle", "purple", "purplle.com", "cosmetics"],
    internalRoute: "/stores",
    defaultCoupon: { code: "PURPLLE10", description: "Flat 10% off on skincare and cosmetics combos", discountPct: 0.1 },
    cashbackRate: "Up to 7.0%",
    cashbackPct: 0.05,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.purplle.com/search?q=${encodeURIComponent(q)}`),
  },

  // ─── Available on Cuelinks: High-Volume E-Commerce & Brand Stores ──────────
  {
    id: "myntra",
    name: "Myntra",
    category: "fashion",
    region: "IN",
    tier: 1,
    logo: "/Brand logos/myntra.webp",
    domain: "myntra.com",
    storeUrl: "https://www.myntra.com",
    isInstantOpen: false,
    status: "available",
    aliases: ["myntra", "myntra fashion", "myntra.com", "clothing", "shoes", "fashion"],
    internalRoute: "/myntra-coupons",
    defaultCoupon: { code: "MYNTRA500", description: "Flat ₹500 off on orders above ₹1,999", discountAmount: 500 },
    cashbackRate: "Up to 7.5%",
    cashbackPct: 0.05,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.myntra.com/${encodeURIComponent(q)}`),
  },
  {
    id: "flipkart",
    name: "Flipkart",
    category: "general",
    region: "IN",
    tier: 1,
    logo: "/Brand logos/flipkart.webp",
    domain: "flipkart.com",
    storeUrl: "https://www.flipkart.com",
    isInstantOpen: false,
    status: "available",
    aliases: ["flipkart", "fk", "flipkart.com", "supercoins", "big billion days"],
    internalRoute: "/flipkart-coupons",
    defaultCoupon: { code: "FLIPEXTRA", description: "Extra ₹500 off with bank cards and SuperCoins", discountAmount: 500 },
    cashbackRate: "Up to 8.5%",
    cashbackPct: 0.06,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.flipkart.com/search?q=${encodeURIComponent(q)}`),
  },
  {
    id: "ajio",
    name: "Ajio",
    category: "fashion",
    region: "IN",
    tier: 1,
    logo: "/Brand logos/Ajio.webp",
    domain: "ajio.com",
    storeUrl: "https://www.ajio.com",
    isInstantOpen: false,
    status: "available",
    aliases: ["ajio", "ajio mania", "ajio luxe", "reliance ajio"],
    internalRoute: "/stores",
    defaultCoupon: { code: "AJIOMANIA", description: "Up to 35% off on premium fashion brands & sneaker lab", discountPct: 0.2 },
    cashbackRate: "Up to 9.0%",
    cashbackPct: 0.06,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.ajio.com/search/?text=${encodeURIComponent(q)}`),
  },
  {
    id: "croma",
    name: "Croma",
    category: "electronics",
    region: "IN",
    tier: 1,
    logo: "/Brand logos/croma.svg",
    domain: "croma.com",
    storeUrl: "https://www.croma.com",
    isInstantOpen: false,
    status: "available",
    aliases: ["croma", "croma retail", "croma electronics", "tata croma"],
    internalRoute: "/stores",
    defaultCoupon: { code: "CROMA1K", description: "Flat ₹1,000 off on orders above ₹20,000", discountAmount: 1000 },
    cashbackRate: "Up to 4.0%",
    cashbackPct: 0.035,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.croma.com/searchB?q=${encodeURIComponent(q)}`),
  },
  {
    id: "boat",
    name: "boAt Lifestyle",
    category: "electronics",
    region: "IN",
    tier: 1,
    logo: "/Brand logos/croma.svg",
    domain: "boat-lifestyle.com",
    storeUrl: "https://www.boat-lifestyle.com",
    isInstantOpen: false,
    status: "available",
    aliases: ["boat", "boat lifestyle", "airdopes", "rockerz", "boat audio", "smartwatch"],
    internalRoute: "/stores",
    defaultCoupon: { code: "BOAT20", description: "Extra 20% off on Bluetooth audio & smartwatches", discountPct: 0.2 },
    cashbackRate: "Up to 5.5%",
    cashbackPct: 0.045,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.boat-lifestyle.com/search?q=${encodeURIComponent(q)}`),
  },
  {
    id: "samsung_in",
    name: "Samsung India",
    category: "electronics",
    region: "IN",
    tier: 1,
    logo: "/Brand logos/croma.svg",
    domain: "samsung.com",
    storeUrl: "https://www.samsung.com/in",
    isInstantOpen: false,
    status: "available",
    aliases: ["samsung", "galaxy", "samsung india", "samsung store", "galaxy s24", "galaxy z fold"],
    internalRoute: "/stores",
    defaultCoupon: { code: "SAMTECH", description: "Save up to ₹5,000 with HDFC & ICICI bank instant cashbacks", discountAmount: 2000 },
    cashbackRate: "Up to 3.5%",
    cashbackPct: 0.03,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.samsung.com/in/search/?searchvalue=${encodeURIComponent(q)}`),
  },
  {
    id: "dell_in",
    name: "Dell India",
    category: "electronics",
    region: "IN",
    tier: 2,
    logo: "/Brand logos/croma.svg",
    domain: "dell.com",
    storeUrl: "https://www.dell.com/en-in",
    isInstantOpen: false,
    status: "available",
    aliases: ["dell", "dell laptops", "alienware", "xps", "inspiron", "dell india"],
    internalRoute: "/stores",
    defaultCoupon: { code: "DELLSAVE", description: "Save up to ₹3,500 on Inspiron and Alienware laptops", discountAmount: 2500 },
    cashbackRate: "2.25%",
    cashbackPct: 0.0225,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.dell.com/en-in/search/${encodeURIComponent(q)}`),
  },
  {
    id: "hm_in",
    name: "H&M India",
    category: "fashion",
    region: "IN",
    tier: 1,
    logo: "/Brand logos/myntra.webp",
    domain: "hm.com",
    storeUrl: "https://www2.hm.com/en_in/index.html",
    isInstantOpen: false,
    status: "available",
    aliases: ["hm", "h&m", "h & m", "h and m", "hm clothing"],
    internalRoute: "/stores",
    defaultCoupon: { code: "HMAPP10", description: "10% off first app order & member discounts", discountPct: 0.1 },
    cashbackRate: "Up to 6.0%",
    cashbackPct: 0.045,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www2.hm.com/en_in/search-results.html?q=${encodeURIComponent(q)}`),
  },
  {
    id: "marks_spencer",
    name: "Marks & Spencer",
    category: "fashion",
    region: "IN",
    tier: 2,
    logo: "/Brand logos/myntra.webp",
    domain: "marksandspencer.in",
    storeUrl: "https://www.marksandspencer.in",
    isInstantOpen: false,
    status: "available",
    aliases: ["marks and spencer", "m&s", "marks & spencer", "mns"],
    internalRoute: "/stores",
    defaultCoupon: { code: "MNSLOVE", description: "Extra 15% off on formal wear and luxury linen", discountPct: 0.15 },
    cashbackRate: "13.64%",
    cashbackPct: 0.1364,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.marksandspencer.in/search?q=${encodeURIComponent(q)}`),
  },
  {
    id: "shoppers_stop",
    name: "Shoppers Stop",
    category: "fashion",
    region: "IN",
    tier: 2,
    logo: "/Brand logos/myntra.webp",
    domain: "shoppersstop.com",
    storeUrl: "https://www.shoppersstop.com",
    isInstantOpen: false,
    status: "available",
    aliases: ["shoppers stop", "shoppersstop", "first citizen"],
    internalRoute: "/stores",
    defaultCoupon: { code: "FIRST10", description: "10% instant discount on First Citizen club", discountPct: 0.1 },
    cashbackRate: "Up to 5.0%",
    cashbackPct: 0.04,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.shoppersstop.com/search/?text=${encodeURIComponent(q)}`),
  },
  {
    id: "lifestyle_stores",
    name: "Lifestyle Stores",
    category: "fashion",
    region: "IN",
    tier: 2,
    logo: "/Brand logos/myntra.webp",
    domain: "lifestylestores.com",
    storeUrl: "https://www.lifestylestores.com",
    isInstantOpen: false,
    status: "available",
    aliases: ["lifestyle", "lifestyle stores", "lifestylestores"],
    internalRoute: "/stores",
    defaultCoupon: { code: "LIFE500", description: "Flat ₹500 off on apparel and shoes above ₹2,499", discountAmount: 500 },
    cashbackRate: "Up to 6.5%",
    cashbackPct: 0.05,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.lifestylestores.com/in/en/search?q=${encodeURIComponent(q)}`),
  },
  {
    id: "reliance_digital",
    name: "Reliance Digital",
    category: "electronics",
    region: "IN",
    tier: 2,
    logo: "/Brand logos/reliance.svg",
    domain: "reliancedigital.in",
    storeUrl: "https://www.reliancedigital.in",
    isInstantOpen: false,
    status: "available",
    aliases: ["reliance digital", "reliance", "rd", "reliance electronics"],
    internalRoute: "/stores",
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
    domain: "vijaysales.com",
    storeUrl: "https://www.vijaysales.com",
    isInstantOpen: false,
    status: "available",
    aliases: ["vijay sales", "vijaysales", "vs"],
    internalRoute: "/stores",
    defaultCoupon: { code: "VIJAYSAVE", description: "Save up to ₹750 with bank credit cards", discountAmount: 750 },
    cashbackRate: "Up to 3.5%",
    cashbackPct: 0.03,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.vijaysales.com/search/${encodeURIComponent(q)}`),
  },
  {
    id: "meesho",
    name: "Meesho",
    category: "fashion",
    region: "IN",
    tier: 3,
    logo: "/Brand logos/Meesho_logo.webp",
    domain: "meesho.com",
    storeUrl: "https://www.meesho.com",
    isInstantOpen: false,
    status: "available",
    aliases: ["meesho", "mesho", "meesho app", "budget sarees", "ethnic"],
    internalRoute: "/meesho-coupons",
    defaultCoupon: { code: "MEESHO100", description: "Flat ₹100 instant discount on prepaid orders", discountAmount: 100 },
    cashbackRate: "Up to 5.0%",
    cashbackPct: 0.035,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.meesho.com/search?q=${encodeURIComponent(q)}`),
  },
  {
    id: "netmeds",
    name: "Netmeds",
    category: "beauty",
    region: "IN",
    tier: 2,
    logo: "/Brand logos/Nykaa.webp",
    domain: "netmeds.com",
    storeUrl: "https://www.netmeds.com",
    isInstantOpen: false,
    status: "available",
    aliases: ["netmeds", "medicines", "pharmacy", "wellness"],
    internalRoute: "/stores",
    defaultCoupon: { code: "NETMEDS20", description: "Flat 20% off on prescription and wellness products", discountPct: 0.2 },
    cashbackRate: "Up to 4.73%",
    cashbackPct: 0.0473,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.netmeds.com/catalogsearch/result?q=${encodeURIComponent(q)}`),
  },
  {
    id: "urban_ladder",
    name: "Urban Ladder",
    category: "home",
    region: "IN",
    tier: 2,
    logo: "/Brand logos/Tata-cliq.webp",
    domain: "urbanladder.com",
    storeUrl: "https://www.urbanladder.com",
    isInstantOpen: false,
    status: "available",
    aliases: ["urban ladder", "urbanladder", "sofas", "furniture"],
    internalRoute: "/stores",
    defaultCoupon: { code: "URBANHOME", description: "Up to ₹2,000 off on living room and bedroom sets", discountAmount: 2000 },
    cashbackRate: "Up to 5.0%",
    cashbackPct: 0.04,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.urbanladder.com/search?keywords=${encodeURIComponent(q)}`),
  },
  {
    id: "wakefit",
    name: "Wakefit",
    category: "home",
    region: "IN",
    tier: 2,
    logo: "/Brand logos/Tata-cliq.webp",
    domain: "wakefit.co",
    storeUrl: "https://www.wakefit.co",
    isInstantOpen: false,
    status: "available",
    aliases: ["wakefit", "mattress", "sleep", "wakefit mattress"],
    internalRoute: "/stores",
    defaultCoupon: { code: "WAKESLEEP", description: "Flat ₹500 off on memory foam mattresses", discountAmount: 500 },
    cashbackRate: "Up to 4.5%",
    cashbackPct: 0.035,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.wakefit.co/search?q=${encodeURIComponent(q)}`),
  },
  {
    id: "swiggy",
    name: "Swiggy",
    category: "food",
    region: "IN",
    tier: 1,
    logo: "/Brand logos/Amazon_logo.svg.webp",
    domain: "swiggy.com",
    storeUrl: "https://www.swiggy.com",
    isInstantOpen: false,
    status: "available",
    aliases: ["swiggy", "instamart", "dineout", "swiggy gourmet", "food delivery"],
    internalRoute: "/stores",
    defaultCoupon: { code: "SWIGGYIT", description: "Flat ₹120 off on food orders above ₹299", discountAmount: 120 },
    cashbackRate: "Up to 4.0%",
    cashbackPct: 0.03,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.swiggy.com/search?query=${encodeURIComponent(q)}`),
  },
  {
    id: "zomato",
    name: "Zomato",
    category: "food",
    region: "IN",
    tier: 1,
    logo: "/Brand logos/Amazon_logo.svg.webp",
    domain: "zomato.com",
    storeUrl: "https://www.zomato.com",
    isInstantOpen: false,
    status: "available",
    aliases: ["zomato", "blinkit", "dining", "gold", "zomato gold"],
    internalRoute: "/stores",
    defaultCoupon: { code: "ZOMATOGOLD", description: "Extra savings & complimentary dishes with Gold", discountAmount: 100 },
    cashbackRate: "₹35 per order",
    cashbackPct: 0.03,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.zomato.com`),
  },
  {
    id: "dominos",
    name: "Domino's Pizza",
    category: "food",
    region: "IN",
    tier: 2,
    logo: "/Brand logos/Amazon_logo.svg.webp",
    domain: "dominos.co.in",
    storeUrl: "https://www.dominos.co.in",
    isInstantOpen: false,
    status: "available",
    aliases: ["dominos", "domino's", "pizza", "dominos pizza"],
    internalRoute: "/stores",
    defaultCoupon: { code: "DOMINOS50", description: "Up to ₹100 off on pizzas and garlic bread", discountAmount: 100 },
    cashbackRate: "Up to 4.0%",
    cashbackPct: 0.035,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.dominos.co.in`),
  },
  {
    id: "udemy",
    name: "Udemy",
    category: "education",
    region: "GLOBAL",
    tier: 2,
    logo: "/gc-logo.webp",
    domain: "udemy.com",
    storeUrl: "https://www.udemy.com",
    isInstantOpen: false,
    status: "available",
    aliases: ["udemy", "coding courses", "python courses", "udemy courses"],
    internalRoute: "/stores",
    defaultCoupon: { code: "UDEMYDEAL", description: "Courses starting from ₹499 with lifetime access", discountPct: 0.2 },
    cashbackRate: "7.5%",
    cashbackPct: 0.075,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.udemy.com/courses/search/?q=${encodeURIComponent(q)}`),
  },
  {
    id: "hostinger",
    name: "Hostinger",
    category: "education",
    region: "GLOBAL",
    tier: 2,
    logo: "/gc-logo.webp",
    domain: "hostinger.in",
    storeUrl: "https://www.hostinger.in",
    isInstantOpen: false,
    status: "available",
    aliases: ["hostinger", "web hosting", "hosting", "domains"],
    internalRoute: "/stores",
    defaultCoupon: { code: "HOST2026", description: "Up to 75% off on Web Hosting + Free Domain", discountPct: 0.2 },
    cashbackRate: "Up to 25%",
    cashbackPct: 0.2,
    buildSearchUrl: (q) => wrapAffiliateTracking(`https://www.hostinger.in`),
  },

  // ─── Amazon India (Direct Associates Tag / Cuelinks Campaign) ──────────────
  {
    id: "amazon_in",
    name: "Amazon India",
    category: "general",
    region: "IN",
    tier: 1,
    logo: "/Brand logos/Amazon_logo.svg.webp",
    domain: "amazon.in",
    storeUrl: "https://www.amazon.in",
    isInstantOpen: true,
    status: "instant_open",
    aliases: ["amazon", "amazon.in", "amzn", "amazon india", "prime", "lightning deals"],
    internalRoute: "/amazon-coupons",
    defaultCoupon: { code: "AMZSAVE", description: "Flat ₹500 off on select electronics & appliances", discountAmount: 500 },
    cashbackRate: "Up to 7.0%",
    cashbackPct: 0.05,
    buildSearchUrl: (q) => `https://www.amazon.in/s?k=${encodeURIComponent(q)}&tag=${AMAZON_IN_PARTNER_TAG}`,
  },

  // ─── International / US ───────────────────────────────────────────────────
  {
    id: "amazon_us",
    name: "Amazon US",
    category: "general",
    region: "US",
    tier: 1,
    logo: "/Brand logos/Amazon_logo.svg.webp",
    domain: "amazon.com",
    storeUrl: "https://www.amazon.com",
    isInstantOpen: true,
    status: "instant_open",
    aliases: ["amazon us", "amazon.com"],
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
    logo: "/icons/WMT-Wordmark-Small-TrueBlue-RGB.png",
    domain: "walmart.com",
    storeUrl: "https://www.walmart.com",
    isInstantOpen: false,
    status: "available",
    aliases: ["walmart", "walmart+", "rollback"],
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
    logo: "/icons/bestbuy.svg",
    domain: "bestbuy.com",
    storeUrl: "https://www.bestbuy.com",
    isInstantOpen: false,
    status: "available",
    aliases: ["bestbuy", "best buy", "geek squad"],
    defaultCoupon: { code: "TECHBOOST", description: "Save on smart tech & computing accessories", discountAmount: 30 },
    cashbackRate: "Up to 5.5%",
    cashbackPct: 0.035,
    buildSearchUrl: (q) => `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(q)}`,
  },
];

/**
 * Finds registered stores matching a search query.
 * Matches on name, domain, aliases, category, or coupon code.
 * Prioritizes:
 * 1. Exact or startsWith on name/domain/alias
 * 2. Instant Open status
 * 3. High Volume (tier 1)
 */
export function findMatchingStores(query: string, limit = 3): RegisteredStore[] {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 2) return [];

  // Remove protocol and www if user pasted a domain/url
  const cleanQ = q
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split("/")[0]
    .trim();

  interface ScoredStore {
    store: RegisteredStore;
    score: number;
  }

  const scored: ScoredStore[] = [];

  for (const store of REGISTERED_STORES) {
    const sName = store.name.toLowerCase();
    const sDomain = store.domain.toLowerCase();
    const aliases = (store.aliases || []).map((a) => a.toLowerCase());
    const sCat = store.category.toLowerCase();

    let matchScore = 0;

    // 1. Exact domain or name match
    if (sDomain === cleanQ || sName === q) {
      matchScore += 1000;
    }
    // 2. StartsWith domain or name
    else if (sDomain.startsWith(cleanQ) || sName.startsWith(q)) {
      matchScore += 500;
    }
    // 3. Alias exact or startsWith
    else if (aliases.some((a) => a === q)) {
      matchScore += 800;
    } else if (aliases.some((a) => a.startsWith(q))) {
      matchScore += 400;
    }
    // 4. Substring in name, domain, or aliases
    else if (sName.includes(q) || sDomain.includes(cleanQ)) {
      matchScore += 250;
    } else if (aliases.some((a) => a.includes(q))) {
      matchScore += 200;
    }
    // 5. Category query match (e.g. "fashion" -> Myntra, Ajio)
    else if (sCat === q || sCat.includes(q)) {
      matchScore += 100;
    }
    // 6. Coupon code match
    else if (store.defaultCoupon?.code.toLowerCase().includes(q)) {
      matchScore += 150;
    }

    if (matchScore > 0) {
      // Bonus for Instant Open
      if (store.isInstantOpen) matchScore += 50;
      // Bonus for Tier 1 (High volume stores)
      if (store.tier === 1) matchScore += 30;

      scored.push({ store, score: matchScore });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.store);
}

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

  if (normCat.includes("food") || normCat.includes("restaurant") || normCat.includes("grocery") || normCat.includes("pizza") || normCat.includes("dineout")) {
    return stores.filter((s) => s.category === "food" || s.category === "general");
  }

  if (normCat.includes("course") || normCat.includes("learn") || normCat.includes("study") || normCat.includes("education")) {
    return stores.filter((s) => s.category === "education" || s.category === "general");
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
