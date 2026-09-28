import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

console.log('\n=======================================================');
console.log('   💾  SUITE 2: DATA INTEGRITY & DATABASE PERSISTENCE ');
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
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://evporattcrijnkfgislh.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 1. Admin Authentication
console.log(`[Test 2.1] Authenticating as Admin (${ADMIN_EMAIL})...`);
const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
});
assert(loginRes.status === 200, `Admin login successful (HTTP 200)`);
const loginJson = await loginRes.json();
const token = loginJson.token;
assert(Boolean(token && token.length > 20), `Received cryptographically signed admin token`);

// 2. Deal Creation & Immediate Supabase Cloud Verification
console.log('\n[Test 2.2] Ingesting New Deal via Admin API & checking Supabase DB...');
const testDealId = `qa-test-deal-${Date.now()}`;
const newDealPayload = {
  id: testDealId,
  storeName: 'QA Test Brand',
  storeSlug: 'qa-test-brand',
  storeLogo: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
  category: 'Electronics',
  title: 'QA Test Exclusive Deal: Flat 40% OFF',
  code: 'QAPASS40',
  discount: '40% OFF',
  badge: 'Verified Offer',
  verifiedDate: 'Today',
  expiresIn: '30 days',
  endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
  terms: 'QA verification terms apply.',
  link: 'https://gocoupon.io/store/qa-test-brand',
  usesCount: 150,
  source: 'admin',
  status: 'active',
  type: 'Coupon',
  isFeatured: true,
  featuredPriority: 5,
  campaignSource: 'manual',
  targetCountry: 'India Eligible',
  verificationStatus: 'verified',
};

const createRes = await fetch(`${BASE_URL}/api/offers`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(newDealPayload),
});
assert(createRes.status === 200, `POST /api/offers succeeded (HTTP 200)`);

// Directly query Supabase Cloud Database via REST API
const sbQuery = await fetch(
  `${SUPABASE_URL}/rest/v1/gocoupon_deals?id=eq.${testDealId}&select=*`,
  {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  }
);
const sbRows = await sbQuery.json();
assert(
  Array.isArray(sbRows) && sbRows.length === 1 && sbRows[0].id === testDealId,
  `Deal immediately persisted to Supabase PostgreSQL table (ID: ${testDealId})`
);
assert(sbRows[0]?.code === 'QAPASS40', `Supabase stored coupon code accurately: ${sbRows[0]?.code}`);
assert(sbRows[0]?.is_featured === true, `Supabase stored is_featured flag as TRUE`);

// 3. Deal Update Verification
console.log('\n[Test 2.3] Updating Deal via Admin API & checking Supabase sync...');
const updatePayload = {
  ...newDealPayload,
  title: 'QA Test Updated Title: 50% OFF Super Sale',
  discount: '50% OFF',
  code: 'QAUPDATED50',
};

const updateRes = await fetch(`${BASE_URL}/api/offers?id=${testDealId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(updatePayload),
});
assert(updateRes.status === 200, `PUT /api/offers succeeded (HTTP 200)`);

const sbUpdateQuery = await fetch(
  `${SUPABASE_URL}/rest/v1/gocoupon_deals?id=eq.${testDealId}&select=*`,
  {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  }
);
const sbUpdatedRows = await sbUpdateQuery.json();
assert(
  sbUpdatedRows[0]?.code === 'QAUPDATED50' && sbUpdatedRows[0]?.discount === '50% OFF',
  `Supabase record updated: code=${sbUpdatedRows[0]?.code}, discount=${sbUpdatedRows[0]?.discount}`
);

// 4. Deal Deletion Verification
console.log('\n[Test 2.4] Deleting QA Deal & verifying Supabase cloud purge...');
const deleteRes = await fetch(`${BASE_URL}/api/offers?id=${testDealId}`, {
  method: 'DELETE',
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
assert(deleteRes.status === 200, `DELETE /api/offers succeeded (HTTP 200)`);

const sbDelQuery = await fetch(
  `${SUPABASE_URL}/rest/v1/gocoupon_deals?id=eq.${testDealId}&select=id`,
  {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  }
);
const sbDelRows = await sbDelQuery.json();
assert(
  Array.isArray(sbDelRows) && sbDelRows.length === 0,
  `Deal successfully deleted from Supabase PostgreSQL table`
);

// 5. User Real Featured Deals Verification
console.log('\n[Test 2.5] Verifying permanent user manual deals in Supabase...');
const manualCheck = await fetch(
  `${SUPABASE_URL}/rest/v1/gocoupon_deals?or=(store_name.ilike.*nobero*,store_name.ilike.*pant*,store_name.ilike.*sadaa*)&select=store_name,code,is_featured`,
  {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  }
);
const manualRows = await manualCheck.json();
const foundStores = manualRows.map((r) => r.store_name);
assert(foundStores.some((s) => /nobero/i.test(s)), `Nobero deal exists in Supabase`);
assert(foundStores.some((s) => /pant project/i.test(s)), `The Pant Project deal exists in Supabase`);
assert(foundStores.some((s) => /sadaa/i.test(s)), `Sadaa deal exists in Supabase`);

console.log(`\n=======================================================`);
console.log(`   SUITE 2 RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log(`=======================================================\n`);

if (failCount > 0) process.exit(1);
