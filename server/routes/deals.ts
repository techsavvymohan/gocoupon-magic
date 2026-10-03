import { resolveStoreLogo } from "../../src/lib/services/store-logo-resolver.js";
/**
 * @file server/routes/deals.ts
 * @description Express Router for GoCoupon Live Deals & Offers Feed.
 *
 * Connected 24/7 directly to Cuelinks API v3 with automatic expiration pruning.
 *
 * Endpoints:
 *   GET  /api/deals                - Live filtered, searched, sorted & paginated offers
 *   GET  /api/deals/popular-brands - Top popular brands with dynamic counts & logos
 *   POST /api/deals/submit         - Submit community verified coupon/offer
 *   GET  /api/deals/submissions    - View submitted community coupons
 *   GET  /api/deals/festivals      - Curated festive shopping deals
 *   GET  /api/deals/sync           - Trigger immediate on-demand Cuelinks 24/7 sync
 *   POST /api/deals/sync           - Trigger immediate on-demand Cuelinks 24/7 sync
 *   GET  /api/deals/stats          - Live sync health & counts
 */

import { Router, type Request, type Response } from "express";
import {
  queryDeals,
  getPopularBrandsFromPool,
  getAllStoresFromPool,
  getAllCategoriesFromPool,
  recordUserCouponSubmission,
  getUserCouponSubmissions,
  type DealBadge,
  type DealRecord,
} from "../../src/lib/server-data/deals-db.js";
import { apiRateLimiter } from "../../src/lib/services/rate-limiter.js";
import { globalCache } from "../../src/lib/services/cache-service.js";
import {
  getLiveDealsPool,
  getLiveSyncStats,
  syncLiveCuelinksDeals,
  addDealToPool,
  deleteDealFromPool,
} from "../services/providers/cuelinks-client.js";
import { recordNewSubmission, requireAdminAuth } from "./admin.js";
import { dealsDb, submissionsDb, storesDb } from "../services/db.js";
import { upsertStoreInDb } from "../../src/lib/server-data/stores-db.js";
import { brandAssetsService } from "../services/brand-assets-service.js";

export const dealsRouter = Router();

/**
 * GET /api/deals/popular-brands
 * Serves aggregated top popular brands with dynamic coupon and offer counts.
 */
dealsRouter.get("/popular-brands", async (_req: Request, res: Response) => {
  try {
    const livePool = getLiveDealsPool();
    let brands = getPopularBrandsFromPool(livePool);
    brands = brands.map((b) => {
      const brandLogo = brandAssetsService.getLogoUrl(b.slug || b.name);
      return brandLogo ? { ...b, logo: brandLogo } : b;
    });
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");
    res.json({
      success: true,
      total: brands.length,
      brands,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/deals/categories
 * Serves real aggregated categories from the live deals pool with live offer and coupon counts.
 */
dealsRouter.get("/categories", async (_req: Request, res: Response) => {
  try {
    const livePool = getLiveDealsPool();
    const categories = getAllCategoriesFromPool(livePool);
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");
    res.json({
      success: true,
      total: categories.length,
      categories,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/deals/stores
 * Serves all real stores from the live deals pool with dynamic counts and logo metadata.
 */
dealsRouter.get("/stores", async (_req: Request, res: Response) => {
  try {
    const livePool = getLiveDealsPool();
    const stores = getAllStoresFromPool(livePool);
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");
    res.json({
      success: true,
      total: stores.length,
      stores,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/deals/submit
 * Receives user-submitted coupons and deals for verification.
 * Automatically injects them into the active deals pool as part of "New Deals".
 */
dealsRouter.post("/submit", async (req: Request, res: Response) => {
  const clientIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "127.0.0.1";

  const rateCheck = apiRateLimiter.check(`deal-submit:${clientIp}`, 5, 10 * 60 * 1000);
  if (!rateCheck.allowed) {
    res.setHeader("Retry-After", String(rateCheck.retryAfterSeconds));
    res.status(429).json({
      success: false,
      error: `Too many submissions. Please try again in ${rateCheck.retryAfterSeconds} seconds.`,
      retryAfterSeconds: rateCheck.retryAfterSeconds,
    });
    return;
  }

  const { storeName, code, discount, url, terms, category, email } = req.body || {};

  if (!storeName || !code) {
    res.status(400).json({
      success: false,
      error: "Store name and coupon code are required.",
    });
    return;
  }

  try {
    const submission = recordUserCouponSubmission({
      storeName: String(storeName).trim(),
      code: String(code).trim().toUpperCase(),
      discount: discount ? String(discount).trim() : undefined,
      url: url ? String(url).trim() : undefined,
      terms: terms ? String(terms).trim() : undefined,
      category: category ? String(category).trim() : undefined,
      email: email ? String(email).trim() : undefined,
    });

    // Also persist in the Admin Submissions review queue
    recordNewSubmission({
      storeName: String(storeName).trim(),
      code: String(code).trim().toUpperCase(),
      discount: discount ? String(discount).trim() : undefined,
      url: url ? String(url).trim() : undefined,
      terms: terms ? String(terms).trim() : undefined,
      category: category ? String(category).trim() : undefined,
      email: email ? String(email).trim() : undefined,
    });

    // Ingest into active deals pool (existing deals + live deals + new deals)
    const newDeal: DealRecord = {
      id: `cue_user_${submission.id}`,
      storeName: submission.storeName,
      storeSlug: submission.storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") + "-coupons",
      storeLogo: `https://www.google.com/s2/favicons?domain=${submission.storeName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com&sz=128`,
      category: (submission.category as any) || "General",
      title: submission.discount ? `${submission.discount} at ${submission.storeName}` : `Verified Offer at ${submission.storeName}`,
      code: submission.code,
      discount: submission.discount || "Verified Deal",
      badge: "Verified",
      verifiedDate: "Live Verified",
      expiresIn: "30 days left",
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      terms: submission.terms || `Community verified offer for ${submission.storeName}.`,
      link: submission.url || `https://${submission.storeName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
      usesCount: 50,
      source: "community",
      verified: false,
      status: "pending",
      type: "coupon",
    };
    addDealToPool(newDeal);
    dealsDb.upsertDeals([newDeal]).catch((e) => console.warn("[Deals DB Upsert Warning]:", e.message));
    await globalCache.deletePrefix("deals:");

    res.status(201).json({
      success: true,
      message: "Thank you! Your coupon has been recorded and added to the active live feed.",
      submission,
      deal: newDeal,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/deals/submissions
 * Retrieves community coupon submissions from PostgreSQL / local cache.
 */
dealsRouter.get("/submissions", async (_req: Request, res: Response) => {
  try {
    const submissions = await submissionsDb.getSubmissions();
    res.json({
      total: submissions.length,
      submissions,
    });
  } catch (err: any) {
    const fallback = getUserCouponSubmissions();
    res.json({
      total: fallback.length,
      submissions: fallback,
    });
  }
});

/**
 * GET /api/deals/festivals
 * Serves curated festival & mega sale offers.
 */
dealsRouter.get("/festivals", async (req: Request, res: Response) => {
  const livePool = getLiveDealsPool();
  const result = queryDeals({ festive: true, limit: 50 }, livePool);
  res.setHeader("Cache-Control", "public, max-age=180");
  res.json({
    festival: "Festive Super Sales & Mega Offers",
    total: result.total,
    deals: result.deals,
  });
});

/**
 * GET /api/deals
 * Serves live, verified, non-expired offers from the 24/7 Cuelinks engine.
 * Supports category, q, store, brand, letter, festive, city, badge, sortBy, order, limit, offset.
 */
dealsRouter.get("/", async (req: Request, res: Response) => {
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
  const store = (req.query.store as string) || (req.query.merchant as string) || "";
  const brand = (req.query.brand as string) ?? "";
  const letter = (req.query.letter as string)?.trim().toUpperCase() ?? "";
  const festive = req.query.festive === "true" || req.query.festive === "1";
  const featured = req.query.featured !== undefined ? req.query.featured === "true" || req.query.featured === "1" : undefined;
  const includeExpired = req.query.includeExpired === "true" || req.query.includeExpired === "1";
  const city = (req.query.city as string) ?? "";
  const badge = (req.query.badge as DealBadge) ?? undefined;
  const sortBy = (req.query.sortBy as any) || "trending";
  const order = (req.query.order as "asc" | "desc") || "desc";
  const rawLimit = req.query.limit !== undefined ? parseInt(req.query.limit as string, 10) : 0;
  const limit = isNaN(rawLimit) || rawLimit < 0 ? 0 : rawLimit;
  const rawOffset = parseInt(req.query.offset as string, 10);
  const offset = isNaN(rawOffset) || rawOffset < 0 ? 0 : rawOffset;

  const cacheKey = `deals:${category}:${store}:${brand}:${letter}:${festive}:${featured}:${includeExpired}:${city}:${badge ?? "all"}:${q.toLowerCase()}:${sortBy}:${order}:${limit}:${offset}`;
  const cachedData = await globalCache.get<any>(cacheKey);

  if (cachedData) {
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=120");
    res.json({ ...cachedData, cached: true });
    return;
  }

  try {
    // 1. Ingest live Cuelinks deals from 24/7 memory pool (existing + live + new deals)
    const livePool = getLiveDealsPool();

    // 2. Query, filter, sort and paginate (with automatic expired pruning unless includeExpired is true)
    const result = queryDeals(
      { category, q, store, brand, letter, festive, featured, includeExpired, city, badge, sortBy, order, limit, offset },
      livePool
    );

    const stampedDeals = result.deals.map((deal: any) => {
      if (deal.storeLogo && deal.storeLogo.includes("cloudinary.com")) {
        return deal;
      }
      const brandLogo = brandAssetsService.getLogoUrl(deal.storeSlug || deal.storeName);
      if (brandLogo && brandLogo.includes("cloudinary.com")) {
        return { ...deal, storeLogo: brandLogo };
      }
      const resolved = resolveStoreLogo(deal.storeName || deal.store, deal.link, undefined, deal.storeLogo);
      if (resolved && resolved.includes("cloudinary.com")) {
        return { ...deal, storeLogo: resolved };
      }
      return deal;
    });

    const stats = getLiveSyncStats();
    const isUncapped = limit === 0;
    const responsePayload = {
      ...result,
      deals: stampedDeals,
      data: stampedDeals,
      count: stampedDeals.length,
      page: isUncapped ? 1 : Math.floor(offset / limit) + 1,
      hasMore: isUncapped ? false : offset + limit < result.total,
      isDynamic: true,
      provider: "Cuelinks API v3 (24/7 Auto-Sync)",
      lastSyncedAt: stats.lastSyncedAt,
      cached: false,
    };

    await globalCache.set(cacheKey, responsePayload, 60 * 1000);

    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=120");
    res.json(responsePayload);
  } catch (err: any) {
    console.error("[Deals API Error]", err);
    res.status(500).json({
      error: "Failed to retrieve deals from server",
      message: err.message,
    });
  }
});

/**
 * GET & POST /api/deals/sync
 * Triggers an immediate 24/7 sync with Cuelinks API v3.
 */
async function handleSync(req: Request, res: Response) {
  try {
    const pages = parseInt(req.query.pages as string, 10) || 0;
    const result = await syncLiveCuelinksDeals(pages);
    await globalCache.deletePrefix("deals:");
    // Sync to PostgreSQL cloud database in background
    dealsDb
      .upsertDeals(getLiveDealsPool())
      .catch((e) => console.warn("[Deals Live Pool Cloud Sync Warning]:", e.message));
    res.json({
      success: true,
      message: `24/7 sync completed. ${result.activeCount} active deals ingested, ${result.expiredCount} expired pruned.`,
      updatedAt: result.updatedAt,
      activeCount: result.activeCount,
      expiredCount: result.expiredCount,
      totalFetched: result.totalFetched,
    });
  } catch (err: any) {
    console.error("[Deals Sync Error]", err);
    res.status(500).json({
      success: false,
      error: "Failed to sync with Cuelinks API v3",
      message: err?.message,
    });
  }
}

dealsRouter.get("/sync", handleSync);
dealsRouter.post("/sync", handleSync);

/**
 * GET /api/deals/stats
 * Exposes live sync health, deal counts, and expiration pruning metrics.
 */
dealsRouter.get("/stats", (_req: Request, res: Response) => {
  const stats = getLiveSyncStats();
  res.json({
    status: "healthy",
    ...stats,
    is24x7Active: true,
  });
});

/**
 * POST /api/deals (or /api/offers)
 * Admin & manual offer creation
 */
dealsRouter.post("/", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const b = req.body || {};
    const storeSlug = b.storeSlug || (b.storeName ? b.storeName.toLowerCase().replace(/[^a-z0-9]/g, "-") : "online-store");
    const link = b.affiliateLink || b.url || "https://gocoupon.io";
    const newDeal: DealRecord = {
      id: b.id || `offer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: b.title || "Special Offer",
      description: b.description || "",
      storeName: b.storeName || "Online Store",
      storeSlug,
      category: b.category || "General",
      code: b.code || "",
      discount: b.discount || (b.code ? "Special Discount" : "Exclusive Deal"),
      badge: b.badge || "Verified",
      verifiedDate: "Today",
      expiresIn: "30 days",
      terms: b.terms || "Standard merchant terms apply.",
      link,
      usesCount: b.usesCount || 1,
      url: link,
      merchantUrl: b.merchantUrl || b.url || "",
      imageUrl: b.imageUrl || b.storeLogo || b.logoUrl || "",
      storeLogo: b.storeLogo || b.imageUrl || b.logoUrl || "",
      endDate: b.expiryDate || b.endDate || new Date(Date.now() + 365 * 86400000).toISOString(),
      verified: true,
      votesCount: 1,
      rating: 4.8,
      source: b.source || "admin",
      status: b.status || "active",
      type: b.type || (b.code ? "Coupon" : "Deal"),
      isFeatured: b.isFeatured === true || b.isFeatured === "true" || b.isFeatured === 1,
      featuredPriority: b.featuredPriority ? Number(b.featuredPriority) : 100,
      campaignSource: b.campaignSource || "manual",
      targetCountry: b.targetCountry || "India",
      verificationStatus: b.verificationStatus || "verified",
    };

    addDealToPool(newDeal);
    await dealsDb.upsertDeals([newDeal]);

    // Auto-upsert store to STORES_DB, live-stores.json, and Supabase PostgreSQL gocoupon_stores
    if (newDeal.storeSlug && newDeal.storeName) {
      const savedStore = upsertStoreInDb({
        slug: newDeal.storeSlug,
        name: newDeal.storeName,
        logo: newDeal.storeLogo || newDeal.imageUrl || "",
        category: newDeal.category || "General",
        link: newDeal.link || `/store/${newDeal.storeSlug}`,
        affiliateLink: newDeal.link || "",
        popularCoupon: {
          code: newDeal.code || "",
          description: newDeal.title || "Featured discount offer",
          discount: newDeal.discount || "Special Offer",
        },
      });
      await storesDb.upsertStore(savedStore).catch((e) =>
        console.warn("[Stores DB Auto-Upsert Warning]:", e.message)
      );
      globalCache.deletePrefix("stores:").catch(() => {});
    }

    await globalCache.deletePrefix("deals:");
    res.json({ success: true, data: newDeal });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/deals (or /api/offers)
 * Admin offer update
 */
const handleUpdateDeal = async (req: Request, res: Response) => {
  try {
    const id = (req.params?.id as string) || (req.query.id as string) || req.body?.id;
    if (!id) {
      res.status(400).json({ success: false, error: "Offer ID is required." });
      return;
    }

    const b = req.body || {};
    const storeSlug = b.storeSlug || (b.storeName ? b.storeName.toLowerCase().replace(/[^a-z0-9]/g, "-") : "online-store");
    const link = b.affiliateLink || b.url || "https://gocoupon.io";
    const updatedDeal: DealRecord = {
      id,
      title: b.title,
      description: b.description,
      storeName: b.storeName,
      storeSlug,
      category: b.category || "General",
      code: b.code || "",
      discount: b.discount || (b.code ? "Special Discount" : "Exclusive Deal"),
      badge: b.badge || "Verified",
      verifiedDate: "Today",
      expiresIn: "30 days",
      terms: b.terms || "Standard merchant terms apply.",
      link,
      usesCount: b.usesCount || 1,
      url: link,
      merchantUrl: b.merchantUrl || b.url || "",
      imageUrl: b.imageUrl || b.storeLogo || b.logoUrl || "",
      storeLogo: b.storeLogo || b.imageUrl || b.logoUrl || "",
      endDate: b.expiryDate || b.endDate || new Date(Date.now() + 365 * 86400000).toISOString(),
      verified: true,
      source: b.source || "admin",
      status: b.status || "active",
      type: b.type || (b.code ? "Coupon" : "Deal"),
      isFeatured: b.isFeatured === true || b.isFeatured === "true" || b.isFeatured === 1,
      featuredPriority: b.featuredPriority ? Number(b.featuredPriority) : 100,
      campaignSource: b.campaignSource || "manual",
      targetCountry: b.targetCountry || "India",
      verificationStatus: b.verificationStatus || "verified",
    };

    addDealToPool(updatedDeal);
    await dealsDb.upsertDeals([updatedDeal]);

    // Auto-upsert store to STORES_DB, live-stores.json, and Supabase PostgreSQL gocoupon_stores
    if (updatedDeal.storeSlug && updatedDeal.storeName) {
      const savedStore = upsertStoreInDb({
        slug: updatedDeal.storeSlug,
        name: updatedDeal.storeName,
        logo: updatedDeal.storeLogo || updatedDeal.imageUrl || "",
        category: updatedDeal.category || "General",
        link: updatedDeal.link || `/store/${updatedDeal.storeSlug}`,
        affiliateLink: updatedDeal.link || "",
        popularCoupon: {
          code: updatedDeal.code || "",
          description: updatedDeal.title || "Featured discount offer",
          discount: updatedDeal.discount || "Special Offer",
        },
      });
      await storesDb.upsertStore(savedStore).catch((e) =>
        console.warn("[Stores DB Auto-Upsert Warning]:", e.message)
      );
      globalCache.deletePrefix("stores:").catch(() => {});
    }
    await globalCache.deletePrefix("deals:");
    res.json({ success: true, data: updatedDeal });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

dealsRouter.put("/", requireAdminAuth, handleUpdateDeal);
dealsRouter.put("/:id", requireAdminAuth, handleUpdateDeal);

/**
 * DELETE /api/deals (or /api/offers)
 * Admin offer delete
 */
const handleDeleteDeal = async (req: Request, res: Response) => {
  try {
    const id = (req.params.id as string) || (req.query.id as string) || req.body?.id;
    if (!id) {
      res.status(400).json({ success: false, error: "Offer ID is required." });
      return;
    }

    deleteDealFromPool(id);
    await dealsDb.deleteDeal(id);
    await globalCache.deletePrefix("deals:");
    res.json({ success: true, message: `Offer ${id} removed.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

dealsRouter.delete("/", requireAdminAuth, handleDeleteDeal);
dealsRouter.delete("/:id", requireAdminAuth, handleDeleteDeal);

/**
 * POST /api/deals/bulk (or /api/offers/bulk)
 * Admin bulk import
 */
dealsRouter.post("/bulk", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    let items = req.body?.items;
    if (!items && req.body?.rows) {
      items = typeof req.body.rows === "string" ? JSON.parse(req.body.rows) : req.body.rows;
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, error: "Items or rows array is required." });
      return;
    }

    let addedCount = 0;
    for (const item of items) {
      const storeSlug = item.storeSlug || (item.storeName ? item.storeName.toLowerCase().replace(/[^a-z0-9]/g, "-") : "online-store");
      const link = item.affiliateLink || item.url || "https://gocoupon.io";
      const deal: DealRecord = {
        id: item.id || `bulk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: item.title || "Exclusive Offer",
        description: item.description || "",
        storeName: item.storeName || item.storeSlug || "Store",
        storeSlug,
        category: item.category || "General",
        code: item.code || "",
        discount: item.discount || (item.code ? "Promo Discount" : "Deal"),
        badge: item.badge || "Verified",
        verifiedDate: "Today",
        expiresIn: "30 days",
        terms: item.terms || "Standard merchant terms apply.",
        link,
        usesCount: item.usesCount || 1,
        url: link,
        merchantUrl: item.merchantUrl || "",
        imageUrl: item.imageUrl || "",
        endDate: item.expiryDate || item.endDate || new Date(Date.now() + 30 * 86400000).toISOString(),
        verified: true,
        source: "bulk_import",
        status: "active",
        type: item.type || (item.code ? "Coupon" : "Deal"),
      };
      addDealToPool(deal);
      addedCount++;
    }

    if (items.length > 0) {
      dealsDb.upsertDeals(getLiveDealsPool()).catch((e) => console.warn("[Deals DB Bulk Upsert Warning]:", e.message));
    }

    await globalCache.deletePrefix("deals:");
    res.json({
      success: true,
      count: addedCount,
      data: { successfullyAdded: addedCount, errors: [] },
      message: `Successfully imported ${addedCount} offers.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
