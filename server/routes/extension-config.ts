/**
 * @file server/routes/extension-config.ts
 * @description Remote Selector Hydration & Extension Config API router.
 *
 * Allows the browser extension to dynamically fetch the latest DOM selectors
 * without requiring Chrome Web Store republishing when merchants change their HTML.
 */

import { Router, type Request, type Response } from "express";

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
};

/**
 * GET /api/extension/selectors.json
 * Remote hydration endpoint called on extension initialization.
 */
extensionRouter.get("/selectors.json", (_req: Request, res: Response) => {
  res.setHeader("Cache-Control", "public, max-age=300"); // 5 minutes cache
  res.json({
    version: "2026.1.0",
    lastUpdated: "2026-09-08T00:00:00Z",
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
