# GoCoupon Affiliate Architecture

## Overview

GoCoupon is built as an **Affiliate Commerce Platform**, not as an Amazon-specific website. Amazon is the first *provider*, not the foundation that everything depends upon.

```
                         GoCoupon
                            │
                     Affiliate Layer
                            │
              ┌─────────────┼─────────────┐
              │             │             │
           Amazon         Impact         Awin
              │             │             │
        Amazon API       Impact API      Awin API
              │             │             │
              └─────────────┼─────────────┘
                            ↓
                    Generic Product
                       Interface
                            ↓
                    Product Service
                            ↓
                    GoCoupon UI
                            ↓
                 Affiliate CTA (user click)
                            ↓
                  Merchant product page
```

## Directory Structure

```
src/
├── lib/
│   ├── affiliates/
│   │   ├── types.ts                  ← Core interfaces (AffiliateProduct, AffiliateProvider)
│   │   ├── feature-flags.ts          ← Env-driven feature flags
│   │   ├── affiliate-service.ts      ← Provider-routing service
│   │   ├── index.ts                  ← Provider registry + barrel
│   │   │
│   │   ├── amazon/                   ← ALL Amazon-specific code lives here
│   │   │   ├── amazon-config.ts
│   │   │   ├── amazon-products.ts
│   │   │   ├── amazon-links.ts
│   │   │   ├── amazon-utils.ts
│   │   │   ├── index.ts
│   │   │   └── README.md
│   │   │
│   │   ├── mock/                     ← Dev-only mock provider
│   │   │   ├── mock-products.ts
│   │   │   └── mock-provider.ts
│   │   │
│   │   ├── impact/README.md          ← Future provider stub
│   │   ├── awin/README.md            ← Future provider stub
│   │   ├── cj/README.md              ← Future provider stub
│   │   └── sharesale/README.md       ← Future provider stub
│   │
│   ├── products/
│   │   ├── product-types.ts          ← GoCouponProduct (UI-ready model)
│   │   ├── product-normalizer.ts     ← AffiliateProduct → GoCouponProduct
│   │   ├── product-service.ts        ← Fetching service for UI hooks
│   │   └── product-cta.ts            ← Provider CTA labels
│   │
│   └── analytics/
│       └── affiliate-analytics.ts    ← Click/impression tracking
│
├── components/
│   └── affiliate/
│       ├── AffiliateProductGrid.tsx  ← Generic product grid (no provider if/else)
│       └── AffiliateDisclosure.tsx   ← Affiliate disclosure (per FTC/Amazon rules)
│
└── hooks/
    └── use-products.ts               ← TanStack Query hook for products
```

## Data Flow

```
Provider API (or static data)
        ↓
Provider Adapter (e.g. amazon-products.ts)
        ↓
AffiliateProduct (generic interface)
        ↓
product-normalizer.ts
        ↓
GoCouponProduct (UI-ready model)
        ↓
use-products.ts (TanStack Query hook)
        ↓
AffiliateProductGrid / AnimatedDealsCarousel
        ↓
User clicks CTA ("View Deal on Amazon")
        ↓
Merchant product page
```

## Provider Capabilities

| Provider | Search | Details | Links | Promotions | Cashback |
|---|---|---|---|---|---|
| Amazon | ✅ | ✅ | ✅ | ❌ (Phase 1) | ❌ (not planned) |
| Mock | ✅ | ✅ | ✅ | ❌ | ❌ |
| Impact | 🔲 stub | 🔲 stub | 🔲 stub | 🔲 stub | 🔲 stub |
| Awin | 🔲 stub | 🔲 stub | 🔲 stub | 🔲 stub | 🔲 stub |
| CJ | 🔲 stub | 🔲 stub | 🔲 stub | 🔲 stub | 🔲 stub |

## Security Rules

1. `AMAZON_CLIENT_ID` and `AMAZON_CLIENT_SECRET` — **server-side only**. Never in frontend bundle.
2. Only `VITE_`-prefixed variables reach the browser.
3. Partner tags (`gocoupon0e-21`) are public (already in affiliate URLs) — safe as `VITE_` vars.
4. All provider errors are caught — never crash the GoCoupon website.
5. No affiliate links constructed in UI components. Only `product.affiliateUrl` is used.
