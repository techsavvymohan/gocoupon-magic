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
import {
  analyzeQueryIntent,
  buildCleanInternetQuery,
  isCandidateCompatible,
  extractInrPrice,
} from "./query-engine";

export interface UnifiedProductSuggestion {
  id: string;
  title: string;
  brand?: string;
  price?: number;
  originalPrice?: number;
  discountPercent?: number;
  storeName?: string;
  storeLogo?: string;
  imageUrl?: string;
  url: string;
  isLocalHit: boolean;
  isExactMatch?: boolean;
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

  // 1. Universal Query Intent Decomposition
  const intent = analyzeQueryIntent(q);

  // 2. Check Layer 1: Instant Local Index (<15ms)
  const localResult = await searchLocalProducts(q, { limit });

  if (localResult.hits.length > 0) {
    // Filter out candidates incompatible with intent (brand isolation, form isolation, accessory suppression)
    const filteredHits = localResult.hits.filter((doc) =>
      isCandidateCompatible(intent, {
        title: doc.title,
        brand: doc.brand,
        category: doc.category,
        tags: doc.tags || [],
      })
    );

    const hitsToUse = filteredHits.length > 0 ? filteredHits : localResult.hits;
    const suggestions = hitsToUse.map((h) => h.title);
    const results: UnifiedProductSuggestion[] = hitsToUse.map((doc, idx) => ({
      id: doc.id,
      title: doc.title,
      brand: doc.brand,
      price: doc.price,
      originalPrice: doc.originalPrice,
      discountPercent: doc.discountPercent,
      storeName: doc.storeName,
      storeLogo: doc.storeLogo,
      imageUrl: doc.imageUrl,
      url: `/compare?q=${encodeURIComponent(doc.title)}`,
      isLocalHit: true,
      // Only mark exact match if query intent is specific SKU (not broad discovery)
      isExactMatch: idx === 0 && intent.isSkuSpecific,
    }));

    return {
      query: q,
      suggestions: Array.from(new Set(suggestions)).slice(0, 5),
      results,
      latencyMs: Math.round(performance.now() - startTime),
      source: "local_instant_index",
    };
  }

  // 3. Layer 2: Not in local index -> Fallback to SearXNG Web Meta-Search
  try {
    const cleanQuery = buildCleanInternetQuery(intent);
    let searxngRes = await searchSearXNG(cleanQuery, {
      categories: "shopping",
      language: "en-IN",
      timeoutMs: 4000,
    });

    // Fallback to general category if shopping yielded 0 results
    let rawHits = searxngRes.results || [];
    if (rawHits.length === 0) {
      searxngRes = await searchSearXNG(cleanQuery, {
        categories: "general",
        language: "en-IN",
        timeoutMs: 4000,
      });
      rawHits = searxngRes.results || [];
    }

    // Filter web hits by semantic boundary rules
    const compatibleWebHits = rawHits.filter((r) => {
      let candidateBrand = "";
      if (intent.brand && (r.title.toLowerCase().includes(intent.brand) || (r.content || "").toLowerCase().includes(intent.brand))) {
        candidateBrand = intent.brand;
      }
      return isCandidateCompatible(intent, {
        title: r.title,
        brand: candidateBrand || "General",
        category: intent.category,
      });
    });

    const webHitsToUse = compatibleWebHits.length > 0 ? compatibleWebHits : rawHits;

    const webResults: UnifiedProductSuggestion[] = webHitsToUse
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
          else if (host.includes("nykaa")) storeName = "Nykaa";
          else storeName = host;
        } catch (e) {
          void e;
        }

        const detectedPrice = extractInrPrice(`${r.title} ${r.content || ""}`);

        return {
          id: `searxng-${idx}-${Date.now()}`,
          title: r.title,
          price: detectedPrice || undefined,
          storeName,
          url: r.url,
          isLocalHit: false,
          isExactMatch: idx === 0 && intent.isSkuSpecific,
          score: r.score,
        };
      });

    // 4. Asynchronously background-index top results into Typesense
    if (webResults.length > 0 && webResults[0].title) {
      const top = webResults[0];
      const newDoc: TypesenseProductDocument = {
        id: `auto-${Date.now()}`,
        title: top.title,
        brand: intent.brand || top.storeName || "Brand",
        category: intent.category || "General Deals",
        price: top.price || 0,
        originalPrice: top.price ? Math.round(top.price * 1.2) : 0,
        discountPercent: top.price ? 15 : 0,
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
