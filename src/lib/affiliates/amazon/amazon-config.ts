/**
 * @file amazon-config.ts
 * @description Amazon Associates configuration reader.
 *
 * Reads VITE_-prefixed environment variables (safe for browser bundle).
 * NEVER reads AMAZON_CLIENT_ID / AMAZON_CLIENT_SECRET here — those are
 * server-side only and live in Vercel Serverless Function env variables.
 *
 * Fails gracefully: returns { enabled: false } when credentials are missing.
 * The website must continue working normally with VITE_AMAZON_ENABLED=false.
 */

export interface AmazonConfig {
  /** Whether the Amazon provider is active */
  enabled: boolean;
  /** Amazon Associates partner tag for this marketplace */
  partnerTag: string;
  /** Marketplace domain e.g. "www.amazon.in" */
  marketplace: string;
  /** Country code */
  country: "IN" | "US";
}

const DEFAULTS = {
  IN: {
    marketplace: "www.amazon.in",
    partnerTag: "",
  },
  US: {
    marketplace: "www.amazon.com",
    partnerTag: "",
  },
} as const;

/**
 * Returns validated Amazon configuration for a given marketplace.
 * Returns enabled=false when VITE_AMAZON_ENABLED is not "true".
 *
 * @example
 * const config = getAmazonConfig("IN");
 * if (!config.enabled) return null;
 */
export function getAmazonConfig(country: "IN" | "US" = "IN"): AmazonConfig {
  const enabled = import.meta.env.VITE_AMAZON_ENABLED === "true";

  if (!enabled) {
    return {
      enabled: false,
      partnerTag: "",
      marketplace: DEFAULTS[country].marketplace,
      country,
    };
  }

  const partnerTagKey = country === "IN" ? "VITE_AMAZON_IN_PARTNER_TAG" : "VITE_AMAZON_US_PARTNER_TAG";
  const marketplaceKey =
    country === "IN" ? "VITE_AMAZON_IN_MARKETPLACE" : "VITE_AMAZON_US_MARKETPLACE";

  const partnerTag: string =
    (import.meta.env[partnerTagKey] as string | undefined) ?? DEFAULTS[country].partnerTag;

  const marketplace: string =
    (import.meta.env[marketplaceKey] as string | undefined) ?? DEFAULTS[country].marketplace;

  // Warn in dev if partner tag is missing
  if (import.meta.env.DEV && !partnerTag) {
    console.warn(
      `[GoCoupon Affiliates] VITE_AMAZON_ENABLED=true but ${partnerTagKey} is not set. ` +
        `Affiliate links will be generated without a partner tag.`,
    );
  }

  return { enabled: true, partnerTag, marketplace, country };
}
