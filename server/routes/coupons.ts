/**
 * @file server/routes/coupons.ts
 * @description Express Router for Auto-Apply & Directory Coupons.
 *
 * Endpoint: GET /api/coupons?store=... OR ?domain=...
 */

import { Router, type Request, type Response } from "express";
import { CANONICAL_COUPONS } from "../../src/data/canonicalCatalogData.js";
import { sortCoupons, type CouponSortField, type SortOrder } from "../services/sorter.js";
import { normalizeCategoryId, CANONICAL_CATEGORIES } from "../services/taxonomy.js";
import {
  fetchCuelinksCoupons,
  normalizeCuelinksToStoreCoupon,
} from "../services/providers/cuelinks-client.js";

export const couponsRouter = Router();

couponsRouter.get("/", async (req: Request, res: Response) => {
  const store =
    (req.query.store as string) || (req.query.domain as string) || (req.query.merchant as string);
  const category = (req.query.category as string)?.toLowerCase();
  const sortBy = (req.query.sortBy as CouponSortField) || "successRate";
  const order = (req.query.order as SortOrder) || "desc";

  // 1. Fetch relevant live Cuelinks coupons
  let cuelinksCoupons: any[] = [];
  try {
    const cueOffers = await fetchCuelinksCoupons({
      storeNameOrDomain: store,
      category,
      limit: 30,
    });
    cuelinksCoupons = cueOffers.map(normalizeCuelinksToStoreCoupon);
  } catch (err) {
    console.warn("[CouponsRoute] Cuelinks fetch warning:", err);
  }

  // 2. Merge canonical and Cuelinks coupons, deduplicating by code + storeId
  const seenCodes = new Set<string>();
  const combined = [...CANONICAL_COUPONS, ...cuelinksCoupons];
  let filtered = combined.filter((c) => {
    const key = `${c.storeId}_${c.code}`.toLowerCase();
    if (seenCodes.has(key)) return false;
    seenCodes.add(key);
    return true;
  });

  if (store) {
    const s = store
      .toLowerCase()
      .replace("https://", "")
      .replace("http://", "")
      .replace("www.", "")
      .split(".")[0];

    filtered = filtered.filter(
      (c) => c.storeId.toLowerCase().includes(s) || c.storeName.toLowerCase().includes(s)
    );
  }

  if (category && category !== "all") {
    const canonicalCatId = normalizeCategoryId(category);
    const catDef = CANONICAL_CATEGORIES[canonicalCatId];
    if (catDef) {
      filtered = filtered.filter((c) => {
        const text = `${c.title} ${c.description} ${c.storeName}`.toLowerCase();
        return catDef.keywords.some((kw) => text.includes(kw));
      });
    }
  }

  filtered = sortCoupons(filtered, sortBy, order);

  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");
  res.json({
    store: store || "all",
    category: category || "all",
    sortBy,
    order,
    count: filtered.length,
    cuelinksCount: cuelinksCoupons.length,
    coupons: filtered,
  });
});

/**
 * POST /api/coupons/submit
 * Community verified coupon submission endpoint.
 */
couponsRouter.post("/submit", async (req: Request, res: Response) => {
  const { storeName, code, discount, url, terms, category, email } = req.body || {};

  if (!storeName || !code) {
    res.status(400).json({
      success: false,
      error: "Store name and coupon code are required.",
    });
    return;
  }

  try {
    const { recordUserCouponSubmission } = await import("../../src/lib/server-data/deals-db.js");
    const submission = recordUserCouponSubmission({
      storeName: String(storeName).trim(),
      code: String(code).trim().toUpperCase(),
      discount: discount ? String(discount).trim() : undefined,
      url: url ? String(url).trim() : undefined,
      terms: terms ? String(terms).trim() : undefined,
      category: category ? String(category).trim() : undefined,
      email: email ? String(email).trim() : undefined,
    });

    res.status(201).json({
      success: true,
      message: "Thank you! Your coupon has been recorded and submitted for validation.",
      submission,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
