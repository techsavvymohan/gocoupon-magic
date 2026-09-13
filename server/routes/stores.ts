/**
 * @file server/routes/stores.ts
 * @description Express Router for GoCoupon Live Store Directory.
 *
 * Endpoint: GET /api/stores
 * Query params:
 *   category - string  (optional)
 *   q        - string  (optional)
 *   limit    - number  (optional, max 200)
 *   offset   - number  (optional, default 0)
 */

import { Router, type Request, type Response } from "express";
import { queryStores, STORES_DB } from "../../src/lib/server-data/stores-db.js";
import { apiRateLimiter } from "../../src/lib/services/rate-limiter.js";
import { globalCache } from "../../src/lib/services/cache-service.js";

export const storesRouter = Router();

storesRouter.get("/", async (req: Request, res: Response) => {
  const clientIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "127.0.0.1";

  const rateCheck = apiRateLimiter.check(clientIp, 120, 60 * 1000);
  if (!rateCheck.allowed) {
    res.setHeader("Retry-After", String(rateCheck.retryAfterSeconds));
    res.status(429).json({
      error: "Too many requests. Please slow down.",
      retryAfterSeconds: rateCheck.retryAfterSeconds,
    });
    return;
  }

  const category = (req.query.category as string) ?? "";
  const q = (req.query.q as string) ?? "";
  const sortBy = (req.query.sortBy as any) || "popularity";
  const order = (req.query.order as "asc" | "desc") || "desc";
  const rawLimit = parseInt(req.query.limit as string, 10);
  const limit = isNaN(rawLimit) ? 200 : Math.min(rawLimit, 200);
  const rawOffset = parseInt(req.query.offset as string, 10);
  const offset = isNaN(rawOffset) ? 0 : rawOffset;

  const cacheKey = `stores:${category}:${q.toLowerCase()}:${sortBy}:${order}:${limit}:${offset}`;
  const cachedData = await globalCache.get<any>(cacheKey);

  if (cachedData) {
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=120");
    res.json({ ...cachedData, cached: true });
    return;
  }

  try {
    const result = queryStores({ category, q, sortBy, order, limit, offset });
    await globalCache.set(cacheKey, result, 60 * 1000);

    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=120");
    res.json({ ...result, data: result.stores, cached: false });
  } catch (err: any) {
    console.error("[Stores API Error]", err);
    res.status(500).json({
      error: "Failed to retrieve stores from server",
      message: err.message,
    });
  }
});

/**
 * POST /api/stores
 * Create new store
 */
storesRouter.post("/", async (req: Request, res: Response) => {
  try {
    const b = req.body || {};
    const newStore: any = {
      id: b.slug || `store-${Date.now()}`,
      name: b.name || "New Merchant",
      slug: b.slug || "new-store",
      category: b.category || "General",
      logo: b.logoImage || b.logo || "",
      fallbackIcon: "🛍️",
      badge: b.trustStatus || "Verified",
      rating: 4.8,
      couponsCount: 0,
      maxDiscount: "Special Offer",
      cashbackRate: "Available",
      description: b.description || "",
      features: [],
      popularCoupon: {
        code: "",
        description: "Latest verified offers",
        discount: "Up to 50% OFF",
      },
      link: b.affiliateLink || "",
      countryCode: b.countryCode || "IN",
      trustStatus: b.trustStatus || "Verified",
      faq1Question: b.faq1Question,
      faq1Answer: b.faq1Answer,
      faq2Question: b.faq2Question,
      faq2Answer: b.faq2Answer,
      faq3Question: b.faq3Question,
      faq3Answer: b.faq3Answer,
    };

    STORES_DB.unshift(newStore);
    await globalCache.deletePrefix("stores:");
    res.json({ success: true, data: newStore });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/stores
 * Update store
 */
storesRouter.put("/", async (req: Request, res: Response) => {
  try {
    const id = (req.query.id as string) || req.body?.id || req.body?.slug;
    if (!id) {
      res.status(400).json({ success: false, error: "Store ID/Slug required." });
      return;
    }

    const b = req.body || {};
    const idx = STORES_DB.findIndex((s: any) => s.id === id || s.slug === id);
    if (idx >= 0) {
      STORES_DB[idx] = {
        ...STORES_DB[idx],
        name: b.name || STORES_DB[idx].name,
        category: b.category || STORES_DB[idx].category,
        description: b.description || STORES_DB[idx].description,
        link: b.affiliateLink || b.link || STORES_DB[idx].link,
        logo: b.logoImage || b.logo || STORES_DB[idx].logo,
        badge: b.trustStatus || STORES_DB[idx].badge,
      };
      await globalCache.deletePrefix("stores:");
      res.json({ success: true, data: STORES_DB[idx] });
    } else {
      res.status(404).json({ success: false, error: "Store not found." });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/stores
 * Delete store
 */
storesRouter.delete("/", async (req: Request, res: Response) => {
  try {
    const id = (req.query.id as string) || (req.query.slug as string);
    if (!id) {
      res.status(400).json({ success: false, error: "Store ID/Slug required." });
      return;
    }

    const idx = STORES_DB.findIndex((s: any) => s.id === id || s.slug === id);
    if (idx >= 0) {
      STORES_DB.splice(idx, 1);
      await globalCache.deletePrefix("stores:");
      res.json({ success: true, message: `Store ${id} deleted.` });
    } else {
      res.status(404).json({ success: false, error: "Store not found." });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/stores/bulk
 * Bulk store import
 */
storesRouter.post("/bulk", async (req: Request, res: Response) => {
  try {
    const items = req.body?.items || [];
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, error: "Items array is required." });
      return;
    }

    let added = 0;
    for (const b of items) {
      const store: any = {
        id: b.slug || `store-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: b.name || "Merchant Store",
        slug: b.slug || "merchant",
        category: b.category || "General",
        logo: b.logoImage || "",
        fallbackIcon: "🛍️",
        badge: b.trustStatus || "Verified",
        rating: 4.8,
        couponsCount: 0,
        maxDiscount: "Special Offer",
        cashbackRate: "Available",
        description: b.description || "",
        features: [],
        popularCoupon: {
          code: "",
          description: "Exclusive discounts",
          discount: "Best Price",
        },
        link: b.affiliateLink || "",
        countryCode: b.countryCode || "IN",
      };
      STORES_DB.unshift(store);
      added++;
    }

    await globalCache.deletePrefix("stores:");
    res.json({ success: true, count: added, message: `Successfully imported ${added} stores.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
