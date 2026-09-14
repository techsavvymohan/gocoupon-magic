/**
 * @file server/routes/compare.ts
 * @description Express Router for Live Concurrent Multi-Store Price Comparison.
 *
 * Endpoint: GET /api/compare?productId=... OR ?q=... OR ?url=...
 */

import { Router, type Request, type Response } from "express";
import {
  type ComparisonRow,
  type ProductComparisonSummary,
} from "../../src/lib/services/comparison-engine.js";
import type { MerchantOffer } from "../../src/lib/services/canonical-types.js";
import { searchAllStoresConcurrent } from "../../src/lib/services/multi-store-connectors.js";
import { filterPriceOutliers } from "../../src/lib/services/entity-matcher.js";
import { resolveLiveUrlAndCompetitors } from "../../src/lib/services/url-metadata-extractor.js";
import { recordPriceSnapshot } from "../../src/lib/services/price-tracking-storage.js";
import { globalCache } from "../../src/lib/services/cache-service.js";
import { apiRateLimiter } from "../../src/lib/services/rate-limiter.js";
import { calculateStackedSavings } from "../services/stack-calculator.js";
import { evaluateDealHonesty } from "../services/deal-honesty.js";
import { resolveGeoProfile } from "../services/geo-resolver.js";
import {
  fetchCuelinksCoupons,
  normalizeCuelinksToStoreCoupon,
} from "../services/providers/cuelinks-client.js";
import { searchGoogleShopping } from "../services/providers/serpapi-client.js";

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

  // 0. Fetch live Cuelinks coupons pool for real-time stacking
  let liveCuelinksCoupons: any[] = [];
  try {
    const cueOffers = await fetchCuelinksCoupons({ limit: 40 });
    liveCuelinksCoupons = cueOffers.map(normalizeCuelinksToStoreCoupon);
  } catch {}

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

          const stack = calculateStackedSavings({
            productTitle: urlResolution.metadata.title,
            storeName: c.storeName,
            stickerPrice: c.price,
            currency: "INR",
            availableCoupons: liveCuelinksCoupons,
          });
          const bestCouponCode = stack.coupon.applied ? stack.coupon.code : c.bestCouponCode;
          const couponSavings = Math.max(c.couponSavings, stack.coupon.discountAmount);

          return {
            offer: merchantOffer,
            storeName: c.storeName,
            storeLogo: c.storeLogo || undefined,
            cashbackRate: c.cashbackRate,
            cashbackAmount: c.cashbackAmount,
            bestCouponCode: bestCouponCode || undefined,
            couponSavings,
            shippingFee: 0,
            itemPrice: c.price,
            effectiveNetPrice: stack.trueNetLandedCost,
            isBestDeal: c.isBestDeal,
            savingsVsWorst: c.savingsVsOriginal,
            deliveryEstimate: "Free Standard Delivery",
            affiliateUrl: c.affiliateUrl,
            condition: "NEW",
            stack,
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
  const searchQuery = (rawQuery || productId || "").trim();
  if (!searchQuery) {
    res.json({
      productId: "empty",
      rows: [],
      bestDeal: undefined,
      maxSavings: 0,
      storesComparedCount: 0,
      unavailableStores: [],
      geo: resolveGeoProfile(req.headers),
    });
    return;
  }

  try {
    const { offers, bestDeal, maxSavings, totalStoresFound, unavailableStores } =
      await searchAllStoresConcurrent(searchQuery);

    if (totalStoresFound === 0) {
      res.json({
        productId: `empty_${encodeURIComponent(searchQuery).slice(0, 30)}`,
        productTitle: searchQuery,
        rows: [],
        bestDeal: undefined,
        maxSavings: 0,
        storesComparedCount: 0,
        unavailableStores: unavailableStores || [],
        geo: resolveGeoProfile(req.headers),
      });
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

    const applyBank = req.query.applyBank === "true" || (Boolean(req.query.card) && req.query.card !== "none");
    const preferredCard = req.query.card && req.query.card !== "none" ? String(req.query.card) : undefined;

    const formattedRows: ComparisonRow[] = offers.map((offer, idx) => {
      const stack = calculateStackedSavings({
        productTitle: offer.title || productTitle,
        storeName: offer.storeName,
        stickerPrice: offer.itemPrice,
        currency: "INR",
        availableCoupons: liveCuelinksCoupons,
        applyBankDiscount: applyBank,
        preferredBankCard: preferredCard,
      });
      const rawCouponCode = stack.coupon.applied ? stack.coupon.code : offer.couponCode;
      const bestCouponCode = rawCouponCode ? String(rawCouponCode) : undefined;
      const couponSavings = Math.max(offer.couponSavings || 0, stack.coupon.discountAmount);
      const effectiveNet = stack.trueNetLandedCost;

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
        isBestPrice: false,
        couponSavings,
        cashbackEstimated: stack.cashback.amount,
        effectiveNetPrice: effectiveNet,
      };

      return {
        offer: merchantOffer,
        storeName: offer.storeName,
        storeLogo: offer.storeLogo || undefined,
        cashbackRate: `${stack.cashback.ratePercent}%`,
        cashbackAmount: stack.cashback.amount,
        bestCouponCode: bestCouponCode || undefined,
        couponSavings,
        shippingFee: 0,
        itemPrice: offer.itemPrice,
        effectiveNetPrice: effectiveNet,
        isBestDeal: false,
        savingsVsWorst: 0,
        deliveryEstimate: offer.deliveryEstimate,
        affiliateUrl: offer.affiliateUrl,
        condition: "NEW",
        stack,
      };
    });

    // Sort by true net landed cost ascending
    formattedRows.sort((a, b) => a.effectiveNetPrice - b.effectiveNetPrice);

    // Accuracy: Statistical outlier removal
    const cleanRows = filterPriceOutliers(formattedRows);
    const finalRows = cleanRows.length >= 2 ? cleanRows : formattedRows;

    if (finalRows.length > 0) {
      finalRows[0].isBestDeal = true;
      finalRows[0].offer.isBestPrice = true;
      const highestPrice = Math.max(...finalRows.map((r) => r.itemPrice));
      for (const row of finalRows) {
        row.savingsVsWorst = Math.max(0, highestPrice - row.effectiveNetPrice);
      }
    }

    const lowestPrice = finalRows[0]?.itemPrice || (finalRows[0]?.effectiveNetPrice ?? 0);
    const geo = resolveGeoProfile(req.headers);

    const responsePayload: ProductComparisonSummary = {
      productId: canonicalId,
      productTitle,
      rows: finalRows,
      bestDeal: finalRows[0],
      maxSavings,
      storesComparedCount: finalRows.length,
      unavailableStores: unavailableStores || [],
      dealHonesty: evaluateDealHonesty({
        currentPrice: lowestPrice,
        claimedOriginalPrice: Math.round(lowestPrice * 1.25),
      }),
      geo,
    };

    if (cacheKey.length > 10) {
      // 30-minute cache — serve stale on repeat hits, background refresh on miss
      await globalCache.set(cacheKey, responsePayload, 30 * 60 * 1000);
    }

    res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");
    res.json(responsePayload);
  } catch (err) {
    console.warn("[Compare] Live scraping failed — using SerpAPI sandbox fallback:", (err as Error).message);

    try {
      // Graceful degradation: serve SerpAPI sandbox prices so the user always sees results
      const serpResult = await searchGoogleShopping({ query: searchQuery, country: "in" });
      const geo = resolveGeoProfile(req.headers);

      const fallbackRows: ComparisonRow[] = serpResult.offers
        .filter((o) => o.condition === "NEW" && o.price > 0)
        .slice(0, 5)
        .map((o, idx) => {
          const stack = calculateStackedSavings({
            storeName: o.merchantName,
            stickerPrice: o.price,
            currency: "INR",
            availableCoupons: liveCuelinksCoupons,
          });
          const merchantOffer: MerchantOffer = {
            id: `sandbox_${idx}`,
            productId: `sandbox_${encodeURIComponent(searchQuery).slice(0, 30)}`,
            storeId: o.domain.replace(/\./g, "_"),
            storeName: o.merchantName,
            rawUrl: o.directUrl,
            affiliateUrl: o.directUrl,
            itemPrice: o.price,
            shippingFee: 0,
            currency: "INR",
            stockStatus: "In Stock",
            deliveryTime: "Standard Delivery",
            lastCheckedAt: Date.now(),
            isBestPrice: idx === 0,
            couponSavings: stack.coupon.discountAmount,
            cashbackEstimated: stack.cashback.amount,
            effectiveNetPrice: stack.trueNetLandedCost,
          };
          return {
            offer: merchantOffer,
            storeName: o.merchantName,
            cashbackRate: `${stack.cashback.ratePercent}%`,
            cashbackAmount: stack.cashback.amount,
            bestCouponCode: stack.coupon.applied && stack.coupon.code ? stack.coupon.code : undefined,
            couponSavings: stack.coupon.discountAmount,
            shippingFee: 0,
            itemPrice: o.price,
            effectiveNetPrice: stack.trueNetLandedCost,
            isBestDeal: idx === 0,
            savingsVsWorst: 0,
            deliveryEstimate: "Standard Delivery",
            affiliateUrl: o.directUrl,
            condition: "NEW",
            stack,
          };
        });

      if (fallbackRows.length > 1) {
        const highest = Math.max(...fallbackRows.map((r) => r.itemPrice));
        for (const row of fallbackRows) {
          row.savingsVsWorst = Math.max(0, highest - row.effectiveNetPrice);
        }
      }

      const fallbackPayload: ProductComparisonSummary = {
        productId: `sandbox_${encodeURIComponent(searchQuery).slice(0, 30)}`,
        rows: fallbackRows,
        bestDeal: fallbackRows[0],
        maxSavings: fallbackRows.length > 1 ? fallbackRows[0].savingsVsWorst : 0,
        storesComparedCount: fallbackRows.length,
        unavailableStores: [],
        dataSource: serpResult.source, // "serpapi_sandbox" or "serpapi_live"
        geo,
      } as any;

      // Cache the fallback for 10 min so retries are served instantly
      if (cacheKey.length > 10 && fallbackRows.length > 0) {
        await globalCache.set(cacheKey, fallbackPayload, 10 * 60 * 1000);
      }

      res.setHeader("X-Data-Source", serpResult.source);
      res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
      res.json(fallbackPayload);
    } catch (fallbackErr) {
      res.json({
        productId: `error_${encodeURIComponent(searchQuery || "search").slice(0, 30)}`,
        productTitle: searchQuery || "Product",
        rows: [],
        bestDeal: undefined,
        maxSavings: 0,
        storesComparedCount: 0,
        unavailableStores: [],
        geo: resolveGeoProfile(req.headers),
      });
    }
  }
});
