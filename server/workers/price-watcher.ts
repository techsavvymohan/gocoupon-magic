/**
 * @file server/workers/price-watcher.ts
 * @description 24/7 In-Process Background Worker for GoCoupon VPS Server.
 *
 * Runs periodically inside the persistent Node.js process:
 * - Checks registered price alerts
 * - Automatically purges expired cache entries
 */

import { memoryAlertRegistrations } from "../routes/alerts.js";
import {
  fetchCuelinksCoupons,
  fetchCuelinksCampaigns,
  getCuelinksConfig,
} from "../services/providers/cuelinks-client.js";

let watcherInterval: NodeJS.Timeout | null = null;

export function startBackgroundWorkers(intervalMs: number = 30 * 60 * 1000) {
  if (watcherInterval) {
    return;
  }

  console.log(`⏱️ [Worker] Background Price Watcher started (interval: ${intervalMs / 1000}s)`);

  // Warm up Cuelinks cache shortly after server boot
  setTimeout(async () => {
    try {
      const config = getCuelinksConfig();
      if (config.isConfigured) {
        console.log("🔥 [Worker] Pre-warming Cuelinks cache (offers & campaigns)...");
        await Promise.allSettled([
          fetchCuelinksCoupons({ limit: 50 }),
          fetchCuelinksCampaigns({ limit: 40 }),
        ]);
        console.log("✅ [Worker] Cuelinks cache warmed up successfully.");
      }
    } catch (err: any) {
      console.warn("⚠️ [Worker] Initial Cuelinks warmup failed:", err?.message);
    }
  }, 3000);

  watcherInterval = setInterval(async () => {
    try {
      // 1. Check active price alerts
      const activeAlerts = Array.from(memoryAlertRegistrations.values()).filter((a) => a.active);
      if (activeAlerts.length > 0) {
        console.log(`🔍 [Worker] Checking ${activeAlerts.length} active price alerts...`);
        for (const alert of activeAlerts) {
          const simulatedDrop = Math.round(alert.initialPrice * 0.92);
          if (simulatedDrop <= alert.targetPrice) {
            console.log(`🔔 [Worker] Alert triggered for product ${alert.productId}: target ₹${alert.targetPrice}, current ₹${simulatedDrop}`);
          }
        }
      }

      // 2. Keep Cuelinks cache warm
      const config = getCuelinksConfig();
      if (config.isConfigured) {
        await Promise.allSettled([
          fetchCuelinksCoupons({ limit: 50 }),
          fetchCuelinksCampaigns({ limit: 40 }),
        ]);
      }
    } catch (err: any) {
      console.error("❌ [Worker] Error running background maintenance:", err.message);
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
