import { spawn } from "child_process";

async function main() {
  const chromeProc = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
    "--headless=new",
    "--remote-debugging-port=9389",
    "--window-size=1536,900",
    "--disable-gpu",
    "--no-sandbox",
    "about:blank"
  ]);

  await new Promise(r => setTimeout(r, 2000));
  try {
    const listRes = await fetch("http://localhost:9389/json/list");
    const tabs = await listRes.json();
    const pageTab = tabs.find(t => t.type === "page" && !t.url.startsWith("chrome-extension://"));
    if (!pageTab) throw new Error("No page tab found! Tabs: " + JSON.stringify(tabs));
    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    const pending = new Map();
    const failedRequests = [];
    const consoleLogs = [];
    const exceptions = [];

    ws.onmessage = (evt) => {
      const d = JSON.parse(evt.data);
      if (d.id && pending.has(d.id)) {
        const res = pending.get(d.id);
        pending.delete(d.id);
        res(d.result);
      }
      if (d.method === "Network.loadingFailed") {
        failedRequests.push({ url: d.params.requestId, error: d.params.errorText });
      }
      if (d.method === "Runtime.consoleAPICalled") {
        consoleLogs.push({ type: d.params.type, text: d.params.args.map(a => a.value ?? a.description).join(" ") });
      }
      if (d.method === "Runtime.exceptionThrown") {
        exceptions.push(d.params.exceptionDetails);
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
    await send("Network.enable");

    console.log("Navigating to https://gocoupon.io/stores...");
    await send("Page.navigate", { url: "https://gocoupon.io/stores" });

    // Wait for load
    await new Promise(r => setTimeout(r, 6000));

    const pageState = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const scripts = Array.from(document.querySelectorAll('script')).map(s => ({
            src: s.src,
            type: s.type,
            async: s.async,
            defer: s.defer
          }));
          return {
            url: window.location.href,
            title: document.title,
            scripts: scripts,
            hasWindowVite: !!window.__vite_plugin_react_preamble_installed__,
            hasRoot: !!document.getElementById('root'),
            rootHtmlStart: document.getElementById('root')?.innerHTML.slice(0, 150),
            bodyChildTags: Array.from(document.body.children).map(c => c.tagName + (c.id ? '#' + c.id : ''))
          };
        })()
      `,
      returnByValue: true
    });

    const importCheck = await send("Runtime.evaluate", {
      expression: `
        (async () => {
          try {
            const mod = await import('/assets/index-08KgxWb3.js');
            return { success: true, keys: Object.keys(mod) };
          } catch (err) {
            return { success: false, error: err.message, stack: err.stack };
          }
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });

    console.log("DYNAMIC IMPORT CHECK:", JSON.stringify(importCheck.result?.value, null, 2));

    console.log("PAGE STATE:", JSON.stringify(pageState.result?.value, null, 2));
    console.log("CONSOLE LOGS:", consoleLogs);
    console.log("EXCEPTIONS:", JSON.stringify(exceptions, null, 2));
    console.log("FAILED REQS:", failedRequests);

    ws.close();
  } finally {
    chromeProc.kill("SIGKILL");
  }
}

main().catch(console.error);
