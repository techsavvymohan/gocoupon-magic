import { spawn } from "child_process";

async function debugStores() {
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const port = 9339;
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
    if (!pageTab) throw new Error("No page tab");

    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    const pending = new Map();
    const networkFailures = [];
    const scriptErrors = [];
    const allConsole = [];

    ws.onmessage = (evt) => {
      const data = JSON.parse(evt.data);
      if (data.id && pending.has(data.id)) {
        const resolve = pending.get(data.id);
        pending.delete(data.id);
        resolve(data.result);
      }
      if (data.method === "Network.loadingFailed") {
        networkFailures.push(data.params);
      }
      if (data.method === "Network.responseReceived") {
        if (data.params.response.status >= 400) {
          networkFailures.push({
            url: data.params.response.url,
            status: data.params.response.status,
            statusText: data.params.response.statusText
          });
        }
      }
      if (data.method === "Runtime.exceptionThrown") {
        scriptErrors.push({
          text: data.params.exceptionDetails.text,
          exception: data.params.exceptionDetails.exception,
          stack: data.params.exceptionDetails.stackTrace
        });
      }
      if (data.method === "Runtime.consoleAPICalled") {
        allConsole.push({
          type: data.params.type,
          args: data.params.args.map(a => a.value ?? a.description)
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

    await sendCommand("Network.enable");
    await sendCommand("Runtime.enable");
    await sendCommand("Page.enable");

    console.log("Navigating to https://gocoupon.io/stores ...");
    await sendCommand("Page.navigate", { url: "https://gocoupon.io/stores" });

    // Wait 7 seconds
    await new Promise((r) => setTimeout(r, 7000));

    const checkDom = await sendCommand("Runtime.evaluate", {
      expression: `(() => {
        const siteLoader = document.getElementById("site-loader");
        const root = document.getElementById("root");
        return {
          siteLoaderExists: !!siteLoader,
          siteLoaderComputedDisplay: siteLoader ? window.getComputedStyle(siteLoader).display : null,
          rootInnerHTML: root ? root.innerHTML.slice(0, 500) : null,
          bodyChildren: Array.from(document.body.children).map(c => ({ id: c.id, tag: c.tagName, className: c.className }))
        };
      })()`,
      returnByValue: true
    });

    console.log("DOM State:", JSON.stringify(checkDom.result.value, null, 2));
    console.log("Network Failures (>=400):", JSON.stringify(networkFailures, null, 2));
    console.log("Script Exceptions:", JSON.stringify(scriptErrors, null, 2));
    console.log("Console Logs:", JSON.stringify(allConsole, null, 2));

    ws.close();
  } finally {
    chromeProc.kill("SIGKILL");
  }
}

debugStores().catch(console.error);
