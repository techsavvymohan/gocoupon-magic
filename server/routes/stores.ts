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
import { queryStores, STORES_DB, upsertStoreInDb } from "../../src/lib/server-data/stores-db.js";
import { apiRateLimiter } from "../../src/lib/services/rate-limiter.js";
import { globalCache } from "../../src/lib/services/cache-service.js";
import { storesDb } from "../services/db.js";
import { requireAdminAuth } from "./admin.js";
import { brandAssetsService } from "../services/brand-assets-service.js";

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
    const stampedStores = result.stores.map((s: any) => {
      const canonicalLogo = brandAssetsService.getLogoUrl(s.slug || s.name || s.id);
      if (canonicalLogo) {
        return { ...s, logo: canonicalLogo };
      }
      return s;
    });

    const payload = { ...result, stores: stampedStores, data: stampedStores, cached: false };
    await globalCache.set(cacheKey, payload, 60 * 1000);

    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=120");
    res.json(payload);
  } catch (err: any) {
    console.error("[Stores API Error]", err);
    res.status(500).json({
      error: "Failed to retrieve stores from server",
      message: err.message,
    });
  }
});

/**
 * Helper to process store update
 */
async function handleStoreUpdate(idOrSlug: string, b: any, res: Response) {
  const slug = idOrSlug.toLowerCase();
  const idx = STORES_DB.findIndex((s: any) => s.id?.toLowerCase() === slug || s.slug?.toLowerCase() === slug);
  
  const existing = idx >= 0 ? STORES_DB[idx] : null;
  const updatedStore: any = {
    id: existing?.id || slug,
    name: b.name || existing?.name || "Merchant Store",
    slug: b.slug ? b.slug.toLowerCase() : (existing?.slug || slug),
    category: b.category || existing?.category || "General",
    description: b.description || existing?.description || "",
    link: b.affiliateLink || b.link || existing?.link || "",
    logo: b.logoImage || b.logo || existing?.logo || "",
    badge: b.trustStatus || b.badge || existing?.badge || "Verified",
    rating: Number(b.rating || existing?.rating || 4.8),
    cashbackRate: b.cashbackRate || existing?.cashbackRate || "Available",
    couponsCount: Number(b.couponsCount || existing?.couponsCount || 0),
    offersCount: Number(b.offersCount || (existing as any)?.offersCount || 0),
  };

  const savedStore = upsertStoreInDb(updatedStore);

  // Persist to Supabase PostgreSQL cloud database
  await storesDb.upsertStore(savedStore).catch((e) =>
    console.warn("[Stores DB Upsert Warning]:", e.message)
  );

  await globalCache.deletePrefix("stores:");
  return res.json({ success: true, data: savedStore });
}

/**
 * Helper to process store delete
 */
async function handleStoreDelete(idOrSlug: string, res: Response) {
  const slug = idOrSlug.toLowerCase();
  const idx = STORES_DB.findIndex((s: any) => s.id?.toLowerCase() === slug || s.slug?.toLowerCase() === slug);
  if (idx >= 0) {
    STORES_DB.splice(idx, 1);
  }

  // Delete from Supabase PostgreSQL cloud database
  await storesDb.deleteStore(slug).catch((e) =>
    console.warn("[Stores DB Delete Warning]:", e.message)
  );

  await globalCache.deletePrefix("stores:");
  return res.json({ success: true, message: `Store ${idOrSlug} deleted.` });
}

/**
 * POST /api/stores
 * Create new store (Secured with Admin Auth)
 */
storesRouter.post("/", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const b = req.body || {};
    const slug = (b.slug || b.name || `store-${Date.now()}`).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const newStore: any = {
      id: slug,
      name: b.name || "New Merchant",
      slug,
      category: b.category || "General",
      logo: b.logoImage || b.logo || "",
      fallbackIcon: "",
      badge: b.trustStatus || "Verified",
      rating: Number(b.rating) || 4.8,
      couponsCount: Number(b.couponsCount) || 1,
      maxDiscount: b.maxDiscount || "Special Offer",
      cashbackRate: b.cashbackRate || "Available",
      description: b.description || `Verified promo codes, deals, and vouchers for ${b.name || "this store"}.`,
      features: [],
      popularCoupon: {
        code: b.code || "",
        description: b.couponDescription || "Latest verified offers",
        discount: b.discount || "Up to 50% OFF",
      },
      link: b.affiliateLink || b.link || "",
      countryCode: b.countryCode || "IN",
      trustStatus: b.trustStatus || "Verified",
      faq1Question: b.faq1Question,
      faq1Answer: b.faq1Answer,
      faq2Question: b.faq2Question,
      faq2Answer: b.faq2Answer,
      faq3Question: b.faq3Question,
      faq3Answer: b.faq3Answer,
    };

    const savedStore = upsertStoreInDb(newStore);

    // Persist directly to Supabase PostgreSQL cloud database
    await storesDb.upsertStore(savedStore).catch((e) =>
      console.warn("[Stores DB Upsert Warning]:", e.message)
    );

    await globalCache.deletePrefix("stores:");
    res.status(201).json({ success: true, data: savedStore });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/stores/:slug
 * Update store by URL slug (Called by AdminStoresManager)
 */
storesRouter.put("/:slug", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug || "");
    if (!slug) {
      res.status(400).json({ success: false, error: "Store slug required." });
      return;
    }
    await handleStoreUpdate(slug, req.body || {}, res);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/stores
 * Update store by query param or body id
 */
storesRouter.put("/", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const id = String((req.query.id as string) || req.body?.id || req.body?.slug || "");
    if (!id) {
      res.status(400).json({ success: false, error: "Store ID/Slug required." });
      return;
    }
    await handleStoreUpdate(id, req.body || {}, res);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/stores/:slug
 * Delete store by URL slug (Called by AdminStoresManager)
 */
storesRouter.delete("/:slug", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug || "");
    if (!slug) {
      res.status(400).json({ success: false, error: "Store slug required." });
      return;
    }
    await handleStoreDelete(slug, res);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/stores
 * Delete store by query param id or slug
 */
storesRouter.delete("/", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const id = (req.query.id as string) || (req.query.slug as string);
    if (!id) {
      res.status(400).json({ success: false, error: "Store ID/Slug required." });
      return;
    }
    await handleStoreDelete(id, res);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/stores/bulk
 * Bulk store import (Secured with Admin Auth)
 */
storesRouter.post("/bulk", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    let items = req.body?.items;
    if (!items && req.body?.rows) {
      items = typeof req.body.rows === "string" ? JSON.parse(req.body.rows) : req.body.rows;
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, error: "Items or rows array is required." });
      return;
    }

    const createdStores: any[] = [];
    for (const b of items) {
      const slug = (b.slug || b.name || `store-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const store: any = {
        id: slug,
        name: b.name || "Merchant Store",
        slug,
        category: b.category || "General",
        logo: b.logoImage || b.logo || "",
        fallbackIcon: "",
        badge: b.trustStatus || "Verified",
        rating: Number(b.rating) || 4.8,
        couponsCount: Number(b.couponsCount) || 0,
        maxDiscount: b.maxDiscount || "Special Offer",
        cashbackRate: b.cashbackRate || "Available",
        description: b.description || "",
        features: [],
        popularCoupon: {
          code: "",
          description: "Exclusive discounts",
          discount: "Best Price",
        },
        link: b.affiliateLink || b.link || "",
        countryCode: b.countryCode || "IN",
      };

      const existingIdx = STORES_DB.findIndex((s: any) => s.slug === slug || s.id === slug);
      if (existingIdx >= 0) {
        STORES_DB[existingIdx] = { ...STORES_DB[existingIdx], ...store };
      } else {
        STORES_DB.unshift(store);
      }
      createdStores.push(store);
    }

    // Persist bulk stores to Supabase PostgreSQL cloud database
    await storesDb.upsertStores(createdStores).catch((e) =>
      console.warn("[Stores DB Bulk Upsert Warning]:", e.message)
    );

    await globalCache.deletePrefix("stores:");
    res.json({
      success: true,
      count: createdStores.length,
      data: { successfullyImported: createdStores.length, errors: [] },
      message: `Successfully imported ${createdStores.length} stores.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

