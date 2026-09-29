/**
 * @file server/routes/brand-assets.ts
 * @description Admin API Routes for Brand Assets & Cloudinary Logo Management.
 */

import { Router, type Request, type Response } from "express";
import { requireAdminAuth } from "./admin.js";
import { brandAssetsService } from "../services/brand-assets-service.js";
import { STORES_DB, upsertStoreInDb } from "../../src/lib/server-data/stores-db.js";
import { getLiveDealsPool } from "../services/providers/cuelinks-client.js";
import { storesDb } from "../services/db.js";

export const brandAssetsRouter = Router();

/**
 * GET /api/admin/brand-assets
 * Returns all brand assets combined with stores and live deals brands.
 */
brandAssetsRouter.get("/", requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    const existingAssets = brandAssetsService.getAll();
    const assetMap = new Map<string, any>();

    // Index existing registered assets
    for (const asset of existingAssets) {
      assetMap.set(asset.slug, {
        ...asset,
        hasLogo: Boolean(asset.logoUrl && asset.logoUrl.trim() !== ""),
        dealCount: 0,
        storeExists: false,
      });
    }

    // Incorporate all stores from STORES_DB
    for (const store of STORES_DB) {
      const slug = brandAssetsService.normalizeSlug(store.slug || store.name || store.id);
      if (!slug) continue;

      if (!assetMap.has(slug)) {
        const logo = store.logo || "";
        const hasLogo = Boolean(logo && !logo.includes("placeholder"));
        assetMap.set(slug, {
          slug,
          name: store.name,
          domain: `${slug}.com`,
          logoUrl: logo,
          source: logo.includes("cloudinary.com") ? "cloudinary" : (logo ? "local" : "manual"),
          updatedAt: new Date().toISOString(),
          hasLogo,
          dealCount: 0,
          storeExists: true,
        });
      } else {
        const item = assetMap.get(slug);
        item.storeExists = true;
        if (!item.hasLogo && store.logo && !store.logo.includes("placeholder")) {
          item.logoUrl = store.logo;
          item.hasLogo = true;
        }
      }
    }

    // Calculate deal counts from live deals pool
    try {
      const liveDeals = getLiveDealsPool();
      for (const deal of liveDeals) {
        const slug = brandAssetsService.normalizeSlug(deal.storeSlug || deal.storeName);
        if (!slug) continue;

        if (assetMap.has(slug)) {
          const item = assetMap.get(slug);
          item.dealCount = (item.dealCount || 0) + 1;
        } else {
          // Discover new brand from live deals
          assetMap.set(slug, {
            slug,
            name: deal.storeName,
            domain: `${slug}.com`,
            logoUrl: deal.storeLogo || "",
            source: "manual",
            updatedAt: new Date().toISOString(),
            hasLogo: Boolean(deal.storeLogo && deal.storeLogo.trim() !== ""),
            dealCount: 1,
            storeExists: false,
          });
        }
      }
    } catch {}

    const allBrands = Array.from(assetMap.values()).sort((a, b) => {
      // Sort: Brands with more deals or stores first, then alphabetical
      if ((b.dealCount || 0) !== (a.dealCount || 0)) {
        return (b.dealCount || 0) - (a.dealCount || 0);
      }
      return a.name.localeCompare(b.name);
    });

    const withLogos = allBrands.filter((b) => b.hasLogo).length;
    const missingLogos = allBrands.length - withLogos;

    res.json({
      success: true,
      total: allBrands.length,
      withLogos,
      missingLogos,
      brands: allBrands,
    });
  } catch (err: any) {
    console.error("[BrandAssets API Error]:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to retrieve brand assets" });
  }
});

/**
 * PUT /api/admin/brand-assets/:slug
 * Update or set Cloudinary logo URL for a brand
 */
brandAssetsRouter.put("/:slug", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { name, domain, logoUrl, source } = req.body;

    if (!logoUrl || typeof logoUrl !== "string" || !logoUrl.trim()) {
      res.status(400).json({ success: false, error: "Missing or invalid 'logoUrl' field." });
      return;
    }

    const updated = await brandAssetsService.upsert({
      slug,
      name: name || slug,
      domain,
      logoUrl: logoUrl.trim(),
      source: source || (logoUrl.includes("cloudinary.com") ? "cloudinary" : "manual"),
    });

    // Also synchronize to matching store in STORES_DB if present
    const storeIdx = STORES_DB.findIndex(
      (s: any) => s.slug?.toLowerCase() === slug.toLowerCase() || s.id?.toLowerCase() === slug.toLowerCase()
    );
    if (storeIdx >= 0) {
      STORES_DB[storeIdx].logo = updated.logoUrl;
      upsertStoreInDb(STORES_DB[storeIdx]);
      storesDb.upsertStore(STORES_DB[storeIdx]).catch(() => {});
    }

    res.json({
      success: true,
      data: updated,
      message: `Brand logo updated for ${updated.name}.`,
    });
  } catch (err: any) {
    console.error("[BrandAssets Update Error]:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to update brand asset" });
  }
});

/**
 * POST /api/admin/brand-assets/auto-fetch
 * Auto-fetch brand logo by domain and upload directly to Cloudinary
 */
brandAssetsRouter.post("/auto-fetch", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { name, domain } = req.body;
    if (!name || typeof name !== "string") {
      res.status(400).json({ success: false, error: "Missing required 'name' field." });
      return;
    }

    const asset = await brandAssetsService.autoFetchAndUpload(name, domain);

    // Synchronize to matching store
    const storeIdx = STORES_DB.findIndex(
      (s: any) => s.slug?.toLowerCase() === asset.slug.toLowerCase() || s.id?.toLowerCase() === asset.slug.toLowerCase()
    );
    if (storeIdx >= 0) {
      STORES_DB[storeIdx].logo = asset.logoUrl;
      upsertStoreInDb(STORES_DB[storeIdx]);
      storesDb.upsertStore(STORES_DB[storeIdx]).catch(() => {});
    }

    res.json({
      success: true,
      data: asset,
      message: `Successfully auto-fetched and uploaded Cloudinary logo for ${asset.name}.`,
    });
  } catch (err: any) {
    console.error("[BrandAssets AutoFetch Error]:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to auto-fetch brand logo" });
  }
});

/**
 * DELETE /api/admin/brand-assets/:slug
 * Reset or remove a brand asset
 */
brandAssetsRouter.delete("/:slug", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    await brandAssetsService.delete(slug);

    // Also clear from STORES_DB if present
    const storeIdx = STORES_DB.findIndex(
      (s: any) => s.slug?.toLowerCase() === slug.toLowerCase() || s.id?.toLowerCase() === slug.toLowerCase()
    );
    if (storeIdx >= 0) {
      STORES_DB[storeIdx].logo = "";
      upsertStoreInDb(STORES_DB[storeIdx]);
      storesDb.upsertStore(STORES_DB[storeIdx]).catch(() => {});
    }

    res.json({ success: true, message: `Brand asset reset for ${slug}.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to delete brand asset" });
  }
});
