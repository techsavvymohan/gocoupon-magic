/**
 * @file extension/background.js
 * @description GoCoupon Extension Service Worker (Manifest V3).
 *
 * - Hydrates remote DOM selectors from GoCoupon VPS on startup.
 * - Fetches & caches live coupons from the GoCoupon database per domain.
 * - Proxies EVALUATE_STACK and GET_COUPONS requests from content scripts.
 *
 * Data sources served via /api/extension/coupons:
 *   1. Community-submitted coupons (approved on gocoupon.io)
 *   2. Cuelinks affiliate network coupons (auto-synced)
 *   3. Admitad global affiliate coupons (auto-synced)
 *
 * Messages handled:
 *   GET_COUPONS        — fetch/return live coupons for a hostname (from content.js)
 *   GET_COUPON_COUNT   — return cached coupon count for popup.js (zero-cost, no re-fetch)
 *   EVALUATE_STACK     — evaluate savings stack via /api/stack/evaluate
 */

const API_BASE_URL = "https://gocoupon.io";

// In-memory coupon cache: { [domain]: { coupons, fetchedAt } }
const couponCache = {};
const COUPON_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * Extract a clean brand keyword from a full hostname.
 * e.g. "www.amazon.in" -> "amazon"
 */
function domainToBrandKeyword(hostname) {
  return hostname
    .replace(/^www\./, "")
    .split(".")[0]
    .toLowerCase();
}

/**
 * Fetch coupons for a given hostname from the GoCoupon database API.
 * Falls back to empty array on network failure.
 */
async function fetchCouponsForDomain(hostname) {
  const brand = domainToBrandKeyword(hostname);
  const cached = couponCache[brand];

  // Return from cache if still fresh
  if (cached && Date.now() - cached.fetchedAt < COUPON_CACHE_TTL_MS) {
    return cached.coupons;
  }

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/extension/coupons?domain=${encodeURIComponent(hostname)}&store=${encodeURIComponent(brand)}`
    );
    if (res.ok) {
      const data = await res.json();
      const coupons = data.coupons || [];
      couponCache[brand] = { coupons, fetchedAt: Date.now() };
      // Persist to chrome.storage for offline fallback
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ [`coupons_${brand}`]: { coupons, fetchedAt: Date.now() } });
      }
      return coupons;
    }
  } catch (err) {
    console.warn(`[GoCoupon Worker] Coupon fetch failed for ${hostname}:`, err.message);
  }

  // Offline fallback: try chrome.storage
  try {
    const brand = domainToBrandKeyword(hostname);
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      const stored = await chrome.storage.local.get(`coupons_${brand}`);
      const fallback = stored[`coupons_${brand}`];
      if (fallback && fallback.coupons) {
        return fallback.coupons;
      }
    }
  } catch (_) {}

  return [];
}

// ─────────────────────────────────────────────
// Remote Selector Hydration
// ─────────────────────────────────────────────

async function refreshRemoteSelectors() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/extension/selectors.json`);
    if (res.ok) {
      const data = await res.json();
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({
          remoteSelectors: data.merchants,
          lastUpdated: data.lastUpdated,
        });
      }
    }
  } catch (err) {
    console.warn("[GoCoupon Worker] Using bundled fallback selectors:", err.message);
  }
}

// ─────────────────────────────────────────────
// Chrome Extension Lifecycle
// ─────────────────────────────────────────────

if (typeof chrome !== "undefined" && chrome.runtime) {
  // Hydrate selectors on install/startup
  chrome.runtime.onInstalled.addListener(() => {
    refreshRemoteSelectors();
  });
  chrome.runtime.onStartup.addListener(() => {
    refreshRemoteSelectors();
  });

  // Refresh coupons whenever a new supported shopping tab is activated
  chrome.tabs && chrome.tabs.onUpdated && chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
      try {
        const url = new URL(tab.url);
        const supportedDomains = [
          "amazon.in", "amazon.com", "flipkart.com", "walmart.com",
          "myntra.com", "meesho.com", "nykaa.com", "ajio.com",
          "bestbuy.com", "croma.com",
        ];
        const isSupported = supportedDomains.some((d) => url.hostname.includes(d));
        if (isSupported) {
          // Pre-warm coupon cache for this domain
          fetchCouponsForDomain(url.hostname);
        }
      } catch (_) {}
    }
  });

  // ─── Message Listener ───
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    // --- Savings Stack Evaluation ---
    if (message.type === "EVALUATE_STACK") {
      fetch(`${API_BASE_URL}/api/stack/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message.payload),
      })
        .then((r) => r.json())
        .then((data) => sendResponse({ success: true, data }))
        .catch((err) => sendResponse({ success: false, error: err.message }));
      return true; // Keep channel open for async response
    }

    // --- Live DB Coupon Fetch ---
    if (message.type === "GET_COUPONS") {
      const hostname = message.hostname || "";
      fetchCouponsForDomain(hostname)
        .then((coupons) => sendResponse({ success: true, coupons, hostname }))
        .catch((err) => sendResponse({ success: false, coupons: [], error: err.message }));
      return true; // Keep channel open for async response
    }

    // --- Popup Coupon Count (zero-cost: reads from in-memory cache only) ---
    if (message.type === "GET_COUPON_COUNT") {
      const hostname = (message.domain || "").replace(/^www\./, "");
      const brand = domainToBrandKeyword(hostname);
      const cached = couponCache[brand];
      const count = cached ? cached.coupons.length : 0;
      sendResponse({ count, brand, cached: Boolean(cached) });
      return false; // Synchronous response — no need to keep channel open
    }
  });
}
