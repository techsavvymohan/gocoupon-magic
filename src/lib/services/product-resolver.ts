/**
 * @file product-resolver.ts
 * @description Product and URL Resolver Service.
 *
 * Takes either:
 *  1. A pasted product URL from Amazon, Flipkart, Myntra, boAt, Croma, Nykaa, etc.
 *  2. A natural search query e.g. "Sony XM5" or "MacBook M3"
 *
 * Resolves to the canonical product, all merchant offers, active coupons, and lowest price.
 */

import {
  CANONICAL_PRODUCTS,
  CANONICAL_OFFERS,
  CANONICAL_COUPONS,
  CANONICAL_STORES,
  CANONICAL_EVIDENCE,
} from "@/data/canonicalCatalogData";
import type {
  CanonicalProduct,
  MerchantOffer,
  StoreCoupon,
  ProductEvidence,
} from "./canonical-types";

export interface ResolvedProductResult {
  product: CanonicalProduct;
  offers: MerchantOffer[];
  bestOffer: MerchantOffer;
  coupons: StoreCoupon[];
  evidence: ProductEvidence[];
  savingsFromHighestPrice: number;
  matchType: "exact_url_asin" | "exact_identifier" | "title_fuzzy" | "fallback_top_match";
  resolvedStore?: string;
}

/**
 * Extracts product identifier tokens or ASIN from a URL.
 */
export function parseProductUrl(url: string): {
  storeId?: string;
  asin?: string;
  productId?: string;
  cleanQuery?: string;
} {
  const trimmed = url.trim();

  // Amazon IN / US
  const amazonAsinMatch = trimmed.match(/\/dp\/([A-Z0-9]{10})/i) || trimmed.match(/\/gp\/product\/([A-Z0-9]{10})/i);
  if (amazonAsinMatch) {
    return { storeId: "amazon", asin: amazonAsinMatch[1].toUpperCase() };
  }

  // Flipkart
  if (trimmed.includes("flipkart.com")) {
    const fkMatch = trimmed.match(/itm[a-z0-9]+/i) || trimmed.match(/\/p\/([^?]+)/i);
    return { storeId: "flipkart", productId: fkMatch ? fkMatch[0] : undefined };
  }

  // Myntra
  if (trimmed.includes("myntra.com")) {
    const myntraMatch = trimmed.match(/\/(\d+)\/buy/i) || trimmed.match(/\/sneakers\/([^/]+)/i);
    return { storeId: "myntra", productId: myntraMatch ? myntraMatch[1] : undefined };
  }

  // boAt
  if (trimmed.includes("boat-lifestyle.com")) {
    const boatMatch = trimmed.match(/\/products\/([^?]+)/i);
    return { storeId: "boat", cleanQuery: boatMatch ? boatMatch[1].replace(/-/g, " ") : undefined };
  }

  // Croma
  if (trimmed.includes("croma.com")) {
    const cromaMatch = trimmed.match(/\/p\/(\d+)/i);
    return { storeId: "croma", productId: cromaMatch ? cromaMatch[1] : undefined };
  }

  return { cleanQuery: trimmed };
}

/**
 * Resolves a URL or search query into a canonical product with multi-store offers.
 */
export function resolveProduct(input: string): ResolvedProductResult | null {
  if (!input || !input.trim()) return null;

  const parsed = parseProductUrl(input);

  // 1. Exact ASIN match
  if (parsed.asin) {
    const match = CANONICAL_PRODUCTS.find((p) => p.identifiers.asin === parsed.asin);
    if (match) return buildResolvedResult(match, "exact_url_asin", "amazon");
  }

  // 2. Exact Product ID match
  const directIdMatch = CANONICAL_PRODUCTS.find(
    (p) => p.id === input.trim() || p.slug === input.trim().toLowerCase(),
  );
  if (directIdMatch) {
    return buildResolvedResult(directIdMatch, "exact_identifier");
  }

  // 3. Search query fuzzy match
  const searchTerms = (parsed.cleanQuery || input).toLowerCase().split(/\s+/).filter(Boolean);
  let bestScore = 0;
  let bestMatch: CanonicalProduct | null = null;

  for (const product of CANONICAL_PRODUCTS) {
    let score = 0;
    const titleLower = product.title.toLowerCase();
    const brandLower = product.brand.toLowerCase();
    const catLower = product.category.toLowerCase();
    const tagsLower = product.tags.map((t) => t.toLowerCase()).join(" ");

    for (const term of searchTerms) {
      if (titleLower.includes(term)) score += 4;
      if (brandLower.includes(term)) score += 3;
      if (tagsLower.includes(term)) score += 2;
      if (catLower.includes(term)) score += 1;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = product;
    }
  }

  if (bestMatch && bestScore >= 3) {
    return buildResolvedResult(bestMatch, "title_fuzzy", parsed.storeId);
  }

  // Fallback to top rated product if searching broadly
  if (CANONICAL_PRODUCTS.length > 0 && searchTerms.length > 0) {
    return buildResolvedResult(CANONICAL_PRODUCTS[0], "fallback_top_match", parsed.storeId);
  }

  return null;
}

/**
 * Helper to construct the complete resolution object
 */
function buildResolvedResult(
  product: CanonicalProduct,
  matchType: ResolvedProductResult["matchType"],
  resolvedStore?: string,
): ResolvedProductResult {
  const offers = CANONICAL_OFFERS.filter((o) => o.productId === product.id).sort(
    (a, b) => a.effectiveNetPrice - b.effectiveNetPrice,
  );

  // Mark best price
  if (offers.length > 0) {
    offers[0].isBestPrice = true;
  }

  const bestOffer = offers[0] || {
    id: `off_fallback_${product.id}`,
    productId: product.id,
    storeId: "amazon",
    storeName: "Amazon India",
    rawUrl: `https://www.amazon.in/dp/${product.identifiers.asin || ""}`,
    affiliateUrl: `https://www.amazon.in/dp/${product.identifiers.asin || ""}?tag=gocoupon0e-21`,
    itemPrice: 29990,
    shippingFee: 0,
    currency: "INR",
    stockStatus: "In Stock",
    lastCheckedAt: Date.now(),
    isBestPrice: true,
    effectiveNetPrice: 29990,
  };

  const highestOfferPrice = Math.max(...offers.map((o) => o.itemPrice), bestOffer.itemPrice);
  const lowestOfferPrice = bestOffer.effectiveNetPrice;
  const savings = Math.max(0, highestOfferPrice - lowestOfferPrice);

  const coupons = CANONICAL_COUPONS.filter((c) =>
    offers.some((o) => o.storeId === c.storeId),
  );

  const evidence = CANONICAL_EVIDENCE.filter((e) => e.productId === product.id);

  return {
    product,
    offers,
    bestOffer,
    coupons,
    evidence,
    savingsFromHighestPrice: savings,
    matchType,
    resolvedStore,
  };
}

/**
 * Searches all canonical products.
 */
export function searchCanonicalProducts(query?: string, category?: string): CanonicalProduct[] {
  let list = [...CANONICAL_PRODUCTS];

  if (category && category !== "All") {
    list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  if (query && query.trim()) {
    const q = query.toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  return list;
}
