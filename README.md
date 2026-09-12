# 🛍️ GoCoupon — Commerce Intelligence & Savings Automation SaaS

<div align="center">

![GoCoupon Banner](public/gc-logo-dark.webp)

**The unified commerce intelligence platform: Multi-store cross-comparison across 200+ retailers, 90-day price history tracking, 1-click verified coupon auto-applying, and card-linked bank discount arbitrage.**

[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4.2-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TanStack Router](https://img.shields.io/badge/TanStack_Router-v1.168-FF4154?style=flat-square)](https://tanstack.com/router)
[![Pre-rendered Routes](https://img.shields.io/badge/Pre--rendered_Routes-145_Static_Pages-10b981?style=flat-square)](#seo--static-pre-rendering-pipeline)
[![Affiliate Engines](https://img.shields.io/badge/Affiliate_APIs-Cuelinks_v3_+_Admitad_Global-rose?style=flat-square)](#-dual-engine-affiliate-architecture)
[![License](https://img.shields.io/badge/License-Proprietary-slate?style=flat-square)](#)

[Live Platform](https://www.gocoupon.io) • [Exclusive Offers](https://www.gocoupon.io/offers) • [Explore Stores](https://www.gocoupon.io/stores) • [Compare Prices](https://www.gocoupon.io/compare) • [Chrome Extension](https://www.gocoupon.io/chrome-extension) • [Blog Guides](https://www.gocoupon.io/blog)

</div>

---

## 📖 Executive Summary & Category Monopoly

For over a decade, consumer shopping tools have been fractured into weak, single-feature point solutions:
- **Honey / Coupert** only scrape coupons, blind to base store pricing and bank offers.
- **Google Shopping** operates as an ad auction, selling ranking to the highest bidder.
- **Retail Banks** (Chase, Amex, HDFC, SBI) hide partner offers inside isolated app portals.

Shoppers were forced to juggle multiple tools, 10 open browser tabs, and manual calculator math just to buy a single laptop, clothing item, or gadget.

**GoCoupon completely renders this fragmented ecosystem obsolete.** We unify the entire consumer commerce intelligence stack into **ONE sovereign, lightning-fast platform and browser extension**. In under 1 second, shoppers get the mathematical truth before hitting "Place Order."

---

## 🌐 Dual-Engine Affiliate Architecture (India + Global)

GoCoupon operates a sovereign, high-concurrency deal ingestion pipeline bridging domestic Indian retail and international global e-commerce:

```
                               ┌──────────────────────────────────────────────┐
                               │             GoCoupon Web Engine              │
                               └──────────────────────┬───────────────────────┘
                                                      │
                       ┌──────────────────────────────┴──────────────────────────────┐
                       ▼                                                             ▼
         ┌───────────────────────────┐                                 ┌───────────────────────────┐
         │     🇮🇳 Cuelinks API v3    │                                 │   🌍 Admitad Global API   │
         ├───────────────────────────┤                                 ├───────────────────────────┤
         │ • Amazon, Flipkart, Myntra│                                 │ • AliExpress, Booking.com │
         │ • Swiggy, Ajio, Nykaa     │                                 │ • Samsung, Lenovo, Shein  │
         │ • Real-time dynamic sync  │                                 │ • 1,200+ Global Campaigns │
         │ • End-date expiry pruning │                                 │ • 7-day OAuth2 token cache│
         └─────────────┬─────────────┘                                 └─────────────┬─────────────┘
                       │                                                             │
                       └──────────────────────────────┬──────────────────────────────┘
                                                      ▼
                                   ┌────────────────────────────────────┐
                                   │  /offers Unified Region Switcher   │
                                   │   [ All ]   [ India ]   [ Global ] │
                                   └────────────────────────────────────┘
```

### 1. 🇮🇳 Domestic Indian Engine (Cuelinks API v3)
- **Live Deal Sync**: Automated ingestion from top Indian e-commerce networks (Flipkart, Amazon India, Myntra, Ajio, Swiggy, Zomato, Tata 1mg, Croma).
- **Auto-Pruning Engine**: Dynamic expiration checking drops dead coupons in real time.
- **On-Demand Re-Sync**: Dedicated webhook and frontend trigger for instant live deal refreshes.

### 2. 🌍 Global International Engine (Admitad / Mitgo Global API)
- **Modular Micro-Client**: Dedicated service in `server/services/providers/admitad-client.ts` with zero cross-coupling.
- **Automated OAuth2 Lifecycle**: Automated 7-day token caching, automatic re-authentication, and bearer token rotation.
- **High-Margin Global Brands**: Live coupons and curated high-ticket campaigns across AliExpress, Booking.com, Samsung Global, Lenovo, Adobe, Shein, Hostinger, Trip.com, Banggood, and DHgate.
- **Dynamic Market Filtering**: Interactive region toggle pills on `/offers` (`All`, `🇮🇳 India`, `🌍 Global`) let shoppers filter instantly.

---

## ⚡ The Core Unified Commerce Architecture

### 1. Cross-Store Price Comparison Matrix (`/compare`)
- **200+ Enterprise Retailers**: Real-time cross-merchant price tracking across Amazon (US/UK/EU/IN), Walmart, Best Buy, Target, Flipkart, Croma, Reliance Digital, and specialized DTC brands.
- **Instant Product URL Resolver**: Paste any product link from Amazon, Flipkart, or Walmart to extract canonical identifiers and instantly surface competitor pricing.
- **Unbiased Ranking**: 100% store-agnostic with zero sponsored ad bias. The store with the authentic lowest delivered price always occupies the #1 spot.

### 2. Bank Card & Financing Arbitrage Engine
- **Exclusive Bank Tie-Up Discovery**: Retailers keep competitor card partnerships secret (e.g. Amazon won't tell you Flipkart has ₹5,000 off with HDFC, or Best Buy has $120 off with Chase).
- **Official Vector SVG Brand Registry**: Authentic vector logos for **Chase, American Express (Amex), Capital One, Citi, Affirm, HDFC Bank, SBI Card, ICICI Bank, Axis Bank, Kotak Mahindra, and IndusInd Bank**.
- **Universal Pricing + Optional Booster**: Guarantees the lowest store base price for all shoppers (cash, UPI, debit, standard checkout) while stacking extra instant discounts for cardholders.

### 3. Dual-Market Verified Offers & Auto-Pruning Engine (`/offers`)
- **Combined Ingestion Rails**: Unifies domestic Cuelinks deals with Admitad international campaigns.
- **Expiry Protection**: Dynamically eliminates expired promo codes so visitors only see working offers.
- **1-Click Redeem & Auto-Redirect**: Automatically copies codes to clipboard and opens the merchant store.

### 4. 1-Click Working Coupon Auto-Applier (`/chrome-extension`)
- **Autonomous DOM Injection**: Parallel-tests candidate promo codes in under 850 milliseconds directly within the checkout sandbox.
- **Hidden Voucher Auto-Clipper**: Detects and automatically activates hidden on-page voucher checkboxes on Amazon and Flipkart product pages.
- **Zero Dead-Code Spam**: Replaces expired crowd-sourced codes with mathematical savings.

### 5. "Ask GoCoupon" Grounded AI Commerce Assistant (`/`)
- **Deterministic Tool Calling**: Integrates internal catalog retrieval, multi-store pricing feeds, and live Google Shopping data via SerpAPI.
- **Grounded Verification**: Synthesizes verified purchasing advice with citations, limitation disclaimers, and zero hallucinations.

---

## 💰 Consumer Economics: Direct Shopping vs. GoCoupon

When shopping directly on single retail platforms, consumers routinely pay the full monopoly markup. GoCoupon eliminates this hidden tax across every major category:

| Product / Category | Direct Store Checkout (Without GoCoupon) | GoCoupon Optimized Path (Store + Card Arbitrage) | Net Paid with GoCoupon | Real Money Saved |
| :--- | :--- | :--- | :--- | :--- |
| **Apple iPhone 16 (128GB)** | ₹79,900 ($829) on Amazon | Flipkart / Best Buy + HDFC / Chase Flat Bank Discount | **₹74,900 ($769)** | **₹5,000 ($60.00)** |
| **MacBook Air 13" M3 (256GB)** | ₹1,04,900 ($1,099) on Amazon | Croma / B&H + SBI / Amex Instant Promotion | **₹95,900 ($979)** | **₹9,000 ($120.00)** |
| **Sony WH-1000XM5 ANC** | ₹29,990 ($398) on Amazon | Reliance / Target + ICICI / Capital One 10% Discount | **₹25,490 ($338)** | **₹4,500 ($60.00)** |
| **Samsung 55" QLED 4K TV** | ₹64,990 ($749) on Flipkart | Amazon / Walmart + Axis / Affirm 0% APR Promo | **₹56,490 ($649)** | **₹8,500 ($100.00)** |
| **Nike Air Force 1 '07** | ₹8,945 ($125) on Nike.com | Myntra / Nordstrom Rack + Auto-Applied 15% VIP Code | **₹6,371 ($83)** | **₹2,574 ($42.00)** |
| **Skincare Essentials Bundle** | ₹3,450 ($68) on Nykaa | Official Brand Store + 20% Voucher + Wallet Cashback | **₹2,460 ($49)** | **₹990 ($19.00)** |

### Annual Household Impact
An active household spending **₹3,97,000 ($4,750)** annually across gadgets, home goods, apparel, and lifestyle saves an estimated **₹50,100 ($655.00)** per year in 1 second per purchase.

---

## 🔒 Privacy-by-Design Architecture

- **Zero Financial Data Ingestion**: GoCoupon never asks for, reads, or stores credit card numbers, CVVs, passwords, or personal banking credentials.
- **Client-Side Calculation**: Card discount rules match public merchant promotion tables inside the local browser sandbox.
- **Direct Merchant Checkout**: Purchases execute directly on the authorized retailer's encrypted page with full manufacturer warranties.

---

## 🏗️ Technology Stack

| Layer | Technology | Version & Details |
| :--- | :--- | :--- |
| **Frontend Framework** | React | `19.2.0` — High-concurrency UI rendering, actions & Suspense |
| **Build Tool & Bundler** | Vite | `7.3.6` — Optimized vendor code-splitting & HMR |
| **Language** | TypeScript | `5.8.3` — Strict static typing across routes, services & affiliate contracts |
| **Routing** | TanStack Router | `1.168` — Fully type-safe routing, preloaders & search param validation |
| **Data Fetching** | TanStack Query | `5.83` — Async cache management, background revalidation |
| **Styling** | Tailwind CSS | `v4.2` — Native `@tailwindcss/vite` configuration |
| **UI Primitives** | Radix UI | Accessible headless primitives (Dialog, Popover, Slider, Tabs) |
| **Data Visualization** | Recharts | `2.15.4` — SVG price history curves, Cartesian grids & reference areas |
| **Backend API Engine** | Express.js / Node.js | Modular REST services, rate-limiting, and affiliate proxies |
| **Static Pre-Rendering** | Node.js Custom Runner | **145 static HTML pages** pre-rendered during build (`generate-routes.js`) |
| **XML Sitemap** | Dynamic Generator | **73 indexed URLs** synchronized automatically during build |
| **SEO & Schemas** | JSON-LD Schema | Product, Offer, ItemList, FAQPage, BreadcrumbList, WebSite, and Organization |

---

## 📁 Project Directory Structure

```
gocoupon-magic/
├── server/                          # Sovereign Express backend & API proxies
│   ├── routes/                      # Modular backend API endpoints
│   │   ├── deals.ts                 # Cuelinks live deals proxy & sync
│   │   ├── international-deals.ts   # Admitad live international deals router
│   │   ├── search.ts                # Cross-store instant search
│   │   └── stores.ts                # Verified merchant directory API
│   └── services/providers/          # External Affiliate Provider Clients
│       ├── cuelinks-client.ts       # Cuelinks API v3 integration
│       └── admitad-client.ts        # Admitad OAuth2 client & deal normalizer
├── public/                          # Static assets, manifests, icons & Brand logos
│   ├── Brand logos/                 # High-resolution merchant logos
│   ├── manifest.json                # PWA & Web Extension manifest
│   ├── robots.txt                   # Search engine crawling directives
│   ├── sitemap.xml                  # Dynamic XML sitemap (73 indexed routes)
│   └── sw.js                        # Service worker for Web Push notifications
├── scripts/                         # Build & automation scripts
│   ├── generate-routes.js           # Static pre-rendering pipeline (145 HTML routes)
│   ├── test-cuelinks.ts             # Cuelinks API validation CLI
│   └── test-admitad.ts              # Admitad OAuth2 & campaigns validation CLI
├── src/                             # Application frontend source code
│   ├── components/                  # Modular UI components
│   │   ├── common/                  # StoreLogo, RedeemCouponButton
│   │   ├── icons/                   # Pixel-perfect SVG bank brand logos
│   │   ├── shopping/                # Commerce widgets (PriceHistory, BankCardSelector)
│   │   └── site/                    # SiteShell, Hero, HowItWorks, Features
│   ├── context/                     # Global state (CurrencyContext, UserCardsContext)
│   ├── hooks/                       # Custom hooks (useDeals, useInternationalDeals)
│   ├── lib/api/                     # Typed client APIs (deals-api, international-deals-api)
│   ├── routes/                      # File-based TanStack Router pages
│   │   ├── index.tsx                # Grounded Homepage & AI search
│   │   ├── offers.tsx               # Verified Offers Hub (India + Global tabs)
│   │   ├── compare.tsx              # Multi-store price comparison engine
│   │   ├── stores.tsx               # 200+ Merchant Storeverse directory
│   │   └── blog/                    # In-depth shopping guides & research articles
│   ├── main.tsx                     # React client entry point
│   └── styles.css                   # Global styles & theme variables
├── package.json                     # Project manifest & scripts
├── tsconfig.json                    # TypeScript compiler options
└── vite.config.ts                   # Vite bundler & alias setup
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm** or **bun**: Modern package manager

### 1. Clone the Repository
```bash
git clone https://github.com/techsavvymohan/gocoupon-magic.git
cd gocoupon-magic
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Verify Affiliate Network Credentials
Run the automated diagnostic scripts to verify connectivity with partner APIs:
```bash
# Test Cuelinks API v3 connectivity
npm run test:cuelinks

# Test Admitad OAuth2 & global coupon feed
npm run test:admitad
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production & Pre-Render Static Routes
```bash
npm run build
```
This command compiles the Vite client bundle, pre-renders **145 static HTML routes** in `/dist`, and updates `sitemap.xml` with all 73 indexed URLs.

### 6. Local Production Preview
```bash
npm run preview
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (refer to `.env.example`):

```env
# Platform Base URL
VITE_SITE_URL=https://www.gocoupon.io

# 🇮🇳 Cuelinks API v3 (India Affiliate Deals)
CUELINKS_API_KEY=your_cuelinks_api_key_here
CUELINKS_CHANNEL_ID=your_cuelinks_channel_id_here

# 🌍 Admitad / Mitgo Global API (International Affiliate Deals)
ADMITAD_CLIENT_ID=your_admitad_client_id_here
ADMITAD_CLIENT_SECRET=your_admitad_client_secret_here
ADMITAD_BASE64_HEADER=your_base64_encoded_auth_header_here

# Optional SerpAPI Live Proxy
SERPAPI_API_KEY=your_serpapi_key_here
```

---

## 🔍 SEO & Web Interface Standards

- **Static Pre-Rendering (SSG)**: 145 pre-rendered static routes for instant First Contentful Paint (FCP) and zero-latency indexing.
- **Rich Structured Data (JSON-LD)**: Complete schema coverage including `Product`, `Offer`, `ItemList`, `FAQPage`, `BreadcrumbList`, `WebSite`, and `Organization`.
- **Strict Web Interface Guidelines**:
  - Minimum touch targets of $\ge 44\text{px}$ across mobile viewports.
  - Zero layout shifts (CLS = 0) with explicit image aspect ratios.
  - Accessible focus rings (`:focus-visible`) and polite `aria-live` regions for dynamic deal state updates.

---

## 📄 License

Copyright © 2026 GoCoupon. All rights reserved. Proprietary software.
