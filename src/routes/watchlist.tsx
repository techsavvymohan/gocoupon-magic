/**
 * @file watchlist.tsx
 * @description User Saved Products & Target Price Alerts Dashboard.
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import { WatchlistGrid } from "@/components/shopping/WatchlistGrid";
import {
  isPushNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  triggerPriceDropNotification,
} from "@/lib/services/notification-service";
import { Bell, ShieldCheck, Smartphone, Send, Radio, AlertCircle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/watchlist")({
  component: WatchlistPage,
  head: () =>
    createSeoHead({
      title: "My Price Drop Watchlist & Alerts – goCoupon",
      description:
        "Track saved products, target price alerts, and instant price drop notifications across Amazon, Flipkart and Myntra.",
      path: "/watchlist",
      keywords: "price drop alerts, saved products watchlist, amazon price tracker, flipkart alert",
    }),
});

function WatchlistPage() {
  const [permission, setPermission] = useState<string>("default");
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  useEffect(() => {
    setIsSupported(isPushNotificationSupported());
    setPermission(getNotificationPermission());
  }, []);

  const handleEnablePush = async () => {
    const granted = await requestNotificationPermission();
    setPermission(granted ? "granted" : "denied");
  };

  const handleSendTestAlert = async () => {
    setIsTesting(true);
    await triggerPriceDropNotification({
      title: "Apple iPhone 16 (128 GB) - Black",
      originalPrice: 79900,
      newPrice: 68499,
      store: "Amazon.in",
      url: "/watchlist",
    });
    setIsTesting(false);
    setPermission(getNotificationPermission());
  };

  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Watchlist", path: "/watchlist" },
  ]);

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <section className="relative border-b border-border px-6 pb-12 pt-16 sm:pt-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 font-mono text-xs uppercase tracking-[0.2em] text-primary">
            <Bell className="h-3.5 w-3.5" />
            Personal Shopping Assistant
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            My Price-Drop Watchlist
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground">
            Manage your watched items and target price thresholds. We monitor retailer feeds hourly to ensure you buy at the all-time lowest price.
          </p>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* PWA / Web Push Notifications Control Card */}
          {isSupported && (
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Radio className="h-6 w-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="font-display text-lg font-bold text-foreground">
                        Web Push Price Drop Alert Radar
                      </h2>
                      {permission === "granted" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-emerald-500 border border-emerald-500/25">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          Live Armed
                        </span>
                      ) : permission === "denied" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-destructive border border-destructive/25">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Blocked by Browser
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-amber-500 border border-amber-500/25">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                      {permission === "granted"
                        ? "Your browser and mobile device are connected via our Service Worker. The second an Amazon or Flipkart price drop breaches your target price, an instant push notification will pop up on your screen."
                        : permission === "denied"
                        ? "Browser push permissions are currently blocked. To receive instant price breach alerts, please click the lock/settings icon in your browser URL bar and allow notifications."
                        : "Enable instant Web Push notifications to receive lockscreen and desktop alerts the exact millisecond an Amazon or Flipkart price breaches your target price."}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  {permission === "granted" ? (
                    <button
                      type="button"
                      onClick={handleSendTestAlert}
                      disabled={isTesting}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {isTesting ? "Dispatching alert…" : "Test Price Drop Alert"}
                    </button>
                  ) : permission === "default" ? (
                    <button
                      type="button"
                      onClick={handleEnablePush}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <Smartphone className="h-3.5 w-3.5" />
                      Enable Browser Notifications
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          <WatchlistGrid />
        </div>
      </section>
    </SiteShell>
  );
}
