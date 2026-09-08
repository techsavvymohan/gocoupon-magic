/**
 * @file server/routes/shopping.ts
 * @description Express Router for Google Shopping Proxy via SerpAPI with Cache.
 *
 * Endpoint: GET /api/shopping?q=...
 */

import { Router, type Request, type Response } from "express";
import { globalCache } from "../../src/lib/services/cache-service.js";
import { apiRateLimiter } from "../../src/lib/services/rate-limiter.js";
import { recordPriceSnapshot } from "../../src/lib/services/price-tracking-storage.js";

export const shoppingRouter = Router();

const AMAZON_IN_TAG = process.env.VITE_AMAZON_IN_PARTNER_TAG || "gocoupon0e-21";
const CUELINKS_PUB_ID = process.env.VITE_CUELINKS_PUB_ID || "148920";

/**
 * Wraps direct product links with appropriate affiliate redirect or partner tags.
 */
function monetizeProductLink(originalLink: string, source: string, country: string): string {
  if (!originalLink) return "";
  const normSource = (source || "").toLowerCase();

  // Amazon attribution
  if (normSource.includes("amazon") || originalLink.includes("amazon.in")) {
    try {
      const u = new URL(originalLink);
      u.searchParams.set("tag", AMAZON_IN_TAG);
      return u.toString();
    } catch {
      return originalLink.includes("?")
        ? `${originalLink}&tag=${AMAZON_IN_TAG}`
        : `${originalLink}?tag=${AMAZON_IN_TAG}`;
    }
  }

  // Cuelinks wrapper for major Indian retailers
  if (
    country === "in" &&
    CUELINKS_PUB_ID &&
    /^(https?:\/\/)/i.test(originalLink) &&
    !originalLink.includes("google.com/search") &&
    ["flipkart", "croma", "myntra", "reliancedigital", "tatacliq", "ajio", "vijaysales"].some((store) =>
      normSource.includes(store) || originalLink.includes(store)
    )
  ) {
    return `https://linksredirect.com/?pub_id=${CUELINKS_PUB_ID}&url=${encodeURIComponent(originalLink)}`;
  }

  // Global merchants (Walmart, Best Buy, eBay, Back Market, Target, Apple)
  // are automatically monetized by the Skimlinks script injected on the client.
  return originalLink;
}

shoppingRouter.get("/", async (req: Request, res: Response) => {
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

  const q = (req.query.q as string)?.trim() || "";
  const shoprs = (req.query.shoprs as string)?.trim() || "";

  if (!q && !shoprs) {
    res.status(400).json({ error: "Query 'q' or filter token 'shoprs' is required" });
    return;
  }

  const country = ((req.query.gl || req.query.country) as string)?.trim().toLowerCase() || "in";
  const language = ((req.query.hl) as string)?.trim().toLowerCase() || "en";
  const location = ((req.query.location) as string)?.trim() || "";
  const rawDevice = ((req.query.device) as string)?.trim().toLowerCase() || "desktop";
  const device = ["mobile", "tablet"].includes(rawDevice) ? rawDevice : "desktop";
  const sortBy = ((req.query.sort_by) as string)?.trim() || "";
  const minPrice = ((req.query.min_price) as string)?.trim() || "";
  const maxPrice = ((req.query.max_price) as string)?.trim() || "";
  const onSale = req.query.on_sale === "true" || req.query.on_sale === "1";
  const freeShipping = req.query.free_shipping === "true" || req.query.free_shipping === "1";
  const smallBusiness = req.query.small_business === "true" || req.query.small_business === "1";

  // Multi-tier cache key ensures filter queries, device variants, and country variants don't collide
  const cacheKey = `shopping:${country}:${device}:${q.toLowerCase()}:${shoprs}:${sortBy}:${minPrice}:${maxPrice}:${onSale}:${freeShipping}`;
  const cached = await globalCache.get<any>(cacheKey);
  if (cached) {
    res.setHeader("X-Cache", "HIT");
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1800");
    res.json(cached);
    return;
  }

  const serpApiKey = process.env.SERPAPI_API_KEY || process.env.SERPAPI_KEY || "";
  if (!serpApiKey) {
    res.json({
      shopping_results: [],
      categorized_shopping_results: [],
      inline_shopping_results: [],
      filters: [],
      cached: false,
    });
    return;
  }

  try {
    const serpUrl = new URL("https://serpapi.com/search.json");
    serpUrl.searchParams.set("engine", "google_shopping");
    if (q) serpUrl.searchParams.set("q", q);
    if (shoprs) serpUrl.searchParams.set("shoprs", shoprs);
    serpUrl.searchParams.set("gl", country);
    serpUrl.searchParams.set("hl", language);
    serpUrl.searchParams.set("api_key", serpApiKey);
    serpUrl.searchParams.set("device", device);

    if (location) serpUrl.searchParams.set("location", location);
    if (sortBy) serpUrl.searchParams.set("sort_by", sortBy);
    if (minPrice) serpUrl.searchParams.set("min_price", minPrice);
    if (maxPrice) serpUrl.searchParams.set("max_price", maxPrice);
    if (onSale) serpUrl.searchParams.set("on_sale", "true");
    if (freeShipping) serpUrl.searchParams.set("free_shipping", "true");
    if (smallBusiness) serpUrl.searchParams.set("small_business", "true");

    const upstream = await fetch(serpUrl.toString(), { signal: AbortSignal.timeout(12000) });
    if (upstream.ok) {
      const data = await upstream.json();

      const enrichItem = (item: any) => {
        const rawLink = item.product_link || item.link || "";
        const source = item.source || "";
        const monetizedLink = monetizeProductLink(rawLink, source, country);

        return {
          ...item,
          affiliate_link: monetizedLink,
          monetized: monetizedLink !== rawLink,
        };
      };

      // 1. Enrich primary shopping_results
      if (Array.isArray(data.shopping_results)) {
        data.shopping_results = data.shopping_results.map(enrichItem);
      } else {
        data.shopping_results = [];
      }

      // 2. Enrich categorized_shopping_results (e.g. "Manual recliner sofa", "Power recliner sofa", "Deals on Reclining Sofas")
      if (Array.isArray(data.categorized_shopping_results)) {
        data.categorized_shopping_results = data.categorized_shopping_results.map((catGroup: any) => ({
          ...catGroup,
          shopping_results: Array.isArray(catGroup.shopping_results)
            ? catGroup.shopping_results.map(enrichItem)
            : [],
        }));

        // If primary shopping_results is empty or sparse, aggregate categorized products so the comparison UI is populated
        if (data.shopping_results.length === 0) {
          for (const catGroup of data.categorized_shopping_results) {
            if (Array.isArray(catGroup.shopping_results)) {
              for (const itm of catGroup.shopping_results) {
                if (!data.shopping_results.some((existing: any) => existing.product_id === itm.product_id)) {
                  data.shopping_results.push({
                    ...itm,
                    category_title: catGroup.title,
                  });
                }
              }
            }
          }
        }
      }

      // 3. Enrich inline_shopping_results (common on mobile / tablet or top sponsored blocks)
      if (Array.isArray(data.inline_shopping_results)) {
        data.inline_shopping_results = data.inline_shopping_results.map(enrichItem);

        // Fallback aggregation if still empty
        if (data.shopping_results.length === 0) {
          data.shopping_results = [...data.inline_shopping_results];
        }
      }

      // 4. Record lowest price snapshot to Supabase for 90-day history tracking
      const topItem = data.shopping_results[0];
      if (topItem && typeof topItem.extracted_price === "number" && topItem.extracted_price > 0) {
        const skuId = `serp_${topItem.product_id || topItem.title.slice(0, 20).replace(/[^a-zA-Z0-9]/g, "_")}`;
        recordPriceSnapshot(
          skuId,
          topItem.title,
          topItem.source || "Google Shopping",
          topItem.extracted_price,
          topItem.extracted_price,
          null
        ).catch(() => {});
      }

      // Cache valid responses for 30 minutes to protect SerpAPI free quota
      await globalCache.set(cacheKey, data, 30 * 60 * 1000);

      res.setHeader("X-Cache", "MISS");
      res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1800");
      res.json(data);
      return;
    } else {
      console.warn(`[SerpAPI] Upstream responded with status ${upstream.status}`);
    }
  } catch (err: any) {
    console.warn("SerpAPI shopping search error in server/routes/shopping.ts:", err.message);
  }

  res.json({
    shopping_results: [],
    categorized_shopping_results: [],
    inline_shopping_results: [],
    filters: [],
    cached: false,
  });
});
