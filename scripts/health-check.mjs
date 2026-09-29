#!/usr/bin/env node
// Quick health check script for VPS
import http from 'http';

const BASE = 'http://localhost:3000';

const routes = [
  ['HOME', '/'],
  ['HEALTH_API', '/api/health'],
  ['API_DEALS', '/api/deals?limit=3'],
  ['API_STORES', '/api/stores?limit=3'],
  ['FEATURED_DEALS_PAGE', '/featured-deals'],
  ['STORES_PAGE', '/stores'],
  ['OFFERS_PAGE', '/offers'],
  ['AMAZON_SEO', '/amazon-coupons'],
  ['LIVE_DEALS_JSON', '/data/live-deals.json'],
  ['SITEMAP', '/sitemap.xml'],
  ['ROBOTS', '/robots.txt'],
];

async function check(label, path) {
  const t = Date.now();
  return new Promise((resolve) => {
    const req = http.get(BASE + path, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        const ms = Date.now() - t;
        const ok = res.statusCode >= 200 && res.statusCode < 400;
        resolve({ label, path, status: res.statusCode, ms, ok, bodyLen: body.length });
      });
    });
    req.on('error', (e) => {
      resolve({ label, path, status: 0, ms: Date.now() - t, ok: false, err: e.message });
    });
    req.setTimeout(8000, () => { req.destroy(); resolve({ label, path, status: 0, ms: 8000, ok: false, err: 'TIMEOUT' }); });
  });
}

const results = await Promise.all(routes.map(([label, path]) => check(label, path)));

let allOk = true;
for (const r of results) {
  const icon = r.ok ? '✅' : '❌';
  const err = r.err ? ` ERROR: ${r.err}` : '';
  console.log(`${icon} ${r.status} ${r.ms}ms  ${r.label} (${r.path})  body:${r.bodyLen ?? 0}b${err}`);
  if (!r.ok) allOk = false;
}

// Extra: verify gzip compression is active
const gzipCheck = await new Promise((resolve) => {
  const req = http.get(BASE + '/', { headers: { 'Accept-Encoding': 'gzip, deflate' } }, (res) => {
    resolve(res.headers['content-encoding'] || 'NONE');
  });
  req.on('error', () => resolve('ERROR'));
});
console.log(`\n📦 Gzip Content-Encoding on /: ${gzipCheck === 'gzip' ? '✅ gzip' : '⚠️  ' + gzipCheck}`);

// Verify ETag header present
const etagCheck = await new Promise((resolve) => {
  const req = http.get(BASE + '/assets/', {}, (res) => {
    resolve(res.headers['etag'] || res.headers['cache-control'] || 'NONE');
  });
  req.on('error', () => resolve('ERROR'));
});
console.log(`🏷️  Cache-Control on /: ${etagCheck}`);

console.log(`\n${allOk ? '🎉 ALL CHECKS PASSED' : '🔴 SOME CHECKS FAILED'}`);
process.exit(allOk ? 0 : 1);
