/**
 * @file amazon-products.ts
 * @description Amazon product data and adapter.
 *
 * Phase 1: Returns normalized static product data (moved from hard-coded
 * component arrays). All existing visual data is preserved but now flows
 * through the generic AffiliateProduct interface.
 *
 * Phase 2 upgrade path:
 *   Replace the static `AMAZON_IN_PRODUCTS` array with a call to:
 *   `fetch("/api/affiliates/products?provider=amazon&country=IN&...")`
 *   The rest of GoCoupon (normalizer, product service, UI) requires NO changes.
 *
 * IMPORTANT:
 * - This file must NOT contain UI logic.
 * - This file must NOT contain database logic.
 * - This file must NOT expose Amazon credentials.
 * - All output must conform to AffiliateProduct (provider-independent interface).
 */

import type { AffiliateProduct, ProductSearchQuery } from "../types";
import { getAmazonConfig } from "./amazon-config";
import { ensureAffiliateTag } from "./amazon-links";
import { normalizeAvailability } from "./amazon-utils";
import { AMAZON_ENABLED } from "../feature-flags";

// ---------------------------------------------------------------------------
// Static Product Data (Phase 1)
// ---------------------------------------------------------------------------
// This data was previously hard-coded directly in AmazonAffiliateCards.tsx and
// AnimatedDealsCarousel.tsx. It is now centralized here, normalized to the
// generic AffiliateProduct shape, and consumed through the affiliate service.
//
// When Phase 2 is implemented, this array is replaced by a real API call.
// ---------------------------------------------------------------------------

const AMAZON_IN_PRODUCTS_RAW: AffiliateProduct[] = [
  {
    provider: "amazon",
    providerProductId: "B08L5VJYV3",
    title: "Premium Wireless Noise-Cancelling Headphones & Audio",
    description:
      "Top-rated noise-cancelling wireless headphones with premium sound quality and long battery life.",
    imageUrl: "/amazon-deals-tech.webp",
    productUrl: "https://www.amazon.in/dp/B08L5VJYV3",
    affiliateUrl: "https://www.amazon.in/dp/B08L5VJYV3?tag=gocoupon0e-21",
    price: 5499,
    currency: "INR",
    originalPrice: 9999,
    discountPercentage: 45,
    rating: 4.8,
    reviewCount: 12400,
    availability: "In Stock",
    category: "Electronics & Tech",
    country: "IN",
    metadata: {
      badge: "Prime Deal • 45% OFF",
      couponCode: "AMZTECH10",
      tags: ["Auto-Apply Coupon", "Bank Offer Stackable", "Free One-Day Delivery"],
      savingLabel: "Save ₹4,500",
    },
  },
  {
    provider: "amazon",
    providerProductId: "B09NODE976",
    title: "Smart Espresso Machine & Compact Home Kitchen Setup",
    description:
      "Compact smart espresso machine perfect for home kitchens. Easy to use and easy to clean.",
    imageUrl: "/amazon-deals-home.webp",
    productUrl: "https://www.amazon.in/b?node=976442031",
    affiliateUrl: "https://www.amazon.in/b?node=976442031&tag=gocoupon0e-21",
    price: 5299,
    currency: "INR",
    originalPrice: 8499,
    discountPercentage: 38,
    rating: 4.7,
    reviewCount: 8900,
    availability: "In Stock",
    category: "Home & Appliances",
    country: "IN",
    metadata: {
      badge: "Trending • 38% OFF",
      couponCode: "AMZHOME15",
      tags: ["Extra 10% ICICI Card", "Zero Cost EMI", "Manufacturer Warranty"],
      savingLabel: "Save ₹3,200",
    },
  },
  {
    provider: "amazon",
    providerProductId: "B09FASH648",
    title: "Minimalist Smartwatches & Luxury Accessories Bundle",
    description:
      "Minimalist design smartwatch with luxury accessories. Perfect for fashion-conscious shoppers.",
    imageUrl: "/amazon-deals-fashion.webp",
    productUrl: "https://www.amazon.in/b?node=6648217031",
    affiliateUrl: "https://www.amazon.in/b?node=6648217031&tag=gocoupon0e-21",
    price: 2399,
    currency: "INR",
    originalPrice: 4999,
    discountPercentage: 52,
    rating: 4.9,
    reviewCount: 15100,
    availability: "In Stock",
    category: "Fashion & Watches",
    country: "IN",
    metadata: {
      badge: "Limited Deal • 52% OFF",
      couponCode: "AMZFASH20",
      tags: ["Instant Coupon -₹300", "SBI Card Cashback", "Easy 10-Day Return"],
      savingLabel: "Save ₹2,600",
    },
  },
  {
    provider: "amazon",
    providerProductId: "B09BEAU135",
    title: "Minimalist Luxury Skincare & Organic Botanical Set",
    description:
      "Dermatologist-approved luxury skincare set with organic botanical ingredients.",
    imageUrl: "/amazon-deals-beauty.webp",
    productUrl: "https://www.amazon.in/b?node=1355016031",
    affiliateUrl: "https://www.amazon.in/b?node=1355016031&tag=gocoupon0e-21",
    price: 2700,
    currency: "INR",
    originalPrice: 4500,
    discountPercentage: 40,
    rating: 4.9,
    reviewCount: 9300,
    availability: "In Stock",
    category: "Beauty & Grooming",
    country: "IN",
    metadata: {
      badge: "Best Seller • 40% OFF",
      couponCode: "AMZGLOW15",
      tags: ["Dermatologist Approved", "Extra 15% Vouchers"],
      savingLabel: "Save ₹1,800",
    },
  },
  {
    provider: "amazon",
    providerProductId: "B09WTCH350",
    title: "Sleek Chronograph Watch with Genuine Leather",
    description:
      "Premium chronograph watch featuring genuine leather strap and sapphire crystal glass.",
    imageUrl: "/amazon-deals-watches.webp",
    productUrl: "https://www.amazon.in/b?node=1350387031",
    affiliateUrl: "https://www.amazon.in/b?node=1350387031&tag=gocoupon0e-21",
    price: 3499,
    currency: "INR",
    originalPrice: 6999,
    discountPercentage: 50,
    rating: 4.8,
    reviewCount: 11700,
    availability: "In Stock",
    category: "Watches & Luxury",
    country: "IN",
    metadata: {
      badge: "Hot Offer • 50% OFF",
      couponCode: "AMZTIME20",
      tags: ["2-Year Warranty", "Free Premium Case"],
      savingLabel: "Save ₹3,500",
    },
  },
  {
    provider: "amazon",
    providerProductId: "B09GDGT279",
    title: "Wireless Charging Pad & Smart Home Audio Hub",
    description:
      "15W fast wireless charging pad with built-in smart home audio hub connectivity.",
    imageUrl: "/amazon-deals-gadgets.webp",
    productUrl: "https://www.amazon.in/b?node=976419031",
    affiliateUrl: "https://www.amazon.in/b?node=976419031&tag=gocoupon0e-21",
    price: 2799,
    currency: "INR",
    originalPrice: 4299,
    discountPercentage: 35,
    rating: 4.7,
    reviewCount: 6800,
    availability: "In Stock",
    category: "Smart Gadgets",
    country: "IN",
    metadata: {
      badge: "Top Choice • 35% OFF",
      couponCode: "AMZDESK10",
      tags: ["Fast Charging 15W", "Prime One-Day"],
      savingLabel: "Save ₹1,500",
    },
  },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Search Amazon India products.
 *
 * Phase 1: Filters the static dataset by keyword/category.
 * Phase 2: Replace implementation to call /api/affiliates/products?provider=amazon
 *
 * Returns [] gracefully when AMAZON_ENABLED=false.
 */
export async function searchAmazonProducts(
  query: ProductSearchQuery = {},
): Promise<AffiliateProduct[]> {
  if (!AMAZON_ENABLED) return [];

  const config = getAmazonConfig(query.country ?? "IN");
  // Phase 2: Live API call in browser environment
  if (typeof window !== "undefined") {
    try {
      const params = new URLSearchParams({
        provider: "amazon",
        country: query.country ?? "IN",
      });
      if (query.keyword) params.set("keyword", query.keyword);
      if (query.category) params.set("category", query.category);
      if (query.minPrice !== undefined) params.set("minPrice", String(query.minPrice));
      if (query.maxPrice !== undefined) params.set("maxPrice", String(query.maxPrice));
      if (query.limit) params.set("limit", String(query.limit));

      const res = await fetch(`/api/affiliates/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          return data.products.map((p: any) => ({
            ...p,
            affiliateUrl: config.partnerTag
              ? ensureAffiliateTag(p.affiliateUrl, config.country)
              : p.affiliateUrl,
            availability: normalizeAvailability(p.availability),
            metadata: {
              badge: p.badge,
              couponCode: p.couponCode,
              tags: p.tags,
              savingLabel: p.savingLabel,
            },
          }));
        }
      }
    } catch {
      // Fallback to local catalog
    }
  }

  // Phase 1 / SSR Static Fallback
  let results = AMAZON_IN_PRODUCTS_RAW;

  // Apply keyword filter
  if (query.keyword) {
    const kw = query.keyword.toLowerCase();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(kw) ||
        p.category?.toLowerCase().includes(kw) ||
        p.description?.toLowerCase().includes(kw),
    );
  }

  // Apply category filter
  if (query.category) {
    const cat = query.category.toLowerCase();
    results = results.filter((p) => p.category?.toLowerCase().includes(cat));
  }

  // Apply price range
  if (query.minPrice !== undefined) {
    results = results.filter((p) => (p.price ?? 0) >= query.minPrice!);
  }
  if (query.maxPrice !== undefined) {
    results = results.filter((p) => (p.price ?? Infinity) <= query.maxPrice!);
  }

  // Re-tag affiliate URLs with current config (ensures correct partner tag)
  return results.map((p) => ({
    ...p,
    affiliateUrl: config.partnerTag
      ? ensureAffiliateTag(p.affiliateUrl, config.country)
      : p.affiliateUrl,
    availability: normalizeAvailability(p.availability),
  }));
}

/**
 * Get a single Amazon product by ASIN.
 *
 * Phase 1: Searches the static dataset.
 * Phase 2: Call /api/affiliates/products/{id}?provider=amazon
 *
 * Returns null gracefully when AMAZON_ENABLED=false or product not found.
 */
export async function getAmazonProduct(
  asin: string,
  country: "IN" | "US" = "IN",
): Promise<AffiliateProduct | null> {
  if (!AMAZON_ENABLED) return null;

  const config = getAmazonConfig(country);
  const product = AMAZON_IN_PRODUCTS_RAW.find(
    (p) => p.providerProductId.toUpperCase() === asin.toUpperCase(),
  );

  if (!product) return null;

  return {
    ...product,
    affiliateUrl: config.partnerTag
      ? ensureAffiliateTag(product.affiliateUrl, config.country)
      : product.affiliateUrl,
    availability: normalizeAvailability(product.availability),
  };
}

/**
 * Returns all Amazon India products (no filtering).
 * Convenience function used by the featured deals sections.
 */
export async function getAllAmazonProducts(
  country: "IN" | "US" = "IN",
): Promise<AffiliateProduct[]> {
  return searchAmazonProducts({ country });
}
