/**
 * @file src/open_food_fact/client.ts
 * @description Rate-friendly, cached client for the Open Food Facts public API.
 * Uses descriptive User-Agent as required by Open Food Facts terms.
 */

import type { FoodProduct, NutriScoreGrade, NovaGroup } from "./types.js";

const OFF_BASE_URL = "https://world.openfoodfacts.org";
const USER_AGENT = "GoCoupon-App/1.0 (https://gocoupon.io; support@gocoupon.io)";
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes in-memory cache

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const barcodeCache = new Map<string, CacheEntry<FoodProduct | null>>();
const searchCache = new Map<string, CacheEntry<FoodProduct[]>>();

/**
 * Normalize Nutri-Score grade to "a" | "b" | "c" | "d" | "e" | "unknown"
 */
export function normalizeNutriScore(grade?: string | null): NutriScoreGrade {
  if (!grade) return "unknown";
  const clean = grade.toLowerCase().trim();
  if (["a", "b", "c", "d", "e"].includes(clean)) {
    return clean as NutriScoreGrade;
  }
  return "unknown";
}

/**
 * Normalize NOVA group to 1 | 2 | 3 | 4 | null
 */
export function normalizeNovaGroup(group?: number | string | null): NovaGroup {
  if (!group) return null;
  const num = typeof group === "number" ? group : parseInt(group, 10);
  if ([1, 2, 3, 4].includes(num)) {
    return num as NovaGroup;
  }
  return null;
}

/**
 * Sanitize barcode: strips spaces, dashes, letters
 */
export function sanitizeBarcode(raw: string): string {
  return raw.replace(/[^0-9]/g, "").trim();
}

/**
 * Fetch product details by barcode (EAN-13, UPC-A, etc.) from Open Food Facts
 */
export async function fetchProductByBarcode(rawBarcode: string): Promise<FoodProduct | null> {
  const barcode = sanitizeBarcode(rawBarcode);
  if (!barcode || barcode.length < 6 || barcode.length > 14) {
    return null;
  }

  // Check in-memory cache
  const cached = barcodeCache.get(barcode);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  try {
    const fields = [
      "code",
      "product_name",
      "product_name_en",
      "generic_name",
      "brands",
      "quantity",
      "image_url",
      "image_front_url",
      "image_front_small_url",
      "nutriscore_grade",
      "nova_group",
      "ecoscore_grade",
      "categories",
      "ingredients_text_en",
      "stores",
    ].join(",");

    const url = `${OFF_BASE_URL}/api/v2/product/${encodeURIComponent(barcode)}.json?fields=${fields}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      if (res.status === 404) {
        barcodeCache.set(barcode, { data: null, expiresAt: Date.now() + CACHE_TTL_MS });
      }
      return null;
    }

    const json = (await res.json()) as any;
    if (!json || json.status !== 1 || !json.product) {
      barcodeCache.set(barcode, { data: null, expiresAt: Date.now() + CACHE_TTL_MS });
      return null;
    }

    const p = json.product;
    const productName = (p.product_name || p.product_name_en || p.generic_name || "").trim();

    if (!productName) {
      barcodeCache.set(barcode, { data: null, expiresAt: Date.now() + CACHE_TTL_MS });
      return null;
    }

    const product: FoodProduct = {
      barcode: p.code || barcode,
      product_name: productName,
      brands: p.brands ? p.brands.trim() : "Brand Verified",
      quantity: p.quantity ? p.quantity.trim() : undefined,
      image_url: p.image_url || p.image_front_url || p.image_front_small_url || undefined,
      nutriscore_grade: normalizeNutriScore(p.nutriscore_grade),
      nova_group: normalizeNovaGroup(p.nova_group),
      ecoscore_grade: p.ecoscore_grade || undefined,
      categories: p.categories || undefined,
      ingredients_text: p.ingredients_text_en || undefined,
      stores: p.stores || undefined,
    };

    barcodeCache.set(barcode, { data: product, expiresAt: Date.now() + CACHE_TTL_MS });
    return product;
  } catch (error) {
    console.error(`[OpenFoodFacts] Error fetching barcode ${barcode}:`, error);
    return null;
  }
}

/**
 * Search packaged food and grocery products by keyword query
 */
export async function searchFoodProducts(query: string, limit: number = 8): Promise<FoodProduct[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery || cleanQuery.length < 2) {
    return [];
  }

  const cacheKey = `${cleanQuery.toLowerCase()}_${limit}`;
  const cached = searchCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  try {
    const params = new URLSearchParams({
      search_terms: cleanQuery,
      search_simple: "1",
      action: "process",
      json: "1",
      page_size: String(Math.min(limit, 20)),
    });

    const url = `${OFF_BASE_URL}/cgi/search.pl?${params.toString()}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.warn(`[OpenFoodFacts] search response status: ${res.status}`);
      return [];
    }

    const json = (await res.json()) as any;
    if (!json || !Array.isArray(json.products)) {
      console.warn(`[OpenFoodFacts] search unexpected json shape:`, typeof json === "object" ? Object.keys(json) : json);
      return [];
    }

    const results: FoodProduct[] = [];
    const seenBarcodes = new Set<string>();

    for (const p of json.products) {
      if (!p.code || seenBarcodes.has(p.code)) continue;
      const productName = (p.product_name || p.product_name_en || p.generic_name || "").trim();
      if (!productName) continue;

      seenBarcodes.add(p.code);
      results.push({
        barcode: p.code,
        product_name: productName,
        brands: p.brands ? p.brands.trim() : "Brand Verified",
        quantity: p.quantity ? p.quantity.trim() : undefined,
        image_url: p.image_url || p.image_front_url || undefined,
        nutriscore_grade: normalizeNutriScore(p.nutriscore_grade),
        nova_group: normalizeNovaGroup(p.nova_group),
        ecoscore_grade: p.ecoscore_grade || undefined,
        categories: p.categories || undefined,
      });

      if (results.length >= limit) break;
    }

    if (results.length > 0) {
      searchCache.set(cacheKey, { data: results, expiresAt: Date.now() + CACHE_TTL_MS });
    }
    return results;
  } catch (error) {
    console.error(`[OpenFoodFacts] Error searching products for "${cleanQuery}":`, error);
    return [];
  }
}
