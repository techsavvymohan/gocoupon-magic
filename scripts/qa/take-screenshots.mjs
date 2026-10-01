import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const ARTIFACTS_DIR = "C:\\Users\\Zarvis\\.gemini\\antigravity-ide\\brain\\e42be863-8fda-4adb-b8dc-1ae9c01b0e20";

async function snap(url, outputName, scrollY = 0) {
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const port = 9350;
  const chromeProc = spawn(chromePath, [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    "--window-size=1536,900",
    "--disable-gpu",
    "--no-sandbox",
    "--run-all-compositor-stages-before-draw",
    "about:blank"
  ]);

  await new Promise(r => setTimeout(r, 1500));

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

    await send("Page.enable");
    await send("Runtime.enable");

    console.log(`Navigating to ${url}...`);
    await send("Page.navigate", { url });
    await new Promise(r => setTimeout(r, 4000));

    if (scrollY > 0) {
      await send("Runtime.evaluate", { expression: `window.scrollTo(0, ${scrollY})` });
      await new Promise(r => setTimeout(r, 800));
    }

    const shot = await send("Page.captureScreenshot", { format: "png" });
    if (shot?.data) {
      const outPath = path.join(ARTIFACTS_DIR, outputName);
      fs.writeFileSync(outPath, Buffer.from(shot.data, "base64"));
      console.log(`Saved screenshot ${outputName} (${Math.round(shot.data.length / 1024)} KB)`);
    }

    const domInfo = await send("Runtime.evaluate", {
      expression: `
        (() => {
          return {
            title: document.title,
            bodyHeight: document.body.scrollHeight,
            rootChildCount: document.getElementById("root")?.children?.length || 0,
            sampleHeadings: Array.from(document.querySelectorAll("h1, h2, h3")).slice(0, 6).map(h => h.innerText.trim())
          };
        })()
      `,
      returnByValue: true
    });
    console.log("DOM Summary:", JSON.stringify(domInfo.result?.value, null, 2));

    ws.close();
  } finally {
    chromeProc.kill("SIGKILL");
  }
}

async function run() {
  // 1. Screenshot stores page
  await snap("https://gocoupon.io/stores", "stores_verified_clean.png", 0);

  // 2. Screenshot homepage top
  await snap("https://gocoupon.io/", "home_top_clean.png", 0);

  // 3. Screenshot homepage middle (around Stats and Deals)
  await snap("https://gocoupon.io/", "home_mid_clean.png", 700);

  // 4. Screenshot homepage lower middle (ExtensionShowcase and HowItWorks)
  await snap("https://gocoupon.io/", "home_lower_clean.png", 1500);
}

run().catch(console.error);
