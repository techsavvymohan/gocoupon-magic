/**
 * @file product-types.ts
 * @description GoCoupon's internal product model.
 *
 * This is the normalized, UI-ready product type that all components consume.
 * It is distinct from AffiliateProduct (the raw provider output) and is produced
 * by the ProductNormalizer after receiving AffiliateProduct from any provider.
 *
 * Flow:
 *   AmazonAPI → AmazonAdapter → AffiliateProduct → ProductNormalizer → GoCouponProduct → UI
 *   ImpactAPI → ImpactAdapter → AffiliateProduct → (same path)      → GoCouponProduct → UI
 */

export interface GoCouponProduct {
  /** Unique GoCoupon product identifier (provider:providerProductId) */
  id: string;

  /** Which affiliate network provided this (e.g. "amazon", "impact", "mock") */
  provider: string;

  /** Provider's own product ID (ASIN for Amazon, etc.) */
  providerProductId: string;

  title: string;
  description?: string;

  /** Display-ready image URL */
  imageUrl?: string;

  /** Canonical product URL (non-affiliate) */
  productUrl: string;

  /**
   * Affiliate-tagged URL. UI uses this for CTA clicks.
   * Never constructed directly in UI — set by the affiliate layer.
   */
  affiliateUrl: string;

  /** Current deal price (numeric, for calculations) */
  price?: number;

  /** ISO currency code (e.g. "INR", "USD") */
  currency: string;

  /** Original price before discount */
  originalPrice?: number;

  /** Discount percentage (0-100) */
  discountPercentage?: number;

  /** Formatted saving string for display e.g. "Save ₹4,500" */
  savingLabel?: string;

  /** Badge text for the card overlay e.g. "Prime Deal • 45% OFF" */
  badge?: string;

  /** Formatted deal price string e.g. "₹5,499" */
  dealPriceDisplay?: string;

  /** Formatted original price string e.g. "₹9,999" */
  originalPriceDisplay?: string;

  /** 1–5 star rating */
  rating?: number;

  /** Number of reviews/ratings */
  reviewCount?: number;

  /** Formatted review count e.g. "12.4k ratings" */
  reviewCountDisplay?: string;

  /** Availability status */
  availability?: "In Stock" | "Out of Stock" | "Limited Stock" | "Unknown";

  /** Product category e.g. "Electronics & Tech" */
  category?: string;

  /** Product brand */
  brand?: string;

  /** Marketplace country */
  country: "IN" | "US";

  /** CTA button label — never hard-coded; generated from provider config */
  affiliateCTA: string;

  /** Tags shown as pills on the card e.g. ["Bank Offer", "Free Delivery"] */
  tags: string[];

  /** Coupon/promo code if available */
  couponCode?: string;

  /**
   * Timestamps for data freshness tracking.
   * Phase 2: used to trigger re-fetch when stale.
   */
  fetchedAt: number;

  /** True for real affiliate products, false for mock/editorial */
  isAffiliate: boolean;

  /** True only for mock/dev data — never true in production */
  isMock?: boolean;
}

/**
 * Lightweight summary type used in lists/carousels.
 * Extends GoCouponProduct but only requires a subset of fields.
 */
export type GoCouponProductSummary = Pick<
  GoCouponProduct,
  | "id"
  | "provider"
  | "providerProductId"
  | "title"
  | "imageUrl"
  | "affiliateUrl"
  | "affiliateCTA"
  | "dealPriceDisplay"
  | "originalPriceDisplay"
  | "savingLabel"
  | "badge"
  | "rating"
  | "reviewCountDisplay"
  | "category"
  | "tags"
  | "couponCode"
  | "country"
  | "isMock"
>;
