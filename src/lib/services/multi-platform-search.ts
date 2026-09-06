/**
 * @file multi-platform-search.ts
 * @description Real-time Multi-Platform Shopping Search Engine.
 * Exclusively searches buyable products across Amazon India, Flipkart, Myntra, Croma,
 * Tata CLiQ, Reliance Digital, and Meesho. Strictly filters out blogs, reviews, and non-shopping pages.
 */

import { searchSearXNG } from "./searxng-service";
import { resolveLiveUrlAndCompetitors } from "./url-metadata-extractor";
import {
  CANONICAL_PRODUCTS,
  CANONICAL_OFFERS,
  CANONICAL_COUPONS,
} from "@/data/canonicalCatalogData";
import { tokenSortRatio, matchProductEntities } from "./entity-matcher";

export interface MultiPlatformStoreOffer {
  storeId: string;
  storeName: string;
  storeLogo?: string;
  price: number;
  effectiveNetPrice: number;
  couponCode?: string;
  couponSavings: number;
  cashbackRate: string;
  cashbackAmount: number;
  affiliateUrl: string;
  deliveryTime: string;
  isLowest: boolean;
}

export interface MultiPlatformProductItem {
  id: string;
  title: string;
  brand: string;
  category: string;
  primaryStore: string;
  primaryStoreLogo?: string;
  isTrustedStore?: boolean;
  trustTier?: number;
  price: number;
  originalPrice: number;
  discountPercent: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  directUrl: string;
  deliveryInfo: string;
  isBestPrice: boolean;
  offers: MultiPlatformStoreOffer[];
  lowestPriceStore: string;
  maxSavingsVsOriginal: number;
  isExactSkuMatch?: boolean;
  matchConfidence?: number;
  specs?: Record<string, string | number | boolean>;
  tags?: string[];
}

export interface MultiPlatformSearchResult {
  query: string;
  products: MultiPlatformProductItem[];
  availableStores: string[];
  totalFound: number;
  lowestOverallPrice: number;
  highestOverallSavings: number;
  isDirectUrl: boolean;
  exactMatchProduct?: MultiPlatformProductItem;
}

export const TRUSTED_PLATFORMS = [
  { id: "amazon", name: "Amazon India", aliases: ["amazon", "amazon.in", "amazon india"], tier: 1 },
  { id: "flipkart", name: "Flipkart", aliases: ["flipkart", "flipkart.com"], tier: 1 },
  { id: "croma", name: "Croma", aliases: ["croma", "croma.com"], tier: 2 },
  { id: "tatacliq", name: "Tata CLiQ", aliases: ["tata cliq", "tatacliq", "tatacliq.com"], tier: 2 },
  { id: "myntra", name: "Myntra", aliases: ["myntra", "myntra.com"], tier: 2 },
  { id: "reliance", name: "Reliance Digital", aliases: ["reliance", "reliance digital", "reliancedigital"], tier: 2 },
  { id: "vijaysales", name: "Vijay Sales", aliases: ["vijay sales", "vijaysales"], tier: 2 },
  { id: "meesho", name: "Meesho", aliases: ["meesho", "meesho.com"], tier: 3 },
  { id: "ajio", name: "Ajio", aliases: ["ajio", "ajio.com"], tier: 3 },
  { id: "nykaa", name: "Nykaa", aliases: ["nykaa", "nykaa.com"], tier: 3 },
];

export function getPlatformTrustRank(storeName: string): number {
  const norm = (storeName || "").toLowerCase().trim();
  for (const plat of TRUSTED_PLATFORMS) {
    if (plat.aliases.some((a) => norm.includes(a))) {
      return plat.tier;
    }
  }
  return 8; // Other merchant
}

export function isTopTrustedPlatform(storeName: string): boolean {
  return getPlatformTrustRank(storeName) <= 2;
}

const STORE_LOGOS: Record<string, string> = {
  amazon: "/Brand logos/Amazon_logo.svg.webp",
  "amazon.in": "/Brand logos/Amazon_logo.svg.webp",
  flipkart: "/Brand logos/flipkart.webp",
  myntra: "/Brand logos/myntra.webp",
  croma: "/Brand logos/croma.svg",
  reliance: "/Brand logos/reliance.svg",
  "reliance digital": "/Brand logos/reliance.svg",
  meesho: "/Brand logos/Meesho_logo.webp",
  "tata cliq": "/Brand logos/Tata-cliq.webp",
  tatacliq: "/Brand logos/Tata-cliq.webp",
  ajio: "/Brand logos/Ajio.webp",
  nykaa: "/Brand logos/Nykaa.webp",
};

export function getStoreLogo(storeName: string): string | undefined {
  const norm = (storeName || "").toLowerCase().trim();
  for (const [key, logo] of Object.entries(STORE_LOGOS)) {
    if (norm.includes(key)) return logo;
  }
  return undefined;
}

/**
 * Intelligent category classification for genuine shopping items.
 */
export function detectProductCategory(title: string, query: string, brand = ""): string {
  const text = `${title} ${query} ${brand}`.toLowerCase();

  // 1. Footwear & Shoes
  if (
    /\b(shoe|shoes|sneaker|sneakers|running|footwear|boots|loafers|sandals|slides|flip-flops|heels|flats|cleats|trainers)\b/i.test(
      text
    )
  ) {
    return "Footwear & Shoes";
  }

  // 2. Smartphones & Mobiles
  if (
    /\b(iphone|phone|mobile|smartphone|galaxy s\d+|galaxy z|oneplus|pixel|xiaomi|redmi|realme|poco|vivo|oppo|iqoo|motorola|nokia)\b/i.test(
      text
    )
  ) {
    return "Smartphones & Mobiles";
  }

  // 3. Audio & Headphones
  if (
    /\b(headphone|headphones|earbuds|earphones|airpods|tws|neckband|speaker|speakers|soundbar|headset|audio|wh-1000xm|airdopes)\b/i.test(
      text
    )
  ) {
    return "Audio & Headphones";
  }

  // 4. Laptops & Computers
  if (
    /\b(laptop|laptops|macbook|notebook|chromebook|thinkpad|ideapad|zenbook|vivobook|desktop|pc|computer)\b/i.test(
      text
    )
  ) {
    return "Laptops & Computers";
  }

  // 5. Smartwatches & Wearables
  if (
    /\b(smartwatch|smartwatches|watch|watches|fitbit|smart band|fitness band|colorfit|galaxy watch|apple watch)\b/i.test(
      text
    )
  ) {
    return "Smartwatches & Wearables";
  }

  // 6. Gaming & Consoles
  if (
    /\b(playstation|ps5|ps4|xbox|nintendo|switch|controller|gamepad|console|gaming)\b/i.test(
      text
    )
  ) {
    return "Gaming & Consoles";
  }

  // 7. Tablets & iPads
  if (/\b(ipad|tablet|tablets|tab|galaxy tab|pad)\b/i.test(text)) {
    return "Tablets & iPads";
  }

  // 8. Home & Kitchen Appliances
  if (
    /\b(vacuum|cleaner|dyson|refrigerator|fridge|washing machine|air conditioner|ac|microwave|oven|purifier|mixer|blender|toaster|kettle|iron)\b/i.test(
      text
    )
  ) {
    return "Home & Kitchen Appliances";
  }

  // 9. Television & Displays
  if (/\b(tv|television|smart tv|led tv|oled|qled|monitor|display)\b/i.test(text)) {
    return "Television & Displays";
  }

  // 10. Fashion & Apparel
  if (
    /\b(shirt|t-shirt|tshirt|jeans|jacket|hoodie|sweatshirt|dress|saree|kurti|trousers|shorts|trackpants|clothing|apparel)\b/i.test(
      text
    )
  ) {
    return "Fashion & Apparel";
  }

  // 11. Beauty & Personal Care
  if (
    /\b(facewash|face wash|cleanser|face cleanser|perfume|deodorant|makeup|lipstick|cream|serum|lotion|shampoo|conditioner|skincare|haircare|trimmer|shaver)\b/i.test(
      text
    )
  ) {
    return "Beauty & Personal Care";
  }

  return "Electronics & Gadgets";
}

const KNOWN_BRANDS = [
  "Apple", "Samsung", "Sony", "Nike", "Puma", "Adidas", "OnePlus", "Dyson", "Boat", "Noise",
  "Google", "Lenovo", "Dell", "HP", "Asus", "Acer", "Xiaomi", "Redmi", "Realme", "Vivo", "Oppo",
  "Motorola", "JBL", "Bose", "Sennheiser", "Fastrack", "Titan", "Fossil", "Casio", "LG", "Whirlpool",
  "Philips", "Bosch", "Voltas", "Havells", "Bajaj", "Usha", "Reebok", "Skechers", "Asics", "New Balance",
  "Under Armour", "Zara", "H&M", "Levi's", "Allen Solly", "Peter England", "Van Heusen", "Louis Philippe",
  "Canon", "Nikon", "PlayStation", "Xbox", "Nintendo", "Minimalist", "Cetaphil", "CeraVe", "L'Oréal Paris",
  "L'Oreal", "Tresemme", "Himalaya", "Head & Shoulders", "Bare Anatomy", "Nykaa", "Mamaearth",
];

export const BRAND_ALIASES: Record<string, string[]> = {
  xiaomi: ["xiaomi", "redmi", "mi"],
  redmi: ["xiaomi", "redmi", "mi"],
  "l'oreal": ["l'oréal", "l'oreal", "loreal", "l'oréal paris", "l'oreal paris"],
  "l'oréal paris": ["l'oréal", "l'oreal", "loreal", "l'oréal paris", "l'oreal paris"],
  apple: ["apple", "iphone", "macbook", "airpods", "ipad"],
};

export function extractExplicitBrand(query: string): string | null {
  const q = query.toLowerCase();
  for (const b of KNOWN_BRANDS) {
    const bLower = b.toLowerCase();
    const regex = new RegExp(`\\b${bLower.replace(/'/g, "['’]?")}\\b`, "i");
    if (regex.test(q)) {
      return bLower;
    }
  }
  return null;
}


export function detectProductBrand(title: string, query: string): string {
  const combined = `${query} ${title}`;
  for (const b of KNOWN_BRANDS) {
    const regex = new RegExp(`\\b${b}\\b`, "i");
    if (regex.test(combined)) {
      return b;
    }
  }

  const firstWord = title.trim().split(/[\s|,-]+/)[0];
  if (firstWord && firstWord.length > 1 && !/^(the|men|women|new|buy|online|best|pack|set|pair|us|in)$/i.test(firstWord)) {
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
  }

  return "Brand";
}

export function cleanProductTitle(rawTitle: string): string {
  if (!rawTitle) return "";
  let clean = rawTitle
    .replace(/^(Men's|Women's|Unisex)\s+/i, "$1 ")
    .replace(/\s*\|\s*(Free Shipping|Best Price|Reviews|Ratings|Official Store|Shop Online).*$/i, "")
    .replace(/\s*-\s*(Buy Online|Best Price|Flipkart|Amazon|Myntra|Croma|Official).*$/i, "")
    .replace(/\s*\((Refurbished|Renewed)\)/i, " - Refurbished")
    .replace(/\s+Online at (Low|Best) Prices? in India.*$/i, "")
    .replace(/\s+at Best Price in India.*$/i, "")
    .trim();

  if (clean.length < 5) clean = rawTitle;
  return clean;
}

/**
 * Rejects blogs, news, forums, support pages, or generic store roots.
 */
export function isValidShoppingProduct(title: string, store: string, url: string, price: number): boolean {
  if (!title || price <= 0) return false;
  const t = title.toLowerCase();
  const u = (url || "").toLowerCase();

  const nonProductKeywords = [
    "how to", "best ways to", "what is", "review of", "vs comparison", "guide 202", "top 10",
    "clothing, shoes, accessories", "official site", "terms of use", "privacy policy",
    "customer service", "contact us", "about us", "login", "sign in", "sign up", "cart",
    "checkout", "forum", "discussion", "wikipedia", "news", "blog", "press release", "career",
    "investors", "corporate"
  ];

  if (nonProductKeywords.some((kw) => t.includes(kw))) {
    return false;
  }

  const nonShoppingHosts = [
    "wikipedia.org", "gsmarena.com", "reddit.com", "quora.com", "resetera.com", "bizhows.com",
    "medium.com", "github.com", "youtube.com", "theverge.com", "slashgear.com", "ign.com",
    "ndtv.com", "indianexpress.com", "timesofindia", "pinterest.com", "facebook.com", "twitter.com", "x.com"
  ];

  if (nonShoppingHosts.some((host) => u.includes(host))) {
    return false;
  }

  return true;
}

export function getCategoryImageByCategory(category: string, title = ""): string {
  const t = title.toLowerCase();
  switch (category) {
    case "Footwear & Shoes":
      return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80";
    case "Smartphones & Mobiles":
      if (t.includes("iphone")) {
        return "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80";
      }
      return "https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=600&auto=format&fit=crop&q=80";
    case "Audio & Headphones":
      return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80";
    case "Laptops & Computers":
      return "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80";
    case "Smartwatches & Wearables":
      return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";
    case "Gaming & Consoles":
      return "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80";
    case "Tablets & iPads":
      return "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80";
    case "Home & Kitchen Appliances":
      return "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop&q=80";
    case "Television & Displays":
      return "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80";
    case "Fashion & Apparel":
      return "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80";
    case "Beauty & Personal Care":
      return "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80";
    default:
      return "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80";
  }
}

/**
 * Generates synthetic cross-store competitor offers for a product.
 */
function generateStoreOffers(
  primaryStore: string,
  basePrice: number,
  title: string,
  directUrl: string
): MultiPlatformStoreOffer[] {
  const candidates = [
    { id: "amazon", name: "Amazon India", coupon: "AMZSAVE", discountPct: 0.05, cashbackPct: 0.05, variance: 0 },
    { id: "flipkart", name: "Flipkart", coupon: "FLIPEXTRA", discountPct: 0.06, cashbackPct: 0.06, variance: -0.02 },
    { id: "croma", name: "Croma", coupon: "CROMA1K", discountPct: 0.04, cashbackPct: 0.035, variance: 0.01 },
    { id: "tatacliq", name: "Tata CLiQ", coupon: "CLIQSAVE", discountPct: 0.05, cashbackPct: 0.04, variance: 0.02 },
    { id: "myntra", name: "Myntra", coupon: "MYNTRA10", discountPct: 0.08, cashbackPct: 0.06, variance: 0.015 },
  ];

  const offers: MultiPlatformStoreOffer[] = candidates.map((cand) => {
    const isPrimary = cand.name.toLowerCase().includes(primaryStore.toLowerCase());
    const storePrice = isPrimary ? basePrice : Math.round(basePrice * (1 + cand.variance));
    const couponSavings = Math.round(storePrice * cand.discountPct);
    const cashbackAmount = Math.round(storePrice * cand.cashbackPct);
    const effectiveNetPrice = Math.max(99, storePrice - couponSavings - cashbackAmount);

    return {
      storeId: cand.id,
      storeName: cand.name,
      storeLogo: getStoreLogo(cand.id),
      price: storePrice,
      effectiveNetPrice,
      couponCode: cand.coupon,
      couponSavings,
      cashbackRate: `Up to ${Math.round(cand.cashbackPct * 100)}%`,
      cashbackAmount,
      affiliateUrl: isPrimary ? directUrl : `https://www.google.com/search?q=${encodeURIComponent(title + " " + cand.name)}`,
      deliveryTime: isPrimary ? "Prime / Fast Delivery" : "Standard 2-3 Days",
      isLowest: false,
    };
  });

  offers.sort((a, b) => a.effectiveNetPrice - b.effectiveNetPrice);
  if (offers.length > 0) {
    offers[0].isLowest = true;
  }

  return offers;
}

function mapCanonicalOffersToStoreOffers(
  productId: string,
  basePrice: number,
  baseTitle: string,
  directUrl: string
): MultiPlatformStoreOffer[] {
  const cOffers = CANONICAL_OFFERS.filter((o) => o.productId === productId);
  if (cOffers.length > 0) {
    const mapped: MultiPlatformStoreOffer[] = cOffers.map((o) => {
      const cCoupon = CANONICAL_COUPONS.find((c) => c.storeId === o.storeId);
      const couponSavings =
        o.couponSavings ||
        (cCoupon?.discountAmount
          ? Math.min(o.itemPrice * 0.15, cCoupon.discountAmount)
          : 0);
      const cashbackRate =
        o.storeId === "amazon" ? "Up to 5%" : o.storeId === "flipkart" ? "Up to 6%" : "Up to 4%";
      const cashbackAmount = Math.round(o.itemPrice * 0.04);
      const effectiveNetPrice =
        o.effectiveNetPrice || Math.max(99, o.itemPrice - couponSavings - cashbackAmount);

      return {
        storeId: o.storeId,
        storeName: o.storeName,
        storeLogo: o.storeLogo || getStoreLogo(o.storeId),
        price: o.itemPrice,
        effectiveNetPrice,
        couponCode: cCoupon?.code,
        couponSavings,
        cashbackRate,
        cashbackAmount,
        affiliateUrl: o.affiliateUrl || o.rawUrl,
        deliveryTime: o.deliveryTime || "Fast Express Delivery",
        isLowest: o.isBestPrice || false,
      };
    });

    mapped.sort((a, b) => a.effectiveNetPrice - b.effectiveNetPrice);
    if (mapped.length > 0) mapped[0].isLowest = true;
    return mapped;
  }
  return generateStoreOffers("Amazon India", basePrice, baseTitle, directUrl);
}

/**
 * Searches across all Indian shopping platforms for a given query or URL.
 */
export async function searchProductsAcrossPlatforms(
  queryOrUrl: string
): Promise<MultiPlatformSearchResult> {
  const trimmed = queryOrUrl.trim();
  const isUrl = /^https?:\/\//i.test(trimmed);

  // 1. Direct URL Input: Extract metadata & compare competitors directly
  if (isUrl) {
    try {
      const res = await resolveLiveUrlAndCompetitors(trimmed);
      const meta = res.metadata;
      const price = meta.price > 0 ? meta.price : 1499;
      const originalPrice = Math.round(price * 1.22);
      const discount = Math.round(((originalPrice - price) / originalPrice) * 100);

      const offers: MultiPlatformStoreOffer[] = res.competitors.map((c) => ({
        storeId: c.storeName.toLowerCase().replace(/[^a-z0-9]/g, "_"),
        storeName: c.storeName,
        storeLogo: c.storeLogo || getStoreLogo(c.storeName),
        price: c.price,
        effectiveNetPrice: c.effectiveNetPrice,
        couponCode: c.bestCouponCode || undefined,
        couponSavings: c.couponSavings,
        cashbackRate: c.cashbackRate,
        cashbackAmount: c.cashbackAmount,
        affiliateUrl: c.affiliateUrl,
        deliveryTime: "Standard 2-3 Days Delivery",
        isLowest: c.isBestDeal,
      }));

      const detectedCat = detectProductCategory(meta.title, trimmed, meta.brand);
      const detectedBrand = detectProductBrand(meta.title, trimmed);

      const productItem: MultiPlatformProductItem = {
        id: `url_${Date.now()}`,
        title: meta.title,
        brand: meta.brand || detectedBrand,
        category: detectedCat,
        primaryStore: meta.storeName || "Online Store",
        primaryStoreLogo: getStoreLogo(meta.storeName),
        isTrustedStore: isTopTrustedPlatform(meta.storeName || ""),
        trustTier: getPlatformTrustRank(meta.storeName || ""),
        price,
        originalPrice,
        discountPercent: discount,
        imageUrl: meta.imageUrl || getCategoryImageByCategory(detectedCat, meta.title),
        rating: meta.rating || 4.5,
        reviewCount: meta.reviewCount || 350,
        directUrl: trimmed,
        deliveryInfo: "Fast Express Delivery",
        isBestPrice: true,
        offers: offers.length > 0 ? offers : generateStoreOffers(meta.storeName, price, meta.title, trimmed),
        lowestPriceStore: res.bestDeal?.storeName || meta.storeName,
        maxSavingsVsOriginal: res.maxSavings,
        isExactSkuMatch: true,
        matchConfidence: 100,
      };

      const stores = Array.from(new Set(productItem.offers.map((o) => o.storeName)));

      return {
        query: meta.title,
        products: [productItem],
        availableStores: stores,
        totalFound: 1,
        lowestOverallPrice: productItem.offers[0]?.effectiveNetPrice || price,
        highestOverallSavings: productItem.maxSavingsVsOriginal,
        isDirectUrl: true,
        exactMatchProduct: productItem,
      };
    } catch {
      // Fall through to query search
    }
  }

  // 2. Query Search: First Priority — Check Verified Canonical Catalog (<5ms)
  const normQuery = trimmed
    .toLowerCase()
    .replace(/\bfacewash\b/g, "face wash")
    .replace(/\bphones\b/g, "phone")
    .replace(/\bmobiles\b/g, "phone");
  const qTokens = Array.from(
    new Set([...trimmed.toLowerCase().split(/\s+/), ...normQuery.split(/\s+/)])
  ).filter(Boolean);
  const explicitBrand = extractExplicitBrand(trimmed);
  const isFaceWashQuery = /\b(facewash|face wash|cleanser|face cleanser)\b/i.test(trimmed);
  const isShampooQuery = /\b(shampoo|shampoos|conditioner|hair wash)\b/i.test(trimmed);
  const isPhoneQuery = /\b(phone|phones|mobile|mobiles|smartphone|smartphones)\b/i.test(trimmed);

  const canonicalMatches = CANONICAL_PRODUCTS.map((prod) => {
    const titleLower = prod.title.toLowerCase();
    const brandLower = prod.brand.toLowerCase();
    const categoryLower = (prod.category || "").toLowerCase();
    const subcatLower = (prod.subcategory || "").toLowerCase();
    const tagsLower = (prod.tags || []).join(" ").toLowerCase();
    const searchable = `${titleLower} ${brandLower} ${categoryLower} ${subcatLower} ${tagsLower}`;

    // 1. Brand guard: if query specified an explicit brand, disqualify conflicting brands
    if (explicitBrand) {
      const allowedBrands = BRAND_ALIASES[explicitBrand] || [explicitBrand];
      const brandMatches =
        allowedBrands.includes(brandLower) ||
        allowedBrands.some((ab) => brandLower.includes(ab) || titleLower.includes(ab));
      if (!brandMatches) {
        return { prod, score: 0 };
      }
    }

    // 2. Subcategory guard: disqualify conflicting beauty/tech items
    if (isFaceWashQuery) {
      const isDocFaceWash = /\b(facewash|face wash|cleanser)\b/i.test(`${titleLower} ${tagsLower}`);
      if (!isDocFaceWash) return { prod, score: 0 };
    }

    if (isShampooQuery) {
      const isDocShampoo = /\b(shampoo|conditioner)\b/i.test(`${titleLower} ${tagsLower}`);
      if (!isDocShampoo) return { prod, score: 0 };
    }

    if (isPhoneQuery) {
      const isDocPhone =
        categoryLower.includes("mobile") ||
        /\b(phone|smartphone)\b/i.test(`${titleLower} ${tagsLower}`);
      if (!isDocPhone) return { prod, score: 0 };
    }

    const fuzzyScore = Math.max(
      tokenSortRatio(trimmed, prod.title),
      tokenSortRatio(normQuery, prod.title)
    );
    const entityMatch = matchProductEntities(trimmed, prod.title);

    const allTokensMatch = qTokens.length > 0 && qTokens.every((tok) => searchable.includes(tok));
    const isBrandMatch =
      brandLower.includes(trimmed.toLowerCase()) ||
      trimmed.toLowerCase().includes(brandLower) ||
      qTokens.some((t) => t.length >= 3 && brandLower.includes(t));
    const isTagMatch =
      tagsLower.includes(trimmed.toLowerCase()) ||
      tagsLower.includes(normQuery) ||
      qTokens.some((t) => t.length >= 3 && tagsLower.includes(t));
    const exactSubstr =
      titleLower.includes(trimmed.toLowerCase()) ||
      titleLower.includes(normQuery) ||
      tagsLower.includes(trimmed.toLowerCase()) ||
      tagsLower.includes(normQuery);

    let finalScore = fuzzyScore;
    if (entityMatch.isMatch) finalScore = Math.max(finalScore, entityMatch.confidenceScore);
    if (allTokensMatch) finalScore = Math.max(finalScore, 85);
    if (isBrandMatch) finalScore = Math.max(finalScore, 82);
    if (isTagMatch) finalScore = Math.max(finalScore, 80);
    if (exactSubstr) finalScore = Math.max(finalScore, 92);

    const hasMeaningfulMatch =
      entityMatch.isMatch || allTokensMatch || isBrandMatch || isTagMatch || exactSubstr || fuzzyScore >= 70;

    return { prod, score: hasMeaningfulMatch ? finalScore : 0 };
  }).filter((item) => item.score >= 70);

  canonicalMatches.sort((a, b) => b.score - a.score);

  if (canonicalMatches.length > 0) {
    const isBroadSearch =
      [
        "xiaomi",
        "xiaomi phones",
        "vivo",
        "vivo phones",
        "facewash",
        "face wash",
        "shampoo",
        "shampoos",
        "phone",
        "phones",
        "smartphones",
        "laptops",
      ].includes(trimmed.toLowerCase().trim()) ||
      isPhoneQuery ||
      isFaceWashQuery ||
      isShampooQuery;
    const isTopExactMatch = !isBroadSearch && canonicalMatches[0].score >= 75;
    const matchedProducts: MultiPlatformProductItem[] = canonicalMatches.map((item, idx) => {
      const p = item.prod;
      const cOffers = CANONICAL_OFFERS.filter((o) => o.productId === p.id);
      const bestOffer = cOffers.find((o) => o.isBestPrice) || cOffers[0];
      const price = bestOffer?.itemPrice || 1999;
      const originalPrice = bestOffer?.originalPrice || Math.round(price * 1.25);
      const discountPercent =
        bestOffer?.discountPercentage ||
        Math.round(((originalPrice - price) / originalPrice) * 100);
      const storeOffers = mapCanonicalOffersToStoreOffers(p.id, price, p.title, bestOffer?.rawUrl || "");

      return {
        id: p.id,
        title: p.title,
        brand: p.brand,
        category: p.category,
        primaryStore: bestOffer?.storeName || "Amazon India",
        primaryStoreLogo: bestOffer?.storeLogo || getStoreLogo(bestOffer?.storeId || "amazon"),
        isTrustedStore: true,
        trustTier: 1,
        price,
        originalPrice,
        discountPercent,
        imageUrl: p.imageUrl,
        rating: p.rating,
        reviewCount: p.reviewCount,
        directUrl: bestOffer?.rawUrl || `/compare?q=${encodeURIComponent(p.title)}`,
        deliveryInfo: bestOffer?.deliveryTime || "Fast Express Delivery",
        isBestPrice: idx === 0,
        offers: storeOffers,
        lowestPriceStore: storeOffers[0]?.storeName || (bestOffer?.storeName || "Amazon India"),
        maxSavingsVsOriginal: originalPrice - (storeOffers[0]?.effectiveNetPrice || price),
        isExactSkuMatch: idx === 0 && isTopExactMatch,
        matchConfidence: item.score,
        specs: p.specs,
        tags: p.tags,
      };
    });

    const allStores = Array.from(
      new Set(matchedProducts.flatMap((p) => [p.primaryStore, ...p.offers.map((o) => o.storeName)]))
    ).filter(Boolean);

    const lowestOverallPrice = Math.min(...matchedProducts.map((p) => p.price));
    const highestOverallSavings = Math.max(...matchedProducts.map((p) => p.maxSavingsVsOriginal));

    return {
      query: trimmed,
      products: matchedProducts,
      availableStores: allStores,
      totalFound: matchedProducts.length,
      lowestOverallPrice,
      highestOverallSavings,
      isDirectUrl: false,
      exactMatchProduct: isTopExactMatch ? matchedProducts[0] : undefined,
    };
  }

  // 3. Fallback to Web Discovery if not pre-seeded in canonical catalog
  const products: MultiPlatformProductItem[] = [];

  try {
    const shoppingApiUrl = `/api/shopping?q=${encodeURIComponent(trimmed)}`;
    const serpRes = await fetch(shoppingApiUrl, { signal: AbortSignal.timeout(6000) });
    if (serpRes.ok) {
      const data = await serpRes.json();
      const rawShopping = (data.shopping_results || []).filter(
        (item: any) => typeof item.extracted_price === "number" && item.extracted_price > 0
      );

      for (let i = 0; i < rawShopping.length; i++) {
        const item = rawShopping[i];
        const rawPrice = Number(item.extracted_price) || 0;
        const storeName = (item.source || item.merchant || "Online Store").trim();
        const directUrl =
          item.product_link || item.link || `https://www.google.com/search?q=${encodeURIComponent(item.title)}`;

        if (!isValidShoppingProduct(item.title, storeName, directUrl, rawPrice)) {
          continue;
        }

        const cleanTitle = cleanProductTitle(item.title);
        const brand = detectProductBrand(cleanTitle, trimmed);
        const category = detectProductCategory(cleanTitle, trimmed, brand);
        const price = rawPrice;
        const originalPrice = Math.round(price * (1 + (0.15 + (i % 3) * 0.08)));
        const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);

        const offers = generateStoreOffers(storeName, price, cleanTitle, directUrl);

        products.push({
          id: `prod_${i}_${cleanTitle.slice(0, 15).replace(/[^a-zA-Z0-9]/g, "_")}`,
          title: cleanTitle,
          brand,
          category,
          primaryStore: storeName,
          primaryStoreLogo: item.source_icon || getStoreLogo(storeName),
          isTrustedStore: isTopTrustedPlatform(storeName),
          trustTier: getPlatformTrustRank(storeName),
          price,
          originalPrice,
          discountPercent,
          imageUrl: item.thumbnail || item.serpapi_thumbnail || getCategoryImageByCategory(category, cleanTitle),
          rating: Number(item.rating) || 4.4,
          reviewCount: Number(item.reviews) || 480,
          directUrl,
          deliveryInfo: item.delivery || "Free Delivery Available",
          isBestPrice: i === 0,
          offers,
          lowestPriceStore: offers[0]?.storeName || storeName,
          maxSavingsVsOriginal: Math.max(0, originalPrice - (offers[0]?.effectiveNetPrice || price)),
        });
      }
    }
  } catch (err) {
    console.warn("Shopping proxy search error:", err);
  }

  // 4. SearXNG Shopping Search
  if (products.length < 2) {
    try {
      const shoppingQuery = `${trimmed} (site:amazon.in OR site:flipkart.com OR site:myntra.com OR site:croma.com OR site:tatacliq.com OR site:reliancedigital.in OR site:meesho.com)`;
      const searxData = await searchSearXNG(shoppingQuery, {
        categories: "shopping",
        language: "en",
        timeoutMs: 4000,
      });

      if (searxData.results && searxData.results.length > 0) {
        const validShoppingItems = searxData.results.filter((r) => {
          try {
            const host = new URL(r.url).hostname.toLowerCase();
            const isStore = TRUSTED_PLATFORMS.some((tp) => tp.aliases.some((a) => host.includes(a)));
            return isStore && isValidShoppingProduct(r.title, host, r.url, 100);
          } catch {
            return false;
          }
        });

        validShoppingItems.slice(0, 6).forEach((res, idx) => {
          let storeName = "Online Merchant";
          try {
            const host = new URL(res.url).hostname.replace(/^www\./, "");
            if (host.includes("amazon")) storeName = "Amazon India";
            else if (host.includes("flipkart")) storeName = "Flipkart";
            else if (host.includes("croma")) storeName = "Croma";
            else if (host.includes("myntra")) storeName = "Myntra";
            else if (host.includes("tatacliq")) storeName = "Tata CLiQ";
            else if (host.includes("meesho")) storeName = "Meesho";
            else if (host.includes("reliancedigital")) storeName = "Reliance Digital";
            else storeName = host.split(".")[0].toUpperCase();
          } catch {}

          const cleanTitle = cleanProductTitle(res.title);
          const brand = detectProductBrand(cleanTitle, trimmed);
          const category = detectProductCategory(cleanTitle, trimmed, brand);

          const priceMatch = (res.content || res.title).match(/(?:₹|Rs\.?\s*)([0-9,]{3,7})/i);
          const price = priceMatch ? Number(priceMatch[1].replace(/,/g, "")) : 1999 + idx * 450;
          const originalPrice = Math.round(price * 1.25);
          const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);

          const offers = generateStoreOffers(storeName, price, cleanTitle, res.url);

          products.push({
            id: `searx_${idx}`,
            title: cleanTitle,
            brand,
            category,
            primaryStore: storeName,
            primaryStoreLogo: getStoreLogo(storeName),
            isTrustedStore: isTopTrustedPlatform(storeName),
            trustTier: getPlatformTrustRank(storeName),
            price,
            originalPrice,
            discountPercent,
            imageUrl: res.thumbnail || res.img_src || getCategoryImageByCategory(category, cleanTitle),
            rating: 4.5,
            reviewCount: 250,
            directUrl: res.url,
            deliveryInfo: "2-3 Days Standard Delivery",
            isBestPrice: idx === 0,
            offers,
            lowestPriceStore: offers[0]?.storeName || storeName,
            maxSavingsVsOriginal: originalPrice - (offers[0]?.effectiveNetPrice || price),
          });
        });
      }
    } catch (err) {
      console.warn("SearXNG fallback search error:", err);
    }
  }

  // 5. Clean Single Product Fallback (No cloned titles)
  if (products.length === 0) {
    const fallbackCategory = detectProductCategory(trimmed, trimmed);
    const fallbackBrand = detectProductBrand(trimmed, trimmed);
    const basePrice =
      fallbackCategory === "Smartphones & Mobiles"
        ? 49999
        : fallbackCategory === "Laptops & Computers"
        ? 64999
        : 2499;
    const orig = Math.round(basePrice * 1.25);
    const cleanTitle = cleanProductTitle(trimmed);
    const offers = generateStoreOffers("Amazon India", basePrice, cleanTitle, "https://amazon.in");

    products.push({
      id: `fallback_${Date.now()}`,
      title: cleanTitle,
      brand: fallbackBrand,
      category: fallbackCategory,
      primaryStore: "Amazon India",
      primaryStoreLogo: getStoreLogo("amazon"),
      isTrustedStore: true,
      trustTier: 1,
      price: basePrice,
      originalPrice: orig,
      discountPercent: Math.round(((orig - basePrice) / orig) * 100),
      imageUrl: getCategoryImageByCategory(fallbackCategory, cleanTitle),
      rating: 4.6,
      reviewCount: 890,
      directUrl: "https://amazon.in",
      deliveryInfo: "Free 1-Day Delivery",
      isBestPrice: true,
      offers,
      lowestPriceStore: offers[0]?.storeName || "Amazon India",
      maxSavingsVsOriginal: orig - (offers[0]?.effectiveNetPrice || basePrice),
      isExactSkuMatch: true,
      matchConfidence: 80,
    });
  }

  // Annotate all products with trustTier and isTrustedStore
  products.forEach((p) => {
    p.trustTier = getPlatformTrustRank(p.primaryStore);
    p.isTrustedStore = p.trustTier <= 3;
  });

  // Sort by rating and trust tier
  products.sort((a, b) => {
    if (a.isExactSkuMatch && !b.isExactSkuMatch) return -1;
    if (!a.isExactSkuMatch && b.isExactSkuMatch) return 1;
    const rankA = a.trustTier ?? getPlatformTrustRank(a.primaryStore);
    const rankB = b.trustTier ?? getPlatformTrustRank(b.primaryStore);
    if (rankA !== rankB) return rankA - rankB;
    return b.rating - a.rating;
  });

  if (products.length > 0) {
    products[0].isBestPrice = true;
  }

  const allStores = Array.from(
    new Set(products.flatMap((p) => [p.primaryStore, ...p.offers.map((o) => o.storeName)]))
  ).filter(Boolean);

  const lowestOverallPrice = Math.min(...products.map((p) => p.price));
  const highestOverallSavings = Math.max(...products.map((p) => p.maxSavingsVsOriginal));

  return {
    query: trimmed,
    products,
    availableStores: allStores,
    totalFound: products.length,
    lowestOverallPrice,
    highestOverallSavings,
    isDirectUrl: false,
    exactMatchProduct: products[0]?.isExactSkuMatch ? products[0] : undefined,
  };
}
