import https from 'node:https';

function checkUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        const titleMatch = body.match(/<title>([\s\S]*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : '';

        const descMatch = body.match(/<meta\s+name=["']description["']\s+content=(["'])([\s\S]*?)\1/i);
        const desc = descMatch ? descMatch[2].trim() : '';

        const canonMatch = body.match(/<link\s+rel=["']canonical["']\s+href=(["'])([\s\S]*?)\1/i);
        const canon = canonMatch ? canonMatch[2].trim() : '';

        const h1Matches = body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
        const noscriptBlocks = body.match(/<noscript[\s\S]*?<\/noscript>/gi) || [];
        const inNoscript = noscriptBlocks.some((b) => /<h1/i.test(b));

        const jsonLdMatches = body.match(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi) || [];

        resolve({
          url,
          statusCode: res.statusCode,
          title,
          titleLen: title.length,
          desc,
          descLen: desc.length,
          canon,
          h1Count: h1Matches.length,
          h1Text: h1Matches[0] ? h1Matches[0].replace(/<[^>]+>/g, '').trim() : 'NONE',
          inNoscript,
          jsonLdCount: jsonLdMatches.length,
        });
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('--- TESTING LIVE PRODUCTION ENDPOINTS ---');
  const urls = [
    'https://gocoupon.io/',
    'https://gocoupon.io/featured-deals',
    'https://gocoupon.io/amazon-coupons',
    'https://gocoupon.io/flipkart-coupons',
    'https://gocoupon.io/compare',
    'https://gocoupon.io/blog/amazon-india-lightning-deals',
  ];

  for (const u of urls) {
    const res = await checkUrl(u);
    console.log(`\nURL: ${res.url}`);
    console.log(`  HTTP Status:       ${res.statusCode}`);
    console.log(`  Title (${res.titleLen} chars):    "${res.title}"`);
    console.log(`  Description (${res.descLen}c): "${res.desc.slice(0, 70)}..."`);
    console.log(`  Canonical:         ${res.canon}`);
    console.log(`  H1 Tag (${res.h1Count}):       "${res.h1Text.slice(0, 70)}..."`);
    console.log(`  H1 In <noscript>:  ${res.inNoscript ? 'YES ❌' : 'NO (in Primary DOM) ✅'}`);
    console.log(`  JSON-LD Schemas:   ${res.jsonLdCount} detected`);
  }

  // Check robots.txt and sitemap.xml
  console.log('\n--- LIVE ROBOTS.TXT & SITEMAP.XML ---');
  const getRaw = (u) => new Promise(resolve => https.get(u, res => {
    let b = '';
    res.on('data', c => b += c);
    res.on('end', () => resolve({ status: res.statusCode, body: b }));
  }));

  const robots = await getRaw('https://gocoupon.io/robots.txt');
  console.log(`robots.txt Status: ${robots.status}`);
  console.log(`  Includes Sitemap:  ${robots.body.includes('Sitemap: https://gocoupon.io/sitemap.xml') ? 'YES ✅' : 'NO ❌'}`);
  console.log(`  Disallow /admin:   ${robots.body.includes('Disallow: /admin') ? 'YES ✅' : 'NO ❌'}`);
  console.log(`  Disallow /api/:    ${robots.body.includes('Disallow: /api/') ? 'YES ✅' : 'NO ❌'}`);

  const sitemap = await getRaw('https://gocoupon.io/sitemap.xml');
  const urlsInSitemap = (sitemap.body.match(/<loc>/g) || []).length;
  console.log(`sitemap.xml Status: ${sitemap.status}`);
  console.log(`  Total URLs listed: ${urlsInSitemap} URLs ✅`);
}

run();
