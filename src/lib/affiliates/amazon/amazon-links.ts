/**
 * @file amazon-links.ts
 * @description Amazon affiliate URL builder.
 *
 * The ONLY file in GoCoupon that is allowed to construct Amazon affiliate URLs.
 * All other code must use AffiliateProduct.affiliateUrl (pre-built) or
 * call generateAffiliateLink() from the Amazon provider.
 *
 * COMPLIANCE:
 * - Links must only be triggered by an explicit user click on "View Deal on Amazon".
 * - No automatic redirects to Amazon are permitted.
 * - The user must always see the GoCoupon product information first.
 */

import { getAmazonConfig } from "./amazon-config";
import { stripPartnerTag } from "./amazon-utils";
import type { AffiliateProduct } from "../types";

/**
 * Builds an Amazon affiliate URL for a given ASIN.
 *
 * @param asin - The Amazon Standard Identification Number
 * @param country - Marketplace country ("IN" for Amazon India, "US" for Amazon US)
 * @returns Affiliate URL string with partner tag, or a plain Amazon URL if tag is missing
 *
 * @example
 * buildAmazonProductUrl("B08L5VJYV3", "IN")
 * // → "https://www.amazon.in/dp/B08L5VJYV3?tag=gocoupon0e-21"
 */
export function buildAmazonProductUrl(asin: string, country: "IN" | "US" = "IN"): string {
  const config = getAmazonConfig(country);
  const base = `https://${config.marketplace}/dp/${asin}`;
  if (!config.partnerTag) return base;
  return `${base}?tag=${config.partnerTag}`;
}

/**
 * Ensures an existing Amazon URL has the correct partner tag.
 * Strips any existing tag first to prevent double-tagging.
 *
 * @param url - Any Amazon product URL (may or may not have a tag)
 * @param country - Which marketplace config to use for the partner tag
 */
export function ensureAffiliateTag(url: string, country: "IN" | "US" = "IN"): string {
  const config = getAmazonConfig(country);
  if (!config.partnerTag) return url;

  const clean = stripPartnerTag(url);
  try {
    const parsed = new URL(clean);
    parsed.searchParams.set("tag", config.partnerTag);
    return parsed.toString();
  } catch {
    // Fallback: append manually
    const separator = clean.includes("?") ? "&" : "?";
    return `${clean}${separator}tag=${config.partnerTag}`;
  }
}

/**
 * Generates an affiliate link for a product using the Amazon provider configuration.
 * This is the implementation of AffiliateProvider.generateAffiliateLink for Amazon.
 *
 * @param product - The AffiliateProduct (must have provider="amazon")
 * @returns The affiliate URL with the correct partner tag for the product's country
 */
export async function generateAmazonAffiliateLink(product: AffiliateProduct): Promise<string> {
  const country = (product.country ?? "IN") as "IN" | "US";
  // If the product already has an affiliateUrl, re-tag it to ensure freshness
  if (product.affiliateUrl) {
    return ensureAffiliateTag(product.affiliateUrl, country);
  }
  // If we have a productUrl, tag it
  if (product.productUrl) {
    return ensureAffiliateTag(product.productUrl, country);
  }
  // Last resort: build from ASIN stored in providerProductId
  return buildAmazonProductUrl(product.providerProductId, country);
}

/**
 * Returns the provider-appropriate CTA label for Amazon.
 * Used by the generic CTA system so UI never hard-codes "View Deal on Amazon".
 */
export function getAmazonCTA(_country?: "IN" | "US"): string {
  return "View Deal on Amazon";
}

/**
 * Returns the provider-appropriate CTA label with marketplace context.
 * @example getAmazonCTAWithMarketplace("IN") → "View Deal on Amazon.in"
 */
export function getAmazonCTAWithMarketplace(country: "IN" | "US" = "IN"): string {
  return country === "IN" ? "View Deal on Amazon.in" : "View Deal on Amazon.com";
}
