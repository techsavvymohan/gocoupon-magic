# Impact Provider — Not Yet Implemented

## Status
**Stub — Pending Implementation**

This directory is a placeholder for the Impact affiliate network integration.

## To Implement

### Step 1 — Create these files:
```
src/lib/affiliates/impact/
├── impact-config.ts      — Read VITE_IMPACT_* env vars
├── impact-client.ts      — Impact API communication (server-side, via /api/affiliates/)
├── impact-products.ts    — searchImpactProducts(), getImpactProduct()
├── impact-links.ts       — Impact affiliate URL builder
└── index.ts              — Export impactProvider: AffiliateProvider
```

### Step 2 — Implement `AffiliateProvider` interface in `index.ts`:
```ts
import type { AffiliateProvider } from "../types";
export const impactProvider: AffiliateProvider = {
  name: "impact",
  capabilities: { productSearch: true, productDetails: true, affiliateLinks: true, promotions: true, cashback: false },
  async searchProducts(query) { ... },
  async getProduct(id, country) { ... },
  async generateAffiliateLink(product) { ... },
};
```

### Step 3 — Register in `src/lib/affiliates/index.ts`:
```ts
import { impactProvider } from "./impact/index";
if (IMPACT_ENABLED) affiliateRegistry.set("impact", impactProvider);
```

### Step 4 — Add environment variables to `.env.example`:
```env
VITE_IMPACT_ENABLED=true
VITE_IMPACT_ACCOUNT_SID=
# Server-side only:
IMPACT_API_KEY=
```

### Step 5 — Add `VITE_IMPACT_ENABLED=true` to your env.

The existing `ProductCard`, `AffiliateProductGrid`, `AnimatedDealsCarousel`, and all routes require **no changes**.

## Impact API Reference
- https://developer.impact.com/
