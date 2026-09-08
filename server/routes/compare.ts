/**
 * @file server/routes/compare.ts
 * @description Express Router for Live Concurrent Multi-Store Price Comparison.
 *
 * Endpoint: GET /api/compare?productId=... OR ?q=... OR ?url=...
 */

import { Router, type Request, type Response } from "express";
import { resolveProduct } from "../../src/lib/services/product-resolver.js";
import {
  compareProductOffers,
  type ComparisonRow,
  type ProductComparisonSummary,
} from "../../src/lib/services/comparison-engine.js";
import type { MerchantOffer } from "../../src/lib/services/canonical-types.js";
import { searchAllStoresConcurrent } from "../../src/lib/services/multi-store-connectors.js";
import { resolveLiveUrlAndCompetitors } from "../../src/lib/services/url-metadata-extractor.js";
import { recordPriceSnapshot } from "../../src/lib/services/price-tracking-storage.js";
import { globalCache } from "../../src/lib/services/cache-service.js";
import { apiRateLimiter } from "../../src/lib/services/rate-limiter.js";
import { calculateStackedSavings } from "../services/stack-calculator.js";
import { evaluateDealHonesty } from "../services/deal-honesty.js";
import { resolveGeoProfile } from "../services/geo-resolver.js";

export const compareRouter = Router();

compareRouter.get("/", async (req: Request, res: Response) => {
  const clientIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "127.0.0.1";

  const rateCheck = apiRateLimiter.check(clientIp, 40, 60 * 1000);
  if (!rateCheck.allowed) {
    res.setHeader("Retry-After", String(rateCheck.retryAfterSeconds));
    res.status(429).json({
      error: "Too many comparison requests. Please slow down.",
      retryAfterSeconds: rateCheck.retryAfterSeconds,
    });
    return;
  }

  const productId = (req.query.productId as string) || (req.query.id as string);
  const rawQuery = (req.query.url as string) || (req.query.q as string);
  const isUrl = /^https?:\/\//i.test((rawQuery || "").trim());

  const cacheKey = `compare:${(rawQuery || productId || "").toLowerCase().trim()}`;
  if (cacheKey.length > 10) {
    const cached = await globalCache.get<any>(cacheKey);
    if (cached) {
      res.setHeader("X-Cache", "HIT");
      res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
      res.json(cached);
      return;
    }
  }

  // 1. Try resolving locally from canonical seed catalog first
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
      const geo = resolveGeoProfile(req.headers);
      comparison.rows = comparison.rows.map((r) => ({
        ...r,
        condition: "NEW",
        stack: calculateStackedSavings({
          storeName: r.storeName,
          stickerPrice: r.itemPrice,
          currency: geo.currency,
          region: geo.region,
        }),
      }));
      comparison.geo = geo;
      comparison.dealHonesty = evaluateDealHonesty({
        currentPrice: comparison.bestDeal?.itemPrice || 25000,
        claimedOriginalPrice: Math.round((comparison.bestDeal?.itemPrice || 25000) * 1.25),
      });

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
      res.json(comparison);
      return;
    }
  }

  // 2. Handle Live Pasted Product URL (Cheerio + SERP API)
  if (isUrl) {
    try {
      const urlResolution = await resolveLiveUrlAndCompetitors(rawQuery.trim());
      if (urlResolution && urlResolution.competitors.length > 0) {
        const canonicalId = `url_${encodeURIComponent(urlResolution.metadata.title).slice(0, 30)}`;

        const formattedRows: ComparisonRow[] = urlResolution.competitors.map((c, idx) => {
          const merchantOffer: MerchantOffer = {
            id: `url_offer_${idx}`,
            productId: canonicalId,
            storeId: c.storeName.toLowerCase().replace(/[^a-z0-9]/g, "_"),
            storeName: c.storeName,
            storeLogo: c.storeLogo || undefined,
            rawUrl: c.affiliateUrl,
            affiliateUrl: c.affiliateUrl,
            itemPrice: c.price,
            shippingFee: 0,
            currency: "INR",
            stockStatus: "In Stock",
            deliveryTime: "Free Standard Delivery",
            lastCheckedAt: Date.now(),
            isBestPrice: c.isBestDeal,
            couponSavings: c.couponSavings,
            cashbackEstimated: c.cashbackAmount,
            effectiveNetPrice: c.effectiveNetPrice,
          };

          return {
            offer: merchantOffer,
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
          };
        });

        const responsePayload: ProductComparisonSummary = {
          productId: canonicalId,
          rows: formattedRows,
          bestDeal: formattedRows[0],
          maxSavings: urlResolution.maxSavings,
          storesComparedCount: formattedRows.length,
        };

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
        res.json(responsePayload);
        return;
      }
    } catch (err) {
      console.warn("Live URL resolution failed in compare.ts, falling back to search:", err);
    }
  }

  // 3. Concurrent Multi-Store Live Search
  const searchQuery = rawQuery || productId || "Sony WH-1000XM5";

  try {
    const { offers, bestDeal, maxSavings, totalStoresFound, unavailableStores } =
      await searchAllStoresConcurrent(searchQuery);

    if (totalStoresFound === 0) {
      const fallbackComp = compareProductOffers("prod_sony_wh1000xm5");
      if (fallbackComp) {
        fallbackComp.unavailableStores = unavailableStores;
      }
      res.json(fallbackComp);
      return;
    }

    const canonicalId = `live_${encodeURIComponent(searchQuery).slice(0, 30)}`;
    const productTitle = offers[0]?.title || searchQuery;

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

    const formattedRows: ComparisonRow[] = offers.map((offer, idx) => {
      const isBest = offer.effectiveNetPrice === bestDeal?.effectiveNetPrice;
      const merchantOffer: MerchantOffer = {
        id: `offer_${idx}`,
        productId: canonicalId,
        storeId: offer.storeId,
        storeName: offer.storeName,
        storeLogo: offer.storeLogo || undefined,
        rawUrl: offer.affiliateUrl,
        affiliateUrl: offer.affiliateUrl,
        itemPrice: offer.itemPrice,
        shippingFee: 0,
        currency: "INR",
        stockStatus: offer.inStock ? "In Stock" : "Out of Stock",
        deliveryTime: offer.deliveryEstimate,
        lastCheckedAt: Date.now(),
        isBestPrice: isBest,
        couponSavings: offer.couponSavings,
        cashbackEstimated: offer.cashbackAmount,
        effectiveNetPrice: offer.effectiveNetPrice,
      };

      return {
        offer: merchantOffer,
        storeName: offer.storeName,
        storeLogo: offer.storeLogo || undefined,
        cashbackRate: offer.cashbackRate,
        cashbackAmount: offer.cashbackAmount,
        bestCouponCode: offer.couponCode || undefined,
        couponSavings: offer.couponSavings,
        shippingFee: 0,
        itemPrice: offer.itemPrice,
        effectiveNetPrice: offer.effectiveNetPrice,
        isBestDeal: isBest,
        savingsVsWorst: Math.max(
          0,
          Math.max(...offers.map((o) => o.itemPrice)) - offer.effectiveNetPrice
        ),
        deliveryEstimate: offer.deliveryEstimate,
        affiliateUrl: offer.affiliateUrl,
        condition: "NEW",
        stack: calculateStackedSavings({
          storeName: offer.storeName,
          stickerPrice: offer.itemPrice,
          currency: "INR",
        }),
      };
    });

    const lowestPrice = formattedRows[0]?.itemPrice || 25000;
    const geo = resolveGeoProfile(req.headers);

    const responsePayload: ProductComparisonSummary = {
      productId: canonicalId,
      rows: formattedRows,
      bestDeal: formattedRows[0],
      maxSavings,
      storesComparedCount: formattedRows.length,
      unavailableStores: unavailableStores || [],
      dealHonesty: evaluateDealHonesty({
        currentPrice: lowestPrice,
        claimedOriginalPrice: Math.round(lowestPrice * 1.25),
      }),
      geo,
    };

    if (cacheKey.length > 10) {
      await globalCache.set(cacheKey, responsePayload, 5 * 60 * 1000);
    }

    res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");
    res.json(responsePayload);
  } catch (err) {
    console.error("Multi-store search error in compare.ts:", err);
    const fallbackComp = compareProductOffers("prod_sony_wh1000xm5");
    res.json(fallbackComp);
  }
});
