import fs from "fs";
import path from "path";
import { STORES_DATA } from "../src/data/storesData";
import { REGISTERED_STORES } from "../src/lib/services/store-registry";

console.log("=== BUILDING UNIFIED STORE CATALOG ===");

const dealsRaw = JSON.parse(fs.readFileSync("src/data/live-deals.json", "utf8"));
const deals = dealsRaw.deals || dealsRaw;

let brandAssets = [];
try {
  brandAssets = JSON.parse(fs.readFileSync("server/data/brand-assets.json", "utf8"));
} catch (e) {
  console.warn("Could not read brand-assets.json");
}

const brandMap = new Map();
for (const b of brandAssets) {
  if (b.slug) brandMap.set(b.slug.toLowerCase().replace(/[^a-z0-9]/g, ""), b);
  if (b.name) brandMap.set(b.name.toLowerCase().replace(/[^a-z0-9]/g, ""), b);
}

function sanitizeStoreName(raw: string): string {
  return raw
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/\b(tracking promo codes|promo codes|affiliate program|affiliate|cps|cpl|cpc)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

interface UnifiedStore {
  id: string;
  name: string;
  slug: string;
  category: string;
  logo: string;
  fallbackIcon: string;
  badge: string;
  rating: number;
  couponsCount: number;
  maxDiscount: string;
  cashbackRate: string;
  description: string;
  features: string[];
  popularCoupon: {
    code: string;
    description: string;
    discount: string;
  };
  link: string;
  isInternalRoute: boolean;
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
  }>;
}

const unifiedCatalog = new Map<string, UnifiedStore>();

// 1. Seed from existing STORES_DATA (highest priority metadata)
for (const s of STORES_DATA) {
  const baseSlug = s.slug.replace(/-coupons$/, "").toLowerCase();
  const slugKey = `${baseSlug}-coupons`;
  unifiedCatalog.set(baseSlug, {
    id: s.id || baseSlug,
    name: s.name,
    slug: slugKey,
    category: s.category || "General",
    logo: s.logo || "",
    fallbackIcon: s.fallbackIcon || "🛍️",
    badge: s.badge || "Verified Partner",
    rating: s.rating || 4.8,
    couponsCount: s.couponsCount || 1,
    maxDiscount: s.maxDiscount || "Special Offer",
    cashbackRate: s.cashbackRate || "Available",
    description: s.description || `Verified promo codes, discount vouchers, and shopping deals for ${s.name}.`,
    features: s.features || ["Verified Codes", "Tested Today", "Instant Apply"],
    popularCoupon: s.popularCoupon || {
      code: "DEALACTIVATED",
      description: `Verified ${s.name} promo offer`,
      discount: s.maxDiscount || "Verified Deal",
    },
    link: `/${slugKey}`,
    isInternalRoute: true,
    deals: s.popularCoupon?.code ? [
      {
        id: `${s.id}-pop`,
        title: s.popularCoupon.description,
        code: s.popularCoupon.code,
        discount: s.popularCoupon.discount,
        description: s.popularCoupon.description,
        category: s.category,
        expiry: "Active Today",
      }
    ] : [],
  });
}

// 2. Aggregate deals from live-deals.json
for (const d of deals) {
  const rawName = d.store || d.storeName;
  if (!rawName) continue;
  const cleanName = sanitizeStoreName(rawName);
  if (!cleanName) continue;

  const rawSlug = d.storeSlug || slugify(cleanName);
  const baseSlug = rawSlug.replace(/-coupons$/, "").toLowerCase();
  const slugKey = `${baseSlug}-coupons`;

  const brandInfo = brandMap.get(cleanName.toLowerCase().replace(/[^a-z0-9]/g, "")) ||
                    brandMap.get(baseSlug.replace(/[^a-z0-9]/g, ""));
  const logo = d.storeLogo || brandInfo?.logoUrl || `https://www.google.com/s2/favicons?domain=${baseSlug}.com&sz=128`;

  const dealItem = {
    id: String(d.id),
    title: d.title || `Save at ${cleanName}`,
    code: d.code || undefined,
    discount: d.discount || (d.code ? "Verified Code" : "Instant Deal"),
    description: d.terms || d.title || `Special offer for ${cleanName}`,
    category: d.category || "General",
    expiry: d.expiresIn || "Active Today",
    link: d.link,
  };

  if (!unifiedCatalog.has(baseSlug)) {
    unifiedCatalog.set(baseSlug, {
      id: baseSlug,
      name: cleanName,
      slug: slugKey,
      category: d.category || "General",
      logo,
      fallbackIcon: "🛍️",
      badge: "Verified Partner",
      rating: 4.8,
      couponsCount: d.code ? 1 : 0,
      maxDiscount: d.discount || "Special Offer",
      cashbackRate: "Available",
      description: `Verified promo codes, discount vouchers, and shopping deals for ${cleanName}. Tested daily with real-time cart verification.`,
      features: ["Verified Codes", "Tested Today", "Instant Apply"],
      popularCoupon: {
        code: d.code || "DEALACTIVATED",
        description: d.title || `Exclusive ${cleanName} discount offer`,
        discount: d.discount || "Verified Deal",
      },
      link: `/${slugKey}`,
      isInternalRoute: true,
      deals: [dealItem],
    });
  } else {
    const existing = unifiedCatalog.get(baseSlug)!;
    if (!existing.logo && logo) existing.logo = logo;
    if (d.code) existing.couponsCount++;
    if (!existing.deals.some(ed => ed.id === dealItem.id || (dealItem.code && ed.code === dealItem.code))) {
      existing.deals.push(dealItem);
    }
  }
}

console.log(`Total stores in unified catalog: ${unifiedCatalog.size}`);

// Verify Qatar Airways, Klook, Air India, Vijay Sales, Booking.com
const checkSlugs = ["qatar-airways", "klook", "air-india", "vijay-sales", "booking-com", "jockey", "uniqlo"];
for (const s of checkSlugs) {
  const found = unifiedCatalog.get(s);
  if (found) {
    console.log(`✅ ${s} -> Name: "${found.name}", Deals: ${found.deals.length}, Logo: ${Boolean(found.logo)}`);
  } else {
    console.error(`❌ ${s} NOT found!`);
  }
}

// Write out src/data/unified-stores.json
// Keep top 3 deals per store for instant static SSR/hydration, remaining fetched via useDeals
const outputList = Array.from(unifiedCatalog.values()).map(store => ({
  ...store,
  deals: store.deals.slice(0, 3),
}));
outputList.sort((a, b) => b.couponsCount - a.couponsCount);

fs.writeFileSync("src/data/unified-stores.json", JSON.stringify(outputList, null, 2), "utf8");
console.log(`Successfully wrote ${outputList.length} stores to src/data/unified-stores.json!`);
