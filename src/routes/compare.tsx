/**
 * @file compare.tsx
 * @description Live Multi-Store Product Price & Coupon Comparison Engine.
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import { CANONICAL_PRODUCTS } from "@/data/canonicalCatalogData";
import { UrlResolverSearch } from "@/components/shopping/UrlResolverSearch";
import { ProductHeroCard } from "@/components/shopping/ProductHeroCard";
import { Sparkles, ArrowRight, ShieldCheck, Tag, Layers, TrendingDown } from "lucide-react";

export const Route = createFileRoute("/compare")({
  component: ComparePage,
  head: () =>
    createSeoHead({
      title: "Compare Product Prices & Coupons Across Indian Stores – goCoupon",
      description:
        "Compare live prices, coupons, delivery times and cashback on Amazon, Flipkart, Myntra, Croma, and Tata CLiQ with goCoupon's instant comparison engine.",
      path: "/compare",
      keywords:
        "price comparison india, amazon vs flipkart price, compare electronics price, best online deals india, multi store price tracker",
    }),
});

const CATEGORIES = ["All", "Electronics", "Fashion", "Beauty", "Home"] as const;

function ComparePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = useMemo(() => {
    return CANONICAL_PRODUCTS.filter((product) => {
      const matchesCat = selectedCategory === "All" || product.category === selectedCategory;
      const matchesSearch =
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Compare", path: "/compare" },
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
            <Layers className="h-3.5 w-3.5" />
            Cross-Merchant Comparison Matrix
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Never Overpay. Compare All Stores in Seconds.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            We scan Amazon, Flipkart, Myntra, Croma, Tata CLiQ, and brand stores to calculate the exact net cost after coupons and cashback.
          </p>

          {/* URL Resolver & Search Box */}
          <div className="mx-auto mt-8 max-w-2xl">
            <UrlResolverSearch
              size="large"
              placeholder="Paste any Amazon / Flipkart product URL or search…"
            />
          </div>
        </div>
      </section>

      {/* Main Comparison Feed */}
      <section className="px-4 sm:px-6 py-12 sm:py-16 pb-28 sm:pb-20">
        <div className="mx-auto max-w-7xl">
          {/* Controls Bar */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <span className="font-mono text-xs text-muted-foreground">
              Showing {filteredProducts.length} verified canonical items
            </span>
          </div>

          {/* Products Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductHeroCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Smart Price Guarantee */}
      <section className="border-t border-border bg-muted/20 px-6 py-16">
        <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-8 sm:p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            How goCoupon Calculates the True Net Price
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Unlike basic price checkers that only check the sticker tag, goCoupon factors in merchant delivery charges, instant bank promo codes, active merchant coupons, and goCoupon cashback to calculate the true final checkout price.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
