import type { VercelRequest, VercelResponse } from "@vercel/node";

const SERPAPI_KEY =
  process.env.SERPAPI_API_KEY ||
  process.env.VITE_SERPAPI_KEY ||
  "3e5a818b044970872f984fc4f861138d65566790bfdfcae87f6c7f043b63d5d3";

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

  try {
    const serpUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(
      q
    )}&gl=in&hl=en&api_key=${SERPAPI_KEY}&num=20`;

    const upstream = await fetch(serpUrl, { signal: AbortSignal.timeout(6000) });
    if (upstream.ok) {
      const data = await upstream.json();
      res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
      return res.status(200).json(data);
    }
  } catch (err: any) {
    console.warn("SerpAPI shopping search error in api/shopping.ts:", err);
  }

  return res.status(200).json({ shopping_results: [] });
}
