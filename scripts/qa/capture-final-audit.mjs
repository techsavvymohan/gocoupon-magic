import fs from 'fs';

async function main() {
  const listRes = await fetch('http://127.0.0.1:9222/json/list');
  const tabs = await listRes.json();
  const pageTab = tabs.find(t => t.id === '7DBAF1D90FAB2F413EB3B1B938977F3B' || t.url?.includes('gocoupon.io'));
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const send = (m, p = {}) => new Promise(res => {
    const myId = id++;
    const l = e => {
      const d = JSON.parse(e.data);
      if (d.id === myId) {
        ws.removeEventListener('message', l);
        res(d.result);
      }
    };
    ws.addEventListener('message', l);
    ws.send(JSON.stringify({ id: myId, method: m, params: p }));
  });

  await send('Page.enable');
  await send('Page.bringToFront');

  const artifactDir = 'C:/Users/Zarvis/.gemini/antigravity-ide/brain/e42be863-8fda-4adb-b8dc-1ae9c01b0e20';

  // 1. Audit /stores page
  console.log('Navigating to https://gocoupon.io/stores ...');
  await send('Page.navigate', { url: 'https://gocoupon.io/stores' });
  await new Promise(r => setTimeout(r, 4000));

  const storesTop = await send('Page.captureScreenshot', { format: 'png', fromSurface: false });
  fs.writeFileSync(`${artifactDir}/audit_stores_page_final.png`, Buffer.from(storesTop.data, 'base64'));
  console.log('Saved audit_stores_page_final.png');

  await send('Runtime.evaluate', { expression: 'window.scrollBy(0, 550)' });
  await new Promise(r => setTimeout(r, 600));
  const storesCards = await send('Page.captureScreenshot', { format: 'png', fromSurface: false });
  fs.writeFileSync(`${artifactDir}/audit_stores_cards_final.png`, Buffer.from(storesCards.data, 'base64'));
  console.log('Saved audit_stores_cards_final.png');

  // 2. Audit homepage
  console.log('Navigating to https://gocoupon.io/ ...');
  await send('Page.navigate', { url: 'https://gocoupon.io/' });
  await new Promise(r => setTimeout(r, 4000));

  // Section 1: Hero, Logo Marquee & Stats
  await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 0)' });
  await new Promise(r => setTimeout(r, 600));
  const hp1 = await send('Page.captureScreenshot', { format: 'png', fromSurface: false });
  fs.writeFileSync(`${artifactDir}/audit_hp_1_hero_marquee_stats.png`, Buffer.from(hp1.data, 'base64'));
  console.log('Saved audit_hp_1_hero_marquee_stats.png');

  // Section 2: Deals Carousel & Extension Showcase
  await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 680)' });
  await new Promise(r => setTimeout(r, 600));
  const hp2 = await send('Page.captureScreenshot', { format: 'png', fromSurface: false });
  fs.writeFileSync(`${artifactDir}/audit_hp_2_deals_extension.png`, Buffer.from(hp2.data, 'base64'));
  console.log('Saved audit_hp_2_deals_extension.png');

  // Section 3: How It Works & Pillars
  await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 1600)' });
  await new Promise(r => setTimeout(r, 600));
  const hp3 = await send('Page.captureScreenshot', { format: 'png', fromSurface: false });
  fs.writeFileSync(`${artifactDir}/audit_hp_3_how_it_works.png`, Buffer.from(hp3.data, 'base64'));
  console.log('Saved audit_hp_3_how_it_works.png');

  // Section 4: Why Us Expense Saviour & Competitor Matrix
  await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 2750)' });
  await new Promise(r => setTimeout(r, 600));
  const hp4 = await send('Page.captureScreenshot', { format: 'png', fromSurface: false });
  fs.writeFileSync(`${artifactDir}/audit_hp_4_expense_saviour.png`, Buffer.from(hp4.data, 'base64'));
  console.log('Saved audit_hp_4_expense_saviour.png');

  // Section 5: Features & FAQ
  await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 4100)' });
  await new Promise(r => setTimeout(r, 600));
  const hp5 = await send('Page.captureScreenshot', { format: 'png', fromSurface: false });
  fs.writeFileSync(`${artifactDir}/audit_hp_5_features_faq.png`, Buffer.from(hp5.data, 'base64'));
  console.log('Saved audit_hp_5_features_faq.png');

  // Section 6: Blog & CTA & Clean Footer (no duplicate CTA gap)
  await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 5200)' });
  await new Promise(r => setTimeout(r, 600));
  const hp6 = await send('Page.captureScreenshot', { format: 'png', fromSurface: false });
  fs.writeFileSync(`${artifactDir}/audit_hp_6_cta_footer.png`, Buffer.from(hp6.data, 'base64'));
  console.log('Saved audit_hp_6_cta_footer.png');

  ws.close();
}

main().catch(console.error);
