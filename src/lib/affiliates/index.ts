/**
 * @file index.ts (affiliates barrel)
 * @description Provider registry and public exports for the affiliate layer.
 *
 * TO ADD A NEW PROVIDER:
 *   1. Create src/lib/affiliates/<provider>/ with required files
 *   2. Implement AffiliateProvider interface
 *   3. Import your provider here
 *   4. Add it to AFFILIATE_PROVIDERS map below
 *   5. Add VITE_<PROVIDER>_ENABLED env var to .env.example
 *
 * The rest of GoCoupon (UI, product layer, routes) requires NO changes.
 */

import type { AffiliateProvider } from "./types";
import { amazonProvider } from "./amazon/index";
import { mockProvider } from "./mock/mock-provider";
import { AMAZON_ENABLED, MOCK_PROVIDER_ENABLED } from "./feature-flags";

// ---------------------------------------------------------------------------
// Provider Registry
// ---------------------------------------------------------------------------
// Only enabled providers are added to the registry.
// Disabled providers are never instantiated, imported functions just return
// empty/null values via their own feature flag checks.
// ---------------------------------------------------------------------------

export const affiliateRegistry = new Map<string, AffiliateProvider>();

if (AMAZON_ENABLED) {
  affiliateRegistry.set("amazon", amazonProvider);
}

if (MOCK_PROVIDER_ENABLED) {
  affiliateRegistry.set("mock", mockProvider);
}

// ---------------------------------------------------------------------------
// Future providers — uncomment and implement when ready
// ---------------------------------------------------------------------------
// import { impactProvider } from "./impact/index";
// if (IMPACT_ENABLED) affiliateRegistry.set("impact", impactProvider);
//
// import { awinProvider } from "./awin/index";
// if (AWIN_ENABLED) affiliateRegistry.set("awin", awinProvider);
//
// import { cjProvider } from "./cj/index";
// if (CJ_ENABLED) affiliateRegistry.set("cj", cjProvider);
//
// import { sharesaleProvider } from "./sharesale/index";
// if (SHARESALE_ENABLED) affiliateRegistry.set("sharesale", sharesaleProvider);

// ---------------------------------------------------------------------------
// Determine active display provider
// ---------------------------------------------------------------------------
// The "display provider" is what gets shown in the deals sections.
// Priority: amazon > mock (never both at once in production)
// ---------------------------------------------------------------------------

export function getDisplayProvider(): string {
  if (AMAZON_ENABLED) return "amazon";
  if (MOCK_PROVIDER_ENABLED) return "mock";
  return "";
}

// Re-export types for convenience
export type { AffiliateProduct, AffiliateProvider, ProductSearchQuery } from "./types";
export { AMAZON_ENABLED, MOCK_PROVIDER_ENABLED } from "./feature-flags";
