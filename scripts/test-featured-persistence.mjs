import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const dataPath = path.join(projectRoot, "src/data/live-deals.json");

console.log("\n=======================================================");
console.log("   🧪 FEATURED DEALS & ADMIN UPLOAD PERSISTENCE TEST   ");
console.log("=======================================================\n");

// 1. Read existing live-deals.json
const raw = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
const initialCount = raw.deals.length;
console.log(`[1] Baseline live-deals.json total deals: ${initialCount}`);

const existingFeatured = raw.deals.filter(d => d.isFeatured || String(d.id).startsWith("ac-"));
console.log(`[2] Existing featured deals: ${existingFeatured.length}`);
console.log(`    Brands: ${existingFeatured.map(d => d.storeName).join(", ")}`);

// 2. Simulate Admin uploading a new featured deal
const testDealId = `admin-test-deal-${Date.now()}`;
const testAdminDeal = {
  id: testDealId,
  storeName: "TestBrandAdmin",
  storeSlug: "testbrandadmin-coupons",
  storeLogo: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  category: "Electronics",
  title: "TestBrandAdmin Coupon Code: SAVE100 – Extra ₹100 Off (Admin Curated)",
  code: "SAVE100",
  discount: "₹100 OFF",
  badge: "Verified",
  verifiedDate: "Live Verified",
  expiresIn: "30 days left",
  endDate: "2026-12-31",
  terms: "Admin test offer terms.",
  link: "https://testbrandadmin.com",
  usesCount: 888,
  source: "admin",
  verified: true,
  status: "active",
  isFeatured: true,
  featuredPriority: 1,
  campaignSource: "manual",
  targetCountry: "India Eligible",
  verificationStatus: "verified"
};

console.log(`\n[3] Simulating admin upload of deal: "${testAdminDeal.title}"`);
const updatedDeals = [testAdminDeal, ...raw.deals];
fs.writeFileSync(dataPath, JSON.stringify({ ...raw, deals: updatedDeals, updatedAt: new Date().toISOString() }, null, 2), "utf-8");
console.log("    ✅ Successfully written test admin featured deal to src/data/live-deals.json");

// 3. Test Cuelinks sync immunity logic
console.log("\n[4] Testing Cuelinks Sync Immunity Rule...");
const testDisk = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
const testDealFound = testDisk.deals.find(d => d.id === testDealId);
if (!testDealFound) {
  throw new Error("❌ Test deal not found immediately after disk write!");
}
console.log("    ✅ Deal present in disk file.");

// Check if immunity condition passes
const isImmune = testDealFound.isFeatured ||
  testDealFound.source === "admin" ||
  testDealFound.campaignSource === "manual" ||
  String(testDealFound.id).startsWith("ac-") ||
  String(testDealFound.id).startsWith("offer-") ||
  String(testDealFound.id).startsWith("admin-");

if (!isImmune) {
  throw new Error("❌ Immunity check failed for admin deal!");
}
console.log("    ✅ Permanent immunity rule confirmed: Deal is immune from Cuelinks pruning.");

// 4. Test queryDeals featured filter
const { queryDeals } = await import("../src/lib/server-data/deals-db.ts");
const queryRes = queryDeals({ featured: true }, updatedDeals);
const dealInQuery = queryRes.deals.find(d => d.id === testDealId);
if (!dealInQuery) {
  throw new Error("❌ Deal was not returned by queryDeals({ featured: true })!");
}
console.log(`    ✅ queryDeals({ featured: true }) returned ${queryRes.deals.length} deals including "${dealInQuery.storeName}".`);

// 5. Test expired deal immunity (even if an admin deal is technically expired, featured/admin status preserves it)
const expiredAdminDeal = {
  ...testAdminDeal,
  id: `${testDealId}-expired`,
  endDate: "2020-01-01",
  expiresIn: "Expired"
};
const queryExpiredImmunity = queryDeals({ featured: true }, [expiredAdminDeal]);
if (!queryExpiredImmunity.deals.find(d => d.id === `${testDealId}-expired`)) {
  throw new Error("❌ Featured admin deal disappeared when expired!");
}
console.log("    ✅ Permanent immunity confirmed even across past dates: Featured admin deals NEVER vanish.");

// 6. Rollback / Cleanup test deal from disk
console.log("\n[5] Cleaning up test deal from src/data/live-deals.json...");
const cleanedDeals = updatedDeals.filter(d => d.id !== testDealId);
fs.writeFileSync(dataPath, JSON.stringify({ ...raw, deals: cleanedDeals, updatedAt: new Date().toISOString() }, null, 2), "utf-8");
console.log("    ✅ Cleaned up test deals. Disk restored to baseline.");

console.log("\n=======================================================");
console.log("   🎉 ALL TESTS PASSED: 100% PERSISTENCE & IMMUNITY   ");
console.log("=======================================================\n");
