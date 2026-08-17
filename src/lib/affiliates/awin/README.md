# Awin Provider — Not Yet Implemented

## Status
**Stub — Pending Implementation**

This directory is a placeholder for the Awin affiliate network integration.

## To Implement

### Step 1 — Create these files:
```
src/lib/affiliates/awin/
├── awin-config.ts        — Read VITE_AWIN_* env vars
├── awin-client.ts        — Awin API communication (server-side)
├── awin-products.ts      — searchAwinProducts(), getAwinProduct()
├── awin-links.ts         — Awin deeplink / affiliate URL builder
└── index.ts              — Export awinProvider: AffiliateProvider
```

### Step 2 — Implement `AffiliateProvider` in `index.ts`.

### Step 3 — Register in `src/lib/affiliates/index.ts`:
```ts
import { awinProvider } from "./awin/index";
if (AWIN_ENABLED) affiliateRegistry.set("awin", awinProvider);
```

### Step 4 — Add environment variables to `.env.example`:
```env
VITE_AWIN_ENABLED=true
VITE_AWIN_PUBLISHER_ID=
# Server-side only:
AWIN_API_KEY=
```

### Step 5 — Set `VITE_AWIN_ENABLED=true`.

The existing UI requires **no changes**.

## Awin API Reference
- https://wiki.awin.com/index.php/API
