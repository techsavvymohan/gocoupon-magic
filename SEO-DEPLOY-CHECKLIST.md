# SEO deploy checklist — gocoupon.io

Everything below is **outside the codebase** (DNS / registrar / Search Console / Vercel dashboard). The code changes have already been made, but these are required to land the full audit fix.

Work top-down — each section is independent.

---

## 1. Domain (required if you haven't already)

Confirm `gocoupon.io` points to the current deployment. Add a 308 redirect from `gocoupon.com` → `gocoupon.io` so you don't split link equity.

If deploying on Vercel, the redirect is a one-click config:

1. Open your Vercel project → Settings → Domains.
2. Add `gocoupon.io` and mark it as **primary**.
3. Add `gocoupon.com` as a secondary domain and enable **Redirect to primary** (308 permanent).

---

## 2. Google Analytics 4

The `index.html` currently ships a placeholder GA4 ID of `G-XXXXXXXXXX`.

1. Create a GA4 property at <https://analytics.google.com> → Admin → Create property.
2. Add a Web data stream for `https://gocoupon.io`.
3. Copy the **Measurement ID** (format `G-XXXXXXXXXX`).
4. Replace both occurrences of `G-XXXXXXXXXX` in `index.html`.

---

## 3. Google Search Console

The `index.html` ships a placeholder verification token `VERIFY_TOKEN_HERE`.

1. Go to <https://search.google.com/search-console> and add property `https://gocoupon.io/`.
2. Choose **HTML tag** verification. Copy the `content` value from the `<meta name="google-site-verification" …>` tag.
3. Replace `VERIFY_TOKEN_HERE` in `index.html` with that value.
4. Click **Verify** in Search Console. After verifying, submit `https://gocoupon.io/sitemap.xml`.

Bonus: Verify the same property in **Bing Webmaster Tools** and submit the same sitemap there.

---

## 4. Open Graph image (1200×630)

`index.html` and `src/lib/seo.ts` both reference `/og-image.png`. You need to add that file.

1. Create a 1200 × 630 PNG with brand + tagline (e.g. "goCoupon — auto-apply coupons on Flipkart, Amazon, Myntra & Meesho").
2. Save it as `public/og-image.png` in the repo.
3. Optimise with Squoosh (WebP + PNG fallback). Keep PNG as the canonical OG format; Facebook/Twitter prefer PNG/JPG.

---

## 5. DNS records (email deliverability, SPF + DMARC)

Your DNS provider (Cloudflare, GoDaddy, Route 53, etc.) needs these records. All values use `gocoupon.io`.

### SPF

| Field | Value                                 |
| ----- | ------------------------------------- |
| Type  | `TXT`                                 |
| Host  | `@`                                   |
| Value | `v=spf1 include:_spf.google.com ~all` |
| TTL   | `3600`                                |

If you send transactional email via a provider like SendGrid or Postmark, add their `include:` before `~all`:

```
v=spf1 include:_spf.google.com include:sendgrid.net ~all
```

### DMARC

| Field | Value                                            |
| ----- | ------------------------------------------------ |
| Type  | `TXT`                                            |
| Host  | `_dmarc`                                         |
| Value | `v=DMARC1; p=none; rua=mailto:support@gocoupon.io` |
| TTL   | `3600`                                           |

After you're confident reports look clean (1–2 weeks), ratchet policy from `p=none` → `p=quarantine` → `p=reject`.

### DKIM

Add the DKIM TXT record your ESP (Google Workspace, SendGrid, Postmark, etc.) provides. Google Workspace's is usually:

| Host                | Value                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------- |
| `google._domainkey` | Long `v=DKIM1; k=rsa; p=...` string from Google Admin → Apps → Gmail → Authenticate email |

---

## 6. Social handles

The footer, llms.txt, OG tags and Organization JSON-LD reference these handles. Claim them if you haven't:

- Facebook: `https://facebook.com/gocouponapp`
- Twitter / X: `https://twitter.com/gocoupon_in`
- Instagram: `https://instagram.com/gocoupon.io`

If you change any handle, update:

- `src/components/site/Footer.tsx` (social icons)
- `public/llms.txt`
- `index.html` (Organization JSON-LD `sameAs` array + twitter:site / twitter:creator)

---

## 7. Blog cadence (the highest-leverage remaining work)

The audit notes that Links scored F because no third party has linked to gocoupon.io yet. That is only fixed with consistent publication and outreach — not a code change.

Target: **1 new article per week** for the next 12 weeks on high-intent Indian coupon keywords. Early additions already in the codebase:

- `/blog/best-coupon-codes-for-flipkart-2026`
- `/blog/how-to-save-money-on-amazon-india`
- `/blog/myntra-coupon-codes-that-actually-work`
- `/blog/meesho-discount-codes-today`
- `/blog/chrome-extension-to-automatically-apply-coupons-india`

Pitch the `/press` page to 5–10 Indian tech + personal-finance outlets per month. Every accepted feature is a backlink.

---

## 8. Performance follow-ups (optional, high ROI)

- Convert `public/gc-logo.png`, `public/gc-logo-dark.png` and every logo under `public/Brand logos/` to **WebP** using Squoosh or `sharp`. Keep PNG as fallback only if needed.
- Install `terser` (`npm i -D terser`) and flip `minify: "esbuild"` → `minify: "terser"` in `vite.config.ts` for slightly smaller JS bundles.
- Consider adding `@vercel/og` to dynamically generate per-route OG images for blog posts.

---

## 9. Post-deploy verification

After the deploy goes live, run these:

- [ ] <https://search.google.com/test/rich-results> on `https://gocoupon.io/` — expect FAQPage, SoftwareApplication, Organization, WebSite.
- [ ] <https://validator.schema.org/> on a blog post URL — expect Article + BreadcrumbList.
- [ ] <https://pagespeed.web.dev/> on homepage and `/blog/best-coupon-codes-for-flipkart-2026`.
- [ ] <https://www.opengraph.xyz/> to preview the OG image on Slack, X, Facebook, LinkedIn.
- [ ] <https://dmarcian.com/dmarc-inspector/> on `gocoupon.io` — expect a valid DMARC record.
- [ ] `curl -I https://gocoupon.io/robots.txt` — expect `content-type: text/plain; charset=utf-8`.
- [ ] `curl https://gocoupon.io/llms.txt | head` — expect the llms.txt markdown to load.

Expected score impact after finishing all of the above (per the audit):

| Category    | Before  | After (target)                  |
| ----------- | ------- | ------------------------------- |
| Overall     | B- (57) | A- (82+)                        |
| Links       | F (0)   | C+ (after 3 months of outreach) |
| Performance | C+ (51) | B+ (75+)                        |
| GEO         | C+ (51) | B (70+)                         |
| On-Page SEO | A+ (88) | A+ (maintained)                 |
| Usability   | A- (78) | A (82+)                         |
