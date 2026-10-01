/**
 * @file searxng-service.ts
 * @description Robust SearXNG Search API Integration Service.
 *
 * Implements full SearXNG HTTP API specification:
 * - Endpoints: GET /search and POST /search
 * - Parameters: q (required), format='json', categories, language, pageno, safesearch
 * - Automatic instance fallback pool for maximum reliability
 * - Automatic conversion of SearXNG search results into shopping deals & suggestions
 *
 * Reference: https://docs.searxng.org/dev/search_api.html
 */

export interface SearXNGPriceIntelligenceOffer {
  title: string;
  url: string;
  merchant: string;
  amount: number;
  currency: string;
  shipping?: string;
  thumbnail?: string;
}

export interface SearXNGPriceIntelligenceSummary {
  query: string;
  total_offers: number;
  currency: string;
  lowest_price: number;
  highest_price: number;
  average_price: number;
  price_spread: number;
  max_savings_percentage: number;
  best_deal_merchant: string;
  best_deal_url: string;
  offers: SearXNGPriceIntelligenceOffer[];
}

export interface SearXNGResult {
  url: string;
  title: string;
  content?: string;
  engine?: string;
  engines?: string[];
  parsed_url?: string[];
  template?: string;
  positions?: number[];
  score?: number;
  category?: string;
  pretty_url?: string;
  publishedDate?: string;
  thumbnail?: string;
  img_src?: string;
  price?: string;
  merchant?: string;
  shipping?: string;
  source_country?: string;
  price_intelligence?: {
    amount: number;
    currency: string;
    raw_price: string;
    merchant: string;
    shipping?: string;
    source_country?: string;
    in_stock?: boolean;
  };
}

export interface SearXNGResponse {
  query: string;
  number_of_results: number;
  results: SearXNGResult[];
  suggestions: string[];
  price_intelligence?: SearXNGPriceIntelligenceSummary;
  infoboxes?: Array<{
    infobox: string;
    id?: string;
    content?: string;
    img_src?: string;
    urls?: Array<{ title: string; url: string }>;
  }>;
  answers?: any[];
}

export interface SearXNGOptions {
  categories?: string; // e.g. "general", "shopping", "it"
  language?: string; // e.g. "en", "en-IN", "all"
  pageno?: number;
  safesearch?: 0 | 1 | 2;
  time_range?: "day" | "month" | "year";
  method?: "GET" | "POST";
  timeoutMs?: number;
}

// Configurable instances with local SearXNG as primary
const CUSTOM_INSTANCE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SEARXNG_URL) ||
  (typeof process !== "undefined" && process.env?.SEARXNG_URL) ||
  "";

const DEFAULT_INSTANCES = [
  "https://search.mectov.my.id",
  "https://etsi.me",
  "https://sx.xo.st",
  "https://searx.perennialte.ch",
];

const SEARXNG_INSTANCES = CUSTOM_INSTANCE
  ? [CUSTOM_INSTANCE.replace(/\/+$/, ""), ...DEFAULT_INSTANCES]
  : DEFAULT_INSTANCES;

// In-memory cache for fast responsive search autocomplete
const searxngCache = new Map<string, { data: SearXNGResponse; timestamp: number }>();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

/**
 * Query SearXNG API via GET or POST with JSON format
 */
export async function searchSearXNG(
  query: string,
  options: SearXNGOptions = {},
): Promise<SearXNGResponse> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { query: "", number_of_results: 0, results: [], suggestions: [] };
  }

  const cacheKey = `${trimmed}:${options.categories || ""}:${options.pageno || 1}`;
  const cached = searxngCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const timeoutMs = options.timeoutMs || 4500;

  // 1. In browser, try local backend proxy (/api/searxng) to prevent client-side CORS issues
  if (typeof window !== "undefined") {
    try {
      const proxyUrl = new URL("/api/searxng", window.location.origin);
      proxyUrl.searchParams.set("q", trimmed);
      proxyUrl.searchParams.set("format", "json");
      if (options.categories) proxyUrl.searchParams.set("categories", options.categories);
      if (options.language) proxyUrl.searchParams.set("language", options.language);
      if (options.pageno) proxyUrl.searchParams.set("pageno", String(options.pageno));

      const proxyRes = await fetch(proxyUrl.toString(), {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (proxyRes.ok) {
        const data: SearXNGResponse = await proxyRes.json();
        if (data && Array.isArray(data.results)) {
          searxngCache.set(cacheKey, { data, timestamp: Date.now() });
          return data;
        }
      }
    } catch {
      // Fall back to direct instance pool below
    }
  }

  // 2. Direct Query to SearXNG instance pool (with failover)
  for (const instance of SEARXNG_INSTANCES) {
    try {
      const method = options.method || "GET";
      let response: Response;

      if (method === "POST") {
        // Form Data per SearXNG documentation
        const params = new URLSearchParams();
        params.append("q", trimmed);
        params.append("format", "json");
        if (options.categories) params.append("categories", options.categories);
        if (options.language) params.append("language", options.language);
        if (options.pageno) params.append("pageno", String(options.pageno));
        if (options.safesearch !== undefined)
          params.append("safesearch", String(options.safesearch));

        response = await fetch(`${instance}/search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: params.toString(),
          signal: AbortSignal.timeout(timeoutMs),
        });
      } else {
        // GET method with query parameters
        const url = new URL(`${instance}/search`);
        url.searchParams.set("q", trimmed);
        url.searchParams.set("format", "json");
        if (options.categories) url.searchParams.set("categories", options.categories);
        if (options.language) url.searchParams.set("language", options.language);
        if (options.pageno) url.searchParams.set("pageno", String(options.pageno));
        if (options.safesearch !== undefined)
          url.searchParams.set("safesearch", String(options.safesearch));

        response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(timeoutMs),
        });
      }

      if (response.ok && response.headers.get("content-type")?.includes("json")) {
        const data: SearXNGResponse = await response.json();
        if (data && Array.isArray(data.results)) {
          searxngCache.set(cacheKey, { data, timestamp: Date.now() });
          return data;
        }
      }
    } catch {
      // Continue to next instance in pool
    }
  }

  // Fallback structure if all instances fail or rate-limit
  return {
    query: trimmed,
    number_of_results: 0,
    results: [],
    suggestions: [],
  };
}

/**
 * Live SearXNG Suggestions for Search Bar Autocomplete
 */
export async function getSearXNGAutocomplete(query: string): Promise<string[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  try {
    const res = await searchSearXNG(trimmed, {
      categories: "general",
      timeoutMs: 2500,
    });

    const suggestions = new Set<string>();

    // 1. SearXNG native suggestions
    (res.suggestions || []).forEach((s) => suggestions.add(s));

    // 2. Extract clean product titles from results
    (res.results || []).slice(0, 5).forEach((r) => {
      const cleanTitle = r.title
        .replace(/ - (Amazon|Flipkart|Myntra|Meesho|Apple|Sony|Official).*$/i, "")
        .replace(/\|.*$/i, "")
        .trim();
      if (cleanTitle && cleanTitle.length < 50) {
        suggestions.add(cleanTitle);
      }
    });

    return Array.from(suggestions).slice(0, 6);
  } catch {
    return [];
  }
}
