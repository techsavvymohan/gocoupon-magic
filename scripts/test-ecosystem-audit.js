/**
 * @file scripts/test-ecosystem-audit.js
 * @description Automated Verification Suite for GoCoupon Instant Price Drop (IPD),
 * Stacking Calculator, Bank Card Maximizer, and Remote Extension Configuration.
 */

const BASE_URL = "http://localhost:3000";

async function runAudit() {
  console.log("===============================================================================");
  console.log(`🔍 GoCoupon IPD Ecosystem & Stacking Audit — Target: ${BASE_URL}`);
  console.log("===============================================================================\n");

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}: ${err.message}`);
    }
  }

  // 1. Bank Offers Engine
  await test("GET /api/bank-offers (Active Offers Loaded)", async () => {
    const res = await fetch(`${BASE_URL}/api/bank-offers`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.offers || data.offers.length === 0) throw new Error("No active bank offers returned");
    const hdfc = data.offers.find((o) => o.bankName.includes("HDFC"));
    if (!hdfc) throw new Error("HDFC Bank offer missing from registry");
    if (hdfc.maxDiscountCap !== 3000) throw new Error(`Expected max cap 3000, got ${hdfc.maxDiscountCap}`);
  });

  await test("GET /api/bank-offers?region=US (US Amex/Chase Offers)", async () => {
    const res = await fetch(`${BASE_URL}/api/bank-offers?region=US`);
    const data = await res.json();
    if (data.region !== "US") throw new Error(`Region mismatch: ${data.region}`);
    if (!data.offers.some((o) => o.bankName.includes("American Express") || o.bankName.includes("Chase"))) {
      throw new Error("US card offers missing");
    }
  });

  // 2. Stacking Calculator: True Landed Cost
  await test("POST /api/stack/evaluate (India: Amazon + HDFC + Coupon)", async () => {
    const res = await fetch(`${BASE_URL}/api/stack/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeName: "Amazon India",
        stickerPrice: 29990,
        currency: "INR",
        region: "IN",
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const stack = json.stack;
    if (!stack) throw new Error("No stack breakdown returned");
    if (stack.trueNetLandedCost >= stack.stickerPrice) {
      throw new Error(`Net landed cost (${stack.trueNetLandedCost}) should be less than sticker (${stack.stickerPrice})`);
    }
    if (stack.totalInstantSavings <= 0) {
      throw new Error("Zero instant savings calculated");
    }
    console.log(`       Sticker: ₹${stack.stickerPrice} -> Net Landed: ₹${stack.trueNetLandedCost} (Saved: ₹${stack.totalInstantSavings} / ${stack.savingsPercentage}%)`);
  });

  await test("POST /api/stack/evaluate (US: Best Buy + Amex)", async () => {
    const res = await fetch(`${BASE_URL}/api/stack/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeName: "Best Buy",
        stickerPrice: 349,
        currency: "USD",
        region: "US",
      }),
    });
    const json = await res.json();
    const stack = json.stack;
    if (stack.currency !== "USD") throw new Error(`Expected USD, got ${stack.currency}`);
    if (stack.trueNetLandedCost >= stack.stickerPrice) throw new Error("US stack savings not computed");
    console.log(`       Sticker: $${stack.stickerPrice} -> Net Landed: $${stack.trueNetLandedCost} (Saved: $${stack.totalInstantSavings} / ${stack.savingsPercentage}%)`);
  });

  // 3. Remote Extension Selectors
  await test("GET /api/extension/selectors.json (DOM Selectors Hydration)", async () => {
    const res = await fetch(`${BASE_URL}/api/extension/selectors.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.merchants || !data.merchants["amazon.in"] || !data.merchants["flipkart.com"]) {
      throw new Error("Missing Amazon or Flipkart selectors in hydration config");
    }
    const amz = data.merchants["amazon.in"];
    if (!amz.cartCouponBox.inputSelector || !amz.cartCouponBox.applyButtonSelector) {
      throw new Error("Incomplete selector definition");
    }
  });

  // 4. Upgraded Live Comparison Engine (with Stacking & Deal Honesty)
  await test("GET /api/compare?productId=prod_sony_wh1000xm5 (Stacked Rows & Deal Honesty)", async () => {
    const res = await fetch(`${BASE_URL}/api/compare?productId=prod_sony_wh1000xm5`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.rows || data.rows.length === 0) throw new Error("No comparison rows returned");
    const firstRow = data.rows[0];
    if (!firstRow.stack) throw new Error("Comparison row missing stacked savings breakdown");
    if (!data.dealHonesty) throw new Error("Comparison missing Deal Honesty analysis");
    console.log(`       Stores: ${data.storesComparedCount} | Lowest: ₹${firstRow.itemPrice} | Stacked Net: ₹${firstRow.stack.trueNetLandedCost}`);
    console.log(`       Deal Honesty: ${data.dealHonesty.score}/100 [${data.dealHonesty.grade}] - ${data.dealHonesty.badgeLabel}`);
  });

  console.log("\n===============================================================================");
  console.log(`📊 Audit Complete: ${passed}/${total} Tests Passed (${Math.round((passed / total) * 100)}%)`);
  console.log("===============================================================================\n");
}

runAudit();
