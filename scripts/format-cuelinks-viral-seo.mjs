import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { formatViralSeoDeal } from "./sync-cuelinks-live.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const liveDealsPath = path.join(projectRoot, "src/data/live-deals.json");

if (!fs.existsSync(liveDealsPath)) {
  console.error("live-deals.json not found!");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(liveDealsPath, "utf-8"));
let updatedCount = 0;

if (Array.isArray(data.deals)) {
  for (const deal of data.deals) {
    // Only format Cuelinks deals (or deals without existing special campaign prefix)
    const isCuelinks = deal.source === "cuelinks" || String(deal.id).startsWith("cue_");
    if (!isCuelinks && String(deal.id).startsWith("ac-")) {
      // Retain featured deals structure while ensuring viral seo keywords exist
      if (!deal.seoKeywords) {
        deal.seoKeywords = [
          `${deal.storeName.toLowerCase()} coupon code`,
          `coupon code for ${deal.storeName.toLowerCase()}`,
          `${deal.storeName.toLowerCase()} promo code`,
          `${deal.storeName.toLowerCase()} discount code`,
          deal.code ? `${deal.code.toLowerCase()} coupon code` : null,
        ].filter(Boolean);
      }
      continue;
    }

    const viral = formatViralSeoDeal(
      deal.storeName,
      deal.code,
      deal.discount,
      deal.title,
      deal.terms
    );

    deal.title = viral.title;
    deal.terms = viral.terms;
    deal.seoKeywords = viral.seoKeywords;
    deal.directAnswer = viral.directAnswer;
    updatedCount++;
  }
}

data.updatedAt = new Date().toISOString();
fs.writeFileSync(liveDealsPath, JSON.stringify(data, null, 2), "utf-8");
console.log(`Successfully formatted ${updatedCount} Cuelinks deals into Viral SEO format in src/data/live-deals.json!`);
