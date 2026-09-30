/**
 * @file server/routes/products.ts
 * @description Product Catalog & Comparison Hub API Routes for Admin & Public consumption.
 *
 * Provides full CRUD for products displayed on comparison routes, homepage featured products,
 * and managed in the Admin Suite (AdminProductsManager).
 */

import { Router, type Request, type Response } from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { requireAdminAuth } from "./admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productsFilePath = path.resolve(__dirname, "../data/products.json");

export interface ProductItem {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  image?: string;
  price: number | string;
  originalPrice?: number | string;
  ctaLabel?: string;
  status: "Active" | "Draft" | "Out of stock";
  storeSlug: string;
  storeName: string;
  brand?: string;
  category?: string;
  subcategory?: string;
  rating?: number;
  reviewCount?: number;
  updatedAt?: string;
}

function readProducts(): ProductItem[] {
  try {
    if (fs.existsSync(productsFilePath)) {
      const raw = fs.readFileSync(productsFilePath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("[Products API] Error reading products file:", err);
  }
  return [];
}

function writeProducts(products: ProductItem[]): boolean {
  try {
    const dir = path.dirname(productsFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("[Products API] Error writing products file:", err);
    return false;
  }
}

export const productsRouter = Router();

/**
 * GET /api/products
 * Fetch all products or filter by storeSlug, search query, or status.
 */
productsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { storeSlug, status, search, limit } = req.query;
    let products = readProducts();

    if (storeSlug && typeof storeSlug === "string" && storeSlug !== "all") {
      products = products.filter((p) => p.storeSlug.toLowerCase() === storeSlug.toLowerCase());
    }

    if (status && typeof status === "string") {
      products = products.filter((p) => p.status.toLowerCase() === status.toLowerCase());
    }

    if (search && typeof search === "string") {
      const q = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.storeName?.toLowerCase().includes(q)
      );
    }

    if (limit && !isNaN(Number(limit))) {
      products = products.slice(0, Number(limit));
    }

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || "Failed to fetch products" });
  }
});

/**
 * GET /api/products/:id
 * Retrieve a single product by ID or slug.
 */
productsRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const products = readProducts();
    const product = products.find((p) => p.id === id || p.slug === id);

    if (!product) {
      res.status(404).json({ success: false, error: `Product not found: ${id}` });
      return;
    }

    res.json({ success: true, data: product });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || "Failed to fetch product" });
  }
});

/**
 * POST /api/products
 * Create a new product entry (Admin only).
 */
productsRouter.post("/", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    if (!body.title) {
      res.status(400).json({ success: false, error: "Product title is required." });
      return;
    }

    const products = readProducts();
    const newId = body.id || `prod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const slug =
      body.slug ||
      body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const newProduct: ProductItem = {
      id: newId,
      title: body.title,
      slug,
      description: body.description || "",
      image: body.image || body.imageUrl || "",
      price: Number(body.price) || 0,
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      ctaLabel: body.ctaLabel || "View Product",
      status: body.status || "Active",
      storeSlug: body.storeSlug || "amazon",
      storeName: body.storeName || "Amazon India",
      brand: body.brand || "",
      category: body.category || "Electronics",
      subcategory: body.subcategory || "",
      rating: body.rating ? Number(body.rating) : 4.7,
      reviewCount: body.reviewCount ? Number(body.reviewCount) : 100,
      updatedAt: new Date().toISOString(),
    };

    products.unshift(newProduct);
    writeProducts(products);

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: newProduct,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || "Failed to create product" });
  }
});

/**
 * PUT /api/products/:id
 * Update an existing product (Admin only).
 */
productsRouter.put("/:id", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const products = readProducts();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      res.status(404).json({ success: false, error: `Product not found: ${id}` });
      return;
    }

    const current = products[index];
    const updated: ProductItem = {
      ...current,
      ...body,
      id: current.id, // Immutable ID
      price: body.price !== undefined ? Number(body.price) : current.price,
      originalPrice: body.originalPrice !== undefined ? Number(body.originalPrice) : current.originalPrice,
      updatedAt: new Date().toISOString(),
    };

    products[index] = updated;
    writeProducts(products);

    res.json({
      success: true,
      message: "Product updated successfully.",
      data: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || "Failed to update product" });
  }
});

/**
 * DELETE /api/products/:id
 * Remove a product from the catalog (Admin only).
 */
productsRouter.delete("/:id", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let products = readProducts();
    const exists = products.some((p) => p.id === id);

    if (!exists) {
      res.status(404).json({ success: false, error: `Product not found: ${id}` });
      return;
    }

    products = products.filter((p) => p.id !== id);
    writeProducts(products);

    res.json({
      success: true,
      message: "Product deleted successfully.",
      id,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || "Failed to delete product" });
  }
});
