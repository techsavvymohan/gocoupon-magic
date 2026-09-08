/**
 * @file extension/background.js
 * @description GoCoupon Extension Service Worker (Manifest V3).
 *
 * Automatically hydrates remote DOM selectors from GoCoupon VPS on startup,
 * and proxies API requests for stack evaluation.
 */

const API_BASE_URL = "https://gocoupon.io";

// Refresh remote selectors from VPS on installation / startup
async function refreshRemoteSelectors() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/extension/selectors.json`);
    if (res.ok) {
      const data = await res.json();
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ remoteSelectors: data.merchants, lastUpdated: data.lastUpdated });
      }
    }
  } catch (err) {
    console.warn("[GoCoupon Worker] Using bundled fallback selectors:", err);
  }
}

if (typeof chrome !== "undefined" && chrome.runtime) {
  chrome.runtime.onInstalled.addListener(() => {
    refreshRemoteSelectors();
  });

  chrome.runtime.onStartup.addListener(() => {
    refreshRemoteSelectors();
  });

  // Message listener for content script requests
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
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
  });
}
