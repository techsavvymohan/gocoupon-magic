/**
 * @file notification-service.ts
 * @description PWA Web Push & Native Browser Notification Service for Price Drop Alerts.
 */

import { toast } from "sonner";

export interface StoredPriceAlert {
  productId: string;
  productTitle: string;
  targetPrice: number;
  currentPrice: number;
  store: string;
  createdAt: number;
}

const STORAGE_KEY = "gocoupon_push_alerts";

/**
 * Checks if Service Worker and Web Notifications are supported in the current environment.
 */
export function isPushNotificationSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "serviceWorker" in navigator && "Notification" in window;
}

/**
 * Returns current Notification permission: 'granted', 'denied', 'default', or 'unsupported'.
 */
export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

/**
 * Registers the root Service Worker (/sw.js)
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushNotificationSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    return registration;
  } catch (err) {
    console.warn("Service Worker registration failed:", err);
    return null;
  }
}

/**
 * Prompts user for browser notification permission and ensures Service Worker is active.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    toast.error("Push notifications are not supported by your browser.");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      await registerServiceWorker();
      toast.success("Push notifications enabled!", {
        description: "You will receive instant alerts the moment prices drop on Amazon or Flipkart.",
      });
      return true;
    } else if (permission === "denied") {
      toast.error("Notifications blocked", {
        description: "Please enable notifications in your browser site settings to receive instant price drop alerts.",
      });
      return false;
    } else {
      toast.info("Notification permission was dismissed.");
      return false;
    }
  } catch (err) {
    console.error("Error requesting notification permission:", err);
    return false;
  }
}

/**
 * Sends a live, native price-drop push alert via ServiceWorkerRegistration or Notification API.
 */
export async function triggerPriceDropNotification(params?: {
  title?: string;
  originalPrice?: number;
  newPrice?: number;
  store?: string;
  url?: string;
}): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    toast.error("Browser does not support desktop/mobile notifications.");
    return false;
  }

  const permission = Notification.permission;
  if (permission !== "granted") {
    const granted = await requestNotificationPermission();
    if (!granted) return false;
  }

  const productTitle = params?.title || "Apple iPhone 16 (128 GB) - Black";
  const origPrice = params?.originalPrice || 79900;
  const currentPrice = params?.newPrice || 69999;
  const storeName = params?.store || "Amazon.in";
  const targetUrl = params?.url || "/watchlist";

  const savings = origPrice - currentPrice;
  const savingsPct = Math.round((savings / origPrice) * 100);

  const notifTitle = `📉 Price Drop Alert: ₹${savings.toLocaleString("en-IN")} Off!`;
  const notifBody = `${productTitle} dropped ${savingsPct}% on ${storeName}! Now ₹${currentPrice.toLocaleString(
    "en-IN"
  )} (was ₹${origPrice.toLocaleString("en-IN")}).`;

  try {
    let registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      registration = await registerServiceWorker();
    }

    if (registration && "showNotification" in registration) {
      await registration.showNotification(notifTitle, {
        body: notifBody,
        icon: "/gc-logo.webp",
        badge: "/gc-logo.webp",
        tag: `price-drop-${Date.now()}`,
        renotify: true,
        vibrate: [200, 100, 200],
        data: {
          url: targetUrl,
          timestamp: Date.now(),
        },
        actions: [
          { action: "view", title: "View Deal 🛍️" },
          { action: "dismiss", title: "Dismiss" },
        ],
      });
    } else {
      // Fallback to Window Notification API
      const notif = new Notification(notifTitle, {
        body: notifBody,
        icon: "/gc-logo.webp",
      });
      notif.onclick = () => {
        window.focus();
        window.location.href = targetUrl;
        notif.close();
      };
    }

    toast.success("Native notification dispatched!", {
      description: "Check your desktop or mobile notification center.",
    });
    return true;
  } catch (err) {
    console.error("Failed to show notification:", err);
    toast.error("Failed to trigger notification. Check browser permissions.");
    return false;
  }
}

/**
 * Get all active saved push alerts from localStorage
 */
export function getSavedPriceAlerts(): StoredPriceAlert[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save an active price alert
 */
export function savePriceAlert(alert: Omit<StoredPriceAlert, "createdAt">): void {
  if (typeof window === "undefined") return;
  const existing = getSavedPriceAlerts();
  const filtered = existing.filter((a) => a.productId !== alert.productId);
  const updated: StoredPriceAlert[] = [
    { ...alert, createdAt: Date.now() },
    ...filtered,
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

/**
 * Remove an active price alert
 */
export function removePriceAlert(productId: string): void {
  if (typeof window === "undefined") return;
  const existing = getSavedPriceAlerts();
  const updated = existing.filter((a) => a.productId !== productId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
