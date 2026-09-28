import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Load .env
const envPath = path.join(projectRoot, '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
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

const BASE_URL = 'http://127.0.0.1:3000';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'surya@gocoupon.io').trim();
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || 'smgroup@9865').trim().replace(/^["']|["']$/g, '');
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://evporattcrijnkfgislh.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function run() {
  console.log('=======================================================');
  console.log('   🚀 ADMIN PANEL -> SUPABASE VERIFICATION SCRIPT     ');
  console.log('=======================================================');

  // 1. Admin Login
  console.log(`\n[1] Logging into Admin API as ${ADMIN_EMAIL}...`);
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  if (!loginRes.ok) {
    const errText = await loginRes.text();
    throw new Error(`Login failed (${loginRes.status}): ${errText}`);
  }

  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('    ✅ Admin authentication successful! Token received.');

  // 2. Define the real user coupons
  const userCoupons = [
    {
      id: 'admin-deal-nobero-30',
      storeName: 'Nobero',
      storeSlug: 'nobero',
      storeLogo: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      category: 'Fashion',
      title: '30% off on all shoes & apparel',
      code: 'NOBERO30',
      discount: '30% OFF',
      badge: 'Verified Offer',
      verifiedDate: 'Today',
      expiresIn: '365 days',
      endDate: new Date(Date.now() + 365 * 86400000).toISOString(),
      terms: 'Valid on shoes, apparel and fashion collections.',
      link: 'https://nobero.com',
      url: 'https://nobero.com',
      affiliateLink: 'https://nobero.com',
      merchantUrl: 'https://nobero.com',
      usesCount: 420,
      rating: 4.8,
      source: 'admin',
      status: 'active',
      type: 'Coupon',
      isFeatured: true,
      featuredPriority: 1,
      campaignSource: 'manual',
      targetCountry: 'India Eligible',
      verificationStatus: 'verified',
    },
    {
      id: 'admin-deal-pant-project-15',
      storeName: 'The Pant Project',
      storeSlug: 'the-pant-project',
      storeLogo: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      category: 'Fashion',
      title: 'Flat 15% OFF On Custom Pants & Chinos',
      code: 'PANT15',
      discount: '15% OFF',
      badge: 'Exclusive',
      verifiedDate: 'Today',
      expiresIn: '365 days',
      endDate: new Date(Date.now() + 365 * 86400000).toISOString(),
      terms: 'Valid on custom-fit pants, cargo trousers, and chinos.',
      link: 'https://pantproject.com',
      url: 'https://pantproject.com',
      affiliateLink: 'https://pantproject.com',
      merchantUrl: 'https://pantproject.com',
      usesCount: 380,
      rating: 4.9,
      source: 'admin',
      status: 'active',
      type: 'Coupon',
      isFeatured: true,
      featuredPriority: 2,
      campaignSource: 'manual',
      targetCountry: 'India Eligible',
      verificationStatus: 'verified',
    },
    {
      id: 'admin-deal-sadaa-10',
      storeName: 'Sadaa',
      storeSlug: 'sadaa',
      storeLogo: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      category: 'Fashion',
      title: 'Extra 10% OFF Sitewide on Pure Cotton Essentials',
      code: 'SADAA10',
      discount: '10% OFF',
      badge: 'Best Saving',
      verifiedDate: 'Today',
      expiresIn: '365 days',
      endDate: new Date(Date.now() + 365 * 86400000).toISOString(),
      terms: 'Valid sitewide on pure cotton basics and apparel.',
      link: 'https://saadaa.in',
      url: 'https://saadaa.in',
      affiliateLink: 'https://saadaa.in',
      merchantUrl: 'https://saadaa.in',
      usesCount: 295,
      rating: 4.8,
      source: 'admin',
      status: 'active',
      type: 'Coupon',
      isFeatured: true,
      featuredPriority: 3,
      campaignSource: 'manual',
      targetCountry: 'India Eligible',
      verificationStatus: 'verified',
    },
  ];

  // 3. Post each deal through /api/offers with admin authorization
  console.log('\n[2] Posting admin coupons via /api/offers endpoint...');
  for (const deal of userCoupons) {
    const postRes = await fetch(`${BASE_URL}/api/offers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(deal),
    });

    if (!postRes.ok) {
      const err = await postRes.text();
      throw new Error(`Failed to post deal "${deal.title}" (${postRes.status}): ${err}`);
    }

    const resJson = await postRes.json();
    console.log(`    ✅ Successfully posted "${deal.storeName}" (${deal.code}) - ID: ${resJson.data?.id}`);
  }

  // 4. Verify Supabase Cloud Database Table gocoupon_deals
  console.log('\n[3] Verifying persistence directly in Supabase Cloud Database...');
  const supabaseQuery = await fetch(
    `${SUPABASE_URL}/rest/v1/gocoupon_deals?or=(store_name.ilike.*nobero*,store_name.ilike.*pant*,store_name.ilike.*sadaa*)&select=id,store_name,title,code,is_featured,source`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  );

  const supabaseRecords = await supabaseQuery.json();
  console.log(`    ✅ Records confirmed in Supabase PostgreSQL: ${supabaseRecords.length}`);
  console.log(JSON.stringify(supabaseRecords, null, 2));

  if (supabaseRecords.length < 3) {
    throw new Error('❌ Not all 3 deals were found in Supabase!');
  }

  // 5. Verify /api/offers?featured=true endpoint
  console.log('\n[4] Querying /api/offers?featured=true to verify website view...');
  const offersRes = await fetch(`${BASE_URL}/api/offers?featured=true`);
  const offersData = await offersRes.json();
  const deals = offersData.deals || offersData.data || [];
  console.log(`    Total featured deals returned by API: ${deals.length}`);

  for (const c of userCoupons) {
    const found = deals.find((d) => d.id === c.id || d.storeName === c.storeName);
    if (!found) {
      throw new Error(`❌ Deal for ${c.storeName} not returned by /api/offers?featured=true!`);
    }
    console.log(`    ✅ "${c.storeName}" is active in Featured Deals API (Code: ${found.code})`);
  }

  console.log('\n🎉 ALL TESTS PASSED: Admin panel deals are permanently stored in Supabase!');
}

run().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
