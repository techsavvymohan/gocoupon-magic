/**
 * @file scripts/batch-autofetch-affiliates.cjs
 * @description Enterprise Batch Brand Logo Auto-Fetch & Cloudinary Ingest for Cuelinks & Admitad.
 */

const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'pgzfcjir',
  api_key: process.env.CLOUDINARY_API_KEY || '518138255589751',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'nWAFFF2TZ2EuTCvul75fE41VWHk',
  secure: true,
});

const DATA_FILE = path.resolve(__dirname, '../server/data/brand-assets.json');

function normalizeSlug(nameOrSlug) {
  return (nameOrSlug || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractDomain(link, slug) {
  if (!link) return `${slug}.com`;
  try {
    if (link.includes('url=')) {
      const u = new URL(link);
      const target = u.searchParams.get('url');
      if (target) {
        return new URL(decodeURIComponent(target)).hostname.replace(/^www\./, '').replace(/^m\./, '');
      }
    } else if (!link.includes('linksredirect') && !link.includes('cuelinks') && !link.includes('admitad')) {
      const u = new URL(link);
      return u.hostname.replace(/^www\./, '').replace(/^m\./, '');
    }
  } catch (e) {}

  const cleanSlug = slug.replace(/-(coupons|store|offers|deals|india|global)$/, '');
  return `${cleanSlug}.com`;
}

async function uploadToCloudinary(url, slug, affiliateSource) {
  const uploadOptions = {
    folder: 'gocoupon/brands',
    resource_type: 'image',
    tags: ['gocoupon', 'brand-logo', slug, affiliateSource],
    overwrite: true,
    public_id: `brand_${slug}`,
  };

  return await cloudinary.uploader.upload(url, uploadOptions);
}

async function main() {
  console.log('====================================================');
  console.log('🚀 GoCoupon Affiliate Brand Logo Auto-Fetch Suite');
  console.log('Target: Cuelinks & Admitad brands exclusively');
  console.log('====================================================');

  // 1. Load existing brand assets registry
  let existingAssets = new Map();
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const list = JSON.parse(raw);
      for (const item of list) {
        if (item?.slug) existingAssets.set(item.slug.toLowerCase().trim(), item);
      }
      console.log(`Loaded ${existingAssets.size} existing assets from brand-assets.json`);
    } catch (e) {
      console.warn('Failed to parse existing brand-assets.json:', e.message);
    }
  }

  // 2. Read live deals
  const dealsPath = path.resolve(__dirname, '../src/data/live-deals.json');
  const dealsRaw = fs.readFileSync(dealsPath, 'utf8');
  const deals = JSON.parse(dealsRaw).deals || [];
  console.log(`Auditing ${deals.length} total live deals...`);

  // 3. Filter for Cuelinks and Admitad brands only
  const targetBrands = new Map();

  for (const d of deals) {
    const store = d.storeName || 'Unknown';
    const rawSlug = (d.storeSlug || store).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const link = d.link || d.url || '';
    const src = (d.source || d.campaignSource || '').toLowerCase();

    const isCuelinks =
      src.includes('cuelinks') ||
      link.includes('cuelinks') ||
      link.includes('linksredirect');

    const isAdmitad =
      src.includes('admitad') ||
      link.includes('admitad') ||
      link.includes('lenmit') ||
      d.id?.startsWith('intl-deal') ||
      d.id?.startsWith('admitad');

    if (!isCuelinks && !isAdmitad) continue;

    const affSource = isCuelinks ? 'cuelinks' : 'admitad';
    const cleanName = store.replace(/\s+(Coupons|Offers|Deals|Store|Promo Codes|India)$/i, '').trim();
    const baseSlug = normalizeSlug(cleanName || rawSlug);
    if (!baseSlug) continue;

    const domain = extractDomain(link, baseSlug);

    if (!targetBrands.has(baseSlug)) {
      targetBrands.set(baseSlug, {
        name: cleanName || store,
        slug: baseSlug,
        domain,
        affiliateSource: affSource,
        dealCount: 0,
      });
    }
    targetBrands.get(baseSlug).dealCount++;
  }

  const brandsList = Array.from(targetBrands.values()).sort((a, b) => b.dealCount - a.dealCount);
  const cuelinksCount = brandsList.filter(b => b.affiliateSource === 'cuelinks').length;
  const admitadCount = brandsList.filter(b => b.affiliateSource === 'admitad').length;

  console.log(`Identified ${brandsList.length} unique affiliate brands:`);
  console.log(`  - Cuelinks brands: ${cuelinksCount}`);
  console.log(`  - Admitad brands: ${admitadCount}`);
  console.log('----------------------------------------------------');

  let succeeded = 0;
  let skipped = 0;
  let failed = 0;
  const failedList = [];

  // Concurrency limit = 4
  const CONCURRENCY = 4;
  for (let i = 0; i < brandsList.length; i += CONCURRENCY) {
    const chunk = brandsList.slice(i, i + CONCURRENCY);
    await Promise.all(
      chunk.map(async (brand) => {
        const existing = existingAssets.get(brand.slug);
        if (existing?.logoUrl && existing.logoUrl.includes('cloudinary.com')) {
          skipped++;
          return;
        }

        // Clean domain
        const cleanDomain = (brand.domain || `${brand.slug}.com`)
          .toLowerCase()
          .replace(/^https?:\/\//, '')
          .replace(/\/.*$/, '')
          .replace(/^www\./, '');

        const candidateUrls = [
          `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=256`,
          `https://unavatar.io/${cleanDomain}?fallback=false`,
          `https://icon.horse/icon/${cleanDomain}`,
        ];

        let uploadedResult = null;
        let lastError = null;

        for (const candidate of candidateUrls) {
          try {
            uploadedResult = await uploadToCloudinary(candidate, brand.slug, brand.affiliateSource);
            if (uploadedResult?.secure_url) break;
          } catch (err) {
            lastError = err;
          }
        }

        if (uploadedResult?.secure_url) {
          succeeded++;
          const asset = {
            slug: brand.slug,
            name: brand.name,
            domain: cleanDomain,
            logoUrl: uploadedResult.secure_url,
            source: 'cloudinary',
            affiliateSource: brand.affiliateSource,
            width: uploadedResult.width,
            height: uploadedResult.height,
            format: uploadedResult.format,
            updatedAt: new Date().toISOString(),
          };
          existingAssets.set(brand.slug, asset);
          // Also set alias with -coupons if different
          if (brand.slug !== `${brand.slug}-coupons`) {
            existingAssets.set(`${brand.slug}-coupons`, { ...asset, slug: `${brand.slug}-coupons` });
          }
          console.log(`✅ [${succeeded + skipped}/${brandsList.length}] ${brand.name} (${brand.affiliateSource}): ${uploadedResult.secure_url}`);
        } else {
          failed++;
          failedList.push({ name: brand.name, domain: cleanDomain, error: lastError?.message });
          console.warn(`❌ [FAIL] ${brand.name} (${cleanDomain}): ${lastError?.message || 'Upload failed'}`);
        }
      })
    );

    // Persist to disk every 20 uploads
    if ((i + CONCURRENCY) % 20 < CONCURRENCY || i + CONCURRENCY >= brandsList.length) {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(Array.from(existingAssets.values()), null, 2), 'utf8');
    }
  }

  // Final persist
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(Array.from(existingAssets.values()), null, 2), 'utf8');

  console.log('====================================================');
  console.log('🏁 Batch Processing Completed!');
  console.log(`Total Target Brands: ${brandsList.length}`);
  console.log(`Uploaded to Cloudinary: ${succeeded}`);
  console.log(`Already existed (Skipped): ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total in Registry now: ${existingAssets.size}`);
  console.log(`Saved registry to: ${DATA_FILE}`);
  console.log('====================================================');
}

main().catch((e) => {
  console.error('Fatal execution error:', e);
  process.exit(1);
});
