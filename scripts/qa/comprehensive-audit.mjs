import { spawn } from "child_process";
import fs from "fs";
import path from "path";

async function main() {
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const port = 9387;
  const chromeProc = spawn(chromePath, [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    "--window-size=1536,900",
    "--disable-gpu",
    "--no-sandbox",
    "about:blank"
  ]);

  await new Promise(r => setTimeout(r, 2000));
  try {
    const listRes = await fetch(`http://localhost:${port}/json/list`);
    const tabs = await listRes.json();
    const pageTab = tabs.find(t => t.type === "page");
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

    // 1. Audit Stores Page
    console.log("Navigating to https://gocoupon.io/stores...");
    await send("Page.navigate", { url: "https://gocoupon.io/stores" });
    await new Promise(r => setTimeout(r, 5000));

    const storesShot = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("C:/Users/Zarvis/.gemini/antigravity-ide/brain/e42be863-8fda-4adb-b8dc-1ae9c01b0e20/audit_stores_page_top.png", Buffer.from(storesShot.data, "base64"));
    console.log("Captured audit_stores_page_top.png");

    await send("Runtime.evaluate", { expression: "window.scrollBy(0, 700)" });
    await new Promise(r => setTimeout(r, 1000));
    const storesShot2 = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("C:/Users/Zarvis/.gemini/antigravity-ide/brain/e42be863-8fda-4adb-b8dc-1ae9c01b0e20/audit_stores_page_grid.png", Buffer.from(storesShot2.data, "base64"));
    console.log("Captured audit_stores_page_grid.png");

    // 2. Audit Homepage Sections & Gaps
    console.log("Navigating to https://gocoupon.io/...");
    await send("Page.navigate", { url: "https://gocoupon.io/" });
    await new Promise(r => setTimeout(r, 5000));

    // Measure all sections
    const sectionMetrics = await send("Runtime.evaluate", {
      expression: `
        (() => {
          // Scroll page completely down and up to trigger any observers
          window.scrollTo(0, document.body.scrollHeight);
          const sections = Array.from(document.querySelectorAll('section, main > div, footer'));
          return sections.map((s, idx) => {
            const rect = s.getBoundingClientRect();
            const comp = window.getComputedStyle(s);
            return {
              idx,
              tag: s.tagName,
              className: s.className.slice(0, 60),
              id: s.id,
              offsetTop: s.offsetTop,
              offsetHeight: s.offsetHeight,
              paddingTop: comp.paddingTop,
              paddingBottom: comp.paddingBottom,
              marginTop: comp.marginTop,
              marginBottom: comp.marginBottom,
              opacity: comp.opacity,
              display: comp.display,
              visibility: comp.visibility,
              textSnippet: s.innerText.slice(0, 80).replace(/\\s+/g, ' ')
            };
          });
        })()
      `,
      returnByValue: true
    });

    console.log("Homepage Section Metrics:", JSON.stringify(sectionMetrics.result?.value, null, 2));

    // Capture homepage in steps of 650px to inspect every transition
    await send("Runtime.evaluate", { expression: "window.scrollTo(0, 0)" });
    await new Promise(r => setTimeout(r, 1000));

    const pageHeightRes = await send("Runtime.evaluate", { expression: "document.body.scrollHeight", returnByValue: true });
    const totalHeight = pageHeightRes.result?.value || 3000;
    console.log("Total Homepage Height:", totalHeight);

    for (let y = 0, shotIdx = 1; y < totalHeight; y += 650, shotIdx++) {
      await send("Runtime.evaluate", { expression: `window.scrollTo(0, ${y})` });
      await new Promise(r => setTimeout(r, 600));
      const shot = await send("Page.captureScreenshot", { format: "png" });
      const filename = `homepage_scroll_${shotIdx}_y${y}.png`;
      fs.writeFileSync(`C:/Users/Zarvis/.gemini/antigravity-ide/brain/e42be863-8fda-4adb-b8dc-1ae9c01b0e20/${filename}`, Buffer.from(shot.data, "base64"));
      console.log(`Captured ${filename}`);
    }

    ws.close();
  } finally {
    chromeProc.kill("SIGKILL");
  }
}

main().catch(console.error);
