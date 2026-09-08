/**
 * @file server/routes/price-history.ts
 * @description Express Router for 90-Day Price History Time-Series & Fake Discount Detection.
 *
 * Endpoint: GET /api/price-history?productId=... OR ?q=... OR ?days=90
 */

import { Router, type Request, type Response } from "express";
import { resolveProduct } from "../../src/lib/services/product-resolver.js";
import { getHistoricalPriceSeries } from "../../src/lib/services/price-tracking-storage.js";

export const priceHistoryRouter = Router();

priceHistoryRouter.get("/", async (req: Request, res: Response) => {
  const productId = (req.query.productId as string) || (req.query.id as string);
  const asin = req.query.asin as string;
  const url = req.query.url as string;
  const rawDays = parseInt(req.query.days as string, 10);
  const days = isNaN(rawDays) ? 30 : Math.min(180, Math.max(7, rawDays));

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

  const timeSeries = await getHistoricalPriceSeries(targetProductId, targetTitle, targetPrice, days);

  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  res.json({
    productId: targetProductId,
    days,
    timeSeries,
    metrics: {
      lowestPrice30d: timeSeries.lowestPrice90d,
      highestPrice30d: timeSeries.highestPrice90d,
      averagePrice30d: timeSeries.averagePrice90d,
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
});
