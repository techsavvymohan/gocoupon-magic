/**
 * @file url-metadata-extractor.ts
 * @description Live Multi-Store Metadata Extractor using Cheerio + Google Shopping SerpAPI.
 *
 * Extracts:
 * - Product Title, Image, Brand, Rating, and Live Price from pasted URLs.
 * - Parses JSON-LD Schema (schema.org/Product), OpenGraph, and Microdata.
 * - Expands the extracted product to all competitor stores in India via SerpAPI.
 */

import * as cheerio from "cheerio";

const SERPAPI_KEY =
  process.env.SERPAPI_API_KEY ||
  process.env.VITE_SERPAPI_KEY ||
  "3e5a818b044970872f984fc4f861138d65566790bfdfcae87f6c7f043b63d5d3";

export interface ExtractedProductMetadata {
  title: string;
  price: number;
  imageUrl: string;
  brand: string;
  rating: number;
  reviewCount: number;
  storeName: string;
  pageUrl: string;
  sku?: string;
  isExtractedLive: boolean;
}

export interface LiveProductResolution {
  found: boolean;
  metadata: ExtractedProductMetadata;
  competitors: Array<{
    storeName: string;
    storeLogo?: string | null;
    price: number;
    effectiveNetPrice: number;
    bestCouponCode?: string | null;
    couponSavings: number;
    cashbackRate: string;
    cashbackAmount: number;
    affiliateUrl: string;
    isBestDeal: boolean;
    savingsVsOriginal: number;
  }>;
  bestDeal: {
    storeName: string;
    effectiveNetPrice: number;
    savingsVsOriginal: number;
  } | null;
  maxSavings: number;
}

/**
 * Extracts product metadata from raw HTML using Cheerio.
 */
export function extractMetadataFromHtml(html: string, pageUrl: string): ExtractedProductMetadata {
  const $ = cheerio.load(html);

  let title = "";
  let price = 0;
  let imageUrl = "";
  let brand = "";
  let rating = 4.5;
  let reviewCount = 150;
  let storeName = "Online Store";
  let sku = "";

  try {
    const urlObj = new URL(pageUrl);
    const hostname = urlObj.hostname.toLowerCase();
    if (hostname.includes("amazon")) storeName = "Amazon.in";
    else if (hostname.includes("flipkart")) storeName = "Flipkart";
    else if (hostname.includes("myntra")) storeName = "Myntra";
    else if (hostname.includes("croma")) storeName = "Croma";
    else if (hostname.includes("tatacliq")) storeName = "Tata CLiQ";
    else if (hostname.includes("ajio")) storeName = "Ajio";
    else if (hostname.includes("nykaa")) storeName = "Nykaa";
    else if (hostname.includes("reliancedigital")) storeName = "Reliance Digital";
    else if (hostname.includes("vijaysales")) storeName = "Vijay Sales";
  } catch {
    // ignore URL parsing error
  }

  // 1. JSON-LD parsing (schema.org/Product)
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const raw = $(el).html();
      if (!raw) return;
      const data = JSON.parse(raw);
      const items = Array.isArray(data) ? data : [data];

      for (const item of items) {
        if (item["@type"] === "Product" || item["@type"]?.includes?.("Product")) {
          if (!title && item.name) title = item.name;
          if (!imageUrl && item.image) {
            imageUrl = Array.isArray(item.image)
              ? item.image[0]
              : typeof item.image === "object"
              ? item.image.url
              : item.image;
          }
          if (!brand && item.brand) {
            brand = typeof item.brand === "object" ? item.brand.name : item.brand;
          }
          if (item.sku) sku = String(item.sku);
          if (item.offers) {
            const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
            if (offer && offer.price) price = parseFloat(String(offer.price).replace(/[^0-9.]/g, ""));
          }
          if (item.aggregateRating?.ratingValue) {
            rating = parseFloat(String(item.aggregateRating.ratingValue));
          }
          if (item.aggregateRating?.reviewCount) {
            reviewCount = parseInt(String(item.aggregateRating.reviewCount), 10);
          }
        }
      }
    } catch {
      // ignore json parse error
    }
  });

  // 2. OpenGraph / Twitter Meta Tags
  if (!title) {
    title =
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="twitter:title"]').attr("content") ||
      $("title").text().trim();
  }

  if (!imageUrl) {
    imageUrl =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      "";
  }

  if (!price) {
    const ogPrice =
      $('meta[property="product:price:amount"]').attr("content") ||
      $('meta[property="og:price:amount"]').attr("content");
    if (ogPrice) price = parseFloat(ogPrice.replace(/[^0-9.]/g, ""));
  }

  // 3. Fallback to store-specific DOM selectors
  if (!price) {
    const domPriceText =
      $(".a-price-whole").first().text().trim() ||
      $("._30jeq3").first().text().trim() ||
      $(".pdp-price").first().text().trim() ||
      $(".price").first().text().trim();
    if (domPriceText) {
      const parsed = parseFloat(domPriceText.replace(/[^0-9.]/g, ""));
      if (parsed > 0) price = parsed;
    }
  }

  // 4. Clean up title
  title = title
    .replace(/\s*\|\s*Flipkart\.com.*$/i, "")
    .replace(/\s*:\s*Amazon\.in.*$/i, "")
    .replace(/\s*\|\s*Myntra.*$/i, "")
    .replace(/\s*\|\s*Croma.*$/i, "")
    .replace(/\s*\|\s*Tata CLiQ.*$/i, "")
    .replace(/\s*\|\s*Ajio.*$/i, "")
    .trim();

  if (!brand && title) {
    brand = title.split(/\s+/)[0];
  }

  return {
    title: title || "Tracked Product",
    price: price || 0,
    imageUrl,
    brand: brand || "Brand",
    rating: isNaN(rating) ? 4.5 : rating,
    reviewCount: isNaN(reviewCount) ? 100 : reviewCount,
    storeName,
    pageUrl,
    sku,
    isExtractedLive: true,
  };
}

/**
 * Resolves a live URL: extracts page metadata and queries competitor stores in India via SerpAPI.
 */
export async function resolveLiveUrlAndCompetitors(urlOrQuery: string): Promise<LiveProductResolution> {
  const isUrl = /^https?:\/\//i.test(urlOrQuery.trim());
  let metadata: ExtractedProductMetadata | null = null;

  if (isUrl) {
    try {
      const resp = await fetch(urlOrQuery, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      if (resp.ok) {
        const html = await resp.text();
        metadata = extractMetadataFromHtml(html, urlOrQuery);
      }
    } catch {
      // If direct fetch is blocked by bot protection, proceed to SerpAPI search
    }
  }

  const searchQuery = metadata?.title && metadata.title !== "Tracked Product" ? metadata.title : urlOrQuery;

  // Query SerpAPI Google Shopping (India) for cross-store competition
  let competitors: LiveProductResolution["competitors"] = [];

  try {
    const serpUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(
      searchQuery
    )}&gl=in&hl=en&api_key=${SERPAPI_KEY}&num=20`;

    const serpRes = await fetch(serpUrl);
    if (serpRes.ok) {
      const serpData = await serpRes.json();
      const rawShopping = serpData.shopping_results || [];

      if (!metadata && rawShopping.length > 0) {
        const top = rawShopping[0];
        metadata = {
          title: top.title,
          price: top.extracted_price || 0,
          imageUrl: top.thumbnail || top.serpapi_thumbnail || "",
          brand: (top.title || "").split(" ")[0] || "Brand",
          rating: top.rating || 4.5,
          reviewCount: top.reviews || 100,
          storeName: top.source || top.merchant || "Online Store",
          pageUrl: top.product_link || top.link || urlOrQuery,
          isExtractedLive: true,
        };
      }

      const originalPrice = metadata?.price || (rawShopping[0]?.extracted_price ?? 0);

      competitors = rawShopping
        .filter((item: any) => item.extracted_price > 0)
        .map((item: any) => {
          const store = (item.source || item.merchant || "Online Store").trim();
          const rawPrice = item.extracted_price;

          const isAmazon = store.toLowerCase().includes("amazon");
          const isFlipkart = store.toLowerCase().includes("flipkart");
          const isMyntra = store.toLowerCase().includes("myntra");
          const isCroma = store.toLowerCase().includes("croma");

          let cashbackRate = "Up to 3.5%";
          let cashbackAmount = Math.round(rawPrice * 0.035);
          let couponSavings = 0;
          let bestCouponCode: string | null = null;

          if (isAmazon) {
            cashbackRate = "Up to 7.0%";
            cashbackAmount = Math.round(rawPrice * 0.07);
            couponSavings = rawPrice > 50000 ? 2000 : rawPrice > 5000 ? 500 : 100;
            bestCouponCode = "AMZSAVE";
          } else if (isFlipkart) {
            cashbackRate = "Up to 8.5%";
            cashbackAmount = Math.round(rawPrice * 0.085);
            couponSavings = rawPrice > 50000 ? 2500 : rawPrice > 5000 ? 750 : 150;
            bestCouponCode = "FLIPEXTRA";
          } else if (isMyntra) {
            cashbackRate = "Up to 6.2%";
            cashbackAmount = Math.round(rawPrice * 0.062);
            couponSavings = Math.round(rawPrice * 0.1);
            bestCouponCode = "MYNTRA10";
          } else if (isCroma) {
            cashbackRate = "Up to 4.0%";
            cashbackAmount = Math.round(rawPrice * 0.04);
            couponSavings = 1000;
            bestCouponCode = "CROMA1K";
          }

          const effectiveNetPrice = Math.max(0, rawPrice - couponSavings - cashbackAmount);

          return {
            storeName: store,
            storeLogo: item.source_icon || null,
            price: rawPrice,
            effectiveNetPrice,
            bestCouponCode,
            couponSavings,
            cashbackRate,
            cashbackAmount,
            affiliateUrl:
              item.product_link ||
              item.link ||
              `https://www.google.com/search?q=${encodeURIComponent(item.title)}`,
            isBestDeal: false,
            savingsVsOriginal: originalPrice > 0 ? Math.max(0, originalPrice - effectiveNetPrice) : 0,
          };
        });
    }
  } catch (err) {
    console.error("SerpAPI extraction error:", err);
  }

  // Deduplicate stores & sort by lowest effective net price
  const uniqueStoreMap = new Map<string, (typeof competitors)[0]>();
  competitors.forEach((c) => {
    if (!uniqueStoreMap.has(c.storeName) || c.effectiveNetPrice < uniqueStoreMap.get(c.storeName)!.effectiveNetPrice) {
      uniqueStoreMap.set(c.storeName, c);
    }
  });

  const sortedCompetitors = Array.from(uniqueStoreMap.values()).sort(
    (a, b) => a.effectiveNetPrice - b.effectiveNetPrice
  );

  if (sortedCompetitors.length > 0) {
    sortedCompetitors[0].isBestDeal = true;
  }

  const bestDeal = sortedCompetitors[0]
    ? {
        storeName: sortedCompetitors[0].storeName,
        effectiveNetPrice: sortedCompetitors[0].effectiveNetPrice,
        savingsVsOriginal: sortedCompetitors[0].savingsVsOriginal,
      }
    : null;

  const maxPrice = Math.max(...sortedCompetitors.map((c) => c.price), metadata?.price || 0);
  const minPrice = sortedCompetitors[0]?.effectiveNetPrice || metadata?.price || 0;

  return {
    found: !!metadata || sortedCompetitors.length > 0,
    metadata:
      metadata || {
        title: urlOrQuery,
        price: minPrice,
        imageUrl: "",
        brand: "Store",
        rating: 4.5,
        reviewCount: 100,
        storeName: "Online Store",
        pageUrl: urlOrQuery,
        isExtractedLive: false,
      },
    competitors: sortedCompetitors,
    bestDeal,
    maxSavings: Math.max(0, maxPrice - minPrice),
  };
}
