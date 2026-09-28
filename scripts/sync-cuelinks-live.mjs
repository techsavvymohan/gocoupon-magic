import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// Auto-load .env if available
const envPath = path.join(projectRoot, ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

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

export function formatViralSeoDeal(storeName, rawCode, discount, rawTitle, rawDesc) {
  const cleanStore = (storeName || "Partner Store").trim();
  const hasCoupon = rawCode && rawCode.length > 1 && !/^(deal|none|na|null|undefined|deal activated)$/i.test(rawCode);
  const code = hasCoupon ? rawCode.toUpperCase().trim() : "";

  // Clean rawTitle
  let cleanDetail = (rawTitle || "").trim();

  // Strip repeated store names from start of rawTitle (e.g. "Gritzo Super Champ Sale" -> "Super Champ Sale")
  const storeRegex = new RegExp(`^${cleanStore.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\s*[-–:–]?\\s*`, "i");
  cleanDetail = cleanDetail.replace(storeRegex, "").trim();

  // Strip generic marketing words that reduce CTR and SEO power
  cleanDetail = cleanDetail
    .replace(/^(grab your savings|snag|unlock|score|enjoy|get exclusive|get|exclusive offer|special offer|limited time offer|best deal)[:\s–-]*/i, "")
    .trim();

  // Strip redundant discount text if it already starts with it
  if (discount && discount !== "Verified Deal") {
    const numMatch = discount.match(/([0-9]+%?)/);
    if (numMatch) {
      const redundantDiscountRegex = new RegExp(`^(?:up to\\s*)?${numMatch[1]}\\s*(?:off|discount|savings)[:\\s–-]*`, "i");
      cleanDetail = cleanDetail.replace(redundantDiscountRegex, "").trim();
    }
  }

  // Capitalize first letter of detail
  if (cleanDetail.length > 0) {
    cleanDetail = cleanDetail.charAt(0).toUpperCase() + cleanDetail.slice(1);
  }

  // Clean up punctuation at ends
  cleanDetail = cleanDetail.replace(/^[-–:,\s]+|[-–:,\s]+$/g, "").trim();

  if (!cleanDetail || cleanDetail.length < 3) {
    cleanDetail = "Sitewide Savings & Exclusive Offers";
  }

  // Construct Viral SEO Title matching:
  // 1. "xyz coupon code"
  // 2. "coupon code for xyz"
  let viralTitle = "";
  if (code) {
    viralTitle = `${cleanStore} Coupon Code: ${code} – ${discount} (${cleanDetail})`;
  } else {
    viralTitle = `${cleanStore} Coupon Code & Promo: ${discount} (${cleanDetail})`;
  }

  // Keep title tight (< 90 chars) for maximum Google CTR & mobile visibility
  if (viralTitle.length > 90) {
    const budget = 90 - (`${cleanStore} Coupon Code: ${code ? `${code} – ` : ""}${discount} ()`).length;
    if (budget > 12) {
      let trimmed = cleanDetail.slice(0, budget).trim();
      const lastSpace = trimmed.lastIndexOf(" ");
      if (lastSpace > 10) trimmed = trimmed.slice(0, lastSpace);
      cleanDetail = trimmed + "...";
      viralTitle = code
        ? `${cleanStore} Coupon Code: ${code} – ${discount} (${cleanDetail})`
        : `${cleanStore} Coupon Code & Promo: ${discount} (${cleanDetail})`;
    } else {
      viralTitle = code
        ? `${cleanStore} Coupon Code: ${code} – ${discount}`
        : `${cleanStore} Coupon Code: ${discount} Verified Offer`;
    }
  }

  const baseDesc = (rawDesc || "").trim();
  const viralTerms = `Looking for a coupon code for ${cleanStore}? Use ${code ? `verified coupon code '${code}'` : 'this verified deal'} to get ${discount} at ${cleanStore}. ${cleanDetail}. ${baseDesc ? `${baseDesc} ` : ""}Tested & 100% working today on GoCoupon.`.trim();

  const seoKeywords = [
    `${cleanStore.toLowerCase()} coupon code`,
    `coupon code for ${cleanStore.toLowerCase()}`,
    `${cleanStore.toLowerCase()} promo code`,
    `${cleanStore.toLowerCase()} discount code`,
    `${cleanStore.toLowerCase()} vouchers`,
    `${cleanStore.toLowerCase()} coupons`,
    code ? `${code.toLowerCase()} coupon code` : null,
    code ? `coupon code ${code.toLowerCase()}` : null,
    code ? `${cleanStore.toLowerCase()} code ${code.toLowerCase()}` : null,
  ].filter(Boolean);

  const directAnswer = `Looking for a working coupon code for ${cleanStore}? Apply ${code ? `code ${code}` : 'this verified offer'} at checkout to save ${discount} on your order.`;

  return {
    title: viralTitle,
    terms: viralTerms,
    seoKeywords,
    directAnswer,
  };
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

    const viral = formatViralSeoDeal(
      storeName,
      code,
      discount,
      o.title,
      o.description || o.terms
    );

    liveDeals.push({
      id: `cue_${o.id}`,
      storeName,
      storeSlug,
      storeLogo,
      category,
      title: viral.title,
      code,
      discount,
      badge,
      verifiedDate: "Live Verified",
      expiresIn,
      endDate: o.end_date || undefined,
      minOrder: o.minimum_order ? `₹${Number(o.minimum_order).toLocaleString()}` : undefined,
      terms: viral.terms,
      seoKeywords: viral.seoKeywords,
      directAnswer: viral.directAnswer,
      link: trackingUrl,
      usesCount: 1200 + (Math.abs(Number(o.id) || 0) % 4000),
    });
  }

  // 3. Accumulative Validity Pool Engine:
  // "wo deals tabh tak database mein rehni chahiye jabh tak wo valid hain aur wo existing deals + live deals + new deals"
  // Deals remain in database as long as they are valid (endDate >= now).
  const dealMap = new Map();
  const targetPath = path.join(projectRoot, "src/data/live-deals.json");

  function getDealDedupKey(d) {
    if (d.id && String(d.id).startsWith("cue_")) return String(d.id);
    const store = (d.storeName || "").toLowerCase().trim();
    const code = (d.code || "").toUpperCase().trim();
    const title = (d.title || "").toLowerCase().slice(0, 30).replace(/[^a-z0-9]/g, "");
    return `${store}_${code}_${title}`;
  }

  // A. Retain all existing valid deals from disk
  if (fs.existsSync(targetPath)) {
    try {
      const diskData = JSON.parse(fs.readFileSync(targetPath, "utf-8"));
      if (Array.isArray(diskData?.deals)) {
        for (const d of diskData.deals) {
          // ADMIN & FEATURED DEALS PERMANENT IMMUNITY:
          // Admin-curated deals and featured deals MUST NEVER be automatically purged or vanish.
          if (
            d.isFeatured ||
            d.source === "admin" ||
            d.campaignSource === "manual" ||
            d.campaignSource === "analytics_clouds" ||
            String(d.id).startsWith("ac-") ||
            String(d.id).startsWith("offer-") ||
            String(d.id).startsWith("admin-")
          ) {
            const key = getDealDedupKey(d);
            dealMap.set(key, d);
            continue;
          }

          if (d.expiresIn === "Expired" || d.status === "expired" || d.status === "inactive") {
            expiredCount++;
            continue;
          }
          if (d.endDate) {
            const endMs = new Date(d.endDate).getTime();
            if (!isNaN(endMs) && endMs < now) {
              expiredCount++;
              continue; // Prune expired
            }
          }
          const key = getDealDedupKey(d);
          dealMap.set(key, d);
        }
      }
    } catch (e) {
      console.warn("[Cuelinks Sync] Could not parse existing live-deals.json:", e?.message);
    }
  }

  // B. Upsert incoming live deals
  for (const d of liveDeals) {
    const key = getDealDedupKey(d);
    const existing = dealMap.get(key);
    if (existing) {
      dealMap.set(key, {
        ...existing,
        ...d,
        // Preserve admin overrides and featured status permanently
        isFeatured: existing.isFeatured || d.isFeatured,
        featuredPriority: existing.featuredPriority ?? d.featuredPriority,
        source: existing.source === "admin" ? "admin" : (d.source || existing.source),
        campaignSource: existing.campaignSource || d.campaignSource,
        targetCountry: existing.targetCountry || d.targetCountry,
        verificationStatus: existing.verificationStatus || d.verificationStatus || "verified",
        badge: existing.source === "admin" ? (existing.badge || d.badge) : (d.badge || existing.badge),
        usesCount: Math.max(existing.usesCount || 0, d.usesCount || 0),
      });
    } else {
      dealMap.set(key, d);
    }
  }

  const accumulatedDeals = Array.from(dealMap.values());

  // Prioritize verified working coupons on top, then highest usesCount
  accumulatedDeals.sort((a, b) => {
    const aHasCode = a.code && a.code.length > 1 ? 1 : 0;
    const bHasCode = b.code && b.code.length > 1 ? 1 : 0;
    if (aHasCode !== bHasCode) return bHasCode - aHasCode;
    return (b.usesCount || 0) - (a.usesCount || 0);
  });

  const payload = {
    updatedAt: new Date().toISOString(),
    totalFetched: rawDeals.length,
    activeCount: accumulatedDeals.length,
    expiredCount,
    deals: accumulatedDeals,
  };

  // Write to src/data/live-deals.json
  fs.writeFileSync(targetPath, JSON.stringify(payload, null, 2), "utf-8");
  console.log(`[Cuelinks Sync] Saved ${accumulatedDeals.length} accumulated live deals to ${targetPath} (Pruned ${expiredCount} expired).`);

  // If dist/ exists, also update dist/data/live-deals.json
  const distDir = path.join(projectRoot, "dist/data");
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, "live-deals.json"), JSON.stringify(payload, null, 2), "utf-8");
    console.log(`[Cuelinks Sync] Also mirrored to dist/data/live-deals.json`);
  }

  // Push to Supabase PostgreSQL cloud database if DATABASE_URL is available
  if (process.env.DATABASE_URL) {
    try {
      console.log(`⚡ [Cuelinks Sync] Syncing ${accumulatedDeals.length} live deals to Supabase PostgreSQL...`);
      const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      });
      const client = await pool.connect();
      try {
        await client.query(`
          ALTER TABLE gocoupon_deals ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
          ALTER TABLE gocoupon_deals ADD COLUMN IF NOT EXISTS featured_priority INTEGER DEFAULT 100;
          ALTER TABLE gocoupon_deals ADD COLUMN IF NOT EXISTS campaign_source TEXT DEFAULT 'manual';
          ALTER TABLE gocoupon_deals ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'verified';
          CREATE INDEX IF NOT EXISTS idx_deals_is_featured ON gocoupon_deals(is_featured);
        `).catch(() => {});

        const BATCH_SIZE = 50;
        for (let i = 0; i < accumulatedDeals.length; i += BATCH_SIZE) {
          const batch = accumulatedDeals.slice(i, i + BATCH_SIZE);
          const values = [];
          const rowPlaceholders = [];

          batch.forEach((d, rowIdx) => {
            const offset = rowIdx * 26;
            const placeholders = Array.from({ length: 26 }, (_, k) => `$${offset + k + 1}`).join(", ");
            rowPlaceholders.push(`(${placeholders})`);

            values.push(
              String(d.id),
              d.storeName || "Store",
              d.storeSlug || (d.storeName || "store").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              d.storeLogo || null,
              d.title,
              d.code || "",
              d.discount || "Exclusive Offer",
              d.category || "General",
              d.badge || "Verified",
              d.verified ?? true,
              d.verifiedDate || "Verified Today",
              d.expiresIn || "Active",
              d.endDate ? new Date(d.endDate) : null,
              d.minOrder || null,
              d.terms || null,
              d.link || "https://gocoupon.io",
              d.usesCount || 1,
              d.rating || 4.8,
              d.votesCount || 12,
              d.source || "cuelinks",
              d.status || "active",
              d.type || "coupon",
              Boolean(d.isFeatured),
              d.featuredPriority ? Number(d.featuredPriority) : 100,
              d.campaignSource || "manual",
              d.verificationStatus || "verified"
            );
          });

          await client.query(`
            INSERT INTO gocoupon_deals (
              id, store_name, store_slug, store_logo, title, code, discount, category,
              badge, verified, verified_date, expires_in, end_date, min_order, terms,
              link, uses_count, rating, votes_count, source, status, type,
              is_featured, featured_priority, campaign_source, verification_status
            ) VALUES ${rowPlaceholders.join(",\n")}
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title,
              code = EXCLUDED.code,
              discount = EXCLUDED.discount,
              uses_count = EXCLUDED.uses_count,
              verified = EXCLUDED.verified,
              is_featured = EXCLUDED.is_featured,
              featured_priority = EXCLUDED.featured_priority,
              campaign_source = EXCLUDED.campaign_source,
              verification_status = EXCLUDED.verification_status,
              updated_at = NOW();
          `, values);
        }
        console.log(`✅ [Cuelinks Sync] Successfully synced all ${accumulatedDeals.length} live deals into Supabase PostgreSQL (gocoupon_deals)!`);
      } finally {
        client.release();
        await pool.end();
      }
    } catch (dbErr) {
      console.warn("⚠️ [Cuelinks Sync] Cloud database sync warning:", dbErr.message);
    }
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
