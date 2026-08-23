/**
 * @file api/compare.ts
 * @description Vercel Serverless Function for Cross-Store Price Comparison Matrix.
 *
 * Endpoint: GET /api/compare?productId=... OR ?url=...
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { resolveProduct } from "@/lib/services/product-resolver";
import { compareProductOffers } from "@/lib/services/comparison-engine";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const productId = (req.query.productId as string) || (req.query.id as string);
  const url = (req.query.url as string) || (req.query.q as string);

  let targetProductId = productId;

  if (!targetProductId && url) {
    const resolved = resolveProduct(url);
    if (resolved) {
      targetProductId = resolved.product.id;
    }
  }

  if (!targetProductId) {
    return res.status(400).json({ error: "productId or valid url parameter is required" });
  }

  const comparison = compareProductOffers(targetProductId);

  if (!comparison) {
    return res.status(404).json({
      error: "No store offers available for this product",
      productId: targetProductId,
    });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

  return res.status(200).json(comparison);
}
