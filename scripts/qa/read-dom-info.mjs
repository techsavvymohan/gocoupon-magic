async function main() {
  const listRes = await fetch("http://127.0.0.1:9222/json/list");
  const tabs = await listRes.json();
  const pageTab = tabs.find(t => t.id === "7DBAF1D90FAB2F413EB3B1B938977F3B" || t.url?.includes("gocoupon.io/stores"));
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const pending = new Map();
  const logs = [];
  const errors = [];

  ws.onmessage = (evt) => {
    const d = JSON.parse(evt.data);
    if (d.id && pending.has(d.id)) {
      const res = pending.get(d.id);
      pending.delete(d.id);
      res(d.result);
    }
    if (d.method === "Runtime.consoleAPICalled") {
      logs.push({ type: d.params.type, text: d.params.args.map(a => a.value ?? a.description).join(" ") });
    }
    if (d.method === "Runtime.exceptionThrown") {
      errors.push(d.params.exceptionDetails);
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

  // Read current DOM immediately
  const domInfo = await send("Runtime.evaluate", {
    expression: `
      (() => {
        const root = document.getElementById("root");
        const loader = document.getElementById("site-loader");
        return {
          title: document.title,
          url: window.location.href,
          hasRoot: !!root,
          rootLength: root ? root.innerHTML.length : 0,
          rootSnippet: root ? root.innerHTML.slice(0, 300) : null,
          hasLoader: !!loader,
          loaderDisplay: loader ? window.getComputedStyle(loader).display : null,
          bodyHtml: document.body.innerHTML.slice(0, 400),
          headScripts: Array.from(document.querySelectorAll("script")).map(s => s.src || s.innerText.slice(0, 50))
        };
      })()
    `,
    returnByValue: true
  });

  console.log("DOM INFO:", JSON.stringify(domInfo.result?.value, null, 2));
  console.log("LOGS:", logs);
  console.log("ERRORS:", JSON.stringify(errors, null, 2));

  ws.close();
}

main().catch(console.error);
