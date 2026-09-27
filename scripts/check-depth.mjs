import fs from "node:fs";

const stores = [
  "amazon-coupons",
  "flipkart-coupons",
  "myntra-coupons",
  "meesho-coupons",
  "croma-coupons",
  "boat-coupons",
  "tata-cliq-coupons",
  "nykaa-coupons",
];

console.log("=== STORE PAGE CONTENT DEPTH AUDIT ===");
for (const s of stores) {
  const html = fs.readFileSync(`dist/${s}.html`, "utf8");
  const article = html.match(/<article[\s\S]*?<\/article>/i);
  if (article) {
    const text = article[0].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const words = text.split(" ").length;
    const hasTable = article[0].includes("<table");
    const h2Matches = article[0].match(/<h2/gi) || [];
    const h3Matches = article[0].match(/<h3/gi) || [];
    console.log(
      `✓ ${s.padEnd(20)}: ${words} words | Table: ${hasTable ? "YES" : "NO"} | H2s: ${h2Matches.length} | H3s: ${h3Matches.length}`
    );
  }
}

console.log("\n=== 404.HTML AUDIT ===");
const notFoundHtml = fs.readFileSync("dist/404.html", "utf8");
const nfTitle = notFoundHtml.match(/<title>(.*?)<\/title>/i)?.[1];
const nfDesc = notFoundHtml.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1];
const nfRobots = notFoundHtml.match(/<meta\s+name="robots"\s+content="([^"]*)"/i)?.[1];
console.log(`Title (${nfTitle?.length} chars): "${nfTitle}"`);
console.log(`Desc  (${nfDesc?.length} chars): "${nfDesc}"`);
console.log(`Robots: "${nfRobots}"`);
