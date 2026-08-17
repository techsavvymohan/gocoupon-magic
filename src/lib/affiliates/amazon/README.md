# Amazon Provider

## Status
**Phase 1 — Static Data (Active)**

The Amazon provider currently serves normalized static product data migrated from the previous hard-coded component arrays. No real API credentials are needed.

## Architecture

```
src/lib/affiliates/amazon/
├── amazon-config.ts      — Reads VITE_ env vars, validates configuration
├── amazon-products.ts    — Product data adapter (Phase 1: static; Phase 2: API)
├── amazon-links.ts       — Affiliate URL builder (ONLY place that constructs Amazon URLs)
├── amazon-utils.ts       — ASIN extraction, price formatting, availability normalization
└── index.ts              — Assembles AffiliateProvider for the registry
```

## Environment Variables

| Variable | Scope | Description |
|---|---|---|
| `VITE_AMAZON_ENABLED` | Browser (safe) | Master Amazon switch |
| `VITE_AMAZON_IN_PARTNER_TAG` | Browser (safe) | India Associates tag |
| `VITE_AMAZON_US_PARTNER_TAG` | Browser (safe) | US Associates tag |
| `VITE_AMAZON_IN_MARKETPLACE` | Browser (safe) | `www.amazon.in` |
| `VITE_AMAZON_US_MARKETPLACE` | Browser (safe) | `www.amazon.com` |
| `AMAZON_CLIENT_ID` | **Server only** | Creators API client ID |
| `AMAZON_CLIENT_SECRET` | **Server only** | Creators API client secret |

## Enabling Amazon (Phase 1)

```env
VITE_AMAZON_ENABLED=true
VITE_AMAZON_IN_PARTNER_TAG=gocoupon0e-21
```

This activates the static product dataset.

## Phase 2 Upgrade (Real Amazon API)

When real credentials are available:

1. Add to Vercel Dashboard (Server scope only):
   ```
   AMAZON_CLIENT_ID=<your_client_id>
   AMAZON_CLIENT_SECRET=<your_client_secret>
   ```

2. Update `amazon-products.ts` to call the serverless function:
   ```ts
   const response = await fetch(`/api/affiliates/products?provider=amazon&country=${country}&keyword=${keyword}`);
   const data = await response.json();
   return data.products; // Already normalized AffiliateProduct[]
   ```

3. Implement the real API call in `api/affiliates/products.ts`.

The frontend (hooks, components, normalizer, routes) requires **zero changes**.

## Compliance

- No automatic redirects to Amazon — user must click "View Deal on Amazon"
- No cashback for Amazon clicks
- No Amazon page scraping
- No Amazon customer/order data collected
- Affiliate disclosure shown per Amazon Associates program requirements
- Partner tag isolated to `amazon-links.ts` only
- No price history tracking from Amazon data
