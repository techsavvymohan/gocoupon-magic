import { STORES_DATA } from "@/data/storesData";
import { REGISTERED_STORES } from "@/lib/services/store-registry";
import UNIFIED_STORES from "@/data/unified-stores.json";

export interface StoreCatalogEntry {
  name: string;
  slug: string;
  category: string;
  logo?: string;
  fallbackIcon?: string;
  badge?: string;
  rating: number;
  couponsCount: number;
  maxDiscount: string;
  cashbackRate?: string;
  description: string;
  deals: Array<{
    id: string;
    title: string;
    code?: string;
    discount?: string;
    description?: string;
    minSpend?: string;
    category?: string;
    expiry?: string;
    link?: string;
    affiliateLink?: string;
  }>;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// In-memory catalog cache indexed by `${slug}-coupons`
let catalogCache: Map<string, StoreCatalogEntry> | null = null;

export function invalidateStoreCatalogCache(): void {
  catalogCache = null;
}

export function getStoreCatalog(): Map<string, StoreCatalogEntry> {
  if (catalogCache) return catalogCache;

  const catalog = new Map<string, StoreCatalogEntry>();

  // 1. Seed from storesData.ts (top priority curated metadata)
  for (const s of STORES_DATA) {
    const slugKey = s.slug.endsWith("-coupons") ? s.slug : `${s.slug}-coupons`;
    catalog.set(slugKey, {
      name: s.name,
      slug: slugKey,
      category: s.category || "General",
      logo: s.logo,
      fallbackIcon: s.fallbackIcon || "🛍️",
      badge: s.badge || "Verified Partner",
      rating: s.rating || 4.8,
      couponsCount: s.couponsCount || 10,
      maxDiscount: s.maxDiscount || "50% OFF",
      cashbackRate: s.cashbackRate,
      description: s.description || `Verified promo codes, discount vouchers, and shopping deals for ${s.name}.`,
      deals: s.popularCoupon?.code ? [
        {
          id: `${s.id}-pop`,
          title: s.popularCoupon.description,
          code: s.popularCoupon.code,
          discount: s.popularCoupon.discount,
          description: s.popularCoupon.description,
          minSpend: "₹999",
          category: s.category,
          expiry: "Active Today",
        }
      ] : [],
    });
  }

  // 2. Seed from REGISTERED_STORES (store-registry.ts) for stores not yet present
  for (const r of REGISTERED_STORES) {
    const baseSlug = slugify(r.id || r.name);
    const slugKey = `${baseSlug}-coupons`;
    if (!catalog.has(slugKey)) {
      catalog.set(slugKey, {
        name: r.name,
        slug: slugKey,
        category: r.category ? r.category.charAt(0).toUpperCase() + r.category.slice(1) : "General",
        logo: r.logo,
        fallbackIcon: "🛍️",
        badge: r.status === "instant_open" ? "Instant Track" : "Verified Partner",
        rating: 4.8,
        couponsCount: r.defaultCoupon?.code ? 1 : 0,
        maxDiscount: r.defaultCoupon?.description || "Special Savings",
        cashbackRate: r.cashbackRate,
        description: `Verified promo codes, discount vouchers, and shopping deals for ${r.name}.`,
        deals: r.defaultCoupon?.code ? [
          {
            id: `${r.id}-default`,
            title: r.defaultCoupon.description,
            code: r.defaultCoupon.code,
            discount: r.defaultCoupon.discountAmount
              ? `₹${r.defaultCoupon.discountAmount} OFF`
              : r.defaultCoupon.discountPct
              ? `${Math.round(r.defaultCoupon.discountPct * 100)}% OFF`
              : "Special Offer",
            description: r.defaultCoupon.description,
            minSpend: "₹499",
            category: r.category,
            expiry: "Active Today",
            link: r.storeUrl,
          }
        ] : [],
      });
    } else if (r.defaultCoupon?.code) {
      // Add default coupon if missing from existing store entry
      const existing = catalog.get(slugKey)!;
      if (!existing.deals.some((d) => d.code === r.defaultCoupon?.code)) {
        existing.deals.push({
          id: `${r.id}-default`,
          title: r.defaultCoupon.description,
          code: r.defaultCoupon.code,
          discount: r.defaultCoupon.discountAmount
            ? `₹${r.defaultCoupon.discountAmount} OFF`
            : r.defaultCoupon.discountPct
            ? `${Math.round(r.defaultCoupon.discountPct * 100)}% OFF`
            : "Special Offer",
          description: r.defaultCoupon.description,
          category: r.category,
          expiry: "Active Today",
          link: r.storeUrl,
        });
      }
    }
  }

  // 3. Seed from UNIFIED_STORES (all 384 merchants with live deals & brand assets)
  for (const u of UNIFIED_STORES) {
    const slugKey = u.slug.endsWith("-coupons") ? u.slug : `${u.slug}-coupons`;
    const baseSlug = slugKey.replace(/-coupons$/, "");
    if (!catalog.has(slugKey) && !catalog.has(baseSlug)) {
      catalog.set(slugKey, {
        name: u.name,
        slug: slugKey,
        category: u.category || "General",
        logo: u.logo,
        fallbackIcon: u.fallbackIcon || "🛍️",
        badge: u.badge || "Verified Partner",
        rating: u.rating || 4.8,
        couponsCount: u.couponsCount || u.deals?.length || 1,
        maxDiscount: u.maxDiscount || "Special Offer",
        cashbackRate: u.cashbackRate || "Available",
        description: u.description || `Verified promo codes, discount vouchers, and shopping deals for ${u.name}.`,
        deals: u.deals || [],
      });
    }
  }

  catalogCache = catalog;
  return catalog;
}

export function registerDynamicStore(entry: StoreCatalogEntry): void {
  const catalog = getStoreCatalog();
  const slugKey = entry.slug.endsWith("-coupons") ? entry.slug : `${entry.slug}-coupons`;
  if (!catalog.has(slugKey)) {
    catalog.set(slugKey, { ...entry, slug: slugKey });
  } else {
    const existing = catalog.get(slugKey)!;
    for (const d of entry.deals) {
      if (!existing.deals.some((ed) => ed.id === d.id || (ed.code && ed.code === d.code))) {
        existing.deals.push(d);
        existing.couponsCount++;
      }
    }
  }
}

export const STORE_SLUG_ALIASES: Record<string, string> = {
  "tatacliq-coupons": "tata-cliq-coupons",
  "tatacliq": "tata-cliq-coupons",
  "bestbuy-coupons": "best-buy-coupons",
  "bestbuy": "best-buy-coupons",
  "bookingcom-coupons": "booking-com-coupons",
  "bookingcom": "booking-com-coupons",
  "siderai-coupons": "sider-ai-coupons",
  "siderai": "sider-ai-coupons",
  "adcreativeai-coupons": "adcreative-ai-coupons",
  "adcreativeai": "adcreative-ai-coupons",
  "reclaimai-coupons": "reclaim-ai-coupons",
  "reclaimai": "reclaim-ai-coupons",
  "tripcom-coupons": "trip-com-coupons",
  "tripcom": "trip-com-coupons",
  "domaincom-coupons": "domain-com-coupons",
  "domaincom": "domain-com-coupons",
  "replyio-coupons": "reply-io-coupons",
  "replyio": "reply-io-coupons",
  "allegropl-coupons": "allegro-pl-coupons",
  "allegropl": "allegro-pl-coupons",
  "aosomcom-coupons": "aosom-com-coupons",
  "aosomcom": "aosom-com-coupons",
  "apohealthde-coupons": "apohealth-de-coupons",
  "apohealthde": "apohealth-de-coupons",
  "answearsi-coupons": "answear-si-coupons",
  "answearsi": "answear-si-coupons",
  "answearhu-coupons": "answear-hu-coupons",
  "answearhu": "answear-hu-coupons",
  "answearhr-coupons": "answear-hr-coupons",
  "answearhr": "answear-hr-coupons",
  "agatinsvetcz-coupons": "agatinsvet-cz-coupons",
  "agatinsvetcz": "agatinsvet-cz-coupons",
  "adblockultimatenet-coupons": "adblockultimate-net-coupons",
  "adblockultimatenet": "adblockultimate-net-coupons",
  "e-armyshopcz-coupons": "e-armyshop-cz-coupons",
  "e-armyshopcz": "e-armyshop-cz-coupons",
  "banggood-cj-affiliate-program-coupons": "banggood-coupons",
  "raynatours-many-geos-tracking-promo-codes-coupons": "raynatours-coupons",
  "stylevana-affiliate-program-coupons": "stylevana-coupons",
  "jcpenney-affiliate-coupons": "jcpenney-coupons",
  "contactsdirect-affiliate-program-coupons": "contactsdirect-coupons",
  "caribbean-affiliate-program-coupons": "caribbean-coupons",
};

export function getStoreBySlug(slug: string): StoreCatalogEntry | null {
  const catalog = getStoreCatalog();
  let cleanSlug = (slug || "").toLowerCase().trim();
  if (!cleanSlug) return null;

  // Resolve alias if present
  if (STORE_SLUG_ALIASES[cleanSlug]) {
    cleanSlug = STORE_SLUG_ALIASES[cleanSlug];
  }

  const normalizedSlug = cleanSlug.endsWith("-coupons") ? cleanSlug : `${cleanSlug}-coupons`;
  const baseSlug = cleanSlug.replace(/-coupons$/, "");

  // 1. Exact match
  if (catalog.has(normalizedSlug)) return catalog.get(normalizedSlug)!;
  if (catalog.has(baseSlug)) return catalog.get(baseSlug)!;
  if (catalog.has(cleanSlug)) return catalog.get(cleanSlug)!;

  // 2. Case-insensitive slug / name match
  for (const [key, value] of catalog.entries()) {
    if (key.toLowerCase() === normalizedSlug || key.toLowerCase() === baseSlug) {
      return value;
    }
    const valBase = value.slug.replace(/-coupons$/, "").toLowerCase();
    if (valBase === baseSlug || valBase === cleanSlug) {
      return value;
    }
    if (value.name.toLowerCase() === baseSlug || value.name.toLowerCase() === cleanSlug) {
      return value;
    }
  }

  // 3. Fallback: normalize non-alphanumeric chars (e.g. "booking.com" -> "bookingcom")
  const simpleSlug = cleanSlug.replace(/[^a-z0-9]/g, "");
  if (simpleSlug.length >= 2) {
    for (const [key, value] of catalog.entries()) {
      const keySimple = key.replace(/[^a-z0-9]/g, "");
      const nameSimple = value.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      const valBaseSimple = value.slug.replace(/-coupons$/, "").replace(/[^a-z0-9]/g, "");
      if (keySimple === simpleSlug || nameSimple === simpleSlug || valBaseSimple === simpleSlug) {
        return value;
      }
      if (keySimple.startsWith(simpleSlug) || nameSimple.startsWith(simpleSlug) || valBaseSimple.startsWith(simpleSlug)) {
        return value;
      }
    }
  }

  return null;
}
