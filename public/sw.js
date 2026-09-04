// goCoupon High-Performance Service Worker & Web Push Price Drop Handler
const CACHE_NAME = "gocoupon-cache-v1";

// Cache core shell assets on install
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();
    })()
  );
});

// Handle incoming Web Push notifications (e.g. from backend price monitors or simulated alerts)
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    if (event.data) {
      payload = event.data.json();
    }
  } catch (_err) {
    try {
      payload = { body: event.data ? event.data.text() : "" };
    } catch (_e) {
      payload = {};
    }
  }

  const title = payload.title || "goCoupon Price Drop Alert! 📉";
  const body = payload.body || "A tracked product on your watchlist just dropped in price!";
  const icon = payload.icon || "/gc-logo.webp";
  const badge = payload.badge || "/gc-logo.webp";
  const targetUrl = payload.url || "/watchlist";

  const options = {
    body,
    icon,
    badge,
    tag: payload.tag || "gocoupon-price-alert",
    renotify: true,
    vibrate: [200, 100, 200],
    data: {
      url: targetUrl,
      productId: payload.productId,
      timestamp: Date.now(),
    },
    actions: [
      { action: "view", title: "View Deal 🛍️" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification interaction & clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || "/watchlist";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a goCoupon window is already open, focus it and navigate
      for (const client of clientList) {
        if ("focus" in client) {
          client.focus();
          if (client.url && !client.url.includes(targetUrl)) {
            client.navigate(targetUrl);
          }
          return;
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
