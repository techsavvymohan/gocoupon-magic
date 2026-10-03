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
  "jbl": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057660/gocoupon/brands/brand_jbl.png",
  "ajiogram": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057625/gocoupon/brands/brand_ajio.webp",
  "nykaabeauty": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057626/gocoupon/brands/brand_nykaa.webp",
  "nykaafashion": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057626/gocoupon/brands/brand_nykaa.webp",
  "reliancedigital": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791057621/gocoupon/brands/brand_reliance.svg",
  "walmart": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058469/gocoupon/brands/brand_walmart.ico",
  "walmart-coupons": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058469/gocoupon/brands/brand_walmart.ico",
  "ebay": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058470/gocoupon/brands/brand_ebay.ico",
  "ebay-coupons": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058470/gocoupon/brands/brand_ebay.ico",
  "nike": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058472/gocoupon/brands/brand_nike.ico",
  "nike-coupons": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058472/gocoupon/brands/brand_nike.ico",
  "sephora": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058473/gocoupon/brands/brand_sephora.ico",
  "sephora-coupons": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058473/gocoupon/brands/brand_sephora.ico",
  "makemytrip": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058476/gocoupon/brands/brand_makemytrip.png",
  "makemytrip-coupons": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058476/gocoupon/brands/brand_makemytrip.png",
  "dominos": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058477/gocoupon/brands/brand_dominos.png",
  "dominos-coupons": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058477/gocoupon/brands/brand_dominos.png",
  "cleartrip": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058479/gocoupon/brands/brand_cleartrip.png",
  "cleartrip-coupons": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058479/gocoupon/brands/brand_cleartrip.png",
  "alibaba": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058480/gocoupon/brands/brand_alibaba.ico",
  "alibaba-coupons": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058480/gocoupon/brands/brand_alibaba.ico",
  "raynatours": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058483/gocoupon/brands/brand_raynatours.png",
  "raynatours-coupons": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058483/gocoupon/brands/brand_raynatours.png",
  "gstarraw": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058483/gocoupon/brands/brand_gstarraw.png",
  "g-star-raw-coupons": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058483/gocoupon/brands/brand_gstarraw.png",
  "mamaspapas": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058484/gocoupon/brands/brand_mamasandpapas.png",
  "mamasandpapas": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058484/gocoupon/brands/brand_mamasandpapas.png",
  "mamasandpapas-coupons": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058484/gocoupon/brands/brand_mamasandpapas.png",
  "svastika": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058485/gocoupon/brands/brand_svastika.png",
  "qntsportsindia": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058488/gocoupon/brands/brand_qntsports.ico",
  "qntsports": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058488/gocoupon/brands/brand_qntsports.ico",
  "qnt-sports": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058488/gocoupon/brands/brand_qntsports.ico",
  "nobero": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058489/gocoupon/brands/brand_nobero.png",
  "ezeeperfume": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058490/gocoupon/brands/brand_ezeeperfume.png",
  "ezee-perfume": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058490/gocoupon/brands/brand_ezeeperfume.png",
  "thepantproject": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058491/gocoupon/brands/brand_thepantproject.png",
  "the-pant-project": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058491/gocoupon/brands/brand_thepantproject.png",
  "aceblend": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058492/gocoupon/brands/brand_aceblend.png",
  "ace-blend": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058492/gocoupon/brands/brand_aceblend.png",
  "decodeage": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058493/gocoupon/brands/brand_decodeage.png",
  "decode-age": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058493/gocoupon/brands/brand_decodeage.png",
  "saadaa": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058494/gocoupon/brands/brand_saadaa.jpg",
  "qatarairways": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058494/gocoupon/brands/brand_qatarairways.ico",
  "airindia": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058496/gocoupon/brands/brand_airindia.ico",
  "vijaysales": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745770/gocoupon/brands/brand_vijay-sales.jpg",
  "wellbeingnutrition": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745781/gocoupon/brands/brand_wellbeing-nutrition.png",
  "banggood": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745883/gocoupon/brands/brand_banggood.png",
  "stylevana": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058497/gocoupon/brands/brand_stylevana.png",
  "oppoindia": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745789/gocoupon/brands/brand_oppo.png",
  "oppo": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745789/gocoupon/brands/brand_oppo.png",
  "tripcom": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745789/gocoupon/brands/brand_trip-com.png",
  "bellavita": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745791/gocoupon/brands/brand_bella-vita.png",
  "themancompany": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745792/gocoupon/brands/brand_the-man-company.png",
  "khadinatural": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745794/gocoupon/brands/brand_khadi-natural.png",
  "campusshoes": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745794/gocoupon/brands/brand_campus-shoes.png",
  "decathlon": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745815/gocoupon/brands/brand_decathlon.png",
  "godrejinterio": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745797/gocoupon/brands/brand_godrej-interio.png",
  "dotkey": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745798/gocoupon/brands/brand_dot-key.png",
  "dotandkey": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745798/gocoupon/brands/brand_dot-key.png",
  "redbus": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058499/gocoupon/brands/brand_redbus.ico",
  "wildstone": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745887/gocoupon/brands/brand_wild-stone.png",
  "malaysiaairlines": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745853/gocoupon/brands/brand_malaysia-airlines.png",
  "lotpolishairlines": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745891/gocoupon/brands/brand_lot-polish-airlines.png",
  "lotairlines": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745891/gocoupon/brands/brand_lot-polish-airlines.png",
  "samsung": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058500/gocoupon/brands/brand_samsung.png",
  "delltechnologies": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058501/gocoupon/brands/brand_dell.ico",
  "dell": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058501/gocoupon/brands/brand_dell.ico",
  "lenovo": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058502/gocoupon/brands/brand_lenovo.gif",
  "ajmalperfumes": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058507/gocoupon/brands/brand_ajmalperfumes.svg",
  "nashermiles": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058509/gocoupon/brands/brand_nashermiles.png",
  "hostinger": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058509/gocoupon/brands/brand_hostinger.ico",
  "capresebags": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745844/gocoupon/brands/brand_caprese-bags.png",
  "caprese": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745844/gocoupon/brands/brand_caprese-bags.png",
  "innisfree": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058512/gocoupon/brands/brand_innisfree.ico",
  "shein": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058513/gocoupon/brands/brand_shein.ico",
  "jcpenney": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058514/gocoupon/brands/brand_jcpenney.png",
  "barcelohotels": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058516/gocoupon/brands/brand_barcelo.ico",
  "barcelo": "https://res.cloudinary.com/pgzfcjir/image/upload/v1791058516/gocoupon/brands/brand_barcelo.ico",
  "adcreativeai": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745885/gocoupon/brands/brand_adcreative-ai.png",
  "adcreative": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745885/gocoupon/brands/brand_adcreative-ai.png",
  "browseai": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745890/gocoupon/brands/brand_browse-ai.png",
  "hamaramall": "https://res.cloudinary.com/pgzfcjir/image/upload/v1790745769/gocoupon/brands/brand_hamara-mall.png"
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
