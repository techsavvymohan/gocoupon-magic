/**
 * @file mock-provider.ts
 * @description Development-only mock AffiliateProvider.
 *
 * Implements the full AffiliateProvider interface using fake data,
 * allowing the entire GoCoupon product UI and affiliate architecture
 * to be tested without real provider credentials.
 *
 * Controlled by: VITE_MOCK_PROVIDER_ENABLED=true
 * Must NEVER be the active provider in a production build.
 */

import type { AffiliateProvider, AffiliateProduct, ProductSearchQuery } from "../types";
import { MOCK_PRODUCTS } from "./mock-products";
import { MOCK_PROVIDER_ENABLED } from "../feature-flags";

export const mockProvider: AffiliateProvider = {
  name: "mock",

  capabilities: {
    productSearch: true,
    productDetails: true,
    affiliateLinks: true,
    promotions: false,
    cashback: false,
  },

  async searchProducts(query: ProductSearchQuery): Promise<AffiliateProduct[]> {
    if (!MOCK_PROVIDER_ENABLED) return [];

    // Simulate minimal filtering
    let results = MOCK_PRODUCTS;
    if (query.keyword) {
      const kw = query.keyword.toLowerCase();
      results = results.filter(
        (p) => p.title.toLowerCase().includes(kw) || p.category?.toLowerCase().includes(kw),
      );
    }
    if (query.category) {
      const cat = query.category.toLowerCase();
      results = results.filter((p) => p.category?.toLowerCase().includes(cat));
    }

    // Simulate network delay in development
    if (import.meta.env.DEV) {
      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    return results;
  },

  async getProduct(id: string): Promise<AffiliateProduct | null> {
    if (!MOCK_PROVIDER_ENABLED) return null;
    return MOCK_PRODUCTS.find((p) => p.providerProductId === id) ?? null;
  },

  async generateAffiliateLink(product: AffiliateProduct): Promise<string> {
    // Mock links always return example.com — never real affiliate URLs
    return `https://example.com/mock?id=${product.providerProductId}&ref=mock`;
  },
};
