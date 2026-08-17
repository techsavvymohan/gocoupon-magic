/**
 * @file affiliate-service.ts
 * @description Provider-routing affiliate service.
 *
 * This is the entry point the product layer uses to query any affiliate provider.
 * It routes calls through the provider registry so callers never need to know
 * which provider they're talking to.
 *
 * Usage:
 *   import { affiliateService } from "@/lib/affiliates/affiliate-service";
 *   const products = await affiliateService.searchProducts("amazon", { keyword: "laptop" });
 */

import type { AffiliateProduct, AffiliateProvider, ProductSearchQuery } from "./types";
import { affiliateRegistry } from "./index";

export const affiliateService = {
  /**
   * Search products via a named provider.
   * Returns [] gracefully if the provider is not registered or disabled.
   */
  async searchProducts(
    providerName: string,
    query: ProductSearchQuery = {},
  ): Promise<AffiliateProduct[]> {
    const provider = affiliateRegistry.get(providerName);
    if (!provider) {
      if (import.meta.env.DEV) {
        console.warn(
          `[GoCoupon Affiliates] Provider "${providerName}" is not registered. ` +
            `Registered providers: [${[...affiliateRegistry.keys()].join(", ")}]`,
        );
      }
      return [];
    }
    if (!provider.searchProducts) {
      if (import.meta.env.DEV) {
        console.warn(
          `[GoCoupon Affiliates] Provider "${providerName}" does not implement searchProducts.`,
        );
      }
      return [];
    }
    try {
      return await provider.searchProducts(query);
    } catch (error) {
      // Provider failures must never crash GoCoupon
      console.error(`[GoCoupon Affiliates] searchProducts failed for provider "${providerName}":`, error);
      return [];
    }
  },

  /**
   * Get a single product by provider-specific ID.
   * Returns null gracefully if the provider is not registered or product not found.
   */
  async getProduct(
    providerName: string,
    id: string,
    country?: "IN" | "US",
  ): Promise<AffiliateProduct | null> {
    const provider = affiliateRegistry.get(providerName);
    if (!provider?.getProduct) return null;
    try {
      return await provider.getProduct(id, country);
    } catch (error) {
      console.error(`[GoCoupon Affiliates] getProduct failed for provider "${providerName}":`, error);
      return null;
    }
  },

  /**
   * Generate an affiliate link for a product.
   * Falls back to the product's existing affiliateUrl if generation fails.
   */
  async generateAffiliateLink(
    providerName: string,
    product: AffiliateProduct,
  ): Promise<string> {
    const provider = affiliateRegistry.get(providerName);
    if (!provider?.generateAffiliateLink) return product.affiliateUrl;
    try {
      return await provider.generateAffiliateLink(product);
    } catch (error) {
      console.error(`[GoCoupon Affiliates] generateAffiliateLink failed for "${providerName}":`, error);
      return product.affiliateUrl;
    }
  },

  /**
   * Returns the registered provider object, or undefined.
   * Use this to inspect provider capabilities before calling methods.
   */
  getProvider(providerName: string): AffiliateProvider | undefined {
    return affiliateRegistry.get(providerName);
  },

  /** Returns all currently registered provider names. */
  getRegisteredProviders(): string[] {
    return [...affiliateRegistry.keys()];
  },
};
