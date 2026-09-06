/**
 * @file ShoppingIntelligenceSpotlight.tsx
 * @description Homepage Showcase for GoCoupon Live Price Comparison + AI Commerce Intelligence.
 */

import { Link } from "@tanstack/react-router";
import { CANONICAL_PRODUCTS } from "@/data/canonicalCatalogData";
import { CURATED_COLLECTIONS } from "@/data/collectionsData";
import { ProductHeroCard } from "./ProductHeroCard";
import { Layers, Clock, Award, ArrowRight, ShieldCheck, TrendingDown, Bot } from "lucide-react";

export function ShoppingIntelligenceSpotlight() {
  const featuredProducts = CANONICAL_PRODUCTS.slice(0, 3);
  const featuredCollection = CURATED_COLLECTIONS[0];

  return (
    <section className="border-t border-border px-6 py-24 bg-card/20">
      <div className="mx-auto max-w-7xl">
        {/* Section Title Header */}
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-primary font-semibold">
              <Layers className="h-3.5 w-3.5" />
              Live Commerce Intelligence
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Multi-Store Price Comparison &amp; Card-Linked Savings
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground leading-relaxed">
              We monitor live prices across Amazon, Flipkart, Walmart, Best Buy, and Croma. Compare real net checkout totals with your specific bank cards, instant discounts, and 0% APR financing in 1 click.
            </p>
          </div>
          <Link
            to="/compare"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary hover:underline"
          >
            <span>Explore All 25+ Store Comparisons</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <div className="grid gap-8 md:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductHeroCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Split Banner: Shortlists + Shopping Assistant */}
        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {/* Flash.co-Style Curated Shortlist Banner */}
          <div className="group relative flex flex-col justify-between rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-8 shadow-sm transition-all hover:border-primary/40 hover:shadow-xl">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
                <Award className="h-3.5 w-3.5" />
                Curated Buying Guide
              </div>
              <h3 className="mt-4 font-display text-2xl font-bold text-foreground">
                {featuredCollection.title}
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {featuredCollection.subtitle}
              </p>

              {featuredCollection?.items[0]?.product && (
                <div className="mt-6 space-y-2 rounded-2xl border border-border/80 bg-background p-4">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">
                    Rank #1 Champion:
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground truncate pr-2">
                      {featuredCollection.items[0]?.product.title}
                    </span>
                    <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 font-mono text-xs font-bold text-emerald-500">
                      ★ {featuredCollection.items[0]?.overallScore.toFixed(1)} / 10
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
              <span className="font-mono text-xs text-muted-foreground">
                Vetted against 42 lab benchmarks
              </span>
              <Link
                to="/collections/$slug"
                params={{ slug: featuredCollection.slug }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:underline"
              >
                <span>Read Full Evidence</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Ask GoCoupon AI Banner */}
          <div className="group relative flex flex-col justify-between rounded-3xl border border-border bg-gradient-to-br from-card via-card to-amber-500/5 p-8 shadow-sm transition-all hover:border-primary/40 hover:shadow-xl">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
                <Bot className="h-3.5 w-3.5" />
                Shopping Research Assistant
              </div>
              <h3 className="mt-4 font-display text-2xl font-bold text-foreground">
                Ask goCoupon Anything Before You Buy
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Need advice on battery life, fake discount warnings, or stackable card offers? Our AI agent is grounded in real price history and verified tech reviews with zero hallucinations.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  "Best noise cancelling headphones under ₹30,000",
                  "Which store has MacBook M3 at lowest price?",
                  "Is the current Amazon discount genuine?",
                ].map((prompt) => (
                  <Link
                    key={prompt}
                    to="/ask"
                    className="rounded-xl border border-border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                  >
                    &ldquo;{prompt}&rdquo;
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
              <span className="font-mono text-xs text-muted-foreground">
                Zero Hallucination Guaranteed
              </span>
              <Link
                to="/ask"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:underline"
              >
                <span>Launch Assistant</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
