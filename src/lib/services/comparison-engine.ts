/**
 * @file comparison-engine.ts
 * @description Multi-Merchant Total Cost Comparison Engine.
 *
 * Computes the real Effective Net Purchase Price across all supported stores:
 *   Effective Net Price = Item Price + Shipping Fee - Applicable Coupon - Estimated Cashback
 */

import { CANONICAL_OFFERS, CANONICAL_STORES, CANONICAL_COUPONS } from "@/data/canonicalCatalogData";
import type { MerchantOffer } from "./canonical-types";

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
  effectiveNetPrice: number;
  isBestDeal: boolean;
  savingsVsWorst: number;
  deliveryEstimate: string;
  affiliateUrl: string;
}

export interface ProductComparisonSummary {
  productId: string;
  rows: ComparisonRow[];
  bestDeal: ComparisonRow;
  maxSavings: number; // difference between highest store price and lowest store net price
  storesComparedCount: number;
}

/**
 * Generates full side-by-side merchant comparison for a product.
 */
export function compareProductOffers(productId: string): ProductComparisonSummary | null {
  const offers = CANONICAL_OFFERS.filter((o) => o.productId === productId);
  if (offers.length === 0) return null;

  const rows: ComparisonRow[] = offers.map((offer) => {
    const store = CANONICAL_STORES[offer.storeId] || {
      name: offer.storeName,
      cashbackRate: "Up to 5%",
      cashbackPercentage: 5,
    };

    const applicableCoupons = CANONICAL_COUPONS.filter((c) => c.storeId === offer.storeId);
    let bestCoupon = applicableCoupons[0];
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

    const priceAfterCoupon = Math.max(0, offer.itemPrice - couponDiscount);
    const cashback = Math.round((priceAfterCoupon * (store.cashbackPercentage || 0)) / 100);
    const effectiveNetPrice = priceAfterCoupon + (offer.shippingFee || 0) - cashback;

    return {
      offer,
      storeName: offer.storeName,
      storeLogo: offer.storeLogo || store.logoUrl,
      cashbackRate: store.cashbackRate,
      cashbackAmount: cashback,
      bestCouponCode: bestCoupon?.code,
      couponSavings: couponDiscount,
      shippingFee: offer.shippingFee || 0,
      itemPrice: offer.itemPrice,
      effectiveNetPrice,
      isBestDeal: false,
      savingsVsWorst: 0,
      deliveryEstimate: offer.deliveryTime || "2-3 Days Standard Delivery",
      affiliateUrl: offer.affiliateUrl,
    };
  });

  // Sort by lowest effective price
  rows.sort((a, b) => a.effectiveNetPrice - b.effectiveNetPrice);

  if (rows.length > 0) {
    rows[0].isBestDeal = true;
    const worstPrice = rows[rows.length - 1].itemPrice + rows[rows.length - 1].shippingFee;
    const bestPrice = rows[0].effectiveNetPrice;

    rows.forEach((r) => {
      r.savingsVsWorst = Math.max(0, worstPrice - r.effectiveNetPrice);
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
