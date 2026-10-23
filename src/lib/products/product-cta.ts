/**
 * @file product-cta.ts
 * @description Provider-independent CTA label generator.
 *
 * UI components must NEVER hard-code "View Deal on Amazon" or any provider name.
 * Instead they call getAffiliateCTA(provider) and use the returned string.
 *
 * This means the same <ProductCard> component works for Amazon, Impact, Awin, etc.
 * without any if/else provider checks in the render logic.
 */

export interface CTAConfig {
  /** Primary CTA button label */
  label: string;
  /** Aria label for accessibility */
  ariaLabel: string;
  /** rel attribute for the anchor tag */
  rel: string;
}

const CTA_MAP: Record<string, CTAConfig> = {
  amazon: {
    label: "View Deal on Amazon",
    ariaLabel: "View this deal on Amazon — opens in a new tab",
    rel: "noopener sponsored nofollow",
  },
  impact: {
    label: "View Deal",
    ariaLabel: "View this deal — opens in a new tab",
    rel: "noopener sponsored nofollow",
  },
  awin: {
    label: "View Offer",
    ariaLabel: "View this offer — opens in a new tab",
    rel: "noopener sponsored nofollow",
  },
  cj: {
    label: "View Deal",
    ariaLabel: "View this deal — opens in a new tab",
    rel: "noopener sponsored nofollow",
  },
  sharesale: {
    label: "View Deal",
    ariaLabel: "View this deal — opens in a new tab",
    rel: "noopener sponsored nofollow",
  },
  mock: {
    label: "Check Live Price",
    ariaLabel: "Check live price on store — opens in a new tab",
    rel: "noopener sponsored nofollow",
  },
};

const DEFAULT_CTA: CTAConfig = {
  label: "View Deal",
  ariaLabel: "View this deal — opens in a new tab",
  rel: "noopener sponsored nofollow",
};

/**
 * Returns the CTA configuration for a given provider.
 * Falls back to a generic "View Deal" if the provider is not in the map.
 *
 * @example
 * const { label, ariaLabel, rel } = getAffiliateCTA("amazon");
 * // label → "View Deal on Amazon"
 */
export function getAffiliateCTA(provider: string): CTAConfig {
  return CTA_MAP[provider.toLowerCase()] ?? DEFAULT_CTA;
}

/**
 * Returns just the CTA label string. Convenience wrapper.
 */
export function getAffiliateCTALabel(provider: string): string {
  return getAffiliateCTA(provider).label;
}
