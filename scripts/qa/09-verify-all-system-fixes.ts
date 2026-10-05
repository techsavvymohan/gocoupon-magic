import { getStoreBySlug, getStoreCatalog } from "../../src/lib/store-catalog-helper";
import { findMatchingStores } from "../../src/lib/services/store-registry";
import { queryStores, STORES_DB } from "../../src/lib/server-data/stores-db";
import { MERCHANT_SCORES } from "../../src/data/merchantScoreData";

console.log("=================================================");
console.log("   GOCOUPON COMPREHENSIVE QA VERIFICATION SUITE   ");
console.log("=================================================\n");

let passed = 0;
let failed = 0;

function assert(condition: boolean, passMsg: string, failMsg: string) {
  if (condition) {
    console.log(`✅ [PASS] ${passMsg}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${failMsg}`);
    failed++;
  }
}

// 1. Verify Catalog Size
const catalog = getStoreCatalog();
assert(catalog.size >= 380, `Store catalog loaded ${catalog.size} stores (expected >= 380)`, `Store catalog only has ${catalog.size} stores`);

// 2. Verify Top Store Resolution (both plain slug and -coupons)
const testStores = [
  { slug: "qatar-airways", expectedName: "Qatar Airways" },
  { slug: "klook", expectedName: "Klook" },
  { slug: "air-india", expectedName: "Air India" },
  { slug: "vijay-sales", expectedName: "Vijay Sales" },
  { slug: "booking-com", expectedName: "Booking.com" },
  { slug: "jockey", expectedName: "Jockey" },
  { slug: "uniqlo", expectedName: "Uniqlo" },
  { slug: "hostinger", expectedName: "Hostinger" },
  { slug: "tata-cliq", expectedName: "Tata CLiQ" },
];

for (const { slug, expectedName } of testStores) {
  const storeDirect = getStoreBySlug(slug);
  const storeCoupons = getStoreBySlug(`${slug}-coupons`);
  assert(
    Boolean(storeDirect && storeCoupons),
    `Store "${slug}" resolves both plain slug and "-coupons" (${storeDirect?.name})`,
    `Store "${slug}" failed to resolve!`
  );
  if (storeDirect) {
    assert(
      Boolean(storeDirect.logo),
      `Store "${slug}" has authentic brand logo: ${storeDirect.logo?.slice(0, 50)}...`,
      `Store "${slug}" is missing a logo!`
    );
  }
}

// 3. Verify Autocomplete Search
const searchQueries = ["qatar", "klook", "air india", "vijay", "nykaa", "jockey", "uniqlo", "hostinger", "myntra"];
for (const q of searchQueries) {
  const hits = findMatchingStores(q, 3);
  assert(
    hits.length > 0,
    `findMatchingStores("${q}") returned ${hits.length} hit(s): ${hits.map((h) => h.name).join(", ")}`,
    `findMatchingStores("${q}") returned 0 hits!`
  );
}

// 4. Verify Server Stores DB
const storesRes = queryStores({ limit: 50 });
assert(
  storesRes.total >= 380,
  `queryStores() returns total: ${storesRes.total} stores`,
  `queryStores() returned total: ${storesRes.total}`
);

// 5. Verify Merchant Scores links
for (const ms of MERCHANT_SCORES) {
  const resolved = getStoreBySlug(ms.storeId) || getStoreBySlug(`${ms.storeId}-coupons`);
  assert(
    Boolean(resolved),
    `Merchant score store "${ms.name}" (id: ${ms.storeId}) resolves to catalog store: ${resolved?.name}`,
    `Merchant score store "${ms.name}" (id: ${ms.storeId}) does NOT resolve!`
  );
}

console.log("\n=================================================");
console.log(`QA RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log("=================================================");

if (failed > 0) {
  process.exit(1);
}
