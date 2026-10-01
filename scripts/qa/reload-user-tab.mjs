import fs from "fs";

async function main() {
  const listRes = await fetch("http://127.0.0.1:9222/json/list");
  const tabs = await listRes.json();
  const pageTab = tabs.find(t => t.id === "7DBAF1D90FAB2F413EB3B1B938977F3B" || t.url?.includes("gocoupon.io/stores"));
  if (!pageTab) {
    console.error("Tab not found");
    return;
  }

  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const send = (m, p = {}) => new Promise(res => {
    const myId = id++;
    const l = e => {
      const d = JSON.parse(e.data);
      if (d.id === myId) {
        ws.removeEventListener("message", l);
        res(d.result);
      }
    };
    ws.addEventListener("message", l);
    ws.send(JSON.stringify({ id: myId, method: m, params: p }));
  });

  await send("Page.enable");
  await send("Runtime.enable");

  console.log("Triggering hard reload (ignoreCache: true)...");
  await send("Page.reload", { ignoreCache: true });
  await new Promise(r => setTimeout(r, 5000));

  const shot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync("C:/Users/Zarvis/.gemini/antigravity-ide/brain/e42be863-8fda-4adb-b8dc-1ae9c01b0e20/user_stores_tab_after_reload.png", Buffer.from(shot.data, "base64"));
  console.log("Saved user_stores_tab_after_reload.png");

  const check = await send("Runtime.evaluate", {
    expression: `
      (() => {
        return {
          h1: document.querySelector('h1')?.innerText,
          hasSearch: !!document.querySelector('input[name="storeSearch"]'),
          copyButtons: document.querySelectorAll('[aria-label*="Copy coupon code"]').length,
          allCards: document.querySelectorAll('.group\\/search').length,
          bodySnippet: document.body.innerText.slice(0, 200).replace(/\\s+/g, ' ')
        };
      })()
    `,
    returnByValue: true
  });

  console.log("PAGE STATE AFTER HARD RELOAD:", JSON.stringify(check.result?.value, null, 2));

  ws.close();
}

main().catch(console.error);
