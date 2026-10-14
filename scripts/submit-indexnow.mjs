#!/usr/bin/env node
/**
 * Automated IndexNow Submission Script
 * Submits all sitemap URLs directly to Bing, Yahoo, Yandex, Seznam, and partner engines.
 * 
 * Usage:
 *   node scripts/submit-indexnow.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const INDEXNOW_KEY = '6d4e8c1b92a34f5e82b7c91a03f4e8b2';
const HOST = 'gocoupon.io';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;
const SITEMAP_PATH = path.join(ROOT_DIR, 'public', 'sitemap.xml');
const KEY_FILE_PATH = path.join(ROOT_DIR, 'public', `${INDEXNOW_KEY}.txt`);

async function submitIndexNow() {
  console.log('====================================================');
  console.log('🚀 GoCoupon Automated IndexNow Submission');
  console.log('====================================================');

  // 1. Verify key file exists
  if (!fs.existsSync(KEY_FILE_PATH)) {
    console.error(`❌ IndexNow key file missing: ${KEY_FILE_PATH}`);
    process.exit(1);
  }
  console.log(`🔑 Verified Key File: ${INDEXNOW_KEY}.txt`);

  // 2. Read Sitemap URLs
  if (!fs.existsSync(SITEMAP_PATH)) {
    console.error(`❌ sitemap.xml not found at ${SITEMAP_PATH}. Please run npm run build first.`);
    process.exit(1);
  }

  const sitemapXml = fs.readFileSync(SITEMAP_PATH, 'utf-8');
  const urlMatches = sitemapXml.match(/<loc>(https:\/\/gocoupon\.io\/[^<]+)<\/loc>/g) || [];
  const urls = urlMatches.map(m => m.replace(/<\/?loc>/g, '').trim());

  if (urls.length === 0) {
    console.error('❌ No URLs discovered in sitemap.xml.');
    process.exit(1);
  }

  console.log(`📄 Discovered ${urls.length} URLs in public/sitemap.xml`);

  // 3. Prepare IndexNow payload (up to 10,000 URLs)
  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls
  };

  const endpoints = [
    { name: 'IndexNow Global (api.indexnow.org)', url: 'https://api.indexnow.org/indexnow' },
    { name: 'Bing IndexNow (www.bing.com)', url: 'https://www.bing.com/indexnow' }
  ];

  for (const endpoint of endpoints) {
    console.log(`\n📡 Submitting ${urls.length} URLs to ${endpoint.name}...`);
    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'User-Agent': 'GoCoupon-IndexNow-Bot/1.0'
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 200 || response.status === 202) {
        console.log(`✅ Success! [HTTP ${response.status}] ${endpoint.name} acknowledged all ${urls.length} URLs.`);
      } else {
        const text = await response.text();
        console.warn(`⚠️ Warning: [HTTP ${response.status}] Response: ${text.slice(0, 150)}`);
      }
    } catch (err) {
      console.error(`❌ Network error submitting to ${endpoint.name}:`, err.message);
    }
  }

  console.log('\n====================================================');
  console.log('🎉 IndexNow Submission Completed!');
  console.log('Bing & partner crawlers have been notified of all live URLs.');
  console.log('====================================================');
}

submitIndexNow();
