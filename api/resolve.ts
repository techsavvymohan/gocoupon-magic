/**
 * @file api/resolve.ts
 * @description Vercel Serverless Function for Extension & Web Product Resolution.
 *
 * Endpoint: GET /api/resolve?url=... OR ?q=...
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { resolveProduct } from "@/lib/services/product-resolver";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const query = (req.query.url as string) || (req.query.q as string) || (req.query.asin as string);

  if (!query) {
    return res.status(400).json({
      error: "Query parameter 'url', 'q', or 'asin' is required",
    });
  }

  const result = resolveProduct(query);

  if (!result) {
    return res.status(404).json({
      found: false,
      message: "No matching canonical product found in GoCoupon verified catalog",
      query,
    });
  }

  // Set CORS headers for browser extension access
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

  return res.status(200).json({
    found: true,
    product: result.product,
    bestOffer: result.bestOffer,
    offersCount: result.offers.length,
    offers: result.offers,
    coupons: result.coupons,
    evidenceCount: result.evidence.length,
    savingsFromHighestPrice: result.savingsFromHighestPrice,
    matchType: result.matchType,
  });
}
