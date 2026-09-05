/**
 * @file unified-search-router.ts
 * @description Orchestrates Layer 1 Instant Local Search (<15ms) and Layer 2 SearXNG Web Discovery.
 *
 * Execution Flow:
 * 1. User types query in search bar.
 * 2. Unified Router queries Typesense / Local Memory (<15ms).
 * 3. If local hits exist: returns immediately (zero network delay, zero rate-limit risk).
 * 4. If 0 local hits: triggers SearXNG fallback pool to find live links across Google/Bing/retailers.
 * 5. Asynchronously indexes newly discovered products into Typesense for future 15ms hits.
 */

import {
  searchLocalProducts,
  indexProductDocument,
  type TypesenseProductDocument,
} from "./typesense-client";
import { searchSearXNG, type SearXNGResult } from "./searxng-service";

export interface UnifiedProductSuggestion {
  id: string;
  title: string;
  brand?: string;
  price?: number;
  originalPrice?: number;
  storeName?: string;
  storeLogo?: string;
  url: string;
  isLocalHit: boolean;
  score?: number;
}

export interface UnifiedSearchResponse {
  query: string;
  suggestions: string[];
  results: UnifiedProductSuggestion[];
  latencyMs: number;
  source: "local_instant_index" | "searxng_web_discovery";
}

export async function unifiedProductSearch(
  query: string,
  options: { limit?: number } = {},
): Promise<UnifiedSearchResponse> {
  const startTime = performance.now();
  const q = query.trim();
  const limit = options.limit || 8;

  if (!q) {
    return {
      query: "",
      suggestions: [],
      results: [],
      latencyMs: 0,
      source: "local_instant_index",
    };
  }

  // 1. Check Layer 1: Instant Local Index (<15ms)
  const localResult = await searchLocalProducts(q, { limit });

  if (localResult.hits.length > 0) {
    const suggestions = localResult.hits.map((h) => h.title);
    const results: UnifiedProductSuggestion[] = localResult.hits.map((doc) => ({
      id: doc.id,
      title: doc.title,
      brand: doc.brand,
      price: doc.price,
      originalPrice: doc.originalPrice,
      storeName: doc.storeName,
      storeLogo: doc.storeLogo,
      url: `/compare?q=${encodeURIComponent(doc.title)}`,
      isLocalHit: true,
    }));

    return {
      query: q,
      suggestions: Array.from(new Set(suggestions)).slice(0, 5),
      results,
      latencyMs: Math.round(performance.now() - startTime),
      source: "local_instant_index",
    };
  }

  // 2. Layer 2: Not in local index -> Fallback to SearXNG Meta-Search
  try {
    const searxngRes = await searchSearXNG(q, {
      categories: "shopping",
      language: "en-IN",
      timeoutMs: 4000,
    });

    const webResults: UnifiedProductSuggestion[] = (searxngRes.results || [])
      .slice(0, limit)
      .map((r: SearXNGResult, idx) => {
        let storeName = "Online Store";
        try {
          const host = new URL(r.url).hostname.replace(/^www\./, "");
          if (host.includes("amazon")) storeName = "Amazon India";
          else if (host.includes("flipkart")) storeName = "Flipkart";
          else if (host.includes("myntra")) storeName = "Myntra";
          else if (host.includes("croma")) storeName = "Croma";
          else if (host.includes("meesho")) storeName = "Meesho";
          else storeName = host;
        } catch (e) {
          void e;
        }

        return {
          id: `searxng-${idx}-${Date.now()}`,
          title: r.title,
          storeName,
          url: r.url,
          isLocalHit: false,
          score: r.score,
        };
      });

    // 3. Asynchronously background-index top results into Typesense
    if (webResults.length > 0 && webResults[0].title) {
      const top = webResults[0];
      const newDoc: TypesenseProductDocument = {
        id: `auto-${Date.now()}`,
        title: top.title,
        brand: top.storeName || "Brand",
        category: "General Deals",
        price: 0,
        originalPrice: 0,
        discountPercent: 0,
        storeName: top.storeName || "Verified Store",
        directUrl: top.url,
        imageUrl: "/gc-logo.webp",
        inStock: true,
        updatedAt: Date.now(),
      };
      indexProductDocument(newDoc).catch(() => {});
    }

    return {
      query: q,
      suggestions: searxngRes.suggestions || [],
      results: webResults,
      latencyMs: Math.round(performance.now() - startTime),
      source: "searxng_web_discovery",
    };
  } catch (error) {
    console.warn("SearXNG discovery fallback failed:", error);
    return {
      query: q,
      suggestions: [],
      results: [],
      latencyMs: Math.round(performance.now() - startTime),
      source: "searxng_web_discovery",
    };
  }
}
