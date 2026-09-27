import fs from "node:fs";
import path from "node:path";

const distDir = path.resolve("dist");
const files = fs.readdirSync(distDir).filter(f => f.endsWith(".html"));

console.log("=== TITLES OVER 58 CHARS ===");
let titleCount = 0;
for (const f of files) {
  const html = fs.readFileSync(path.join(distDir, f), "utf8");
  const titleM = html.match(/<title>(.*?)<\/title>/i);
  if (titleM && titleM[1].length > 58) {
    console.log(`[${titleM[1].length} chars] ${f}: "${titleM[1]}"`);
    titleCount++;
  }
}
console.log(`Total titles > 58 chars: ${titleCount}`);

console.log("\n=== META DESCRIPTIONS OVER 158 CHARS ===");
let descCount = 0;
for (const f of files) {
  const html = fs.readFileSync(path.join(distDir, f), "utf8");
  const descM = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  if (descM && descM[1].length > 158) {
    console.log(`[${descM[1].length} chars] ${f}: "${descM[1]}"`);
    descCount++;
  }
}
console.log(`Total descriptions > 158 chars: ${descCount}`);
