import { spawn } from "child_process";

async function runAudit() {
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const port = 9335;
  const chromeProc = spawn(chromePath, [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    "--window-size=375,812",
    "--disable-gpu",
    "--no-sandbox",
    "https://gocoupon.io/"
  ]);

  await new Promise((r) => setTimeout(r, 2000));

  try {
    const listRes = await fetch(`http://localhost:${port}/json/list`);
    const tabs = await listRes.json();
    const pageTab = tabs.find((t) => t.type === "page" && t.url.includes("gocoupon"));
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
    function sendCommand(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        const handler = (evt) => {
          const data = JSON.parse(evt.data);
          if (data.id === id) {
            ws.removeEventListener("message", handler);
            resolve(data.result);
          }
        };
        ws.addEventListener("message", handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    // Emulate iPhone / standard 375x812 mobile viewport
    await sendCommand("Emulation.setDeviceMetricsOverride", {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true
    });

    await new Promise((r) => setTimeout(r, 2000));

    const auditCode = `
      (() => {
        const vpWidth = window.innerWidth;
        const rootElements = [];
        
        document.querySelectorAll('*').forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.right > vpWidth + 2) {
            const style = window.getComputedStyle(el);
            if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
              rootElements.push({
                tag: el.tagName,
                className: (el.className || '').toString().slice(0, 100),
                width: Math.round(rect.width),
                right: Math.round(rect.right),
                left: Math.round(rect.left),
                text: el.innerText ? el.innerText.slice(0, 40).replace(/\\n/g, ' ') : ''
              });
            }
          }
        });

        // Capture header items specifically
        const header = document.querySelector('header');
        const headerButtons = header ? Array.from(header.querySelectorAll('button, a')).map(b => {
          const r = b.getBoundingClientRect();
          return {
            tag: b.tagName,
            aria: b.getAttribute('aria-label'),
            text: b.innerText?.slice(0, 20),
            rect: { left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), height: Math.round(r.height) },
            visible: r.right <= vpWidth && r.left >= 0
          };
        }) : [];

        // Bottom nav items
        const bottomNav = document.querySelector('nav[aria-label="Mobile Bottom Navigation"]');
        const bottomNavItems = bottomNav ? Array.from(bottomNav.querySelectorAll('a')).map(a => {
          const r = a.getBoundingClientRect();
          return {
            text: a.innerText?.replace(/\\n/g, ' ').trim(),
            rect: { left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width) },
            visible: r.right <= vpWidth && r.left >= 0
          };
        }) : [];

        return {
          viewportWidth: vpWidth,
          docScrollWidth: document.documentElement.scrollWidth,
          bodyScrollWidth: document.body.scrollWidth,
          hasHorizontalScroll: document.documentElement.scrollWidth > vpWidth,
          overflowCount: rootElements.length,
          topOverflowSample: rootElements.slice(0, 10),
          headerButtons,
          bottomNavItems
        };
      })()
    `;

    const evalResult = await sendCommand("Runtime.evaluate", {
      expression: auditCode,
      returnByValue: true
    });

    console.log("=== MOBILE 375PX AUDIT ===");
    console.log(JSON.stringify(evalResult.result.value, null, 2));

    ws.close();
  } finally {
    chromeProc.kill("SIGKILL");
  }
}

runAudit().catch(console.error);
