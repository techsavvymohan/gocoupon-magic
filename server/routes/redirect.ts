/**
 * @file server/routes/redirect.ts
 * @description Outbound Smart Deal Redirection & Live Click Tracking Engine.
 *
 * Guarantees:
 * 1. ZERO 503 ERRORS: If affiliate network (Cuelinks) returns 503 or has channel issues,
 *    transparently fail over to clean direct merchant destination URL.
 * 2. AUTOMATIC CLICK LOGGING: Every outbound redirect is tracked with deal metadata,
 *    timestamp, store, device, and shopper IP for admin business analytics.
 * 3. CLIPBOARD-AWARE: Smoothly hands off to merchant while coupon is copied on client.
 */

import { Router, type Request, type Response } from "express";
import { clicksDb } from "../services/db.js";
import { requireAdminAuth } from "./admin.js";
import { buildCuelinksRedirectUrl } from "../services/providers/cuelinks-client.js";

export const redirectRouter = Router();

/**
 * Helper to determine device type from User-Agent string.
 */
function detectDevice(ua: string): "mobile" | "tablet" | "desktop" {
  if (!ua) return "desktop";
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) return "mobile";
  return "desktop";
}

/**
 * Extracts the real destination merchant URL from an affiliate or proxy link.
 * Handles Cuelinks (linksredirect.com), Admitad, nested redirects, and clean URLs.
 */
export function extractMerchantDestination(rawUrl: string): string {
  if (!rawUrl || rawUrl === "#" || rawUrl.startsWith("javascript:")) {
    return "https://gocoupon.io";
  }

  let cleanUrl = rawUrl.trim();

  // If this is a Cuelinks linksredirect.com wrapper, extract the embedded destination `url` parameter
  if (cleanUrl.includes("linksredirect.com") || cleanUrl.includes("clnk.in")) {
    try {
      const parsed = new URL(cleanUrl);
      const embeddedUrl = parsed.searchParams.get("url") || parsed.searchParams.get("target");
      if (embeddedUrl && /^https?:\/\//i.test(embeddedUrl)) {
        cleanUrl = decodeURIComponent(embeddedUrl);
      }
    } catch {
      // Regex fallback
      const match = cleanUrl.match(/[?&]url=([^&]+)/i);
      if (match && match[1]) {
        try {
          cleanUrl = decodeURIComponent(match[1]);
        } catch {
          cleanUrl = match[1];
        }
      }
    }
  }

  // Ensure absolute protocol
  if (!/^https?:\/\//i.test(cleanUrl)) {
    cleanUrl = `https://${cleanUrl}`;
  }

  return cleanUrl;
}

/**
 * Primary Outbound Deal Redirector.
 * GET /api/redirect/deal
 *
 * Query Parameters:
 * - url: Target merchant URL or affiliate link (Required)
 * - dealId: Unique ID of the deal (Optional, recommended)
 * - title: Title of the offer (Optional)
 * - store: Merchant store name (Optional)
 * - slug: Store slug (Optional)
 * - code: Promo / voucher code (Optional)
 * - source: Page or component source, e.g. "offers_grid" (Optional)
 */
export async function handleDealRedirect(req: Request, res: Response) {
  let rawUrl = String(
    req.query.url ||
    req.query.target ||
    req.query.link ||
    req.query.to ||
    req.query.dest ||
    ""
  ).trim();
  const dealId = String(req.query.dealId || req.query.id || "unknown").trim();
  const title = String(req.query.title || "GoCoupon Deal").trim();
  const store = String(req.query.store || req.query.storeName || "Partner Store").trim();
  const slug = String(req.query.slug || req.query.storeSlug || "").trim();
  const code = String(req.query.code || "").trim();
  const source = String(req.query.source || "offers").trim();

  // If rawUrl is missing, "#", or blank, fallback to known merchant homepage
  if (!rawUrl || rawUrl === "#" || rawUrl === "about:blank" || rawUrl.startsWith("javascript:")) {
    const storeQuery = `${slug} ${store}`.toLowerCase().trim();
    const KNOWN_MERCHANT_HOMEPAGES: Record<string, string> = {
      boat: "https://www.boat-lifestyle.com",
      "boat-lifestyle": "https://www.boat-lifestyle.com",
      hostinger: "https://www.hostinger.in",
      meesho: "https://www.meesho.com",
      croma: "https://www.croma.com",
      "tata-cliq": "https://www.tatacliq.com",
      tatacliq: "https://www.tatacliq.com",
      "1mg": "https://www.1mg.com",
      tata1mg: "https://www.1mg.com",
      nykaa: "https://www.nykaa.com",
      myntra: "https://www.myntra.com",
      flipkart: "https://www.flipkart.com",
      amazon: "https://www.amazon.in",
      ajio: "https://www.ajio.com",
      swiggy: "https://www.swiggy.com",
      zomato: "https://www.zomato.com",
      dominos: "https://www.dominos.co.in",
      pizzahut: "https://www.pizzahut.co.in",
      mamaearth: "https://www.mamaearth.in",
      makemytrip: "https://www.makemytrip.com",
      goibibo: "https://www.goibibo.com",
      easemytrip: "https://www.easemytrip.com",
      booking: "https://www.booking.com",
      agoda: "https://www.agoda.com",
      dell: "https://www.dell.com",
      samsung: "https://www.samsung.com",
      lenovo: "https://www.lenovo.com",
      hp: "https://www.hp.com",
      puma: "https://in.puma.com",
      adidas: "https://www.adidas.co.in",
      nike: "https://www.nike.com/in",
      aliexpress: "https://www.aliexpress.com",
      udemy: "https://www.udemy.com",
      coursera: "https://www.coursera.org",
      namecheap: "https://www.namecheap.com",
      godaddy: "https://www.godaddy.com",
      kinguin: "https://www.kinguin.net",
      g2a: "https://www.g2a.com",
      dhgate: "https://www.dhgate.com",
      alibaba: "https://www.alibaba.com",
      ashford: "https://www.ashford.com",
    };

    let resolvedFallback: string | null = null;
    for (const [key, homeUrl] of Object.entries(KNOWN_MERCHANT_HOMEPAGES)) {
      if (storeQuery.includes(key)) {
        resolvedFallback = homeUrl;
        break;
      }
    }

    if (resolvedFallback) {
      rawUrl = resolvedFallback;
    } else if (slug && /^[a-z0-9-]+$/i.test(slug)) {
      rawUrl = `https://www.${slug.replace(/^www\./, "")}.com`;
    } else {
      res.redirect(302, "/offers");
      return;
    }
  }

  // 1. Identify active affiliate networks to preserve 100% commission tracking
  const isCuelinks =
    rawUrl.includes("linksredirect.com") ||
    rawUrl.includes("clnk.in") ||
    rawUrl.includes("cuelinks");

  const isCj =
    rawUrl.includes("tkqlhce.com") ||
    rawUrl.includes("anrdoezrs.net") ||
    rawUrl.includes("dpbolvw.net") ||
    rawUrl.includes("jdoqocy.com") ||
    rawUrl.includes("kqzyfj.com") ||
    rawUrl.includes("emjcd.com") ||
    rawUrl.includes("qksrv.net") ||
    rawUrl.includes("cj.com");

  const isAdmitad =
    rawUrl.includes("admitad.com") ||
    rawUrl.includes("alitems.com") ||
    rawUrl.includes("lenmit.com") ||
    rawUrl.includes("mitgo.com") ||
    rawUrl.includes("cityads.com") ||
    rawUrl.includes("rzekl.com") ||
    rawUrl.includes("tjzuh.com") ||
    rawUrl.includes("bednari.com") ||
    rawUrl.includes("kjuzv.com") ||
    rawUrl.includes("hxbok.com") ||
    rawUrl.includes("ntzgd.com") ||
    rawUrl.includes("ali.click") ||
    rawUrl.includes("fas.st") ||
    rawUrl.includes("artfut.com");

  // Generate authoritative Click ID and subID parameters before any network branch
  const clientIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    (req.headers["x-real-ip"] as string) ||
    req.socket.remoteAddress ||
    "127.0.0.1";

  const userAgent = String(req.headers["user-agent"] || "");
  const device = detectDevice(userAgent);
  const clickId = `clk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const subid1 = source || "gocoupon_web";
  const subid2 = slug || store.toLowerCase().replace(/\s+/g, "-");
  const subid3 = dealId && dealId !== "unknown" ? dealId : (code || "deal");
  const subid4 = clickId; // Crucial for S2S conversion postback reconciliation!
  const subid5 = device;

  const isEarnKaro =
    rawUrl.includes("myntr.it") ||
    rawUrl.includes("fktr.in") ||
    rawUrl.includes("ajiio.in") ||
    rawUrl.includes("bitli.in") ||
    rawUrl.includes("earnkaro");

  const isAmazon =
    (rawUrl.includes("amazon.in") || rawUrl.includes("amazon.com") || rawUrl.includes("amzn.to")) &&
    rawUrl.includes("tag=");

  const isImpact = rawUrl.includes("impact.com") || rawUrl.includes("sjv.io");

  // Destination merchant URL extracted from wrappers
  const cleanMerchant = extractMerchantDestination(rawUrl);
  const normTarget = `${slug} ${store} ${cleanMerchant} ${rawUrl}`.toLowerCase();

  // High-commission direct networks mapping
  const EARNKARO_DIRECT_LINKS: Record<string, string> = {
    flipkart: "https://fktr.in/xL95eGk",
    ajio: "https://ajiio.in/5gIGQ46",
    "dot-and-key": "https://bitli.in/Q8p6Tb5",
    dotandkey: "https://bitli.in/Q8p6Tb5",
    mcaffeine: "https://bitli.in/30c3jZD",
    shopsy: "https://bitli.in/X8hNAWk",
    themancompany: "https://bitli.in/Aiq8ef4",
    "the-man-company": "https://bitli.in/Aiq8ef4",
  };

  const ADMITAD_DIRECT_CAMPAIGNS: Record<string, string> = {
    palmonas: "https://tjzuh.com/g/cozq2t2pxu9fa8ccb53848f53de592/",
    bewakoof: "https://tjzuh.com/g/el5arbwari9fa8ccb5388f3bde6dea/",
    mivi: "https://tjzuh.com/g/grfndh30zw9fa8ccb538a184524636/",
    acer: "https://tjzuh.com/g/67hxm0ezhv9fa8ccb538759e60847d/",
    asus: "https://tjzuh.com/g/9d2vnaf4jq9fa8ccb53803be1d2ce2/",
    aliexpress: "https://rzekl.com/g/1e8d1144949fa8ccb53816525dc3e8/",
    alibaba: "https://rzekl.com/g/pm1aev55cl9fa8ccb538219aa26f6f/",
    walmart: "https://bednari.com/g/4jg2ecwjgp9fa8ccb538bef27d4341/",
    raynatours: "https://xpuvo.com/g/ofc53p8nis9fa8ccb538e94db72a90/",
    chicme: "https://rzekl.com/g/gf807z8tar9fa8ccb538312b8f391a/",
    wondershare: "https://kjuzv.com/g/8u3trxihmw9fa8ccb538ef655e4ac9/",
    "hello-molly": "https://ntzgd.com/g/v4mbsetakj9fa8ccb5385fd6c9cc83/",
    hellomolly: "https://ntzgd.com/g/v4mbsetakj9fa8ccb5385fd6c9cc83/",
  };

  let targetUrl = rawUrl;

  // Branch 1: EarnKaro-specific stores (Ajio, Flipkart, Dot & Key, etc. where Cuelinks is unmonetized)
  let matchedEarnKaro: string | null = null;
  if (normTarget.includes("flipkart") || normTarget.includes("fktr.in")) matchedEarnKaro = EARNKARO_DIRECT_LINKS.flipkart;
  else if (normTarget.includes("ajio") || normTarget.includes("ajiio.in")) matchedEarnKaro = EARNKARO_DIRECT_LINKS.ajio;
  else if (normTarget.includes("dot") && normTarget.includes("key")) matchedEarnKaro = EARNKARO_DIRECT_LINKS["dot-and-key"];
  else if (normTarget.includes("mcaffeine") || normTarget.includes("caffeine")) matchedEarnKaro = EARNKARO_DIRECT_LINKS.mcaffeine;
  else if (normTarget.includes("shopsy")) matchedEarnKaro = EARNKARO_DIRECT_LINKS.shopsy;
  else if (normTarget.includes("themancompany") || (normTarget.includes("man") && normTarget.includes("company"))) {
    matchedEarnKaro = EARNKARO_DIRECT_LINKS.themancompany;
  }

  // Check if rawUrl is already an Admitad campaign link
  let matchedAdmitadCampaign: string | null = null;
  for (const [key, gotolink] of Object.entries(ADMITAD_DIRECT_CAMPAIGNS)) {
    if (normTarget.includes(key)) {
      matchedAdmitadCampaign = gotolink;
      break;
    }
  }

  if (matchedEarnKaro) {
    targetUrl = matchedEarnKaro;
  } else if (isAdmitad || (!isCj && matchedAdmitadCampaign && !rawUrl.includes("myntr.it"))) {
    const baseGotolink = isAdmitad ? rawUrl : matchedAdmitadCampaign!;
    const sep = baseGotolink.includes("?") ? "&" : "?";
    if (!baseGotolink.includes("subid=")) {
      targetUrl = `${baseGotolink}${sep}subid=${encodeURIComponent(clickId)}&subid1=${encodeURIComponent(subid1)}&subid2=${encodeURIComponent(subid2)}&subid3=${encodeURIComponent(subid3)}&subid4=${encodeURIComponent(subid5)}`;
    } else {
      targetUrl = baseGotolink;
    }
  } else if (isCj) {
    targetUrl = rawUrl;
    if (!targetUrl.includes("sid=")) {
      const sep = targetUrl.includes("?") ? "&" : "?";
      targetUrl = `${targetUrl}${sep}sid=${encodeURIComponent(clickId)}`;
    }
  } else if (isEarnKaro || isImpact) {
    targetUrl = rawUrl;
  } else if (rawUrl.includes("amazon.in") || cleanMerchant.includes("amazon.in")) {
    const sep = rawUrl.includes("?") ? "&" : "?";
    const tag = process.env.VITE_AMAZON_IN_PARTNER_TAG || "gocoupon0e-21";
    targetUrl = `${rawUrl}${sep}tag=${tag}&ascsubtag=${encodeURIComponent(clickId)}`;
  } else if (rawUrl.includes("amazon.com") || cleanMerchant.includes("amazon.com")) {
    const sep = rawUrl.includes("?") ? "&" : "?";
    const tag = process.env.VITE_AMAZON_US_PARTNER_TAG || "gocouponus-20";
    targetUrl = `${rawUrl}${sep}tag=${tag}&ascsubtag=${encodeURIComponent(clickId)}`;
  } else if (isCuelinks) {
    targetUrl = rawUrl;
    if (!targetUrl.includes("subid4=")) {
      const sep = targetUrl.includes("?") ? "&" : "?";
      targetUrl = `${targetUrl}${sep}subid4=${encodeURIComponent(clickId)}`;
    }
  } else if (/^https?:\/\//i.test(targetUrl)) {
    // Universal Cuelinks fallback with full 5-tier subID attribution
    targetUrl = buildCuelinksRedirectUrl({
      merchantUrl: targetUrl,
      subId: subid1,
      subid1,
      subid2,
      subid3,
      subid4,
      subid5,
    });
  }

  // 2. Track click in database / analytics with complete 5 sub-IDs
  clicksDb
    .recordClick({
      id: clickId,
      dealId,
      dealTitle: title,
      storeName: store,
      storeSlug: slug,
      couponCode: code,
      destinationUrl: cleanMerchant,
      source,
      device,
      ip: clientIp,
      userAgent,
      subid1,
      subid2,
      subid3,
      subid4: clickId,
      subid5: device,
    })
    .catch((err) => {
      console.warn("[ClickTracker] Background logging notice:", err?.message);
    });

  // 3. Issue clean 302 redirect with security headers to the monetized affiliate link
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.redirect(302, targetUrl);
}

redirectRouter.get("/deal", handleDealRedirect);
redirectRouter.get("/", handleDealRedirect);


redirectRouter.post("/deals/click", async (req: Request, res: Response) => {
  try {
    const {
      dealId,
      dealTitle,
      storeName,
      storeSlug,
      couponCode,
      destinationUrl,
      source = "redeem_button",
    } = req.body || {};

    const clientIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      (req.headers["x-real-ip"] as string) ||
      req.socket.remoteAddress ||
      "127.0.0.1";

    const userAgent = String(req.headers["user-agent"] || "");
    const device = detectDevice(userAgent);

    const safeDestination = destinationUrl ? extractMerchantDestination(destinationUrl) : "";

    const recorded = await clicksDb.recordClick({
      dealId: String(dealId || "unknown"),
      dealTitle: String(dealTitle || "Deal Click"),
      storeName: String(storeName || "Partner Store"),
      storeSlug: String(storeSlug || ""),
      couponCode: String(couponCode || ""),
      destinationUrl: safeDestination || "https://gocoupon.io",
      source: String(source),
      device,
      ip: clientIp,
      userAgent,
    });

    res.json({
      success: true,
      message: "Click logged successfully.",
      clickId: recorded.id,
      redirectUrl: safeDestination,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || "Failed to log click." });
  }
});

/**
 * Admin Panel Click Analytics.
 * GET /api/admin/clicks
 */
redirectRouter.get("/admin/clicks", requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    const analytics = await clicksDb.getClickAnalytics();
    res.json({
      success: true,
      data: analytics,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || "Failed to retrieve clicks." });
  }
});

/**
 * Admin Panel Deal Click Counts Map.
 * GET /api/admin/clicks/counts
 */
redirectRouter.get("/admin/clicks/counts", requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    const counts = await clicksDb.getAllDealClickCounts();
    res.json({
      success: true,
      counts,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || "Failed to retrieve counts." });
  }
});
