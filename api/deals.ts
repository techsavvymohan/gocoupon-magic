import fs from "node:fs";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";

interface DealRecord {
  id: string;
  storeName: string;
  storeSlug: string;
  storeLogo?: string;
  category: string;
  title: string;
  code: string;
  discount: string;
  badge: string;
  verifiedDate: string;
  expiresIn: string;
  endDate?: string;
  minOrder?: string;
  terms: string;
  link: string;
  usesCount: number;
}

function parseDealDiscount(text: string): number {
  if (!text) return 0;
  const pctMatch = text.match(/([0-9]+)\s*%/);
  if (pctMatch) return parseInt(pctMatch[1], 10);
  const rupeeMatch = text.match(/(?:₹|Rs\.?)\s*([0-9,]+)/i);
  if (rupeeMatch) {
    const val = parseInt(rupeeMatch[1].replace(/,/g, ""), 10);
    return Math.min(100, Math.round(val / 50));
  }
  return 0;
}

function parseExpiryDays(expiresIn: string): number {
  if (!expiresIn) return 999;
  if (expiresIn.includes("day left") || expiresIn.includes("1 day")) return 1;
  const match = expiresIn.match(/([0-9]+)\s*days?/i);
  return match ? parseInt(match[1], 10) : 30;
}

const LOCAL_STORE_LOGOS: Record<string, string> = {
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

function extractMerchantDomain(trackingUrl?: string, storeName?: string): string {
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

function resolveStoreLogo(storeName: string, trackingUrl?: string, existingLogo?: string): string {
  const clean = (storeName || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const [key, logo] of Object.entries(LOCAL_STORE_LOGOS)) {
    if (clean === key || clean.startsWith(key) || key.startsWith(clean)) {
      return logo;
    }
  }
  if (
    existingLogo &&
    !existingLogo.toLowerCase().includes("placeholder") &&
    (existingLogo.startsWith("/Brand logos/") || existingLogo.startsWith("https://www.google.com/s2/favicons"))
  ) {
    return existingLogo;
  }
  const domain = extractMerchantDomain(trackingUrl, storeName);
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const filePath = path.resolve(process.cwd(), "src/data/live-deals.json");
    let snapshot: { updatedAt?: string; deals?: DealRecord[] } = {};
    if (fs.existsSync(filePath)) {
      snapshot = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }

    const now = Date.now();
    let deals: DealRecord[] = Array.isArray(snapshot.deals) ? snapshot.deals : [];

    // Filter expired deals
    deals = deals.filter((d) => {
      if (d.expiresIn === "Expired") return false;
      if (d.endDate) {
        const end = new Date(d.endDate).getTime();
        if (!isNaN(end) && end < now) return false;
      }
      return true;
    }).map((d) => ({
      ...d,
      storeLogo: resolveStoreLogo(d.storeName, d.link, d.storeLogo),
    }));

    const category = ((req.query.category as string) || "").toLowerCase().trim();
    const q = ((req.query.q as string) || "").toLowerCase().trim();
    const store = ((req.query.store as string) || (req.query.merchant as string) || "").toLowerCase().trim();
    const badge = (req.query.badge as string) || "";
    const sortBy = (req.query.sortBy as string) || "trending";
    const order = (req.query.order as string) || "desc";
    const rawLimit = parseInt(req.query.limit as string, 10);
    const limit = isNaN(rawLimit) ? 100 : rawLimit <= 0 ? 2000 : Math.min(rawLimit, 2000);
    const rawOffset = parseInt(req.query.offset as string, 10);
    const offset = isNaN(rawOffset) ? 0 : rawOffset;

    if (category && category !== "all") {
      deals = deals.filter((d) => {
        const dCat = (d.category || "").toLowerCase();
        return dCat === category || dCat.includes(category) || category.includes(dCat);
      });
    }

    if (store && store !== "all") {
      const cleanStore = store.replace(/[^a-z0-9]/g, "");
      deals = deals.filter((d) => {
        const dStore = (d.storeName || d.storeSlug || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        return dStore.includes(cleanStore) || cleanStore.includes(dStore);
      });
    }

    if (badge && badge !== "all") {
      deals = deals.filter((d) => (d.badge || "").toLowerCase() === badge.toLowerCase());
    }

    if (q) {
      deals = deals.filter(
        (d) =>
          (d.title || "").toLowerCase().includes(q) ||
          (d.storeName || "").toLowerCase().includes(q) ||
          (d.code || "").toLowerCase().includes(q) ||
          (d.discount || "").toLowerCase().includes(q)
      );
    }

    deals.sort((a, b) => {
      let comp = 0;
      switch (sortBy) {
        case "discount":
          comp = parseDealDiscount(a.discount) - parseDealDiscount(b.discount);
          break;
        case "verified":
          comp = ((a.badge || "").toLowerCase() === "verified" ? 1 : 0) - ((b.badge || "").toLowerCase() === "verified" ? 1 : 0);
          break;
        case "expiry":
          comp = parseExpiryDays(a.expiresIn) - parseExpiryDays(b.expiresIn);
          break;
        case "store":
          comp = (a.storeName || "").localeCompare(b.storeName || "");
          break;
        case "trending":
        default:
          comp = (a.usesCount || 0) - (b.usesCount || 0);
          break;
      }
      return order === "asc" ? comp : -comp;
    });

    const total = deals.length;
    const paginated = deals.slice(offset, offset + limit);

    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    return res.status(200).json({
      deals: paginated,
      total,
      count: paginated.length,
      page: Math.floor(offset / limit) + 1,
      hasMore: offset + limit < total,
      isDynamic: true,
      provider: "Cuelinks API v3 (Live Dynamic Feed)",
      lastSyncedAt: snapshot.updatedAt || new Date().toISOString(),
      cached: false,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to load live deals", message: err.message });
  }
}
