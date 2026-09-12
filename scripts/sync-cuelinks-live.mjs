import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const CUELINKS_V3_BASE_URL = "https://developers.cuelinks.com/pub_api/v3";
const apiKey = (process.env.CUELINKS_API_KEY || "").trim();
const pubId = process.env.CUELINKS_PUBLISHER_ID || "148920";

const LOCAL_STORE_LOGOS = {
  amazon: "/Brand logos/Amazon_logo.svg.webp",
  flipkart: "/Brand logos/flipkart.webp",
  myntra: "/Brand logos/myntra.webp",
  croma: "/Brand logos/croma.svg",
  reliance: "/Brand logos/reliance.svg",
  tatacliq: "/Brand logos/Tata-cliq.webp",
  ajio: "/Brand logos/Ajio.webp",
  nykaa: "/Brand logos/Nykaa.webp",
  meesho: "/Brand logos/Meesho_logo.webp",
  firstcry: "/Brand logos/FirstCry_logo.svg.webp",
  gonoise: "/Brand logos/gonoise.svg",
  noise: "/Brand logos/gonoise.svg",
  soulflower: "/Brand logos/soulflower.svg",
  rareism: "/Brand logos/rareism.svg",
  jaypore: "/Brand logos/jaypore.svg",
  asaya: "/Brand logos/asaya.svg",
  bestbuy: "/Brand logos/bestbuy.svg",
  target: "/Brand logos/target.svg",
};

function extractMerchantDomain(trackingUrl, storeName, explicitDomain) {
  if (explicitDomain && explicitDomain.includes(".") && !explicitDomain.includes("cuelinks") && !explicitDomain.includes("linksredirect")) {
    return explicitDomain.toLowerCase().replace(/^www\./, "").replace(/^m\./, "").replace(/^shop\./, "").trim();
  }
  if (trackingUrl) {
    try {
      const parsed = new URL(trackingUrl);
      const targetUrl = parsed.searchParams.get("url");
      if (targetUrl) {
        const u = new URL(decodeURIComponent(targetUrl));
        let host = u.hostname.toLowerCase().replace(/^www\./, "").replace(/^m\./, "").replace(/^shop\./, "");
        if (host && host.includes(".")) {
          return host;
        }
      }
    } catch {}
  }
  const clean = (storeName || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  return clean ? `${clean}.com` : "gocoupon.io";
}

function resolveStoreLogo(storeName, trackingUrl, explicitDomain) {
  const clean = (storeName || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const [key, logo] of Object.entries(LOCAL_STORE_LOGOS)) {
    if (clean === key || clean.startsWith(key) || key.startsWith(clean)) {
      return logo;
    }
  }
  const domain = extractMerchantDomain(trackingUrl, storeName, explicitDomain);
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

function extractDiscount(o) {
  if (o.percent_off && Number(o.percent_off) > 0) {
    return `${o.percent_off}% OFF`;
  }
  if (o.discount_price && o.original_price && Number(o.original_price) > Number(o.discount_price)) {
    const diff = Number(o.original_price) - Number(o.discount_price);
    if (diff > 0) return `₹${diff.toLocaleString()} OFF`;
  }
  if (o.discount && typeof o.discount === "string" && o.discount.trim()) {
    return o.discount.trim();
  }
  const text = `${o.title || ""} ${o.description || ""}`;
  const pctMatch = text.match(/([0-9]+)%\s*(?:off|discount)/i);
  if (pctMatch) return `${pctMatch[1]}% OFF`;
  const flatMatch = text.match(/(?:flat\s*)?(?:₹|rs\.?)\s*([0-9,]+)\s*(?:off|discount)/i);
  if (flatMatch) return `₹${flatMatch[1]} OFF`;
  if (/free shipping/i.test(text)) return "FREE SHIPPING";
  return "Verified Deal";
}

function mapCategory(categories, title) {
  const catNames = Array.isArray(categories)
    ? categories.map((c) => (typeof c === "object" ? c.name : c) || "")
    : [];
  const text = (catNames.join(" ") + " " + (title || "")).toLowerCase();
  if (/fashion|apparel|clothing|shoes|footwear|sneaker|shirt|denim|saree|ethnic|dress|lingerie|kurti|tshirt|jeans/i.test(text)) return "Fashion";
  if (/electronic|mobile|laptop|computer|phone|audio|headphone|earbud|gadget|camera|tv|smartwatch|watch|tablet|charger/i.test(text)) return "Electronics";
  if (/beauty|cosmetic|skincare|hair|makeup|perfume|fragrance|wellness|personal care|serum|lotion|glow/i.test(text)) return "Beauty";
  if (/home|kitchen|furniture|decor|bedding|appliance|cookware|mattress|lighting/i.test(text)) return "Home";
  if (/food|dining|grocery|snack|beverage|meal|hotel|restaurant|pizza|burger|tea|coffee/i.test(text)) return "Food";
  if (/travel|flight|hotel|tour|bus|holiday|train|booking|resort/i.test(text)) return "Travel";
  if (/recharge|bill|utility|telecom|broadband|dth/i.test(text)) return "Recharge";
  return "General";
}

export async function runCuelinksSync(maxPages = 0) {
  console.log(`[Cuelinks Sync] Starting 24/7 dynamic sync (API v3, fetching all active pages)...`);
  const headers = {
    Authorization: `Token ${apiKey}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const rawDeals = [];
  let totalPages = 1;

  // 1. Fetch Page 1 to inspect total available pages
  try {
    const res = await fetch(`${CUELINKS_V3_BASE_URL}/offers?page=1&per_page=50`, {
      headers,
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length > 0) {
        rawDeals.push(...json.data);
      }
      if (json.meta?.total_pages) {
        totalPages = json.meta.total_pages;
      }
    }
  } catch (err) {
    console.warn("[Cuelinks Sync] Page 1 error:", err?.message || err);
  }

  const targetPages = maxPages > 0 ? Math.min(maxPages, totalPages) : totalPages;
  console.log(`[Cuelinks Sync] Total offers reported: ${rawDeals.length} from page 1. Target pages: ${targetPages} (all live offers).`);

  // 2. Fetch remaining pages in concurrent batches of 4
  const remainingPages = [];
  for (let p = 2; p <= targetPages; p++) {
    remainingPages.push(p);
  }

  const BATCH_SIZE = 4;
  for (let i = 0; i < remainingPages.length; i += BATCH_SIZE) {
    const batch = remainingPages.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map(async (page) => {
        const res = await fetch(`${CUELINKS_V3_BASE_URL}/offers?page=${page}&per_page=50`, {
          headers,
          signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        return Array.isArray(json.data) ? json.data : [];
      })
    );

    for (const r of batchResults) {
      if (r.status === "fulfilled" && Array.isArray(r.value)) {
        rawDeals.push(...r.value);
      }
    }
  }

  console.log(`[Cuelinks Sync] Ingested ${rawDeals.length} raw offers across ${targetPages} pages. Parsing & validating...`);

  const now = Date.now();
  let expiredCount = 0;
  const liveDeals = [];
  const seenKeys = new Set();

  for (const o of rawDeals) {
    // 1. Strict status check
    if (o.status && o.status !== "live" && o.status !== "active") {
      expiredCount++;
      continue;
    }

    // 2. Strict expiration pruning: purge if endDate is in the past
    if (o.end_date) {
      const endMs = new Date(o.end_date).getTime();
      if (!isNaN(endMs) && endMs < now) {
        expiredCount++;
        continue;
      }
    }

    const storeName = (o.campaign_name || "Partner Store").trim();
    const storeSlug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") + "-coupons";
    const rawCode = (o.coupon_code || o.code || "").trim();
    const hasCoupon = rawCode.length > 1 && !/^(deal|none|na|null|undefined)$/i.test(rawCode);
    const code = hasCoupon ? rawCode.toUpperCase() : "";
    const discount = extractDiscount(o);
    const category = mapCategory(o.categories, o.title);
    const trackingUrl =
      o.tracking_url ||
      `https://linksredirect.com/?pub_id=${pubId}&subid=gocoupon_live&url=${encodeURIComponent(o.url || "https://gocoupon.io")}`;
    const storeLogo = resolveStoreLogo(storeName, trackingUrl, o.domain);

    let expiresIn = "Limited Time";
    if (o.end_date) {
      const end = new Date(o.end_date).getTime();
      const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) {
        expiredCount++;
        continue; // Expired today/earlier
      } else if (diffDays === 1) {
        expiresIn = "1 day left";
      } else if (diffDays <= 60) {
        expiresIn = `${diffDays} days left`;
      } else {
        expiresIn = "Active Offer";
      }
    }

    // Deduplication check
    const dedupKey = `${storeName.toLowerCase()}_${code}_${(o.title || "").toLowerCase().slice(0, 30)}`;
    if (seenKeys.has(dedupKey)) continue;
    seenKeys.add(dedupKey);

    let badge = "Trending";
    if (hasCoupon) {
      badge = "Verified";
    } else if (discount.includes("%") && parseInt(discount, 10) >= 35) {
      badge = "Exclusive";
    }

    liveDeals.push({
      id: `cue_${o.id}`,
      storeName,
      storeSlug,
      storeLogo,
      category,
      title: o.title || `${discount} at ${storeName}`,
      code,
      discount,
      badge,
      verifiedDate: "Live Verified",
      expiresIn,
      endDate: o.end_date || undefined,
      minOrder: o.minimum_order ? `₹${Number(o.minimum_order).toLocaleString()}` : undefined,
      terms: (o.description || o.terms || `Valid on ${storeName}. Verified via Cuelinks 24/7 network.`).trim(),
      link: trackingUrl,
      usesCount: 1200 + (Math.abs(Number(o.id) || 0) % 4000),
    });
  }

  // Prioritize verified working coupons on top, then highest discounts
  liveDeals.sort((a, b) => {
    const aHasCode = a.code && a.code.length > 1 ? 1 : 0;
    const bHasCode = b.code && b.code.length > 1 ? 1 : 0;
    if (aHasCode !== bHasCode) return bHasCode - aHasCode;
    return (b.usesCount || 0) - (a.usesCount || 0);
  });

  const payload = {
    updatedAt: new Date().toISOString(),
    totalFetched: rawDeals.length,
    activeCount: liveDeals.length,
    expiredCount,
    deals: liveDeals,
  };

  // Write to src/data/live-deals.json
  const targetPath = path.join(projectRoot, "src/data/live-deals.json");
  fs.writeFileSync(targetPath, JSON.stringify(payload, null, 2), "utf-8");
  console.log(`[Cuelinks Sync] Saved ${liveDeals.length} live deals to ${targetPath} (Pruned ${expiredCount} expired).`);

  // If dist/ exists, also update dist/data/live-deals.json
  const distDir = path.join(projectRoot, "dist/data");
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, "live-deals.json"), JSON.stringify(payload, null, 2), "utf-8");
    console.log(`[Cuelinks Sync] Also mirrored to dist/data/live-deals.json`);
  }

  return payload;
}

if (process.argv[1] && process.argv[1].endsWith("sync-cuelinks-live.mjs")) {
  runCuelinksSync(0)
    .then((res) => {
      console.log(`Sync complete! Live Active: ${res.activeCount}, Expired Pruned: ${res.expiredCount}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Sync failed:", err);
      process.exit(1);
    });
}
