# Amazon Integration Guide

## Current Status

**Phase 1 — Static Data**

The Amazon provider is operational with normalized static product data. Real API credentials are not required yet.

## Environment Variables

### Browser-safe (VITE_ prefix)

Add to `.env.local` for development, or Vercel Dashboard → Environment Variables (All environments):

```env
VITE_AMAZON_ENABLED=false         # Set to true when ready
VITE_AMAZON_IN_PARTNER_TAG=gocoupon0e-21
VITE_AMAZON_US_PARTNER_TAG=
VITE_AMAZON_IN_MARKETPLACE=www.amazon.in
VITE_AMAZON_US_MARKETPLACE=www.amazon.com
```

### Server-side only (NO VITE_ prefix)

Add to Vercel Dashboard → Environment Variables → with **Server** scope only:

```
AMAZON_CLIENT_ID=<your_client_id>
AMAZON_CLIENT_SECRET=<your_client_secret>
```

⚠️ **These must never get a VITE_ prefix. They must never reach the browser.**

## Enabling Amazon (Phase 1 — Static Data)

```env
VITE_AMAZON_ENABLED=true
VITE_AMAZON_IN_PARTNER_TAG=gocoupon0e-21
VITE_MOCK_PROVIDER_ENABLED=false
```

Restart the dev server. The static product dataset will be served through the full affiliate layer.

## Enabling Amazon (Phase 2 — Real API)

1. Obtain Amazon Creators API credentials from Amazon Associates dashboard.
2. Add server-side credentials to Vercel Dashboard (Server scope, never Client).
3. Implement real API call in `api/affiliates/products.ts` (see the Phase 2 comment block).
4. Update `amazon-products.ts` to call the serverless function instead of returning static data.
5. Set `VITE_AMAZON_ENABLED=true`.

**Zero frontend changes required.** The hooks, components, normalizer, and routes all stay the same.

## Testing Without Credentials

```env
VITE_AFFILIATE_SYSTEM_ENABLED=true
VITE_MOCK_PROVIDER_ENABLED=true
VITE_AMAZON_ENABLED=false
```

The full product UI (carousel, grid, CTA, analytics, disclosure) is testable with mock data.

## API Architecture (Phase 2)

```
Browser
  ↓
useProducts hook (TanStack Query)
  ↓
product-service.ts
  ↓
affiliate-service.ts
  ↓
Amazon provider (amazon/index.ts)
  ↓
amazon-products.ts → fetch("/api/affiliates/products?provider=amazon")
  ↓
Vercel Serverless Function (api/affiliates/products.ts)
  ↓  (server-side — uses AMAZON_CLIENT_ID + AMAZON_CLIENT_SECRET)
Amazon Creators API
  ↓
Normalized AffiliateProduct[]
  ↓
product-normalizer.ts
  ↓
GoCouponProduct[]
  ↓
AffiliateProductGrid / AnimatedDealsCarousel
```

## Caching

- TanStack Query: 5-minute stale time, 30-minute GC time
- Phase 2: The serverless function should add server-side caching (e.g. Vercel Edge Cache or KV)
- Product data: Design for periodic refresh, not permanent storage of Amazon product content

## Affiliate Link Flow

```
User sees GoCoupon product page
        ↓
Clicks "View Deal on Amazon" (explicit user action required)
        ↓
product.affiliateUrl (pre-tagged with gocoupon0e-21 partner tag)
        ↓
Amazon product page
```

**No automatic redirects.** The user must always see GoCoupon's content first.

## Compliance Checklist

| Rule | Implementation |
|---|---|
| No automatic redirects | ✅ Explicit user click required on "View Deal on Amazon" |
| No cashback for Amazon | ✅ Amazon cashback=false in capabilities |
| No page scraping | ✅ Only API data used |
| No credentials in browser | ✅ AMAZON_CLIENT_ID/SECRET are server-only |
| No permanent cache of product content | ✅ TanStack Query TTL + Phase 2 refresh mechanism |
| No Amazon customer data | ✅ Analytics tracks only GoCoupon events |
| Affiliate disclosure | ✅ AffiliateDisclosure component on amazon-coupons page |
| rel="noopener noreferrer sponsored" | ✅ Set in product-cta.ts CTAConfig |
| Partner tag isolated | ✅ Only in amazon-config.ts and amazon-links.ts |
| No price history tracking | ✅ Not implemented |
| No coupon scraping | ✅ Not implemented |
