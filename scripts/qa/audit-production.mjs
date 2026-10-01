import fs from "fs";

async function main() {
  const listRes = await fetch("http://127.0.0.1:9222/json/list");
  const tabs = await listRes.json();
  const pageTab = tabs.find(t => t.id === "7DBAF1D90FAB2F413EB3B1B938977F3B" || t.url?.includes("gocoupon.io"));
  if (!pageTab) {
    console.error("No active page tab found!");
    return;
  }

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

  await send("Page.enable");
  await send("Runtime.enable");

  const artifactDir = "C:/Users/Zarvis/.gemini/antigravity-ide/brain/e42be863-8fda-4adb-b8dc-1ae9c01b0e20";

  // 1. Audit /stores page
  console.log("Navigating to https://gocoupon.io/stores ...");
  await send("Page.navigate", { url: "https://gocoupon.io/stores" });
  await new Promise(r => setTimeout(r, 4500));

  const storesTop = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${artifactDir}/audit_prod_stores_top.png`, Buffer.from(storesTop.data, "base64"));
  console.log("Saved audit_prod_stores_top.png");

  await send("Runtime.evaluate", { expression: "window.scrollBy(0, 650)" });
  await new Promise(r => setTimeout(r, 800));
  const storesCards = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${artifactDir}/audit_prod_stores_cards.png`, Buffer.from(storesCards.data, "base64"));
  console.log("Saved audit_prod_stores_cards.png");

  // 2. Audit homepage
  console.log("Navigating to https://gocoupon.io/ ...");
  await send("Page.navigate", { url: "https://gocoupon.io/" });
  await new Promise(r => setTimeout(r, 4500));

  // Screenshot 1: Top (Hero + Marquee + Stats)
  await send("Runtime.evaluate", { expression: "window.scrollTo(0, 0)" });
  await new Promise(r => setTimeout(r, 800));
  const hpTop = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${artifactDir}/audit_prod_hp_top.png`, Buffer.from(hpTop.data, "base64"));
  console.log("Saved audit_prod_hp_top.png");

  // Screenshot 2: Deals Carousel & Extension Showcase
  await send("Runtime.evaluate", { expression: "window.scrollTo(0, 750)" });
  await new Promise(r => setTimeout(r, 800));
  const hpDeals = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${artifactDir}/audit_prod_hp_deals_extension.png`, Buffer.from(hpDeals.data, "base64"));
  console.log("Saved audit_prod_hp_deals_extension.png");

  // Screenshot 3: How it Works & Guides
  await send("Runtime.evaluate", { expression: "window.scrollTo(0, 1950)" });
  await new Promise(r => setTimeout(r, 800));
  const hpHow = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${artifactDir}/audit_prod_hp_how_it_works.png`, Buffer.from(hpHow.data, "base64"));
  console.log("Saved audit_prod_hp_how_it_works.png");

  // Screenshot 4: Expense Saviour & Features
  await send("Runtime.evaluate", { expression: "window.scrollTo(0, 3450)" });
  await new Promise(r => setTimeout(r, 800));
  const hpSaviour = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${artifactDir}/audit_prod_hp_expense_saviour.png`, Buffer.from(hpSaviour.data, "base64"));
  console.log("Saved audit_prod_hp_expense_saviour.png");

  // Screenshot 5: FAQ & Blog
  await send("Runtime.evaluate", { expression: "window.scrollTo(0, 5200)" });
  await new Promise(r => setTimeout(r, 800));
  const hpFaq = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${artifactDir}/audit_prod_hp_faq_blog.png`, Buffer.from(hpFaq.data, "base64"));
  console.log("Saved audit_prod_hp_faq_blog.png");

  // Screenshot 6: CTA & Clean Footer (no duplicate CTA void)
  await send("Runtime.evaluate", { expression: "window.scrollTo(0, 6800)" });
  await new Promise(r => setTimeout(r, 800));
  const hpCta = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${artifactDir}/audit_prod_hp_cta_footer.png`, Buffer.from(hpCta.data, "base64"));
  console.log("Saved audit_prod_hp_cta_footer.png");

  ws.close();
}

main().catch(console.error);
