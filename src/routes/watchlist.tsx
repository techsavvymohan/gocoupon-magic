/**
 * @file watchlist.tsx
 * @description User Saved Products & Target Price Alerts Dashboard.
 */

import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import { WatchlistGrid } from "@/components/shopping/WatchlistGrid";
import { Bell, Sparkles, ShieldCheck } from "lucide-react";

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

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <WatchlistGrid />
        </div>
      </section>
    </SiteShell>
  );
}
