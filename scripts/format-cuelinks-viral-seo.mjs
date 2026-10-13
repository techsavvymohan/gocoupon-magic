import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const liveDealsPath = path.join(projectRoot, "src/data/live-deals.json");

if (!fs.existsSync(liveDealsPath)) {
  console.error("live-deals.json not found!");
  process.exit(1);
}

function cleanHtmlEntities(str) {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[\uFFFD\u00BF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanStoreName(name) {
  if (!name) return "Store";
  let s = cleanHtmlEntities(name).trim();
  if (s === s.toLowerCase() || (s === s.toUpperCase() && s.length > 4)) {
    s = s
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }
  return s;
}

function extractCleanDetail(rawTitle, storeName, discount) {
  let text = cleanHtmlEntities(rawTitle || "");
  const store = cleanStoreName(storeName);

  // 1. Strip raw affiliate campaign prefix junk
  text = text.replace(/^(?:[A-Z0-9]{2,}\s*)?Campaign[-_\s:]+/i, "");
  text = text.replace(/^[A-Z]{2,4}\s*Campaign[-_\s:]+/i, "");
  text = text.replace(/^QR\s*Campaign[-_\s:]*/i, "");

  // Strip international locale tokens (e.g. "Cambodia (KH)/(EN)-", "Malaysia (MY)/ (EN) - ", "Japan (JP)EN-")
  text = text.replace(/(?:[A-Za-z\s]+)?\([A-Z]{2}\)\s*(?:\/\s*\([A-Z]{2}\))?(?:[A-Z]{2})?[-_\s:]*/g, " ");
  text = text.replace(
    /[-_\s/]*(?:\([A-Z]{2}\)|\b(?:KH|EN|MY|JP|ZH|VN|IN|PK|BD|AU|IE|MT|TR|RS|NL|DE|GR|TH|SG|RO|HU|IT|US|GB|UK|CA|AE)\b)(?:\/[-_\s]*(?:\([A-Z]{2}\)|\b(?:KH|EN|MY|JP|ZH|VN|IN|PK|BD|AU|IE|MT|TR|RS|NL|DE|GR|TH|SG|RO|HU|IT|US|GB|UK|CA|AE)\b))*[-_\s:]*/g,
    " "
  );
  text = text.replace(/\b(?:APAC|EMEA|LATAM|NA)\s+(?:Winter|Summer|Spring|Fall|Phase\s*\d*)[-_\s:]*/gi, "");
  text = text.replace(/\bPromocode\b/gi, "");

  // 2. Strip repeated store name from the start
  const sRegex = new RegExp("^" + store.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&") + "[:\\s–-]+", "i");
  text = text.replace(sRegex, "");

  // 3. Strip generic marketing fluff prefixes
  text = text.replace(
    /^(?:FLASH SALE|SPECIAL OFFER|LIMITED TIME OFFER|EXCLUSIVE OFFER|BEST DEAL|ENJOY|SAVE|GET|SCORE|UNLOCK|GRAB|HOT DEAL)[:\s–-]+/i,
    ""
  );

  // 4. Strip redundant discount prefix if it matches the discount string
  if (discount) {
    const num = discount.match(/([0-9]+%?)/);
    if (num) {
      const discRegex = new RegExp("^(?:up to\\s*)?" + num[1] + "\\s*(?:off|discount|savings)[:\\s–-]+", "i");
      text = text.replace(discRegex, "");
    }
  }

  // 5. Clean punctuation & non-latin garbage
  text = text
    .replace(/[?*]+/g, "")
    .replace(/^[-–:,\s|/]+|[-–:,\s|/]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!text || text.length < 3) {
    text = discount ? `${discount} Sitewide Savings` : "Verified Discount Offer";
  } else {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  return text;
}

export function formatSeoCouponDeal(storeName, rawCode, discount, rawTitle, rawDesc) {
  const store = cleanStoreName(storeName);
  const hasCode =
    Boolean(rawCode) &&
    rawCode.length > 1 &&
    !/^(deal|none|na|null|undefined|deal activated|activateoffer)$/i.test(rawCode);
  const code = hasCode ? rawCode.toUpperCase().trim() : "";
  const detail = extractCleanDetail(rawTitle, store, discount);
  const disc = discount && discount !== "Verified Deal" ? discount : "";

  let viralTitle = "";
  if (code) {
    if (disc) {
      viralTitle = `${store} Coupon Code: ${code} – ${disc} (${detail})`;
    } else {
      viralTitle = `${store} Coupon Code: ${code} – ${detail}`;
    }
  } else {
    if (disc) {
      viralTitle = `${store} Coupon Code: ${disc} – ${detail}`;
    } else {
      viralTitle = `${store} Coupon Code & Promo: ${detail}`;
    }
  }

  // Cap at 95 characters for search engines & UI cleanliness
  if (viralTitle.length > 95) {
    const budget = 95 - `${store} Coupon Code: ${code ? `${code} – ` : ""}${disc ? `${disc} ` : ""}()`.length;
    if (budget > 10) {
      let trimmed = detail.slice(0, budget).trim();
      const lastSpace = trimmed.lastIndexOf(" ");
      if (lastSpace > 8) trimmed = trimmed.slice(0, lastSpace);
      viralTitle = code
        ? `${store} Coupon Code: ${code} – ${disc ? `${disc} ` : ""}(${trimmed}...)`
        : `${store} Coupon Code: ${disc ? `${disc} – ` : ""}${trimmed}...`;
    } else {
      viralTitle = code
        ? `${store} Coupon Code: ${code} – ${disc || "Verified"}`
        : `${store} Coupon Code: ${disc || "Verified"} Offer`;
    }
  }

  const baseDesc = cleanHtmlEntities(rawDesc || "").trim();
  const viralTerms = `Looking for a verified coupon code for ${store}? Use ${
    code ? `coupon code '${code}'` : "this verified deal"
  } to get ${discount || "discount savings"} at ${store}. ${detail}. ${baseDesc ? `${baseDesc} ` : ""}Tested & 100% working today on GoCoupon.`.trim();

  const seoKeywords = [
    `${store.toLowerCase()} coupon code`,
    `coupon code for ${store.toLowerCase()}`,
    `${store.toLowerCase()} promo code`,
    `${store.toLowerCase()} discount code`,
    `${store.toLowerCase()} coupons`,
    `${store.toLowerCase()} vouchers`,
    `${store.toLowerCase()} offers today`,
    `${store.toLowerCase()} coupon code 2026`,
    code ? `${code.toLowerCase()} coupon code` : null,
    code ? `coupon code ${code.toLowerCase()}` : null,
    code ? `${store.toLowerCase()} code ${code.toLowerCase()}` : null,
  ].filter(Boolean);

  const directAnswer = `Looking for a working coupon code for ${store}? Apply ${
    code ? `code ${code}` : "this verified offer"
  } at checkout to save ${discount || "instantly"} on your order.`;

  return {
    title: viralTitle,
    terms: viralTerms,
    seoKeywords,
    directAnswer,
  };
}

const data = JSON.parse(fs.readFileSync(liveDealsPath, "utf-8"));
let updatedCount = 0;

if (Array.isArray(data.deals)) {
  for (const deal of data.deals) {
    const formatted = formatSeoCouponDeal(
      deal.storeName,
      deal.code,
      deal.discount,
      deal.title,
      deal.terms
    );

    deal.title = formatted.title;
    deal.terms = formatted.terms;
    deal.seoKeywords = formatted.seoKeywords;
    deal.directAnswer = formatted.directAnswer;
    updatedCount++;
  }
}

data.updatedAt = new Date().toISOString();
fs.writeFileSync(liveDealsPath, JSON.stringify(data, null, 2), "utf-8");
console.log(`Successfully formatted all ${updatedCount} deals into Google Search '{Store} Coupon Code' format in src/data/live-deals.json!`);
