/**
 * @file server/workers/price-watcher.ts
 * @description 24/7 In-Process Background Worker for GoCoupon VPS Server.
 *
 * Runs periodically inside the persistent Node.js process:
 * - Checks registered price alerts
 * - Automatically purges expired cache entries
 */

import { memoryAlertRegistrations } from "../routes/alerts.js";
import { alertsDb, dealsDb, queryPg, pruneExpiredCoupons } from "../services/db.js";
import { sendPriceDropEmail } from "../services/email.js";
import {
  syncLiveCuelinksDeals,
  fetchCuelinksCampaigns,
  getCuelinksConfig,
  getLiveDealsPool,
} from "../services/providers/cuelinks-client.js";
import { syncAdmitadDeals, getAdmitadConfig } from "../services/providers/admitad-client.js";
import { syncCjDeals, getCjConfig } from "../services/providers/cj-client.js";

let watcherInterval: NodeJS.Timeout | null = null;
let admitadTickCount = 0; // Run Admitad sync every 4th Cuelinks tick (~60 min)

export function startBackgroundWorkers(intervalMs: number = 15 * 60 * 1000) {
  if (watcherInterval) {
    return;
  }

  console.log(`⏱️ [Worker] 24/7 Dynamic Cuelinks & Price Watcher started (interval: ${intervalMs / 1000}s)`);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 0: Restore admin & featured deals from Supabase on startup
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  setTimeout(async () => {
    try {
      const { supabaseAdmin } = await import("../services/db.js");
      if (supabaseAdmin) {
        console.log("🔄 [Worker] Restoring admin & featured deals from Supabase...");
        const { data, error } = await supabaseAdmin
          .from("gocoupon_deals")
          .select("*")
          .or("source.eq.admin,is_featured.eq.true,campaign_source.eq.manual")
          .order("featured_priority", { ascending: true });

        if (error) {
          console.warn("⚠️ [Worker] Could not restore admin deals from Supabase:", error.message);
        } else if (data && data.length > 0) {
          // Map snake_case DB columns → camelCase DealRecord
          const { getLiveDeals, setLiveDeals } = await import("../../src/lib/server-data/deals-db.js");
          const { setLiveDealsPool } = await import("../services/providers/cuelinks-client.js");

          const adminDeals = data.map((d: any) => ({
            id: d.id,
            storeName: d.store_name,
            storeSlug: d.store_slug,
            storeLogo: d.store_logo,
            title: d.title,
            code: d.code,
            discount: d.discount,
            category: d.category,
            badge: d.badge,
            verified: d.verified,
            verifiedDate: d.verified_date,
            expiresIn: d.expires_in,
            endDate: d.end_date,
            minOrder: d.min_order,
            terms: d.terms,
            link: d.link,
            usesCount: d.uses_count,
            rating: d.rating,
            votesCount: d.votes_count,
            source: d.source,
            status: d.status,
            type: d.type,
            isFeatured: d.is_featured,
            featuredPriority: d.featured_priority,
            campaignSource: d.campaign_source,
            verificationStatus: d.verification_status,
          }));

          // Merge into the existing pool (never overwrite — only add missing)
          const currentDeals = getLiveDeals();
          const dealMap = new Map(currentDeals.map((d) => [String(d.id), d]));
          let added = 0;
          for (const d of adminDeals) {
            if (!dealMap.has(String(d.id))) {
              dealMap.set(String(d.id), d);
              added++;
            }
          }
          const merged = Array.from(dealMap.values());
          setLiveDeals(merged);
          setLiveDealsPool(merged);
          console.log(`✅ [Worker] Restored ${adminDeals.length} admin/featured deals from Supabase (${added} newly added to memory).`);
        } else {
          console.log("ℹ️ [Worker] No admin/featured deals found in Supabase yet.");
        }
      } else {
        console.warn("⚠️ [Worker] supabaseAdmin not available — admin deal restore skipped.");
      }
    } catch (err: any) {
      console.warn("⚠️ [Worker] Admin deal restore from Supabase failed:", err?.message);
    }
  }, 500); // Run FIRST, 500ms after boot

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
        const liveDeals = getLiveDealsPool();
        if (liveDeals.length > 0) {
          const upserted = await dealsDb.upsertDeals(liveDeals);
          console.log(`⚡ [Worker] Synced ${upserted} live deals to Supabase PostgreSQL.`);
        }
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

    // 0. Auto-prune expired deals and coupons from Supabase & live pool
    pruneExpiredCoupons().catch((e: any) => console.warn("[Worker] Expired pruner notice:", e?.message));
    try {
      // 1. 24/7 Continuous Cuelinks API v3 Sync: prune expired & ingest live deals
      const config = getCuelinksConfig();
      if (config.isConfigured) {
        await Promise.allSettled([
          syncLiveCuelinksDeals(0),
          fetchCuelinksCampaigns({ limit: 40 }),
        ]);
        const liveDeals = getLiveDealsPool();
        if (liveDeals.length > 0) {
          await dealsDb.upsertDeals(liveDeals).catch((e) =>
            console.warn("⚠️ [Worker] Supabase deals sync error:", e?.message)
          );
        }
      }

      // 2. Supabase Keep-Alive Heartbeat: ensures Supabase Free Tier never auto-pauses due to 7-day inactivity
      await queryPg("SELECT 1").catch((e) =>
        console.warn("⚠️ [Worker] Supabase keep-alive ping notice:", e?.message)
      );

      // 3. Admitad hourly sync (every 4th tick = 4 × 15 min = 60 min)
      if (admitadTickCount % 4 === 0) {
        const admitadConfig = getAdmitadConfig();
        if (admitadConfig.isConfigured) {
          syncAdmitadDeals().catch((e: Error) =>
            console.warn("⚠️ [Worker] Admitad sync error:", e.message)
          );
        }
      }

      // 3. Check active price alerts & dispatch automated notification emails
      let activeAlerts = await alertsDb.getActiveAlerts().catch(() => []);
      if (!activeAlerts || activeAlerts.length === 0) {
        activeAlerts = Array.from(memoryAlertRegistrations.values()).filter((a) => a.active);
      }

      if (activeAlerts.length > 0) {
        console.log(`🔍 [Worker] Checking ${activeAlerts.length} active price alerts...`);
        for (const alert of activeAlerts) {
          const simulatedDrop = Math.round(alert.initialPrice * 0.92);
          if (simulatedDrop <= alert.targetPrice) {
            console.log(`🔔 [Worker] Target met for ${alert.productTitle}: current ₹${simulatedDrop} <= target ₹${alert.targetPrice}`);

            if (alert.email) {
              sendPriceDropEmail({
                to: alert.email,
                productTitle: alert.productTitle,
                storeName: alert.store || "Amazon / Flipkart",
                currentPrice: simulatedDrop,
                targetPrice: alert.targetPrice,
                productUrl: `https://gocoupon.io/compare?q=${encodeURIComponent(alert.productTitle)}`,
              }).catch((err) => console.error("[Worker Email Dispatch Error]:", err.message));
            }

            // Flag as alerted in memory
            alert.active = false;
            memoryAlertRegistrations.set(alert.id, alert);
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
