/**
 * @file server/routes/categories.ts
 * @description Express Router for Categories & Taxonomy Statistics API with Full Admin CRUD.
 *
 * Endpoints:
 * GET /api/categories          - Returns list of categories with live store, deal, and coupon counts
 * GET /api/categories/:id      - Returns single category details
 * POST /api/categories         - Create new category (Admin Auth Required)
 * PUT /api/categories/:id      - Update category by slug (Admin Auth Required)
 * DELETE /api/categories/:id   - Delete category by slug (Admin Auth Required)
 */

import { Router, type Request, type Response } from "express";
import {
  CANONICAL_CATEGORIES,
  getCategoryTaxonomyStats,
  normalizeCategoryId,
  type CategoryDefinition,
} from "../services/taxonomy.js";
import { globalCache } from "../../src/lib/services/cache-service.js";
import { requireAdminAuth } from "./admin.js";
import { settingsDb } from "../services/db.js";

export const categoriesRouter = Router();

export interface CustomCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  subcategories?: string[];
  keywords?: string[];
  popularStores?: string[];
  storesCount?: number;
  dealsCount?: number;
  couponsCount?: number;
}

async function getMergedCategories(): Promise<CustomCategory[]> {
  const canonicalStats = getCategoryTaxonomyStats();
  const customCategories = await settingsDb.getSetting<CustomCategory[]>("categories", []);
  
  const mergedMap = new Map<string, CustomCategory>();
  
  // Base canonical categories
  for (const cat of canonicalStats) {
    mergedMap.set(cat.slug, {
      ...cat,
      description: cat.description || "",
      icon: cat.icon || "🏷️",
    });
  }

  // Overlay/append custom categories
  for (const custom of customCategories) {
    const existing = mergedMap.get(custom.slug);
    if (existing) {
      mergedMap.set(custom.slug, {
        ...existing,
        ...custom,
        storesCount: existing.storesCount || 0,
        dealsCount: existing.dealsCount || 0,
        couponsCount: existing.couponsCount || 0,
      });
    } else {
      mergedMap.set(custom.slug, {
        id: custom.slug,
        name: custom.name,
        slug: custom.slug,
        description: custom.description || "",
        icon: custom.icon || "🏷️",
        subcategories: custom.subcategories || [],
        keywords: custom.keywords || [custom.slug],
        popularStores: custom.popularStores || [],
        storesCount: 0,
        dealsCount: 0,
        couponsCount: 0,
      });
    }
  }

  return Array.from(mergedMap.values());
}

categoriesRouter.get("/", async (_req: Request, res: Response) => {
  const cacheKey = "taxonomy:categories:stats:v2";
  const cached = await globalCache.get<any>(cacheKey);

  if (cached) {
    res.setHeader("X-Cache", "HIT");
    res.setHeader("Cache-Control", "public, max-age=120, s-maxage=300");
    res.json(cached);
    return;
  }

  const categories = await getMergedCategories();
  const totalStores = categories.reduce((sum, c) => sum + (c.storesCount || 0), 0);
  const totalDeals = categories.reduce((sum, c) => sum + (c.dealsCount || 0), 0);
  const totalCoupons = categories.reduce((sum, c) => sum + (c.couponsCount || 0), 0);

  const payload = {
    success: true,
    categories,
    data: categories,
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

categoriesRouter.get("/:id", async (req: Request, res: Response) => {
  const rawId = String(Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id || "")).toLowerCase();
  const categories = await getMergedCategories();
  const category = categories.find((c) => c.slug === rawId || c.id === rawId);

  if (!category) {
    res.status(404).json({ success: false, error: `Category '${rawId}' not found.` });
    return;
  }

  res.json({
    success: true,
    category,
    data: category,
  });
});

/**
 * POST /api/categories
 * Create new category (Admin Auth Required)
 */
categoriesRouter.post("/", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { name, slug, description, icon } = req.body || {};
    const cleanName = String(name || "").trim();
    const cleanSlug = String(slug || cleanName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!cleanName || !cleanSlug) {
      res.status(400).json({ success: false, error: "Category name and slug are required." });
      return;
    }

    const customCategories = await settingsDb.getSetting<CustomCategory[]>("categories", []);
    const exists = customCategories.some((c) => c.slug === cleanSlug);
    if (exists) {
      res.status(409).json({ success: false, error: `Category with slug '${cleanSlug}' already exists.` });
      return;
    }

    const newCategory: CustomCategory = {
      id: cleanSlug,
      name: cleanName,
      slug: cleanSlug,
      description: String(description || "").trim(),
      icon: icon || "🏷️",
      subcategories: [],
      keywords: [cleanSlug],
      popularStores: [],
    };

    customCategories.push(newCategory);
    await settingsDb.setSetting("categories", customCategories);
    await globalCache.deletePrefix("taxonomy:categories:");

    res.status(201).json({
      success: true,
      message: `Category '${cleanName}' created successfully.`,
      data: newCategory,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/categories/:id or PUT /api/categories
 * Update category by slug (Admin Auth Required)
 */
const handleUpdateCategory = async (req: Request, res: Response) => {
  try {
    const targetSlug = String(req.params.id || req.body?.slug || req.query.slug || req.query.id || "").toLowerCase();
    const { name, slug, description, icon } = req.body || {};

    if (!targetSlug) {
      res.status(400).json({ success: false, error: "Category slug is required." });
      return;
    }

    const customCategories = await settingsDb.getSetting<CustomCategory[]>("categories", []);
    const idx = customCategories.findIndex((c) => c.slug === targetSlug || c.id === targetSlug);

    const updatedCategory: CustomCategory = {
      id: slug || targetSlug,
      name: name ? String(name).trim() : (idx >= 0 ? customCategories[idx].name : targetSlug),
      slug: slug ? String(slug).toLowerCase().trim() : targetSlug,
      description: description !== undefined ? String(description).trim() : (idx >= 0 ? customCategories[idx].description : ""),
      icon: icon || (idx >= 0 ? customCategories[idx].icon : "🏷️"),
    };

    if (idx >= 0) {
      customCategories[idx] = { ...customCategories[idx], ...updatedCategory };
    } else {
      customCategories.push(updatedCategory);
    }

    await settingsDb.setSetting("categories", customCategories);
    await globalCache.deletePrefix("taxonomy:categories:");

    res.json({
      success: true,
      message: `Category '${updatedCategory.name}' updated successfully.`,
      data: updatedCategory,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

categoriesRouter.put("/:id", requireAdminAuth, handleUpdateCategory);
categoriesRouter.put("/", requireAdminAuth, handleUpdateCategory);

/**
 * DELETE /api/categories/:id or DELETE /api/categories
 * Delete category by slug (Admin Auth Required)
 */
const handleDeleteCategory = async (req: Request, res: Response) => {
  try {
    const targetSlug = String(req.params.id || req.query.slug || req.query.id || req.body?.slug || "").toLowerCase();

    if (!targetSlug) {
      res.status(400).json({ success: false, error: "Category slug is required." });
      return;
    }

    let customCategories = await settingsDb.getSetting<CustomCategory[]>("categories", []);
    const initialLen = customCategories.length;
    customCategories = customCategories.filter((c) => c.slug !== targetSlug && c.id !== targetSlug);

    await settingsDb.setSetting("categories", customCategories);
    await globalCache.deletePrefix("taxonomy:categories:");

    res.json({
      success: true,
      message: `Category '${targetSlug}' deleted successfully.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

categoriesRouter.delete("/:id", requireAdminAuth, handleDeleteCategory);
categoriesRouter.delete("/", requireAdminAuth, handleDeleteCategory);
