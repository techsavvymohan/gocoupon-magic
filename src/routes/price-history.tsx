/**
 * @file price-history.tsx
 * @description 90-Day Price History Tracker & Historical Low Checker.
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import { CANONICAL_PRODUCTS } from "@/data/canonicalCatalogData";
import { UrlResolverSearch } from "@/components/shopping/UrlResolverSearch";
import { PriceHistoryChart } from "@/components/shopping/PriceHistoryChart";
import { Clock, TrendingDown, ShieldAlert, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/price-history")({
  component: PriceHistoryHubPage,
  head: () =>
    createSeoHead({
      title: "Price History Tracker India – Amazon & Flipkart 90-Day Graph Tracker",
      description:
        "Track 90-day price history graphs on Amazon & Flipkart. Spot fake pre-sale discount hikes, set instant price drop alerts, and buy at the all-time lowest price in India.",
      path: "/price-history",
      keywords:
        "price history tracker india, amazon price tracker, flipkart price graph, buyhatke alternative, fake discount detector, 90 day lowest price india",
    }),
});

function PriceHistoryHubPage() {
  const [activeProductId, setActiveProductId] = useState<string>("prod_sony_wh1000xm5");
  const activeProduct = CANONICAL_PRODUCTS.find((p) => p.id === activeProductId) || CANONICAL_PRODUCTS[0];

  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Price History", path: "/price-history" },
  ]);

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* Hero Header */}
      <section className="relative border-b border-border px-6 pb-16 pt-20 sm:pt-28">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 font-mono text-xs uppercase tracking-[0.2em] text-primary">
            <Clock className="h-3.5 w-3.5" />
            90-Day Historical Price Intelligence
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Spot Fake Discounts. Know the All-Time Low.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Paste any Amazon or Flipkart product URL to see true 90-day price trends, historical lows, and detect inflated prices right before sale festivals.
          </p>

          <div className="mx-auto mt-8 max-w-2xl">
            <UrlResolverSearch
              size="large"
              placeholder="Paste Amazon / Flipkart product URL to inspect price graph…"
            />
          </div>
        </div>
      </section>

      {/* Featured Price Tracker Showcase */}
      <section className="px-4 sm:px-6 py-12 sm:py-16 pb-28 sm:pb-20">
        <div className="mx-auto max-w-7xl">
          {/* Product Switcher Pills */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground mr-2">
              Popular Tracked Products:
            </span>
            {CANONICAL_PRODUCTS.slice(0, 4).map((prod) => (
              <button
                key={prod.id}
                type="button"
                onClick={() => setActiveProductId(prod.id)}
                className={`rounded-xl px-3.5 py-2 min-h-[36px] text-xs font-semibold transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  activeProductId === prod.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {prod.brand} {prod.title.slice(0, 18)}…
              </button>
            ))}
          </div>

          {/* Interactive Chart Component */}
          <PriceHistoryChart
            productId={activeProduct.id}
            productTitle={activeProduct.title}
          />

          {/* Product Quick View Card */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <img
                src={activeProduct.imageUrl}
                alt={activeProduct.title}
                className="h-16 w-16 rounded-2xl object-cover border border-border"
              />
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  {activeProduct.title}
                </h3>
                <span className="font-mono text-xs text-muted-foreground">
                  {activeProduct.category} • {activeProduct.brand}
                </span>
              </div>
            </div>

            <Link
              to="/product/$productId"
              params={{ productId: activeProduct.id }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:scale-105 transition-transform"
            >
              <span>View Multi-Store Deals &amp; Coupons</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
