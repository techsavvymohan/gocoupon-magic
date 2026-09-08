/**
 * @file extension/content.js
 * @description GoCoupon Content Script: In-Page Savings Capsule HUD & Checkout Autopilot.
 *
 * Injects non-intrusive savings capsule beside Buy Now on product pages
 * and orchestrates 2-second coupon testing on checkout pages.
 */

(function () {
  const hostname = window.location.hostname;
  let isAmazon = hostname.includes("amazon");
  let isFlipkart = hostname.includes("flipkart");
  let isCroma = hostname.includes("croma");

  // Prevent double injection
  if (document.getElementById("gocoupon-hud-root")) return;

  function initSavingsHud() {
    // 1. Identify product price
    let rawPrice = 0;
    let storeName = "Merchant";

    if (isAmazon) {
      storeName = hostname.includes(".in") ? "Amazon India" : "Amazon US";
      const priceElem = document.querySelector(".priceToPay .a-price-whole, #priceblock_ourprice, #priceblock_dealprice, .a-price .a-offscreen");
      if (priceElem) {
        rawPrice = parseFloat(priceElem.textContent.replace(/[^0-9.]/g, "")) || 0;
      }
    } else if (isFlipkart) {
      storeName = "Flipkart";
      const priceElem = document.querySelector("._30jeq3._16Jk6d, ._30jeq3");
      if (priceElem) {
        rawPrice = parseFloat(priceElem.textContent.replace(/[^0-9.]/g, "")) || 0;
      }
    }

    if (rawPrice <= 500) return; // Ignore trivial purchases

    // 2. Query VPS for Stacked Savings
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
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
          if (response && response.success && response.data && response.data.stack) {
            renderHudCapsule(response.data.stack, storeName);
          }
        }
      );
    }
  }

  function renderHudCapsule(stack, storeName) {
    if (document.getElementById("gocoupon-hud-root")) return;

    // Find anchor button to insert before
    let anchor = null;
    if (isAmazon) {
      anchor = document.getElementById("buy-now-button") || document.getElementById("add-to-cart-button");
    } else if (isFlipkart) {
      anchor = document.querySelector("button._2KpZ6l._2U9uOA._3v1-ww, button:contains('BUY NOW')");
    }

    if (!anchor || !anchor.parentElement) return;

    const sym = stack.currency === "USD" ? "$" : "₹";
    const container = document.createElement("div");
    container.id = "gocoupon-hud-root";
    container.style.cssText = `
      margin: 12px 0;
      padding: 12px 14px;
      border-radius: 14px;
      background: linear-gradient(135deg, #090d16 0%, #111827 100%);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25);
      z-index: 9999;
    `;

    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>
          <strong style="color: #10b981; font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase;">GoCoupon Instant Stack</strong>
        </div>
        <span style="font-size: 11px; color: #9ca3af; font-family: monospace;">True Landed Cost</span>
      </div>
      <div style="display: flex; align-items: baseline; justify-content: space-between;">
        <div>
          <span style="font-size: 20px; font-weight: 800; color: #34d399;">${sym}${stack.trueNetLandedCost.toLocaleString()}</span>
          <span style="font-size: 12px; color: #6b7280; text-decoration: line-through; margin-left: 6px;">${sym}${stack.stickerPrice.toLocaleString()}</span>
        </div>
        <span style="background: rgba(16,185,129,0.2); color: #34d399; padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 11px;">
          Save ${sym}${stack.totalInstantSavings.toLocaleString()} (${stack.savingsPercentage}%)
        </span>
      </div>
      ${
        stack.bankOffer.applied
          ? `<div style="margin-top: 8px; font-size: 11px; color: #d1d5db; background: rgba(255,255,255,0.05); padding: 6px 8px; border-radius: 6px;">
               💳 <strong>Best Card:</strong> ${stack.bankOffer.bankName} (Save ${sym}${stack.bankOffer.discountAmount})
             </div>`
          : ""
      }
      ${
        stack.coupon.applied
          ? `<div style="margin-top: 4px; font-size: 11px; color: #fbbf24;">
               🏷️ <strong>Coupon:</strong> ${stack.coupon.code} (Saves ${sym}${stack.coupon.discountAmount})
             </div>`
          : ""
      }
      <div style="margin-top: 8px; text-align: right;">
        <a href="https://gocoupon.io/compare?q=${encodeURIComponent(document.title.slice(0, 30))}" target="_blank" style="color: #60a5fa; font-size: 11px; text-decoration: none; font-weight: 600;">
          Compare 5 stores on GoCoupon →
        </a>
      </div>
    `;

    anchor.parentElement.insertBefore(container, anchor);
  }

  // Run on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSavingsHud);
  } else {
    setTimeout(initSavingsHud, 1200); // Allow dynamic price hydration
  }
})();
