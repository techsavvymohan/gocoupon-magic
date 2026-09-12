/**
 * @file server/routes/deals.ts
 * @description Express Router for GoCoupon Live Deals & Offers Feed.
 *
 * Connected 24/7 directly to Cuelinks API v3 with automatic expiration pruning.
 *
 * Endpoints:
 *   GET  /api/deals       - Live filtered, searched, sorted & paginated offers
 *   GET  /api/deals/sync  - Trigger immediate on-demand Cuelinks 24/7 sync
 *   POST /api/deals/sync  - Trigger immediate on-demand Cuelinks 24/7 sync
 *   GET  /api/deals/stats - Live sync health & counts
 */

import { Router, type Request, type Response } from "express";
import { queryDeals, type DealBadge, type DealRecord } from "../../src/lib/server-data/deals-db.js";
import { apiRateLimiter } from "../../src/lib/services/rate-limiter.js";
import { globalCache } from "../../src/lib/services/cache-service.js";
import {
  getLiveDealsPool,
  getLiveSyncStats,
  syncLiveCuelinksDeals,
} from "../services/providers/cuelinks-client.js";

export const dealsRouter = Router();

/**
 * GET /api/deals
 * Serves live, verified, non-expired offers from the 24/7 Cuelinks engine.
 */
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
  const store = (req.query.store as string) || (req.query.merchant as string) || "";
  const badge = (req.query.badge as DealBadge) ?? undefined;
  const sortBy = (req.query.sortBy as any) || "trending";
  const order = (req.query.order as "asc" | "desc") || "desc";
  const rawLimit = parseInt(req.query.limit as string, 10);
  const limit = isNaN(rawLimit) ? 100 : rawLimit <= 0 ? 2000 : Math.min(rawLimit, 2000);
  const rawOffset = parseInt(req.query.offset as string, 10);
  const offset = isNaN(rawOffset) ? 0 : rawOffset;

  const cacheKey = `deals:${category}:${store}:${badge ?? "all"}:${q.toLowerCase()}:${sortBy}:${order}:${limit}:${offset}`;
  const cachedData = await globalCache.get<any>(cacheKey);

  if (cachedData) {
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=120");
    res.json({ ...cachedData, cached: true });
    return;
  }

  try {
    // 1. Ingest live Cuelinks deals from 24/7 memory pool
    const livePool = getLiveDealsPool();

    // 2. Query, filter, sort and paginate (with automatic expired pruning)
    const result = queryDeals(
      { category, q, store, badge, sortBy, order, limit, offset },
      livePool
    );

    const stats = getLiveSyncStats();
    const responsePayload = {
      ...result,
      count: result.deals.length,
      page: Math.floor(offset / limit) + 1,
      hasMore: offset + limit < result.total,
      isDynamic: true,
      provider: "Cuelinks API v3 (24/7 Auto-Sync)",
      lastSyncedAt: stats.lastSyncedAt,
      cached: false,
    };

    await globalCache.set(cacheKey, responsePayload, 60 * 1000);

    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=120");
    res.json(responsePayload);
  } catch (err: any) {
    console.error("[Deals API Error]", err);
    res.status(500).json({
      error: "Failed to retrieve deals from server",
      message: err.message,
    });
  }
});

/**
 * GET & POST /api/deals/sync
 * Triggers an immediate 24/7 sync with Cuelinks API v3.
 */
async function handleSync(req: Request, res: Response) {
  try {
    const pages = parseInt(req.query.pages as string, 10) || 0;
    const result = await syncLiveCuelinksDeals(pages);
    res.json({
      success: true,
      message: `24/7 sync completed. ${result.activeCount} active deals ingested, ${result.expiredCount} expired pruned.`,
      updatedAt: result.updatedAt,
      activeCount: result.activeCount,
      expiredCount: result.expiredCount,
      totalFetched: result.totalFetched,
    });
  } catch (err: any) {
    console.error("[Deals Sync Error]", err);
    res.status(500).json({
      success: false,
      error: "Failed to sync with Cuelinks API v3",
      message: err?.message,
    });
  }
}

dealsRouter.get("/sync", handleSync);
dealsRouter.post("/sync", handleSync);

/**
 * GET /api/deals/stats
 * Exposes live sync health, deal counts, and expiration pruning metrics.
 */
dealsRouter.get("/stats", (_req: Request, res: Response) => {
  const stats = getLiveSyncStats();
  res.json({
    status: "healthy",
    ...stats,
    is24x7Active: true,
  });
});
