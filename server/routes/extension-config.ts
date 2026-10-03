/**
 * @file server/routes/extension-config.ts
 * @description Remote Selector Hydration & Extension Config API router.
 *
 * Allows the browser extension to dynamically fetch the latest DOM selectors
 * without requiring Chrome Web Store republishing when merchants change their HTML.
 */

import { Router, type Request, type Response } from "express";
import { dealsDb } from "../services/db.js";

export const extensionRouter = Router();

export interface MerchantSelectorConfig {
  domain: string;
  name: string;
  cartCouponBox: {
    inputSelector: string;
    applyButtonSelector: string;
    successMessageSelector: string;
    errorMessageSelector: string;
    discountAmountSelector?: string;
  };
  productPageHud: {
    buyNowButtonSelector: string;
    priceContainerSelector: string;
    injectionAnchor: "before" | "after" | "inside";
  };
  supportedFeatures: {
    autoApply: boolean;
    savingsHud: boolean;
    crossStoreArbitrage: boolean;
  };
}

const SELECTORS_CONFIG: Record<string, MerchantSelectorConfig> = {
  "amazon.in": {
    domain: "amazon.in",
    name: "Amazon India",
    cartCouponBox: {
      inputSelector: "input[name='claimCode'], #spc-gcpromoinput, #claimCode",
      applyButtonSelector: "input[name='applycode'], #spc-gcpromoinput-button, button:contains('Apply')",
      successMessageSelector: ".a-alert-success, #pmts-claim-code-success-message",
      errorMessageSelector: ".a-alert-error, #pmts-claim-code-error-message",
      discountAmountSelector: "#subtotals-marketplace-table .grand-total-price",
    },
    productPageHud: {
      buyNowButtonSelector: "#buy-now-button, #submit.buy-now",
      priceContainerSelector: "#corePrice_feature_div, .priceToPay",
      injectionAnchor: "before",
    },
    supportedFeatures: {
      autoApply: true,
      savingsHud: true,
      crossStoreArbitrage: true,
    },
  },
  "amazon.com": {
    domain: "amazon.com",
    name: "Amazon US",
    cartCouponBox: {
      inputSelector: "input[name='claimCode'], #spc-gcpromoinput",
      applyButtonSelector: "input[name='applycode'], #spc-gcpromoinput-button",
      successMessageSelector: ".a-alert-success",
      errorMessageSelector: ".a-alert-error",
    },
    productPageHud: {
      buyNowButtonSelector: "#buy-now-button",
      priceContainerSelector: "#corePrice_feature_div",
      injectionAnchor: "before",
    },
    supportedFeatures: {
      autoApply: true,
      savingsHud: true,
      crossStoreArbitrage: true,
    },
  },
  "flipkart.com": {
    domain: "flipkart.com",
    name: "Flipkart",
    cartCouponBox: {
      inputSelector: "input[placeholder*='coupon' i], input[placeholder*='code' i]",
      applyButtonSelector: "button:contains('Apply'), span:contains('APPLY')",
      successMessageSelector: "._2N4B8S",
      errorMessageSelector: "._1fO6uC",
    },
    productPageHud: {
      buyNowButtonSelector: "button._2KpZ6l._2U9uOA._3v1-ww, button:contains('BUY NOW')",
      priceContainerSelector: "._30jeq3._16Jk6d",
      injectionAnchor: "before",
    },
    supportedFeatures: {
      autoApply: true,
      savingsHud: true,
      crossStoreArbitrage: true,
    },
  },
  "walmart.com": {
    domain: "walmart.com",
    name: "Walmart US",
    cartCouponBox: {
      inputSelector: "input#promo-code-input",
      applyButtonSelector: "button#apply-promo-button",
      successMessageSelector: "[data-automation-id='promo-success-msg']",
      errorMessageSelector: "[data-automation-id='promo-error-msg']",
    },
    productPageHud: {
      buyNowButtonSelector: "[data-automation-id='add-to-cart']",
      priceContainerSelector: "[itemprop='price']",
      injectionAnchor: "before",
    },
    supportedFeatures: {
      autoApply: true,
      savingsHud: true,
      crossStoreArbitrage: true,
    },
  },
  "myntra.com": {
    domain: "myntra.com",
    name: "Myntra",
    cartCouponBox: {
      inputSelector: "input.coupon-input, input[placeholder*='coupon' i]",
      applyButtonSelector: "button.apply-coupon, button:contains('Apply')",
      successMessageSelector: ".coupon-success",
      errorMessageSelector: ".coupon-error",
    },
    productPageHud: {
      buyNowButtonSelector: "button.btn-add-to-bag, a[data-position='BUY_NOW']",
      priceContainerSelector: ".pdp-price",
      injectionAnchor: "before",
    },
    supportedFeatures: {
      autoApply: true,
      savingsHud: true,
      crossStoreArbitrage: true,
    },
  },
  "meesho.com": {
    domain: "meesho.com",
    name: "Meesho",
    cartCouponBox: {
      inputSelector: "input[placeholder*='coupon' i]",
      applyButtonSelector: "button:contains('Apply'), button:contains('APPLY')",
      successMessageSelector: "[class*='success']",
      errorMessageSelector: "[class*='error']",
    },
    productPageHud: {
      buyNowButtonSelector: "button[class*='buy-now'], button:contains('Buy Now')",
      priceContainerSelector: "[class*='price']",
      injectionAnchor: "before",
    },
    supportedFeatures: {
      autoApply: false,
      savingsHud: true,
      crossStoreArbitrage: true,
    },
  },
  "nykaa.com": {
    domain: "nykaa.com",
    name: "Nykaa",
    cartCouponBox: {
      inputSelector: "input[placeholder*='coupon' i], input.coupon-code",
      applyButtonSelector: "button.apply-btn, button:contains('Apply')",
      successMessageSelector: ".coupon-applied",
      errorMessageSelector: ".coupon-invalid",
    },
    productPageHud: {
      buyNowButtonSelector: "button[data-action='addToCart']",
      priceContainerSelector: ".css-1jczs19",
      injectionAnchor: "before",
    },
    supportedFeatures: {
      autoApply: false,
      savingsHud: true,
      crossStoreArbitrage: false,
    },
  },
  "ajio.com": {
    domain: "ajio.com",
    name: "AJIO",
    cartCouponBox: {
      inputSelector: "input[placeholder*='coupon' i]",
      applyButtonSelector: "button:contains('Apply')",
      successMessageSelector: "[class*='couponApplied']",
      errorMessageSelector: "[class*='error']",
    },
    productPageHud: {
      buyNowButtonSelector: "button[class*='buynow']",
      priceContainerSelector: "[class*='price-container']",
      injectionAnchor: "before",
    },
    supportedFeatures: {
      autoApply: false,
      savingsHud: true,
      crossStoreArbitrage: false,
    },
  },
};

/**
 * GET /api/extension/selectors.json
 * Remote hydration endpoint called on extension initialization.
 */
extensionRouter.get("/selectors.json", (_req: Request, res: Response) => {
  res.setHeader("Cache-Control", "public, max-age=300"); // 5 minutes cache
  res.json({
    version: "2026.2.0",
    lastUpdated: new Date().toISOString(),
    merchants: SELECTORS_CONFIG,
  });
});

/**
 * GET /api/extension/ping
 * Extension heartbeat and health check.
 */
extensionRouter.get("/ping", (req: Request, res: Response) => {
  const version = req.query.v || "unknown";
  res.json({
    status: "online",
    serverTimestamp: new Date().toISOString(),
    clientVersion: version,
    recommendedMinVersion: "1.0.0",
  });
});

/**
 * GET /api/extension/coupons
 * Returns all active coupons from PostgreSQL database for a given merchant domain or name.
 * Real-time unified feed connecting:
 * 1. Community submitted coupons (approved or live)
 * 2. Cuelinks 24/7 synchronized offers
 * 3. Admitad global affiliate coupons
 */
extensionRouter.get("/coupons", async (req: Request, res: Response) => {
  try {
    const rawDomain = (req.query.domain as string || "").toLowerCase().trim();
    const rawStore = (req.query.store as string || "").toLowerCase().trim();

    // Extract core merchant brand keyword (e.g., 'amazon.in' -> 'amazon', 'myntra.com' -> 'myntra')
    let brandKeyword = rawStore;
    if (!brandKeyword && rawDomain) {
      brandKeyword = rawDomain
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split(".")[0];
    }

    if (!brandKeyword) {
      res.status(400).json({ success: false, error: "domain or store query parameter is required" });
      return;
    }

    const allDeals = await dealsDb.getDeals({
      search: brandKeyword,
      limit: 50,
    });

    const coupons = allDeals.map((d) => ({
      id: d.id,
      code: d.code || "",
      title: d.title,
      discount: d.discount,
      category: d.category,
      badge: d.badge || "Verified",
      verified: d.verified ?? true,
      usesCount: d.usesCount || 1,
      terms: d.terms || "Standard merchant terms apply.",
      source: d.source || "community-verified",
      link: d.link,
      isAutoApplyEligible: Boolean(d.code && d.code.length > 1),
    }));

    res.setHeader("Cache-Control", "public, max-age=60"); // 1 min fast edge cache
    res.json({
      success: true,
      store: brandKeyword,
      domain: rawDomain,
      total: coupons.length,
      autoApplyCount: coupons.filter((c) => c.isAutoApplyEligible).length,
      coupons,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/extension/verify-report
 * Receives coupon application results from the browser extension in real-time.
 * Automatically increments use counts, improves confidence rating, and sets verifiedDate to "Just now".
 */
extensionRouter.post("/verify-report", async (req: Request, res: Response) => {
  try {
    const { code, store, success, discountApplied, couponId } = req.body || {};
    if (!code || !store) {
      res.status(400).json({ success: false, error: "code and store are required" });
      return;
    }

    console.log(`[Extension Telemetry] Coupon ${code} on ${store}: ${success ? "SUCCESS" : "FAILED"}`);

    // Update deals database in memory & Supabase if matching deal found
    const allDeals = await dealsDb.getDeals({ search: store, limit: 10 });
    const targetDeal = allDeals.find(
      (d) => d.code && d.code.toUpperCase() === String(code).toUpperCase().trim()
    );

    if (targetDeal) {
      if (success) {
        targetDeal.usesCount = (targetDeal.usesCount || 0) + 1;
        targetDeal.verified = true;
        targetDeal.verifiedDate = "Just now";
        targetDeal.badge = "Verified";
      }
      await dealsDb.upsertDeals([targetDeal]).catch(() => {});
    }

    res.json({
      success: true,
      message: "Telemetry reported successfully",
      updatedDealId: targetDeal?.id || null,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
