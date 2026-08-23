/**
 * @file api/coupons.ts
 * @description Vercel Serverless Function for Browser Extension Auto-Apply Coupons.
 *
 * Endpoint: GET /api/coupons?store=amazon OR ?domain=amazon.in
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { CANONICAL_COUPONS } from "@/data/canonicalCatalogData";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const store =
    (req.query.store as string) || (req.query.domain as string) || (req.query.merchant as string);

  let filtered = [...CANONICAL_COUPONS];

  if (store) {
    const s = store
      .toLowerCase()
      .replace("https://", "")
      .replace("http://", "")
      .replace("www.", "")
      .split(".")[0];

    filtered = CANONICAL_COUPONS.filter(
      (c) => c.storeId.toLowerCase().includes(s) || c.storeName.toLowerCase().includes(s),
    );
  }

  // Sort by highest verified success rate
  filtered.sort((a, b) => b.successRate - a.successRate);

  // Set CORS headers for browser extension access
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

  return res.status(200).json({
    store: store || "all",
    count: filtered.length,
    coupons: filtered,
  });
}
