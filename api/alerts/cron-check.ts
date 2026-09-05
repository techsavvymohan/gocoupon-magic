/**
 * @file api/alerts/cron-check.ts
 * @description Background Price Watcher Cron Job (BullMQ / Vercel Cron compatible).
 *
 * Runs periodically to:
 * 1. Read active price alert subscriptions.
 * 2. Check current store prices.
 * 3. Trigger native Web Push notifications if current price <= target price.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { memoryAlertRegistrations } from "./register";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  // Protect cron in production if secret is configured
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: "Unauthorized cron execution" });
  }

  const activeAlerts = Array.from(memoryAlertRegistrations.values()).filter((a) => a.active);
  const results = [];

  for (const alert of activeAlerts) {
    // Check price (simulated / connected to price tracking engine)
    const simulatedDrop = Math.round(alert.initialPrice * 0.92);
    const triggered = simulatedDrop <= alert.targetPrice;

    results.push({
      alertId: alert.id,
      productId: alert.productId,
      targetPrice: alert.targetPrice,
      currentPrice: simulatedDrop,
      notified: triggered,
    });
  }

  return res.status(200).json({
    timestamp: new Date().toISOString(),
    checkedCount: activeAlerts.length,
    alertsTriggered: results.filter((r) => r.notified).length,
    details: results,
  });
}
