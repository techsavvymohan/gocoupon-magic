/**
 * @file product-service.ts
 * @description Provider-neutral product fetching service.
 *
 * This is what UI hooks call. It connects:
 *   affiliate-service → product-normalizer → GoCouponProduct[]
 *
 * Never put Amazon-specific logic here.
 */

import type { GoCouponProduct } from "./product-types";
import type { ProductSearchQuery } from "@/lib/affiliates/types";
import { affiliateService } from "@/lib/affiliates/affiliate-service";
import { normalizeAffiliateProducts } from "./product-normalizer";
import { getDisplayProvider } from "@/lib/affiliates/index";
import { AFFILIATE_SYSTEM_ENABLED } from "@/lib/affiliates/feature-flags";

export interface GetDealsOptions {
  /** Which provider to use (defaults to getDisplayProvider()) */
  provider?: string;
  query?: ProductSearchQuery;
}

/**
 * Fetches deals from the appropriate provider and normalizes them.
 *
 * @example
 * const products = await getDealsForDisplay({ provider: "amazon", query: { country: "IN" } });
 */
export async function getDealsForDisplay(
  options: GetDealsOptions = {},
): Promise<GoCouponProduct[]> {
  if (!AFFILIATE_SYSTEM_ENABLED) return [];

  const provider = options.provider ?? getDisplayProvider();
  if (!provider) return [];

  const raw = await affiliateService.searchProducts(provider, options.query ?? {});
  return normalizeAffiliateProducts(raw);
}

/**
 * Fetches a single product by ID from a given provider.
 * Returns null when not found or provider disabled.
 */
export async function getProductById(
  provider: string,
  productId: string,
  country?: "IN" | "US",
): Promise<GoCouponProduct | null> {
  if (!AFFILIATE_SYSTEM_ENABLED) return null;

  const raw = await affiliateService.getProduct(provider, productId, country);
  if (!raw) return null;

  const normalized = normalizeAffiliateProducts([raw]);
  return normalized[0] ?? null;
}

/**
 * Fetches all deals from all enabled providers combined.
 * Used when displaying a multi-provider deal feed.
 * 
 * Phase 1: Only one provider is typically active at a time.
 * Phase 2: This will interleave results from Amazon + Impact + Awin.
 */
export async function getAllDeals(query?: ProductSearchQuery): Promise<GoCouponProduct[]> {
  if (!AFFILIATE_SYSTEM_ENABLED) return [];

  const providers = affiliateService.getRegisteredProviders();
  const results = await Promise.allSettled(
    providers.map((p) => affiliateService.searchProducts(p, query ?? {})),
  );

  const allRaw = results
    .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof affiliateService.searchProducts>>> => r.status === "fulfilled")
    .flatMap((r) => r.value);

  return normalizeAffiliateProducts(allRaw);
}
