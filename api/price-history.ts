/**
 * @file api/price-history.ts
 * @description Vercel Serverless Function for 90-Day Price History Snapshots & Fake Discount Warning.
 *
 * Endpoint: GET /api/price-history?productId=... OR ?asin=...
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { resolveProduct } from "@/lib/services/product-resolver";
import { getProductPriceHistory, calculatePriceMetrics } from "@/lib/services/price-history";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const productId = (req.query.productId as string) || (req.query.id as string);
  const asin = req.query.asin as string;
  const url = req.query.url as string;
  const rawDays = parseInt(req.query.days as string, 10);
  const days: 30 | 60 | 90 | 180 =
    rawDays === 30 || rawDays === 60 || rawDays === 180 ? rawDays : 90;

  let targetProductId = productId;

  if (!targetProductId && (asin || url)) {
    const resolved = resolveProduct(asin || url);
    if (resolved) {
      targetProductId = resolved.product.id;
    }
  }

  if (!targetProductId) {
    return res.status(400).json({ error: "productId, asin, or url parameter is required" });
  }

  const history = getProductPriceHistory(targetProductId, days);
  const metrics = calculatePriceMetrics(targetProductId);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

  return res.status(200).json({
    productId: targetProductId,
    days,
    metrics,
    history,
  });
}
