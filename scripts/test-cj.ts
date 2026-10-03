/**
 * @file scripts/test-cj.ts
 * @description Diagnostic script to test CJ Affiliate GraphQL connectivity and deals sync.
 */

import { fetchLiveCjDeals, syncCjDeals, getCjConfig } from "../server/services/providers/cj-client.js";

async function main() {
  console.log("\n=======================================================");
  console.log(" 🚀 GoCoupon — CJ Affiliate Diagnostic & Sync Test");
  console.log("=======================================================\n");

  const config = getCjConfig();
  console.log(`📌 Publisher ID (CID): ${config.publisherId}`);
  console.log(`🔑 Token Configured:   ${config.isConfigured ? "YES" : "NO"}`);

  console.log("\n--- 1. Fetching Live & Curated CJ Deals ---");
  const deals = await fetchLiveCjDeals();
  console.log(`✓ Received ${deals.length} deals from CJ Provider:`);
  deals.forEach((d, idx) => {
    console.log(`  [${idx + 1}] ${d.storeName} (${d.code || "DEAL"}): ${d.discount} - "${d.title}"`);
  });

  console.log("\n--- 2. Testing In-Memory Pool Sync ---");
  const syncResult = await syncCjDeals();
  console.log("✓ Sync Result:", syncResult);

  console.log("\n🎉 CJ Affiliate integration test completed successfully!\n");
}

main().catch(console.error);
