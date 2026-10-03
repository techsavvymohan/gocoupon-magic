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

function extractDomain(linkOrUrl?: string, fallbackSlug?: string): string {
  if (!linkOrUrl) return fallbackSlug ? `${fallbackSlug}.com` : "";
  try {
    if (linkOrUrl.includes("url=")) {
      const u = new URL(linkOrUrl);
      const target = u.searchParams.get("url");
      if (target) {
        return new URL(decodeURIComponent(target)).hostname.replace(/^www\./, "").replace(/^m\./, "");
      }
    } else if (!linkOrUrl.includes("linksredirect") && !linkOrUrl.includes("cuelinks") && !linkOrUrl.includes("admitad")) {
      const u = new URL(linkOrUrl);
      return u.hostname.replace(/^www\./, "").replace(/^m\./, "");
    }
  } catch {}
  return fallbackSlug ? `${fallbackSlug}.com` : "";
}

function detectAffiliateSource(item: any): "cuelinks" | "admitad" | "other" {
  const src = (item.source || item.campaignSource || "").toLowerCase();
  const link = (item.link || item.url || "").toLowerCase();
  const id = (item.id || "").toLowerCase();

  if (src.includes("cuelinks") || link.includes("cuelinks") || link.includes("linksredirect")) {
    return "cuelinks";
  }
  if (
    src.includes("admitad") ||
    link.includes("admitad") ||
    link.includes("lenmit") ||
    id.startsWith("intl-deal") ||
    id.startsWith("admitad")
  ) {
    return "admitad";
  }
  return "other";
}

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
        affiliateSource: asset.affiliateSource || "other",
      });
    }

    // Incorporate all stores from STORES_DB
    for (const store of STORES_DB) {
      const slug = brandAssetsService.normalizeSlug(store.slug || store.name || store.id);
      if (!slug) continue;

      const detectedSource = detectAffiliateSource(store);
      const sAny = store as any;
      const storeDomain = sAny.domain || extractDomain(sAny.affiliateUrl || sAny.url || "", slug);

      if (!assetMap.has(slug)) {
        const logo = store.logo || "";
        const hasLogo = Boolean(logo && !logo.includes("placeholder"));
        assetMap.set(slug, {
          slug,
          name: store.name,
          domain: storeDomain,
          logoUrl: logo,
          source: logo.includes("cloudinary.com") ? "cloudinary" : (logo ? "local" : "manual"),
          affiliateSource: detectedSource,
          updatedAt: new Date().toISOString(),
          hasLogo,
          dealCount: 0,
          storeExists: true,
        });
      } else {
        const item = assetMap.get(slug);
        item.storeExists = true;
        if (!item.domain || item.domain === `${slug}.com`) {
          item.domain = storeDomain;
        }
        if (item.affiliateSource === "other" && detectedSource !== "other") {
          item.affiliateSource = detectedSource;
        }
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
        const cleanName = (deal.storeName || "").replace(/\s+(Coupons|Offers|Deals|Store|Promo Codes|India)$/i, "").trim();
        const slug = brandAssetsService.normalizeSlug(deal.storeSlug || cleanName);
        if (!slug) continue;

        const detectedSource = detectAffiliateSource(deal);
        const dealDomain = extractDomain(deal.link || deal.url, slug);

        if (assetMap.has(slug)) {
          const item = assetMap.get(slug);
          item.dealCount = (item.dealCount || 0) + 1;
          if (item.affiliateSource === "other" && detectedSource !== "other") {
            item.affiliateSource = detectedSource;
          }
          if ((!item.domain || item.domain.endsWith(".com")) && dealDomain && dealDomain !== `${slug}.com`) {
            item.domain = dealDomain;
          }
        } else {
          // Discover new brand from live deals
          assetMap.set(slug, {
            slug,
            name: cleanName || deal.storeName,
            domain: dealDomain,
            logoUrl: deal.storeLogo || "",
            source: deal.storeLogo?.includes("cloudinary.com") ? "cloudinary" : "manual",
            affiliateSource: detectedSource,
            updatedAt: new Date().toISOString(),
            hasLogo: Boolean(deal.storeLogo && deal.storeLogo.trim() !== "" && !deal.storeLogo.includes("placeholder")),
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
    const slug = String(req.params.slug || "");
    const { name, domain, logoUrl, source, affiliateSource } = req.body;

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
      affiliateSource,
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
 * Auto-fetch single brand logo by domain and upload directly to Cloudinary
 */
brandAssetsRouter.post("/auto-fetch", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { name, domain, affiliateSource } = req.body;
    if (!name || typeof name !== "string") {
      res.status(400).json({ success: false, error: "Missing required 'name' field." });
      return;
    }

    const asset = await brandAssetsService.autoFetchAndUpload(name, domain, affiliateSource);

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
 * POST /api/admin/brand-assets/batch-autofetch
 * Batch auto-fetch and Cloudinary upload for Cuelinks and/or Admitad brands
 */
brandAssetsRouter.post("/batch-autofetch", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { source = "both", force = false, limit = 400 } = req.body;
    const liveDeals = getLiveDealsPool();

    // Map unique targeted affiliate brands
    const brandMap = new Map<string, { name: string; slug: string; domain: string; affiliateSource: "cuelinks" | "admitad" | "other" }>();

    for (const deal of liveDeals) {
      const affSource = detectAffiliateSource(deal);
      if (source === "cuelinks" && affSource !== "cuelinks") continue;
      if (source === "admitad" && affSource !== "admitad") continue;
      if (source === "both" && affSource !== "cuelinks" && affSource !== "admitad") continue;

      const cleanName = (deal.storeName || "").replace(/\s+(Coupons|Offers|Deals|Store|Promo Codes|India)$/i, "").trim();
      const slug = brandAssetsService.normalizeSlug(deal.storeSlug || cleanName);
      if (!slug) continue;

      const domain = extractDomain(deal.link || deal.url, slug);

      if (!brandMap.has(slug)) {
        brandMap.set(slug, {
          name: cleanName || deal.storeName,
          slug,
          domain,
          affiliateSource: affSource,
        });
      }
    }

    const targets = Array.from(brandMap.values()).slice(0, limit);
    let succeeded = 0;
    let skipped = 0;
    let failed = 0;
    const errors: Array<{ brand: string; error: string }> = [];

    // Process with polite concurrency (3 parallel uploads)
    const concurrency = 3;
    for (let i = 0; i < targets.length; i += concurrency) {
      const chunk = targets.slice(i, i + concurrency);
      await Promise.all(
        chunk.map(async (t) => {
          const existing = brandAssetsService.get(t.slug);
          if (!force && existing?.logoUrl && existing.source === "cloudinary") {
            skipped++;
            return;
          }
          try {
            await brandAssetsService.autoFetchAndUpload(t.name, t.domain, t.affiliateSource);
            succeeded++;
          } catch (err: any) {
            failed++;
            errors.push({ brand: t.name, error: err.message });
          }
        })
      );
    }

    res.json({
      success: true,
      total: targets.length,
      succeeded,
      skipped,
      failed,
      errors: errors.slice(0, 10),
      message: `Batch auto-fetch finished: ${succeeded} logos uploaded to Cloudinary, ${skipped} already existed, ${failed} failed.`,
    });
  } catch (err: any) {
    console.error("[Batch AutoFetch Error]:", err);
    res.status(500).json({ success: false, error: err.message || "Batch auto-fetch failed" });
  }
});

/**
 * DELETE /api/admin/brand-assets/:slug
 * Reset or remove a brand asset
 */
brandAssetsRouter.delete("/:slug", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug || "");
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
