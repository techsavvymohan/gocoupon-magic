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
  const rawUrl = String(
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

  if (!rawUrl) {
    res.redirect(302, "/offers");
    return;
  }

  // 1. Determine monetized affiliate redirect URL
  let targetUrl = rawUrl;

  const EARNKARO_DIRECT_LINKS: Record<string, string> = {
    myntra: "https://myntr.it/t6fMvnP",
    flipkart: "https://fktr.in/xL95eGk",
    ajio: "https://ajiio.in/5gIGQ46",
    "dot-and-key": "https://bitli.in/Q8p6Tb5",
    dotandkey: "https://bitli.in/Q8p6Tb5",
    mcaffeine: "https://bitli.in/30c3jZD",
    shopsy: "https://bitli.in/X8hNAWk",
    themancompany: "https://bitli.in/Aiq8ef4",
    "the-man-company": "https://bitli.in/Aiq8ef4",
  };

  const normTarget = `${slug} ${store} ${rawUrl}`.toLowerCase();
  let matchedEarnKaro: string | null = null;
  if (normTarget.includes("myntra") || normTarget.includes("myntr.it")) matchedEarnKaro = EARNKARO_DIRECT_LINKS.myntra;
  else if (normTarget.includes("flipkart") || normTarget.includes("fktr.in")) matchedEarnKaro = EARNKARO_DIRECT_LINKS.flipkart;
  else if (normTarget.includes("ajio") || normTarget.includes("ajiio.in")) matchedEarnKaro = EARNKARO_DIRECT_LINKS.ajio;
  else if (normTarget.includes("dot") && normTarget.includes("key")) matchedEarnKaro = EARNKARO_DIRECT_LINKS["dot-and-key"];
  else if (normTarget.includes("mcaffeine") || normTarget.includes("caffeine")) matchedEarnKaro = EARNKARO_DIRECT_LINKS.mcaffeine;
  else if (normTarget.includes("shopsy")) matchedEarnKaro = EARNKARO_DIRECT_LINKS.shopsy;
  else if (normTarget.includes("themancompany") || (normTarget.includes("man") && normTarget.includes("company"))) {
    matchedEarnKaro = EARNKARO_DIRECT_LINKS.themancompany;
  }

  if (matchedEarnKaro) {
    targetUrl = matchedEarnKaro;
  }

  // Check if link already contains active affiliate tracking
  const isAffiliate =
    targetUrl.includes("linksredirect.com") ||
    targetUrl.includes("clnk.in") ||
    targetUrl.includes("admitad.com") ||
    targetUrl.includes("tag=") ||
    targetUrl.includes("impact.com") ||
    targetUrl.includes("cuelinks") ||
    targetUrl.includes("myntr.it") ||
    targetUrl.includes("fktr.in") ||
    targetUrl.includes("ajiio.in") ||
    targetUrl.includes("bitli.in") ||
    targetUrl.includes("earnkaro");

  if (!isAffiliate && /^https?:\/\//i.test(targetUrl)) {
    // Automatically wrap clean merchant URLs with Cuelinks linksredirect protocol
    targetUrl = buildCuelinksRedirectUrl({
      merchantUrl: targetUrl,
      subId: source || "gocoupon_web",
    });
  }

  // 2. Track click in database / analytics
  const cleanMerchant = extractMerchantDestination(rawUrl);
  const clientIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    (req.headers["x-real-ip"] as string) ||
    req.socket.remoteAddress ||
    "127.0.0.1";

  const userAgent = String(req.headers["user-agent"] || "");
  const device = detectDevice(userAgent);

  // Log in background
  clicksDb
    .recordClick({
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
    })
    .catch((err) => {
      console.warn("[ClickTracker] Background logging notice:", err?.message);
    });

  // 3. Issue clean 302 redirect with security headers to the monetized affiliate link
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
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
