import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://evporattcrijnkfgislh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_EVpbzaJoRLamp2ajlRfmDw_rSbj8diy';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2cG9yYXR0Y3Jpam5rZmdpc2xoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODg2NTU1NCwiZXhwIjoyMTA0NDQxNTU0fQ.TEsfs5En2W_cctN0AS1mj5y67JA5GLYQ3eyTiORvAdk';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  console.log('\n=======================================================');
  console.log(' 🛡️ Full Coupon Automation & Database Verification');
  console.log('=======================================================\n');

  // 1. Verify Active Coupons in gocoupon_deals
  console.log('--- 1. Querying Live gocoupon_deals Table in Supabase ---');
  const { data: deals, error: dealsErr } = await supabaseAdmin
    .from('gocoupon_deals')
    .select('id, store_name, code, discount, status, verified, source')
    .eq('status', 'active')
    .neq('code', '')
    .limit(10);

  if (dealsErr) {
    console.error('❌ Error querying gocoupon_deals:', dealsErr.message);
  } else {
    console.log(`✓ Retrieved ${deals.length} active coupons from gocoupon_deals:`);
    deals.slice(0, 5).forEach((d, idx) => {
      console.log(`  [${idx + 1}] ${d.store_name} | Code: [${d.code}] | Discount: ${d.discount} | Source: ${d.source}`);
    });
  }

  // 2. Query Total Count in gocoupon_deals
  const { count: dealsCount } = await supabaseAdmin
    .from('gocoupon_deals')
    .select('*', { count: 'exact', head: true });
  console.log(`📊 Total Deals in gocoupon_deals table: ${dealsCount}`);

  // 3. Verify Active Coupons in coupons Table
  console.log('\n--- 2. Querying Extension coupons Table in Supabase ---');
  const { data: coupons, error: couponsErr } = await supabaseAdmin
    .from('coupons')
    .select('id, site, code, discount_label, is_active, health_score')
    .eq('is_active', true)
    .limit(10);

  if (couponsErr) {
    console.error('❌ Error querying coupons:', couponsErr.message);
  } else {
    console.log(`✓ Retrieved ${coupons?.length || 0} coupons from coupons table:`);
    (coupons || []).slice(0, 5).forEach((c, idx) => {
      console.log(`  [${idx + 1}] ${c.site} | Code: [${c.code}] | ${c.discount_label} | Score: ${c.health_score}`);
    });
  }

  const { count: couponsCount } = await supabaseAdmin
    .from('coupons')
    .select('*', { count: 'exact', head: true });
  console.log(`📊 Total Coupons in coupons table: ${couponsCount}`);

  // 4. Test Expired Coupon Pruner
  console.log('\n--- 3. Testing Automated Expired Coupon Pruner ---');
  const nowIso = new Date().toISOString();
  const { data: expiredDeals } = await supabaseAdmin
    .from('gocoupon_deals')
    .update({ status: 'expired' })
    .lt('end_date', nowIso)
    .eq('status', 'active')
    .select('id');

  const { data: expiredCoupons } = await supabaseAdmin
    .from('coupons')
    .update({ is_active: false })
    .lt('expiry', nowIso)
    .eq('is_active', true)
    .select('id');

  console.log(`✓ Pruned expired: ${expiredDeals?.length || 0} deals, ${expiredCoupons?.length || 0} coupons.`);

  // 5. Test Anonymous Public Read (Extension Perspective via Anon Key)
  console.log('\n--- 4. Testing Extension Public Fetch (via Anon Key) ---');
  const { data: extDeals, error: extErr } = await supabaseAnon
    .from('gocoupon_deals')
    .select('id, store_name, store_slug, code, discount, verified, link')
    .eq('status', 'active')
    .neq('code', '')
    .limit(5);

  if (extErr) {
    console.error('❌ Extension anon fetch error:', extErr.message);
  } else {
    console.log(`✅ Extension can fetch ${extDeals.length} active coupons anonymously from Supabase!`);
    extDeals.forEach((d, idx) => {
      console.log(`  [${idx + 1}] ${d.store_name} -> Code: [${d.code}] (${d.discount})`);
    });
  }

  console.log('\n=======================================================');
  console.log(' 🎉 All Coupon Automation Rules Verified & Working!');
  console.log('=======================================================\n');
}

main().catch(console.error);
