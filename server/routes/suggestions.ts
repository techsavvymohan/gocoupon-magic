/**
 * @file server/routes/suggestions.ts
 * @description Real-time Shopping Product Autocomplete & Query Suggestion Service.
 *
 * Provides sub-50ms product recommendations exclusively for e-commerce items
 * (e.g., typing "iphone 17" -> "iphone 17", "iphone 17 pro", "iphone 17 pro max").
 *
 * Endpoint: GET /api/search/suggestions?q=...
 */

import { Router, type Request, type Response } from "express";

export const suggestionsRouter = Router();

// In-memory cache for ultra-fast keystroke autocomplete (< 5ms response)
const suggestionCache = new Map<string, { suggestions: string[]; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Normalizes and cleans suggestion strings (removes HTML tags, extra whitespace).
 */
function cleanSuggestion(text: string): string {
  if (!text) return "";
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Checks if a suggestion is a shopping-related product phrase.
 */
function isShoppingRelevant(suggestion: string): boolean {
  const lower = suggestion.toLowerCase();
  // Filter out non-shopping queries like Wikipedia lookups, general news, or download queries
  if (
    lower.includes("wikipedia") ||
    lower.includes("meaning in") ||
    lower.includes("definition") ||
    lower.includes("news today") ||
    lower.includes("full form") ||
    lower.includes("download apk") ||
    lower.includes("free download")
  ) {
    return false;
  }
  return true;
}

suggestionsRouter.get("/", async (req: Request, res: Response) => {
  const q = (req.query.q as string)?.trim() || "";
  if (!q || q.length < 2) {
    res.json({ query: q, suggestions: [] });
    return;
  }

  const country = ((req.query.gl || req.query.country) as string)?.trim().toLowerCase() || "in";
  const language = ((req.query.hl) as string)?.trim().toLowerCase() || "en";
  const cacheKey = `${q.toLowerCase()}:${country}:${language}`;

  // 1. Check in-memory cache
  const cached = suggestionCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    res.setHeader("X-Cache", "HIT");
    res.setHeader("Cache-Control", "public, max-age=600, stale-while-revalidate=1800");
    res.json({ query: q, suggestions: cached.suggestions });
    return;
  }

  const results: string[] = [];
  const seen = new Set<string>();

  const addSuggestion = (text: string) => {
    const cleaned = cleanSuggestion(text);
    const lower = cleaned.toLowerCase();
    if (cleaned && !seen.has(lower) && isShoppingRelevant(cleaned)) {
      seen.add(lower);
      results.push(cleaned);
    }
  };

  // 2. Query Google Shopping Suggest (ds=sh: specialized e-commerce search dataset)
  try {
    const googleSuggestUrl = `https://suggestqueries.google.com/complete/search?client=firefox&ds=sh&gl=${country}&hl=${language}&q=${encodeURIComponent(
      q
    )}`;

    const gRes = await fetch(googleSuggestUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        Accept: "application/json, text/javascript, */*",
      },
      signal: AbortSignal.timeout(1800),
    });

    if (gRes.ok) {
      const gData = await gRes.json();
      if (Array.isArray(gData) && Array.isArray(gData[1])) {
        for (const item of gData[1]) {
          if (typeof item === "string") {
            addSuggestion(item);
          }
        }
      }
    }
  } catch {
    // Fall back to secondary sources below
  }

  // 3. Query DuckDuckGo Suggestion Engine as complementary source
  if (results.length < 5) {
    try {
      const ddgUrl = `https://duckduckgo.com/ac/?q=${encodeURIComponent(q)}&type=list`;
      const ddgRes = await fetch(ddgUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        },
        signal: AbortSignal.timeout(1500),
      });

      if (ddgRes.ok) {
        const ddgData = await ddgRes.json();
        if (Array.isArray(ddgData) && Array.isArray(ddgData[1])) {
          for (const item of ddgData[1]) {
            if (typeof item === "string") {
              addSuggestion(item);
            }
          }
        }
      }
    } catch {
      // Ignored
    }
  }

  // Ensure original query is offered if not already present
  if (!seen.has(q.toLowerCase())) {
    results.unshift(q);
  }

  const finalSuggestions = results.slice(0, 7);

  // Store in cache
  suggestionCache.set(cacheKey, {
    suggestions: finalSuggestions,
    timestamp: Date.now(),
  });

  // Prune cache if it grows too large
  if (suggestionCache.size > 2000) {
    const oldestKey = suggestionCache.keys().next().value;
    if (oldestKey) suggestionCache.delete(oldestKey);
  }

  res.setHeader("X-Cache", "MISS");
  res.setHeader("Cache-Control", "public, max-age=600, stale-while-revalidate=1800");
  res.json({ query: q, suggestions: finalSuggestions });
});
