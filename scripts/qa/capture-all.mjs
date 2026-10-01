import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const ARTIFACTS_DIR = "C:\\Users\\Zarvis\\.gemini\\antigravity-ide\\brain\\e42be863-8fda-4adb-b8dc-1ae9c01b0e20";

async function capture() {
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const port = 9360;
  const chromeProc = spawn(chromePath, [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    "--window-size=1536,900",
    "--disable-gpu",
    "--no-sandbox",
    "https://gocoupon.io/stores"
  ]);

  await new Promise(r => setTimeout(r, 4500));

  try {
    const listRes = await fetch(`http://localhost:${port}/json/list`);
    const tabs = await listRes.json();
    const pageTab = tabs.find(t => t.type === "page" && t.url.includes("stores"));
    if (!pageTab) throw new Error("No page tab for stores");

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

    // Capture screenshot of /stores
    const shot1 = await send("Page.captureScreenshot", { format: "png" });
    if (shot1?.data) {
      fs.writeFileSync(path.join(ARTIFACTS_DIR, "stores_live_now.png"), Buffer.from(shot1.data, "base64"));
      console.log("Saved stores_live_now.png");
    }

    // Now navigate to homepage
    await send("Page.navigate", { url: "https://gocoupon.io/" });
    await new Promise(r => setTimeout(r, 4000));

    // Capture homepage top
    const shot2 = await send("Page.captureScreenshot", { format: "png" });
    if (shot2?.data) {
      fs.writeFileSync(path.join(ARTIFACTS_DIR, "homepage_top_now.png"), Buffer.from(shot2.data, "base64"));
      console.log("Saved homepage_top_now.png");
    }

    // Scroll to 650 (deals carousel & stats)
    await send("Runtime.evaluate", { expression: `window.scrollTo(0, 650)` });
    await new Promise(r => setTimeout(r, 600));
    const shot3 = await send("Page.captureScreenshot", { format: "png" });
    if (shot3?.data) {
      fs.writeFileSync(path.join(ARTIFACTS_DIR, "homepage_mid_now.png"), Buffer.from(shot3.data, "base64"));
      console.log("Saved homepage_mid_now.png");
    }

    // Scroll to 1500 (extension showcase & how it works)
    await send("Runtime.evaluate", { expression: `window.scrollTo(0, 1500)` });
    await new Promise(r => setTimeout(r, 600));
    const shot4 = await send("Page.captureScreenshot", { format: "png" });
    if (shot4?.data) {
      fs.writeFileSync(path.join(ARTIFACTS_DIR, "homepage_lower_now.png"), Buffer.from(shot4.data, "base64"));
      console.log("Saved homepage_lower_now.png");
    }

    ws.close();
  } finally {
    chromeProc.kill("SIGKILL");
  }
}

capture().catch(console.error);
