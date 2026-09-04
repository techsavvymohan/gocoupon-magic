import type { VercelRequest, VercelResponse } from "@vercel/node";

const SERPAPI_KEY = process.env.SERPAPI_API_KEY || process.env.SERPAPI_KEY || "";

const shoppingCache = new Map<string, { data: any; expiry: number }>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const q = (req.query.q as string)?.trim();
  if (!q) {
    return res.status(400).json({ error: "Query 'q' is required" });
  }

  const cacheKey = q.toLowerCase();
  const cached = shoppingCache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1200");
    return res.status(200).json(cached.data);
  }

  try {
    const serpUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(
      q
    )}&gl=in&hl=en&api_key=${SERPAPI_KEY}&num=20`;

    const upstream = await fetch(serpUrl, { signal: AbortSignal.timeout(12000) });
    if (upstream.ok) {
      const data = await upstream.json();
      if (data.shopping_results && data.shopping_results.length > 0) {
        shoppingCache.set(cacheKey, {
          data,
          expiry: Date.now() + 15 * 60 * 1000,
        });
      }
      res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1200");
      return res.status(200).json(data);
    }
  } catch (err: any) {
    console.warn("SerpAPI shopping search error in api/shopping.ts:", err);
  }

  return res.status(200).json({ shopping_results: [] });
}
