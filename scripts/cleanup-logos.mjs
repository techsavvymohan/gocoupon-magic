import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

// 1. Clean src/data/storesData.ts
const storesDataPath = path.join(root, 'src/data/storesData.ts');
if (fs.existsSync(storesDataPath)) {
  let content = fs.readFileSync(storesDataPath, 'utf-8');
  content = content.replace(/fallbackIcon:\s*string;/, 'fallbackIcon?: string;');
  const lines = content.split('\n');
  const filtered = lines.filter((line) => {
    return !/^\s*(logo|fallbackIcon):\s*["'][^"']*["'],?\s*$/.test(line);
  });
  fs.writeFileSync(storesDataPath, filtered.join('\n'), 'utf-8');
  console.log('✅ Cleaned src/data/storesData.ts (removed hardcoded logos & icons)');
}

// 2. Clean src/data/canonicalCatalogData.ts
const canonicalPath = path.join(root, 'src/data/canonicalCatalogData.ts');
if (fs.existsSync(canonicalPath)) {
  let content = fs.readFileSync(canonicalPath, 'utf-8');
  const lines = content.split('\n');
  const filtered = lines.filter((line) => {
    return !/^\s*(logoUrl|logo|fallbackIcon):\s*["'][^"']*["'],?\s*$/.test(line);
  });
  fs.writeFileSync(canonicalPath, filtered.join('\n'), 'utf-8');
  console.log('✅ Cleaned src/data/canonicalCatalogData.ts');
}

// 3. Clean src/data/featured-deals-campaign.ts
const featuredCampaignPath = path.join(root, 'src/data/featured-deals-campaign.ts');
if (fs.existsSync(featuredCampaignPath)) {
  let content = fs.readFileSync(featuredCampaignPath, 'utf-8');
  const lines = content.split('\n');
  const filtered = lines.filter((line) => {
    return !/^\s*logoUrl:\s*["'][^"']*["'],?\s*$/.test(line);
  });
  fs.writeFileSync(featuredCampaignPath, filtered.join('\n'), 'utf-8');
  console.log('✅ Cleaned src/data/featured-deals-campaign.ts');
}

// 4. Clean scripts/seed-featured.mjs
const seedFeaturedPath = path.join(root, 'scripts/seed-featured.mjs');
if (fs.existsSync(seedFeaturedPath)) {
  let content = fs.readFileSync(seedFeaturedPath, 'utf-8');
  const lines = content.split('\n');
  const filtered = lines.filter((line) => {
    return !/^\s*logoUrl:\s*["'][^"']*["'],?\s*$/.test(line);
  });
  content = filtered.join('\n');
  content = content.replace(/logoUrl:\s*item\.logoUrl\s*\|\|\s*null/g, 'logoUrl: null');
  content = content.replace(/storeLogo:\s*item\.logoUrl\s*\|\|\s*null/g, 'storeLogo: null');
  content = content.replace(/logo:\s*item\.logoUrl\s*\|\|\s*null/g, 'logo: null');
  fs.writeFileSync(seedFeaturedPath, content, 'utf-8');
  console.log('✅ Cleaned scripts/seed-featured.mjs');
}

// 5. Clean src/data/live-deals.json
const liveDealsPath = path.join(root, 'src/data/live-deals.json');
if (fs.existsSync(liveDealsPath)) {
  const data = JSON.parse(fs.readFileSync(liveDealsPath, 'utf-8'));
  if (Array.isArray(data.deals)) {
    data.deals.forEach((deal) => {
      deal.logoUrl = null;
      deal.storeLogo = null;
      deal.logo = null;
    });
    fs.writeFileSync(liveDealsPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ Cleaned ${data.deals.length} deals in src/data/live-deals.json`);
  }
}
