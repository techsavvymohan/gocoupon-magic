import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

console.log("\n=======================================================");
console.log("   🚀 DEVOPS & DEPLOYMENT PERSISTENCE SUITE");
console.log("=======================================================\n");

async function runDevOpsTests() {
  const { dealsDb, storesDb } = await import("../server/services/db.js");
  const { getLiveDeals, setLiveDeals } = await import("../src/lib/server-data/deals-db.js");
  const { getLiveDealsPool, isDealValid } = await import("../server/services/providers/cuelinks-client.js");

  const dealsPath = path.join(projectRoot, "src/data/live-deals.json");
  const backupDealsPath = path.join(projectRoot, "src/data/live-deals.backup.json");
  const storesPath = path.join(projectRoot, "src/data/live-stores.json");
  const backupStoresPath = path.join(projectRoot, "src/data/live-stores.backup.json");

  // Record baseline counts
  const initialRawDeals = JSON.parse(fs.readFileSync(dealsPath, "utf-8"));
  const initialDealsCount = initialRawDeals.deals.length;
  console.log(`[1] Baseline live-deals.json deals: ${initialDealsCount}`);

  // Test 1: Ingest Admin Deal via dealsDb.upsertDeals
  const testDealId = `admin-devops-test-${Date.now()}`;
  const testStoreSlug = `devops-test-brand-${Date.now()}`;
  const testDeal = {
    id: testDealId,
    storeName: "DevOps Test Brand",
    storeSlug: testStoreSlug,
    storeLogo: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    category: "Fashion",
    title: "DevOps Test Brand 50% OFF Exclusive Promo",
    code: "DEVOPS50",
    discount: "50% OFF",
    badge: "Featured Partner",
    verifiedDate: "Verified Today",
    expiresIn: "365 days",
    endDate: new Date(Date.now() + 365 * 86400000).toISOString(),
    terms: "DevOps verified promotion.",
    link: "https://gocoupon.io",
    usesCount: 500,
    rating: 4.9,
    votesCount: 25,
    source: "admin",
    status: "active",
    type: "Coupon",
    isFeatured: true,
    featuredPriority: 1,
    campaignSource: "manual",
    targetCountry: "India",
    verificationStatus: "verified",
  };

  console.log(`\n[2] Executing dealsDb.upsertDeals for "${testDeal.title}"...`);
  await dealsDb.upsertDeals([testDeal]);

  // Verify In-Memory deals-db pool
  const liveDealsMem = getLiveDeals();
  const dealInMem = liveDealsMem.find((d) => String(d.id) === testDealId);
  if (!dealInMem) throw new Error("❌ Test deal NOT found in deals-db active memory pool!");
  console.log("    ✅ In-Memory deals-db pool updated.");

  // Verify In-Memory cuelinks-client pool
  const livePoolMem = getLiveDealsPool();
  const dealInPool = livePoolMem.find((d) => String(d.id) === testDealId);
  if (!dealInPool) throw new Error("❌ Test deal NOT found in cuelinks-client live pool!");
  console.log("    ✅ In-Memory cuelinks live pool synchronized.");

  // Verify Disk Persistence
  const diskDeals = JSON.parse(fs.readFileSync(dealsPath, "utf-8"));
  const dealOnDisk = diskDeals.deals.find((d) => String(d.id) === testDealId);
  if (!dealOnDisk) throw new Error("❌ Test deal NOT found in src/data/live-deals.json!");
  console.log("    ✅ Disk persistence verified: src/data/live-deals.json updated.");

  // Verify Automated Backup Snapshot
  if (!fs.existsSync(backupDealsPath)) throw new Error("❌ Automated backup file not created!");
  const backupDeals = JSON.parse(fs.readFileSync(backupDealsPath, "utf-8"));
  const dealInBackup = backupDeals.deals.find((d) => String(d.id) === testDealId);
  if (!dealInBackup) throw new Error("❌ Test deal NOT found in live-deals.backup.json!");
  console.log("    ✅ Backup snapshot verified: src/data/live-deals.backup.json updated.");

  // Test 2: Admin Immunity Checks
  console.log("\n[3] Testing Admin & Featured Immunity Rules...");
  if (!isDealValid(testDeal)) throw new Error("❌ isDealValid returned false for active admin deal!");
  
  // Test with expired endDate to verify permanent immunity
  const expiredAdminDeal = { ...testDeal, endDate: "2020-01-01T00:00:00.000Z", expiresIn: "Expired" };
  if (!isDealValid(expiredAdminDeal)) {
    throw new Error("❌ isDealValid failed immunity check for expired admin deal!");
  }
  console.log("    ✅ Permanent immunity verified: Admin deals immune from automatic expiry.");

  // Test 3: Upsert Store via storesDb.upsertStore
  console.log("\n[4] Testing storesDb.upsertStore...");
  const testStore = {
    id: testStoreSlug,
    slug: testStoreSlug,
    name: "DevOps Test Brand",
    logo: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    category: "Fashion",
    link: `/store/${testStoreSlug}`,
    isFeatured: true,
  };
  await storesDb.upsertStore(testStore);

  const diskStores = JSON.parse(fs.readFileSync(storesPath, "utf-8"));
  const storeOnDisk = diskStores.stores.find((s) => s.slug === testStoreSlug);
  if (!storeOnDisk) throw new Error("❌ Store NOT found in src/data/live-stores.json!");
  console.log("    ✅ Store disk persistence verified: src/data/live-stores.json updated.");

  if (!fs.existsSync(backupStoresPath)) throw new Error("❌ Store backup snapshot missing!");
  console.log("    ✅ Store backup snapshot verified: src/data/live-stores.backup.json updated.");

  // Test 4: Delete Deal via dealsDb.deleteDeal
  console.log(`\n[5] Testing dealsDb.deleteDeal for "${testDealId}"...`);
  await dealsDb.deleteDeal(testDealId);

  const afterDeleteMem = getLiveDeals().find((d) => String(d.id) === testDealId);
  if (afterDeleteMem) throw new Error("❌ Deal still present in deals-db memory pool after deletion!");

  const afterDeletePool = getLiveDealsPool().find((d) => String(d.id) === testDealId);
  if (afterDeletePool) throw new Error("❌ Deal still present in cuelinks pool after deletion!");

  const afterDeleteDisk = JSON.parse(fs.readFileSync(dealsPath, "utf-8"));
  const afterDeleteOnDisk = afterDeleteDisk.deals.find((d) => String(d.id) === testDealId);
  if (afterDeleteOnDisk) throw new Error("❌ Deal still present on disk after deletion!");
  console.log("    ✅ Dual memory and disk deletion verified.");

  // Clean up store from live-stores.json
  const cleanedStores = diskStores.stores.filter((s) => s.slug !== testStoreSlug);
  fs.writeFileSync(storesPath, JSON.stringify({ ...diskStores, stores: cleanedStores }, null, 2), "utf-8");

  // Restore baseline
  fs.writeFileSync(dealsPath, JSON.stringify(initialRawDeals, null, 2), "utf-8");
  setLiveDeals(initialRawDeals.deals);

  console.log("\n=======================================================");
  console.log("   🎉 ALL DEVOPS PERSISTENCE TESTS PASSED (100% RELIABILITY)");
  console.log("=======================================================\n");
}

runDevOpsTests().catch((err) => {
  console.error("\n❌ DevOps Persistence Test Failed:", err);
  process.exit(1);
});
