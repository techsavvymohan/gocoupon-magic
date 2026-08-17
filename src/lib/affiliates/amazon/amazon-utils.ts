/**
 * @file amazon-utils.ts
 * @description Amazon-specific utility helpers.
 *
 * All helpers in this file must ONLY be used inside the amazon/ directory.
 * Never import from this file in UI components or the product layer.
 */

/**
 * Extracts the ASIN from a variety of Amazon URL formats.
 *
 * Handles:
 *   https://www.amazon.in/dp/B08L5VJYV3?tag=...
 *   https://www.amazon.in/product-name/dp/B08L5VJYV3
 *   https://www.amazon.in/gp/product/B08L5VJYV3
 *
 * Returns null if no ASIN is found.
 */
export function extractAsin(url: string): string | null {
  const dpMatch = url.match(/\/dp\/([A-Z0-9]{10})/i);
  if (dpMatch) return dpMatch[1].toUpperCase();

  const gpMatch = url.match(/\/gp\/product\/([A-Z0-9]{10})/i);
  if (gpMatch) return gpMatch[1].toUpperCase();

  return null;
}

/**
 * Validates that a string looks like a valid Amazon ASIN.
 * ASINs are exactly 10 alphanumeric characters.
 */
export function isValidAsin(value: string): boolean {
  return /^[A-Z0-9]{10}$/.test(value.toUpperCase());
}

/**
 * Formats a price in Indian Rupees (₹) for display.
 * @example formatINR(5499) → "₹5,499"
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a price in US Dollars ($) for display.
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a price for display based on currency code.
 */
export function formatPrice(amount: number, currency: string): string {
  if (currency === "INR") return formatINR(amount);
  if (currency === "USD") return formatUSD(amount);
  return `${currency} ${amount.toFixed(2)}`;
}

/**
 * Calculates a discount percentage string for display.
 * @example calcDiscountLabel(9999, 5499) → "Save ₹4,500"
 */
export function calcSavingLabel(originalPrice: number, dealPrice: number, currency = "INR"): string {
  const saving = originalPrice - dealPrice;
  if (saving <= 0) return "";
  return `Save ${formatPrice(saving, currency)}`;
}

/**
 * Strips a partner tag from an Amazon URL so it can be re-tagged.
 * This ensures we never double-tag a URL.
 */
export function stripPartnerTag(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("tag");
    return parsed.toString();
  } catch {
    // If the URL is invalid, return it unchanged
    return url;
  }
}

/**
 * Normalizes availability text from Amazon API responses into
 * a short human-readable string.
 */
export function normalizeAvailability(
  raw: string | undefined,
): "In Stock" | "Out of Stock" | "Limited Stock" | "Unknown" {
  if (!raw) return "Unknown";
  const lower = raw.toLowerCase();
  if (lower.includes("in stock") || lower.includes("available")) return "In Stock";
  if (lower.includes("out of stock") || lower.includes("unavailable")) return "Out of Stock";
  if (lower.includes("limited") || lower.includes("only")) return "Limited Stock";
  return "Unknown";
}
