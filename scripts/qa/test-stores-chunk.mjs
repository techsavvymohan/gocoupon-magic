import { spawn } from "child_process";

async function testStoresChunk() {
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const port = 9342;
  const chromeProc = spawn(chromePath, [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    "--no-sandbox",
    "https://gocoupon.io/stores"
  ]);

  await new Promise(r => setTimeout(r, 4000));
  try {
    const listRes = await fetch(`http://localhost:${port}/json/list`);
    const tabs = await listRes.json();
    const pageTab = tabs.find(t => t.type === "page" && t.url.includes("stores"));
    if (!pageTab) {
      console.log("No tab found. All tabs:", tabs);
      return;
    }
    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);
    let id = 1;
    function send(method, params = {}) {
      return new Promise(res => {
        const myId = id++;
        const h = (evt) => {
          const d = JSON.parse(evt.data);
          if (d.id === myId) {
            ws.removeEventListener("message", h);
            res(d.result);
          }
        };
        ws.addEventListener("message", h);
        ws.send(JSON.stringify({ id: myId, method, params }));
      });
    }

    const res = await send("Runtime.evaluate", {
      expression: `
        (async () => {
          try {
            const m = await import("/assets/page-stores-dg0BOHMT.js");
            return { success: true, exports: Object.keys(m) };
          } catch (e) {
            return { error: e.message, stack: e.stack };
          }
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });

    console.log("Import /assets/page-stores-dg0BOHMT.js result:", JSON.stringify(res.result.value, null, 2));

    // Also check what TanStack router state is on window if available
    const routerCheck = await send("Runtime.evaluate", {
      expression: `
        (() => {
          // Check for any uncaught errors in window
          const entries = performance.getEntriesByType("resource");
          const failedResources = entries.filter(e => e.responseStatus && e.responseStatus >= 400).map(e => ({ name: e.name, status: e.responseStatus }));
          return {
            totalResources: entries.length,
            failedResources,
            bodyHtmlSnippet: document.body.innerHTML.slice(0, 400),
            title: document.title
          };
        })()
      `,
      returnByValue: true
    });
    console.log("Router/Resource check:", JSON.stringify(routerCheck.result.value, null, 2));

    ws.close();
  } finally {
    chromeProc.kill("SIGKILL");
  }
}

testStoresChunk().catch(console.error);
