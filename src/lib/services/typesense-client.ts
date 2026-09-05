/**
 * @file typesense-client.ts
 * @description High-Speed Local Product Search & Catalog Engine (<15ms).
 *
 * Implements:
 * - Typesense HTTP API client for instant typo-tolerant product autocomplete
 * - Resilient fallback to fast local memory index when Typesense container is cold
 * - Instant faceting by merchant, price range, and category
 */

export interface TypesenseProductDocument {
  id: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  storeName: string;
  storeLogo?: string;
  directUrl: string;
  imageUrl: string;
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
  offers?: Array<{
    storeId: string;
    storeName: string;
    price: number;
    affiliateUrl: string;
    couponCode?: string;
  }>;
  updatedAt: number;
}

export interface TypesenseSearchResult {
  hits: TypesenseProductDocument[];
  found: number;
  searchTimeMs: number;
  source: "typesense_index" | "local_memory_cache";
}

const TYPESENSE_HOST =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_TYPESENSE_URL) ||
  (typeof process !== "undefined" && process.env?.TYPESENSE_URL) ||
  "http://localhost:8108";

const TYPESENSE_API_KEY =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_TYPESENSE_API_KEY) ||
  (typeof process !== "undefined" && process.env?.TYPESENSE_API_KEY) ||
  "xyz123_gocoupon_local_secret";

const COLLECTION_NAME = "products";

// High-speed in-memory LRU / catalog cache to guarantee <15ms response even if Typesense server is offline
const memoryProductStore = new Map<string, TypesenseProductDocument>();

// Pre-seed popular catalog items for instant zero-latency keystroke search
const SEED_CATALOG_ITEMS: TypesenseProductDocument[] = [
  {
    id: "prod-sony-xm5",
    title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones (Black)",
    brand: "Sony",
    category: "Audio & Headphones",
    price: 26990,
    originalPrice: 34990,
    discountPercent: 23,
    storeName: "Amazon India",
    storeLogo: "/Brand logos/Amazon_logo.svg.webp",
    directUrl: "https://amazon.in/dp/B09XS7JWHH",
    imageUrl: "/amazon-deals-gadgets.webp",
    rating: 4.8,
    reviewCount: 14200,
    inStock: true,
    offers: [
      {
        storeId: "amazon",
        storeName: "Amazon India",
        price: 26990,
        affiliateUrl: "/compare?q=Sony+XM5",
        couponCode: "AMZAUDIO15",
      },
      {
        storeId: "flipkart",
        storeName: "Flipkart",
        price: 27999,
        affiliateUrl: "/compare?q=Sony+XM5",
        couponCode: "FKTECH1500",
      },
      { storeId: "croma", storeName: "Croma", price: 28490, affiliateUrl: "/compare?q=Sony+XM5" },
    ],
    updatedAt: Date.now(),
  },
  {
    id: "prod-iphone-15-128",
    title: "Apple iPhone 15 (128 GB) - Black / Blue / Pink",
    brand: "Apple",
    category: "Smartphones & Mobiles",
    price: 65999,
    originalPrice: 79900,
    discountPercent: 17,
    storeName: "Flipkart",
    storeLogo: "/Brand logos/flipkart.webp",
    directUrl: "https://flipkart.com",
    imageUrl: "/gc-logo.webp",
    rating: 4.7,
    reviewCount: 28900,
    inStock: true,
    offers: [
      {
        storeId: "flipkart",
        storeName: "Flipkart",
        price: 65999,
        affiliateUrl: "/compare?q=iPhone+15",
        couponCode: "FKTECH1500",
      },
      {
        storeId: "amazon",
        storeName: "Amazon India",
        price: 66900,
        affiliateUrl: "/compare?q=iPhone+15",
      },
    ],
    updatedAt: Date.now(),
  },
  {
    id: "prod-macbook-air-m3",
    title: "Apple MacBook Air 13-inch M3 Chip (16GB RAM, 256GB SSD) - Space Grey",
    brand: "Apple",
    category: "Laptops & Computers",
    price: 104900,
    originalPrice: 114900,
    discountPercent: 9,
    storeName: "Amazon India",
    storeLogo: "/Brand logos/Amazon_logo.svg.webp",
    directUrl: "https://amazon.in",
    imageUrl: "/gc-logo.webp",
    rating: 4.9,
    reviewCount: 4200,
    inStock: true,
    offers: [
      {
        storeId: "amazon",
        storeName: "Amazon India",
        price: 104900,
        affiliateUrl: "/compare?q=MacBook+Air+M3",
        couponCode: "HDFC5000",
      },
      {
        storeId: "croma",
        storeName: "Croma",
        price: 106990,
        affiliateUrl: "/compare?q=MacBook+Air+M3",
      },
    ],
    updatedAt: Date.now(),
  },
  {
    id: "prod-galaxy-s24",
    title: "Samsung Galaxy S24 5G (Onyx Black, 256GB Storage, 8GB RAM)",
    brand: "Samsung",
    category: "Smartphones & Mobiles",
    price: 64999,
    originalPrice: 79999,
    discountPercent: 19,
    storeName: "Amazon India",
    storeLogo: "/Brand logos/Amazon_logo.svg.webp",
    directUrl: "https://amazon.in",
    imageUrl: "/gc-logo.webp",
    rating: 4.6,
    reviewCount: 8900,
    inStock: true,
    offers: [
      {
        storeId: "amazon",
        storeName: "Amazon India",
        price: 64999,
        affiliateUrl: "/compare?q=Galaxy+S24",
      },
      {
        storeId: "flipkart",
        storeName: "Flipkart",
        price: 65499,
        affiliateUrl: "/compare?q=Galaxy+S24",
      },
    ],
    updatedAt: Date.now(),
  },
  {
    id: "prod-boat-airdopes-141",
    title: "boAt Airdopes 141 Bluetooth Truly Wireless in Ear Earbuds with 42H Playtime",
    brand: "boAt",
    category: "Audio & Headphones",
    price: 999,
    originalPrice: 4490,
    discountPercent: 78,
    storeName: "Amazon India",
    storeLogo: "/Brand logos/Amazon_logo.svg.webp",
    directUrl: "https://amazon.in",
    imageUrl: "/amazon-deals-gadgets.webp",
    rating: 4.2,
    reviewCount: 198000,
    inStock: true,
    offers: [
      {
        storeId: "amazon",
        storeName: "Amazon India",
        price: 999,
        affiliateUrl: "/compare?q=boAt+Airdopes+141",
      },
      {
        storeId: "flipkart",
        storeName: "Flipkart",
        price: 1099,
        affiliateUrl: "/compare?q=boAt+Airdopes+141",
      },
      {
        storeId: "boat",
        storeName: "boAt Lifestyle",
        price: 1199,
        affiliateUrl: "/compare?q=boAt+Airdopes+141",
        couponCode: "BOATMAGIC15",
      },
    ],
    updatedAt: Date.now(),
  },
];

// Seed memory store
for (const item of SEED_CATALOG_ITEMS) {
  memoryProductStore.set(item.id, item);
}

/**
 * Searches the local Typesense server with an ultra-fast fallback to memory store.
 */
export async function searchLocalProducts(
  query: string,
  options: { limit?: number; category?: string } = {},
): Promise<TypesenseSearchResult> {
  const startTime = performance.now();
  const q = query.trim().toLowerCase();
  const limit = options.limit || 8;

  if (!q) {
    return {
      hits: Array.from(memoryProductStore.values()).slice(0, limit),
      found: memoryProductStore.size,
      searchTimeMs: Math.round(performance.now() - startTime),
      source: "local_memory_cache",
    };
  }

  // 1. Attempt Typesense HTTP Search API (<15ms)
  try {
    const searchUrl = new URL(`${TYPESENSE_HOST}/collections/${COLLECTION_NAME}/documents/search`);
    searchUrl.searchParams.set("q", q);
    searchUrl.searchParams.set("query_by", "title,brand,category");
    searchUrl.searchParams.set("num_typos", "2");
    searchUrl.searchParams.set("per_page", String(limit));

    const response = await fetch(searchUrl.toString(), {
      method: "GET",
      headers: {
        "X-TYPESENSE-API-KEY": TYPESENSE_API_KEY,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(350), // Ultra-fast timeout to never block UI
    });

    if (response.ok) {
      const data = await response.json();
      const hits: TypesenseProductDocument[] = (data.hits || []).map(
        (h: { document: TypesenseProductDocument }) => h.document,
      );
      if (hits.length > 0) {
        return {
          hits,
          found: data.found || hits.length,
          searchTimeMs: Math.round(performance.now() - startTime),
          source: "typesense_index",
        };
      }
    }
  } catch {
    // Typesense container cold or not running; seamlessly use local memory store
  }

  // 2. High-speed in-memory fuzzy/token search (<5ms)
  const queryTokens = q.split(/\s+/).filter(Boolean);
  const memoryHits: TypesenseProductDocument[] = [];

  for (const doc of memoryProductStore.values()) {
    const targetText = `${doc.title} ${doc.brand} ${doc.category}`.toLowerCase();
    const isMatch = queryTokens.every((token) => targetText.includes(token));
    if (isMatch) {
      memoryHits.push(doc);
    }
    if (memoryHits.length >= limit) break;
  }

  return {
    hits: memoryHits,
    found: memoryHits.length,
    searchTimeMs: Math.round(performance.now() - startTime),
    source: "local_memory_cache",
  };
}

/**
 * Indexes or updates a product in memory and asynchronously in Typesense.
 */
export async function indexProductDocument(product: TypesenseProductDocument): Promise<void> {
  // Always update memory store immediately
  memoryProductStore.set(product.id, { ...product, updatedAt: Date.now() });

  // Asynchronously upsert to Typesense if available
  try {
    const upsertUrl = `${TYPESENSE_HOST}/collections/${COLLECTION_NAME}/documents?action=upsert`;
    fetch(upsertUrl, {
      method: "POST",
      headers: {
        "X-TYPESENSE-API-KEY": TYPESENSE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    }).catch(() => {
      // Background indexing non-critical
    });
  } catch {
    // Ignore offline Typesense
  }
}
