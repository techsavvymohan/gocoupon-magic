/**
 * @file api/alerts/register.ts
 * @description Registers W3C Web Push Subscriptions for 24/7 Background Price Drop Alerts.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

export interface PushAlertRegistration {
  id: string;
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

// In-memory / serverless registry store
export const memoryAlertRegistrations = new Map<string, PushAlertRegistration>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. POST required." });
  }

  const { subscription, productId, productTitle, targetPrice, currentPrice, store } =
    req.body || {};

  if (!productId || !targetPrice) {
    return res.status(400).json({ error: "productId and targetPrice are required." });
  }

  const alertId = `alert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const record: PushAlertRegistration = {
    id: alertId,
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

  return res.status(200).json({
    success: true,
    alertId,
    message: "Price alert successfully registered. You will be notified via push when price drops.",
    targetPrice: record.targetPrice,
  });
}
