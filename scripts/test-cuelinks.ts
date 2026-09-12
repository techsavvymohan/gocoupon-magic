/**
 * @file scripts/test-cuelinks.ts
 * @description Diagnostic and verification script for Cuelinks API v3 integration.
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/test-cuelinks.ts
 *   or: npm run test:cuelinks
 */

import {
  getCuelinksConfig,
  testCuelinksConnection,
  fetchCuelinksCoupons,
  fetchCuelinksCampaigns,
  buildCuelinksRedirectUrl,
  convertCuelinksLinkApi,
} from "../server/services/providers/cuelinks-client.js";

async function runDiagnostic() {
  console.log("\n=======================================================");
  console.log(" 🔗 GoCoupon — Cuelinks API v3 Diagnostic & Verification");
  console.log("=======================================================\n");

  const config = getCuelinksConfig();
  console.log(`📌 Publisher ID: ${config.publisherId}`);
  console.log(`🔑 API Key:      ${config.isConfigured ? `${config.apiKey.slice(0, 4)}...${config.apiKey.slice(-4)}` : "❌ NOT SET (using resilient fallback mode)"}`);
  console.log(`📡 Channel ID:   ${config.channelId || "Default"}\n`);

  // 1. Connection Health Probe (/ping)
  console.log("--- 1. Testing Cuelinks API v3 Ping (/ping) ---");
  const connection = await testCuelinksConnection();
  console.log(`Status:       ${connection.connected ? "✅ CONNECTED (Live API v3)" : connection.configured ? "⚠️ CONNECT FAILED" : "ℹ️ FALLBACK MODE"}`);
  console.log(`Message:      ${connection.message}`);
  if (connection.publisherName) console.log(`Publisher:    ${connection.publisherName} (${connection.publisherEmail})`);
  if (connection.currency) console.log(`Currency:     ${connection.currency}`);
  if (connection.scopes) console.log(`Scopes:       ${connection.scopes.join(", ")}`);
  if (connection.latencyMs) console.log(`Latency:      ${connection.latencyMs}ms`);

  // 2. Link Builder Verification (Synchronous & API v3)
  console.log("\n--- 2. Testing Automated Affiliate Deep Linking ---");
  const testUrls = [
    { name: "Flipkart", url: "https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4" },
    { name: "Myntra", url: "https://www.myntra.com/tshirts/hrx-by-hrithik-roshan/hrx-men-yellow-tshirt/1700944/buy" },
    { name: "Croma", url: "https://www.croma.com/sony-wh-1000xm5-bluetooth-headphone/p/262529" },
  ];

  for (const item of testUrls) {
    const fastLink = buildCuelinksRedirectUrl({
      merchantUrl: item.url,
      subId: "gocoupon_sync_test",
    });
    const apiResult = await convertCuelinksLinkApi({
      merchantUrl: item.url,
      subId: "gocoupon_api_test",
    });

    console.log(`\n• Merchant:       ${item.name}`);
    console.log(`  Raw URL:        ${item.url.slice(0, 55)}...`);
    console.log(`  Sync Redirect:  ${fastLink}`);
    console.log(`  Live API Conv:  ${apiResult.trackingUrl} (${apiResult.isApiConverted ? "via /links/convert" : "fallback protocol"})`);
  }

  // 3. Coupons Ingestion Test (/offers)
  console.log("\n--- 3. Testing Offers & Coupons Ingestion (/offers) ---");
  const coupons = await fetchCuelinksCoupons({ limit: 4 });
  console.log(`Retrieved ${coupons.length} coupons/deals:`);
  for (const c of coupons) {
    console.log(`  [${c.storeName}] Code: ${c.code.padEnd(14)} | ${c.discount.padEnd(12)} | ${c.title.slice(0, 45)}`);
  }

  // 4. Merchant Campaigns Ingestion Test (/campaigns)
  console.log("\n--- 4. Testing Merchant Campaigns Ingestion (/campaigns) ---");
  const campaigns = await fetchCuelinksCampaigns({ limit: 5 });
  console.log(`Retrieved ${campaigns.length} merchant campaigns:`);
  for (const cmp of campaigns) {
    console.log(`  [ID ${cmp.id}] ${cmp.name.padEnd(20)} | Payout: ${cmp.payoutRate.padEnd(14)} | Domain: ${cmp.domain}`);
  }

  // 5. Deals Hub Ingestion Test (/api/deals integration)
  console.log("\n--- 5. Testing Deals Engine Ingestion (fetchCuelinksDeals) ---");
  const { fetchCuelinksDeals } = await import("../server/services/providers/cuelinks-client.js");
  const deals = await fetchCuelinksDeals({ limit: 3 });
  console.log(`Retrieved ${deals.length} normalized deal records:`);
  for (const d of deals) {
    console.log(`  [${d.storeName}] ${d.title.slice(0, 40)}... -> ${d.discount} (Code: ${d.code})`);
    console.log(`    Affiliate Link: ${d.link.slice(0, 70)}...`);
  }

  // 6. Price Comparison Stacking Engine Test
  console.log("\n--- 6. Testing Price Comparison Stacking Engine ---");
  const { calculateStackedSavings } = await import("../server/services/stack-calculator.js");
  const { normalizeCuelinksToStoreCoupon } = await import("../server/services/providers/cuelinks-client.js");
  const normalizedCoupons = coupons.map(normalizeCuelinksToStoreCoupon);

  const testStores = [
    { store: "Flipkart", price: 54999 },
    { store: "Myntra", price: 2999 },
    { store: "Croma", price: 24990 },
  ];

  for (const ts of testStores) {
    const stack = calculateStackedSavings({
      storeName: ts.store,
      stickerPrice: ts.price,
      currency: "INR",
      availableCoupons: normalizedCoupons,
    });
    console.log(`• Store: ${ts.store.padEnd(10)} | Sticker: ₹${ts.price.toLocaleString()} | True Landed: ₹${stack.trueNetLandedCost.toLocaleString()}`);
    console.log(`  Commission/Cashback: ${stack.cashback.ratePercent}% (₹${stack.cashback.amount}) | Card: ${stack.bankOffer.applied ? `₹${stack.bankOffer.discountAmount}` : "None"} | Coupon: ${stack.coupon.applied ? `${stack.coupon.code} (₹${stack.coupon.discountAmount})` : "None"}`);
  }

  console.log("\n=======================================================");
  if (!config.isConfigured) {
    console.log("💡 TIP: To enable live Cuelinks v3 API data, generate");
    console.log("   your API key at:");
    console.log("   👉 https://www.cuelinks.com/api-key");
    console.log("   (Select scopes: read:campaigns, write:links, read:offers)");
    console.log("   Then add to .env: CUELINKS_API_KEY=your_key_here");
  } else if (connection.connected) {
    console.log("🎉 SUCCESS: Cuelinks API v3 is active, authenticated,");
    console.log("   and powering GoCoupon Price Comparison, Deals & Auto-Monetization!");
  }
  console.log("=======================================================\n");
}

runDiagnostic().catch((err) => {
  console.error("Diagnostic execution error:", err);
  process.exit(1);
});
