import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const ARTIFACTS_DIR = "C:\\Users\\Zarvis\\.gemini\antigravity-ide\\brain\\e42be863-8fda-4adb-b8dc-1ae9c01b0e20";

async function verify() {
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const port = 9345;
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
    if (!pageTab) throw new Error("No page tab");

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

    await send("Page.enable");
    await send("Runtime.enable");

    // ──────────────────────────────────────────
    // 1. VERIFY /stores PAGE
    // ──────────────────────────────────────────
    console.log("=== NAVIGATING TO https://gocoupon.io/stores ===");
    await send("Page.navigate", { url: "https://gocoupon.io/stores" });
    await new Promise(r => setTimeout(r, 4500));

    const storesInfo = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const cards = document.querySelectorAll("h3");
          const storeNames = Array.from(cards).map(c => c.innerText.trim()).filter(Boolean);
          const siteLoader = document.getElementById("site-loader");
          return {
            title: document.title,
            bodyHeight: document.body.scrollHeight,
            siteLoaderPresent: !!siteLoader,
            storeCardsFound: storeNames.length,
            sampleStores: storeNames.slice(0, 10),
            visibleTextSnippet: document.body.innerText.slice(0, 200).replace(/\\n/g, ' ')
          };
        })()
      `,
      returnByValue: true
    });
    console.log("Stores Page Audit Result:\n", JSON.stringify(storesInfo.result.value, null, 2));

    const storeShot = await send("Page.captureScreenshot", { format: "png" });
    if (storeShot?.data) {
      const p = path.join(ARTIFACTS_DIR, "stores_page_verified.png");
      fs.writeFileSync(p, Buffer.from(storeShot.data, "base64"));
      console.log("Saved screenshot:", p);
    }

    // ──────────────────────────────────────────
    // 2. VERIFY HOMEPAGE GAPS
    // ──────────────────────────────────────────
    console.log("\n=== NAVIGATING TO https://gocoupon.io/ ===");
    await send("Page.navigate", { url: "https://gocoupon.io/" });
    await new Promise(r => setTimeout(r, 3500));

    const homeGaps = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const sections = Array.from(document.querySelectorAll("main > section, main > *"));
          return sections.filter(s => s.tagName === "SECTION").map((s, idx) => {
            const r = s.getBoundingClientRect();
            const cs = window.getComputedStyle(s);
            return {
              idx,
              id: s.id || null,
              h2: s.querySelector("h1, h2")?.innerText?.slice(0, 40) || "",
              height: Math.round(r.height),
              paddingTop: cs.paddingTop,
              paddingBottom: cs.paddingBottom,
              computedOpacity: cs.opacity
            };
          });
        })()
      `,
      returnByValue: true
    });
    console.log("Homepage Sections Audit:\n", JSON.stringify(homeGaps.result.value, null, 2));

    // Screenshot top
    const homeShot1 = await send("Page.captureScreenshot", { format: "png" });
    if (homeShot1?.data) {
      fs.writeFileSync(path.join(ARTIFACTS_DIR, "homepage_top_verified.png"), Buffer.from(homeShot1.data, "base64"));
    }

    // Scroll to 800 (mid) and screenshot
    await send("Runtime.evaluate", { expression: `window.scrollTo(0, 800)` });
    await new Promise(r => setTimeout(r, 800));
    const homeShot2 = await send("Page.captureScreenshot", { format: "png" });
    if (homeShot2?.data) {
      fs.writeFileSync(path.join(ARTIFACTS_DIR, "homepage_mid_verified.png"), Buffer.from(homeShot2.data, "base64"));
    }

    // Scroll to 1800 and screenshot
    await send("Runtime.evaluate", { expression: `window.scrollTo(0, 1800)` });
    await new Promise(r => setTimeout(r, 800));
    const homeShot3 = await send("Page.captureScreenshot", { format: "png" });
    if (homeShot3?.data) {
      fs.writeFileSync(path.join(ARTIFACTS_DIR, "homepage_mid2_verified.png"), Buffer.from(homeShot3.data, "base64"));
    }

    ws.close();
  } finally {
    chromeProc.kill("SIGKILL");
  }
}

verify().catch(console.error);
