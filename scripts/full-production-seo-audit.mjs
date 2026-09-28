import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');

console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║       🔍 GOCOUPON.IO COMPREHENSIVE ORGANIC SEO HEALTH AUDIT       ║');
console.log('╚════════════════════════════════════════════════════════════════════╝\n');

if (!fs.existsSync(distDir)) {
  console.error('❌ Error: dist/ directory not found. Please build the project first.');
  process.exit(1);
}

const audit = {
  scannedFiles: 0,
  passed: 0,
  warnings: [],
  errors: [],
};

function logPass(msg) {
  audit.passed++;
  console.log(`  ✅ [PASS] ${msg}`);
}

function logWarning(file, msg) {
  audit.warnings.push({ file, msg });
  console.log(`  ⚠️  [WARN] ${file ? `(${file}) ` : ''}${msg}`);
}

function logError(file, msg) {
  audit.errors.push({ file, msg });
  console.log(`  ❌ [FAIL] ${file ? `(${file}) ` : ''}${msg}`);
}

// -----------------------------------------------------------------------------
// 1. Robots.txt Audit
// -----------------------------------------------------------------------------
console.log('--- 1. ROBOTS.TXT CRAWLABILITY & DIRECTIVES ---');
const robotsPath = path.join(distDir, 'robots.txt');
if (fs.existsSync(robotsPath)) {
  const robots = fs.readFileSync(robotsPath, 'utf-8');
  if (robots.includes('User-agent: *')) {
    logPass('robots.txt contains wild-card User-agent: *');
  } else {
    logError('robots.txt', 'Missing User-agent: * directive');
  }

  if (robots.includes('Sitemap:') && robots.includes('https://gocoupon.io/sitemap.xml')) {
    logPass('robots.txt declares canonical XML sitemap location: https://gocoupon.io/sitemap.xml');
  } else {
    logError('robots.txt', 'Missing or non-canonical Sitemap declaration');
  }

  if (robots.includes('Disallow: /admin') || robots.includes('Disallow: /api/')) {
    logPass('robots.txt correctly blocks crawler budget waste on /admin and /api/');
  } else {
    logWarning('robots.txt', 'Consider adding Disallow: /admin and Disallow: /api/ to preserve crawl budget');
  }

  if (robots.includes('Disallow: /') && !robots.includes('Allow: /')) {
    logError('robots.txt', 'CRITICAL: Site appears blocked from indexing with Disallow: /');
  } else {
    logPass('Search engines are permitted to index public routes');
  }
} else {
  logError('robots.txt', 'dist/robots.txt file is missing!');
}

// -----------------------------------------------------------------------------
// 2. Sitemap.xml Audit
// -----------------------------------------------------------------------------
console.log('\n--- 2. XML SITEMAP INTEGRITY & INDEXABILITY ---');
const sitemapPath = path.join(distDir, 'sitemap.xml');
let sitemapUrls = [];
if (fs.existsSync(sitemapPath)) {
  const sitemapXml = fs.readFileSync(sitemapPath, 'utf-8');
  const locMatches = sitemapXml.match(/<loc>(.*?)<\/loc>/g) || [];
  sitemapUrls = locMatches.map((m) => m.replace(/<\/?loc>/g, '').trim());

  logPass(`sitemap.xml found with ${sitemapUrls.length} indexed URLs`);

  let invalidProtocols = sitemapUrls.filter((u) => !u.startsWith('https://gocoupon.io'));
  if (invalidProtocols.length === 0) {
    logPass('All sitemap URLs strictly use canonical HTTPS protocol (https://gocoupon.io/...)');
  } else {
    logError('sitemap.xml', `Found ${invalidProtocols.length} URLs with non-canonical or HTTP protocols`);
  }

  // Check key hub pages in sitemap
  const keyHubs = [
    'https://gocoupon.io/',
    'https://gocoupon.io/featured-deals',
    'https://gocoupon.io/offers',
    'https://gocoupon.io/stores',
    'https://gocoupon.io/categories',
    'https://gocoupon.io/amazon-coupons',
    'https://gocoupon.io/flipkart-coupons',
  ];

  for (const hub of keyHubs) {
    if (sitemapUrls.includes(hub)) {
      logPass(`Sitemap includes primary hub: ${hub}`);
    } else {
      logWarning('sitemap.xml', `Primary hub missing from sitemap: ${hub}`);
    }
  }
} else {
  logError('sitemap.xml', 'dist/sitemap.xml is missing!');
}

// -----------------------------------------------------------------------------
// 3. Scan All Static HTML Pages for Deep On-Page SEO
// -----------------------------------------------------------------------------
console.log('\n--- 3. DEEP ON-PAGE SEO SCAN (ALL STATIC ROUTES) ---');

function getAllHtmlFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllHtmlFiles(full, fileList);
    } else if (entry.name.endsWith('.html')) {
      fileList.push(full);
    }
  }
  return fileList;
}

const htmlFiles = getAllHtmlFiles(distDir);
console.log(`Scanning ${htmlFiles.length} HTML files in dist/ ...\n`);

const seenTitles = new Map();
const seenCanonicals = new Map();

for (const filePath of htmlFiles) {
  const relPath = path.relative(distDir, filePath).replace(/\\/g, '/');
  audit.scannedFiles++;
  const html = fs.readFileSync(filePath, 'utf-8');

  // Strip noscript for strict primary DOM checking
  const primaryHtml = html.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');

  // 1. Meta Viewport
  if (!html.includes('name="viewport"') && !html.includes("name='viewport'")) {
    logError(relPath, 'Missing meta viewport tag for mobile responsiveness');
  }

  // 2. Canonical Link Check (extracted first so title deduplication knows canonical route)
  const canonMatch = html.match(/<link\s+rel=["']canonical["']\s+href=(["'])([\s\S]*?)\1/i);
  const canon = canonMatch ? canonMatch[2].trim() : '';
  if (!canon) {
    logError(relPath, 'Missing <link rel="canonical"> tag');
  } else if (!canon.startsWith('https://gocoupon.io')) {
    logError(relPath, `Non-canonical URL protocol in canonical tag: ${canon}`);
  }

  // 3. Title Tag Check
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';
  if (!title) {
    logError(relPath, 'Missing <title> tag');
  } else {
    if (relPath !== '404.html') {
      if (seenTitles.has(title)) {
        const prevCanon = seenCanonicals.get(title) || '';
        // Only warn if two DIFFERENT canonical routes share the exact same title
        if (canon && prevCanon && canon !== prevCanon) {
          logWarning(relPath, `Duplicate <title> across different canonical routes (${prevCanon} vs ${canon}): "${title.slice(0, 50)}..."`);
        }
      } else {
        seenTitles.set(title, relPath);
        seenCanonicals.set(title, canon);
      }
    }

    if (title.length < 30) {
      logWarning(relPath, `Title too short (${title.length} chars): "${title}"`);
    } else if (title.length > 70) {
      logWarning(relPath, `Title may truncate on Google SERP (${title.length} chars > 65): "${title}"`);
    }
  }

  // 4. Meta Description Check (strictly matching opening quote delimiter)
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=(["'])([\s\S]*?)\1/i);
  const desc = descMatch ? descMatch[2].trim() : '';
  if (!desc && relPath !== '404.html') {
    logError(relPath, 'Missing <meta name="description"> tag');
  } else if (desc && relPath !== '404.html') {
    if (desc.length < 90) {
      logWarning(relPath, `Meta description too short (${desc.length} chars < 90): "${desc}"`);
    } else if (desc.length > 170) {
      logWarning(relPath, `Meta description exceeds optimal length (${desc.length} chars > 165): "${desc.slice(0, 80)}..."`);
    }
  }

  // 5. Primary H1 Tag Check
  const h1Matches = primaryHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  if (h1Matches.length === 0) {
    logError(relPath, 'Zero <h1> tags found in primary DOM (outside noscript)!');
  } else if (h1Matches.length > 1) {
    logWarning(relPath, `Multiple (${h1Matches.length}) <h1> tags found in primary DOM. Best practice is exactly 1.`);
  } else {
    const h1Text = h1Matches[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!h1Text || h1Text.length < 5) {
      logError(relPath, `Empty or trivial <h1> tag: "${h1Text}"`);
    }
  }

  // 6. Schema.org JSON-LD Structured Data
  const jsonLdMatches = html.match(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi) || [];
  if (jsonLdMatches.length === 0 && relPath !== '404.html') {
    logWarning(relPath, 'Missing Schema.org JSON-LD structured data');
  } else {
    for (const s of jsonLdMatches) {
      const jsonRaw = s.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '').trim();
      try {
        const parsed = JSON.parse(jsonRaw);
        if (!parsed['@context']) {
          logWarning(relPath, 'Schema.org JSON-LD missing @context');
        }
      } catch (jsonErr) {
        logError(relPath, `Malformed JSON-LD structured data: ${jsonErr.message}`);
      }
    }
  }

  // 7. OpenGraph Tags Check
  const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=(["'])([\s\S]*?)\1/i);
  const ogTitle = ogTitleMatch ? ogTitleMatch[2].trim() : '';
  const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=(["'])([\s\S]*?)\1/i);
  const ogDesc = ogDescMatch ? ogDescMatch[2].trim() : '';
  const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=(["'])([\s\S]*?)\1/i);
  const ogImage = ogImageMatch ? ogImageMatch[2].trim() : '';

  if (!ogTitle && relPath !== '404.html') {
    logWarning(relPath, 'Missing og:title tag');
  }
  if (!ogImage && relPath !== '404.html') {
    logWarning(relPath, 'Missing og:image tag for social card previews');
  }

  // 8. Image Alt Attribute Check
  const imgMatches = html.match(/<img[^>]*>/gi) || [];
  for (const imgTag of imgMatches) {
    if (!imgTag.includes('alt=') || /alt=["']\s*["']/i.test(imgTag)) {
      if (!imgTag.includes('aria-hidden="true"')) {
        logWarning(relPath, `Image tag missing alt text or empty alt: ${imgTag.slice(0, 60)}...`);
      }
    }
  }

  // 9. Localhost or Dev Links Leak Check
  const devLinks = html.match(/http:\/\/(localhost|127\.0\.0\.1)[:0-9]*/gi) || [];
  if (devLinks.length > 0) {
    logError(relPath, `Found dev/localhost URLs in production HTML: ${devLinks.join(', ')}`);
  }

  // 10. Thin Content / Word Count Check
  const textContent = primaryHtml
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const wordCount = textContent.split(' ').filter(Boolean).length;
  if (wordCount < 200 && relPath !== '404.html') {
    logWarning(relPath, `Low visible word count in pre-rendered markup (${wordCount} words). Recommended >= 350 for strong ranking.`);
  }
}

// -----------------------------------------------------------------------------
// Final Audit Summary
// -----------------------------------------------------------------------------
console.log('\n╔════════════════════════════════════════════════════════════════════╗');
console.log('║                   🏆 SEO AUDIT COMPLETE SUMMARY                   ║');
console.log('╚════════════════════════════════════════════════════════════════════╝');
console.log(`Total HTML Files Scanned: ${audit.scannedFiles}`);
console.log(`Passed Checks:            ${audit.passed}`);
console.log(`Warnings / Optimizations: ${audit.warnings.length}`);
console.log(`Critical SEO Errors:      ${audit.errors.length}\n`);

if (audit.errors.length > 0) {
  console.log('🚨 TOP CRITICAL ISSUES TO RESOLVE:');
  for (const err of audit.errors.slice(0, 10)) {
    console.log(` - [${err.file}]: ${err.msg}`);
  }
  console.log('');
}

if (audit.warnings.length > 0) {
  console.log('💡 KEY OPPORTUNITIES FOR HIGHER ORGANIC RANKINGS:');
  for (const warn of audit.warnings.slice(0, 10)) {
    console.log(` - [${warn.file}]: ${warn.msg}`);
  }
  console.log('');
}

if (audit.errors.length === 0) {
  console.log('🎉 EXCELLENT: Zero critical SEO blockers found! Website meets enterprise search standards.');
}
