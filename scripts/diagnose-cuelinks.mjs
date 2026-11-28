import fs from 'node:fs';

const env = fs.readFileSync('.env', 'utf-8');
const apiKey = env.match(/CUELINKS_API_KEY=([^\r\n]+)/)?.[1]?.trim();
const pubId = env.match(/CUELINKS_PUBLISHER_ID=([^\r\n]+)/)?.[1]?.trim();
const channelId = env.match(/CUELINKS_CHANNEL_ID=([^\r\n]+)/)?.[1]?.trim();

console.log('--- Cuelinks Config ---');
console.log('API Key:', apiKey ? 'Loaded (starts with ' + apiKey.slice(0, 6) + '...)' : 'MISSING');
console.log('Publisher ID:', pubId);
console.log('Channel ID:', channelId);

async function run() {
  try {
    // 1. Ping
    console.log('\n--- 1. Testing GET /pub_api/v3/ping ---');
    const pingRes = await fetch('https://developers.cuelinks.com/pub_api/v3/ping', {
      headers: { Authorization: `Token ${apiKey}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    console.log('Ping status:', pingRes.status);
    const pingData = await pingRes.json().catch(() => ({}));
    console.log('Ping response:', JSON.stringify(pingData, null, 2));

    // 2. Channels
    console.log('\n--- 2. Testing GET /pub_api/v3/channels ---');
    const chanRes = await fetch('https://developers.cuelinks.com/pub_api/v3/channels', {
      headers: { Authorization: `Token ${apiKey}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    console.log('Channels status:', chanRes.status);
    const chanData = await chanRes.json().catch(() => ({}));
    console.log('Channels response:', JSON.stringify(chanData, null, 2));

    // 3. Link Conversion for Myntra
    console.log('\n--- 3. Testing POST /pub_api/v3/links/convert (Myntra) ---');
    const convMyntra = await fetch('https://developers.cuelinks.com/pub_api/v3/links/convert', {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        url: 'https://www.myntra.com/tshirt',
        channel_id: Number(channelId) || 318931,
        sub_id: 'gocoupon_test',
      }),
      signal: AbortSignal.timeout(8000),
    });
    console.log('Convert Myntra status:', convMyntra.status);
    const convMyntraData = await convMyntra.json().catch(() => ({}));
    console.log('Convert Myntra response:', JSON.stringify(convMyntraData, null, 2));

    // 4. Link Conversion for boAt
    console.log('\n--- 4. Testing POST /pub_api/v3/links/convert (boAt Lifestyle) ---');
    const convBoat = await fetch('https://developers.cuelinks.com/pub_api/v3/links/convert', {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        url: 'https://www.boat-lifestyle.com/products/airdopes-141',
        channel_id: Number(channelId) || 318931,
        sub_id: 'gocoupon_test',
      }),
      signal: AbortSignal.timeout(8000),
    });
    console.log('Convert boAt status:', convBoat.status);
    const convBoatData = await convBoat.json().catch(() => ({}));
    console.log('Convert boAt response:', JSON.stringify(convBoatData, null, 2));

    // 5. Link Conversion for Flipkart
    console.log('\n--- 5. Testing POST /pub_api/v3/links/convert (Flipkart) ---');
    const convFk = await fetch('https://developers.cuelinks.com/pub_api/v3/links/convert', {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        url: 'https://www.flipkart.com',
        channel_id: Number(channelId) || 318931,
        sub_id: 'gocoupon_test',
      }),
      signal: AbortSignal.timeout(8000),
    });
    console.log('Convert Flipkart status:', convFk.status);
    const convFkData = await convFk.json().catch(() => ({}));
    console.log('Convert Flipkart response:', JSON.stringify(convFkData, null, 2));

  } catch (err) {
    console.error('Diagnostic error:', err);
  }
}

run();
