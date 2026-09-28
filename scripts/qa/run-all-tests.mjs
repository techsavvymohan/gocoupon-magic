import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const suites = [
  { name: 'Suite 1: Security & Secrets Leak Audit', file: '01-security-and-secrets.mjs' },
  { name: 'Suite 2: Data Integrity & Database Persistence', file: '02-data-integrity-and-db.mjs' },
  { name: 'Suite 3: Functional, Search & Edge Cases QA', file: '03-functional-and-edge-cases.mjs' },
  { name: 'Suite 4: SEO, SSG Pre-Rendering & Route Audit', file: '04-seo-and-routes.mjs' },
];

console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║        🏢 GOCOUPON PROFESSIONAL PRODUCTION QA AUDIT RUNNER        ║');
console.log('╚════════════════════════════════════════════════════════════════════╝');
console.log(`Starting execution of ${suites.length} automated enterprise testing suites...\n`);

function runSuite(suite) {
  return new Promise((resolve) => {
    const filePath = path.join(__dirname, suite.file);
    const child = spawn('node', [filePath], {
      stdio: 'inherit',
      env: process.env,
    });

    child.on('close', (code) => {
      resolve({ name: suite.name, code });
    });
  });
}

const startTime = Date.now();
const results = [];

for (const suite of suites) {
  const res = await runSuite(suite);
  results.push(res);
}

const duration = ((Date.now() - startTime) / 1000).toFixed(2);

console.log('\n╔════════════════════════════════════════════════════════════════════╗');
console.log('║                     📊 FINAL QA AUDIT SUMMARY                     ║');
console.log('╚════════════════════════════════════════════════════════════════════╝');

let allPassed = true;
for (const r of results) {
  const status = r.code === 0 ? '✅ PASSED' : '❌ FAILED';
  if (r.code !== 0) allPassed = false;
  console.log(`  ${status.padEnd(12)} : ${r.name}`);
}

console.log(`\nTotal Execution Time: ${duration}s`);
if (allPassed) {
  console.log('🏆 STATUS: 100% PRODUCTION READY. ALL QA SUITES PASSED!\n');
  process.exit(0);
} else {
  console.error('⚠️ STATUS: ONE OR MORE QA SUITES ENCOUNTERED FAILURES.\n');
  process.exit(1);
}
