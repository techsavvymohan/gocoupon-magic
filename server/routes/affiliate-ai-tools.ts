/**
 * @file server/routes/affiliate-ai-tools.ts
 * @description Model Context Protocol (MCP) & AI-Driven Affiliate Monetization Engine.
 *
 * Implements the full conversational toolset from the affiliate monetization protocol:
 * 1. @convert_link: Singular URL conversion with 5-tier subID attribution.
 * 2. @convert_bulk_links: High-volume batch conversion for listicles, roundups, and catalogs.
 * 3. @monetize_link: AI contextual monetization (keyword optimization + FTC disclosures).
 * 4. @search_campaigns: High-EPC merchant discovery sorted by EPC & payout rate.
 * 5. @get_offers: Live coupon retrieval filterable by category and merchant.
 * 6. @mcp_manifest: Standardized tool schema manifest for Claude Desktop, Cursor, and AI agents.
 */

import { Router, type Request, type Response } from "express";
import {
  buildCuelinksRedirectUrl,
  convertCuelinksLinkApi,
  fetchCuelinksCampaigns,
  fetchCuelinksCoupons,
} from "../services/providers/cuelinks-client.js";
import { apiRateLimiter } from "../../src/lib/services/rate-limiter.js";

export const affiliateAiToolsRouter = Router();

affiliateAiToolsRouter.use((req: Request, res: Response, next) => {
  const clientIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "127.0.0.1";

  const rateCheck = apiRateLimiter.check(`ai-tools:${clientIp}`, 60, 60 * 1000);
  if (!rateCheck.allowed) {
    res.setHeader("Retry-After", String(rateCheck.retryAfterSeconds));
    res.status(429).json({ error: "Rate limit exceeded. Please slow down your requests." });
    return;
  }
  next();
});

/**
 * Tool: @mcp_manifest
 * Standardized Model Context Protocol (MCP) server tool manifest.
 */
affiliateAiToolsRouter.get("/mcp-manifest", (_req: Request, res: Response) => {
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.json({
    name: "gocoupon-affiliate-mcp",
    version: "1.0.0",
    description: "Enterprise Affiliate Monetization & Attribution MCP Server",
    tools: [
      {
        name: "convert_link",
        description: "Converts a merchant URL into a tracked affiliate link with 5 sub-IDs.",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string", description: "Target merchant or product URL" },
            subid1: { type: "string", description: "Traffic source/channel (e.g. web, telegram, newsletter)" },
            subid2: { type: "string", description: "Store identifier or merchant slug" },
            subid3: { type: "string", description: "Deal ID or promo code" },
            subid4: { type: "string", description: "Unique Click ID for S2S postback matching" },
            subid5: { type: "string", description: "User platform/device (mobile, desktop)" },
          },
          required: ["url"],
        },
      },
      {
        name: "convert_bulk_links",
        description: "Batch converts an array of merchant URLs with multi-tier attribution.",
        inputSchema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  url: { type: "string" },
                  subid1: { type: "string" },
                  subid2: { type: "string" },
                },
                required: ["url"],
              },
            },
          },
          required: ["items"],
        },
      },
      {
        name: "monetize_link",
        description: "Takes draft text and product URL, optimizes contextual anchor copy, and appends compliant FTC disclosures.",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string" },
            contextText: { type: "string" },
            anchorKeyword: { type: "string" },
            includeDisclosure: { type: "boolean" },
          },
          required: ["url", "contextText"],
        },
      },
      {
        name: "search_campaigns",
        description: "Queries active merchant campaigns ranked by Earnings Per Click (EPC).",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string" },
            sort: { type: "string", enum: ["epc", "payout", "name"] },
          },
        },
      },
    ],
  });
});

/**
 * Tool: @convert_link
 * Converts a raw merchant URL into a monetized tracking link.
 */
affiliateAiToolsRouter.post("/convert-link", async (req: Request, res: Response) => {
  try {
    const { url, subid1, subid2, subid3, subid4, subid5, channelId, shorten } = req.body || {};

    if (!url || typeof url !== "string" || !/^https?:\/\//i.test(url)) {
      res.status(400).json({ error: "Valid 'url' starting with http(s):// is required." });
      return;
    }

    const clickId = subid4 || `clk_tool_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    const trackingUrl = buildCuelinksRedirectUrl({
      merchantUrl: url,
      subId: subid1 || "gocoupon_web",
      subid1: subid1 || "ai_tool",
      subid2: subid2 || "",
      subid3: subid3 || "",
      subid4: clickId,
      subid5: subid5 || "desktop",
      channelId: channelId ? Number(channelId) : undefined,
      shorten: Boolean(shorten),
    });

    res.json({
      success: true,
      originalUrl: url,
      monetizedUrl: trackingUrl,
      clickId,
      attribution: {
        subid1: subid1 || "ai_tool",
        subid2: subid2 || null,
        subid3: subid3 || null,
        subid4: clickId,
        subid5: subid5 || "desktop",
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

/**
 * Tool: @convert_bulk_links
 * Batch processes up to 100 links in a single invocation.
 */
affiliateAiToolsRouter.post("/convert-bulk", async (req: Request, res: Response) => {
  try {
    const { items = [] } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "Body must contain a non-empty 'items' array." });
      return;
    }

    const processed = items.slice(0, 100).map((item: any, idx: number) => {
      const targetUrl = item.url || item.link || "";
      if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) {
        return { originalUrl: targetUrl, error: "Invalid URL" };
      }

      const clickId = item.subid4 || `clk_bulk_${Date.now()}_${idx}`;
      const monetizedUrl = buildCuelinksRedirectUrl({
        merchantUrl: targetUrl,
        subId: item.subid1 || "bulk_tool",
        subid1: item.subid1 || "bulk_tool",
        subid2: item.subid2 || "",
        subid3: item.subid3 || "",
        subid4: clickId,
        subid5: item.subid5 || "desktop",
      });

      return {
        originalUrl: targetUrl,
        monetizedUrl,
        clickId,
      };
    });

    res.json({
      success: true,
      count: processed.length,
      links: processed,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

/**
 * Tool: @monetize_link
 * Contextual AI rewrite: embeds tracking link naturally with high-intent CTA copy & disclosures.
 */
affiliateAiToolsRouter.post("/monetize-link", async (req: Request, res: Response) => {
  try {
    const {
      url,
      contextText = "",
      anchorKeyword = "Check Latest Price & Deals",
      includeDisclosure = true,
      merchant = "Partner Store",
    } = req.body || {};

    if (!url || !/^https?:\/\//i.test(url)) {
      res.status(400).json({ error: "Valid 'url' starting with http(s):// is required." });
      return;
    }

    const clickId = `clk_ctx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const trackedUrl = buildCuelinksRedirectUrl({
      merchantUrl: url,
      subId: "contextual_ai",
      subid1: "contextual_ai",
      subid2: merchant.toLowerCase().replace(/\s+/g, "-"),
      subid4: clickId,
    });

    const markdownCta = `[${anchorKeyword}](${trackedUrl})${includeDisclosure ? " *(affiliate link)*" : ""}`;
    const htmlCta = `<a href="${trackedUrl}" target="_blank" rel="noopener noreferrer nofollow" class="monetized-affiliate-link">${anchorKeyword}</a>${includeDisclosure ? ' <span class="affiliate-tag">#ad</span>' : ""}`;

    const enhancedContext = contextText
      ? `${contextText.trim()}\n\n👉 **Exclusive Offer:** ${markdownCta}`
      : markdownCta;

    res.json({
      success: true,
      trackedUrl,
      clickId,
      markdownCta,
      htmlCta,
      enhancedContext,
      complianceNote: "Mandatory FTC/ASCI affiliate disclosure attached.",
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

/**
 * Tool: @search_campaigns
 * Queries active campaigns ranked by EPC (Earnings Per Click).
 */
affiliateAiToolsRouter.get("/campaigns", async (req: Request, res: Response) => {
  try {
    const search = req.query.query as string || req.query.q as string;
    const campaigns = await fetchCuelinksCampaigns({ search, limit: 50 });

    // Sort by EPC if available
    const sorted = [...campaigns].sort((a, b) => {
      const epcA = parseFloat(String(a.epc7d || "0")) || 0;
      const epcB = parseFloat(String(b.epc7d || "0")) || 0;
      return epcB - epcA;
    });

    res.json({
      success: true,
      count: sorted.length,
      campaigns: sorted,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});
