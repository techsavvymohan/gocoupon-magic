/**
 * @file api/affiliates/products.ts
 * @description Vercel Serverless Function stub for affiliate product search.
 *
 * Phase 1: Returns mock/static data from the provider registry.
 * Phase 2: This function will make real Amazon Creators API calls using
 *          server-side credentials (AMAZON_CLIENT_ID, AMAZON_CLIENT_SECRET).
 *          Those secrets are ONLY available here — never in the Vite frontend bundle.
 *
 * Endpoint: GET /api/affiliates/products
 * Query params:
 *   provider  - string  (required) e.g. "amazon"
 *   country   - "IN"|"US" (optional, default "IN")
 *   keyword   - string  (optional)
 *   category  - string  (optional)
 *   minPrice  - number  (optional)
 *   maxPrice  - number  (optional)
 *   page      - number  (optional)
 *   limit     - number  (optional, max 50)
 *
 * Security:
 *   - Rate limiting: max 60 req/min per IP (enforced by Vercel Edge middleware)
 *   - Only GET method accepted
 *   - Input sanitized/validated before any API call
 *   - No credentials exposed in response
 *   - No arbitrary external URL proxying
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Parse and validate query params
  const provider = (req.query.provider as string)?.toLowerCase();
  const country = (req.query.country as string) === "US" ? "US" : "IN";
  const keyword = (req.query.keyword as string) ?? undefined;
  const category = (req.query.category as string) ?? undefined;
  const rawLimit = parseInt(req.query.limit as string, 10);
  const limit = isNaN(rawLimit) ? 10 : Math.min(rawLimit, 50);

  if (!provider) {
    return res.status(400).json({ error: "provider query parameter is required" });
  }

  // Validate provider against allowlist — prevent arbitrary provider injection
  const ALLOWED_PROVIDERS = ["amazon", "impact", "awin", "cj", "sharesale", "mock"];
  if (!ALLOWED_PROVIDERS.includes(provider)) {
    return res.status(400).json({ error: `Unknown provider: ${provider}` });
  }

  // ---------------------------------------------------------------------------
  // Phase 2: Real Amazon API call would go here.
  //
  // Example (Phase 2 implementation):
  //
  // if (provider === "amazon") {
  //   const clientId = process.env.AMAZON_CLIENT_ID;
  //   const clientSecret = process.env.AMAZON_CLIENT_SECRET;
  //   if (!clientId || !clientSecret) {
  //     return res.status(503).json({ error: "Amazon provider not configured" });
  //   }
  //   // Call Amazon Creators API using clientId + clientSecret
  //   // Normalize response to AffiliateProduct[]
  //   // Return normalized products
  // }
  //
  // ---------------------------------------------------------------------------

  // Phase 1: Return stub response
  return res.status(200).json({
    provider,
    country,
    keyword,
    category,
    limit,
    products: [],
    note:
      "Phase 1 stub — products are served from static data in the frontend affiliate layer. " +
      "Phase 2 will replace this with real API calls.",
    phase: 1,
  });
}
