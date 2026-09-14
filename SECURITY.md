# GoCoupon Security Policy & Threat Mitigation Architecture

GoCoupon is built to meet enterprise-grade security standards. This document outlines our threat modeling, vulnerability disclosure policies, and technical defenses against common web attacks.

---

## 1. Vulnerability Reporting (RFC 9116)

We welcome responsible disclosure of security vulnerabilities. If you discover a vulnerability, please report it immediately:

* **Security Email:** `security@gocoupon.io`
* **Advisory Contact:** `support@gocoupon.io`
* **Policy Location:** `https://gocoupon.io/.well-known/security.txt`
* **Response Window:** Acknowledgement within 24 hours; patch deployed within 72 hours for critical issues.

Please provide:
1. Steps to reproduce the issue (proof of concept).
2. Affected routes, components, or parameters.
3. Impact assessment.

---

## 2. Server-Side Request Forgery (SSRF) Defense

Because GoCoupon accepts merchant product URLs for price scraping, strict SSRF defenses are implemented in `src/lib/services/url-metadata-extractor.ts`:

Every incoming URL passes through `isSafePublicUrl(rawUrl)` before any network connection is opened:

1. **Protocol Restrictions:** Only `http:` and `https:` protocols are accepted. `file:`, `ftp:`, `gopher:`, or data URIs are rejected.
2. **Port Restrictions:** Only standard web ports (`80` and `443`) are permitted. Internal services on non-standard ports (e.g. `6379`, `5432`, `27017`) are blocked.
3. **Loopback & Local Hostname Blocking:** Rejects `localhost`, `127.0.0.1`, `0.0.0.0`, `::1`, `*.localhost`, `*.local`, `*.internal`, and `*.lan`.
4. **Cloud Metadata IP Blocking:** Rejects AWS, GCP, Azure, and DigitalOcean metadata endpoints (`169.254.169.254` and `metadata.google.internal`).
5. **Private IP Subnet Blocking:** Validates against RFC 1918 and RFC 6598 private ranges:
   - `10.0.0.0/8`
   - `172.16.0.0/12`
   - `192.168.0.0/16`
   - `100.64.0.0/10` (Carrier-Grade NAT)

---

## 3. Path Traversal Mitigation

To prevent unauthorized access to local files via `../` sequences:
- A global middleware in `server/server.ts` executes before route handling.
- It performs **double URL decoding** to detect nested encoding techniques (e.g. `%252e%252e` or `%2e%2e`).
- If any traversal pattern is detected, the request is terminated with HTTP 400 Bad Request.

---

## 4. Cryptographic Authentication & Timing Attack Defense

Admin session tokens use HMAC-SHA256 signatures:
- Tokens are formatted as `<base64urlPayload>.<hmacSignature>`.
- Token comparison uses `crypto.timingSafeEqual()` rather than standard string equality (`===`).
- This prevents side-channel timing attacks that attempt to deduce valid signatures byte-by-byte based on microsecond differences in comparison duration.

---

## 5. Anti-Abuse & Rate Limiting

To prevent brute force, scraper abuse, and denial-of-service, sliding-window rate limiters are active on critical routes:

| Route | Limit | Window | Action on Breach |
|---|---|---|---|
| `POST /api/admin/login` | 5 attempts | 5 minutes | HTTP 429 with `Retry-After` |
| `POST /api/contact` | 5 submissions | 10 minutes | HTTP 429 with `Retry-After` |
| `GET /api/compare` | 40 queries | 1 minute | HTTP 429 with `Retry-After` |
| `GET /api/resolve` | 60 queries | 1 minute | HTTP 429 with `Retry-After` |
| `GET /api/deals` | 120 queries | 1 minute | HTTP 429 with `Retry-After` |

---

## 6. HTTP Transport Security & Headers

The Express server and Caddy reverse proxy inject strict HTTP security headers on all responses:

* **Strict-Transport-Security (HSTS):** `max-age=31536000; includeSubDomains; preload` (enforces HTTPS for 1 year).
* **X-Frame-Options:** `DENY` (prevents clickjacking attacks).
* **X-Content-Type-Options:** `nosniff` (prevents MIME-type confusion).
* **Referrer-Policy:** `strict-origin-when-cross-origin` (protects user privacy).
* **Content-Security-Policy (CSP):** Granular whitelist for fonts, scripts, API endpoints, and images.
