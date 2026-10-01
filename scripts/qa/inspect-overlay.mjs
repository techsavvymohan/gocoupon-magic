import { spawn } from "child_process";

async function main() {
  const chromeProc = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
    "--headless=new",
    "--remote-debugging-port=9388",
    "--window-size=1536,900",
    "--disable-gpu",
    "--no-sandbox",
    "about:blank"
  ]);

  await new Promise(r => setTimeout(r, 2000));
  try {
    const listRes = await fetch("http://localhost:9388/json/list");
    const tabs = await listRes.json();
    const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
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

    await send("Page.enable");
    await send("Runtime.enable");
    await send("Page.navigate", { url: "https://gocoupon.io/stores" });
    await new Promise(r => setTimeout(r, 5000));

    const inspect = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const elAtPoint = document.elementFromPoint(500, 300);
          const bodyStyle = window.getComputedStyle(document.body);
          const rootStyle = window.getComputedStyle(document.getElementById('root') || document.body);
          const allEls = Array.from(document.querySelectorAll('*'));
          const fixedEls = allEls.filter(el => {
            const s = window.getComputedStyle(el);
            return (s.position === 'fixed' || s.position === 'absolute') && (parseInt(s.zIndex) > 10 || s.inset === '0px' || s.width === '100%');
          }).map(el => ({
            tag: el.tagName,
            id: el.id,
            className: el.className,
            position: window.getComputedStyle(el).position,
            zIndex: window.getComputedStyle(el).zIndex,
            width: el.offsetWidth,
            height: el.offsetHeight,
            background: window.getComputedStyle(el).backgroundColor,
            opacity: window.getComputedStyle(el).opacity,
            display: window.getComputedStyle(el).display,
            visibility: window.getComputedStyle(el).visibility
          }));

          return {
            elAtPoint: elAtPoint ? { tag: elAtPoint.tagName, id: elAtPoint.id, class: elAtPoint.className, text: elAtPoint.innerText?.slice(0, 50) } : null,
            bodyBg: bodyStyle.backgroundColor,
            bodyColor: bodyStyle.color,
            bodyOpacity: bodyStyle.opacity,
            rootBg: rootStyle.backgroundColor,
            rootOpacity: rootStyle.opacity,
            fixedEls: fixedEls
          };
        })()
      `,
      returnByValue: true
    });

    console.log("INSPECT RESULT:", JSON.stringify(inspect.result?.value, null, 2));

    ws.close();
  } finally {
    chromeProc.kill("SIGKILL");
  }
}

main().catch(console.error);
