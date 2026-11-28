import fs from 'node:fs';

const envContent = fs.readFileSync('.env', 'utf8');
let apiKey = '';
for (const line of envContent.split('\n')) {
  if (line.startsWith('CUELINKS_API_KEY=')) {
    apiKey = line.split('=')[1].trim().replace(/^['"]|['"]$/g, '');
  }
}
const headers = { 'Authorization': 'Token ' + apiKey, 'Accept': 'application/json' };
const today = new Date().toISOString().slice(0, 10);

async function main() {
  for (const param of ['group_by=campaign', 'group_by=subid', 'group_by=channel', 'dimension=campaign']) {
    const url = `https://developers.cuelinks.com/pub_api/v3/reports/performance?start_date=2026-11-01&end_date=${today}&${param}`;
    const res = await fetch(url, { headers });
    const data = await res.json();
    console.log(param, '-> Status:', res.status, 'Data length:', data.data?.length);
    if (data.data && data.data.length > 0) {
      console.log('Sample item:', JSON.stringify(data.data[0]));
    }
  }
}

main();
