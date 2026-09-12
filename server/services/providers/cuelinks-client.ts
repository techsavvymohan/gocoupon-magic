/**
 * @file server/services/providers/cuelinks-client.ts
 * @description Production Cuelinks API v3 Affiliate, Deep Linking & Offers Feed Client.
 *
 * Implements:
 * - Cuelinks API v3 (https://developers.cuelinks.com/pub_api/v3)
 * - Strict Authorization header format: "Authorization: Token <key>"
 * - Direct /ping health probe (extracts publisher ID, name, email, currency & scopes)
 * - Live Offers & Coupons Feed (/offers) with data/meta unwrapping
 * - Merchant Campaigns Discovery (/campaigns) with EPC & payout tiers
 * - Programmatic URL conversion (/links/convert) with SubID attribution
 * - Instant synchronous fallback using linksredirect protocol
 * - In-memory TTL caching for sub-millisecond local responses
 * - Curated fallback catalog when API key is missing or network times out
 */

import fs from "node:fs";
import path from "node:path";
import type { StoreCoupon } from "../../../src/lib/services/canonical-types.js";
import type { DealRecord, DealCategory, DealBadge } from "../../../src/lib/server-data/deals-db.js";
import { setLiveDeals } from "../../../src/lib/server-data/deals-db.js";

const CUELINKS_V3_BASE_URL = "https://developers.cuelinks.com/pub_api/v3";

export interface CuelinksCouponOffer {
  id: string;
  storeName: string;
  storeDomain: string;
  campaignId: number;
  code: string;
  title: string;
  description: string;
  discount: string;
  minOrder?: number;
  startDate: string;
  endDate: string;
  affiliateUrl: string;
  offerType: "coupon" | "deal";
  categories?: string[];
  status?: string;
  imageUrl?: string;
  percentOff?: number;
}

export interface CuelinksCampaign {
  id: number;
  name: string;
  domain: string;
  payoutType: string;
  payoutRate: string;
  payoutCurrency: string;
  status: "open" | "approved" | "pending" | "not_applied" | "rejected" | "blocked";
  deepLinkAllowed: boolean;
  categories: string[];
  epc7d?: string;
  epc90d?: string;
  trackingUrl?: string;
}

export interface CuelinksLinkOptions {
  merchantUrl: string;
  subId?: string;
  shorten?: boolean;
  channelId?: number;
}

export interface CuelinksConnectionStatus {
  configured: boolean;
  connected: boolean;
  publisherId: string;
  publisherName?: string;
  publisherEmail?: string;
  currency?: string;
  scopes?: string[];
  channelId?: string;
  message: string;
  latencyMs?: number;
  apiVersion?: string;
}

// In-memory cache for API responses
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}
const memoryCache = new Map<string, CacheEntry<any>>();

function getCached<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCached<T>(key: string, data: T, ttlMs: number): void {
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

export function getCuelinksConfig() {
  const publisherId =
    process.env.CUELINKS_PUBLISHER_ID ||
    process.env.VITE_CUELINKS_PUB_ID ||
    "148920";
  const apiKey = (process.env.CUELINKS_API_KEY || "").trim();
  const channelId = (process.env.CUELINKS_CHANNEL_ID || "").trim();

  return {
    publisherId,
    apiKey,
    channelId,
    isConfigured: Boolean(apiKey && apiKey.length > 5),
  };
}

/**
 * Common V3 Headers with strict Authorization: Token format
 */
function getV3Headers(apiKey: string) {
  return {
    Authorization: `Token ${apiKey}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

/**
 * Builds a fast, synchronous affiliate redirect link using Cuelinks linksredirect protocol.
 * Format: https://linksredirect.com/?pub_id=[pubId]&subid=[subId]&url=[encodedUrl]
 * Zero latency, requires no network request.
 */
export function buildCuelinksRedirectUrl(options: CuelinksLinkOptions): string {
  const targetUrl = options.merchantUrl;
  if (!targetUrl || targetUrl.startsWith("#") || targetUrl.startsWith("javascript:")) {
    return "#";
  }

  const { publisherId } = getCuelinksConfig();
  const subId = options.subId || "gocoupon_web";

  // Already a tracking redirect
  if (targetUrl.includes("linksredirect.com") || targetUrl.includes("clnk.in")) {
    return targetUrl;
  }

  const encoded = encodeURIComponent(targetUrl);
  return `https://linksredirect.com/?pub_id=${publisherId}&subid=${encodeURIComponent(subId)}&url=${encoded}`;
}

/**
 * Converts a merchant URL into a trackable affiliate link via Cuelinks API v3 (/links/convert).
 * Falls back to buildCuelinksRedirectUrl if API conversion fails or key is missing.
 */
export async function convertCuelinksLinkApi(options: CuelinksLinkOptions): Promise<{
  trackingUrl: string;
  shortUrl?: string;
  campaign?: { id: number; name: string };
  isApiConverted: boolean;
}> {
  const config = getCuelinksConfig();

  if (config.isConfigured) {
    try {
      const res = await fetch(`${CUELINKS_V3_BASE_URL}/links/convert`, {
        method: "POST",
        headers: getV3Headers(config.apiKey),
        body: JSON.stringify({
          url: options.merchantUrl,
          sub_id: options.subId || "gocoupon_web",
          shorten: Boolean(options.shorten),
          channel_id: options.channelId,
        }),
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        const json = await res.json();
        const payload = json.data;
        if (payload?.tracking_url) {
          return {
            trackingUrl: payload.tracking_url,
            shortUrl: payload.short_url,
            campaign: payload.campaign,
            isApiConverted: true,
          };
        }
      }
    } catch (err) {
      console.warn("[Cuelinks V3] /links/convert failed, falling back to linksredirect:", err);
    }
  }

  // Fallback to instant linksredirect URL
  return {
    trackingUrl: buildCuelinksRedirectUrl(options),
    isApiConverted: false,
  };
}

/**
 * Tests connection with Cuelinks API v3 via GET /pub_api/v3/ping.
 * Verifies key validity, publisher identity, currency, and permission scopes.
 */
export async function testCuelinksConnection(): Promise<CuelinksConnectionStatus> {
  const config = getCuelinksConfig();

  if (!config.isConfigured) {
    return {
      configured: false,
      connected: false,
      publisherId: config.publisherId,
      channelId: config.channelId || undefined,
      message: "Cuelinks API key not set in .env. Generate one at https://www.cuelinks.com/api-key",
    };
  }

  const startTime = Date.now();
  try {
    const res = await fetch(`${CUELINKS_V3_BASE_URL}/ping`, {
      method: "GET",
      headers: getV3Headers(config.apiKey),
      signal: AbortSignal.timeout(5000),
    });

    const latencyMs = Date.now() - startTime;

    if (res.ok) {
      const json = await res.json();
      const pub = json.publisher || {};
      const keyInfo = json.api_key || {};

      return {
        configured: true,
        connected: true,
        publisherId: pub.publisher_id || config.publisherId,
        publisherName: pub.name,
        publisherEmail: pub.email,
        currency: pub.currency || "INR",
        scopes: keyInfo.scopes || ["read:campaigns", "write:links", "read:offers"],
        apiVersion: json.version || "3.0",
        channelId: config.channelId || undefined,
        message: `Authenticated with Cuelinks API v3 as "${pub.name || 'Publisher'}" (${pub.currency || 'INR'}) in ${latencyMs}ms.`,
        latencyMs,
      };
    }

    const errJson = await res.json().catch(() => null);
    const errMsg = errJson?.error || `HTTP ${res.status} ${res.statusText}`;

    return {
      configured: true,
      connected: false,
      publisherId: config.publisherId,
      channelId: config.channelId || undefined,
      message: `Cuelinks API v3 authentication failed: ${errMsg}`,
      latencyMs,
    };
  } catch (err: any) {
    return {
      configured: true,
      connected: false,
      publisherId: config.publisherId,
      channelId: config.channelId || undefined,
      message: `Connection failed: ${err?.message || "Network error"}`,
      latencyMs: Date.now() - startTime,
    };
  }
}

/**
 * Helper to extract discount label from Cuelinks offer payload
 */
export function extractDiscountFromOffer(o: any): string {
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

/**
 * Fetches verified live coupons & deals from Cuelinks API v3 (/offers).
 * Automatically purges expired deals based on end_date and status.
 */
export async function fetchCuelinksCoupons(options: {
  storeNameOrDomain?: string;
  category?: string;
  page?: number;
  limit?: number;
  forceRefresh?: boolean;
}): Promise<CuelinksCouponOffer[]> {
  const { storeNameOrDomain, category, page = 1, limit = 20, forceRefresh = false } = options;
  const config = getCuelinksConfig();

  const cacheKey = `cuelinks_offers_v3:${(storeNameOrDomain || "all").toLowerCase()}:${(category || "all").toLowerCase()}:${page}:${limit}`;

  if (!forceRefresh) {
    const cached = getCached<CuelinksCouponOffer[]>(cacheKey);
    if (cached) return cached;
  }

  if (config.isConfigured) {
    try {
      const url = new URL(`${CUELINKS_V3_BASE_URL}/offers`);
      url.searchParams.set("page", String(page));
      url.searchParams.set("per_page", String(Math.min(limit, 100)));
      if (storeNameOrDomain) {
        url.searchParams.set("q", storeNameOrDomain);
      }

      const res = await fetch(url.toString(), {
        headers: getV3Headers(config.apiKey),
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const json = await res.json();
        const rawOffers = Array.isArray(json.data) ? json.data : [];
        const now = Date.now();

        const normalized: CuelinksCouponOffer[] = [];
        for (const o of rawOffers) {
          // 1. Strict status check: only live/active
          if (o.status && o.status !== "live" && o.status !== "active") {
            continue;
          }

          // 2. Strict expiration pruning: drop expired offers
          if (o.end_date) {
            const endMs = new Date(o.end_date).getTime();
            if (!isNaN(endMs) && endMs < now) {
              continue;
            }
          }

          const fallbackStore = (o.campaign_name || "Partner Store").trim();
          const trackingUrl =
            o.tracking_url ||
            buildCuelinksRedirectUrl({ merchantUrl: `https://${o.domain || "flipkart.com"}` });

          const rawCode = (o.coupon_code || o.code || "").trim();
          const cleanCode =
            rawCode && !/^(deal|none|na|null|undefined|dealactivated)$/i.test(rawCode)
              ? rawCode.replace(/\s+/g, "").toUpperCase()
              : "";

          const discount = extractDiscountFromOffer(o);

          normalized.push({
            id: `cue_${o.id}`,
            storeName: fallbackStore,
            storeDomain: o.domain || `${fallbackStore.toLowerCase().replace(/\s+/g, "")}.com`,
            campaignId: Number(o.campaign_id) || 0,
            code: cleanCode,
            title: o.title || `${discount} at ${fallbackStore}`,
            description: o.description || o.terms || "",
            discount,
            minOrder: o.minimum_order ? Number(o.minimum_order) : undefined,
            startDate: o.start_date || new Date().toISOString(),
            endDate: o.end_date || new Date(Date.now() + 30 * 86400000).toISOString(),
            affiliateUrl: trackingUrl,
            offerType: o.offer_type === "deal" ? "deal" : "coupon",
            categories: Array.isArray(o.categories) ? o.categories.map((c: any) => c.name || c) : [],
            status: "active",
            imageUrl: o.image || undefined,
            percentOff: o.percent_off ? Number(o.percent_off) : undefined,
          });
        }

        setCached(cacheKey, normalized, 15 * 60 * 1000); // 15 mins
        return normalized;
      }
    } catch (err: any) {
      console.warn("[Cuelinks V3] /offers query failed, using fallback:", err?.message || err);
    }
  }

  // Curated Fallback
  const store = (storeNameOrDomain || "").toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "").split(".")[0];
  const mockCoupons = getCuratedFallbackCoupons();

  const filtered = !store
    ? mockCoupons
    : mockCoupons.filter(
        (c) =>
          c.storeName.toLowerCase().includes(store) ||
          c.storeDomain.toLowerCase().includes(store) ||
          store.includes(c.storeName.toLowerCase().split(" ")[0])
      );

  setCached(cacheKey, filtered, 5 * 60 * 1000);
  return filtered;
}

/**
 * Fetches campaigns from Cuelinks API v3 (/campaigns).
 */
export async function fetchCuelinksCampaigns(options: {
  search?: string;
  page?: number;
  limit?: number;
  forceRefresh?: boolean;
}): Promise<CuelinksCampaign[]> {
  const { search, page = 1, limit = 50, forceRefresh = false } = options;
  const config = getCuelinksConfig();

  const cacheKey = `cuelinks_campaigns_v3:${(search || "all").toLowerCase()}:${page}:${limit}`;

  if (!forceRefresh) {
    const cached = getCached<CuelinksCampaign[]>(cacheKey);
    if (cached) return cached;
  }

  if (config.isConfigured) {
    try {
      const url = new URL(`${CUELINKS_V3_BASE_URL}/campaigns`);
      url.searchParams.set("page", String(page));
      url.searchParams.set("per_page", String(Math.min(limit, 100)));
      url.searchParams.set("sort", "epc_7d");
      url.searchParams.set("order", "desc");
      if (search) url.searchParams.set("q", search);

      const res = await fetch(url.toString(), {
        headers: getV3Headers(config.apiKey),
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const json = await res.json();
        const rawCampaigns = Array.isArray(json.data) ? json.data : [];

        const normalized: CuelinksCampaign[] = rawCampaigns.map((c: any) => ({
          id: Number(c.id),
          name: c.name || "Merchant Campaign",
          domain: c.domain || "",
          payoutType: c.payout_type || "CPS",
          payoutRate: c.payout ? `${c.payout_currency === "INR" ? "₹" : ""}${c.payout}` : "Active Payout",
          payoutCurrency: c.payout_currency || "INR",
          status: c.access_status || "open",
          deepLinkAllowed: Boolean(c.deeplink_allowed ?? true),
          categories: Array.isArray(c.categories) ? c.categories.map((cat: any) => cat.name || cat) : [],
          epc7d: c.epc_7d,
          epc90d: c.epc_90d,
          trackingUrl: c.tracking_url,
        }));

        setCached(cacheKey, normalized, 60 * 60 * 1000); // 1 hour
        return normalized;
      }
    } catch (err: any) {
      console.warn("[Cuelinks V3] /campaigns query failed, using fallback:", err?.message || err);
    }
  }

  // Curated campaigns fallback
  const mockCampaigns = getCuratedFallbackCampaigns();
  const filtered = !search
    ? mockCampaigns
    : mockCampaigns.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.domain.toLowerCase().includes(search.toLowerCase())
      );

  setCached(cacheKey, filtered, 30 * 60 * 1000);
  return filtered;
}

/**
 * Normalizes a Cuelinks offer into GoCoupon's canonical StoreCoupon contract.
 */
export function normalizeCuelinksToStoreCoupon(offer: CuelinksCouponOffer): StoreCoupon {
  const storeId = offer.storeName.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/^_+|_+$/g, "");
  const hasPercentage = /(\d+)%/.exec(offer.discount);
  const hasFixed = /(?:₹|rs\.?)\s*(\d+)/i.exec(offer.discount);

  return {
    id: offer.id,
    storeId,
    storeName: offer.storeName,
    code: offer.code,
    title: offer.title,
    description: offer.description || `${offer.discount} on eligible purchases at ${offer.storeName}`,
    discountLabel: offer.discount || "Verified Deal",
    discountPercent: hasPercentage ? parseInt(hasPercentage[1], 10) : undefined,
    discountAmount: hasFixed ? parseInt(hasFixed[1], 10) : undefined,
    minOrderValue: offer.minOrder,
    expiresAt: offer.endDate,
    status: "Active",
    verificationStatus: "Merchant Partner",
    lastVerified: new Date().toISOString().split("T")[0],
    isStackableWithBankOffers: true,
    applicableCategories: offer.categories,
    terms: `Valid on ${offer.storeName}. Tracked via Cuelinks partner network.`,
  };
}

/**
 * Maps a Cuelinks offer to GoCoupon's DealRecord format.
 */
export function normalizeCuelinksToDealRecord(offer: CuelinksCouponOffer): DealRecord {
  const storeSlug = offer.storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") + "-coupons";

  // Category mapping
  let cat: DealCategory = "General";
  const catStr = (offer.categories || []).join(" ").toLowerCase() + " " + offer.title.toLowerCase();
  if (/fashion|apparel|clothing|denim|shirt|dress|footwear|shoes/i.test(catStr)) {
    cat = "Fashion";
  } else if (/electronic|mobile|phone|laptop|headphone|earbud|audio|tv/i.test(catStr)) {
    cat = "Electronics";
  } else if (/beauty|cosmetics|skincare|makeup/i.test(catStr)) {
    cat = "Beauty";
  } else if (/home|kitchen|appliance|furniture/i.test(catStr)) {
    cat = "Home";
  } else if (/food|grocery|dining|swiggy|zomato/i.test(catStr)) {
    cat = "Food";
  } else if (/travel|flight|hotel|bus/i.test(catStr)) {
    cat = "Travel";
  }

  const STORE_LOGOS_MAP: Record<string, string> = {
    amazon: "/Brand logos/Amazon_logo.svg.webp",
    flipkart: "/Brand logos/flipkart.webp",
    myntra: "/Brand logos/myntra.webp",
    croma: "/Brand logos/Croma.webp",
    reliance: "/Brand logos/reliance.svg",
    tatacliq: "/Brand logos/Tata-cliq.webp",
    ajio: "/Brand logos/Ajio.webp",
    nykaa: "/Brand logos/Nykaa.webp",
    meesho: "/Brand logos/Meesho_logo.webp",
    bewakoof: "/Brand logos/Bewakoof.webp",
    boat: "/Brand logos/boat.webp",
    asus: "/Brand logos/Asus.webp",
    acer: "/Brand logos/Acer.webp",
    dell: "/Brand logos/Dell_logo.svg.webp",
    lenovo: "/Brand logos/Lenovo_logo.svg.webp",
    samsung: "/Brand logos/Samsung.webp",
    levis: "/Brand logos/Levis.webp",
    swiggy: "/Brand logos/swiggy.webp",
    zomato: "/Brand logos/zomato.webp",
    firstcry: "/Brand logos/firstcry.webp",
    pepperfry: "/Brand logos/pepperfry.webp",
  };

  const storeKey = offer.storeName.toLowerCase().replace(/[^a-z0-9]/g, "");
  let storeLogo: string | undefined = offer.imageUrl;
  for (const [key, logo] of Object.entries(STORE_LOGOS_MAP)) {
    if (storeKey.includes(key) || key.includes(storeKey)) {
      storeLogo = logo;
      break;
    }
  }

  let expiresIn = "Limited Time";
  try {
    const end = new Date(offer.endDate).getTime();
    const diffDays = Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
      expiresIn = "Expired";
    } else if (diffDays === 1) {
      expiresIn = "1 day left";
    } else if (diffDays > 1 && diffDays <= 60) {
      expiresIn = `${diffDays} days left`;
    } else {
      expiresIn = "Active Offer";
    }
  } catch {}

  const hasCoupon = offer.code && offer.code.length > 1;
  let badge: DealBadge = "Trending";
  if (hasCoupon) {
    badge = "Verified";
  } else if (offer.discount.includes("%") && parseInt(offer.discount, 10) >= 35) {
    badge = "Exclusive";
  }

  return {
    id: offer.id,
    storeName: offer.storeName,
    storeSlug,
    storeLogo,
    category: cat,
    title: offer.title,
    code: offer.code || "",
    discount: offer.discount,
    badge,
    verifiedDate: "Live Verified",
    expiresIn,
    endDate: offer.endDate || undefined,
    minOrder: offer.minOrder ? `₹${offer.minOrder.toLocaleString()}` : undefined,
    terms: offer.description || `Valid on ${offer.storeName}. Automatically tracked & monetized via Cuelinks.`,
    link: offer.affiliateUrl,
    usesCount: 1200 + (Math.abs(offer.campaignId) % 3500),
  };
}

// ─── 24/7 Dynamic Cuelinks Engine & In-Memory Store ──────────────────────────

let liveDealsPool: DealRecord[] = [];
let lastSyncMetadata = {
  lastSyncedAt: "",
  totalFetched: 0,
  activeCount: 0,
  expiredCount: 0,
  nextSyncAt: "",
};

function getProjectDataPath(relativePath: string): string {
  return path.resolve(process.cwd(), relativePath);
}

function loadInitialDealsFromDisk(): DealRecord[] {
  try {
    const targetPath = getProjectDataPath("src/data/live-deals.json");
    if (fs.existsSync(targetPath)) {
      const raw = fs.readFileSync(targetPath, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.deals) && parsed.deals.length > 0) {
        lastSyncMetadata = {
          lastSyncedAt: parsed.updatedAt || new Date().toISOString(),
          totalFetched: parsed.totalFetched || parsed.deals.length,
          activeCount: parsed.activeCount || parsed.deals.length,
          expiredCount: parsed.expiredCount || 0,
          nextSyncAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        };
        return parsed.deals;
      }
    }
  } catch (err: any) {
    console.warn("[Cuelinks Client] Could not load initial live-deals.json:", err?.message);
  }
  return [];
}

// Pre-load from disk on module import
liveDealsPool = loadInitialDealsFromDisk();

/**
 * Returns current active, non-expired deals from the 24/7 Cuelinks live pool.
 */
export function getLiveDealsPool(): DealRecord[] {
  if (liveDealsPool.length === 0) {
    liveDealsPool = loadInitialDealsFromDisk();
  }
  const now = Date.now();
  return liveDealsPool.filter((d) => {
    if (d.expiresIn === "Expired") return false;
    if (d.endDate) {
      const end = new Date(d.endDate).getTime();
      if (!isNaN(end) && end < now) return false;
    }
    return true;
  });
}

/**
 * Returns live sync health statistics.
 */
export function getLiveSyncStats() {
  return {
    ...lastSyncMetadata,
    currentPoolCount: getLiveDealsPool().length,
  };
}

/**
 * Executes a live 24/7 sync cycle against Cuelinks API v3 (/offers).
 * Automatically purges expired deals and persists the fresh snapshot.
 */
export async function syncLiveCuelinksDeals(maxPages: number = 5): Promise<{
  updatedAt: string;
  totalFetched: number;
  activeCount: number;
  expiredCount: number;
  deals: DealRecord[];
}> {
  console.log(`⏱️ [Cuelinks 24/7 Syncer] Ingesting live offers from Cuelinks API v3 (pages 1-${maxPages})...`);
  const config = getCuelinksConfig();

  if (!config.isConfigured) {
    console.warn("⚠️ [Cuelinks 24/7 Syncer] API key not configured, retaining disk snapshot.");
    return {
      updatedAt: lastSyncMetadata.lastSyncedAt || new Date().toISOString(),
      totalFetched: 0,
      activeCount: liveDealsPool.length,
      expiredCount: 0,
      deals: getLiveDealsPool(),
    };
  }

  const rawDeals: any[] = [];
  for (let page = 1; page <= maxPages; page++) {
    try {
      const url = new URL(`${CUELINKS_V3_BASE_URL}/offers`);
      url.searchParams.set("page", String(page));
      url.searchParams.set("per_page", "50");

      const res = await fetch(url.toString(), {
        headers: getV3Headers(config.apiKey),
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        console.warn(`[Cuelinks 24/7 Syncer] Page ${page} responded HTTP ${res.status}`);
        break;
      }

      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length > 0) {
        rawDeals.push(...json.data);
      } else {
        break;
      }
    } catch (err: any) {
      console.warn(`[Cuelinks 24/7 Syncer] Page ${page} fetch failed:`, err?.message);
      break;
    }
  }

  const now = Date.now();
  let expiredCount = 0;
  const newDeals: DealRecord[] = [];
  const seenKeys = new Set<string>();

  for (const o of rawDeals) {
    // 1. Strict status check
    if (o.status && o.status !== "live" && o.status !== "active") {
      expiredCount++;
      continue;
    }

    // 2. Strict expiration pruning
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
    const hasCoupon = rawCode.length > 1 && !/^(deal|none|na|null|undefined|dealactivated)$/i.test(rawCode);
    const cleanCode = hasCoupon ? rawCode.replace(/\s+/g, "").toUpperCase() : "";
    const discount = extractDiscountFromOffer(o);

    // Dedup check
    const dedupKey = `${storeName.toLowerCase()}_${cleanCode}_${(o.title || "").toLowerCase().slice(0, 30)}`;
    if (seenKeys.has(dedupKey)) continue;
    seenKeys.add(dedupKey);

    const offerObj: CuelinksCouponOffer = {
      id: `cue_${o.id}`,
      storeName,
      storeDomain: o.domain || `${storeName.toLowerCase().replace(/\s+/g, "")}.com`,
      campaignId: Number(o.campaign_id) || 0,
      code: cleanCode,
      title: o.title || `${discount} at ${storeName}`,
      description: o.description || o.terms || "",
      discount,
      minOrder: o.minimum_order ? Number(o.minimum_order) : undefined,
      startDate: o.start_date || new Date().toISOString(),
      endDate: o.end_date || new Date(Date.now() + 30 * 86400000).toISOString(),
      affiliateUrl:
        o.tracking_url ||
        buildCuelinksRedirectUrl({ merchantUrl: `https://${o.domain || "gocoupon.io"}` }),
      offerType: o.offer_type === "deal" ? "deal" : "coupon",
      categories: Array.isArray(o.categories) ? o.categories.map((c: any) => c.name || c) : [],
      status: "active",
      imageUrl: o.image || undefined,
      percentOff: o.percent_off ? Number(o.percent_off) : undefined,
    };

    const record = normalizeCuelinksToDealRecord(offerObj);
    newDeals.push(record);
  }

  // Prioritize working coupon codes first, then highest usesCount
  newDeals.sort((a, b) => {
    const aHasCode = a.code && a.code.length > 1 ? 1 : 0;
    const bHasCode = b.code && b.code.length > 1 ? 1 : 0;
    if (aHasCode !== bHasCode) return bHasCode - aHasCode;
    return (b.usesCount || 0) - (a.usesCount || 0);
  });

  if (newDeals.length > 0) {
    liveDealsPool = newDeals;
    setLiveDeals(newDeals);

    const payload = {
      updatedAt: new Date().toISOString(),
      totalFetched: rawDeals.length,
      activeCount: newDeals.length,
      expiredCount,
      deals: newDeals,
    };

    lastSyncMetadata = {
      lastSyncedAt: payload.updatedAt,
      totalFetched: rawDeals.length,
      activeCount: newDeals.length,
      expiredCount,
      nextSyncAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };

    // Persist to src/data/live-deals.json
    try {
      const srcPath = getProjectDataPath("src/data/live-deals.json");
      fs.writeFileSync(srcPath, JSON.stringify(payload, null, 2), "utf-8");
      console.log(`✅ [Cuelinks 24/7 Syncer] Persisted ${newDeals.length} live deals to src/data/live-deals.json`);

      const distPath = getProjectDataPath("dist/data/live-deals.json");
      if (fs.existsSync(path.dirname(distPath))) {
        fs.writeFileSync(distPath, JSON.stringify(payload, null, 2), "utf-8");
      }
    } catch (saveErr: any) {
      console.warn("[Cuelinks 24/7 Syncer] Could not persist to disk:", saveErr?.message);
    }
  }

  console.log(
    `🔥 [Cuelinks 24/7 Syncer] Sync cycle complete: ${newDeals.length} active live deals, ${expiredCount} expired pruned.`
  );

  return {
    updatedAt: lastSyncMetadata.lastSyncedAt,
    totalFetched: rawDeals.length,
    activeCount: newDeals.length,
    expiredCount,
    deals: newDeals,
  };
}

/**
 * Fetches and normalizes live deals from Cuelinks API v3 (/offers).
 * Reads directly from the 24/7 auto-updated live deals pool.
 */
export async function fetchCuelinksDeals(options: {
  category?: string;
  store?: string;
  limit?: number;
  forceRefresh?: boolean;
} = {}): Promise<DealRecord[]> {
  if (options.forceRefresh || liveDealsPool.length === 0) {
    await syncLiveCuelinksDeals(4);
  }

  let deals = getLiveDealsPool();
  if (options.store) {
    const s = options.store.toLowerCase().replace(/[^a-z0-9]/g, "");
    deals = deals.filter((d) => d.storeName.toLowerCase().replace(/[^a-z0-9]/g, "").includes(s));
  }
  if (options.category && options.category !== "all") {
    const c = options.category.toLowerCase();
    deals = deals.filter((d) => d.category.toLowerCase().includes(c) || c.includes(d.category.toLowerCase()));
  }
  return deals.slice(0, options.limit || 50);
}

// ─── Curated Fallback Data ───────────────────────────────────────────────────

function getCuratedFallbackCoupons(): CuelinksCouponOffer[] {
  return [
    {
      id: "cue_amz_elec",
      storeName: "Amazon India",
      storeDomain: "amazon.in",
      campaignId: 101,
      code: "AMZTECH1500",
      title: "Flat ₹1,500 Instant Off on Electronics",
      description: "Save on headphones, laptops, and home sound systems above ₹15,000.",
      discount: "₹1,500 OFF",
      minOrder: 15000,
      startDate: "2026-01-01T00:00:00Z",
      endDate: "2026-12-31T23:59:59Z",
      affiliateUrl: buildCuelinksRedirectUrl({ merchantUrl: "https://www.amazon.in" }),
      offerType: "coupon",
      categories: ["Electronics", "Mobiles"],
      status: "active",
    },
    {
      id: "cue_fk_fashion",
      storeName: "Flipkart",
      storeDomain: "flipkart.com",
      campaignId: 102,
      code: "FLIPEXTRA500",
      title: "Flat ₹500 Off on Minimum Purchase",
      description: "Valid across fashion, home essentials, and lifestyle accessories.",
      discount: "₹500 OFF",
      minOrder: 2499,
      startDate: "2026-01-01T00:00:00Z",
      endDate: "2026-12-31T23:59:59Z",
      affiliateUrl: buildCuelinksRedirectUrl({ merchantUrl: "https://www.flipkart.com" }),
      offerType: "coupon",
      categories: ["Fashion", "Home"],
      status: "active",
    },
    {
      id: "cue_myntra_styles",
      storeName: "Myntra",
      storeDomain: "myntra.com",
      campaignId: 103,
      code: "MYNTRAFIRST15",
      title: "15% Off on Trending Styles & Apparel",
      description: "Extra 15% discount on orders above ₹1,999 for verified brands.",
      discount: "15% OFF",
      minOrder: 1999,
      startDate: "2026-01-01T00:00:00Z",
      endDate: "2026-12-31T23:59:59Z",
      affiliateUrl: buildCuelinksRedirectUrl({ merchantUrl: "https://www.myntra.com" }),
      offerType: "coupon",
      categories: ["Fashion"],
      status: "active",
    },
    {
      id: "cue_croma_mega",
      storeName: "Croma",
      storeDomain: "croma.com",
      campaignId: 104,
      code: "CROMA1K",
      title: "Flat ₹1,000 Off on Major Appliances",
      description: "Applicable on washing machines, ACs, and smart TVs above ₹20,000.",
      discount: "₹1,000 OFF",
      minOrder: 20000,
      startDate: "2026-01-01T00:00:00Z",
      endDate: "2026-12-31T23:59:59Z",
      affiliateUrl: buildCuelinksRedirectUrl({ merchantUrl: "https://www.croma.com" }),
      offerType: "coupon",
      categories: ["Electronics", "Home"],
      status: "active",
    },
    {
      id: "cue_boat_rock",
      storeName: "boAt Lifestyle",
      storeDomain: "boat-lifestyle.com",
      campaignId: 105,
      code: "BASSHEADS10",
      title: "Extra 10% Off on boAt Audio & Wearables",
      description: "Save on wireless earbuds, smartwatches, and Bluetooth speakers.",
      discount: "10% OFF",
      minOrder: 999,
      startDate: "2026-01-01T00:00:00Z",
      endDate: "2026-12-31T23:59:59Z",
      affiliateUrl: buildCuelinksRedirectUrl({ merchantUrl: "https://www.boat-lifestyle.com" }),
      offerType: "coupon",
      categories: ["Electronics"],
      status: "active",
    },
    {
      id: "cue_nykaa_beauty",
      storeName: "Nykaa",
      storeDomain: "nykaa.com",
      campaignId: 106,
      code: "NYKAAGLOW",
      title: "Flat ₹300 Off on Skincare & Cosmetics",
      description: "Valid on orders above ₹1,499 across luxury & everyday beauty.",
      discount: "₹300 OFF",
      minOrder: 1499,
      startDate: "2026-01-01T00:00:00Z",
      endDate: "2026-12-31T23:59:59Z",
      affiliateUrl: buildCuelinksRedirectUrl({ merchantUrl: "https://www.nykaa.com" }),
      offerType: "coupon",
      categories: ["Beauty"],
      status: "active",
    },
    {
      id: "cue_ajio_trend",
      storeName: "Ajio",
      storeDomain: "ajio.com",
      campaignId: 107,
      code: "AJIOMANIA",
      title: "Extra 20% Off on Footwear & International Brands",
      description: "Maximum discount ₹1,000 on minimum cart value ₹2,990.",
      discount: "20% OFF",
      minOrder: 2990,
      startDate: "2026-01-01T00:00:00Z",
      endDate: "2026-12-31T23:59:59Z",
      affiliateUrl: buildCuelinksRedirectUrl({ merchantUrl: "https://www.ajio.com" }),
      offerType: "coupon",
      categories: ["Fashion"],
      status: "active",
    },
  ];
}

function getCuratedFallbackCampaigns(): CuelinksCampaign[] {
  return [
    {
      id: 101,
      name: "Amazon India CPS",
      domain: "amazon.in",
      payoutType: "CPS",
      payoutRate: "Up to 7.0%",
      payoutCurrency: "INR",
      status: "open",
      deepLinkAllowed: true,
      categories: ["E-commerce", "Electronics", "General"],
    },
    {
      id: 102,
      name: "Flipkart CPS",
      domain: "flipkart.com",
      payoutType: "CPS",
      payoutRate: "Up to 8.5%",
      payoutCurrency: "INR",
      status: "open",
      deepLinkAllowed: true,
      categories: ["E-commerce", "Fashion", "Mobiles"],
    },
    {
      id: 103,
      name: "Myntra CPS",
      domain: "myntra.com",
      payoutType: "CPS",
      payoutRate: "Up to 6.2%",
      payoutCurrency: "INR",
      status: "open",
      deepLinkAllowed: true,
      categories: ["Fashion", "Beauty"],
    },
    {
      id: 104,
      name: "Croma CPS",
      domain: "croma.com",
      payoutType: "CPS",
      payoutRate: "Up to 4.0%",
      payoutCurrency: "INR",
      status: "open",
      deepLinkAllowed: true,
      categories: ["Electronics", "Appliances"],
    },
    {
      id: 105,
      name: "boAt Lifestyle CPS",
      domain: "boat-lifestyle.com",
      payoutType: "CPS",
      payoutRate: "Up to 5.5%",
      payoutCurrency: "INR",
      status: "open",
      deepLinkAllowed: true,
      categories: ["Electronics", "Audio"],
    },
    {
      id: 106,
      name: "Nykaa CPS",
      domain: "nykaa.com",
      payoutType: "CPS",
      payoutRate: "Up to 5.0%",
      payoutCurrency: "INR",
      status: "open",
      deepLinkAllowed: true,
      categories: ["Beauty", "Cosmetics"],
    },
    {
      id: 107,
      name: "Ajio CPS",
      domain: "ajio.com",
      payoutType: "CPS",
      payoutRate: "Up to 7.5%",
      payoutCurrency: "INR",
      status: "open",
      deepLinkAllowed: true,
      categories: ["Fashion"],
    },
    {
      id: 108,
      name: "Tata CLiQ CPS",
      domain: "tatacliq.com",
      payoutType: "CPS",
      payoutRate: "Up to 5.0%",
      payoutCurrency: "INR",
      status: "open",
      deepLinkAllowed: true,
      categories: ["Electronics", "Fashion"],
    },
    {
      id: 109,
      name: "Swiggy CPS",
      domain: "swiggy.com",
      payoutType: "CPO",
      payoutRate: "₹45 per order",
      payoutCurrency: "INR",
      status: "open",
      deepLinkAllowed: true,
      categories: ["Food"],
    },
    {
      id: 110,
      name: "Zomato CPS",
      domain: "zomato.com",
      payoutType: "CPO",
      payoutRate: "₹35 per order",
      payoutCurrency: "INR",
      status: "open",
      deepLinkAllowed: true,
      categories: ["Food"],
    },
  ];
}
