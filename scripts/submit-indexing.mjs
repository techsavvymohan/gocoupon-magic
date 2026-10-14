#!/usr/bin/env node
/**
 * Master Indexing Automation Suite
 * Runs both IndexNow (Bing/Yahoo/Yandex) and Google Indexing API sequentially.
 * 
 * Usage:
 *   node scripts/submit-indexing.mjs
 *   npm run index:submit
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('====================================================');
console.log('⚡ GOCOUPON UNIFIED INDEXING AUTOMATION');
console.log('====================================================');

// 1. Run IndexNow
console.log('\n[1/2] Initiating IndexNow Protocol (Bing, Yahoo, DuckDuckGo partner network)...');
spawnSync('node', [path.join(__dirname, 'submit-indexnow.mjs')], {
  cwd: ROOT_DIR,
  stdio: 'inherit'
});

// 2. Run Google Indexing API
console.log('\n[2/2] Initiating Google Indexing API (Googlebot Fast-Track)...');
spawnSync('node', [path.join(__dirname, 'submit-google-indexing.mjs')], {
  cwd: ROOT_DIR,
  stdio: 'inherit'
});

console.log('\n====================================================');
console.log('🏁 Unified Indexing Flow Complete!');
console.log('====================================================');
