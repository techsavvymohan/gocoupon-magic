import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

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

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://evporattcrijnkfgislh.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function run() {
  console.log('Querying Supabase at:', SUPABASE_URL);
  
  // 1. Check all admin deals or featured deals
  const res = await fetch(`${SUPABASE_URL}/rest/v1/gocoupon_deals?or=(source.eq.admin,is_featured.eq.true)&select=id,store_name,title,code,is_featured,source`, {
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
    },
  });
  
  const deals = await res.json();
  console.log(`Found ${deals.length} deals in Supabase with source='admin' OR is_featured=true:`);
  console.log(JSON.stringify(deals, null, 2));

  // 2. Specific search for Nobero, The Pant Project, Sadaa
  const brandRes = await fetch(`${SUPABASE_URL}/rest/v1/gocoupon_deals?or=(store_name.ilike.*nobero*,store_name.ilike.*pant*,store_name.ilike.*sadaa*)&select=id,store_name,title,code,is_featured,source`, {
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
    },
  });
  const brandDeals = await brandRes.json();
  console.log(`Specific brand search matches: ${brandDeals.length}`);
  console.log(JSON.stringify(brandDeals, null, 2));
}

run().catch(console.error);
