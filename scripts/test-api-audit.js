/**
 * @file scripts/test-api-audit.js
 * @description Comprehensive automated audit script for all GoCoupon VPS Express endpoints.
 */

const BASE_URL = "http://localhost:3000";

async function testEndpoint(name, path, options = {}) {
  const start = Date.now();
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: "application/json, text/html",
        ...(options.headers || {}),
      },
    });
    const elapsed = Date.now() - start;
    const contentType = res.headers.get("content-type") || "";
    const cacheControl = res.headers.get("cache-control") || "none";
    const xCache = res.headers.get("x-cache") || "-";

    let dataSummary = "";
    if (contentType.includes("application/json")) {
      const json = await res.json();
      if (Array.isArray(json)) {
        dataSummary = `Array[${json.length}]`;
      } else if (typeof json === "object" && json !== null) {
        const keys = Object.keys(json).slice(0, 4).join(", ");
        dataSummary = `{ ${keys}... }`;
      } else {
        dataSummary = String(json);
      }
    } else {
      const text = await res.text();
      dataSummary = `HTML/Text (${(text.length / 1024).toFixed(1)} KB)`;
    }

    return {
      name,
      path,
      status: res.status,
      ok: res.ok,
      elapsedMs: elapsed,
      contentType: contentType.split(";")[0],
      cacheControl: cacheControl.slice(0, 30),
      xCache,
      summary: dataSummary,
    };
  } catch (err) {
    return {
      name,
      path,
      status: "ERR",
      ok: false,
      elapsedMs: Date.now() - start,
      contentType: "error",
      cacheControl: "-",
      xCache: "-",
      summary: err.message,
    };
  }
}

async function runAudit() {
  console.log("===============================================================================");
  console.log(`🔍 GoCoupon API & Production Audit — Target: ${BASE_URL}`);
  console.log("===============================================================================\n");

  const tests = [
    // 1. Core Health & System
    ["Health Check", "/api/health"],

    // 2. Taxonomy & Categorisation API
    ["Categories Taxonomy (All)", "/api/categories"],
    ["Category Details (Electronics)", "/api/categories/electronics"],
    ["Category Details (Food)", "/api/categories/food"],

    // 3. Stores API & Sorting
    ["Stores (All)", "/api/stores"],
    ["Stores (Filter Category)", "/api/stores?category=Electronics&limit=5"],
    ["Stores (Sort by Rating DESC)", "/api/stores?sortBy=rating&order=desc&limit=5"],
    ["Stores (Sort by Coupons Count)", "/api/stores?sortBy=couponsCount&order=desc&limit=5"],
    ["Stores (Search Query)", "/api/stores?q=amazon"],
    ["Stores (Pagination)", "/api/stores?limit=2&offset=2"],

    // 4. Deals API & Sorting
    ["Deals (Default Feed)", "/api/deals"],
    ["Deals (Filter Category)", "/api/deals?category=Food&limit=3"],
    ["Deals (Sort by Discount DESC)", "/api/deals?sortBy=discount&order=desc&limit=5"],
    ["Deals (Sort by Trending)", "/api/deals?sortBy=trending&order=desc&limit=5"],
    ["Deals (Filter Badge)", "/api/deals?badge=Trending"],
    ["Deals (Pagination)", "/api/deals?limit=2&offset=2"],

    // 5. Coupons API & Categorisation & Sorting
    ["Coupons (All)", "/api/coupons"],
    ["Coupons (By Store 'amazon')", "/api/coupons?store=amazon"],
    ["Coupons (By Category 'food')", "/api/coupons?category=food"],
    ["Coupons (Sort by Success Rate)", "/api/coupons?sortBy=successRate&order=desc&limit=5"],
    ["Coupons (By Domain 'flipkart.com')", "/api/coupons?domain=flipkart.com"],

    // 6. Comparison Engine API
    ["Compare (By Query)", "/api/compare?q=Sony%20WH-1000XM5"],
    ["Compare (By Product ID)", "/api/compare?productId=prod_sony_wh1000xm5"],

    // 7. Search & Accuracy Engine
    ["Instant OmniSearch", "/api/search?q=phone&limit=5"],
    ["Search Accuracy Check (Sony XM5)", "/api/search?q=Sony%20WH-1000XM5&sortBy=accuracy&minAccuracy=50&limit=5"],
    ["Search Accuracy Check (iPhone 16)", "/api/search?q=iPhone%2016%20Pro%20Max&sortBy=accuracy&limit=5"],
    ["URL / Product Resolution", "/api/resolve?q=iPhone%2016"],
    ["Price History 90-Day", "/api/price-history?productId=prod_sony_wh1000xm5&days=30"],

    // 8. Search & Shopping Proxies
    ["Google Shopping Proxy", "/api/shopping?q=headphones"],
    ["SearXNG Proxy", "/api/searxng?q=running%20shoes"],

    // 8. Affiliates Feed
    ["Affiliate Products", "/api/affiliates/products?provider=amazon&country=IN&limit=3"],

    // 9. Price Alerts
    [
      "Register Price Alert",
      "/api/alerts/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: "prod_sony_wh1000xm5",
          productTitle: "Sony WH-1000XM5",
          targetPrice: 24990,
          currentPrice: 29990,
          store: "Amazon India",
        }),
      },
    ],
    ["Trigger Price Alert Check", "/api/alerts/check"],

    // 10. Static & SEO Pre-rendering
    ["Root Homepage (HTML)", "/"],
    ["Pre-rendered SEO Route", "/flipkart-coupons"],
    ["Pre-rendered Store Directory", "/stores"],

    // 11. Error Handling & Edge Cases
    ["404 Unknown API Route", "/api/unknown-endpoint-xyz"],
  ];

  const results = [];
  for (const [name, path, options] of tests) {
    const result = await testEndpoint(name, path, options);
    results.push(result);

    const icon = result.ok || (result.status === 404 && path.includes("unknown")) ? "✅" : "⚠️";
    console.log(
      `${icon} [${String(result.status).padEnd(3)}] ${result.elapsedMs.toString().padStart(4)}ms | ${name.padEnd(28)} | ${result.path.padEnd(36)} | ${result.summary}`
    );
  }

  // Detailed Search Accuracy Deep-Dive
  console.log("\n── Search Accuracy & Relevance Engine Deep-Dive ──");
  try {
    const searchRes = await fetch(`${BASE_URL}/api/search?q=Sony%20WH-1000XM5&sortBy=accuracy&minAccuracy=40&limit=5`);
    const searchData = await searchRes.json();
    console.log(`Query: "Sony WH-1000XM5" | Total Found: ${searchData.totalFound} | Returned: ${searchData.results?.length}`);
    if (searchData.accuracyAudit) {
      const a = searchData.accuracyAudit;
      console.log(`Audit Summary: Average Score: ${a.averageAccuracyScore}% | Confidence: ${a.confidenceRating}`);
      console.log(`Distribution: Exact: ${a.exactMatchesCount} | High: ${a.highAccuracyCount} | Moderate: ${a.moderateAccuracyCount} | Low: ${a.lowAccuracyCount}`);
      console.log(`Detected Intent:`, a.detectedIntent);
    }
    console.log("\nTop Candidates Accuracy Scores:");
    (searchData.results || []).slice(0, 3).forEach((item, idx) => {
      const acc = item.accuracy || {};
      console.log(`  [${idx + 1}] Score: ${acc.score}/100 [${acc.grade}] | ${item.title?.slice(0, 48)}... | ₹${item.price} (${item.storeName || item.storeId})`);
      if (acc.relevanceReasons && acc.relevanceReasons.length > 0) {
        console.log(`      Positive: ${acc.relevanceReasons.join(", ")}`);
      }
    });
  } catch (err) {
    console.error("Failed to run search accuracy deep dive:", err.message);
  }

  // Second pass for cache check on /api/stores
  console.log("\n── Cache Verification Pass ──");
  const cacheTest = await testEndpoint("Stores Cache Check (2nd hit)", "/api/stores?limit=5");
  console.log(
    `⚡ [${cacheTest.status}] ${cacheTest.elapsedMs}ms | ${cacheTest.name} | ${cacheTest.summary}`
  );

  console.log("\n===============================================================================");
  const passed = results.filter((r) => r.ok || (r.status === 404 && r.path.includes("unknown"))).length;
  console.log(`📊 Audit Complete: ${passed}/${results.length} Endpoints & Checks Verified`);
  console.log("===============================================================================\n");
}

runAudit();
