/**
 * @file server/routes/categories.ts
 * @description Express Router for Categories & Taxonomy Statistics API.
 *
 * Endpoints:
 * GET /api/categories      - Returns list of canonical categories with live store, deal, and coupon counts
 * GET /api/categories/:id  - Returns single category details
 */

import { Router, type Request, type Response } from "express";
import {
  CANONICAL_CATEGORIES,
  getCategoryTaxonomyStats,
  normalizeCategoryId,
} from "../services/taxonomy.js";
import { globalCache } from "../../src/lib/services/cache-service.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", async (_req: Request, res: Response) => {
  const cacheKey = "taxonomy:categories:stats";
  const cached = await globalCache.get<any>(cacheKey);

  if (cached) {
    res.setHeader("X-Cache", "HIT");
    res.setHeader("Cache-Control", "public, max-age=120, s-maxage=300");
    res.json(cached);
    return;
  }

  const categories = getCategoryTaxonomyStats();
  const totalStores = categories.reduce((sum, c) => sum + c.storesCount, 0);
  const totalDeals = categories.reduce((sum, c) => sum + c.dealsCount, 0);
  const totalCoupons = categories.reduce((sum, c) => sum + c.couponsCount, 0);

  const payload = {
    categories,
    totalCategories: categories.length,
    totals: {
      stores: totalStores,
      deals: totalDeals,
      coupons: totalCoupons,
    },
  };

  await globalCache.set(cacheKey, payload, 2 * 60 * 1000);

  res.setHeader("X-Cache", "MISS");
  res.setHeader("Cache-Control", "public, max-age=120, s-maxage=300");
  res.json(payload);
});

categoriesRouter.get("/:id", (req: Request, res: Response) => {
  const rawId = String(Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id || ""));
  const canonicalId = normalizeCategoryId(rawId);
  const category = CANONICAL_CATEGORIES[canonicalId];

  if (!category) {
    res.status(404).json({ error: `Category '${rawId}' not found` });
    return;
  }

  res.json({
    category,
    canonicalId,
  });
});
