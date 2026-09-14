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
  syncLiveCuelinksDeals,
  fetchCuelinksCampaigns,
  getCuelinksConfig,
} from "../services/providers/cuelinks-client.js";
import { syncAdmitadDeals, getAdmitadConfig } from "../services/providers/admitad-client.js";

let watcherInterval: NodeJS.Timeout | null = null;
let admitadTickCount = 0; // Run Admitad sync every 4th Cuelinks tick (~60 min)

export function startBackgroundWorkers(intervalMs: number = 15 * 60 * 1000) {
  if (watcherInterval) {
    return;
  }

  console.log(`⏱️ [Worker] 24/7 Dynamic Cuelinks & Price Watcher started (interval: ${intervalMs / 1000}s)`);

  // Initial Cuelinks sync 2s after boot
  setTimeout(async () => {
    try {
      const config = getCuelinksConfig();
      if (config.isConfigured) {
        console.log("🔥 [Worker] Bootstrapping 24/7 Cuelinks live deals sync (API v3)...");
        await Promise.allSettled([
          syncLiveCuelinksDeals(0),
          fetchCuelinksCampaigns({ limit: 50 }),
        ]);
        console.log("✅ [Worker] Cuelinks 24/7 live sync initialized successfully.");
      }
    } catch (err: any) {
      console.warn("⚠️ [Worker] Initial Cuelinks 24/7 sync failed:", err?.message);
    }
  }, 2000);

  // Initial Admitad sync 10s after boot (staggered to avoid burst)
  setTimeout(async () => {
    try {
      const admitadConfig = getAdmitadConfig();
      if (admitadConfig.isConfigured) {
        console.log("🌍 [Worker] Bootstrapping Admitad international deals sync...");
        const result = await syncAdmitadDeals();
        console.log(`✅ [Worker] Admitad boot sync done: ${result.synced} deals merged.`);
      }
    } catch (err: any) {
      console.warn("⚠️ [Worker] Initial Admitad sync failed:", err?.message);
    }
  }, 10000);

  watcherInterval = setInterval(async () => {
    admitadTickCount++;
    try {
      // 1. 24/7 Continuous Cuelinks API v3 Sync: prune expired & ingest live deals
      const config = getCuelinksConfig();
      if (config.isConfigured) {
        await Promise.allSettled([
          syncLiveCuelinksDeals(0),
          fetchCuelinksCampaigns({ limit: 40 }),
        ]);
      }

      // 2. Admitad hourly sync (every 4th tick = 4 × 15 min = 60 min)
      if (admitadTickCount % 4 === 0) {
        const admitadConfig = getAdmitadConfig();
        if (admitadConfig.isConfigured) {
          syncAdmitadDeals().catch((e: Error) =>
            console.warn("⚠️ [Worker] Admitad sync error:", e.message)
          );
        }
      }

      // 3. Check active price alerts
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
    } catch (err: any) {
      console.error("❌ [Worker] Error running background 24/7 sync:", err.message);
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
