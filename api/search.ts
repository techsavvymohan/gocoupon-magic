/**
 * @file api/search.ts
 * @description Unified Instant Search Endpoint (<15ms Local Index + SearXNG Fallback).
 *
 * Implements:
 * GET /api/search?q=...&limit=...
 *
 * Checks Layer 1 local catalog first, falls back to SearXNG on cache miss.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { unifiedProductSearch } from "../src/lib/services/unified-search-router";
import { globalCache } from "../src/lib/services/cache-service";
import { apiRateLimiter } from "../src/lib/services/rate-limiter";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Preflight
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Rate Limiting (60 requests/min per IP)
  const clientIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "127.0.0.1";

  const rateCheck = apiRateLimiter.check(clientIp, 60, 60 * 1000);
  if (!rateCheck.allowed) {
    res.setHeader("Retry-After", String(rateCheck.retryAfterSeconds));
    return res.status(429).json({
      error: "Rate limit exceeded. Please slow down.",
      retryAfterSeconds: rateCheck.retryAfterSeconds,
    });
  }

  const q = ((req.query.q as string) || "").trim();
  if (!q) {
    return res.status(400).json({ error: "Search query 'q' parameter is required." });
  }

  const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 8));

  const cacheKey = `search_uni:${q.toLowerCase()}:${limit}`;
  const cached = await globalCache.get<any>(cacheKey);
  if (cached) {
    res.setHeader("X-Cache", "HIT");
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json(cached);
  }

  try {
    const result = await unifiedProductSearch(q, { limit });
    if (result && result.results && result.results.length > 0) {
      await globalCache.set(cacheKey, result, 10 * 60 * 1000);
    }

    if (result.source === "local_instant_index") {
      res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    } else {
      res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=180");
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.warn("Unified search error in api/search.ts:", error);
    return res.status(500).json({ error: "Internal search routing error" });
  }
}
