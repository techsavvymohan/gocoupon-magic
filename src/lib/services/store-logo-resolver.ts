/**
 * @file store-logo-resolver.ts
 * @description Zero-mismatch brand logo resolver for GoCoupon.
 *
 * Strategies:
 * 1. High-resolution local SVG/WebP vector assets for enterprise partners (Flipkart, Amazon, Myntra, Tata CLiQ, etc.)
 * 2. Exact merchant domain extraction directly from Cuelinks tracking redirect URLs (eliminating name collision/mismatch)
 * 3. Google S2 128px HD Favicon CDN for authentic brand favicons/icons
 * 4. Deterministic branded gradient monogram avatar fallback for network/load failures
 */

export const LOCAL_STORE_LOGOS: Record<string, string> = {};

/**
 * Extracts the exact destination merchant root domain from a Cuelinks tracking URL.
 */
export function extractMerchantDomain(
  trackingUrl?: string,
  storeName?: string,
  explicitDomain?: string
): string {
  if (explicitDomain && explicitDomain.includes(".") && !explicitDomain.includes("cuelinks") && !explicitDomain.includes("linksredirect")) {
    return explicitDomain.toLowerCase().replace(/^www\./, "").replace(/^m\./, "").replace(/^shop\./, "").trim();
  }

  if (trackingUrl) {
    try {
      const parsed = new URL(trackingUrl);
      const targetUrl = parsed.searchParams.get("url");
      if (targetUrl) {
        const decoded = decodeURIComponent(targetUrl);
        const u = new URL(decoded);
        let host = u.hostname.toLowerCase().replace(/^www\./, "").replace(/^m\./, "").replace(/^shop\./, "");
        if (host && host.includes(".")) {
          return host;
        }
      }
    } catch {}
  }

  const clean = (storeName || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  return clean ? `${clean}.com` : "gocoupon.io";
}

/**
 * Resolves a store logo URL.
 * If an explicit logo URL (e.g., Cloudinary link) is provided, it is returned.
 * If no logo is provided, returns empty string so the UI renders an ultra-fast CSS monogram.
 * External CDN / Google S2 favicon calls are intentionally disabled to maximize loading performance.
 */
export function resolveStoreLogo(
  storeName: string,
  trackingUrl?: string,
  explicitDomain?: string,
  existingLogo?: string
): string {
  // Check if existing logo is an explicitly configured remote URL (e.g. Cloudinary, custom CDN) or local asset
  if (
    existingLogo &&
    typeof existingLogo === "string" &&
    existingLogo.trim() !== "" &&
    !existingLogo.toLowerCase().includes("placeholder")
  ) {
    return existingLogo.trim();
  }

  // Zero-network fallback: return empty string so StoreLogo renders instant CSS initials
  return "";
}

/**
 * Generates 1-2 character initials for store monogram.
 */
export function getStoreInitials(storeName: string): string {
  if (!storeName) return "GC";
  const words = storeName.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  const clean = storeName.replace(/[^a-zA-Z0-9]/g, "");
  return clean.slice(0, 2).toUpperCase() || "ST";
}

const GRADIENT_PALETTES = [
  "from-violet-500 to-indigo-600 text-white",
  "from-rose-500 to-pink-600 text-white",
  "from-amber-500 to-orange-600 text-white",
  "from-emerald-500 to-teal-600 text-white",
  "from-sky-500 to-blue-600 text-white",
  "from-fuchsia-500 to-purple-600 text-white",
  "from-teal-500 to-emerald-600 text-white",
];

/**
 * Returns a deterministic gradient color palette class based on store name.
 */
export function getStoreGradient(storeName: string): string {
  let hash = 0;
  for (let i = 0; i < (storeName || "").length; i++) {
    hash = (hash << 5) - hash + storeName.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % GRADIENT_PALETTES.length;
  return GRADIENT_PALETTES[index];
}
