import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const ARTIFACTS_DIR = "C:\\Users\\Zarvis\\.gemini\\antigravity-ide\\brain\\e42be863-8fda-4adb-b8dc-1ae9c01b0e20";

async function run() {
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const port = 9380;
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

    await send("Runtime.enable");
    await send("Page.enable");

    // 1. Visit /stores
    console.log("Navigating to https://gocoupon.io/stores ...");
    await send("Page.navigate", { url: "https://gocoupon.io/stores" });
    await new Promise(r => setTimeout(r, 4500));

    const storesShot = await send("Page.captureScreenshot", { format: "png" });
    if (storesShot?.data) {
      fs.writeFileSync(path.join(ARTIFACTS_DIR, "stores_page_final.png"), Buffer.from(storesShot.data, "base64"));
      console.log("Saved stores_page_final.png");
    }

    const storesDom = await send("Runtime.evaluate", {
      expression: `
        (() => {
          return {
            title: document.title,
            bodyHeight: document.body.scrollHeight,
            h1: document.querySelector("h1")?.innerText || "",
            h2: document.querySelector("h2")?.innerText || "",
            h3Count: document.querySelectorAll("h3").length,
            visibleTextSnippet: document.body.innerText.slice(0, 150).replace(/\\s+/g, ' ')
          };
        })()
      `,
      returnByValue: true
    });
    console.log("Stores DOM:", JSON.stringify(storesDom.result.value, null, 2));

    // 2. Visit homepage
    console.log("Navigating to https://gocoupon.io/ ...");
    await send("Page.navigate", { url: "https://gocoupon.io/" });
    await new Promise(r => setTimeout(r, 4000));

    const homeShot1 = await send("Page.captureScreenshot", { format: "png" });
    if (homeShot1?.data) {
      fs.writeFileSync(path.join(ARTIFACTS_DIR, "homepage_top_final.png"), Buffer.from(homeShot1.data, "base64"));
      console.log("Saved homepage_top_final.png");
    }

    await send("Runtime.evaluate", { expression: `window.scrollTo(0, 600)` });
    await new Promise(r => setTimeout(r, 600));

    const homeShot2 = await send("Page.captureScreenshot", { format: "png" });
    if (homeShot2?.data) {
      fs.writeFileSync(path.join(ARTIFACTS_DIR, "homepage_mid_final.png"), Buffer.from(homeShot2.data, "base64"));
      console.log("Saved homepage_mid_final.png");
    }

    await send("Runtime.evaluate", { expression: `window.scrollTo(0, 1400)` });
    await new Promise(r => setTimeout(r, 600));

    const homeShot3 = await send("Page.captureScreenshot", { format: "png" });
    if (homeShot3?.data) {
      fs.writeFileSync(path.join(ARTIFACTS_DIR, "homepage_lower_final.png"), Buffer.from(homeShot3.data, "base64"));
      console.log("Saved homepage_lower_final.png");
    }

    const homeDom = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const sections = Array.from(document.querySelectorAll("main > section"));
          return {
            totalSections: sections.length,
            sections: sections.map((s, i) => ({
              idx: i,
              id: s.id || null,
              h2: s.querySelector("h1, h2")?.innerText?.slice(0, 35) || "",
              height: Math.round(s.getBoundingClientRect().height)
            }))
          };
        })()
      `,
      returnByValue: true
    });
    console.log("Homepage DOM:", JSON.stringify(homeDom.result.value, null, 2));

    ws.close();
  } finally {
    chromeProc.kill("SIGKILL");
  }
}

run().catch(console.error);
