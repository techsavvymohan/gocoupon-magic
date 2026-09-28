const endpoints = [
  { path: "/", expectedTitle: "GoCoupon" },
  { path: "/amazon-coupons", expectedTitle: "Amazon" },
  { path: "/flipkart-coupons", expectedTitle: "Flipkart" },
  { path: "/croma-coupons", expectedTitle: "Croma" },
  { path: "/boat-coupons", expectedTitle: "boAt" },
  { path: "/tata-cliq-coupons", expectedTitle: "Tata CLiQ" },
  { path: "/nykaa-coupons", expectedTitle: "Nykaa" },
  { path: "/meesho-coupons", expectedTitle: "Meesho" },
  { path: "/category/electronics", expectedTitle: "Electronics" },
  { path: "/category/fashion", expectedTitle: "Fashion" },
  { path: "/merchant-score-index", expectedTitle: "Merchant" },
  { path: "/featured-deals", expectedTitle: "Featured Deals" },
  { path: "/help", expectedTitle: "Help" },
  { path: "/compare", expectedTitle: "Compare" },
  { path: "/price-history", expectedTitle: "Price" },
  { path: "/stores", expectedTitle: "Stores" },
  { path: "/sitemap.xml", isXml: true },
  { path: "/404.html", expectedTitle: "Page Not Found" },
];

console.log("=================================================");
console.log("🌐 LIVE ENDPOINT HTTP & CONTENT INTEGRITY AUDIT");
console.log("=================================================\n");

let passed = 0;
let failed = 0;

for (const ep of endpoints) {
  const url = `http://localhost:4173${ep.path}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`  ❌ [FAIL] ${ep.path}: HTTP status ${res.status}`);
      failed++;
      continue;
    }
    const text = await res.text();
    if (ep.isXml) {
      if (text.includes("<urlset") && text.includes("https://gocoupon.io")) {
        console.log(`  ✅ [PASS] ${ep.path.padEnd(25)}: HTTP 200 OK (${(text.length / 1024).toFixed(1)} KB XML)`);
        passed++;
      } else {
        console.error(`  ❌ [FAIL] ${ep.path}: Malformed XML response`);
        failed++;
      }
    } else {
      const titleM = text.match(/<title>(.*?)<\/title>/i);
      const title = titleM ? titleM[1] : "No Title Found";
      if (!ep.expectedTitle || title.includes(ep.expectedTitle)) {
        console.log(`  ✅ [PASS] ${ep.path.padEnd(25)}: HTTP 200 OK | Title: "${title}"`);
        passed++;
      } else {
        console.error(`  ❌ [FAIL] ${ep.path}: Expected title to include "${ep.expectedTitle}", got "${title}"`);
        failed++;
      }
    }
  } catch (err) {
    console.error(`  ❌ [FAIL] ${ep.path}: Fetch failed - ${err.message}`);
    failed++;
  }
}

console.log("\n=================================================");
console.log(`Total Endpoints Tested: ${endpoints.length}`);
console.log(`Passed                : ${passed} (✓)`);
console.log(`Failed                : ${failed} (❌)`);
console.log(`Health Status         : ${failed === 0 ? "🟢 100% OPERATIONAL" : "🔴 DEGRADED"}`);
console.log("=================================================");

if (failed > 0) {
  process.exit(1);
}
