/**
 * @file types.ts
 * @description Core provider-independent affiliate interfaces.
 *
 * ALL GoCoupon affiliate code depends on these types.
 * No provider-specific types (Amazon, Impact, Awin, etc.) should leak outside
 * their own provider directory.
 *
 * Architecture:
 *   AmazonAPI  →  AmazonAdapter  →  AffiliateProduct  →  ProductNormalizer  →  GoCouponProduct  →  UI
 *   ImpactAPI  →  ImpactAdapter  →  AffiliateProduct  →  (same normalizer)  →  GoCouponProduct  →  UI
 */

// ---------------------------------------------------------------------------
// Search Query
// ---------------------------------------------------------------------------

export interface ProductSearchQuery {
  keyword?: string;
  category?: string;
  brand?: string;

  minPrice?: number;
  maxPrice?: number;

  page?: number;
  limit?: number;

  /** Target marketplace country */
  country?: "IN" | "US";
}

// ---------------------------------------------------------------------------
// Normalized Affiliate Product
// ---------------------------------------------------------------------------

/**
 * The provider-independent product structure returned by every affiliate adapter.
 * UI components must NEVER consume provider-specific response shapes — only this.
 */
export interface AffiliateProduct {
  /** Which affiliate network provided this product (e.g. "amazon", "impact") */
  provider: string;

  /** The provider's own unique product identifier (ASIN for Amazon, etc.) */
  providerProductId: string;

  title: string;
  description?: string;

  imageUrl?: string;

  /** Canonical product URL (non-affiliate) */
  productUrl: string;

  /** Ready-to-use affiliate link with partner tag already embedded */
  affiliateUrl: string;

  price?: number;
  currency?: string;

  originalPrice?: number;
  discountPercentage?: number;

  rating?: number;
  reviewCount?: number;

  availability?: string;

  category?: string;
  brand?: string;

  /** Country / marketplace this product is from */
  country?: "IN" | "US";

  /**
   * Provider-specific extra fields.
   * Keep here rather than polluting the core interface.
   * UI must not read from metadata directly.
   */
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Provider Capabilities
// ---------------------------------------------------------------------------

/**
 * Declare what a provider can and cannot do.
 * Prevents Amazon-specific assumptions leaking into the application layer.
 */
export interface AffiliateProviderCapabilities {
  /** Can search/list products */
  productSearch: boolean;
  /** Can fetch a single product by ID */
  productDetails: boolean;
  /** Can generate affiliate-tagged links */
  affiliateLinks: boolean;
  /** Has promotions / coupon code API */
  promotions: boolean;
  /** Supports cashback commission sharing */
  cashback: boolean;
}

// ---------------------------------------------------------------------------
// Provider Interface
// ---------------------------------------------------------------------------

/**
 * Every affiliate provider must implement this interface.
 * Adding a new provider = implement this interface in its own directory.
 */
export interface AffiliateProvider {
  /** Stable provider slug — must match the registry key (e.g. "amazon") */
  name: string;

  capabilities: AffiliateProviderCapabilities;

  /**
   * Search products by keyword, category, price range, etc.
   * Return empty array (never throw) when provider is disabled.
   */
  searchProducts?(query: ProductSearchQuery): Promise<AffiliateProduct[]>;

  /**
   * Fetch a single product by its provider-specific ID.
   * Return null (never throw) when not found or provider is disabled.
   */
  getProduct?(id: string, country?: "IN" | "US"): Promise<AffiliateProduct | null>;

  /**
   * Generate / return the affiliate-tagged link for a product.
   * The link must already be embedded in AffiliateProduct.affiliateUrl,
   * but this can be called to re-generate with a specific marketplace.
   */
  generateAffiliateLink?(product: AffiliateProduct): Promise<string>;
}

// ---------------------------------------------------------------------------
// Provider Registry Type
// ---------------------------------------------------------------------------

export type AffiliateProviderRegistry = Record<string, AffiliateProvider>;
