/**
 * @file server/routes/search.ts
 * @description Express Router for Unified Instant Search with Accuracy Verification & Dynamic Sorting.
 *
 * Endpoint: GET /api/search
 * Query params:
 *   q           - string (required) search term
 *   limit       - number (optional, default 8, max 30)
 *   minAccuracy - number (optional, default 0, max 100) filter out low accuracy results
 *   sortBy      - "accuracy" | "price_asc" | "price_desc" | "discount" (optional, default "accuracy")
 *   category    - string (optional) filter by category
 */

import { Router, type Request, type Response } from "express";
import { unifiedProductSearch } from "../../src/lib/services/unified-search-router.js";
import {
  evaluateSearchAccuracy,
  auditSearchAccuracyBatch,
  type SearchAccuracyResult,
} from "../services/search-accuracy.js";
import { globalCache } from "../../src/lib/services/cache-service.js";
import { apiRateLimiter } from "../../src/lib/services/rate-limiter.js";

export const searchRouter = Router();

searchRouter.get("/", async (req: Request, res: Response) => {
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

  const q = ((req.query.q as string) || "").trim();
  if (!q) {
    res.status(400).json({ error: "Search query 'q' parameter is required." });
    return;
  }

  const rawLimit = parseInt(req.query.limit as string, 10);
  const limit = Math.min(30, Math.max(1, isNaN(rawLimit) ? 8 : rawLimit));
  const rawMinAccuracy = parseInt(req.query.minAccuracy as string, 10);
  const minAccuracy = isNaN(rawMinAccuracy) ? 0 : Math.min(100, Math.max(0, rawMinAccuracy));
  const sortBy = (req.query.sortBy as string) || "accuracy";
  const category = (req.query.category as string)?.toLowerCase();

  const cacheKey = `search_uni_v2:${q.toLowerCase()}:${limit}:${minAccuracy}:${sortBy}:${category || "all"}`;
  const cached = await globalCache.get<any>(cacheKey);
  if (cached) {
    res.setHeader("X-Cache", "HIT");
    res.setHeader("Cache-Control", "public, s-maxage=180, stale-while-revalidate=360");
    res.json(cached);
    return;
  }

  try {
    // Request a broader candidate pool from unified search so accuracy scoring can filter and rank
    const baseResult = await unifiedProductSearch(q, { limit: Math.max(limit * 2, 16) });
    const rawResults = baseResult.results || [];

    // 1. Evaluate accuracy for each candidate
    const scoredResults = rawResults.map((item) => {
      const accuracy: SearchAccuracyResult = evaluateSearchAccuracy(q, {
        title: item.title,
        brand: item.brand,
        price: item.price,
        storeName: item.storeName,
      });

      return {
        ...item,
        accuracy,
      };
    });

    // 2. Filter by category if specified
    let filtered = scoredResults;
    if (category && category !== "all") {
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(category) ||
          (r.brand && r.brand.toLowerCase().includes(category))
      );
    }

    // 3. Filter by minimum accuracy threshold
    if (minAccuracy > 0) {
      filtered = filtered.filter((r) => r.accuracy.score >= minAccuracy);
    }

    // 4. Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return (a.price || Infinity) - (b.price || Infinity);
        case "price_desc":
          return (b.price || 0) - (a.price || 0);
        case "discount":
          return (b.discountPercent || 0) - (a.discountPercent || 0);
        case "accuracy":
        default:
          return b.accuracy.score - a.accuracy.score;
      }
    });

    // 5. Generate query-level accuracy audit summary
    const auditSummary = auditSearchAccuracyBatch(
      q,
      filtered.map((r) => ({
        title: r.title,
        brand: r.brand,
        price: r.price,
        storeName: r.storeName,
      }))
    );

    const finalResults = filtered.slice(0, limit);

    const payload = {
      query: q,
      source: baseResult.source,
      latencyMs: baseResult.latencyMs,
      totalFound: filtered.length,
      limit,
      sortBy,
      minAccuracy,
      accuracyAudit: auditSummary,
      suggestions: baseResult.suggestions || [],
      results: finalResults,
    };

    if (finalResults.length > 0) {
      await globalCache.set(cacheKey, payload, 5 * 60 * 1000);
    }

    res.setHeader("X-Cache", "MISS");
    res.setHeader("Cache-Control", "public, s-maxage=180, stale-while-revalidate=360");
    res.json(payload);
  } catch (error: any) {
    console.warn("Search accuracy router error:", error);
    res.status(500).json({ error: "Internal search accuracy processing error" });
  }
});
