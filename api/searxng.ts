/**
 * @file api/searxng.ts
 * @description Serverless HTTP Proxy Endpoint for SearXNG API.
 *
 * Implements:
 * GET /api/searxng?q=...&format=json
 * POST /api/searxng (form data or json body)
 *
 * Avoids browser CORS and forwards requests to active SearXNG instances.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { globalCache } from "../src/lib/services/cache-service";
import { apiRateLimiter } from "../src/lib/services/rate-limiter";

const SEARXNG_INSTANCES = [
  process.env.SEARXNG_URL,
  "https://search.mectov.my.id",
  "https://etsi.me",
  "https://searx.perennialte.ch",
  "https://search.ononoki.org",
  "https://priv.au",
  "https://sx.xo.st",
].filter(Boolean) as string[];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Rate Limiting (60 queries/min per client IP)
  const clientIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "127.0.0.1";

  const rateCheck = apiRateLimiter.check(clientIp, 60, 60 * 1000);
  if (!rateCheck.allowed) {
    res.setHeader("Retry-After", String(rateCheck.retryAfterSeconds));
    return res.status(429).json({
      error: "Rate limit exceeded. Please slow down your requests.",
      retryAfterSeconds: rateCheck.retryAfterSeconds,
    });
  }

  const query = (req.query.q as string) || (req.body && req.body.q);
  if (!query) {
    return res.status(400).json({ error: "Search query 'q' parameter is required." });
  }

  const categories = (req.query.categories as string) || (req.body && req.body.categories) || "general";
  const language = (req.query.language as string) || (req.body && req.body.language) || "en";
  const pageno = (req.query.pageno as string) || (req.body && req.body.pageno) || "1";

  const cacheKey = `searx:${query.toLowerCase().trim()}:${categories}:${language}:${pageno}`;
  const cached = await globalCache.get<any>(cacheKey);
  if (cached) {
    res.setHeader("X-Cache", "HIT");
    res.setHeader("Cache-Control", "public, s-maxage=180, stale-while-revalidate=360");
    return res.status(200).json(cached);
  }

  // Try configured instances in sequence
  for (const instance of SEARXNG_INSTANCES) {
    try {
      const targetUrl = new URL(`${instance.replace(/\/+$/, "")}/search`);
      targetUrl.searchParams.set("q", query);
      targetUrl.searchParams.set("format", "json");
      targetUrl.searchParams.set("categories", categories);
      targetUrl.searchParams.set("language", language);
      targetUrl.searchParams.set("pageno", pageno);

      const upstream = await fetch(targetUrl.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; goCoupon/2.0; +https://gocoupon.io)",
        },
        signal: AbortSignal.timeout(4500),
      });

      if (upstream.ok && upstream.headers.get("content-type")?.includes("json")) {
        const data = await upstream.json();
        if (data.results && data.results.length > 0) {
          await globalCache.set(cacheKey, data, 15 * 60 * 1000);
        }
        res.setHeader("X-Cache", "MISS");
        res.setHeader("Cache-Control", "public, s-maxage=180, stale-while-revalidate=360");
        return res.status(200).json(data);
      }
    } catch {
      // Continue to next instance in pool
    }
  }

  // Graceful fallback response
  return res.status(200).json({
    query,
    number_of_results: 0,
    results: [],
    suggestions: [],
    fallback: true,
  });
}

