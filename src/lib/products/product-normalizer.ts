/**
 * @file product-normalizer.ts
 * @description Converts AffiliateProduct → GoCouponProduct.
 *
 * This is the single conversion point. Every provider's raw output passes
 * through this normalizer before reaching the UI. If the shape of
 * AffiliateProduct changes, only this file needs updating.
 *
 * Flow:
 *   AmazonAPI → AmazonAdapter → AffiliateProduct → [THIS FILE] → GoCouponProduct → UI
 *   ImpactAPI → ImpactAdapter → AffiliateProduct → [THIS FILE] → GoCouponProduct → UI
 */

import type { AffiliateProduct } from "@/lib/affiliates/types";
import type { GoCouponProduct } from "./product-types";
import { getAffiliateCTALabel } from "./product-cta";

// ---------------------------------------------------------------------------
// Price formatting helpers (provider-agnostic)
// ---------------------------------------------------------------------------

function formatCurrency(amount: number, currency: string): string {
  if (currency === "INR") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  }
  return `${currency} ${amount}`;
}

function formatReviewCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k ratings`;
  return `${count} ratings`;
}

function buildSavingLabel(
  originalPrice: number | undefined,
  price: number | undefined,
  currency: string,
  rawSavingLabel?: string,
): string | undefined {
  // Use pre-computed label from metadata if available
  if (rawSavingLabel && typeof rawSavingLabel === "string") return rawSavingLabel;
  if (originalPrice !== undefined && price !== undefined && originalPrice > price) {
    const saving = originalPrice - price;
    return `Save ${formatCurrency(saving, currency)}`;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Normalizer
// ---------------------------------------------------------------------------

/**
 * Converts a provider-specific AffiliateProduct into a GoCouponProduct.
 * All UI components consume GoCouponProduct, never AffiliateProduct directly.
 *
 * @param raw - The AffiliateProduct from any provider adapter
 * @returns A fully populated GoCouponProduct ready for UI rendering
 */
export function normalizeAffiliateProduct(raw: AffiliateProduct): GoCouponProduct {
  const currency = raw.currency ?? "INR";
  const country = (raw.country ?? "IN") as "IN" | "US";
  const meta = raw.metadata ?? {};

  // Extract metadata fields safely (these come from provider-specific metadata)
  const rawBadge = typeof meta.badge === "string" ? meta.badge : undefined;
  const rawTags = Array.isArray(meta.tags) ? (meta.tags as string[]) : [];
  const rawCouponCode = typeof meta.couponCode === "string" ? meta.couponCode : undefined;
  const rawSavingLabel = typeof meta.savingLabel === "string" ? meta.savingLabel : undefined;
  const isMock = meta.isMock === true;

  return {
    id: `${raw.provider}:${raw.providerProductId}`,
    provider: raw.provider,
    providerProductId: raw.providerProductId,

    title: raw.title,
    description: raw.description,
    imageUrl: raw.imageUrl,
    productUrl: raw.productUrl,
    affiliateUrl: raw.affiliateUrl,

    price: raw.price,
    currency,
    originalPrice: raw.originalPrice,
    discountPercentage: raw.discountPercentage,

    savingLabel: buildSavingLabel(raw.originalPrice, raw.price, currency, rawSavingLabel),
    badge: rawBadge,

    dealPriceDisplay: raw.price !== undefined ? formatCurrency(raw.price, currency) : undefined,
    originalPriceDisplay:
      raw.originalPrice !== undefined ? formatCurrency(raw.originalPrice, currency) : undefined,

    rating: raw.rating,
    reviewCount: raw.reviewCount,
    reviewCountDisplay: raw.reviewCount !== undefined ? formatReviewCount(raw.reviewCount) : undefined,

    availability: (raw.availability ?? "Unknown") as GoCouponProduct["availability"],
    category: raw.category,
    brand: raw.brand,
    country,

    affiliateCTA: getAffiliateCTALabel(raw.provider),

    tags: rawTags,
    couponCode: rawCouponCode,

    fetchedAt: Date.now(),
    isAffiliate: raw.provider !== "mock",
    isMock,
  };
}

/**
 * Normalizes an array of AffiliateProducts.
 * Skips/logs any products that fail normalization rather than crashing.
 */
export function normalizeAffiliateProducts(raws: AffiliateProduct[]): GoCouponProduct[] {
  const results: GoCouponProduct[] = [];
  for (const raw of raws) {
    try {
      results.push(normalizeAffiliateProduct(raw));
    } catch (error) {
      console.error(
        `[GoCoupon Products] Failed to normalize product ${raw.providerProductId}:`,
        error,
      );
    }
  }
  return results;
}
