import fs from 'fs';

async function main() {
  const listRes = await fetch('http://127.0.0.1:9222/json/list');
  const tabs = await listRes.json();
  const pageTab = tabs.find(t => t.id === '7DBAF1D90FAB2F413EB3B1B938977F3B');
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
  await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 0)' });
  await new Promise(r => setTimeout(r, 600));

  const shot = await send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: false
  });

  fs.writeFileSync('C:/Users/Zarvis/.gemini/antigravity-ide/brain/e42be863-8fda-4adb-b8dc-1ae9c01b0e20/test_capture_surface_false.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved test_capture_surface_false.png');

  ws.close();
}

main().catch(console.error);
