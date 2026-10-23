/**
 * @file server/routes/postback.ts
 * @description Enterprise Server-to-Server (S2S) Postback & Conversion Webhook Router.
 *
 * Implements:
 * - GET & POST /api/postback/conversion: Ingests real-time affiliate conversion callbacks
 * - GET /api/postback/analytics: Real-time revenue, conversion rate & EPC diagnostics
 * - POST /api/postback/simulate: Tests and verifies S2S postback pipeline end-to-end
 * - POST /api/postback/claims: Dispatches missing-transaction dispute claims
 * - GET /api/postback/claims: Lists ongoing claims and status
 */

import { Router, type Request, type Response } from "express";
import { conversionsDb } from "../services/conversions-service.js";
import { requireAdminAuth } from "./admin.js";

export const postbackRouter = Router();

/**
 * Universal S2S Postback Ingestion Handler.
 * Accepts both GET and POST requests from affiliate networks.
 */
async function handleConversionPostback(req: Request, res: Response) {
  try {
    const data = req.method === "POST" ? req.body || {} : req.query || {};

    // Standardize transaction ID
    const transactionId = String(
      data.transaction_id ||
      data.tx_id ||
      data.order_id ||
      data.orderId ||
      data.action_id ||
      data.conv_id ||
      `tx_${Date.now()}`
    ).trim();

    // Standardize subIDs
    const subid1 = String(data.subid1 || data.sub_id1 || data.source || data.channel || "web").trim();
    const subid2 = String(data.subid2 || data.sub_id2 || data.store || data.merchant || "").trim();
    const subid3 = String(data.subid3 || data.sub_id3 || data.deal_id || data.dealId || "").trim();
    const subid4 = String(data.subid4 || data.sub_id4 || data.click_id || data.clickId || "").trim();
    const subid5 = String(data.subid5 || data.sub_id5 || data.device || "").trim();

    // Primary subid fallback
    const rawSubid = String(data.subid || data.sub_id || "").trim();
    const effectiveClickId = subid4 || (rawSubid.startsWith("clk_") ? rawSubid : undefined);

    // Standardize financials (including Admitad order_sum & payment)
    const saleAmount = parseFloat(
      String(data.sale_amount || data.amount || data.sale || data.order_amount || data.order_sum || data.cart || "0")
    ) || 0;

    const commissionAmount = parseFloat(
      String(data.commission_amount || data.commission || data.payout || data.earnings || data.payment || "0")
    ) || 0;

    const currency = String(data.currency || data.curr || "INR").toUpperCase();

    // Normalize status
    const rawStatus = String(data.status || "approved").toLowerCase();
    let status: "approved" | "pending" | "rejected" | "cancelled" = "approved";
    if (rawStatus.includes("pend") || rawStatus.includes("hold") || rawStatus.includes("lead")) {
      status = "pending";
    } else if (rawStatus.includes("reject") || rawStatus.includes("decline")) {
      status = "rejected";
    } else if (rawStatus.includes("cancel")) {
      status = "cancelled";
    }

    const network = String(data.network || data.provider || "partner_network").trim();
    const campaignId = data.campaign_id || data.campaignId;
    const campaignName = String(data.campaign_name || data.advcampaign_name || data.campaign || subid2 || "Affiliate Campaign").trim();
    const storeSlug = subid2 || String(data.store_slug || "").trim();
    const storeName = String(data.store_name || data.merchant || subid2 || "Partner Merchant").trim();

    const record = await conversionsDb.recordConversion({
      transactionId,
      clickId: effectiveClickId,
      network,
      campaignId,
      campaignName,
      storeSlug,
      storeName,
      subid1,
      subid2,
      subid3,
      subid4,
      subid5,
      saleAmount,
      commissionAmount,
      currency,
      status,
      rawPayload: data,
    });

    console.log(
      `💰 [S2S Postback] Recorded conversion ${record.transactionId} for ${record.storeName} (${currency} ${commissionAmount} commission, status: ${status})`
    );

    res.status(200).json({
      success: true,
      message: "Conversion postback accepted and recorded.",
      conversionId: record.id,
      transactionId: record.transactionId,
      status: record.status,
      matchedClickId: record.clickId || null,
      timestamp: record.createdAt,
    });
  } catch (err: any) {
    console.error("[S2S Postback] Ingestion error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to process conversion postback.",
      details: err?.message,
    });
  }
}

// Ingestion endpoints (HTTP GET and POST)
postbackRouter.get("/conversion", handleConversionPostback);
postbackRouter.post("/conversion", handleConversionPostback);
postbackRouter.get("/", handleConversionPostback);
postbackRouter.post("/", handleConversionPostback);

/**
 * Diagnostic Analytics Endpoint: GET /api/postback/analytics
 */
postbackRouter.get("/analytics", async (_req: Request, res: Response) => {
  try {
    const stats = await conversionsDb.getConversionAnalytics();
    res.setHeader("Cache-Control", "no-store");
    res.json({
      success: true,
      provider: "GoCoupon S2S Postback Engine",
      architecture: "Ad-Blocker & ITP Immune Server-to-Server Attribution",
      ...stats,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

/**
 * Diagnostic Postback Simulator: POST /api/postback/simulate
 * Allows testing postbacks locally and verifying database records.
 */
postbackRouter.post("/simulate", async (req: Request, res: Response) => {
  try {
    const {
      storeName = "Hostinger",
      orderAmount = 3499,
      commissionAmount = 1400,
      currency = "INR",
      status = "approved",
      subid = "gocoupon_web",
      clickId,
    } = req.body || {};

    const testTxId = `sim_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const effectiveClickId = clickId || `clk_sim_${Date.now()}`;

    const record = await conversionsDb.recordConversion({
      transactionId: testTxId,
      clickId: effectiveClickId,
      network: "partner_network",
      storeName,
      storeSlug: storeName.toLowerCase().replace(/\s+/g, "-"),
      campaignName: `${storeName} Partner Campaign`,
      saleAmount: Number(orderAmount),
      commissionAmount: Number(commissionAmount),
      currency,
      status,
      subid1: "test_simulation",
      subid2: storeName.toLowerCase(),
      subid4: effectiveClickId,
    });

    res.json({
      success: true,
      message: "Simulation postback successfully recorded into database.",
      conversion: record,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

/**
 * Missing Transaction Dispute Claim Filing: POST /api/postback/claims
 * Directly addresses the @manage_missing_transactions capability from Blog 1.
 */
postbackRouter.post("/claims", async (req: Request, res: Response) => {
  try {
    const { storeName, orderId, orderAmount, orderDate, subid, notes } = req.body || {};

    if (!storeName || !orderId) {
      res.status(400).json({ error: "Missing required fields: storeName and orderId." });
      return;
    }

    const claim = await conversionsDb.fileMissingClaim({
      storeName: String(storeName).trim(),
      orderId: String(orderId).trim(),
      orderAmount: Number(orderAmount) || 0,
      orderDate: String(orderDate || new Date().toISOString().slice(0, 10)),
      subid: subid ? String(subid).trim() : undefined,
      notes: notes ? String(notes).trim() : undefined,
    });

    res.json({
      success: true,
      message: "Missing transaction claim registered and queued for network audit.",
      claim,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

/**
 * List Missing Transaction Claims: GET /api/postback/claims
 */
postbackRouter.get("/claims", async (_req: Request, res: Response) => {
  try {
    const claims = await conversionsDb.getMissingClaims();
    res.json({
      success: true,
      count: claims.length,
      claims,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});
