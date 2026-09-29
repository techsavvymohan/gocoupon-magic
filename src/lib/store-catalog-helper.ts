import liveDealsData from "@/data/live-deals.json";
import { STORES_DATA } from "@/data/storesData";

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

export function getStoreCatalog(): Map<string, StoreCatalogEntry> {
  if (catalogCache) return catalogCache;

  const catalog = new Map<string, StoreCatalogEntry>();

  // 1. Seed from storesData.ts
  for (const s of STORES_DATA) {
    const slugKey = s.slug.endsWith("-coupons") ? s.slug : `${s.slug}-coupons`;
    catalog.set(slugKey, {
      name: s.name,
      slug: slugKey,
      category: s.category || "General",
      logo: s.logo,
      fallbackIcon: s.fallbackIcon || "",
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

  // 2. Ingest all stores and active deals from live-deals.json
  const rawList = Array.isArray(liveDealsData)
    ? liveDealsData
    : ((liveDealsData as any).deals || (liveDealsData as any).offers || []);

  for (const d of rawList) {
    const rawName = d.store || d.storeName || d.merchant;
    if (!rawName) continue;
    const name = String(rawName).trim();
    const baseSlug = slugify(name);
    if (!baseSlug) continue;
    const slugKey = `${baseSlug}-coupons`;

    if (!catalog.has(slugKey)) {
      catalog.set(slugKey, {
        name,
        slug: slugKey,
        category: d.category || "Online Shopping",
        fallbackIcon: "",
        badge: "Verified Merchant",
        rating: 4.8,
        couponsCount: 0,
        maxDiscount: "60% OFF",
        cashbackRate: "Up to 8.5%",
        description: `Verified ${name} promo codes, discount vouchers, and exclusive savings tested against live checkout carts.`,
        deals: [],
      });
    }

    const entry = catalog.get(slugKey)!;
    entry.couponsCount++;
    entry.deals.push({
      id: d.id || `${baseSlug}-${entry.deals.length}`,
      title: d.title || `Save on ${name}`,
      code: d.code || (d.coupon_code ? String(d.coupon_code) : undefined),
      discount: d.discount || (d.code ? "Exclusive Code" : "Instant Deal"),
      description: d.description || d.title || `Special promotional offer on ${name}.`,
      minSpend: d.min_order_value || d.minSpend || undefined,
      category: d.category || entry.category,
      expiry: d.valid_to || d.expiry || "Active Today",
      link: d.affiliateLink || d.url || d.link,
    });
  }

  catalogCache = catalog;
  return catalog;
}

export function getStoreBySlug(slug: string): StoreCatalogEntry | null {
  const catalog = getStoreCatalog();
  const normalizedSlug = slug.endsWith("-coupons") ? slug : `${slug}-coupons`;
  return catalog.get(normalizedSlug) || null;
}
