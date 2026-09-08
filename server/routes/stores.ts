/**
 * @file server/routes/stores.ts
 * @description Express Router for GoCoupon Live Store Directory.
 *
 * Endpoint: GET /api/stores
 * Query params:
 *   category - string  (optional)
 *   q        - string  (optional)
 *   limit    - number  (optional, max 200)
 *   offset   - number  (optional, default 0)
 */

import { Router, type Request, type Response } from "express";
import { queryStores } from "../../src/lib/server-data/stores-db.js";
import { apiRateLimiter } from "../../src/lib/services/rate-limiter.js";
import { globalCache } from "../../src/lib/services/cache-service.js";

export const storesRouter = Router();

storesRouter.get("/", async (req: Request, res: Response) => {
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
  const sortBy = (req.query.sortBy as any) || "popularity";
  const order = (req.query.order as "asc" | "desc") || "desc";
  const rawLimit = parseInt(req.query.limit as string, 10);
  const limit = isNaN(rawLimit) ? 200 : Math.min(rawLimit, 200);
  const rawOffset = parseInt(req.query.offset as string, 10);
  const offset = isNaN(rawOffset) ? 0 : rawOffset;

  const cacheKey = `stores:${category}:${q.toLowerCase()}:${sortBy}:${order}:${limit}:${offset}`;
  const cachedData = await globalCache.get<any>(cacheKey);

  if (cachedData) {
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=120");
    res.json({ ...cachedData, cached: true });
    return;
  }

  try {
    const result = queryStores({ category, q, sortBy, order, limit, offset });
    await globalCache.set(cacheKey, result, 60 * 1000);

    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=120");
    res.json({ ...result, cached: false });
  } catch (err: any) {
    console.error("[Stores API Error]", err);
    res.status(500).json({
      error: "Failed to retrieve stores from server",
      message: err.message,
    });
  }
});
