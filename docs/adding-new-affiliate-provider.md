# Adding a New Affiliate Provider

## Overview

Adding a new provider (e.g. Impact, Awin, CJ, ShareASale) requires:
1. Creating files in `src/lib/affiliates/<provider>/`
2. Implementing the `AffiliateProvider` interface
3. Registering in `src/lib/affiliates/index.ts`
4. Adding environment variables

The existing `ProductCard`, `AffiliateProductGrid`, `AnimatedDealsCarousel`, `useProducts`, and all routes require **zero changes**.

---

## Step-by-Step Guide

### Step 1 — Create the provider directory

```
src/lib/affiliates/impact/
├── impact-config.ts
├── impact-client.ts
├── impact-products.ts
├── impact-links.ts
└── index.ts
```

### Step 2 — Create `impact-config.ts`

```ts
export interface ImpactConfig {
  enabled: boolean;
  accountSid: string;
  // ... other config
}

export function getImpactConfig(): ImpactConfig {
  const enabled = import.meta.env.VITE_IMPACT_ENABLED === "true";
  return {
    enabled,
    accountSid: import.meta.env.VITE_IMPACT_ACCOUNT_SID ?? "",
  };
}
```

### Step 3 — Create `impact-products.ts`

```ts
import type { AffiliateProduct, ProductSearchQuery } from "../types";

export async function searchImpactProducts(query: ProductSearchQuery): Promise<AffiliateProduct[]> {
  // Call /api/affiliates/products?provider=impact&...
  const response = await fetch(`/api/affiliates/products?provider=impact&keyword=${query.keyword ?? ""}`);
  const data = await response.json();
  // Normalize to AffiliateProduct[]
  return data.products.map(normalizeImpactProduct);
}

function normalizeImpactProduct(raw: unknown): AffiliateProduct {
  // Map Impact API response fields → AffiliateProduct interface
  return {
    provider: "impact",
    providerProductId: (raw as any).id,
    title: (raw as any).name,
    // ... other fields
    affiliateUrl: (raw as any).trackingUrl,
    productUrl: (raw as any).landingPageUrl,
  };
}
```

### Step 4 — Create `impact-links.ts`

```ts
import type { AffiliateProduct } from "../types";

export async function generateImpactAffiliateLink(product: AffiliateProduct): Promise<string> {
  return product.affiliateUrl; // Impact tracking URLs are pre-generated
}

export function getImpactCTA(): string {
  return "View Deal";
}
```

### Step 5 — Create `index.ts`

```ts
import type { AffiliateProvider } from "../types";
import { IMPACT_ENABLED } from "../feature-flags";
import { searchImpactProducts } from "./impact-products";
import { generateImpactAffiliateLink } from "./impact-links";

export const impactProvider: AffiliateProvider = {
  name: "impact",
  capabilities: {
    productSearch: true,
    productDetails: true,
    affiliateLinks: true,
    promotions: true,
    cashback: false,
  },
  async searchProducts(query) {
    if (!IMPACT_ENABLED) return [];
    return searchImpactProducts(query);
  },
  async getProduct(id) {
    if (!IMPACT_ENABLED) return null;
    // implement single product fetch
    return null;
  },
  async generateAffiliateLink(product) {
    return generateImpactAffiliateLink(product);
  },
};
```

### Step 6 — Register in `src/lib/affiliates/index.ts`

Uncomment the Impact lines:
```ts
import { impactProvider } from "./impact/index";
if (IMPACT_ENABLED) affiliateRegistry.set("impact", impactProvider);
```

### Step 7 — Add feature flag to `feature-flags.ts`

The `IMPACT_ENABLED` flag already exists. Just ensure it reads the correct env var (it does).

### Step 8 — Add environment variables

Add to `.env.example` and Vercel Dashboard:
```env
VITE_IMPACT_ENABLED=true
VITE_IMPACT_ACCOUNT_SID=your_account_sid
# Server-side only (no VITE_ prefix):
IMPACT_API_KEY=your_api_key
```

### Step 9 — Add the CTA to `product-cta.ts`

The `impact` entry already exists in `CTA_MAP`:
```ts
impact: {
  label: "View Deal",
  ariaLabel: "View this deal — opens in a new tab",
  rel: "noopener noreferrer sponsored",
},
```

### Step 10 — Add disclosure to `AffiliateDisclosure.tsx`

The Impact entry already exists in `PROVIDER_DISCLOSURES`. Update the text if needed.

---

## Testing

```env
VITE_IMPACT_ENABLED=true
VITE_MOCK_PROVIDER_ENABLED=false
VITE_AMAZON_ENABLED=false
```

The existing `AnimatedDealsCarousel` and `AffiliateProductGrid` will automatically show Impact products.
