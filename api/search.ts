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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Preflight
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const q = ((req.query.q as string) || "").trim();
  if (!q) {
    return res.status(400).json({ error: "Search query 'q' parameter is required." });
  }

  const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 8));

  try {
    const result = await unifiedProductSearch(q, { limit });

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
