/**
 * @file server/routes/international-deals.ts
 * @description Express Router for Global & International Deals (Admitad / Mitgo Global Engine).
 *
 * Separate modular router to serve worldwide store discounts, coupons, and offers
 * from AliExpress, Booking.com, Samsung, Lenovo, Adobe, Shein, Hostinger, and global merchants.
 *
 * Endpoints:
 *   GET /api/international-deals - Fetches filtered, searched & sorted international deals
 */

import { Router, type Request, type Response } from "express";
import { fetchLiveInternationalDeals } from "../services/providers/admitad-client.js";
import { globalCache } from "../../src/lib/services/cache-service.js";
import { apiRateLimiter } from "../../src/lib/services/rate-limiter.js";

export const internationalDealsRouter = Router();

/**
 * GET /api/international-deals
 * Serves live international deals powered by Admitad Global API.
 */
internationalDealsRouter.get("/", async (req: Request, res: Response) => {
  const clientIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "127.0.0.1";

  const rateCheck = apiRateLimiter.check(clientIp, 120, 60 * 1000);
  if (!rateCheck.allowed) {
    res.setHeader("Retry-After", String(rateCheck.retryAfterSeconds));
    res.status(429).json({
      error: "Too many requests. Please slow down.",
      retryAfterSeconds: rateCheck.retryAfterSeconds,
    });
    return;
  }

  const category = (req.query.category as string)?.toLowerCase() || "";
  const q = (req.query.q as string)?.toLowerCase() || "";
  const store = (req.query.store as string)?.toLowerCase() || "";
  const sortBy = (req.query.sortBy as string) || "trending";

  const cacheKey = `intl-deals:${category}:${q}:${store}:${sortBy}`;
  const cachedData = await globalCache.get<any>(cacheKey);

  if (cachedData) {
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=180");
    res.json({ ...cachedData, cached: true });
    return;
  }

  try {
    const rawDeals = await fetchLiveInternationalDeals();

    let filtered = rawDeals.filter((deal) => {
      if (category && category !== "all" && deal.category.toLowerCase() !== category) {
        return false;
      }
      if (store && !deal.storeName.toLowerCase().includes(store) && !deal.storeSlug.includes(store)) {
        return false;
      }
      if (q) {
        const hay = `${deal.title} ${deal.storeName} ${deal.code} ${deal.terms}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    // Sort deals
    if (sortBy === "discount") {
      filtered.sort((a, b) => {
        const da = parseInt(a.discount.replace(/[^0-9]/g, "")) || 0;
        const db = parseInt(b.discount.replace(/[^0-9]/g, "")) || 0;
        return db - da;
      });
    } else {
      filtered.sort((a, b) => b.usesCount - a.usesCount);
    }

    const payload = {
      deals: filtered,
      total: filtered.length,
      count: filtered.length,
      isDynamic: true,
      provider: "Admitad Global API v3",
      lastSyncedAt: new Date().toISOString(),
      cached: false,
    };

    await globalCache.set(cacheKey, payload, 180 * 1000);

    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=180");
    res.json(payload);
  } catch (err: any) {
    console.error("❌ [API] Error serving international deals:", err.message);
    res.status(500).json({
      error: "Failed to fetch international deals",
      message: err.message,
    });
  }
});
