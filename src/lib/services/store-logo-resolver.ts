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

export const CLOUDINARY_STORE_LOGOS: Record<string, string> = {
  "amazon": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057616/gocoupon/brands/brand_amazon.webp",
  "flipkart": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057540/gocoupon/brands/brand_flipkart.webp",
  "myntra": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057618/gocoupon/brands/brand_myntra.webp",
  "boat": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745796/gocoupon/brands/brand_boat.jpg",
  "croma": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057619/gocoupon/brands/brand_croma.svg",
  "tatacliq": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057624/gocoupon/brands/brand_tatacliq.webp",
  "ajio": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057625/gocoupon/brands/brand_ajio.webp",
  "nykaa": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057626/gocoupon/brands/brand_nykaa.webp",
  "meesho": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057627/gocoupon/brands/brand_meesho.webp",
  "reliance": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057621/gocoupon/brands/brand_reliance.svg",
  "snitch": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057648/gocoupon/brands/brand_snitch.png",
  "swiggy": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057650/gocoupon/brands/brand_swiggy.png",
  "zomato": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057650/gocoupon/brands/brand_zomato.ico",
  "firstcry": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057628/gocoupon/brands/brand_firstcry.webp",
  "noise": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057630/gocoupon/brands/brand_noise.svg",
  "mamaearth": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057655/gocoupon/brands/brand_mamaearth.png",
  "bewakoof": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745785/gocoupon/brands/brand_bewakoof.png",
  "thesouledstore": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057656/gocoupon/brands/brand_thesouledstore.png",
  "flixbus": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057657/gocoupon/brands/brand_flixbus.png",
  "medibuddy": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745875/gocoupon/brands/brand_medibuddy.png",
  "booking": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057658/gocoupon/brands/brand_booking.png",
  "jbl": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057660/gocoupon/brands/brand_jbl.png"
};
export const LOCAL_STORE_LOGOS: Record<string, string> = CLOUDINARY_STORE_LOGOS;

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
  // Check Cloudinary store logos static lookup
  const clean = (storeName || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (CLOUDINARY_STORE_LOGOS[clean]) {
    return CLOUDINARY_STORE_LOGOS[clean];
  }
  if (CLOUDINARY_STORE_LOGOS[`${clean}-coupons`]) {
    return CLOUDINARY_STORE_LOGOS[`${clean}-coupons`];
  }

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
