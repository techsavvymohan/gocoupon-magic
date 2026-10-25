/**
 * @file server/routes/cuelinks.ts
 * @description Express Router for Cuelinks API v2 integration.
 *
 * Endpoints:
 * - GET  /api/cuelinks/status      Diagnostic check & API connection status
 * - GET  /api/cuelinks/coupons     Fetch verified coupons by store, domain, or category
 * - GET  /api/cuelinks/campaigns   List active merchant campaigns & commission rates
 * - POST /api/cuelinks/link        Generate SubID-attributed affiliate deep link
 * - POST /api/cuelinks/sync        Force-refresh coupons & campaigns cache
 */

import { Router, type Request, type Response } from "express";
import {
  testCuelinksConnection,
  fetchCuelinksCoupons,
  fetchCuelinksCampaigns,
  buildCuelinksRedirectUrl,
  convertCuelinksLinkApi,
  getCuelinksConfig,
  getLiveDealsPool,
} from "../services/providers/cuelinks-client.js";
import { apiRateLimiter } from "../../src/lib/services/rate-limiter.js";
import { requireAdminAuth } from "./admin.js";

export const cuelinksRouter = Router();

/**
 * Endpoint: GET /api/cuelinks/status
 * Diagnostic endpoint to check Cuelinks API key, publisher ID, and live ping.
 */
cuelinksRouter.get("/status", async (_req: Request, res: Response) => {
  const status = await testCuelinksConnection();
  const livePool = getLiveDealsPool();
  res.setHeader("Cache-Control", "no-store");
  res.json({
    status: status.connected ? "connected" : status.configured ? "error" : "fallback_mode",
    ...status,
    dealsCount: livePool.length,
    autoApplyCount: livePool.filter((d) => d.code && d.code.length > 1).length,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Endpoint: GET /api/cuelinks/coupons
 * Search & fetch coupons across Indian retailers via Cuelinks.
 */
cuelinksRouter.get("/coupons", async (req: Request, res: Response) => {
  const clientIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "127.0.0.1";

  const rateCheck = apiRateLimiter.check(clientIp, 60, 60 * 1000);
  if (!rateCheck.allowed) {
    res.setHeader("Retry-After", String(rateCheck.retryAfterSeconds));
    res.status(429).json({ error: "Rate limit exceeded. Please slow down." });
    return;
  }

  const store = (req.query.store as string) || (req.query.domain as string) || (req.query.campaign as string);
  const category = req.query.category as string;
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 50);
  const forceRefresh = req.query.refresh === "true" || req.query.force === "true";

  const offers = await fetchCuelinksCoupons({
    storeNameOrDomain: store,
    category,
    page,
    limit,
    forceRefresh,
  });

  const config = getCuelinksConfig();

  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  res.json({
    source: config.isConfigured ? "cuelinks_live_api" : "cuelinks_curated_catalog",
    publisherId: config.publisherId,
    store: store || "all",
    category: category || "all",
    page,
    limit,
    count: offers.length,
    coupons: offers,
  });
});

/**
 * Endpoint: GET /api/cuelinks/campaigns
 * List active merchant campaigns and commission rates.
 */
cuelinksRouter.get("/campaigns", async (req: Request, res: Response) => {
  const search = req.query.search as string;
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit as string, 10) || 50, 100);
  const forceRefresh = req.query.refresh === "true";

  const campaigns = await fetchCuelinksCampaigns({
    search,
    page,
    limit,
    forceRefresh,
  });

  const config = getCuelinksConfig();

  res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1200");
  res.json({
    source: config.isConfigured ? "cuelinks_live_api" : "cuelinks_curated_catalog",
    publisherId: config.publisherId,
    search: search || null,
    page,
    limit,
    count: campaigns.length,
    campaigns,
  });
});

/**
 * Endpoint: POST /api/cuelinks/link
 * Generates an affiliate redirect URL with optional custom subid.
 */
cuelinksRouter.post("/link", async (req: Request, res: Response) => {
  const { url, subId, shorten, channelId } = req.body || {};

  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "Missing or invalid 'url' string parameter." });
    return;
  }

  if (!/^https?:\/\//i.test(url)) {
    res.status(400).json({ error: "URL must start with http:// or https://" });
    return;
  }

  const result = await convertCuelinksLinkApi({
    merchantUrl: url,
    subId: typeof subId === "string" ? subId : "gocoupon_web",
    shorten: Boolean(shorten),
    channelId: typeof channelId === "number" ? channelId : undefined,
  });

  const config = getCuelinksConfig();

  res.json({
    originalUrl: url,
    affiliateUrl: result.trackingUrl,
    shortUrl: result.shortUrl,
    campaign: result.campaign,
    isApiConverted: result.isApiConverted,
    publisherId: config.publisherId,
    network: "cuelinks",
    protocol: result.isApiConverted ? "cuelinks_v3_api" : "linksredirect",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Endpoint: POST /api/cuelinks/sync
 * Flushes cache and forces live re-fetch from Cuelinks API.
 */
cuelinksRouter.post("/sync", requireAdminAuth, async (_req: Request, res: Response) => {
  const status = await testCuelinksConnection();
  const [coupons, campaigns] = await Promise.all([
    fetchCuelinksCoupons({ forceRefresh: true, limit: 30 }),
    fetchCuelinksCampaigns({ forceRefresh: true, limit: 50 }),
  ]);

  res.json({
    synced: true,
    connection: status,
    couponsCount: coupons.length,
    campaignsCount: campaigns.length,
    timestamp: new Date().toISOString(),
  });
});
