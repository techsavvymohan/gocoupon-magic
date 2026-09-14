/**
 * @file server/routes/resolve.ts
 * @description Express Router for Product URL & Query Resolution (Cheerio + SERP API).
 *
 * Endpoint: GET /api/resolve?url=... OR ?q=... OR ?asin=...
 */

import { Router, type Request, type Response } from "express";
import { resolveProduct } from "../../src/lib/services/product-resolver.js";
import { resolveLiveUrlAndCompetitors, isSafePublicUrl } from "../../src/lib/services/url-metadata-extractor.js";
import { apiRateLimiter } from "../../src/lib/services/rate-limiter.js";

export const resolveRouter = Router();

resolveRouter.get("/", async (req: Request, res: Response) => {
  const clientIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "127.0.0.1";

  const rateCheck = apiRateLimiter.check(clientIp, 60, 60 * 1000);
  if (!rateCheck.allowed) {
    res.setHeader("Retry-After", String(rateCheck.retryAfterSeconds));
    res.status(429).json({
      error: "Rate limit exceeded. Please slow down.",
      retryAfterSeconds: rateCheck.retryAfterSeconds,
    });
    return;
  }

  const query = (req.query.url as string) || (req.query.q as string) || (req.query.asin as string);
  if (!query) {
    res.status(400).json({
      error: "Query parameter 'url', 'q', or 'asin' is required",
    });
    return;
  }

  // Security: Guard against SSRF probing via URL inputs
  if (/^https?:\/\//i.test(query.trim()) && !isSafePublicUrl(query.trim())) {
    res.status(400).json({
      found: false,
      error: "Invalid or prohibited URL target. Access to private, local, or loopback networks is blocked.",
    });
    return;
  }

  // 1. Try local catalog first
  const localResult = resolveProduct(query);
  if (localResult) {
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    res.json({
      found: true,
      product: localResult.product,
      bestOffer: localResult.bestOffer,
      offersCount: localResult.offers.length,
      offers: localResult.offers,
      coupons: localResult.coupons,
      evidenceCount: localResult.evidence.length,
      savingsFromHighestPrice: localResult.savingsFromHighestPrice,
      matchType: localResult.matchType,
      isLiveExtracted: false,
    });
    return;
  }

  // 2. Fallback to live Cheerio + SerpAPI extraction for arbitrary URLs or queries
  try {
    const liveResult = await resolveLiveUrlAndCompetitors(query);
    if (liveResult && liveResult.found) {
      res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");
      res.json({
        found: true,
        product: {
          id: `live_${Date.now()}`,
          title: liveResult.metadata.title,
          brand: liveResult.metadata.brand,
          imageUrl: liveResult.metadata.imageUrl,
          rating: liveResult.metadata.rating,
          reviewCount: liveResult.metadata.reviewCount,
          category: "Live Product",
          mrp: Math.round(liveResult.metadata.price * 1.15),
          verifiedDiscountClaim: "Live Scanned Merchant Feed",
        },
        metadata: liveResult.metadata,
        bestDeal: liveResult.bestDeal,
        competitors: liveResult.competitors,
        offersCount: liveResult.competitors.length,
        maxSavings: liveResult.maxSavings,
        matchType: "live_cheerio_serpapi",
        isLiveExtracted: true,
      });
      return;
    }
  } catch (err: any) {
    console.error("Live resolution failed in resolve.ts:", err);
  }

  res.status(404).json({
    found: false,
    message: "Unable to extract product metadata from the provided URL or query.",
    query,
  });
});
