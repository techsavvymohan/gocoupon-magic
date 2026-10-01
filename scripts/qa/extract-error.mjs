async function main() {
  const listRes = await fetch("http://127.0.0.1:9222/json/list");
  const tabs = await listRes.json();
  const pageTab = tabs.find(t => t.id === "7DBAF1D90FAB2F413EB3B1B938977F3B");
  if (!pageTab) return;

  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const send = (m, p = {}) => new Promise(res => {
    const myId = id++;
    const l = e => {
      const d = JSON.parse(e.data);
      if (d.id === myId) {
        ws.removeEventListener("message", l);
        res(d.result);
      }
    };
    ws.addEventListener("message", l);
    ws.send(JSON.stringify({ id: myId, method: m, params: p }));
  });

  await send("Runtime.enable");

  // Let's get the React component tree or error message from the DOM or router
  const res = await send("Runtime.evaluate", {
    expression: `
      (() => {
        // Find React fiber to read props or error
        function findReactFiber(el) {
          for (const key in el) {
            if (key.startsWith('__reactFiber$')) return el[key];
          }
          return null;
        }

        const heading = document.querySelector('h1');
        let fiber = heading ? findReactFiber(heading) : null;
        let errorObj = null;
        while (fiber) {
          if (fiber.memoizedProps?.error) {
            errorObj = {
              message: fiber.memoizedProps.error.message,
              stack: fiber.memoizedProps.error.stack,
              name: fiber.memoizedProps.error.name
            };
            break;
          }
          fiber = fiber.return;
        }

        return {
          errorFromFiber: errorObj,
          location: window.location.href
        };
      })()
    `,
    returnByValue: true
  });

  console.log("ERROR EXTRACTED FROM FIBER:", JSON.stringify(res.result?.value, null, 2));

  ws.close();
}

main().catch(console.error);
