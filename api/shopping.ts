import type { VercelRequest, VercelResponse } from "@vercel/node";
import { globalCache } from "../src/lib/services/cache-service";
import { apiRateLimiter } from "../src/lib/services/rate-limiter";

const SERPAPI_KEY = process.env.SERPAPI_API_KEY || process.env.SERPAPI_KEY || "";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Rate Limiting (60 requests/min per client IP)
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

  const q = (req.query.q as string)?.trim();
  if (!q) {
    return res.status(400).json({ error: "Query 'q' is required" });
  }

  const cacheKey = `shopping:${q.toLowerCase()}`;
  const cached = await globalCache.get<any>(cacheKey);
  if (cached) {
    res.setHeader("X-Cache", "HIT");
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1200");
    return res.status(200).json(cached);
  }

  try {
    const serpUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(
      q
    )}&gl=in&hl=en&api_key=${SERPAPI_KEY}&num=20`;

    const upstream = await fetch(serpUrl, { signal: AbortSignal.timeout(12000) });
    if (upstream.ok) {
      const data = await upstream.json();
      if (data.shopping_results && data.shopping_results.length > 0) {
        await globalCache.set(cacheKey, data, 15 * 60 * 1000);
      }
      res.setHeader("X-Cache", "MISS");
      res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1200");
      return res.status(200).json(data);
    }
  } catch (err: any) {
    console.warn("SerpAPI shopping search error in api/shopping.ts:", err);
  }

  return res.status(200).json({ shopping_results: [] });
}

