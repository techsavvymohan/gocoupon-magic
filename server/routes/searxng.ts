/**
 * @file server/routes/searxng.ts
 * @description Express Router for SearXNG Proxy with Cache and Instance Failover.
 *
 * Implements:
 * GET /api/searxng?q=...&format=json
 * POST /api/searxng
 */

import { Router, type Request, type Response } from "express";
import { globalCache } from "../../src/lib/services/cache-service.js";
import { apiRateLimiter } from "../../src/lib/services/rate-limiter.js";

export const searxngRouter = Router();

const SEARXNG_INSTANCES = [
  process.env.SEARXNG_URL || "http://127.0.0.1:8888",
  "https://etsi.me",
  "https://searx.perennialte.ch",
  "https://search.ononoki.org",
  "https://priv.au",
  "https://sx.xo.st",
].filter(Boolean) as string[];

async function handleSearxng(req: Request, res: Response) {
  const clientIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "127.0.0.1";

  const rateCheck = apiRateLimiter.check(clientIp, 60, 60 * 1000);
  if (!rateCheck.allowed) {
    res.setHeader("Retry-After", String(rateCheck.retryAfterSeconds));
    res.status(429).json({
      error: "Rate limit exceeded. Please slow down your requests.",
      retryAfterSeconds: rateCheck.retryAfterSeconds,
    });
    return;
  }

  const query = (req.query.q as string) || (req.body && req.body.q);
  if (!query) {
    res.status(400).json({ error: "Search query 'q' parameter is required." });
    return;
  }

  const categories = (req.query.categories as string) || (req.body && req.body.categories) || "general";
  const language = (req.query.language as string) || (req.body && req.body.language) || "en";
  const pageno = (req.query.pageno as string) || (req.body && req.body.pageno) || "1";

  const cacheKey = `searx:${query.toLowerCase().trim()}:${categories}:${language}:${pageno}`;
  const cached = await globalCache.get<any>(cacheKey);
  if (cached) {
    res.setHeader("X-Cache", "HIT");
    res.setHeader("Cache-Control", "public, s-maxage=180, stale-while-revalidate=360");
    res.json(cached);
    return;
  }

  for (const instance of SEARXNG_INSTANCES) {
    try {
      const fetchFromInstance = async (catParam: string) => {
        const targetUrl = new URL(`${instance.replace(/\/+$/, "")}/search`);
        targetUrl.searchParams.set("q", query);
        targetUrl.searchParams.set("format", "json");
        if (catParam && catParam !== "all") {
          targetUrl.searchParams.set("categories", catParam);
        }
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
          return await upstream.json();
        }
        return null;
      };

      let data = await fetchFromInstance(categories);
      // Auto-fallback: If "shopping" category returns 0 results, query general category
      if ((!data || !data.results || data.results.length === 0) && categories.includes("shopping")) {
        data = await fetchFromInstance("general");
      }

      if (data && data.results && data.results.length > 0) {
        await globalCache.set(cacheKey, data, 15 * 60 * 1000);
        res.setHeader("X-Cache", "MISS");
        res.setHeader("Cache-Control", "public, s-maxage=180, stale-while-revalidate=360");
        res.json(data);
        return;
      }
    } catch {
      // Continue to next instance in pool
    }
  }

  res.json({
    query,
    number_of_results: 0,
    results: [],
    suggestions: [],
    fallback: true,
  });
}

searxngRouter.get("/", handleSearxng);
searxngRouter.post("/", handleSearxng);
