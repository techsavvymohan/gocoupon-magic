import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

console.log('\n=======================================================');
console.log('   🔍  SUITE 4: SEO, SSG PRE-RENDERING & ROUTE AUDIT   ');
console.log('=======================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failCount++;
  }
}

const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
const distDir = path.join(projectRoot, 'dist');

// 1. Static HTML Pre-rendered Files Check
console.log('[Test 4.1] Checking presence of pre-rendered static HTML routes in dist/ ...');
const expectedRoutes = [
  'index.html',
  'featured-deals.html',
  'amazon-coupons.html',
  'flipkart-coupons.html',
  'myntra-coupons.html',
  'sitemap.xml',
  'robots.txt',
  '404.html',
];

for (const file of expectedRoutes) {
  const filePath = path.join(distDir, file);
  assert(fs.existsSync(filePath), `Pre-rendered static route exists: ${file}`);
}

// 2. SEO Tags & Structured Data Inspection
console.log('\n[Test 4.2] Inspecting HTML metadata & Schema.org Structured Data...');
function auditHtmlFile(fileName) {
  const content = fs.readFileSync(path.join(distDir, fileName), 'utf-8');

  // Title
  const titleMatch = content.match(/<title>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : '';
  assert(Boolean(title && title.length > 10), `${fileName} has descriptive <title>: "${title.slice(0, 50)}..."`);

  // Meta Description
  const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
  const desc = descMatch ? descMatch[1] : '';
  assert(Boolean(desc && desc.length >= 30), `${fileName} has valid <meta name="description"> (${desc.length} chars)`);

  // Canonical Tag
  const canonicalMatch = content.match(/<link\s+rel=["']canonical["']\s+href=["'](.*?)["']/i);
  assert(Boolean(canonicalMatch), `${fileName} includes rel="canonical" link`);

  // H1 in Primary DOM (outside noscript)
  const withoutNoscript = content.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
  const h1Match = withoutNoscript.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  assert(Boolean(h1Match), `${fileName} has visible primary <h1> tag in main DOM (outside <noscript>)`);

  // Schema.org Structured Data (JSON-LD)
  const hasJsonLd = content.includes('application/ld+json');
  assert(hasJsonLd, `${fileName} includes Schema.org JSON-LD structured data`);
}

auditHtmlFile('index.html');
auditHtmlFile('featured-deals.html');
auditHtmlFile('amazon-coupons.html');

// 3. Live Endpoint Verification
console.log(`\n[Test 4.3] Live HTTP Route Response Verification on ${BASE_URL}...`);
const testUrls = [
  { path: '/', expectedStatus: 200 },
  { path: '/featured-deals', expectedStatus: 200 },
  { path: '/amazon-coupons', expectedStatus: 200 },
  { path: '/sitemap.xml', expectedStatus: 200 },
  { path: '/robots.txt', expectedStatus: 200 },
];

for (const { path: routePath, expectedStatus } of testUrls) {
  try {
    const res = await fetch(`${BASE_URL}${routePath}`);
    assert(
      res.status === expectedStatus,
      `GET ${routePath} returned HTTP ${res.status} (expected ${expectedStatus})`
    );
  } catch (err) {
    console.error(`Route fetch error on ${routePath}:`, err.message);
    failCount++;
  }
}

// 4. Sitemap.xml content inspection
console.log('\n[Test 4.4] Inspecting sitemap.xml structure...');
const sitemapContent = fs.readFileSync(path.join(distDir, 'sitemap.xml'), 'utf-8');
assert(sitemapContent.includes('<urlset') && sitemapContent.includes('</urlset>'), `sitemap.xml is valid XML`);
assert(sitemapContent.includes('gocoupon.io/featured-deals'), `sitemap.xml contains /featured-deals`);
assert(sitemapContent.includes('gocoupon.io/amazon-coupons'), `sitemap.xml contains store coupon pages`);

console.log(`\n=======================================================`);
console.log(`   SUITE 4 RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log(`=======================================================\n`);

if (failCount > 0) process.exit(1);
