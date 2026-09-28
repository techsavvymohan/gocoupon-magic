/**
 * @file src/lib/analytics/web-vitals-rum.ts
 * @description Enterprise Real User Monitoring (RUM) & Google Analytics 4 (GA4) Core Web Vitals Pipeline.
 *
 * Captures real-world performance metrics directly from end-user browser devices:
 * - LCP (Largest Contentful Paint) - Loading speed (Good: <= 2500ms)
 * - INP (Interaction to Next Paint) - Responsiveness (Good: <= 200ms)
 * - CLS (Cumulative Layout Shift) - Visual stability (Good: <= 0.1)
 * - FCP (First Contentful Paint) - First render (Good: <= 1800ms)
 * - TTFB (Time to First Byte) - Server response (Good: <= 800ms)
 *
 * Dual Dispatch Architecture:
 * 1. Google Analytics 4 (gtag) standard schema for official Search Console alignment
 * 2. High-performance non-blocking Beacon (/api/rum/vitals) for instant server telemetry
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals";

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
    __GA_MEASUREMENT_ID__?: string;
    __GOCOUPON_RUM_INITIALIZED__?: boolean;
  }
}

// Fallback / default GA4 measurement ID (overridden via VITE_GA_MEASUREMENT_ID in .env)
const GA_MEASUREMENT_ID =
  (import.meta.env.VITE_GA_MEASUREMENT_ID as string) ||
  (typeof window !== "undefined" ? window.__GA_MEASUREMENT_ID__ : undefined) ||
  "G-GC980DEALS";

let rumInitialized = false;

/**
 * Dispatches a measured Web Vital to GA4 and internal RUM collector.
 */
function sendVitalToAnalytics(metric: Metric): void {
  const { name, value, delta, id, rating } = metric;
  const pagePath = typeof window !== "undefined" ? window.location.pathname : "/";
  const formattedValue = Math.round(name === "CLS" ? value * 1000 : value);

  // 1. Send to Google Analytics 4 (gtag)
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", name, {
      value: formattedValue,
      metric_id: id,
      metric_value: value,
      metric_delta: delta,
      metric_rating: rating,
      event_category: "Web Vitals",
      event_label: id,
      page_path: pagePath,
      non_interaction: true,
    });
  }

  // 2. Push to Google Tag Manager / Analytics dataLayer
  if (typeof window !== "undefined" && Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: "core_web_vital",
      vital_name: name,
      vital_value: value,
      vital_integer_value: formattedValue,
      vital_rating: rating,
      vital_id: id,
      vital_delta: delta,
      page_path: pagePath,
      timestamp: Date.now(),
    });
  }

  // 3. Dispatch non-blocking Beacon to internal VPS RUM collector
  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const payload = JSON.stringify({
        metric: name,
        value: Number(value.toFixed( name === "CLS" ? 4 : 1)),
        integerValue: formattedValue,
        rating,
        id,
        path: pagePath,
        userAgent: navigator.userAgent,
        connection: (navigator as any).connection?.effectiveType || "4g",
        timestamp: new Date().toISOString(),
      });
      navigator.sendBeacon("/api/rum/vitals", new Blob([payload], { type: "application/json" }));
    }
  } catch {
    // Non-blocking fail-safe
  }

  // Development logging
  if (import.meta.env.DEV) {
    const ratingColors = {
      good: "\x1b[32m",
      "needs-improvement": "\x1b[33m",
      poor: "\x1b[31m",
    };
    console.log(
      `📊 [Web Vitals RUM] ${name}: ${formattedValue}${name === "CLS" ? "/1000" : "ms"} (${rating}) on ${pagePath}`
    );
  }
}

/**
 * Initializes GA4 script and Core Web Vitals RUM observer.
 * Designed to load non-blockingly during idle time to ensure zero penalty on LCP/FCP.
 */
export function initWebVitalsRum(): void {
  if (typeof window === "undefined" || rumInitialized || window.__GOCOUPON_RUM_INITIALIZED__) {
    return;
  }
  rumInitialized = true;
  window.__GOCOUPON_RUM_INITIALIZED__ = true;

  // Initialize dataLayer and gtag shim
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, {
      send_page_view: true,
      anonymize_ip: true,
      cookie_flags: "SameSite=None;Secure",
    });
  }

  // Non-blocking lazy loader for GA4 gtag.js
  const loadGtagScript = () => {
    if (document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`)) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
  };

  // Schedule GA4 script on idle or interaction (saves ~90KB bandwidth on initial fast load)
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => loadGtagScript(), { timeout: 3500 });
  } else {
    setTimeout(loadGtagScript, 2000);
  }

  // Subscribe to Core Web Vitals via official Google web-vitals standard
  try {
    onLCP(sendVitalToAnalytics);
    onINP(sendVitalToAnalytics);
    onCLS(sendVitalToAnalytics);
    onFCP(sendVitalToAnalytics);
    onTTFB(sendVitalToAnalytics);
  } catch (err: any) {
    console.warn("[Web Vitals RUM] Failed to register performance observers:", err?.message || err);
  }
}
