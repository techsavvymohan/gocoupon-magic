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

const SEARXNG_INSTANCES = [
  process.env.SEARXNG_URL,
  "https://search.mectov.my.id",
  "https://etsi.me",
  "https://sx.xo.st",
  "https://searx.perennialte.ch",
].filter(Boolean) as string[];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const query = (req.query.q as string) || (req.body && req.body.q);
  if (!query) {
    return res.status(400).json({ error: "Search query 'q' parameter is required." });
  }

  const categories = (req.query.categories as string) || (req.body && req.body.categories) || "general";
  const language = (req.query.language as string) || (req.body && req.body.language) || "en";
  const pageno = (req.query.pageno as string) || (req.body && req.body.pageno) || "1";

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
        res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");
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
