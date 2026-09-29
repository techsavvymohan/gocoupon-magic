import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const ARTIFACTS_DIR = "C:\\Users\\Zarvis\\.gemini\\antigravity-ide\\brain\\e42be863-8fda-4adb-b8dc-1ae9c01b0e20";

async function runAudit() {
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const port = 9338;
  const chromeProc = spawn(chromePath, [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    "--window-size=1536,900",
    "--disable-gpu",
    "--no-sandbox",
    "about:blank"
  ]);

  await new Promise((r) => setTimeout(r, 2000));

  try {
    const listRes = await fetch(`http://localhost:${port}/json/list`);
    const tabs = await listRes.json();
    const pageTab = tabs.find((t) => t.type === "page");
    if (!pageTab) {
      console.error("Tab not found");
      return;
    }

    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    const pending = new Map();
    const consoleLogs = [];
    const exceptions = [];

    ws.onmessage = (evt) => {
      const data = JSON.parse(evt.data);
      if (data.id && pending.has(data.id)) {
        const resolve = pending.get(data.id);
        pending.delete(data.id);
        resolve(data.result);
      }
      if (data.method === "Runtime.consoleAPICalled") {
        consoleLogs.push({
          type: data.params.type,
          args: data.params.args.map((a) => a.value ?? a.description)
        });
      }
      if (data.method === "Runtime.exceptionThrown") {
        exceptions.push({
          text: data.params.exceptionDetails.text,
          exception: data.params.exceptionDetails.exception?.description || data.params.exceptionDetails.text,
          url: data.params.exceptionDetails.url,
          line: data.params.exceptionDetails.lineNumber
        });
      }
    };

    function sendCommand(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        pending.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await sendCommand("Runtime.enable");
    await sendCommand("Page.enable");

    // ────────────────────────────────────────────────────────
    // AUDIT 1: https://gocoupon.io/stores
    // ────────────────────────────────────────────────────────
    console.log("\n=== AUDITING https://gocoupon.io/stores ===");
    consoleLogs.length = 0;
    exceptions.length = 0;

    await sendCommand("Page.navigate", { url: "https://gocoupon.io/stores" });
    await new Promise((r) => setTimeout(r, 4000));

    const storesAuditCode = `
      (() => {
        const root = document.getElementById("root");
        return {
          title: document.title,
          url: window.location.href,
          bodyHeight: document.body.scrollHeight,
          rootChildCount: root ? root.children.length : 0,
          rootText: root ? root.innerText.slice(0, 300) : "NO ROOT",
          hasError: !!document.querySelector('[data-error], .error-boundary, pre'),
          errorPre: document.querySelector('pre')?.innerText || null
        };
      })()
    `;

    const storesEval = await sendCommand("Runtime.evaluate", {
      expression: storesAuditCode,
      returnByValue: true
    });

    console.log("Stores Page State:", JSON.stringify(storesEval.result.value, null, 2));
    console.log("Stores Page Console Errors:", JSON.stringify(consoleLogs.filter(c => c.type === 'error'), null, 2));
    console.log("Stores Page Exceptions:", JSON.stringify(exceptions, null, 2));

    // Capture screenshot of /stores
    const storesShot = await sendCommand("Page.captureScreenshot", { format: "png" });
    if (storesShot?.data) {
      const shotPath = path.join(ARTIFACTS_DIR, "stores_page_audit.png");
      fs.writeFileSync(shotPath, Buffer.from(storesShot.data, "base64"));
      console.log(`Saved screenshot to ${shotPath}`);
    }

    // ────────────────────────────────────────────────────────
    // AUDIT 2: https://gocoupon.io/ (Homepage Gaps)
    // ────────────────────────────────────────────────────────
    console.log("\n=== AUDITING https://gocoupon.io/ (Homepage Gaps) ===");
    consoleLogs.length = 0;
    exceptions.length = 0;

    await sendCommand("Page.navigate", { url: "https://gocoupon.io/" });
    await new Promise((r) => setTimeout(r, 3500));

    // Scroll down gradually to trigger any lazy loads / suspense
    await sendCommand("Runtime.evaluate", {
      expression: `window.scrollTo(0, 1000);`
    });
    await new Promise((r) => setTimeout(r, 1000));
    await sendCommand("Runtime.evaluate", {
      expression: `window.scrollTo(0, 2500);`
    });
    await new Promise((r) => setTimeout(r, 1000));
    await sendCommand("Runtime.evaluate", {
      expression: `window.scrollTo(0, 0);`
    });
    await new Promise((r) => setTimeout(r, 1000));

    const gapsAuditCode = `
      (() => {
        const sections = Array.from(document.querySelectorAll("main > *"));
        const results = [];
        let prevBottom = 0;

        sections.forEach((sec, idx) => {
          const rect = sec.getBoundingClientRect();
          const comp = window.getComputedStyle(sec);
          const top = rect.top + window.scrollY;
          const bottom = rect.bottom + window.scrollY;
          const gapFromPrev = idx > 0 ? top - prevBottom : 0;

          results.push({
            idx,
            tag: sec.tagName,
            id: sec.id || null,
            className: (sec.className || '').slice(0, 80),
            height: Math.round(rect.height),
            top: Math.round(top),
            bottom: Math.round(bottom),
            gapFromPrev: Math.round(gapFromPrev),
            paddingTop: comp.paddingTop,
            paddingBottom: comp.paddingBottom,
            marginTop: comp.marginTop,
            marginBottom: comp.marginBottom,
            textPreview: (sec.innerText || '').slice(0, 60).replace(/\\s+/g, ' ')
          });
          prevBottom = bottom;
        });

        return {
          totalHeight: document.body.scrollHeight,
          sectionCount: sections.length,
          sections: results
        };
      })()
    `;

    const gapsEval = await sendCommand("Runtime.evaluate", {
      expression: gapsAuditCode,
      returnByValue: true
    });

    console.log("Homepage Sections & Gaps:", JSON.stringify(gapsEval.result.value, null, 2));

    // Capture homepage top screenshot
    const homeShot1 = await sendCommand("Page.captureScreenshot", { format: "png" });
    if (homeShot1?.data) {
      const shotPath = path.join(ARTIFACTS_DIR, "homepage_gap_audit_top.png");
      fs.writeFileSync(shotPath, Buffer.from(homeShot1.data, "base64"));
      console.log(`Saved screenshot to ${shotPath}`);
    }

    // Scroll to middle and capture
    await sendCommand("Runtime.evaluate", { expression: `window.scrollTo(0, 700);` });
    await new Promise((r) => setTimeout(r, 500));
    const homeShot2 = await sendCommand("Page.captureScreenshot", { format: "png" });
    if (homeShot2?.data) {
      const shotPath = path.join(ARTIFACTS_DIR, "homepage_gap_audit_mid1.png");
      fs.writeFileSync(shotPath, Buffer.from(homeShot2.data, "base64"));
      console.log(`Saved screenshot to ${shotPath}`);
    }

    // Scroll further down and capture
    await sendCommand("Runtime.evaluate", { expression: `window.scrollTo(0, 1600);` });
    await new Promise((r) => setTimeout(r, 500));
    const homeShot3 = await sendCommand("Page.captureScreenshot", { format: "png" });
    if (homeShot3?.data) {
      const shotPath = path.join(ARTIFACTS_DIR, "homepage_gap_audit_mid2.png");
      fs.writeFileSync(shotPath, Buffer.from(homeShot3.data, "base64"));
      console.log(`Saved screenshot to ${shotPath}`);
    }

    // Scroll down to 2600 and capture
    await sendCommand("Runtime.evaluate", { expression: `window.scrollTo(0, 2600);` });
    await new Promise((r) => setTimeout(r, 500));
    const homeShot4 = await sendCommand("Page.captureScreenshot", { format: "png" });
    if (homeShot4?.data) {
      const shotPath = path.join(ARTIFACTS_DIR, "homepage_gap_audit_mid3.png");
      fs.writeFileSync(shotPath, Buffer.from(homeShot4.data, "base64"));
      console.log(`Saved screenshot to ${shotPath}`);
    }

    ws.close();
  } finally {
    chromeProc.kill("SIGKILL");
  }
}

runAudit().catch(console.error);
