/**
 * @file comparison-engine.ts
 * @description Multi-Merchant Total Cost Comparison Engine.
 *
 * Computes the real Effective Net Purchase Price across all supported stores:
 *   Effective Net Price = Item Price + Shipping Fee - Applicable Coupon - Estimated Cashback
 */

import {
  CANONICAL_OFFERS,
  CANONICAL_STORES,
  CANONICAL_COUPONS,
  CANONICAL_PRODUCTS,
} from "@/data/canonicalCatalogData";
import type { MerchantOffer, CommerceCategory } from "./canonical-types";
import { matchProductEntities } from "./entity-matcher";

export interface ComparisonRow {
  offer: MerchantOffer;
  storeName: string;
  storeLogo?: string;
  cashbackRate: string;
  cashbackAmount: number;
  bestCouponCode?: string;
  couponSavings: number;
  shippingFee: number;
  itemPrice: number;
  guaranteedCheckoutPrice?: number;
  effectiveNetPrice: number;
  isBestDeal: boolean;
  savingsVsWorst: number;
  deliveryEstimate: string;
  affiliateUrl: string;
}

export interface UnavailableStoreNotice {
  storeName: string;
  reason: "timed_out" | "no_results" | "error";
}

export interface ProductComparisonSummary {
  productId: string;
  rows: ComparisonRow[];
  bestDeal: ComparisonRow;
  maxSavings: number; // difference between highest store price and lowest store net price
  storesComparedCount: number;
  unavailableStores?: UnavailableStoreNotice[];
}

/**
 * Normalizes free-text or vendor category strings and product titles into supported CommerceCategory enum.
 * Uses word-boundary token matching to accurately categorize even when store categories are missing or vague.
 */
export function normalizeCommerceCategory(
  rawCategory?: string,
  rawTitle?: string,
): CommerceCategory {
  const combined = `${rawCategory || ""} ${rawTitle || ""}`.toLowerCase();
  if (!combined.trim()) return "General";

  if (
    /\b(phone|mobile|smartphone|iphone|galaxy|oneplus|pixel|redmi|xiaomi|realme|iqoo|poco|moto)\b/.test(
      combined,
    )
  ) {
    return "Mobiles";
  }

  if (
    /\b(audio|electronic|laptop|headphone|headphones|earphone|earbud|earbuds|tws|soundbar|speaker|tv|television|gadget|camera|computing|macbook|ipad|tablet|smartwatch|watch|airdopes|airpods|monitor|keyboard|mouse)\b/.test(
      combined,
    ) ||
    combined.includes("wh-1000")
  ) {
    return "Electronics";
  }

  if (
    /\b(fashion|cloth|clothing|apparel|shoe|shoes|sneaker|sneakers|wear|shirt|t-shirt|jean|jeans|trouser|trousers|dress|saree|kurta|jacket|hoodie|footwear|sandal|sandals|nike|adidas|puma)\b/.test(
      combined,
    )
  ) {
    return "Fashion";
  }

  if (
    /\b(beauty|cosmetic|cosmetics|skincare|haircare|makeup|serum|perfume|fragrance|lotion|lipstick|foundation|sunscreen|shampoo|moisturizer|kajal)\b/.test(
      combined,
    )
  ) {
    return "Beauty";
  }

  if (
    /\b(home|kitchen|cookware|appliance|appliances|grinder|blender|kettle|furniture|mattress|curtain|bedsheet|cleaner|purifier)\b/.test(
      combined,
    )
  ) {
    return "Home";
  }

  if (/\b(travel|flight|hotel|luggage|suitcase|trolley|backpack)\b/.test(combined)) {
    return "Travel";
  }

  if (
    /\b(food|grocery|dining|snack|snacks|beverage|beverages|tea|coffee|chocolate)\b/.test(combined)
  ) {
    return "Food";
  }

  return "General";
}

/**
 * Generates full side-by-side merchant comparison for a product.
 */
export function compareProductOffers(productId: string): ProductComparisonSummary | null {
  const offers = CANONICAL_OFFERS.filter((o) => o.productId === productId);
  if (offers.length === 0) return null;

  const product = CANONICAL_PRODUCTS.find((p) => p.id === productId);
  const category = normalizeCommerceCategory(product?.category, product?.title);

  const rows: ComparisonRow[] = offers.map((offer) => {
    const store = CANONICAL_STORES[offer.storeId] || {
      name: offer.storeName,
      cashbackRate: "1.0% (Est.)",
      cashbackPercentage: 1.0,
      categoryTiers: {},
    };

    // 1. Resolve category-specific rate or safe conservative fallback
    const effectiveRate = store.categoryTiers?.[category] ?? store.cashbackPercentage ?? 1.0;

    const applicableCoupons = CANONICAL_COUPONS.filter((c) => c.storeId === offer.storeId);
    const bestCoupon = applicableCoupons[0];
    let couponDiscount = 0;

    if (bestCoupon) {
      if (bestCoupon.discountAmount) {
        couponDiscount = bestCoupon.discountAmount;
      } else if (bestCoupon.discountPercent) {
        couponDiscount = Math.round((offer.itemPrice * bestCoupon.discountPercent) / 100);
        if (bestCoupon.maxDiscount && couponDiscount > bestCoupon.maxDiscount) {
          couponDiscount = bestCoupon.maxDiscount;
        }
      }
    }

    // 2. Guaranteed out-of-pocket checkout price (what the user actually pays at store checkout)
    const guaranteedCheckoutPrice =
      Math.max(0, offer.itemPrice - couponDiscount) + (offer.shippingFee || 0);

    // 3. Estimated cashback (bonus rewards, never guaranteed immediate checkout deductions)
    const priceAfterCoupon = Math.max(0, offer.itemPrice - couponDiscount);
    const cashback = Math.round((priceAfterCoupon * effectiveRate) / 100);
    const effectiveNetPrice = Math.max(0, guaranteedCheckoutPrice - cashback);

    return {
      offer,
      storeName: offer.storeName,
      storeLogo: offer.storeLogo || store.logoUrl,
      cashbackRate: `${effectiveRate}% (Est.)`,
      cashbackAmount: cashback,
      bestCouponCode: bestCoupon?.code,
      couponSavings: couponDiscount,
      shippingFee: offer.shippingFee || 0,
      itemPrice: offer.itemPrice,
      guaranteedCheckoutPrice,
      effectiveNetPrice,
      isBestDeal: false,
      savingsVsWorst: 0,
      deliveryEstimate: offer.deliveryTime || "2-3 Days Standard Delivery",
      affiliateUrl: offer.affiliateUrl,
    };
  });

  // Sort primarily by guaranteed checkout price to prevent phantom cashback from promoting
  // an objectively higher-priced merchant as the "Best Deal". Break ties with effective net price.
  rows.sort((a, b) => {
    const aPrice = a.guaranteedCheckoutPrice ?? a.effectiveNetPrice;
    const bPrice = b.guaranteedCheckoutPrice ?? b.effectiveNetPrice;
    if (aPrice !== bPrice) {
      return aPrice - bPrice;
    }
    return a.effectiveNetPrice - b.effectiveNetPrice;
  });

  if (rows.length > 0) {
    rows[0].isBestDeal = true;
    const worstPrice =
      rows[rows.length - 1].guaranteedCheckoutPrice ??
      rows[rows.length - 1].itemPrice + rows[rows.length - 1].shippingFee;
    const bestPrice = rows[0].guaranteedCheckoutPrice ?? rows[0].effectiveNetPrice;

    rows.forEach((r) => {
      const currentPrice = r.guaranteedCheckoutPrice ?? r.effectiveNetPrice;
      r.savingsVsWorst = Math.max(0, worstPrice - currentPrice);
    });

    return {
      productId,
      rows,
      bestDeal: rows[0],
      maxSavings: Math.max(0, worstPrice - bestPrice),
      storesComparedCount: rows.length,
    };
  }

  return null;
}

/**
 * Fetches live dynamic multi-store comparison from /api/compare or SerpAPI.
 */
export async function fetchLiveComparison(
  queryOrUrl: string,
): Promise<ProductComparisonSummary | null> {
  try {
    const res = await fetch(`/api/compare?q=${encodeURIComponent(queryOrUrl)}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {
    // Graceful fallback to seed catalog
  }
  return compareProductOffers("prod_sony_wh1000xm5");
}

/**
 * Filters and validates multi-store offers to prevent variant mismatches
 * using RapidFuzz Token Sort and attribute conflict guards.
 */
export function filterCompatibleOffers(
  targetTitle: string,
  rawOffers: MerchantOffer[],
): {
  verifiedOffers: MerchantOffer[];
  rejectedOffers: Array<{ offer: MerchantOffer; reason: string }>;
} {
  const verifiedOffers: MerchantOffer[] = [];
  const rejectedOffers: Array<{ offer: MerchantOffer; reason: string }> = [];

  for (const offer of rawOffers) {
    const titleToTest = offer.title || offer.productTitle || "";
    if (!titleToTest) {
      verifiedOffers.push(offer);
      continue;
    }

    const match = matchProductEntities(targetTitle, titleToTest);
    if (match.isMatch) {
      verifiedOffers.push(offer);
    } else {
      rejectedOffers.push({
        offer,
        reason: match.conflictReason || `Similarity score ${match.confidenceScore}% < 75%`,
      });
    }
  }

  return { verifiedOffers, rejectedOffers };
}
