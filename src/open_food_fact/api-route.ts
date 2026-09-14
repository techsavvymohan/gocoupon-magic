/**
 * @file src/open_food_fact/api-route.ts
 * @description Express API routes for Open Food Facts product intelligence & store coupon matching.
 */

import { Router, type Request, type Response } from "express";
import { fetchProductByBarcode, searchFoodProducts, sanitizeBarcode } from "./client.js";
import { buildFoodProductComparison } from "./store-matcher.js";

export const openFoodFactRouter = Router();

/**
 * GET /api/open-food-fact/barcode/:barcode
 * Fetch food product details by standard barcode (EAN-13, UPC)
 */
openFoodFactRouter.get("/barcode/:barcode", async (req: Request, res: Response) => {
  const param = req.params.barcode;
  const rawBarcode = Array.isArray(param) ? param[0] : (param ?? "");
  const barcode = sanitizeBarcode(rawBarcode);

  if (!barcode) {
    res.status(400).json({
      success: false,
      message: "Invalid barcode provided. Please provide a numeric barcode (UPC or EAN).",
    });
    return;
  }

  try {
    const product = await fetchProductByBarcode(barcode);

    if (!product) {
      res.status(404).json({
        success: false,
        barcode,
        message: "No product found in Open Food Facts database for this barcode.",
      });
      return;
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    console.error(`[OpenFoodFacts API] Barcode lookup error (${barcode}):`, error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve product data from Open Food Facts.",
    });
  }
});

/**
 * GET /api/open-food-fact/search?q=...&limit=8
 * Search products by keyword
 */
openFoodFactRouter.get("/search", async (req: Request, res: Response) => {
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const limit = parseInt(typeof req.query.limit === "string" ? req.query.limit : "8", 10) || 8;

  if (!query || query.length < 2) {
    res.status(400).json({
      success: false,
      message: "Search query must be at least 2 characters long.",
    });
    return;
  }

  try {
    const products = await searchFoodProducts(query, Math.min(limit, 20));

    res.json({
      success: true,
      count: products.length,
      query,
      products,
    });
  } catch (error: any) {
    console.error(`[OpenFoodFacts API] Search error ("${query}"):`, error);
    res.status(500).json({
      success: false,
      message: "Failed to execute Open Food Facts search.",
    });
  }
});

/**
 * GET /api/open-food-fact/compare/:barcode
 * Fetch product details and bundled multi-store grocery coupons & affiliate links
 */
openFoodFactRouter.get("/compare/:barcode", async (req: Request, res: Response) => {
  const param = req.params.barcode;
  const rawBarcode = Array.isArray(param) ? param[0] : (param ?? "");
  const barcode = sanitizeBarcode(rawBarcode);

  if (!barcode) {
    res.status(400).json({
      success: false,
      message: "Invalid barcode provided.",
    });
    return;
  }

  try {
    const product = await fetchProductByBarcode(barcode);

    if (!product) {
      res.status(404).json({
        success: false,
        barcode,
        message: "No product found for this barcode to compare.",
      });
      return;
    }

    const comparison = await buildFoodProductComparison(product, barcode);

    res.json({
      success: true,
      data: comparison,
    });
  } catch (error: any) {
    console.error(`[OpenFoodFacts API] Compare error (${barcode}):`, error);
    res.status(500).json({
      success: false,
      message: "Failed to build store comparison.",
    });
  }
});

/**
 * GET /api/open-food-fact/status
 * Health and integration metadata
 */
openFoodFactRouter.get("/status", (_req: Request, res: Response) => {
  res.json({
    success: true,
    module: "open_food_fact",
    provider: "Open Food Facts Open REST API v2",
    license: "Open Database License (ODbL)",
    activeFeatures: ["Barcode Lookup", "Grocery Search", "Nutri-Score", "NOVA Group", "Store Coupon Matching"],
  });
});
