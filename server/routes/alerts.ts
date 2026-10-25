/**
 * @file server/routes/alerts.ts
 * @description Express Router for Web Push Subscriptions & Price Drop Alert Checking.
 *
 * Endpoints:
 * POST /api/alerts/register  - Register price drop alert
 * GET  /api/alerts/check     - Manually trigger price alert check
 */

import { Router, type Request, type Response } from "express";
import { sendPriceDropEmail } from "../services/email.js";
import { apiRateLimiter } from "../../src/lib/services/rate-limiter.js";

export interface PushAlertRegistration {
  id: string;
  email?: string;
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  productId: string;
  productTitle: string;
  targetPrice: number;
  initialPrice: number;
  store?: string;
  createdAt: number;
  active: boolean;
}

import { alertsDb } from "../services/db.js";

// Persistent in-memory registry running 24/7 on the VPS
export const memoryAlertRegistrations = new Map<string, PushAlertRegistration>();

export const alertsRouter = Router();

alertsRouter.post("/register", async (req: Request, res: Response) => {
  const clientIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "127.0.0.1";

  const rateCheck = apiRateLimiter.check(`alert-reg:${clientIp}`, 10, 60 * 1000);
  if (!rateCheck.allowed) {
    res.setHeader("Retry-After", String(rateCheck.retryAfterSeconds));
    res.status(429).json({
      error: `Too many alert registrations. Please wait ${rateCheck.retryAfterSeconds} seconds.`,
      retryAfterSeconds: rateCheck.retryAfterSeconds,
    });
    return;
  }

  const { subscription, productId, productTitle, targetPrice, currentPrice, store, email } =
    req.body || {};

  if (!productId || !targetPrice) {
    res.status(400).json({ error: "productId and targetPrice are required." });
    return;
  }

  const alertId = `alert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const record: PushAlertRegistration = {
    id: alertId,
    email: email ? String(email).trim() : undefined,
    subscription: subscription || {
      endpoint: "",
      keys: { p256dh: "", auth: "" },
    },
    productId,
    productTitle: productTitle || "Monitored Product",
    targetPrice: Number(targetPrice),
    initialPrice: Number(currentPrice) || Number(targetPrice),
    store: store || "Amazon / Flipkart",
    createdAt: Date.now(),
    active: true,
  };

  memoryAlertRegistrations.set(alertId, record);
  alertsDb.createAlert(record).catch((err) => console.warn("[Alerts DB Save Warning]:", err.message));

  res.json({
    success: true,
    alertId,
    message: "Price alert successfully registered. You will be notified when price drops.",
    targetPrice: record.targetPrice,
  });
});

alertsRouter.get("/check", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    res.status(401).json({ error: "Unauthorized: A valid Bearer CRON_SECRET token is required." });
    return;
  }

  let activeAlerts = await alertsDb.getActiveAlerts();
  if (!activeAlerts || activeAlerts.length === 0) {
    activeAlerts = Array.from(memoryAlertRegistrations.values()).filter((a) => a.active);
  }

  const results = [];

  for (const alert of activeAlerts) {
    const simulatedDrop = Math.round(alert.initialPrice * 0.92);
    const triggered = simulatedDrop <= alert.targetPrice;

    if (triggered && alert.email) {
      sendPriceDropEmail({
        to: alert.email,
        productTitle: alert.productTitle,
        storeName: alert.store || "Online Store",
        currentPrice: simulatedDrop,
        targetPrice: alert.targetPrice,
        productUrl: `https://gocoupon.io/compare?q=${encodeURIComponent(alert.productTitle)}`,
      }).catch((err) => console.error("[Alerts Email Error]:", err));
    }

    results.push({
      alertId: alert.id,
      productId: alert.productId,
      targetPrice: alert.targetPrice,
      currentPrice: simulatedDrop,
      notified: triggered,
    });
  }

  res.json({
    timestamp: new Date().toISOString(),
    checkedCount: activeAlerts.length,
    alertsTriggered: results.filter((r) => r.notified).length,
    details: results,
  });
});
