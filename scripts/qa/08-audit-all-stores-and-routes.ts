import fs from "fs";
import { getStoreBySlug, getStoreCatalog } from "../../src/lib/store-catalog-helper";
import { findMatchingStores, REGISTERED_STORES } from "../../src/lib/services/store-registry";
import { STORES_DATA } from "../../src/data/storesData";
import { getAllStoresFromPool, getLiveDeals } from "../../src/lib/server-data/deals-db";

console.log("=== QA AUDIT: STORE RESOLUTION & CATALOG REACH ===");

// 1. Check live deals stores
const raw = JSON.parse(fs.readFileSync("src/data/live-deals.json", "utf8"));
const deals = raw.deals || raw;

const testStores = [
  "qatar-airways",
  "air-india",
  "klook",
  "vijay-sales",
  "nykaa-beauty",
  "jockey",
  "uniqlo",
  "palmonas",
  "healthkart",
  "bewakoof",
  "pepperfry",
  "bella-vita",
  "hostinger",
  "amazon",
  "flipkart",
  "myntra",
  "booking-com"
];

console.log("\n--- Testing getStoreBySlug() for top stores ---");
for (const slug of testStores) {
  const store = getStoreBySlug(slug);
  const storeWithCoupons = getStoreBySlug(`${slug}-coupons`);
  const resolved = store || storeWithCoupons;
  if (resolved) {
    console.log(`✅ [Resolved] ${slug} -> Name: "${resolved.name}", Category: "${resolved.category}", Logo: ${Boolean(resolved.logo)}`);
  } else {
    console.error(`❌ [404 BUG] ${slug} could NOT be resolved by getStoreBySlug()! This will render 404 in $storeSlug.lazy.tsx!`);
  }
}

console.log("\n--- Testing findMatchingStores() autocomplete ---");
const searchQueries = ["qatar", "klook", "air india", "vijay", "nykaa", "jockey", "uniqlo", "hostinger", "myntra"];
for (const q of searchQueries) {
  const matches = findMatchingStores(q, 3);
  if (matches.length > 0) {
    console.log(`✅ [Search Hit] "${q}" -> Found: ${matches.map(m => m.name).join(", ")}`);
  } else {
    console.error(`❌ [Search MISS] "${q}" -> 0 stores returned by findMatchingStores()!`);
  }
}

console.log("\n--- Testing deals-db getAllStoresFromPool() ---");
const poolStores = getAllStoresFromPool();
console.log(`Stores extracted from deals pool: ${poolStores.length}`);
console.log(`Sample pool store:`, poolStores[0]);

console.log("\n=== AUDIT COMPLETED ===");
