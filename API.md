# GoCoupon API Reference Specification

Base URL: `http://localhost:3000/api` (Local) / `https://gocoupon.io/api` (Production)

---

## Overview

The GoCoupon API is a high-performance RESTful API powering the GoCoupon web application, browser extension, and price intelligence engine. It features in-memory caching, dual-engine PostgreSQL persistence, OWASP security protections, and sliding-window rate limiting.

### Standard Response Headers
* `Content-Type: application/json; charset=utf-8`
* `Cache-Control: public, max-age=60, s-maxage=120` (on cached read endpoints)
* `X-Cache: HIT | MISS` (on comparison and search queries)
* `Retry-After: <seconds>` (returned on HTTP 429 rate limit breaches)

---

## 1. System & Health Endpoints

### `GET /api/health`
Returns the operational health, process uptime, and memory usage of the persistent VPS engine.

**Response:**
```json
{
  "status": "healthy",
  "service": "GoCoupon VPS Engine",
  "architecture": "Persistent Node.js + Express Server",
  "serverless": false,
  "uptimeSeconds": 86400,
  "timestamp": "2026-09-14T12:00:00.000Z",
  "memoryUsageMb": 115
}
```

---

## 2. Deals & Coupons API

### `GET /api/deals`
Retrieves live, verified, non-expired offers from the 24/7 sync engine.

**Query Parameters:**
| Parameter | Type | Default | Description |
|---|---|---|---|
| `category` | string | `""` | Filter by category (e.g. `Electronics`, `Fashion`, `Food`) |
| `store` | string | `""` | Filter by merchant store name or slug |
| `q` | string | `""` | Search query matching title, store name, or coupon code |
| `badge` | string | `""` | Filter by badge (`Verified`, `Trending`, `Exclusive`, `Bank Offer`) |
| `sortBy` | string | `trending` | Sorting field (`trending`, `discount`, `verified`, `store`) |
| `order` | string | `desc` | Sort order (`asc`, `desc`) |
| `limit` | number | `0` | Max results to return (`0` for all available) |
| `offset` | number | `0` | Pagination start index |

**Rate Limit:** 120 requests / minute per IP.

### `GET /api/deals/popular-brands`
Returns aggregated top merchant brands with live coupon counts and store logo URLs.

### `GET /api/deals/categories`
Returns aggregated catalog categories with active offer counts.

### `POST /api/deals/submit`
Allows visitors to submit a new coupon or promotional deal for verification.

**Request Body:**
```json
{
  "storeName": "Nike India",
  "code": "NIKE30",
  "discount": "30% OFF",
  "category": "Fashion",
  "terms": "Valid on footwear orders over ₹4,999",
  "email": "shopper@example.com"
}
```

**Response (HTTP 201):**
```json
{
  "success": true,
  "message": "Coupon submitted successfully and queued for verification.",
  "deal": { "id": "sub_1789371521924", "status": "pending" }
}
```

### `POST /api/deals/sync`
Triggers an immediate on-demand synchronization cycle with Cuelinks API v3. *(Protected in production)*

---

## 3. Merchant Stores API

### `GET /api/stores`
Retrieves the complete catalog of 250+ merchant partner profiles.

**Response:**
```json
{
  "success": true,
  "total": 28,
  "cached": true,
  "stores": [
    {
      "id": "str-amazon",
      "name": "Amazon",
      "slug": "amazon",
      "logo": "/stores/amazon.png",
      "cashbackRate": "Up to 8.5%",
      "rating": 4.9,
      "couponsCount": 42
    }
  ]
}
```

---

## 4. Multi-Store Price Comparison & Shopping API

### `GET /api/compare`
Queries multiple merchant stores concurrently, eliminates price outliers, and calculates 4-tier stacked savings.

**Query Parameters:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `q` | string | Optional | Product search keyword (e.g. `Sony WH-1000XM5`) |
| `url` | string | Optional | Pasted merchant product link (Amazon, Flipkart, Myntra) |
| `productId` | string | Optional | Canonical catalog product ID |

**Rate Limit:** 40 requests / minute per IP.

**Response:**
```json
{
  "query": "Sony WH-1000XM5",
  "storesComparedCount": 11,
  "bestDeal": {
    "storeName": "Amazon India",
    "effectiveNetPrice": 25141,
    "savingsVsOriginal": 4849
  },
  "maxSavings": 4849,
  "dealHonesty": {
    "isHonest": true,
    "confidenceScore": 96,
    "notes": "Verified genuine seasonal discount without artificial pre-sale price spike."
  },
  "rows": [
    {
      "storeName": "Amazon India",
      "itemPrice": 29990,
      "bestCouponCode": "AMZAUDIO15",
      "couponSavings": 1500,
      "effectiveNetPrice": 25141,
      "isBestDeal": true
    }
  ]
}
```

### `GET /api/shopping`
Direct metasearch endpoint querying the local SearXNG aggregator daemon on port 8888.

---

## 5. Product URL & ASIN Resolver

### `GET /api/resolve`
Extracts live product metadata, image, price, and competitor offerings from any pasted merchant URL or ASIN.

**Security:** Strict SSRF defenses block private IP ranges, loopback endpoints, and cloud instance metadata addresses.

**Query Parameters:**
* `url`: Merchant product page URL.
* `asin`: Amazon ASIN identifier (e.g. `B09XS7JWHH`).

**Rate Limit:** 60 requests / minute per IP.

---

## 6. Editorial CMS (Blogs) API

### `GET /api/blogs`
Retrieves all published shopping comparison guides and consumer advocacy articles.

### `GET /api/blogs/:slug`
Retrieves a specific article by unique slug and atomically increments the view count.

---

## 7. Price Drop Alerts API

### `POST /api/alerts/register`
Subscribes a user email or Web Push subscription to be notified when a product drops to a target price.

**Request Body:**
```json
{
  "email": "user@example.com",
  "productId": "prod_macbook_m2",
  "productTitle": "Apple MacBook Air M2",
  "targetPrice": 85000,
  "initialPrice": 99900,
  "store": "Amazon"
}
```

---

## 8. Chrome Extension Selectors API

### `GET /api/extension/selectors.json`
Returns the active checkout DOM input and button selectors for supported stores. Enables instant updates to checkout selector logic without requiring browser store re-review.

---

## 9. Contact & Support API

### `POST /api/contact`
Submits a user inquiry or partnership proposal and triggers an SMTP delivery to the admin inbox.

**Rate Limit:** 5 requests / 10 minutes per IP.

---

## 10. Admin Control Panel API (Protected)

All `/api/admin/*` endpoints require authentication via Bearer Token:
`Authorization: Bearer <HMAC-SHA256 Token>`

### `POST /api/admin/login`
Authenticates an administrator and issues a cryptographically signed HMAC-SHA256 session token.

**Rate Limit:** 5 attempts / 5 minutes per IP.

### `GET /api/admin/database`
Returns live PostgreSQL connection diagnostics, query roundtrip latency, and row counts across all 6 core tables.

### `GET /api/admin/submissions`
Returns the moderation queue of community coupon submissions.

### `POST /api/admin/submissions/:id/approve`
Approves a community coupon and immediately injects it into the live deals pool.
