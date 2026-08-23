/**
 * @file api/resolve.ts
 * @description Vercel Serverless Function for Live Extension & Web Product URL Resolution.
 *
 * Endpoint: GET /api/resolve?url=... OR ?q=... OR ?asin=...
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { resolveProduct } from "@/lib/services/product-resolver";
import { resolveLiveUrlAndCompetitors } from "@/lib/services/url-metadata-extractor";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const query = (req.query.url as string) || (req.query.q as string) || (req.query.asin as string);

  if (!query) {
    return res.status(400).json({
      error: "Query parameter 'url', 'q', or 'asin' is required",
    });
  }

  // 1. Try local catalog first
  const localResult = resolveProduct(query);

  if (localResult) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

    return res.status(200).json({
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
  }

  // 2. Fallback to live Cheerio + SerpAPI extraction for arbitrary URLs or queries
  try {
    const liveResult = await resolveLiveUrlAndCompetitors(query);

    if (liveResult && liveResult.found) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");

      return res.status(200).json({
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
    }
  } catch (err: any) {
    console.error("Live resolution failed:", err);
  }

  return res.status(404).json({
    found: false,
    message: "Unable to extract product metadata from the provided URL or query.",
    query,
  });
}
