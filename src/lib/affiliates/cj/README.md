# CJ (Commission Junction) Provider — Not Yet Implemented

## Status
**Stub — Pending Implementation**

## To Implement

### Step 1 — Create:
```
src/lib/affiliates/cj/
├── cj-config.ts
├── cj-client.ts
├── cj-products.ts
├── cj-links.ts
└── index.ts
```

### Step 2 — Implement `AffiliateProvider`. Register in `src/lib/affiliates/index.ts`.

### Step 3 — Add env vars:
```env
VITE_CJ_ENABLED=true
VITE_CJ_WEBSITE_ID=
# Server-side only:
CJ_API_KEY=
```

## CJ API Reference
- https://developers.cj.com/
