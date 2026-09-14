/**
 * @file extension/content.js
 * @description GoCoupon Content Script: In-Page Savings Capsule HUD & Checkout Autopilot.
 *
 * Features:
 * - Fetches live coupons from GoCoupon database (Cuelinks + Admitad + Community)
 * - Shows floating coupon panel on any supported shopping page
 * - Auto-applies best coupon code in cart/checkout input fields
 * - Shows savings HUD capsule beside Buy Now button on product pages
 */

(function () {
  if (document.getElementById("gocoupon-hud-root")) return;

  const hostname = window.location.hostname;
  const isAmazon = hostname.includes("amazon");
  const isFlipkart = hostname.includes("flipkart");
  const isMyntra = hostname.includes("myntra");
  const isWalmart = hostname.includes("walmart");
  const isMeesho = hostname.includes("meesho");
  const isNykaa = hostname.includes("nykaa");
  const isAjio = hostname.includes("ajio");

  // ─────────────────────────────────────────────
  // Coupon Panel Styles
  // ─────────────────────────────────────────────
  const STYLES = `
    #gc-panel {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      width: 340px;
      border-radius: 18px;
      background: linear-gradient(145deg, #0a0f1e 0%, #111827 100%);
      border: 1px solid rgba(16, 185, 129, 0.35);
      box-shadow: 0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(16,185,129,0.08);
      overflow: hidden;
      animation: gc-slide-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    @keyframes gc-slide-in {
      from { transform: translateY(120%) scale(0.9); opacity: 0; }
      to   { transform: translateY(0) scale(1); opacity: 1; }
    }
    #gc-panel.gc-hidden {
      animation: gc-slide-out 0.25s ease-in forwards;
    }
    @keyframes gc-slide-out {
      to { transform: translateY(120%) scale(0.9); opacity: 0; }
    }
    #gc-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px 10px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }
    #gc-panel-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    #gc-panel-title span.dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 6px #10b981;
      animation: gc-pulse 2s infinite;
    }
    @keyframes gc-pulse {
      0%, 100% { box-shadow: 0 0 4px #10b981; }
      50% { box-shadow: 0 0 12px #10b981; }
    }
    #gc-panel-title strong {
      color: #10b981;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.6px;
      text-transform: uppercase;
    }
    #gc-panel-title small {
      color: #6b7280;
      font-size: 11px;
    }
    #gc-close-btn {
      background: rgba(255,255,255,0.06);
      border: none;
      color: #9ca3af;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    #gc-close-btn:hover { background: rgba(255,255,255,0.14); color: #fff; }
    #gc-coupon-list {
      max-height: 280px;
      overflow-y: auto;
      padding: 10px 12px;
      scrollbar-width: thin;
      scrollbar-color: rgba(16,185,129,0.3) transparent;
    }
    .gc-coupon-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 10px 12px;
      margin-bottom: 8px;
      transition: border-color 0.2s, background 0.2s;
    }
    .gc-coupon-card:hover { border-color: rgba(16,185,129,0.4); background: rgba(16,185,129,0.05); }
    .gc-coupon-card:last-child { margin-bottom: 0; }
    .gc-coupon-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 6px;
    }
    .gc-coupon-title {
      color: #e5e7eb;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.4;
      flex: 1;
    }
    .gc-badge {
      font-size: 9px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 20px;
      white-space: nowrap;
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }
    .gc-badge-verified { background: rgba(16,185,129,0.18); color: #34d399; border: 1px solid rgba(16,185,129,0.3); }
    .gc-badge-cuelinks { background: rgba(99,102,241,0.2); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.3); }
    .gc-badge-admitad  { background: rgba(245,158,11,0.18); color: #fcd34d; border: 1px solid rgba(245,158,11,0.3); }
    .gc-badge-community { background: rgba(236,72,153,0.18); color: #f9a8d4; border: 1px solid rgba(236,72,153,0.3); }
    .gc-coupon-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .gc-code-pill {
      font-family: monospace;
      font-size: 12px;
      font-weight: 700;
      background: rgba(16,185,129,0.12);
      color: #6ee7b7;
      border: 1px dashed rgba(16,185,129,0.4);
      padding: 3px 10px;
      border-radius: 8px;
      letter-spacing: 1px;
      cursor: pointer;
      transition: background 0.2s;
      max-width: 130px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .gc-code-pill:hover { background: rgba(16,185,129,0.22); }
    .gc-code-pill.no-code {
      color: #6b7280;
      font-style: italic;
      font-family: inherit;
      font-weight: 400;
      border-style: solid;
      border-color: rgba(255,255,255,0.08);
      cursor: default;
      font-size: 11px;
    }
    .gc-discount-tag {
      font-size: 12px;
      font-weight: 700;
      color: #34d399;
    }
    .gc-apply-btn {
      background: linear-gradient(90deg, #059669, #10b981);
      color: #fff;
      border: none;
      padding: 4px 12px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      transition: opacity 0.2s, transform 0.15s;
    }
    .gc-apply-btn:hover { opacity: 0.88; transform: scale(1.04); }
    .gc-apply-btn:active { transform: scale(0.97); }
    .gc-apply-btn.applied { background: linear-gradient(90deg, #1d4ed8, #3b82f6); }
    #gc-panel-footer {
      padding: 10px 16px;
      border-top: 1px solid rgba(255,255,255,0.07);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    #gc-footer-info {
      font-size: 10px;
      color: #4b5563;
    }
    #gc-view-all-link {
      font-size: 11px;
      color: #60a5fa;
      text-decoration: none;
      font-weight: 600;
    }
    #gc-view-all-link:hover { text-decoration: underline; }
    #gc-loading {
      padding: 24px 16px;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
    #gc-loading .spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid rgba(16,185,129,0.2);
      border-top-color: #10b981;
      border-radius: 50%;
      animation: gc-spin 0.7s linear infinite;
      margin-bottom: 8px;
    }
    @keyframes gc-spin { to { transform: rotate(360deg); } }
    #gc-empty {
      padding: 20px 16px;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }

    /* HUD Capsule (near Buy Now) */
    #gocoupon-hud-root {
      margin: 12px 0;
      padding: 12px 14px;
      border-radius: 14px;
      background: linear-gradient(135deg, #090d16 0%, #111827 100%);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25);
    }
  `;

  // ─────────────────────────────────────────────
  // Inject styles
  // ─────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById("gc-styles")) return;
    const style = document.createElement("style");
    style.id = "gc-styles";
    style.textContent = STYLES;
    document.head.appendChild(style);
  }

  // ─────────────────────────────────────────────
  // Get badge class from coupon source
  // ─────────────────────────────────────────────
  function getBadgeClass(source) {
    if (!source) return "gc-badge-verified";
    const s = source.toLowerCase();
    if (s.includes("cuelinks")) return "gc-badge-cuelinks";
    if (s.includes("admitad")) return "gc-badge-admitad";
    if (s.includes("community")) return "gc-badge-community";
    return "gc-badge-verified";
  }

  function getBadgeLabel(source, badge) {
    if (badge) return badge;
    if (!source) return "Verified";
    const s = source.toLowerCase();
    if (s.includes("cuelinks")) return "Cuelinks";
    if (s.includes("admitad")) return "Admitad";
    if (s.includes("community")) return "Community";
    return "Verified";
  }

  // ─────────────────────────────────────────────
  // Copy code to clipboard
  // ─────────────────────────────────────────────
  function copyToClipboard(text) {
    navigator.clipboard && navigator.clipboard.writeText(text).catch(() => {});
  }

  // ─────────────────────────────────────────────
  // Try to auto-apply a coupon code into cart input
  // ─────────────────────────────────────────────
  function tryAutoApply(code, btn) {
    if (!code) return;

    // Common cart coupon input selectors
    const inputSelectors = [
      "input[name='claimCode']", "#spc-gcpromoinput", "#claimCode",    // Amazon
      "input[placeholder*='coupon' i]", "input[placeholder*='promo' i]", // Generic
      "input[placeholder*='code' i]", "input#promo-code-input",          // Walmart
    ];
    const applySelectors = [
      "input[name='applycode']", "#spc-gcpromoinput-button",            // Amazon
      "button#apply-promo-button",                                        // Walmart
      "button:contains('Apply')",                                         // Generic
    ];

    let input = null;
    for (const sel of inputSelectors) {
      try {
        input = document.querySelector(sel);
        if (input) break;
      } catch (_) {}
    }

    if (!input) {
      // No input found – just copy the code
      copyToClipboard(code);
      btn.textContent = "Copied!";
      btn.classList.add("applied");
      setTimeout(() => { btn.textContent = "Apply"; btn.classList.remove("applied"); }, 2000);
      return;
    }

    // Fill the input
    input.focus();
    input.value = code;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));

    // Click apply button
    let applyBtn = null;
    for (const sel of applySelectors) {
      try {
        applyBtn = document.querySelector(sel);
        if (applyBtn) break;
      } catch (_) {}
    }

    if (applyBtn) {
      setTimeout(() => {
        applyBtn.click();
        btn.textContent = "Applied ✓";
        btn.classList.add("applied");
      }, 300);
    } else {
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", keyCode: 13, bubbles: true }));
      btn.textContent = "Applied ✓";
      btn.classList.add("applied");
    }
  }

  // ─────────────────────────────────────────────
  // Render coupon panel
  // ─────────────────────────────────────────────
  function renderPanel(coupons) {
    if (document.getElementById("gc-panel")) return;
    injectStyles();

    const storeName = hostname.replace(/^www\./, "").split(".")[0];
    const pageStore = storeName.charAt(0).toUpperCase() + storeName.slice(1);

    const panel = document.createElement("div");
    panel.id = "gc-panel";

    let listHTML = "";
    if (coupons.length === 0) {
      listHTML = `<div id="gc-empty">😔 No coupons found for ${pageStore} right now.<br><a href="https://gocoupon.io" target="_blank" style="color:#60a5fa;">Browse all deals →</a></div>`;
    } else {
      coupons.slice(0, 10).forEach((c) => {
        const badgeClass = getBadgeClass(c.source);
        const badgeLabel = getBadgeLabel(c.source, c.badge);
        const hasCode = c.code && c.code.length > 1;
        listHTML += `
          <div class="gc-coupon-card">
            <div class="gc-coupon-top">
              <div class="gc-coupon-title">${c.title || "Special Offer"}</div>
              <span class="gc-badge ${badgeClass}">${badgeLabel}</span>
            </div>
            <div class="gc-coupon-bottom">
              <span class="gc-code-pill ${hasCode ? "" : "no-code"}" 
                    data-code="${hasCode ? c.code : ""}"
                    title="${hasCode ? "Click to copy code" : "No code needed – click link"}"
              >${hasCode ? c.code : "Auto-discount"}</span>
              <span class="gc-discount-tag">${c.discount || ""}</span>
              <button class="gc-apply-btn" data-code="${hasCode ? c.code : ""}">${hasCode ? "Apply" : "View"}</button>
            </div>
          </div>`;
      });
    }

    const autoCount = coupons.filter((c) => c.isAutoApplyEligible).length;

    panel.innerHTML = `
      <div id="gc-panel-header">
        <div id="gc-panel-title">
          <span class="dot"></span>
          <div>
            <strong>GoCoupon</strong>
            <small> — ${coupons.length} deal${coupons.length !== 1 ? "s" : ""} found</small>
          </div>
        </div>
        <button id="gc-close-btn" title="Close">✕</button>
      </div>
      <div id="gc-coupon-list">${listHTML}</div>
      <div id="gc-panel-footer">
        <span id="gc-footer-info">${autoCount} auto-applicable · Live from DB</span>
        <a href="https://gocoupon.io" target="_blank" id="gc-view-all-link">All deals →</a>
      </div>
    `;

    document.body.appendChild(panel);

    // Close button
    panel.querySelector("#gc-close-btn").addEventListener("click", () => {
      panel.classList.add("gc-hidden");
      setTimeout(() => panel.remove(), 280);
    });

    // Copy / Apply buttons
    panel.querySelectorAll(".gc-apply-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const code = btn.dataset.code;
        if (code) {
          tryAutoApply(code, btn);
          copyToClipboard(code);
        } else {
          // No code – navigate to store link
          window.open("https://gocoupon.io", "_blank");
        }
      });
    });

    // Code pill copy
    panel.querySelectorAll(".gc-code-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        const code = pill.dataset.code;
        if (code) {
          copyToClipboard(code);
          const orig = pill.textContent;
          pill.textContent = "Copied!";
          setTimeout(() => (pill.textContent = orig), 1500);
        }
      });
    });
  }

  // ─────────────────────────────────────────────
  // Show loading state panel
  // ─────────────────────────────────────────────
  function renderLoadingPanel() {
    if (document.getElementById("gc-panel")) return;
    injectStyles();

    const panel = document.createElement("div");
    panel.id = "gc-panel";
    panel.innerHTML = `
      <div id="gc-panel-header">
        <div id="gc-panel-title">
          <span class="dot"></span>
          <strong>GoCoupon</strong>
        </div>
        <button id="gc-close-btn" title="Close">✕</button>
      </div>
      <div id="gc-loading">
        <div class="spinner"></div><br>Finding live coupons…
      </div>
    `;
    document.body.appendChild(panel);
    panel.querySelector("#gc-close-btn").addEventListener("click", () => panel.remove());
    return panel;
  }

  // ─────────────────────────────────────────────
  // Fetch coupons from background service worker
  // ─────────────────────────────────────────────
  function loadAndRenderCoupons() {
    if (!chrome?.runtime?.sendMessage) return;

    const loadingPanel = renderLoadingPanel();

    chrome.runtime.sendMessage(
      { type: "GET_COUPONS", hostname },
      (response) => {
        // Remove loading panel
        if (loadingPanel && loadingPanel.parentNode) {
          loadingPanel.remove();
        }
        const existing = document.getElementById("gc-panel");
        if (existing) existing.remove();

        const coupons = (response && response.success && response.coupons) ? response.coupons : [];
        renderPanel(coupons);
      }
    );
  }

  // ─────────────────────────────────────────────
  // Savings HUD beside Buy Now (product pages)
  // ─────────────────────────────────────────────
  function initSavingsHud() {
    let rawPrice = 0;
    let storeName = "Merchant";

    if (isAmazon) {
      storeName = hostname.includes(".in") ? "Amazon India" : "Amazon US";
      const priceElem = document.querySelector(".priceToPay .a-price-whole, #priceblock_ourprice, #priceblock_dealprice, .a-price .a-offscreen");
      if (priceElem) rawPrice = parseFloat(priceElem.textContent.replace(/[^0-9.]/g, "")) || 0;
    } else if (isFlipkart) {
      storeName = "Flipkart";
      const priceElem = document.querySelector("._30jeq3._16Jk6d, ._30jeq3");
      if (priceElem) rawPrice = parseFloat(priceElem.textContent.replace(/[^0-9.]/g, "")) || 0;
    }

    if (rawPrice <= 500) return;

    if (chrome?.runtime?.sendMessage) {
      chrome.runtime.sendMessage(
        {
          type: "EVALUATE_STACK",
          payload: {
            storeName,
            stickerPrice: rawPrice,
            currency: isAmazon && hostname.includes(".com") ? "USD" : "INR",
          },
        },
        (response) => {
          if (response?.success && response?.data?.stack) {
            renderHudCapsule(response.data.stack, storeName);
          }
        }
      );
    }
  }

  function renderHudCapsule(stack, storeName) {
    if (document.getElementById("gocoupon-hud-root")) return;
    injectStyles();

    let anchor = null;
    if (isAmazon) anchor = document.getElementById("buy-now-button") || document.getElementById("add-to-cart-button");
    else if (isFlipkart) anchor = document.querySelector("button._2KpZ6l._2U9uOA._3v1-ww");

    if (!anchor || !anchor.parentElement) return;

    const sym = stack.currency === "USD" ? "$" : "₹";
    const container = document.createElement("div");
    container.id = "gocoupon-hud-root";

    container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#10b981;box-shadow:0 0 6px #10b981;"></span>
          <strong style="color:#10b981;font-size:11px;letter-spacing:.5px;text-transform:uppercase;">GoCoupon Instant Stack</strong>
        </div>
        <span style="font-size:11px;color:#9ca3af;font-family:monospace;">True Landed Cost</span>
      </div>
      <div style="display:flex;align-items:baseline;justify-content:space-between;">
        <div>
          <span style="font-size:20px;font-weight:800;color:#34d399;">${sym}${stack.trueNetLandedCost.toLocaleString()}</span>
          <span style="font-size:12px;color:#6b7280;text-decoration:line-through;margin-left:6px;">${sym}${stack.stickerPrice.toLocaleString()}</span>
        </div>
        <span style="background:rgba(16,185,129,0.2);color:#34d399;padding:2px 8px;border-radius:6px;font-weight:700;font-size:11px;">
          Save ${sym}${stack.totalInstantSavings.toLocaleString()} (${stack.savingsPercentage}%)
        </span>
      </div>
      ${stack.bankOffer?.applied
        ? `<div style="margin-top:8px;font-size:11px;color:#d1d5db;background:rgba(255,255,255,0.05);padding:6px 8px;border-radius:6px;">
             💳 <strong>Best Card:</strong> ${stack.bankOffer.bankName} (Save ${sym}${stack.bankOffer.discountAmount})
           </div>`
        : ""}
      ${stack.coupon?.applied
        ? `<div style="margin-top:4px;font-size:11px;color:#fbbf24;">
             🏷️ <strong>Coupon:</strong> ${stack.coupon.code} (Saves ${sym}${stack.coupon.discountAmount})
           </div>`
        : ""}
      <div style="margin-top:8px;text-align:right;">
        <a href="https://gocoupon.io/compare?q=${encodeURIComponent(document.title.slice(0, 30))}" 
           target="_blank" style="color:#60a5fa;font-size:11px;text-decoration:none;font-weight:600;">
          Compare 5 stores on GoCoupon →
        </a>
      </div>
    `;

    anchor.parentElement.insertBefore(container, anchor);
  }

  // ─────────────────────────────────────────────
  // Main Init
  // ─────────────────────────────────────────────
  function init() {
    // Always show coupon panel on shopping pages
    loadAndRenderCoupons();

    // Savings HUD only on product pages with price
    setTimeout(initSavingsHud, 1500);
  }

  // ─────────────────────────────────────────────
  // Message Listener — receives OPEN_COUPON_PANEL from popup.js
  // ─────────────────────────────────────────────
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === "OPEN_COUPON_PANEL") {
        // Remove any existing panel first to force a fresh fetch
        const existing = document.getElementById("gc-panel");
        if (existing) existing.remove();
        loadAndRenderCoupons();
        sendResponse({ success: true });
        return false;
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    setTimeout(init, 1000);
  }
})();
