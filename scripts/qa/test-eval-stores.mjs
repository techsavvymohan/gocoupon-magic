import { spawn } from "child_process";

async function testEval() {
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const port = 9341;
  const chromeProc = spawn(chromePath, [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    "--no-sandbox",
    "about:blank"
  ]);

  await new Promise(r => setTimeout(r, 2000));
  try {
    const listRes = await fetch(`http://localhost:${port}/json/list`);
    const tabs = await listRes.json();
    const pageTab = tabs.find(t => t.type === "page");
    if (!pageTab) {
      console.log("No tab found. All tabs:", tabs);
      return;
    }
    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);
    let id = 1;
    const eventHandlers = new Map();
    const pending = new Map();

    ws.onmessage = (evt) => {
      const d = JSON.parse(evt.data);
      if (d.id && pending.has(d.id)) {
        const res = pending.get(d.id);
        pending.delete(d.id);
        res(d.result);
      }
      if (d.method && eventHandlers.has(d.method)) {
        eventHandlers.get(d.method)(d.params);
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

    const loadPromise = new Promise(resolve => {
      eventHandlers.set("Page.loadEventFired", resolve);
    });

    console.log("Navigating to https://gocoupon.io/stores ...");
    await send("Page.navigate", { url: "https://gocoupon.io/stores" });
    await loadPromise;
    console.log("Page loaded. Waiting 3s for React/hydrations...");
    await new Promise(r => setTimeout(r, 3000));

    // 1. Get console errors and performance logs
    const result = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const scripts = Array.from(document.querySelectorAll("script")).map(s => s.src || s.innerHTML.slice(0, 50));
          const root = document.getElementById("root");
          return {
            scripts,
            windowError: window.__lastError || null,
            rootHtml: root ? root.innerHTML.slice(0, 300) : "NO ROOT"
          };
        })()
      `,
      returnByValue: true
    });
    console.log("Page info:", JSON.stringify(result.result.value, null, 2));

    // 2. Try importing the store lazy bundle or router
    const evalDynamic = await send("Runtime.evaluate", {
      expression: `
        (async () => {
          try {
            // Find script src
            const mainScript = document.querySelector('script[src*="index-"]')?.src;
            console.log("Main script:", mainScript);
            const m = await import(mainScript);
            return { success: true, keys: Object.keys(m) };
          } catch (e) {
            return { error: e.message, stack: e.stack };
          }
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });
    console.log("Main script dynamic import:", JSON.stringify(evalDynamic.result.value, null, 2));

    ws.close();
  } finally {
    chromeProc.kill("SIGKILL");
  }
}

testEval().catch(console.error);
