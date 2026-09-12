/**
 * @file server/routes/stack.ts
 * @description API route handlers for Stacking Calculator and Bank Card Offers.
 */

import { Router, type Request, type Response } from "express";
import { calculateStackedSavings, type StackRequest } from "../services/stack-calculator.js";
import { getActiveBankOffers, type RegionCode } from "../services/bank-offers.js";
import { resolveGeoProfile } from "../services/geo-resolver.js";

import {
  fetchCuelinksCoupons,
  normalizeCuelinksToStoreCoupon,
} from "../services/providers/cuelinks-client.js";

export const stackRouter = Router();

/**
 * POST /api/stack/evaluate
 * Evaluates 4-tier stacked savings: (Sticker - Coupon - Bank Offer - Cashback + Shipping/Duty)
 */
stackRouter.post("/evaluate", async (req: Request, res: Response) => {
  const body = req.body || {};
  const geo = resolveGeoProfile(req.headers);

  let liveCoupons = body.availableCoupons;
  if (!liveCoupons || !Array.isArray(liveCoupons) || liveCoupons.length === 0) {
    try {
      const cueOffers = await fetchCuelinksCoupons({ limit: 40 });
      liveCoupons = cueOffers.map(normalizeCuelinksToStoreCoupon);
    } catch {}
  }

  const stackRequest: StackRequest = {
    productId: body.productId,
    productTitle: body.productTitle,
    storeName: body.storeName || "Amazon India",
    storeSlug: body.storeSlug,
    stickerPrice: parseFloat(body.stickerPrice) || 0,
    currency: body.currency || geo.currency,
    region: (body.region as RegionCode) || geo.region,
    preferredBankCard: body.preferredBankCard,
    userCashbackRate: body.userCashbackRate !== undefined ? parseFloat(body.userCashbackRate) : undefined,
    isCrossBorderImport: Boolean(body.isCrossBorderImport),
    internationalShippingFee: parseFloat(body.internationalShippingFee) || 0,
    customsDutyPercent: parseFloat(body.customsDutyPercent) || undefined,
    availableCoupons: liveCoupons,
  };

  const result = calculateStackedSavings(stackRequest);

  res.setHeader("Cache-Control", "no-store");
  res.json({
    success: true,
    geoProfile: {
      detectedRegion: geo.region,
      country: geo.countryName,
      defaultCurrency: geo.currency,
    },
    stack: result,
  });
});

export const bankOffersRouter = Router();

function handleBankOffers(req: Request, res: Response) {
  const store = typeof req.query.store === "string" ? req.query.store : "*";
  const region = typeof req.query.region === "string" ? (req.query.region.toUpperCase() as RegionCode) : undefined;
  const cartAmount = req.query.cartAmount ? parseFloat(String(req.query.cartAmount)) : undefined;

  const activeOffers = getActiveBankOffers({
    storeNameOrSlug: store,
    region,
    cartAmount,
  });

  res.setHeader("Cache-Control", "public, max-age=300");
  res.json({
    totalActiveOffers: activeOffers.length,
    region: region || "ALL",
    store,
    offers: activeOffers,
  });
}

bankOffersRouter.get("/", handleBankOffers);
stackRouter.get("/bank-offers", handleBankOffers);
