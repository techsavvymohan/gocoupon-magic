import { spawn } from "child_process";

async function testStoresReact() {
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const port = 9385;
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
        consoleLogs.push({ type: d.params.type, args: d.params.args.map(a => a.value ?? a.description) });
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

    console.log("Navigating to https://gocoupon.io/stores ...");
    await send("Page.navigate", { url: "https://gocoupon.io/stores" });
    await new Promise(r => setTimeout(r, 5000));

    const clientCheck = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const searchInput = document.querySelector('input[name="storeSearch"]');
          const storeCards = document.querySelectorAll('.group\\/search, [aria-label*="Copy coupon code"]');
          const categoryButtons = document.querySelectorAll('button');
          return {
            hasSearchInput: !!searchInput,
            copyButtonsCount: document.querySelectorAll('[aria-label*="Copy coupon code"]').length,
            categoryButtonsCount: categoryButtons.length,
            bodySnippet: document.body.innerText.slice(0, 300).replace(/\\s+/g, ' ')
          };
        })()
      `,
      returnByValue: true
    });

    console.log("React Client Check on /stores:", JSON.stringify(clientCheck.result?.value, null, 2));
    console.log("Console Errors:", JSON.stringify(consoleLogs.filter(c => c.type === "error"), null, 2));
    console.log("Script Exceptions:", JSON.stringify(exceptions, null, 2));

    ws.close();
  } finally {
    chromeProc.kill("SIGKILL");
  }
}

testStoresReact().catch(console.error);
