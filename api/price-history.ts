/**
 * @file api/price-history.ts
 * @description Vercel Serverless Function for 90-Day Price History Time-Series & Fake Discount Detection.
 *
 * Endpoint: GET /api/price-history?productId=... OR ?q=... OR ?days=90
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { resolveProduct } from "@/lib/services/product-resolver";
import { getHistoricalPriceSeries } from "@/lib/services/price-tracking-storage";
import { getProductPriceHistory, calculatePriceMetrics } from "@/lib/services/price-history";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const productId = (req.query.productId as string) || (req.query.id as string);
  const asin = req.query.asin as string;
  const url = req.query.url as string;
  const rawDays = parseInt(req.query.days as string, 10);
  const days = isNaN(rawDays) ? 90 : Math.min(180, Math.max(7, rawDays));

  let targetProductId = productId;
  let targetTitle = "Tracked Product";
  let targetPrice = 29990;

  if (!targetProductId && (asin || url)) {
    const resolved = resolveProduct(asin || url);
    if (resolved) {
      targetProductId = resolved.product.id;
      targetTitle = resolved.product.title;
      targetPrice = resolved.bestOffer.itemPrice;
    }
  }

  if (!targetProductId) {
    targetProductId = "prod_sony_wh1000xm5";
  }

  // Retrieve 90-day time series from Supabase / Upstash / Time Series engine
  const timeSeries = await getHistoricalPriceSeries(targetProductId, targetTitle, targetPrice, days);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

  return res.status(200).json({
    productId: targetProductId,
    days,
    timeSeries,
    metrics: {
      lowestPrice90d: timeSeries.lowestPrice90d,
      highestPrice90d: timeSeries.highestPrice90d,
      averagePrice90d: timeSeries.averagePrice90d,
      currentPrice: timeSeries.currentPrice,
      isAllTimeLow: timeSeries.isAllTimeLow,
      dropPercentage: timeSeries.dropPercentage,
      fakeDiscountDetected: timeSeries.artificialInflationDetected,
    },
    historyPoints: timeSeries.historyPoints,
  });
}
