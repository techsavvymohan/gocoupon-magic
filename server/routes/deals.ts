/**
 * @file server/routes/deals.ts
 * @description Express Router for GoCoupon Live Deals & Offers Feed.
 *
 * Endpoint: GET /api/deals
 * Query params:
 *   category - string  (optional)
 *   q        - string  (optional)
 *   badge    - string  (optional)
 *   limit    - number  (optional, max 100, default 20)
 *   offset   - number  (optional, default 0)
 */

import { Router, type Request, type Response } from "express";
import { queryDeals, type DealBadge } from "../../src/lib/server-data/deals-db.js";
import { apiRateLimiter } from "../../src/lib/services/rate-limiter.js";
import { globalCache } from "../../src/lib/services/cache-service.js";

export const dealsRouter = Router();

dealsRouter.get("/", async (req: Request, res: Response) => {
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

  const category = (req.query.category as string) ?? "";
  const q = (req.query.q as string) ?? "";
  const badge = (req.query.badge as DealBadge) ?? undefined;
  const sortBy = (req.query.sortBy as any) || "trending";
  const order = (req.query.order as "asc" | "desc") || "desc";
  const rawLimit = parseInt(req.query.limit as string, 10);
  const limit = isNaN(rawLimit) ? 20 : Math.min(rawLimit, 100);
  const rawOffset = parseInt(req.query.offset as string, 10);
  const offset = isNaN(rawOffset) ? 0 : rawOffset;

  const cacheKey = `deals:${category}:${badge ?? "all"}:${q.toLowerCase()}:${sortBy}:${order}:${limit}:${offset}`;
  const cachedData = await globalCache.get<any>(cacheKey);

  if (cachedData) {
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=120");
    res.json({ ...cachedData, cached: true });
    return;
  }

  try {
    const result = queryDeals({ category, q, badge, sortBy, order, limit, offset });
    await globalCache.set(cacheKey, result, 60 * 1000);

    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=120");
    res.json({ ...result, cached: false });
  } catch (err: any) {
    console.error("[Deals API Error]", err);
    res.status(500).json({
      error: "Failed to retrieve deals from server",
      message: err.message,
    });
  }
});
