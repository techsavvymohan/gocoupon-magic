import { spawn } from "child_process";

async function main() {
  const res = await fetch("https://gocoupon.io/stores");
  console.log("HTTP status:", res.status);
  const html = await res.text();
  console.log("HTML length:", html.length);
  const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m => m[1]);
  console.log("Script src attributes in HTML:", scripts);

  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const port = 9386;
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
    const consoleLogs = [];
    const exceptions = [];

    ws.onmessage = (evt) => {
      const d = JSON.parse(evt.data);
      if (d.id && pending.has(d.id)) {
        const res = pending.get(d.id);
        pending.delete(d.id);
        res(d.result);
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

    await send("Runtime.enable");
    await send("Page.enable");

    await send("Page.navigate", { url: "https://gocoupon.io/stores" });
    await new Promise(r => setTimeout(r, 6000));

    const evalResult = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const root = document.getElementById("root");
          return {
            title: document.title,
            rootChildCount: root ? root.children.length : 0,
            rootFirstTag: root && root.children[0] ? root.children[0].tagName : null,
            hasArticle: !!document.querySelector("article"),
            hasSearchInput: !!document.querySelector('input[name="storeSearch"]'),
            h1Text: document.querySelector("h1") ? document.querySelector("h1").innerText : null,
            visibleText: document.body.innerText.substring(0, 500)
          };
        })()
      `,
      returnByValue: true
    });

    console.log("EVAL RESULT:", JSON.stringify(evalResult, null, 2));
    console.log("CONSOLE LOGS:", consoleLogs);
    console.log("EXCEPTIONS:", JSON.stringify(exceptions, null, 2));

    ws.close();
  } finally {
    chromeProc.kill("SIGKILL");
  }
}

main().catch(console.error);
