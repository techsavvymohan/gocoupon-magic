/**
 * @file affiliate-analytics.ts
 * @description Provider-neutral affiliate click tracking.
 *
 * Tracks affiliate CTA clicks so GoCoupon can understand which providers
 * drive engagement. Collects ONLY site events — no Amazon customer data,
 * no order IDs, no personal information.
 *
 * Tracked fields:
 *   provider, productId, country, event type, page, CTA label, timestamp
 *
 * NOT tracked:
 *   Amazon customer information, order data, payment details, user PII
 */

export interface AffiliateClickEvent {
  /** Provider name e.g. "amazon", "impact" */
  provider: string;
  /** Provider product ID e.g. ASIN for Amazon */
  productId: string;
  /** Country of the product/marketplace */
  country: "IN" | "US";
  /** Event type */
  event: "affiliate_click" | "affiliate_impression";
  /** Page path where the event occurred e.g. "/amazon-coupons" */
  page: string;
  /** CTA label that was clicked e.g. "View Deal on Amazon" */
  cta: string;
  /** Unix timestamp (ms) */
  timestamp: number;
}

/**
 * Tracks an affiliate event.
 *
 * In development: logs to console.
 * In production: pushes to window.dataLayer (Google Tag Manager) if available.
 * Falls back gracefully if GTM is not installed.
 *
 * @example
 * trackAffiliateClick({
 *   provider: "amazon",
 *   productId: "B08L5VJYV3",
 *   country: "IN",
 *   event: "affiliate_click",
 *   page: "/amazon-coupons",
 *   cta: "View Deal on Amazon",
 *   timestamp: Date.now(),
 * });
 */
export function trackAffiliateClick(event: AffiliateClickEvent): void {
  // Development: verbose logging
  if (import.meta.env.DEV) {
    console.log("[GoCoupon Analytics] Affiliate event:", event);
    return;
  }

  // Production: push to Google Tag Manager dataLayer
  try {
    const w = window as Window & { dataLayer?: unknown[] };
    if (Array.isArray(w.dataLayer)) {
      w.dataLayer.push({
        event: event.event,
        affiliate_provider: event.provider,
        affiliate_product_id: event.productId,
        affiliate_country: event.country,
        affiliate_cta: event.cta,
        affiliate_page: event.page,
        affiliate_timestamp: event.timestamp,
      });
    }
  } catch {
    // Analytics failures must never affect the user experience
  }
}

/**
 * Convenience wrapper for tracking a CTA click.
 * Automatically captures current page from window.location.
 */
export function trackCTAClick(options: {
  provider: string;
  productId: string;
  country: "IN" | "US";
  cta: string;
}): void {
  trackAffiliateClick({
    ...options,
    event: "affiliate_click",
    page: typeof window !== "undefined" ? window.location.pathname : "/",
    timestamp: Date.now(),
  });
}

/**
 * Convenience wrapper for tracking product impression.
 * Call when a product card enters the viewport.
 */
export function trackProductImpression(options: {
  provider: string;
  productId: string;
  country: "IN" | "US";
  cta: string;
}): void {
  trackAffiliateClick({
    ...options,
    event: "affiliate_impression",
    page: typeof window !== "undefined" ? window.location.pathname : "/",
    timestamp: Date.now(),
  });
}
