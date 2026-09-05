# 🛍️ GoCoupon — Commerce Intelligence & Savings Automation SaaS

<div align="center">

![GoCoupon Banner](public/gc-logo-dark.webp)

**The next-generation multi-store price comparison engine, 90-day price history tracker, and 1-click automated discount coupon applier.**

[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4.2-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TanStack Router](https://img.shields.io/badge/TanStack_Router-v1.168-FF4154?style=flat-square)](https://tanstack.com/router)
[![Pre-rendered Routes](https://img.shields.io/badge/Pre--rendered_Routes-125_Static_Pages-10b981?style=flat-square)](#seo--static-pre-rendering-pipeline)
[![License](https://img.shields.io/badge/License-Proprietary-slate?style=flat-square)](#)

[Live Platform](https://www.gocoupon.io) • [Explore Stores](https://www.gocoupon.io/stores) • [Compare Prices](https://www.gocoupon.io/compare) • [Price Tracker](https://www.gocoupon.io/price-history) • [Chrome Extension](https://www.gocoupon.io/chrome-extension)

</div>

---

## 📖 Executive Summary

**GoCoupon** is a high-performance commerce intelligence and shopping utility SaaS platform. Traditional coupon websites are cluttered with expired promo codes, intrusive ads, misleading countdown timers, and spammy redirects. GoCoupon completely reimagines the digital shopping experience by combining:

1. **Real-Time Cross-Store Price Comparison**: Resolve any product URL or search term to compare prices, delivery estimates, seller ratings, and final net checkout costs across major retailers (Amazon, Flipkart, Myntra, Croma, Meesho, Tata CLiQ, and Reliance Digital).
2. **Interactive 90-Day Price Tracker & Deal Scoring**: Expose artificial "pre-sale" markups by analyzing verified historical price curves against all-time lows and highs.
3. **Automated Voucher Applier (Manifest V3 Chrome Extension)**: A lightweight, privacy-first browser companion that awakens at checkout on 200+ partner stores, parallel-tests candidate coupon codes in under 850 milliseconds, and auto-clips hidden retailer vouchers.
4. **Push Notification Price Alerts**: Real-time browser and mobile lockscreen notifications triggered the instant an item drops to a user-defined target price.
5. **Evidence-Backed Category Dossiers**: Transparent, rubric-based product shortlists (top 1% scoring) that help consumers make informed purchasing decisions based on hard benchmark data rather than sponsored hype.

---

## ⚡ Core Platform Capabilities

### 1. Cross-Store Price Comparison Matrix (`/compare`)
- **Instant Product URL Resolver**: Users can paste a direct product URL from Amazon, Flipkart, or Myntra to extract product metadata, canonical ASIN/identifiers, and instantly fetch cross-merchant listings.
- **Multi-Platform Search Engine**: Searches across India's top online stores simultaneously with unified sorting by Net Effective Cost (Base Price + Shipping - Active Coupons).
- **Side-by-Side Merchant Cards**: Displays seller credibility ratings, return policies, delivery windows, and direct affiliate deep-links.

### 2. Interactive 90-Day Price History Tracker (`/price-history`)
- **Interactive Recharts Visualization**: Fluid SVG price trajectory charts over 30, 60, 90, and 180-day intervals with hover tooltips and reference thresholds.
- **Algorithmic Deal Score (0–100)**: Evaluates whether the current price is genuinely discounted or an inflated "fake sale":
  - **Score ≥ 80 (Green)**: True lowest price window — recommended to buy immediately.
  - **Score 60–79 (Amber)**: Standard pricing within typical fluctuation bounds.
  - **Score < 60 (Red)**: Artificially marked-up price before a sale event.
- **Price Metric Summary**: All-time low, all-time high, 90-day moving average, and price volatility index.

### 3. Price-Drop Watchlist & Web Push Alerts (`/watchlist`)
- **Custom Budget Targets**: Users set precise numerical target prices or quick percentage drops (-5%, -10%, -15%, -20%, -25%).
- **Web Push API Integration**: Dispatches instant browser notifications and mobile phone lockscreen alerts without requiring account registration or personal email.
- **Zero-Spam Client Storage**: Watchlists and alert configurations persist securely in client storage (`localStorage` / IndexedDB).

### 4. Manifest V3 Chrome Extension (`/chrome-extension`, `/extension`)
- **Parallel Code Injection Engine**: Injects and tests dozens of discount vouchers within a client-side sandbox in <850ms, automatically selecting the code delivering the maximum net discount.
- **Hidden Voucher Auto-Clipper**: Detects and automatically clicks on hidden green voucher checkboxes on Amazon India and Flipkart product pages.
- **Dormant Privacy Architecture**: Consumes zero background CPU cycles; stays dormant until the user navigates to a supported store checkout.

### 5. Merchant Directory (`/stores`)
- **200+ Verified Retailers**: Global and regional e-commerce directory featuring Amazon, Walmart, Target, Flipkart, Myntra, Best Buy, Nike, and more.
- **Tactile Category Console**: Filter instantly by General, Fashion, Electronics, Beauty, Food, Travel, and Home.
- **1-Click Coupon Copy**: Instant clipboard copying with feedback toasts and direct merchant redirection.
- **Brand Snap Carousel**: Touch-friendly horizontal snap carousel for quick discovery on mobile devices.

### 6. Evidence-Backed Collections (`/collections`, `/collections/$slug`)
- **Top 1% Shortlists**: Curated buyer guides for headphones, laptops, smartphones, monitors, and lifestyle products.
- **Weighted Evaluation Rubrics**: Transparent breakdown of laboratory metrics (e.g., active noise cancellation attenuation in dB, battery endurance, thermal throttling, and cost-per-feature).
- **Flash Verdict Badges**: Concise takeaway pills indicating best overall, runner-up, and budget winner.

### 7. Global Multi-Currency Support (INR ₹ / USD $)
- **Instant Navbar Currency Switcher**: Seamless toggle between Indian Rupee (`₹`) and US Dollar (`$`).
- **Dynamic Context Provider (`CurrencyContext`)**: Automatically formats prices, discounts, savings deltas, and chart axes across all routes with regional numbering systems (`en-IN` lakhs/crores vs `en-US` thousands/millions).

---

## 🏗️ Architecture & Technology Stack

```
                               ┌───────────────────────────────────────────────┐
                               │             GoCoupon Web Client               │
                               │  (React 19 + TanStack Router + Tailwind v4)   │
                               └───────┬───────────────────────────────┬───────┘
                                       │                               │
                      ┌────────────────┴──────────────┐ ┌──────────────┴────────────────┐
                      ▼                               ▼ ▼                               ▼
           ┌───────────────────────┐       ┌───────────────────────┐       ┌────────────────────────┐
           │   Product & Price     │       │  Automated Coupons    │       │     Push & Alerts      │
           │     Engine (API)      │       │     & Extension       │       │    Service Worker      │
           ├───────────────────────┤       ├───────────────────────┤       ├────────────────────────┤
           │ • Multi-Store Search  │       │ • Chrome Extension M3 │       │ • Web Push API         │
           │ • URL Metadata Parser │       │ • Code Test Sandbox   │       │ • Target Price Watch   │
           │ • 90-Day Histograms   │       │ • Voucher Auto-Clip   │       │ • Browser Notifications│
           └───────────────────────┘       └───────────────────────┘       └────────────────────────┘
```

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19.2.0 | High-concurrency UI rendering, actions, and Suspense |
| **Build & Bundler** | Vite 7.3.6 | Hot Module Replacement (HMR), optimized vendor code-splitting |
| **Language** | TypeScript 5.8.3 | Strict static typing across routes, services, and affiliate contracts |
| **Routing** | TanStack Router v1.168 | Fully type-safe routing, search parameter validation, and preloaders |
| **Data Fetching** | TanStack Query v5.83 | Async cache management, background revalidation, optimistic UI |
| **Styling** | Tailwind CSS v4.2 | PostCSS-free native `@tailwindcss/vite` configuration |
| **UI Primitives** | Radix UI | Accessible headless primitives (Dialog, Popover, Slider, Tabs, etc.) |
| **Data Visualization** | Recharts 2.15.4 | SVG price history curves, Cartesian grids, and reference areas |
| **Icons** | Lucide React | Curated SVG icons strictly adhering to non-"vibe coded" design standards |
| **Toast Notifications** | Sonner 2.0.7 | Accessible, queue-managed interactive toasts |
| **Static Pre-Rendering** | Node.js Custom Runner | 125 static HTML pages pre-rendered during build (`generate-routes.js`) |
| **SEO & Schemas** | JSON-LD Schema | Product, FAQ, BreadcrumbList, WebSite, and Organization schemas |
| **Hosting & Edge** | Vercel & Cloudflare | Edge CDN caching, immutable assets, and serverless API endpoints |

---

## 📁 Project Directory Structure

```
gocoupon-magic/
├── api/                             # Serverless API routes (Vercel Functions)
│   └── affiliates/
│       └── products.ts              # Cross-merchant product search endpoint
├── public/                          # Static assets, manifests, icons & Brand logos
│   ├── Brand logos/                 # High-res merchant logos (Amazon, Flipkart, etc.)
│   ├── gc-logo-dark.webp            # Primary brand mark
│   ├── manifest.json                # PWA & Web Extension manifest
│   ├── robots.txt                   # Search engine crawling directives
│   ├── sitemap.xml                  # Dynamic XML sitemap (63 indexed routes)
│   └── sw.js                        # Service worker for Web Push notifications
├── scripts/                         # Build & automation scripts
│   └── generate-routes.js           # Static pre-rendering pipeline (125 HTML routes)
├── src/                             # Application source code
│   ├── components/                  # Modular UI components
│   │   ├── shopping/                # Commerce widgets (PriceHistory, Comparator, AlertModal)
│   │   ├── site/                    # Site structure (Navbar, Footer, SiteShell, CTA, Features)
│   │   └── ui/                      # Headless Radix UI base components
│   ├── context/                     # Global state providers (CurrencyContext)
│   ├── data/                        # Static datasets (stores, canonical catalog, collections)
│   ├── hooks/                       # Custom React hooks (useCurrency, useWatchlist, etc.)
│   ├── lib/                         # Business logic, services & utilities
│   │   ├── affiliates/              # Multi-network affiliate deep-link abstractions
│   │   ├── services/                # Price history algorithms, URL parsers, notifications
│   │   └── seo.ts                   # SEO metadata & JSON-LD schema builder
│   ├── routes/                      # File-based TanStack Router pages
│   │   ├── __root.tsx               # Root layout & global error boundary
│   │   ├── index.tsx                # Homepage
│   │   ├── compare.tsx              # Multi-store price comparison engine
│   │   ├── price-history.tsx        # 90-day price tracking hub
│   │   ├── stores.tsx               # 200+ Merchant Storeverse directory
│   │   ├── deals.tsx                # Verified live discount deals
│   │   ├── categories.tsx           # Category taxonomy explorer
│   │   ├── chrome-extension.tsx     # Extension landing & installation guide
│   │   ├── watchlist.tsx            # Saved items & price alert monitor
│   │   ├── collections/             # Evidence-backed product shortlists
│   │   └── blog/                    # In-depth shopping guides & research articles
│   ├── main.tsx                     # React client entry point & preload recovery
│   └── styles.css                   # Global styles, typography & color variables
├── package.json                     # Project manifest & dependency configuration
├── tsconfig.json                    # TypeScript compiler options
└── vite.config.ts                   # Vite bundler, route generation & alias setup
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

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to explore the platform.

### 4. Build for Production
```bash
npm run build
```
The build process compiles Vite client assets, chunks vendor libraries, pre-renders all **125 static HTML routes** in `/dist`, and automatically synchronizes `sitemap.xml`.

### 5. Local Production Preview
```bash
npm run preview
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (refer to `.env.example`):

```env
# Platform Base URL
VITE_SITE_URL=https://www.gocoupon.io

# Affiliate Partner Identifiers
VITE_AMAZON_ASSOCIATE_TAG=gocoupon0e-21
VITE_FLIPKART_AFFILIATE_ID=gocoupon_fk

# Web Push Notification Configuration (VAPID Keys)
VITE_VAPID_PUBLIC_KEY=your_public_vapid_key_here

# Search API Proxies (Optional)
VITE_SEARXNG_API_URL=https://search.gocoupon.io
```

---

## 🔍 SEO & Web Interface Standards

- **Static Pre-Rendering (SSG)**: 125 static routes pre-compiled with unique HTML tags, meta titles, descriptions, and Canonical URLs.
- **Rich Structured Data (JSON-LD)**:
  - `Product` & `Offer` schemas with low/high price points.
  - `BreadcrumbList` hierarchy on all sub-routes.
  - `FAQPage` schema on informational and coupon pages.
  - `Organization` and `WebSite` schemas on the root layout.
- **Strict Web Interface Guidelines**:
  - Minimum touch targets of $\ge 44\text{px}$ on mobile viewports.
  - Zero layout shifts (CLS = 0) with explicit image aspect ratios.
  - Mobile bottom navigation clearance (`pb-28`) ensuring UI controls are never obscured.
  - Accessible focus rings (`:focus-visible`) and polite `aria-live` regions for dynamic state updates.
  - Complete elimination of generic "vibe-coded" sparkle icons in favor of clear, contextual iconography.

---

## 📄 License

Copyright © 2026 GoCoupon. All rights reserved. Proprietary software.
