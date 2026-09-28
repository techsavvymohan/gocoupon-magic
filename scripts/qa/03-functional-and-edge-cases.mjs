import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

console.log('\n=======================================================');
console.log('   🧪  SUITE 3: FUNCTIONAL, SEARCH & EDGE CASES QA    ');
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

// Load .env
const envPath = path.join(projectRoot, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'surya@gocoupon.io').trim();
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || 'smgroup@9865').trim().replace(/^["']|["']$/g, '');

// Authenticate for admin write tests
const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
});
const { token } = await loginRes.json();

// 1. Special Characters, Currency Symbols & Emojis Test
console.log('[Test 3.1] Testing Special Characters & Unicode handling...');
const unicodeDealId = `qa-unicode-deal-${Date.now()}`;
const unicodeDeal = {
  id: unicodeDealId,
  storeName: "Ben & Jerry's \"Mega\" Store",
  storeSlug: 'ben-jerrys-mega-store',
  title: 'Flat ₹500 OFF: 50% + Extra 10% on "Summer & Winter" Sale! 🚀🔥',
  code: 'SUMMER&WINTER%',
  discount: '₹500 + 50% OFF',
  category: 'Food & Grocery',
  terms: "Valid on all orders > ₹999. Terms & Conditions apply, no 'hidden' costs!",
  link: 'https://gocoupon.io',
  source: 'admin',
  status: 'active',
  type: 'Coupon',
};

const unicodeRes = await fetch(`${BASE_URL}/api/offers`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(unicodeDeal),
});
assert(
  unicodeRes.status === 200,
  `Special characters (₹, &, ", ', %, emojis 🚀🔥) accepted without JSON/server errors`
);

// Clean up unicode deal
await fetch(`${BASE_URL}/api/offers?id=${unicodeDealId}`, {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${token}` },
});

// 2. Search Accuracy Tests
console.log('\n[Test 3.2] Testing Search API functionality...');

// Partial match search
const partialRes = await fetch(`${BASE_URL}/api/offers?q=nobe`);
const partialData = await partialRes.json();
const partialDeals = partialData.data || partialData.deals || [];
assert(
  partialDeals.some((d) => /nobero/i.test(d.storeName)),
  `Partial search ('nobe') successfully returned Nobero deal (${partialDeals.length} results)`
);

// Code search
const codeRes = await fetch(`${BASE_URL}/api/offers?q=NOBERO30`);
const codeData = await codeRes.json();
const codeDeals = codeData.data || codeData.deals || [];
assert(
  codeDeals.some((d) => d.code === 'NOBERO30'),
  `Coupon code search ('NOBERO30') successfully returned matching deal`
);

// Non-existent search
const emptyRes = await fetch(`${BASE_URL}/api/offers?q=nonexistentbrandrandomxyz999`);
assert(emptyRes.status === 200, `Non-existent search returns HTTP 200 (not 500 error)`);
const emptyData = await emptyRes.json();
const emptyDeals = emptyData.data || emptyData.deals || [];
assert(emptyDeals.length === 0, `Non-existent search returns clean empty list []`);

// 3. Category Filter Test
console.log('\n[Test 3.3] Testing Category Filtering...');
const fashionRes = await fetch(`${BASE_URL}/api/offers?category=Fashion`);
const fashionData = await fashionRes.json();
const fashionDeals = fashionData.data || fashionData.deals || [];
assert(fashionDeals.length > 0, `Category filter 'Fashion' returned deals (count: ${fashionDeals.length})`);
assert(
  fashionDeals.every((d) => d.category.toLowerCase() === 'fashion'),
  `100% of returned deals strictly match requested category 'Fashion'`
);

// 4. Featured Deals Endpoint Verification
console.log('\n[Test 3.4] Testing /api/offers?featured=true accuracy...');
const featRes = await fetch(`${BASE_URL}/api/offers?featured=true`);
const featData = await featRes.json();
const featDeals = featData.data || featData.deals || [];
assert(featDeals.length > 0, `Featured deals API returned active items (count: ${featDeals.length})`);
const allFeaturedValid = featDeals.every(
  (d) => d.isFeatured === true || String(d.id).startsWith('ac-') || d.source === 'admin'
);
assert(allFeaturedValid, `All returned items are verified featured or admin curated`);

console.log(`\n=======================================================`);
console.log(`   SUITE 3 RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log(`=======================================================\n`);

if (failCount > 0) process.exit(1);
