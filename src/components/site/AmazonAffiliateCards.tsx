/**
 * @file AmazonAffiliateCards.tsx
 * @description Featured affiliate product grid for the home page and Amazon coupons page.
 *
 * This component is now a thin wrapper around AffiliateProductGrid.
 * It sources products from the generic affiliate layer via the useFeaturedProducts hook.
 *
 * All Amazon-specific logic has been moved to:
 *   src/lib/affiliates/amazon/
 *
 * To switch this section to show Impact or Awin products in the future,
 * change the provider prop — no other code needs to change.
 */

import { AffiliateProductGrid } from "@/components/affiliate/AffiliateProductGrid";
import { useFeaturedProducts } from "@/hooks/use-products";
import { getDisplayProvider } from "@/lib/affiliates/index";

interface AmazonAffiliateCardsProps {
  /** Override provider (defaults to the active display provider) */
  provider?: string;
  /** Marketplace country */
  country?: "IN" | "US";
}

export function AmazonAffiliateCards({
  provider,
  country = "IN",
}: AmazonAffiliateCardsProps = {}) {
  const resolvedProvider = provider ?? getDisplayProvider();
  const { products } = useFeaturedProducts({ provider: resolvedProvider, limit: 3, country });

  if (products.length === 0) return null;

  // Determine section heading based on active provider
  const isAmazon = resolvedProvider === "amazon";
  const eyebrow = isAmazon ? "Amazon Verified Affiliate Deals" : "Verified Affiliate Deals";
  const heading = isAmazon
    ? "Curated Amazon India Deals & Stackable Promo Codes"
    : "Curated Deals & Stackable Promo Codes";

  return (
    <AffiliateProductGrid
      products={products}
      eyebrow={eyebrow}
      heading={heading}
      description="Handpicked top-rated products eligible for goCoupon auto-apply promos and instant bank card discounts."
      viewAllHref={isAmazon ? "/amazon-coupons" : undefined}
      viewAllLabel="View All Deals →"
      showDisclosure
    />
  );
}

// Keep type export for any external consumers
export type { AmazonAffiliateCardsProps };
