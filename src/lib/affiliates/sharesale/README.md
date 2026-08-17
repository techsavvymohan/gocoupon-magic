# ShareASale Provider — Not Yet Implemented

## Status
**Stub — Pending Implementation**

## To Implement

### Step 1 — Create:
```
src/lib/affiliates/sharesale/
├── sharesale-config.ts
├── sharesale-client.ts
├── sharesale-products.ts
├── sharesale-links.ts
└── index.ts
```

### Step 2 — Implement `AffiliateProvider`. Register in `src/lib/affiliates/index.ts`.

### Step 3 — Add env vars:
```env
VITE_SHARESALE_ENABLED=true
VITE_SHARESALE_AFFILIATE_ID=
# Server-side only:
SHARESALE_API_TOKEN=
SHARESALE_API_SECRET=
```

## ShareASale API Reference
- https://www.shareasale.com/w.cfm?b=145
