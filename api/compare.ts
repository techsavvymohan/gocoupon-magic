/**
 * @file api/compare.ts
 * @description Vercel Serverless Function for Live Concurrent Multi-Store Price Comparison & Daily Snapshot Storage.
 *
 * Capabilities:
 * - CORS preflight (OPTIONS) support for cross-origin browser extension & web queries
 * - Direct lookup by canonical catalog productId (prod_...)
 * - Live URL resolution via Cheerio for pasted Flipkart, Amazon, and Myntra links
 * - Concurrent search across Amazon, Flipkart, and Cuelinks networks via Promise.allSettled()
 * - Real-time coupon & cashback calculation
 * - Daily price tracking snapshot recording in Supabase / Upstash Redis
 *
 * Endpoint: GET /api/compare?productId=... OR ?q=... OR ?url=...
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { resolveProduct } from "@/lib/services/product-resolver";
import { compareProductOffers, type ProductComparisonSummary } from "@/lib/services/comparison-engine";
import { searchAllStoresConcurrent } from "@/lib/services/multi-store-connectors";
import { resolveLiveUrlAndCompetitors } from "@/lib/services/url-metadata-extractor";
import { recordPriceSnapshot } from "@/lib/services/price-tracking-storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Handle CORS Preflight
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const productId = (req.query.productId as string) || (req.query.id as string);
  const rawQuery = (req.query.url as string) || (req.query.q as string);
  const isUrl = /^https?:\/\//i.test((rawQuery || "").trim());

  // 2. Try resolving locally from canonical seed catalog first
  let targetProductId = productId;

  if (!targetProductId && rawQuery && !isUrl) {
    const resolved = resolveProduct(rawQuery);
    if (resolved) {
      targetProductId = resolved.product.id;
    }
  }

  if (targetProductId && targetProductId.startsWith("prod_")) {
    const comparison = compareProductOffers(targetProductId);
    if (comparison) {
      // Record daily snapshot for price history
      if (comparison.bestDeal) {
        recordPriceSnapshot(
          targetProductId,
          targetProductId,
          comparison.bestDeal.storeName,
          comparison.bestDeal.itemPrice,
          comparison.bestDeal.effectiveNetPrice,
          comparison.bestDeal.bestCouponCode
        ).catch(() => {});
      }

      res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
      return res.status(200).json(comparison);
    }
  }

  // 3. Handle Live Pasted Product URL (Cheerio + SERP API)
  if (isUrl) {
    try {
      const urlResolution = await resolveLiveUrlAndCompetitors(rawQuery.trim());
      if (urlResolution && urlResolution.competitors.length > 0) {
        const canonicalId = `url_${encodeURIComponent(urlResolution.metadata.title).slice(0, 30)}`;

        const formattedRows = urlResolution.competitors.map((c, idx) => ({
          offer: {
            id: `url_offer_${idx}`,
            storeId: c.storeName.toLowerCase().replace(/[^a-z0-9]/g, "_"),
            storeName: c.storeName,
            storeLogo: c.storeLogo || undefined,
            productId: canonicalId,
            itemPrice: c.price,
            currency: "INR",
            inStock: true,
            affiliateUrl: c.affiliateUrl,
            shippingFee: 0,
            deliveryTime: "Free Standard Delivery",
            badgeText: c.isBestDeal ? "BEST DEAL" : undefined,
          },
          storeName: c.storeName,
          storeLogo: c.storeLogo || undefined,
          cashbackRate: c.cashbackRate,
          cashbackAmount: c.cashbackAmount,
          bestCouponCode: c.bestCouponCode || undefined,
          couponSavings: c.couponSavings,
          shippingFee: 0,
          itemPrice: c.price,
          effectiveNetPrice: c.effectiveNetPrice,
          isBestDeal: c.isBestDeal,
          savingsVsWorst: c.savingsVsOriginal,
          deliveryEstimate: "Free Standard Delivery",
          affiliateUrl: c.affiliateUrl,
        }));

        const responsePayload: ProductComparisonSummary = {
          productId: canonicalId,
          rows: formattedRows,
          bestDeal: formattedRows[0],
          maxSavings: urlResolution.maxSavings,
          storesComparedCount: formattedRows.length,
        };

        // Record price snapshot
        if (formattedRows[0]) {
          recordPriceSnapshot(
            canonicalId,
            urlResolution.metadata.title,
            formattedRows[0].storeName,
            formattedRows[0].itemPrice,
            formattedRows[0].effectiveNetPrice,
            formattedRows[0].bestCouponCode
          ).catch(() => {});
        }

        res.setHeader("Cache-Control", "public, s-maxage=180, stale-while-revalidate=360");
        return res.status(200).json(responsePayload);
      }
    } catch (err) {
      console.warn("Live URL resolution failed in compare.ts, falling back to search:", err);
    }
  }

  // 4. Concurrent Multi-Store Live Search (searchAmazon, searchFlipkart, searchCuelinks)
  const searchQuery = rawQuery || productId || "Sony WH-1000XM5";

  try {
    const { offers, bestDeal, maxSavings, totalStoresFound } = await searchAllStoresConcurrent(searchQuery);

    if (totalStoresFound === 0) {
      const fallbackComp = compareProductOffers("prod_sony_wh1000xm5");
      return res.status(200).json(fallbackComp);
    }

    const canonicalId = `live_${encodeURIComponent(searchQuery).slice(0, 30)}`;
    const productTitle = offers[0]?.title || searchQuery;

    // Record daily price snapshot into Supabase / Upstash Redis for 90-day tracker
    if (bestDeal) {
      recordPriceSnapshot(
        canonicalId,
        productTitle,
        bestDeal.storeName,
        bestDeal.itemPrice,
        bestDeal.effectiveNetPrice,
        bestDeal.couponCode
      ).catch(() => {});
    }

    const formattedRows = offers.map((offer, idx) => ({
      offer: {
        id: `offer_${idx}`,
        storeId: offer.storeId,
        storeName: offer.storeName,
        storeLogo: offer.storeLogo,
        productId: canonicalId,
        itemPrice: offer.itemPrice,
        currency: "INR",
        inStock: offer.inStock,
        affiliateUrl: offer.affiliateUrl,
        shippingFee: 0,
        deliveryTime: offer.deliveryEstimate,
        badgeText: offer.effectiveNetPrice === bestDeal?.effectiveNetPrice ? "BEST DEAL" : undefined,
      },
      storeName: offer.storeName,
      storeLogo: offer.storeLogo,
      cashbackRate: offer.cashbackRate,
      cashbackAmount: offer.cashbackAmount,
      bestCouponCode: offer.couponCode || undefined,
      couponSavings: offer.couponSavings,
      shippingFee: 0,
      itemPrice: offer.itemPrice,
      effectiveNetPrice: offer.effectiveNetPrice,
      isBestDeal: offer.effectiveNetPrice === bestDeal?.effectiveNetPrice,
      savingsVsWorst: Math.max(
        0,
        Math.max(...offers.map((o) => o.itemPrice)) - offer.effectiveNetPrice
      ),
      deliveryEstimate: offer.deliveryEstimate,
      affiliateUrl: offer.affiliateUrl,
    }));

    const responsePayload: ProductComparisonSummary = {
      productId: canonicalId,
      rows: formattedRows,
      bestDeal: formattedRows[0],
      maxSavings,
      storesComparedCount: formattedRows.length,
    };

    res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");
    return res.status(200).json(responsePayload);
  } catch (err) {
    console.error("Multi-store search error in compare.ts:", err);
    const fallbackComp = compareProductOffers("prod_sony_wh1000xm5");
    return res.status(200).json(fallbackComp);
  }
}
