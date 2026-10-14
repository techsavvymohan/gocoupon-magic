#!/usr/bin/env node
/**
 * Automated Google Indexing API Submission Script
 * Uses Google Cloud Service Account to trigger Googlebot crawl requests for updated/new pages.
 * 
 * Quota: 200 URLs / day per service account.
 * Maintains state in `.indexing-history.json` to rotate and submit across all 500+ URLs.
 * 
 * Setup Instructions:
 * 1. Download Service Account JSON key from Google Cloud Console.
 * 2. Save it as `service-account.json` in the root folder of this project.
 * 3. Add the Service Account email as "Owner" in Google Search Console (Settings -> Users and permissions).
 * 4. Run `node scripts/submit-google-indexing.mjs`
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const SITEMAP_PATH = path.join(ROOT_DIR, 'public', 'sitemap.xml');
const HISTORY_PATH = path.join(ROOT_DIR, '.indexing-history.json');
const CREDENTIAL_LOCATIONS = [
  process.env.GOOGLE_APPLICATION_CREDENTIALS,
  path.join(ROOT_DIR, 'service-account.json'),
  path.join(ROOT_DIR, 'config', 'service-account.json'),
  path.join(ROOT_DIR, 'gsc-service-account.json')
].filter(Boolean);

function findCredentials() {
  for (const loc of CREDENTIAL_LOCATIONS) {
    if (fs.existsSync(loc)) {
      try {
        const data = JSON.parse(fs.readFileSync(loc, 'utf-8'));
        if (data.client_email && data.private_key) {
          return { path: loc, data };
        }
      } catch (err) {
        // Continue searching
      }
    }
  }
  return null;
}

function base64url(input) {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf-8') : input;
  return buf.toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function getAccessToken(clientEmail, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const claimSet = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedClaimSet = base64url(JSON.stringify(claimSet));
  const signatureInput = `${encodedHeader}.${encodedClaimSet}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signatureInput);
  signer.end();
  const signature = signer.sign(privateKey);
  const encodedSignature = base64url(signature);

  const jwt = `${signatureInput}.${encodedSignature}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to obtain Google OAuth access token [${response.status}]: ${errorText}`);
  }

  const tokenData = await response.json();
  return tokenData.access_token;
}

async function submitUrlToGoogle(url, accessToken) {
  const endpoint = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: url,
      type: 'URL_UPDATED'
    })
  });

  const body = await response.json();
  if (response.ok) {
    return { success: true, data: body };
  } else {
    return { success: false, status: response.status, error: body };
  }
}

async function runGoogleIndexing() {
  console.log('====================================================');
  console.log('🤖 GoCoupon Automated Google Indexing API Runner');
  console.log('====================================================');

  const credentials = findCredentials();

  if (!credentials) {
    console.log('ℹ️ No Google Service Account key file found yet.\n');
    console.log('📋 Follow these 3 simple steps to enable automatic Google Indexing:');
    console.log('------------------------------------------------------------------');
    console.log('1. Go to Google Cloud Console:');
    console.log('   https://console.cloud.google.com/apis/library/indexing.googleapis.com');
    console.log('   Click "Enable" for Web Search Indexing API.');
    console.log('\n2. Create a Service Account:');
    console.log('   IAM & Admin -> Service Accounts -> Create Service Account');
    console.log('   Keys -> Add Key -> Create new key -> JSON');
    console.log('   Save the downloaded JSON file as `service-account.json` in this project.');
    console.log('\n3. Grant Access in Google Search Console:');
    console.log('   https://search.google.com/search-console/users?resource_id=sc-domain%3Agocoupon.io');
    console.log('   Click "Add User" -> Paste the service account email (e.g. indexing-bot@your-project.iam.gserviceaccount.com)');
    console.log('   Set permission to: "Owner".');
    console.log('\nOnce done, rerun `npm run index:google` to submit 200 URLs automatically!');
    console.log('====================================================');
    return;
  }

  console.log(`🔑 Using Service Account: ${credentials.data.client_email}`);

  // 1. Read sitemap URLs
  if (!fs.existsSync(SITEMAP_PATH)) {
    console.error(`❌ sitemap.xml not found at ${SITEMAP_PATH}. Please run npm run build first.`);
    process.exit(1);
  }

  const sitemapXml = fs.readFileSync(SITEMAP_PATH, 'utf-8');
  const urlMatches = sitemapXml.match(/<loc>(https:\/\/gocoupon\.io\/[^<]+)<\/loc>/g) || [];
  const allUrls = urlMatches.map(m => m.replace(/<\/?loc>/g, '').trim());

  console.log(`📄 Discovered ${allUrls.length} total URLs in sitemap.xml`);

  // 2. Load submission history
  let history = {};
  if (fs.existsSync(HISTORY_PATH)) {
    try {
      history = JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf-8'));
    } catch (e) {
      history = {};
    }
  }

  // Determine unsubmitted or oldest-submitted URLs
  const sortedUrls = [...allUrls].sort((a, b) => {
    const timeA = history[a] ? new Date(history[a].lastSubmitted).getTime() : 0;
    const timeB = history[b] ? new Date(history[b].lastSubmitted).getTime() : 0;
    return timeA - timeB;
  });

  const DAILY_QUOTA = 200;
  const batch = sortedUrls.slice(0, DAILY_QUOTA);
  console.log(`🎯 Submitting today's batch of ${batch.length} priority URLs to Google Indexing API...`);

  // 3. Obtain OAuth Token
  let accessToken;
  try {
    accessToken = await getAccessToken(credentials.data.client_email, credentials.data.private_key);
    console.log('🔐 Google OAuth Access Token generated successfully.');
  } catch (err) {
    console.error('❌ Authentication failed:', err.message);
    process.exit(1);
  }

  // 4. Submit URLs in rate-limited sequential loop
  let successCount = 0;
  let failureCount = 0;
  const nowIso = new Date().toISOString();

  for (let i = 0; i < batch.length; i++) {
    const targetUrl = batch[i];
    const progress = `[${i + 1}/${batch.length}]`;
    const result = await submitUrlToGoogle(targetUrl, accessToken);

    if (result.success) {
      successCount++;
      history[targetUrl] = {
        lastSubmitted: nowIso,
        status: 'OK',
        notificationType: result.data.urlNotificationMetadata?.latestUpdate?.type || 'URL_UPDATED'
      };
      console.log(`  ${progress} ✅ Submitted: ${targetUrl}`);
    } else {
      failureCount++;
      console.error(`  ${progress} ❌ Error (${result.status}): ${targetUrl}`);
      if (result.status === 429) {
        console.warn('⚠️ Daily quota exceeded (200 requests/day). Stopping batch for today.');
        break;
      }
      if (result.status === 403) {
        console.error('⚠️ Permission Denied: Make sure the Service Account email has "Owner" permission in Google Search Console.');
        break;
      }
    }

    // Small delay to prevent burst throttling
    await new Promise(r => setTimeout(r, 150));
  }

  // Save history
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2), 'utf-8');

  console.log('\n====================================================');
  console.log(`🎉 Google Indexing Batch Completed!`);
  console.log(`✅ Successfully submitted: ${successCount}`);
  console.log(`❌ Failures / Skipped: ${failureCount}`);
  console.log(`💾 Progress tracked in .indexing-history.json`);
  console.log('Googlebot will begin crawling these submitted URLs shortly.');
  console.log('====================================================');
}

runGoogleIndexing().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
