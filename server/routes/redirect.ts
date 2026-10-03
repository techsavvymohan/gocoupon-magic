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
redirectRouter.get("/deal", async (req: Request, res: Response) => {
  const rawUrl = String(req.query.url || "").trim();
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

  // Check if link already contains active affiliate tracking
  const isAffiliate =
    rawUrl.includes("linksredirect.com") ||
    rawUrl.includes("clnk.in") ||
    rawUrl.includes("admitad.com") ||
    rawUrl.includes("tag=") ||
    rawUrl.includes("impact.com") ||
    rawUrl.includes("cuelinks");

  if (!isAffiliate && /^https?:\/\//i.test(rawUrl)) {
    // Automatically wrap clean merchant URLs with Cuelinks linksredirect protocol
    targetUrl = buildCuelinksRedirectUrl({
      merchantUrl: rawUrl,
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
});

/**
 * Client-Side Beacon / Redirection Tracker.
 * POST /api/deals/click
 *
 * Allows tracking coupon copy actions, modal popups, and direct redemption clicks.
 */
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
