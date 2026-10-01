import fs from "fs";

async function main() {
  const listRes = await fetch("http://127.0.0.1:9222/json/list");
  const tabs = await listRes.json();
  const pageTab = tabs.find(t => t.id === "7DBAF1D90FAB2F413EB3B1B938977F3B" || t.url?.includes("gocoupon.io/stores"));
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

  // Scroll to top
  await send("Runtime.evaluate", { expression: "window.scrollTo(0, 0)" });
  await new Promise(r => setTimeout(r, 1000));

  const shot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync("C:/Users/Zarvis/.gemini/antigravity-ide/brain/e42be863-8fda-4adb-b8dc-1ae9c01b0e20/user_stores_tab_live_now.png", Buffer.from(shot.data, "base64"));
  console.log("Saved user_stores_tab_live_now.png");

  // Scroll 600px down and take another
  await send("Runtime.evaluate", { expression: "window.scrollTo(0, 600)" });
  await new Promise(r => setTimeout(r, 1000));
  const shot2 = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync("C:/Users/Zarvis/.gemini/antigravity-ide/brain/e42be863-8fda-4adb-b8dc-1ae9c01b0e20/user_stores_tab_live_scrolled.png", Buffer.from(shot2.data, "base64"));
  console.log("Saved user_stores_tab_live_scrolled.png");

  ws.close();
}

main().catch(console.error);
