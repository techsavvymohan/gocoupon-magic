/**
 * @file price-history.tsx
 * @description 90-Day Price History Tracker & Historical Low Checker.
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, lazy, Suspense } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import { CANONICAL_PRODUCTS } from "@/data/canonicalCatalogData";
import { UrlResolverSearch } from "@/components/shopping/UrlResolverSearch";
import { Clock, TrendingDown, ShieldAlert, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

// Dynamic import for Recharts-heavy charting component to optimize initial page chunks
const PriceHistoryChart = lazy(() => import("@/components/shopping/PriceHistoryChart"));

export const Route = createFileRoute("/price-history")({
  component: PriceHistoryHubPage,
  head: () =>
    createSeoHead({
      title: "Price Tracking India: 90-Day Price Tracker & Historical Low Checker – goCoupon",
      description:
        "Track 90-day price trends across Amazon and Flipkart. Spot fake pre-sale discount hikes, set instant price drop alerts, and buy at the all-time lowest price in India.",
      path: "/price-history",
      keywords:
        "price tracking, price tracker india, amazon price tracker, flipkart price graph, 90 day price history, price drop alert, fake discount detector, price tracking tool india, lowest price tracker",
    }),
});

function PriceHistoryHubPage() {
  const [activeProductId, setActiveProductId] = useState<string>("");
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
      <section className="relative border-b border-border bg-background px-4 sm:px-6 pb-16 pt-16 sm:pt-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground text-balance">
            Compare prices &amp; track drops across 100+ stores
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base sm:text-xl font-normal text-muted-foreground text-balance">
            Save instantly, everytime you shop!
          </p>

          <div className="mx-auto mt-8 sm:mt-10 max-w-3xl">
            <UrlResolverSearch
              size="large"
              showTrustBadges={true}
              showPopularChips={false}
            />
          </div>
        </div>
      </section>

      {/* Featured Price Tracker Showcase */}
      <section className="px-4 sm:px-6 py-12 sm:py-16 pb-28 sm:pb-20">
        <div className="mx-auto max-w-7xl">
          {activeProduct ? (
            <>
              {/* Product Switcher Pills */}
              {CANONICAL_PRODUCTS.length > 0 && (
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
              )}

              {/* Interactive Chart Component (Dynamically Loaded) */}
              <Suspense
                fallback={
                  <div className="rounded-3xl border border-border bg-card p-6 shadow-sm min-h-[380px] flex flex-col items-center justify-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Rendering 90-day price history matrix…
                    </span>
                  </div>
                }
              >
                <PriceHistoryChart
                  productId={activeProduct.id}
                  productTitle={activeProduct.title}
                />
              </Suspense>

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
            </>
          ) : (
            <div className="rounded-3xl border border-border/80 bg-card p-8 sm:p-14 text-center max-w-3xl mx-auto shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-5">
                <TrendingDown className="h-7 w-7" />
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground text-balance">
                Live Price Tracking Engine Ready
              </h2>
              <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed text-balance">
                Search above by product name or paste any product link from Amazon, Flipkart, Myntra, or Croma to generate real-time 90-day price trends, fake inflation checks, and instant drop alerts.
              </p>
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
