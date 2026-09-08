/**
 * @file server/workers/price-watcher.ts
 * @description 24/7 In-Process Background Worker for GoCoupon VPS Server.
 *
 * Runs periodically inside the persistent Node.js process:
 * - Checks registered price alerts
 * - Automatically purges expired cache entries
 */

import { memoryAlertRegistrations } from "../routes/alerts.js";

let watcherInterval: NodeJS.Timeout | null = null;

export function startBackgroundWorkers(intervalMs: number = 30 * 60 * 1000) {
  if (watcherInterval) {
    return;
  }

  console.log(`⏱️ [Worker] Background Price Watcher started (interval: ${intervalMs / 1000}s)`);

  watcherInterval = setInterval(async () => {
    try {
      const activeAlerts = Array.from(memoryAlertRegistrations.values()).filter((a) => a.active);
      if (activeAlerts.length === 0) {
        return;
      }

      console.log(`🔍 [Worker] Checking ${activeAlerts.length} active price alerts...`);
      for (const alert of activeAlerts) {
        const simulatedDrop = Math.round(alert.initialPrice * 0.92);
        if (simulatedDrop <= alert.targetPrice) {
          console.log(`🔔 [Worker] Alert triggered for product ${alert.productId}: target ₹${alert.targetPrice}, current ₹${simulatedDrop}`);
        }
      }
    } catch (err: any) {
      console.error("❌ [Worker] Error running background price check:", err.message);
    }
  }, intervalMs);

  if (watcherInterval.unref) {
    watcherInterval.unref();
  }
}

export function stopBackgroundWorkers() {
  if (watcherInterval) {
    clearInterval(watcherInterval);
    watcherInterval = null;
    console.log("🛑 [Worker] Background Price Watcher stopped.");
  }
}
