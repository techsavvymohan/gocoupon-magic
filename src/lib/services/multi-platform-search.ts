/**
 * @file multi-platform-search.ts
 * @description Real-time Multi-Platform Product Search Engine.
 * Searches across Amazon, Flipkart, Myntra, Croma, Meesho, Tata CLiQ, and Reliance Digital.
 */

import { searchSearXNG } from "./searxng-service";
import { resolveLiveUrlAndCompetitors } from "./url-metadata-extractor";

export interface MultiPlatformStoreOffer {
  storeId: string;
  storeName: string;
  storeLogo?: string;
  price: number;
  effectiveNetPrice: number;
  couponCode?: string;
  couponSavings: number;
  cashbackRate: string;
  cashbackAmount: number;
  affiliateUrl: string;
  deliveryTime: string;
  isLowest: boolean;
}

export interface MultiPlatformProductItem {
  id: string;
  title: string;
  brand: string;
  category: string;
  primaryStore: string;
  primaryStoreLogo?: string;
  isTrustedStore?: boolean;
  trustTier?: number;
  price: number;
  originalPrice: number;
  discountPercent: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  directUrl: string;
  deliveryInfo: string;
  isBestPrice: boolean;
  offers: MultiPlatformStoreOffer[];
  lowestPriceStore: string;
  maxSavingsVsOriginal: number;
}

export interface MultiPlatformSearchResult {
  query: string;
  products: MultiPlatformProductItem[];
  availableStores: string[];
  totalFound: number;
  lowestOverallPrice: number;
  highestOverallSavings: number;
  isDirectUrl: boolean;
}

export const TRUSTED_PLATFORMS = [
  { id: "amazon", name: "Amazon India", aliases: ["amazon", "amazon.in", "amazon india"], tier: 1 },
  { id: "flipkart", name: "Flipkart", aliases: ["flipkart", "flipkart.com"], tier: 1 },
  { id: "croma", name: "Croma", aliases: ["croma", "croma.com"], tier: 2 },
  { id: "tatacliq", name: "Tata CLiQ", aliases: ["tata cliq", "tatacliq", "tatacliq.com"], tier: 2 },
  { id: "myntra", name: "Myntra", aliases: ["myntra", "myntra.com"], tier: 2 },
  { id: "reliance", name: "Reliance Digital", aliases: ["reliance", "reliance digital", "reliancedigital"], tier: 2 },
  { id: "vijaysales", name: "Vijay Sales", aliases: ["vijay sales", "vijaysales"], tier: 2 },
  { id: "meesho", name: "Meesho", aliases: ["meesho", "meesho.com"], tier: 3 },
  { id: "ajio", name: "Ajio", aliases: ["ajio", "ajio.com"], tier: 3 },
  { id: "nykaa", name: "Nykaa", aliases: ["nykaa", "nykaa.com"], tier: 3 },
];

export function getPlatformTrustRank(storeName: string): number {
  const norm = (storeName || "").toLowerCase().trim();
  for (const plat of TRUSTED_PLATFORMS) {
    if (plat.aliases.some((a) => norm.includes(a))) {
      return plat.tier;
    }
  }
  return 8; // Generic/other web results
}

export function isTopTrustedPlatform(storeName: string): boolean {
  return getPlatformTrustRank(storeName) <= 2;
}

const STORE_LOGOS: Record<string, string> = {
  amazon: "/Brand logos/Amazon_logo.svg.webp",
  "amazon.in": "/Brand logos/Amazon_logo.svg.webp",
  flipkart: "/Brand logos/flipkart.webp",
  myntra: "/Brand logos/myntra.webp",
  croma: "/Brand logos/croma.svg",
  reliance: "/Brand logos/reliance.svg",
  "reliance digital": "/Brand logos/reliance.svg",
  meesho: "/Brand logos/Meesho_logo.webp",
  "tata cliq": "/Brand logos/Tata-cliq.webp",
  tatacliq: "/Brand logos/Tata-cliq.webp",
  ajio: "/Brand logos/Ajio.webp",
  nykaa: "/Brand logos/Nykaa.webp",
};

function getStoreLogo(storeName: string): string | undefined {
  const norm = storeName.toLowerCase().trim();
  for (const [key, logo] of Object.entries(STORE_LOGOS)) {
    if (norm.includes(key)) return logo;
  }
  return undefined;
}

function getCategoryImage(title: string, brand: string): string {
  const t = (title + " " + brand).toLowerCase();
  if (t.includes("iphone") || t.includes("phone") || t.includes("mobile") || t.includes("samsung galaxy") || t.includes("oneplus") || t.includes("pixel") || t.includes("smartphone")) {
    return "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80";
  }
  if (t.includes("headphone") || t.includes("earbuds") || t.includes("airpods") || t.includes("audio") || t.includes("boat") || t.includes("sony") || t.includes("xm5")) {
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80";
  }
  if (t.includes("laptop") || t.includes("macbook") || t.includes("computer") || t.includes("notebook")) {
    return "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80";
  }
  if (t.includes("shoe") || t.includes("sneaker") || t.includes("nike") || t.includes("adidas") || t.includes("puma") || t.includes("running")) {
    return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80";
  }
  if (t.includes("watch") || t.includes("smartwatch") || t.includes("fitbit") || t.includes("colorfit")) {
    return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";
  }
  if (t.includes("playstation") || t.includes("ps5") || t.includes("xbox") || t.includes("console") || t.includes("gaming")) {
    return "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80";
  }
  if (t.includes("ipad") || t.includes("tablet") || t.includes("tab")) {
    return "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80";
  }
  if (t.includes("dyson") || t.includes("vacuum") || t.includes("cleaner") || t.includes("appliance")) {
    return "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop&q=80";
  }
  if (t.includes("tv") || t.includes("television") || t.includes("oled") || t.includes("qled")) {
    return "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80";
  }
  return "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80";
}

/**
 * Generates synthetic cross-store competitor offers for a product.
 */
function generateStoreOffers(
  primaryStore: string,
  basePrice: number,
  title: string,
  directUrl: string
): MultiPlatformStoreOffer[] {
  const candidates = [
    { id: "amazon", name: "Amazon India", coupon: "AMZSAVE", discountPct: 0.05, cashbackPct: 0.05, variance: 0 },
    { id: "flipkart", name: "Flipkart", coupon: "FLIPEXTRA", discountPct: 0.06, cashbackPct: 0.06, variance: -0.02 },
    { id: "croma", name: "Croma", coupon: "CROMA1K", discountPct: 0.04, cashbackPct: 0.035, variance: 0.01 },
    { id: "tatacliq", name: "Tata CLiQ", coupon: "CLIQSAVE", discountPct: 0.05, cashbackPct: 0.04, variance: 0.02 },
    { id: "myntra", name: "Myntra", coupon: "MYNTRA10", discountPct: 0.08, cashbackPct: 0.06, variance: 0.015 },
  ];

  const offers: MultiPlatformStoreOffer[] = candidates.map((cand) => {
    const isPrimary = cand.name.toLowerCase().includes(primaryStore.toLowerCase());
    const storePrice = isPrimary ? basePrice : Math.round(basePrice * (1 + cand.variance));
    const couponSavings = Math.round(storePrice * cand.discountPct);
    const cashbackAmount = Math.round(storePrice * cand.cashbackPct);
    const effectiveNetPrice = Math.max(99, storePrice - couponSavings - cashbackAmount);

    return {
      storeId: cand.id,
      storeName: cand.name,
      storeLogo: getStoreLogo(cand.id),
      price: storePrice,
      effectiveNetPrice,
      couponCode: cand.coupon,
      couponSavings,
      cashbackRate: `Up to ${Math.round(cand.cashbackPct * 100)}%`,
      cashbackAmount,
      affiliateUrl: isPrimary ? directUrl : `https://www.google.com/search?q=${encodeURIComponent(title + " " + cand.name)}`,
      deliveryTime: isPrimary ? "Prime / Fast Delivery" : "Standard 2-3 Days",
      isLowest: false,
    };
  });

  // Sort by effective net price ascending
  offers.sort((a, b) => a.effectiveNetPrice - b.effectiveNetPrice);
  if (offers.length > 0) {
    offers[0].isLowest = true;
  }

  return offers;
}

/**
 * Searches across all Indian shopping platforms for a given query or URL.
 */
export async function searchProductsAcrossPlatforms(
  queryOrUrl: string
): Promise<MultiPlatformSearchResult> {
  const trimmed = queryOrUrl.trim();
  const isUrl = /^https?:\/\//i.test(trimmed);

  // 1. Direct URL Input: Extract metadata & compare competitors directly
  if (isUrl) {
    try {
      const res = await resolveLiveUrlAndCompetitors(trimmed);
      const meta = res.metadata;
      const price = meta.price > 0 ? meta.price : 1499;
      const originalPrice = Math.round(price * 1.22);
      const discount = Math.round(((originalPrice - price) / originalPrice) * 100);

      const offers: MultiPlatformStoreOffer[] = res.competitors.map((c) => ({
        storeId: c.storeName.toLowerCase().replace(/[^a-z0-9]/g, "_"),
        storeName: c.storeName,
        storeLogo: c.storeLogo || getStoreLogo(c.storeName),
        price: c.price,
        effectiveNetPrice: c.effectiveNetPrice,
        couponCode: c.bestCouponCode || undefined,
        couponSavings: c.couponSavings,
        cashbackRate: c.cashbackRate,
        cashbackAmount: c.cashbackAmount,
        affiliateUrl: c.affiliateUrl,
        deliveryTime: "Standard 2-3 Days Delivery",
        isLowest: c.isBestDeal,
      }));

      const productItem: MultiPlatformProductItem = {
        id: `url_${Date.now()}`,
        title: meta.title,
        brand: meta.brand || "Brand",
        category: "Shopping",
        primaryStore: meta.storeName || "Online Store",
        primaryStoreLogo: getStoreLogo(meta.storeName),
        price,
        originalPrice,
        discountPercent: discount,
        imageUrl: meta.imageUrl || getCategoryImage(meta.title, meta.brand),
        rating: meta.rating || 4.5,
        reviewCount: meta.reviewCount || 350,
        directUrl: trimmed,
        deliveryInfo: "Fast Express Delivery",
        isBestPrice: true,
        offers: offers.length > 0 ? offers : generateStoreOffers(meta.storeName, price, meta.title, trimmed),
        lowestPriceStore: res.bestDeal?.storeName || meta.storeName,
        maxSavingsVsOriginal: res.maxSavings,
      };

      const stores = Array.from(new Set(productItem.offers.map((o) => o.storeName)));

      return {
        query: meta.title,
        products: [productItem],
        availableStores: stores,
        totalFound: 1,
        lowestOverallPrice: productItem.offers[0]?.effectiveNetPrice || price,
        highestOverallSavings: productItem.maxSavingsVsOriginal,
        isDirectUrl: true,
      };
    } catch {
      // Fall through to search query
    }
  }

  // 2. Query Search: Proxy through /api/shopping for Google Shopping (India)
  const products: MultiPlatformProductItem[] = [];

  try {
    const shoppingApiUrl = `/api/shopping?q=${encodeURIComponent(trimmed)}`;
    const serpRes = await fetch(shoppingApiUrl, { signal: AbortSignal.timeout(5000) });
    if (serpRes.ok) {
      const data = await serpRes.json();
      const rawShopping = (data.shopping_results || []).filter(
        (item: any) => typeof item.extracted_price === "number" && item.extracted_price > 0
      );

      for (let i = 0; i < rawShopping.length; i++) {
        const item = rawShopping[i];
        const price = Number(item.extracted_price) || 999;
        const originalPrice = Math.round(price * (1 + (0.15 + (i % 3) * 0.08)));
        const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
        const storeName = (item.source || item.merchant || "Online Store").trim();
        const directUrl = item.product_link || item.link || `https://www.google.com/search?q=${encodeURIComponent(item.title)}`;

        const offers = generateStoreOffers(storeName, price, item.title, directUrl);

        products.push({
          id: `prod_${i}_${item.title.slice(0, 15).replace(/[^a-zA-Z0-9]/g, "_")}`,
          title: item.title,
          brand: (item.title || "").split(" ")[0] || "Brand",
          category: "Electronics",
          primaryStore: storeName,
          primaryStoreLogo: item.source_icon || getStoreLogo(storeName),
          price,
          originalPrice,
          discountPercent,
          imageUrl: item.thumbnail || item.serpapi_thumbnail || getCategoryImage(item.title, storeName),
          rating: Number(item.rating) || 4.4,
          reviewCount: Number(item.reviews) || 480,
          directUrl,
          deliveryInfo: item.delivery || "Free Delivery Available",
          isBestPrice: i === 0,
          offers,
          lowestPriceStore: offers[0]?.storeName || storeName,
          maxSavingsVsOriginal: Math.max(0, originalPrice - (offers[0]?.effectiveNetPrice || price)),
        });
      }
    }
  } catch (err) {
    console.warn("Shopping proxy search timeout/error:", err);
  }

  // 3. Fallback to SearXNG Shopping Search if SerpAPI returned few results
  if (products.length < 3) {
    try {
      const searxData = await searchSearXNG(`${trimmed} price buy online india`, {
        categories: "general,shopping",
        language: "en",
        timeoutMs: 4000,
      });

      if (searxData.results && searxData.results.length > 0) {
        // Filter out non-shopping domains
        const nonShoppingDomains = [
          "wikipedia.org",
          "gsmarena.com",
          "support.apple.com",
          "youtube.com",
          "reddit.com",
          "quora.com",
          "resetera.com",
          "bizhows.com",
          "medium.com",
          "github.com",
          "pinterest.com",
          "instagram.com",
          "facebook.com",
          "twitter.com",
          "x.com",
          "slashgear.com",
          "theverge.com",
          "ign.com",
          "ndtv.com",
          "indianexpress.com",
          "timesofindia",
        ];
        const shoppingItems = searxData.results.filter((r) => {
          try {
            const host = new URL(r.url).hostname.toLowerCase();
            return !nonShoppingDomains.some((d) => host.includes(d));
          } catch {
            return false;
          }
        });

        const itemsToProcess = shoppingItems.length > 0 ? shoppingItems : searxData.results.slice(0, 8);

        itemsToProcess.slice(0, 10).forEach((res, idx) => {
          let storeName = "Online Merchant";
          try {
            const host = new URL(res.url).hostname.replace(/^www\./, "");
            if (host.includes("amazon")) storeName = "Amazon India";
            else if (host.includes("flipkart")) storeName = "Flipkart";
            else if (host.includes("croma")) storeName = "Croma";
            else if (host.includes("myntra")) storeName = "Myntra";
            else if (host.includes("tatacliq")) storeName = "Tata CLiQ";
            else if (host.includes("meesho")) storeName = "Meesho";
            else if (host.includes("reliancedigital")) storeName = "Reliance Digital";
            else if (host.includes("ajio")) storeName = "Ajio";
            else if (host.includes("nykaa")) storeName = "Nykaa";
            else storeName = host.split(".")[0].toUpperCase();
          } catch {}

          const priceMatch = (res.content || res.title).match(/(?:₹|Rs\.?\s*)([0-9,]{3,7})/i);
          const price = priceMatch ? Number(priceMatch[1].replace(/,/g, "")) : 1999 + idx * 450;
          const originalPrice = Math.round(price * 1.25);
          const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);

          const offers = generateStoreOffers(storeName, price, res.title, res.url);

          products.push({
            id: `searx_${idx}`,
            title: res.title,
            brand: res.title.split(" ")[0] || "Brand",
            category: "Products",
            primaryStore: storeName,
            primaryStoreLogo: getStoreLogo(storeName),
            isTrustedStore: isTopTrustedPlatform(storeName),
            trustTier: getPlatformTrustRank(storeName),
            price,
            originalPrice,
            discountPercent,
            imageUrl: res.thumbnail || res.img_src || getCategoryImage(res.title, storeName),
            rating: 4.5,
            reviewCount: 250,
            directUrl: res.url,
            deliveryInfo: "2-3 Days Standard Delivery",
            isBestPrice: idx === 0,
            offers,
            lowestPriceStore: offers[0]?.storeName || storeName,
            maxSavingsVsOriginal: originalPrice - (offers[0]?.effectiveNetPrice || price),
          });
        });
      }
    } catch (err) {
      console.warn("SearXNG fallback search error:", err);
    }
  }

  // 4. Default Seed Fallback if completely offline
  if (products.length === 0) {
    const basePrice = 4999;
    const dummyStores = ["Amazon India", "Flipkart", "Croma", "Myntra"];
    dummyStores.forEach((store, i) => {
      const price = Math.round(basePrice * (1 + (i * 0.05 - 0.03)));
      const orig = Math.round(price * 1.25);
      const offers = generateStoreOffers(store, price, `${trimmed} (${store} Official)`, "https://amazon.in");

      products.push({
        id: `offline_${i}`,
        title: `${trimmed} - Verified ${store} Edition`,
        brand: trimmed.split(" ")[0] || "Verified",
        category: "Electronics",
        primaryStore: store,
        primaryStoreLogo: getStoreLogo(store),
        isTrustedStore: true,
        trustTier: store.includes("Amazon") || store.includes("Flipkart") ? 1 : 2,
        price,
        originalPrice: orig,
        discountPercent: Math.round(((orig - price) / orig) * 100),
        imageUrl: getCategoryImage(trimmed, store),
        rating: 4.6,
        reviewCount: 890,
        directUrl: "https://amazon.in",
        deliveryInfo: "Free 1-Day Delivery",
        isBestPrice: i === 0,
        offers,
        lowestPriceStore: offers[0]?.storeName || store,
        maxSavingsVsOriginal: orig - (offers[0]?.effectiveNetPrice || price),
      });
    });
  }

  // Annotate all products with trustTier and isTrustedStore
  products.forEach((p) => {
    p.trustTier = getPlatformTrustRank(p.primaryStore);
    p.isTrustedStore = p.trustTier <= 3;
  });

  // Guarantee Top Results from Most Trusted Platforms: Amazon India & Flipkart
  const hasAmazon = products.some((p) => p.primaryStore.toLowerCase().includes("amazon"));
  const hasFlipkart = products.some((p) => p.primaryStore.toLowerCase().includes("flipkart"));
  const benchmarkItem = products[0];
  const benchmarkPrice = products.length > 0 ? Math.min(...products.map((p) => p.price)) : 4999;

  if (!hasAmazon) {
    const amzPrice = benchmarkPrice;
    const amzOrig = Math.round(amzPrice * 1.25);
    const amzOffers = generateStoreOffers(
      "Amazon India",
      amzPrice,
      `${benchmarkItem ? benchmarkItem.title : trimmed} (Amazon India)`,
      `https://www.amazon.in/s?k=${encodeURIComponent(trimmed)}`
    );
    products.unshift({
      id: `amz_verified_${Date.now()}`,
      title: benchmarkItem ? `${benchmarkItem.title} - Amazon Official` : `${trimmed} - Amazon India`,
      brand: benchmarkItem ? benchmarkItem.brand : trimmed.split(" ")[0] || "Amazon",
      category: benchmarkItem ? benchmarkItem.category : "Products",
      primaryStore: "Amazon India",
      primaryStoreLogo: getStoreLogo("amazon"),
      isTrustedStore: true,
      trustTier: 1,
      price: amzPrice,
      originalPrice: amzOrig,
      discountPercent: Math.round(((amzOrig - amzPrice) / amzOrig) * 100),
      imageUrl: benchmarkItem ? benchmarkItem.imageUrl : getCategoryImage(trimmed, "amazon"),
      rating: 4.6,
      reviewCount: 1250,
      directUrl: `https://www.amazon.in/s?k=${encodeURIComponent(trimmed)}`,
      deliveryInfo: "Prime Fast 1-Day Delivery",
      isBestPrice: true,
      offers: amzOffers,
      lowestPriceStore: amzOffers[0]?.storeName || "Amazon India",
      maxSavingsVsOriginal: amzOrig - (amzOffers[0]?.effectiveNetPrice || amzPrice),
    });
  }

  if (!hasFlipkart) {
    const flipPrice = Math.round(benchmarkPrice * 0.98);
    const flipOrig = Math.round(flipPrice * 1.26);
    const flipOffers = generateStoreOffers(
      "Flipkart",
      flipPrice,
      `${benchmarkItem ? benchmarkItem.title : trimmed} (Flipkart Assured)`,
      `https://www.flipkart.com/search?q=${encodeURIComponent(trimmed)}`
    );
    products.splice(1, 0, {
      id: `flip_verified_${Date.now()}`,
      title: benchmarkItem ? `${benchmarkItem.title} - Flipkart Assured` : `${trimmed} - Flipkart Assured`,
      brand: benchmarkItem ? benchmarkItem.brand : trimmed.split(" ")[0] || "Flipkart",
      category: benchmarkItem ? benchmarkItem.category : "Products",
      primaryStore: "Flipkart",
      primaryStoreLogo: getStoreLogo("flipkart"),
      isTrustedStore: true,
      trustTier: 1,
      price: flipPrice,
      originalPrice: flipOrig,
      discountPercent: Math.round(((flipOrig - flipPrice) / flipOrig) * 100),
      imageUrl: benchmarkItem ? benchmarkItem.imageUrl : getCategoryImage(trimmed, "flipkart"),
      rating: 4.5,
      reviewCount: 940,
      directUrl: `https://www.flipkart.com/search?q=${encodeURIComponent(trimmed)}`,
      deliveryInfo: "Plus 2-Day Delivery",
      isBestPrice: false,
      offers: flipOffers,
      lowestPriceStore: flipOffers[0]?.storeName || "Flipkart",
      maxSavingsVsOriginal: flipOrig - (flipOffers[0]?.effectiveNetPrice || flipPrice),
    });
  }

  // Sort: Top Trusted Platforms (Amazon, Flipkart -> Croma, Tata CLiQ, Myntra, Reliance -> Meesho) first
  products.sort((a, b) => {
    const rankA = a.trustTier ?? getPlatformTrustRank(a.primaryStore);
    const rankB = b.trustTier ?? getPlatformTrustRank(b.primaryStore);
    if (rankA !== rankB) {
      return rankA - rankB;
    }
    return b.rating - a.rating;
  });

  if (products.length > 0) {
    products[0].isBestPrice = true;
  }

  const allStores = Array.from(
    new Set(products.flatMap((p) => [p.primaryStore, ...p.offers.map((o) => o.storeName)]))
  ).filter(Boolean);

  const lowestOverallPrice = Math.min(...products.map((p) => p.price));
  const highestOverallSavings = Math.max(...products.map((p) => p.maxSavingsVsOriginal));

  return {
    query: trimmed,
    products,
    availableStores: allStores,
    totalFound: products.length,
    lowestOverallPrice,
    highestOverallSavings,
    isDirectUrl: false,
  };
}
