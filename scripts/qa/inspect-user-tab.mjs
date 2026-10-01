import fs from "fs";

async function main() {
  const listRes = await fetch("http://127.0.0.1:9222/json/list");
  const tabs = await listRes.json();
  const pageTab = tabs.find(t => t.id === "7DBAF1D90FAB2F413EB3B1B938977F3B" || t.url?.includes("gocoupon.io/stores"));
  
  if (!pageTab) {
    console.error("User stores tab not found! Available:", tabs.map(t => ({ id: t.id, url: t.url })));
    return;
  }

  console.log("Connecting to user tab:", pageTab.id, pageTab.url);
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const pending = new Map();
  ws.onmessage = (evt) => {
    const d = JSON.parse(evt.data);
    if (d.id && pending.has(d.id)) {
      const res = pending.get(d.id);
      pending.delete(d.id);
      res(d.result);
    }
  };

  function send(method, params = {}) {
    return new Promise(res => {
      const myId = id++;
      pending.set(myId, res);
      ws.send(JSON.stringify({ id: myId, method, params }));
    });
  }

  await send("Runtime.enable");
  await send("Page.enable");

  // 1. Take screenshot of what user currently sees
  const shot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync("C:/Users/Zarvis/.gemini/antigravity-ide/brain/e42be863-8fda-4adb-b8dc-1ae9c01b0e20/user_stores_tab_current.png", Buffer.from(shot.data, "base64"));
  console.log("Saved user_stores_tab_current.png");

  // 2. Inspect state of the tab
  const tabDetails = await send("Runtime.evaluate", {
    expression: `
      (() => {
        const root = document.getElementById('root');
        const loader = document.getElementById('site-loader');
        const errorBoundary = document.querySelector('div[style*="min-height: 100vh"]');
        return {
          title: document.title,
          url: window.location.href,
          viewport: { width: window.innerWidth, height: window.innerHeight },
          scrollHeight: document.documentElement.scrollHeight,
          hasLoader: !!loader,
          loaderStyle: loader ? {
            display: window.getComputedStyle(loader).display,
            opacity: window.getComputedStyle(loader).opacity,
            zIndex: window.getComputedStyle(loader).zIndex,
            background: window.getComputedStyle(loader).backgroundColor
          } : null,
          rootChildCount: root ? root.children.length : 0,
          rootFirstChildTag: root && root.children[0] ? root.children[0].tagName : null,
          rootFirstChildClass: root && root.children[0] ? root.children[0].className : null,
          hasErrorBoundary: !!errorBoundary,
          errorBoundaryText: errorBoundary ? errorBoundary.innerText : null,
          hasSearchInput: !!document.querySelector('input[name="storeSearch"]'),
          storeCardsCount: document.querySelectorAll('.group\\/search, [aria-label*="Copy coupon code"]').length,
          bodySnippet: document.body.innerText.slice(0, 300).replace(/\\s+/g, ' ')
        };
      })()
    `,
    returnByValue: true
  });

  console.log("USER TAB DETAILS:", JSON.stringify(tabDetails.result?.value, null, 2));

  ws.close();
}

main().catch(console.error);
