import fs from "node:fs";
import path from "node:path";

const distDir = path.resolve("dist");

console.log("=================================================");
console.log("🏥 GOCOUPON.IO AUTOMATED FULL WEBSITE HEALTH AUDIT");
console.log("=================================================\n");

let totalTests = 0;
let passedTests = 0;
let warningTests = 0;
let failedTests = 0;

function pass(name, detail = "") {
  totalTests++;
  passedTests++;
  console.log(`  ✅ [PASS] ${name}${detail ? ` (${detail})` : ""}`);
}

function warn(name, detail = "") {
  totalTests++;
  warningTests++;
  console.log(`  ⚠️  [WARN] ${name}${detail ? ` (${detail})` : ""}`);
}

function fail(name, detail = "") {
  totalTests++;
  failedTests++;
  console.error(`  ❌ [FAIL] ${name}${detail ? ` (${detail})` : ""}`);
}

// ----------------------------------------------------------------------------
// TEST SUITE 1: Build Output & File Existence
// ----------------------------------------------------------------------------
console.log("📦 1. BUILD ARTIFACTS & DIRECTORY STRUCTURE");
if (!fs.existsSync(distDir)) {
  fail("dist directory exists", "dist folder not found! Run npm run build first.");
  process.exit(1);
} else {
  pass("dist directory exists");
}

const indexHtmlPath = path.join(distDir, "index.html");
if (fs.existsSync(indexHtmlPath) && fs.statSync(indexHtmlPath).size > 1000) {
  pass("dist/index.html generated", `${(fs.statSync(indexHtmlPath).size / 1024).toFixed(1)} KB`);
} else {
  fail("dist/index.html generated", "Missing or empty index.html");
}

const sitemapPath = path.join(distDir, "sitemap.xml");
let sitemapUrls = [];
if (fs.existsSync(sitemapPath)) {
  const sitemapXml = fs.readFileSync(sitemapPath, "utf8");
  const locMatches = sitemapXml.match(/<loc>(.*?)<\/loc>/g) || [];
  sitemapUrls = locMatches.map((m) => m.replace(/<\/?loc>/g, ""));
  pass("dist/sitemap.xml valid", `${sitemapUrls.length} indexed URLs found`);
} else {
  fail("dist/sitemap.xml exists");
}

const robotsPath = path.join(distDir, "robots.txt");
if (fs.existsSync(robotsPath)) {
  const robotsTxt = fs.readFileSync(robotsPath, "utf8");
  if (robotsTxt.includes("sitemap.xml")) {
    pass("dist/robots.txt contains sitemap link");
  } else {
    warn("dist/robots.txt missing sitemap link");
  }
} else {
  warn("dist/robots.txt missing");
}

const notFoundPath = path.join(distDir, "404.html");
if (fs.existsSync(notFoundPath)) {
  const nf = fs.readFileSync(notFoundPath, "utf8");
  const hasNoindex = nf.includes('name="robots" content="noindex');
  const hasCleanTitle = nf.includes("<title>Page Not Found | GoCoupon</title>");
  if (hasNoindex && hasCleanTitle) {
    pass("dist/404.html properly configured with noindex and custom title");
  } else {
    warn("dist/404.html missing expected metadata");
  }
} else {
  fail("dist/404.html generated");
}

// ----------------------------------------------------------------------------
// TEST SUITE 2: Static Route Completeness
// ----------------------------------------------------------------------------
console.log("\n🌐 2. PRE-RENDERED STATIC ROUTES INTEGRITY");
const htmlFiles = fs.readdirSync(distDir).filter((f) => f.endsWith(".html"));
pass("Pre-rendered static HTML files generated in root", `${htmlFiles.length} root HTML files`);

let missingSitemapRoutes = [];
for (const url of sitemapUrls) {
  const relative = url.replace("https://gocoupon.io", "").replace(/^\//, "");
  let exists = false;
  if (relative === "") {
    exists = fs.existsSync(path.join(distDir, "index.html"));
  } else {
    const flatFile = path.join(distDir, `${relative}.html`);
    const dirFile = path.join(distDir, relative, "index.html");
    exists = fs.existsSync(flatFile) || fs.existsSync(dirFile);
  }
  if (!exists) {
    missingSitemapRoutes.push(relative || "/");
  }
}

if (missingSitemapRoutes.length === 0) {
  pass("All sitemap.xml URLs exist as static files in dist", `${sitemapUrls.length}/${sitemapUrls.length} verified`);
} else {
  fail("Missing static files for sitemap URLs", `${missingSitemapRoutes.join(", ")}`);
}

// ----------------------------------------------------------------------------
// TEST SUITE 3: Internal Link Crawler (Zero Broken 404 Links)
// ----------------------------------------------------------------------------
console.log("\n🔗 3. CRAWLER SIMULATION & INTERNAL LINK VALIDATION");
let brokenLinks = [];
let internalLinkCount = 0;
const knownValidPaths = new Set(
  sitemapUrls.map((u) => u.replace("https://gocoupon.io", "").replace(/^\//, "")).concat(["404", ""])
);

for (const f of htmlFiles) {
  const content = fs.readFileSync(path.join(distDir, f), "utf8");
  const hrefMatches = content.match(/href="(\/[^"#?]*)"/g) || [];
  for (const m of hrefMatches) {
    const target = m.replace('href="/', "").replace('"', "");
    internalLinkCount++;
    // Ignore static asset links like /assets/, /favicon.ico, /manifest.webmanifest
    if (target.startsWith("assets/") || target.includes(".") || target.startsWith("api/")) {
      continue;
    }
    const cleanTarget = target.replace(/\/$/, "");
    if (!knownValidPaths.has(cleanTarget)) {
      brokenLinks.push({ source: f, target: cleanTarget });
    }
  }
}

if (brokenLinks.length === 0) {
  pass("All internal links resolve to valid static routes", `${internalLinkCount} links checked, 0 broken`);
} else {
  fail(
    "Broken internal links detected",
    brokenLinks.slice(0, 5).map((b) => `${b.source} -> /${b.target}`).join("; ")
  );
}

// ----------------------------------------------------------------------------
// TEST SUITE 4: Structured Data (Schema.org) JSON Validity
// ----------------------------------------------------------------------------
console.log("\n📐 4. STRUCTURED DATA (JSON-LD) VALIDATION");
let schemaBlocksCount = 0;
let schemaParseErrors = [];
const schemaTypesFound = new Set();

for (const f of htmlFiles) {
  const content = fs.readFileSync(path.join(distDir, f), "utf8");
  const scriptRegex = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(content)) !== null) {
    schemaBlocksCount++;
    const jsonStr = match[1].trim();
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed["@type"]) {
        schemaTypesFound.add(parsed["@type"]);
      }
      if (Array.isArray(parsed)) {
        parsed.forEach((p) => p["@type"] && schemaTypesFound.add(p["@type"]));
      }
    } catch (err) {
      schemaParseErrors.push({ file: f, error: err.message });
    }
  }
}

if (schemaParseErrors.length === 0) {
  pass(
    "All JSON-LD structured data blocks parse cleanly",
    `${schemaBlocksCount} schemas tested across all templates`
  );
  pass(
    "Rich Schema types verified in markup",
    Array.from(schemaTypesFound).join(", ")
  );
} else {
  fail("JSON-LD parse errors detected", `${schemaParseErrors.length} malformed blocks`);
}

// ----------------------------------------------------------------------------
// TEST SUITE 5: SERP Snippet & Meta Tags Health
// ----------------------------------------------------------------------------
console.log("\n🏷️  5. META TAGS & SERP SNIPPET BOUNDARIES");
let titlesOver58 = 0;
let descOver158 = 0;
let missingCanonical = 0;
let missingOgTitle = 0;

for (const f of htmlFiles) {
  const content = fs.readFileSync(path.join(distDir, f), "utf8");
  
  const titleM = content.match(/<title>(.*?)<\/title>/i);
  if (!titleM) {
    fail(`Missing <title> in ${f}`);
  } else if (titleM[1].length > 58) {
    titlesOver58++;
  }

  const descM = content.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  if (!descM) {
    fail(`Missing meta description in ${f}`);
  } else if (descM[1].length > 158) {
    descOver158++;
  }

  if (!content.includes('rel="canonical"')) {
    missingCanonical++;
  }
  if (!content.includes('property="og:title"')) {
    missingOgTitle++;
  }
}

if (titlesOver58 === 0) {
  pass("Title tag length compliance (<= 58 chars)", `${htmlFiles.length} pages passed`);
} else {
  fail("Title tags exceeding 58 chars", `${titlesOver58} pages failed`);
}

if (descOver158 === 0) {
  pass("Meta description length compliance (<= 158 chars)", `${htmlFiles.length} pages passed`);
} else {
  fail("Meta descriptions exceeding 158 chars", `${descOver158} pages failed`);
}

if (missingCanonical === 0) {
  pass("Canonical link tags present on 100% of pages");
} else {
  warn("Pages missing canonical tag", `${missingCanonical} pages`);
}

if (missingOgTitle === 0) {
  pass("OpenGraph social tags present on 100% of pages");
} else {
  warn("Pages missing OpenGraph tags", `${missingOgTitle} pages`);
}

// ----------------------------------------------------------------------------
// TEST SUITE 6: Security Headers & Configuration
// ----------------------------------------------------------------------------
console.log("\n🛡️  6. SECURITY & DEPLOYMENT CONFIGURATION");
const vercelPath = path.resolve("vercel.json");
if (fs.existsSync(vercelPath)) {
  const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, "utf8"));
  const headers = vercelConfig.headers || [];
  let hasNosniff = false;
  let hasFrameDeny = false;
  for (const h of headers) {
    for (const item of h.headers || []) {
      if (item.key.toLowerCase() === "x-content-type-options") hasNosniff = true;
      if (item.key.toLowerCase() === "x-frame-options") hasFrameDeny = true;
    }
  }
  if (hasNosniff && hasFrameDeny) {
    pass("vercel.json includes strict security headers (nosniff, frame-options)");
  } else {
    warn("vercel.json headers could be hardened");
  }
} else {
  warn("vercel.json not found in root");
}

// ----------------------------------------------------------------------------
// SUMMARY
// ----------------------------------------------------------------------------
console.log("\n=================================================");
console.log("📊 HEALTH AUDIT SUMMARY SCORE");
console.log("=================================================");
console.log(`Total Checks Executed : ${totalTests}`);
console.log(`Passed Checks         : ${passedTests} (✓)`);
console.log(`Warnings              : ${warningTests} (⚠️)`);
console.log(`Failed Checks         : ${failedTests} (❌)`);

const healthScore = Math.round((passedTests / totalTests) * 100);
console.log(`\nOverall Website Health Score: ${healthScore}%`);
if (failedTests === 0) {
  console.log("Result: 🟢 EXCELLENT — ALL HEALTH CHECKS PASSED!");
} else {
  console.log("Result: 🔴 ISSUES DETECTED — REVIEW FAILURES ABOVE.");
  process.exit(1);
}
