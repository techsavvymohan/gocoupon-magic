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

  await send('Runtime.enable');
  const res = await send('Runtime.evaluate', {
    expression: `
      (() => {
        return {
          title: document.title,
          url: window.location.href,
          bodyText: document.body.innerText.slice(0, 300),
          rootChildCount: document.getElementById('root')?.children.length,
          rootFirstChildHtml: document.getElementById('root')?.children[0]?.outerHTML?.slice(0, 300),
          allVisibleTextLength: document.body.innerText.length
        };
      })()
    `,
    returnByValue: true
  });
  console.log('DOM STATE:', JSON.stringify(res.result?.value, null, 2));
  ws.close();
}
main().catch(console.error);
