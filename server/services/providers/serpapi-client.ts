/**
 * @file server/services/providers/serpapi-client.ts
 * @description SerpApi Google Shopping Multi-Country Price & Product Client.
 *
 * Implements 60-minute TTL in-memory caching to strictly protect API quota & cost,
 * regional country routing (gl=in, gl=us, gl=uk), condition filtering (condition: NEW),
 * and a zero-credit Mock Sandbox Mode for development and offline testing.
 */

export interface SerpShoppingOffer {
  merchantName: string;
  domain: string;
  price: number;
  originalPrice?: number;
  currency: string;
  condition: "NEW" | "REFURBISHED" | "USED";
  inStock: boolean;
  rating?: number;
  reviewsCount?: number;
  directUrl: string;
  thumbnail?: string;
  isOfficialMerchant: boolean;
}

export interface SerpShoppingResult {
  query: string;
  country: string;
  totalFound: number;
  typicalMinPrice?: number;
  typicalMaxPrice?: number;
  offers: SerpShoppingOffer[];
  cached: boolean;
  source: "serpapi_live" | "serpapi_cache" | "serpapi_sandbox";
}

// 60-minute in-memory cache for SerpApi query responses
const serpApiCache = new Map<string, { timestamp: number; data: SerpShoppingResult }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 60 minutes

/**
 * Searches Google Shopping via SerpApi across any supported global country.
 */
export async function searchGoogleShopping(options: {
  query: string;
  country?: string; // "in", "us", "uk", "ae", "de"
  apiKey?: string;
  forceFresh?: boolean;
}): Promise<SerpShoppingResult> {
  const q = options.query.trim();
  const country = (options.country || "in").toLowerCase();
  const cacheKey = `${country}:${q.toLowerCase()}`;
  const now = Date.now();

  // 1. Check 60-Minute Cache
  if (!options.forceFresh && serpApiCache.has(cacheKey)) {
    const cachedEntry = serpApiCache.get(cacheKey)!;
    if (now - cachedEntry.timestamp < CACHE_TTL_MS) {
      return {
        ...cachedEntry.data,
        cached: true,
        source: "serpapi_cache",
      };
    }
    serpApiCache.delete(cacheKey);
  }

  const apiKey = options.apiKey || process.env.SERPAPI_API_KEY;

  // 2. Mock Sandbox Fallback Mode if no API key configured
  if (!apiKey) {
    const mockResult = generateMockSerpResults(q, country);
    serpApiCache.set(cacheKey, { timestamp: now, data: mockResult });
    return mockResult;
  }

  // 3. Live SerpApi Execution
  try {
    const url = new URL("https://serpapi.com/search.json");
    url.searchParams.set("engine", "google_shopping");
    url.searchParams.set("q", q);
    url.searchParams.set("gl", country);
    url.searchParams.set("hl", "en");
    url.searchParams.set("api_key", apiKey);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

    const res = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`SerpApi HTTP error: ${res.status}`);
    }

    const json = await res.json();
    const shoppingResults = json.shopping_results || [];

    const offers: SerpShoppingOffer[] = [];
    for (const item of shoppingResults) {
      const title = (item.title || "").toLowerCase();
      const isRefurb =
        title.includes("refurbished") ||
        title.includes("renewed") ||
        title.includes("pre-owned") ||
        title.includes("open-box") ||
        title.includes("second hand");

      const priceNum = parseFloat(String(item.extracted_price || item.price || "0").replace(/[^0-9.]/g, ""));
      if (priceNum <= 0) continue;

      offers.push({
        merchantName: item.source || "Online Merchant",
        domain: (item.source || "").toLowerCase().replace(/[^a-z0-9]/g, "") + ".com",
        price: priceNum,
        currency: country === "in" ? "INR" : country === "uk" ? "GBP" : country === "ae" ? "AED" : "USD",
        condition: isRefurb ? "REFURBISHED" : "NEW",
        inStock: true,
        rating: item.rating ? parseFloat(item.rating) : undefined,
        reviewsCount: item.reviews ? parseInt(item.reviews, 10) : undefined,
        directUrl: item.link || item.product_link || "#",
        thumbnail: item.thumbnail,
        isOfficialMerchant: ["amazon", "flipkart", "croma", "walmart", "bestbuy", "target"].some((m) =>
          (item.source || "").toLowerCase().includes(m)
        ),
      });
    }

    // Sort by price ascending, prioritizing NEW condition
    offers.sort((a, b) => {
      if (a.condition !== b.condition) {
        return a.condition === "NEW" ? -1 : 1;
      }
      return a.price - b.price;
    });

    const typicalMin = offers.length > 0 ? offers[0].price : undefined;
    const typicalMax = offers.length > 0 ? offers[offers.length - 1].price : undefined;

    const result: SerpShoppingResult = {
      query: q,
      country,
      totalFound: offers.length,
      typicalMinPrice: typicalMin,
      typicalMaxPrice: typicalMax,
      offers,
      cached: false,
      source: "serpapi_live",
    };

    serpApiCache.set(cacheKey, { timestamp: now, data: result });
    return result;
  } catch (err: any) {
    // Graceful fallback to sandbox on network/timeout error
    console.warn(`[SerpApi] Live call failed (${err.message}). Using deterministic sandbox fallback.`);
    return generateMockSerpResults(q, country);
  }
}

/**
 * Deterministic Mock Generator for development & testing without burning API credits.
 */
function generateMockSerpResults(query: string, country: string): SerpShoppingResult {
  const isIndia = country === "in";
  const currency = isIndia ? "INR" : "USD";
  const lowerQ = query.toLowerCase();

  let basePrice = isIndia ? 29990 : 349;
  if (lowerQ.includes("sony") && lowerQ.includes("xm5")) basePrice = isIndia ? 26990 : 348;
  else if (lowerQ.includes("iphone 16")) basePrice = isIndia ? 79900 : 799;
  else if (lowerQ.includes("macbook")) basePrice = isIndia ? 99900 : 1099;
  else if (lowerQ.includes("galaxy s24")) basePrice = isIndia ? 74999 : 799;

  const stores = isIndia
    ? [
        { name: "Amazon India", domain: "amazon.in", multiplier: 1.0, official: true },
        { name: "Flipkart", domain: "flipkart.com", multiplier: 0.98, official: true },
        { name: "Croma", domain: "croma.com", multiplier: 1.02, official: true },
        { name: "Reliance Digital", domain: "reliancedigital.in", multiplier: 1.04, official: false },
        { name: "Vijay Sales", domain: "vijaysales.com", multiplier: 0.99, official: false },
      ]
    : [
        { name: "Amazon US", domain: "amazon.com", multiplier: 1.0, official: true },
        { name: "Best Buy", domain: "bestbuy.com", multiplier: 0.99, official: true },
        { name: "Walmart", domain: "walmart.com", multiplier: 1.01, official: true },
        { name: "Target", domain: "target.com", multiplier: 1.03, official: true },
        { name: "B&H Photo", domain: "bhphotovideo.com", multiplier: 1.0, official: false },
      ];

  const offers: SerpShoppingOffer[] = stores.map((s, idx) => ({
    merchantName: s.name,
    domain: s.domain,
    price: Math.round(basePrice * s.multiplier),
    originalPrice: Math.round(basePrice * 1.15),
    currency,
    condition: "NEW",
    inStock: true,
    rating: 4.5 + (idx % 4) * 0.1,
    reviewsCount: 1200 + idx * 350,
    directUrl: `https://${s.domain}/dp/mock_${idx}`,
    isOfficialMerchant: s.official,
  }));

  // Add one clearly flagged refurbished unit for testing condition quarantine
  offers.push({
    merchantName: isIndia ? "Cashify SuperSale" : "BackMarket Refurb",
    domain: isIndia ? "cashify.in" : "backmarket.com",
    price: Math.round(basePrice * 0.72),
    currency,
    condition: "REFURBISHED",
    inStock: true,
    rating: 4.1,
    reviewsCount: 140,
    directUrl: `https://mock-refurb.com/item`,
    isOfficialMerchant: false,
  });

  return {
    query,
    country,
    totalFound: offers.length,
    typicalMinPrice: Math.round(basePrice * 0.95),
    typicalMaxPrice: Math.round(basePrice * 1.05),
    offers,
    cached: false,
    source: "serpapi_sandbox",
  };
}
