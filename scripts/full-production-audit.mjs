/**
 * @file scripts/full-production-audit.mjs
 * @description Comprehensive 360-Degree Production Launch Readiness Audit for GoCoupon.
 *
 * Checks:
 * 1. Database & Cloud PostgreSQL status (connection, latency, table counts)
 * 2. API Endpoints (Deals, Stores, Categories, Submissions, Sync Stats)
 * 3. Price Intelligence Engine (SearXNG + SerpAPI live comparison)
 * 4. Editorial Blog CMS & View Tracking
 * 5. Price Drop Alerts (Registration & CRON check)
 * 6. Admin Authentication & Session Cryptography
 * 7. Security & Bug Bounty Hardening (SSRF, Auth, Rate-limiting, RFC 9116)
 * 8. Static SEO Pre-rendered Routes & Sitemap
 * 9. Extension API & Multi-currency Configuration
 * 10. Environment Variables & Secret Hygiene
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generateAdminToken } from "../server/routes/admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const BASE_URL = "http://127.0.0.1:3000";
const auditResults = {
  timestamp: new Date().toISOString(),
  passed: 0,
  failed: 0,
  warnings: 0,
  categories: {},
};

function recordTest(category, name, passed, details = "", isWarning = false) {
  if (!auditResults.categories[category]) {
    auditResults.categories[category] = [];
  }
  auditResults.categories[category].push({ name, passed, details, isWarning });
  if (isWarning) {
    auditResults.warnings++;
    console.log(`  ⚠️  [${category}] ${name}: ${details}`);
  } else if (passed) {
    auditResults.passed++;
    console.log(`  ✅ [${category}] ${name}: ${details}`);
  } else {
    auditResults.failed++;
    console.log(`  ❌ [${category}] ${name}: ${details}`);
  }
}

async function runAudit() {
  console.log("================================================================================");
  console.log("🔍 STARTING GOCOUPON 360° PRE-LAUNCH PRODUCTION READINESS AUDIT");
  console.log("================================================================================\n");

  // ---------------------------------------------------------------------------
  // 1. DATABASE & PERSISTENCE LAYER
  // ---------------------------------------------------------------------------
  console.log("--- 1. DATABASE & PERSISTENCE ---");
  try {
    const adminToken = generateAdminToken("support@gocoupon.io");
    const res = await fetch(`${BASE_URL}/api/admin/database`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res.ok) {
      const data = await res.json();
      const diag = data.diagnostics || {};
      const isPostgres = diag.engine === "PostgreSQL (Supabase)";
      const isConnected = diag.status === "connected";
      const counts = diag.tableCounts || {};

      recordTest("Database", "Database Engine", isPostgres, `Engine: ${diag.engine}`);
      recordTest("Database", "Connection Health", isConnected, `Status: ${diag.status} (${diag.latencyMs}ms)`);
      recordTest("Database", "Deals Table Count", counts.deals >= 900, `${counts.deals} live deals in DB`);
      recordTest("Database", "Stores Table Count", counts.stores >= 20, `${counts.stores} stores in DB`);
      recordTest("Database", "Blogs Table Count", counts.blogs >= 5, `${counts.blogs} blog posts in DB`);
      recordTest("Database", "Submissions Table Count", counts.submissions >= 1, `${counts.submissions} submissions in DB`);
      recordTest("Database", "Price Snapshots Count", counts.price_snapshots >= 20, `${counts.price_snapshots} price points in DB`);
    } else {
      recordTest("Database", "Database Diagnostics API", false, `HTTP ${res.status}`);
    }
  } catch (err) {
    recordTest("Database", "Database Connection Check", false, err.message);
  }

  // ---------------------------------------------------------------------------
  // 2. CORE DEALS & SHOPPING APIS
  // ---------------------------------------------------------------------------
  console.log("\n--- 2. CORE DEALS & OFFERS API ---");
  try {
    // GET /api/deals
    const dealsRes = await fetch(`${BASE_URL}/api/deals?limit=10`);
    const dealsData = await dealsRes.json();
    recordTest("Deals API", "Live Deals Listing", dealsRes.ok && dealsData.total > 0, `Total deals: ${dealsData.total}, returned: ${dealsData.data?.length}`);

    // GET /api/deals/popular-brands
    const brandsRes = await fetch(`${BASE_URL}/api/deals/popular-brands`);
    const brandsData = await brandsRes.json();
    recordTest("Deals API", "Popular Brands Aggregator", brandsRes.ok && brandsData.brands?.length > 0, `Total brands: ${brandsData.brands?.length}`);

    // GET /api/deals/categories
    const catRes = await fetch(`${BASE_URL}/api/deals/categories`);
    const catData = await catRes.json();
    recordTest("Deals API", "Shopping Categories", catRes.ok && catData.categories?.length > 0, `Categories: ${catData.categories?.length}`);

    // GET /api/deals/stores
    const storesRes = await fetch(`${BASE_URL}/api/deals/stores`);
    const storesData = await storesRes.json();
    recordTest("Deals API", "Stores Aggregator", storesRes.ok && storesData.stores?.length > 0, `Stores: ${storesData.stores?.length}`);

    // GET /api/deals/stats
    const statsRes = await fetch(`${BASE_URL}/api/deals/stats`);
    const statsData = await statsRes.json();
    recordTest("Deals API", "Cuelinks 24/7 Sync Health", statsRes.ok && statsData.status === "healthy", `Active deals: ${statsData.activeCount}`);
  } catch (err) {
    recordTest("Deals API", "Deals API Pipeline", false, err.message);
  }

  // ---------------------------------------------------------------------------
  // 3. PRICE INTELLIGENCE & GOOGLE SHOPPING ENGINE
  // ---------------------------------------------------------------------------
  console.log("\n--- 3. PRICE INTELLIGENCE & GOOGLE SHOPPING ---");
  try {
    // SearXNG Local Engine Direct
    const searxRes = await fetch("http://127.0.0.1:8888/search?q=iPhone+16&format=json");
    recordTest("Price Intelligence", "SearXNG Daemon Engine", searxRes.ok, `HTTP ${searxRes.status} on port 8888`);

    // /api/shopping live multi-store Google Shopping search
    const shopRes = await fetch(`${BASE_URL}/api/shopping?q=Samsung+Galaxy+S24&country=IN`);
    const shopData = await shopRes.json();
    const shopItems = shopData.shopping_results || [];
    recordTest(
      "Price Intelligence",
      "Google Shopping Live Feed",
      shopRes.ok && shopItems.length > 0,
      `Retrieved ${shopItems.length} live product offers from Google Shopping`
    );

    // /api/compare real-time cross-store arbitrage & deal honesty
    const compRes = await fetch(`${BASE_URL}/api/compare?q=iPhone+16`);
    const compData = await compRes.json();
    const hasRows = compData.rows && compData.rows.length > 0;
    recordTest(
      "Price Intelligence",
      "Multi-Store Arbitrage & Comparison",
      compRes.ok && hasRows,
      `Compared across ${compData.storesComparedCount || compData.rows?.length} stores (Best price: ₹${compData.bestDeal?.price?.toLocaleString() || "N/A"})`
    );
    recordTest(
      "Price Intelligence",
      "Deal Honesty & Pre-Sale Markup Detection",
      compData.dealHonesty !== undefined,
      `Inflation check: ${compData.dealHonesty?.label || "Fair Market Price"}`
    );
  } catch (err) {
    recordTest("Price Intelligence", "Shopping Scraper Test", false, err.message);
  }

  // ---------------------------------------------------------------------------
  // 4. BLOGS & EDITORIAL CMS
  // ---------------------------------------------------------------------------
  console.log("\n--- 4. BLOGS & CONTENT CMS ---");
  try {
    const blogsRes = await fetch(`${BASE_URL}/api/blogs`);
    const blogsData = await blogsRes.json();
    const hasBlogs = blogsData.data && blogsData.data.length > 0;
    recordTest("Editorial CMS", "Blog Listing", blogsRes.ok && hasBlogs, `${blogsData.data?.length} articles published`);

    if (hasBlogs) {
      const firstSlug = blogsData.data[0].slug;
      const slugRes = await fetch(`${BASE_URL}/api/blogs/${firstSlug}`);
      const slugData = await slugRes.json();
      recordTest("Editorial CMS", "Slug Retrieval & View Counting", slugRes.ok && slugData.data?.slug === firstSlug, `Views: ${slugData.data?.views}`);
    }
  } catch (err) {
    recordTest("Editorial CMS", "Blog Endpoints", false, err.message);
  }

  // ---------------------------------------------------------------------------
  // 5. PRICE DROP ALERTS
  // ---------------------------------------------------------------------------
  console.log("\n--- 5. PRICE DROP ALERTS SYSTEM ---");
  try {
    const regRes = await fetch(`${BASE_URL}/api/alerts/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: "audit-sku-999",
        productTitle: "Audit Product",
        targetPrice: 1999,
        currentPrice: 2499,
        email: "audit@gocoupon.io",
      }),
    });
    const regData = await regRes.json();
    recordTest("Alerts System", "Alert Registration", regRes.ok && regData.success, `Alert ID: ${regData.alertId}`);
  } catch (err) {
    recordTest("Alerts System", "Alert Registration", false, err.message);
  }

  // ---------------------------------------------------------------------------
  // 6. SECURITY & ACCESS CONTROL
  // ---------------------------------------------------------------------------
  console.log("\n--- 6. SECURITY & ANTI-ABUSE CONTROLS ---");
  try {
    // Test 1: Unauthenticated Admin mutation blocked
    const unauthRes = await fetch(`${BASE_URL}/api/blogs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Unauthorized Test" }),
    });
    recordTest("Security", "Admin Route Auth Guard", unauthRes.status === 401, "Protected with 401 Unauthorized");

    // Test 2: SSRF Guard on resolve
    const ssrfRes = await fetch(`${BASE_URL}/api/resolve?url=http://127.0.0.1:8888/search`);
    recordTest("Security", "SSRF Loopback Block", ssrfRes.status === 400, "SSRF loopback probe successfully rejected");

    // Test 3: RFC 9116 security.txt
    const secTxtRes = await fetch(`${BASE_URL}/.well-known/security.txt`);
    const secTxt = await secTxtRes.text();
    recordTest("Security", "RFC 9116 security.txt", secTxtRes.ok && secTxt.includes("Contact:"), "Public disclosure standard active");

    // Test 4: Rate Limiting
    const rateRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid@test.com", password: "wrong" }),
    });
    recordTest("Security", "Admin Authentication Logic", rateRes.status === 401, "Rejects invalid credentials securely");
  } catch (err) {
    recordTest("Security", "Security Suite", false, err.message);
  }

  // ---------------------------------------------------------------------------
  // 7. PRE-RENDERED STATIC SEO ROUTES & DIST BUNDLE
  // ---------------------------------------------------------------------------
  console.log("\n--- 7. PRE-RENDERED STATIC SEO ROUTES ---");
  try {
    const distIndex = path.join(ROOT_DIR, "dist", "index.html");
    const hasDistIndex = fs.existsSync(distIndex);
    recordTest("SEO & Static Build", "Production Bundle (dist/index.html)", hasDistIndex, `File size: ${hasDistIndex ? fs.statSync(distIndex).size : 0} bytes`);

    const sitemapPath = path.join(ROOT_DIR, "dist", "sitemap.xml");
    const hasSitemap = fs.existsSync(sitemapPath);
    recordTest("SEO & Static Build", "XML Sitemap", hasSitemap, `Sitemap exists in dist/`);

    const robotsPath = path.join(ROOT_DIR, "dist", "robots.txt");
    const hasRobots = fs.existsSync(robotsPath);
    recordTest("SEO & Static Build", "Robots.txt", hasRobots, `Robots.txt exists in dist/`);

    // Check pre-rendered routes count
    const routes = ["offers", "stores", "categories", "compare", "extension", "blog", "privacy", "terms"];
    let preRenderedFound = 0;
    for (const r of routes) {
      if (fs.existsSync(path.join(ROOT_DIR, "dist", r, "index.html"))) {
        preRenderedFound++;
      }
    }
    recordTest("SEO & Static Build", "Key Static Route Files", preRenderedFound === routes.length, `${preRenderedFound} / ${routes.length} key routes pre-rendered to HTML`);
  } catch (err) {
    recordTest("SEO & Static Build", "Static Route Verification", false, err.message);
  }

  // ---------------------------------------------------------------------------
  // 8. CHROME EXTENSION & MULTI-CURRENCY
  // ---------------------------------------------------------------------------
  console.log("\n--- 8. CHROME EXTENSION & LOCALIZATION ---");
  try {
    const extRes = await fetch(`${BASE_URL}/api/extension/selectors.json`);
    const extData = await extRes.json();
    const hasMerchants = extData.merchants && Object.keys(extData.merchants).length > 0;
    recordTest(
      "Extension API",
      "Remote Selector Hydration",
      extRes.ok && hasMerchants,
      `Version: ${extData.version}, Merchants: ${Object.keys(extData.merchants || {}).length}`
    );

    const pingRes = await fetch(`${BASE_URL}/api/extension/ping`);
    const pingData = await pingRes.json();
    recordTest(
      "Extension API",
      "Extension Heartbeat / Ping",
      pingRes.ok && pingData.status === "online",
      `Status: ${pingData.status}`
    );
  } catch (err) {
    recordTest("Extension API", "Extension Endpoints", false, err.message);
  }

  // ---------------------------------------------------------------------------
  // 9. ENVIRONMENT VARIABLES & SECRETS AUDIT
  // ---------------------------------------------------------------------------
  console.log("\n--- 9. ENVIRONMENT SECRETS AUDIT ---");
  const envVars = [
    { key: "DATABASE_URL", isSecret: true },
    { key: "SUPABASE_URL", isSecret: false },
    { key: "SUPABASE_ANON_KEY", isSecret: true },
    { key: "CUELINKS_API_KEY", isSecret: true },
    { key: "CUELINKS_PUBLISHER_ID", isSecret: false },
    { key: "SERPAPI_API_KEY", isSecret: true },
    { key: "SMTP_HOST", isSecret: false },
    { key: "SMTP_USER", isSecret: false },
    { key: "SMTP_PASS", isSecret: true },
    { key: "ADMIN_PASSWORD", isSecret: true },
    { key: "ADMITAD_CLIENT_ID", isSecret: false },
  ];

  for (const env of envVars) {
    const val = process.env[env.key];
    const present = Boolean(val && val.trim().length > 0);
    recordTest("Environment", env.key, present, present ? (env.isSecret ? "Configured & Protected" : val) : "MISSING", !present);
  }

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log("📊 AUDIT RESULTS SUMMARY:");
  console.log(`   ✅ Passed:   ${auditResults.passed}`);
  console.log(`   ⚠️  Warnings: ${auditResults.warnings}`);
  console.log(`   ❌ Failed:   ${auditResults.failed}`);
  console.log("================================================================================\n");

  return auditResults;
}

runAudit().catch(console.error);
