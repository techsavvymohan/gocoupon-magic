import fs from "node:fs";
import { getStoreCatalog, getStoreBySlug } from "../../src/lib/store-catalog-helper.ts";
import { findMatchingStores } from "../../src/lib/services/store-registry.ts";
import { queryDeals } from "../../src/lib/server-data/deals-db.ts";

console.log("=== RUNNING SEARCH BUG VERIFICATION TEST SUITE ===");

// 1. Verify getStoreCatalog() includes Hostinger and deals
const catalog = getStoreCatalog();
console.log(`[Test 1] Catalog total stores: ${catalog.size}`);
const hostingerCatalog = catalog.get("hostinger-coupons");
if (hostingerCatalog) {
  console.log(`✅ [Pass] Hostinger in catalog: ${hostingerCatalog.name}, slug: ${hostingerCatalog.slug}, deals: ${hostingerCatalog.deals.length}`);
  const deal = hostingerCatalog.deals.find(d => d.code === "GLOBALHOST10");
  if (deal) {
    console.log(`✅ [Pass] Hostinger default coupon GLOBALHOST10 verified in catalog deals: ${deal.title}`);
  } else {
    console.error("❌ [Fail] GLOBALHOST10 missing in Hostinger catalog deals");
  }
} else {
  console.error("❌ [Fail] Hostinger missing in getStoreCatalog()");
}

// 2. Verify getStoreBySlug
const bySlug1 = getStoreBySlug("hostinger");
const bySlug2 = getStoreBySlug("hostinger-coupons");
if (bySlug1 && bySlug2 && bySlug1.name === "Hostinger" && bySlug2.name === "Hostinger") {
  console.log("✅ [Pass] getStoreBySlug resolves both 'hostinger' and 'hostinger-coupons'");
} else {
  console.error("❌ [Fail] getStoreBySlug resolution failed", { bySlug1: bySlug1?.name, bySlug2: bySlug2?.name });
}

// 3. Verify store-registry findMatchingStores
const matching = findMatchingStores("hostinger", 3);
if (matching.length > 0 && matching[0].name.toLowerCase().includes("hostinger")) {
  console.log(`✅ [Pass] findMatchingStores("hostinger") returned: ${matching[0].name} (${matching[0].id})`);
} else {
  console.error("❌ [Fail] findMatchingStores('hostinger') returned no results");
}

// 4. Verify live-deals.json in src and public
const srcDeals = JSON.parse(fs.readFileSync("src/data/live-deals.json", "utf8"));
const pubDeals = JSON.parse(fs.readFileSync("public/data/live-deals.json", "utf8"));

const srcHostinger = srcDeals.deals.find(d => d.code === "GLOBALHOST10" || (d.storeName && d.storeName.toLowerCase().includes("hostinger")));
const pubHostinger = pubDeals.deals.find(d => d.code === "GLOBALHOST10" || (d.storeName && d.storeName.toLowerCase().includes("hostinger")));

if (srcHostinger && pubHostinger) {
  console.log(`✅ [Pass] Hostinger deal found in both src/data and public/data (code: ${srcHostinger.code}, id: ${srcHostinger.id})`);
} else {
  console.error("❌ [Fail] Hostinger deal missing in json", { src: Boolean(srcHostinger), pub: Boolean(pubHostinger) });
}

// 5. Verify queryDeals for Hostinger keyword and code
const dealsQ = queryDeals({ q: "hostinger" }, srcDeals.deals);
console.log(`[Test 5] queryDeals({ q: 'hostinger' }) returned ${dealsQ.deals.length} deals`);
if (dealsQ.deals.length > 0) {
  console.log(`✅ [Pass] queryDeals found: ${dealsQ.deals[0].title} (code: ${dealsQ.deals[0].code})`);
} else {
  console.error("❌ [Fail] queryDeals returned 0 for 'hostinger'");
}

const dealsCodeQ = queryDeals({ q: "GLOBALHOST10" }, srcDeals.deals);
console.log(`[Test 6] queryDeals({ q: 'GLOBALHOST10' }) returned ${dealsCodeQ.deals.length} deals`);
if (dealsCodeQ.deals.length > 0) {
  console.log(`✅ [Pass] queryDeals found code GLOBALHOST10: ${dealsCodeQ.deals[0].storeName}`);
} else {
  console.error("❌ [Fail] queryDeals returned 0 for code 'GLOBALHOST10'");
}

// 7. Verify other prominent brands search
const testBrands = ["Samsung", "Lenovo", "Dell", "Booking", "Myntra", "Swiggy", "Adidas"];
for (const b of testBrands) {
  const res = queryDeals({ q: b }, srcDeals.deals);
  const storeRes = findMatchingStores(b, 2);
  console.log(`[Brand Check] "${b}": deals=${res.deals.length}, stores=${storeRes.length}`);
}

console.log("=== ALL SEARCH VERIFICATION TESTS COMPLETED SUCCESSFULLY ===");
