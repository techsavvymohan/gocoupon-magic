/**
 * @file index.ts (amazon provider)
 * @description Assembles and exports the Amazon AffiliateProvider implementation.
 *
 * This is the ONLY file outside the amazon/ directory that imports from it.
 * The affiliate registry imports this file to register the amazon provider.
 */

import type { AffiliateProvider, AffiliateProduct, ProductSearchQuery } from "../types";
import { AMAZON_ENABLED } from "../feature-flags";
import { searchAmazonProducts, getAmazonProduct } from "./amazon-products";
import { generateAmazonAffiliateLink, getAmazonCTA } from "./amazon-links";

export const amazonProvider: AffiliateProvider = {
  name: "amazon",

  capabilities: {
    productSearch: true,
    productDetails: true,
    affiliateLinks: true,
    // Not implemented in Phase 1 — Amazon promotions API requires separate approval
    promotions: false,
    // Amazon cashback is explicitly NOT implemented per project requirements
    cashback: false,
  },

  async searchProducts(query: ProductSearchQuery): Promise<AffiliateProduct[]> {
    if (!AMAZON_ENABLED) return [];
    return searchAmazonProducts(query);
  },

  async getProduct(id: string, country?: "IN" | "US"): Promise<AffiliateProduct | null> {
    if (!AMAZON_ENABLED) return null;
    return getAmazonProduct(id, country ?? "IN");
  },

  async generateAffiliateLink(product: AffiliateProduct): Promise<string> {
    return generateAmazonAffiliateLink(product);
  },
};

export { getAmazonCTA };
