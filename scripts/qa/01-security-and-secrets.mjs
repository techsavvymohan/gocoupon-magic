import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

console.log('\n=======================================================');
console.log('   🛡️  SUITE 1: SECURITY, AUTH & SECRETS LEAK AUDIT   ');
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

// 1. Client-Side Bundle Leak Audit
console.log('[Test 1.1] Scanning client-side JS/HTML bundle for server-only secrets...');
const envPath = path.join(projectRoot, '.env');
const sensitiveKeys = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'ADMIN_PASSWORD',
  'DATABASE_URL',
  'CUELINKS_API_KEY',
  'ADMITAD_CLIENT_SECRET',
  'SMTP_PASSWORD',
  'SMTP_PASS',
];

const secretsToFind = [];
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (sensitiveKeys.includes(key) && val.length > 5) {
        secretsToFind.push({ key, val });
      }
    }
  }
}

const distDir = path.join(projectRoot, 'dist');
let leakedSecrets = [];

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDirectory(fullPath);
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.html') || entry.name.endsWith('.map')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      for (const { key, val } of secretsToFind) {
        if (content.includes(val)) {
          leakedSecrets.push({ file: entry.name, key });
        }
      }
    }
  }
}

scanDirectory(distDir);
assert(
  leakedSecrets.length === 0,
  `Client bundle has zero exposed secrets (checked ${secretsToFind.length} keys: ${secretsToFind.map((s) => s.key).join(', ')})`
);

// 2. Unauthenticated Admin Route Blocking (Live Server)
const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
console.log(`\n[Test 1.2] Testing Route Protection on ${BASE_URL}...`);

try {
  // Test POST /api/offers without token
  const unauthPost = await fetch(`${BASE_URL}/api/offers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storeName: 'HackerStore', title: 'Unauthorized' }),
  });
  assert(
    unauthPost.status === 401,
    `POST /api/offers rejected unauthenticated request (HTTP ${unauthPost.status})`
  );

  // Test PUT /api/offers without token
  const unauthPut = await fetch(`${BASE_URL}/api/offers?id=test-123`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Hacked Title' }),
  });
  assert(
    unauthPut.status === 401,
    `PUT /api/offers rejected unauthenticated request (HTTP ${unauthPut.status})`
  );

  // Test DELETE /api/offers without token
  const unauthDel = await fetch(`${BASE_URL}/api/offers?id=test-123`, {
    method: 'DELETE',
  });
  assert(
    unauthDel.status === 401,
    `DELETE /api/offers rejected unauthenticated request (HTTP ${unauthDel.status})`
  );

  // Test GET /api/admin/users without token
  const unauthUsers = await fetch(`${BASE_URL}/api/admin/users`);
  assert(
    unauthUsers.status === 401,
    `GET /api/admin/users rejected unauthenticated request (HTTP ${unauthUsers.status})`
  );

  // Test invalid token
  const fakeTokenPost = await fetch(`${BASE_URL}/api/offers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer invalid.bogus.jwt.token.here',
    },
    body: JSON.stringify({ storeName: 'HackerStore', title: 'Unauthorized' }),
  });
  assert(
    fakeTokenPost.status === 401,
    `POST /api/offers rejected bogus bearer token (HTTP ${fakeTokenPost.status})`
  );
} catch (netErr) {
  console.error('Network check error:', netErr.message);
  failCount++;
}

// 3. Security Headers Test
console.log('\n[Test 1.3] Testing HTTP Security Headers...');
try {
  const headerRes = await fetch(`${BASE_URL}/api/health`);
  const csp = headerRes.headers.get('content-security-policy');
  const xfo = headerRes.headers.get('x-frame-options');
  const xcto = headerRes.headers.get('x-content-type-options');

  assert(Boolean(csp && csp.includes("default-src 'self'")), `Content-Security-Policy header active`);
  assert(Boolean(xfo && (xfo === 'DENY' || xfo === 'SAMEORIGIN')), `X-Frame-Options set to DENY/SAMEORIGIN`);
  assert(Boolean(xcto && xcto === 'nosniff'), `X-Content-Type-Options set to nosniff`);
} catch (headErr) {
  console.error('Headers check error:', headErr.message);
  failCount++;
}

console.log(`\n=======================================================`);
console.log(`   SUITE 1 RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log(`=======================================================\n`);

if (failCount > 0) process.exit(1);
