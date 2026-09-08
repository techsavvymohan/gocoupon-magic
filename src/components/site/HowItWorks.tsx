/**
 * @file HowItWorks.tsx
 * @description Plain English, High-SEO Commerce Intelligence Guide.
 *
 * Explains GoCoupon's all-in-one monopoly advantage in clear, everyday
 * language that real shoppers search on Google.
 *
 * Clean, modern, aesthetic layout without noisy effects or sparkles.
 */

import { Link } from "@tanstack/react-router";
import {
  Layers,
  TrendingDown,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Search,
  Lock,
  FileText,
  Zap,
} from "lucide-react";

const SHOPPING_STEPS = [
  {
    step: "01",
    tag: "STORE COMPARISON",
    title: "Find the Lowest Price Across 500+ Stores",
    summary:
      "Never overpay because you didn't check another tab. When you browse or search any product, GoCoupon compares Amazon, Flipkart, Walmart, Best Buy, Target, Croma, and direct brand stores so you always buy from the verified lowest merchant.",
    proof: "Benchmarks 500+ verified stores in 1 second with zero sponsored bias.",
    icon: Layers,
  },
  {
    step: "02",
    tag: "DEAL HONESTY RADAR",
    title: "Expose Fake Sales with 30-Day Price Baselines",
    summary:
      "Ever notice how sellers inflate prices right before a big festival sale just to claim a fake '50% off'? Our 30-day moving baseline analysis separates authentic bargains from artificial marketing markups.",
    proof: "Real-time baseline graphs show what the product actually sold for.",
    icon: TrendingDown,
  },
  {
    step: "03",
    tag: "BANK ARBITRAGE",
    title: "Unlock Instant Bank & Card Discounts",
    summary:
      "Stores offer exclusive bank promotions that most shoppers miss. An iPhone might be ₹5,000 cheaper on Flipkart with HDFC, or a laptop $120 cheaper at Best Buy with Chase. GoCoupon identifies the highest-saving card in your wallet automatically.",
    proof: "Instant savings with HDFC, SBI, ICICI, Axis, Chase, or Amex. (No card? Still lowest store price).",
    icon: CreditCard,
  },
  {
    step: "04",
    tag: "INSTANT PRICE DROP",
    title: "4-Tier Stacked Savings at Checkout",
    summary:
      "Why wait weeks for a price alert? GoCoupon triggers an Instant Price Drop (IPD) by stacking your store discount, auto-applied promo codes, instant bank rebates, and cashback rewards simultaneously.",
    proof: "Calculates True Landed Cost in 1 click with zero dead codes or popup spam.",
    icon: CheckCircle2,
  },
];

const SEARCH_INTENT_GUIDES = [
  {
    badge: "Price Comparison",
    title: "How to Find the Cheapest Price for Any Product Across Stores",
    slug: "how-to-find-cheaper-products-online-price-comparison-guide",
    searchQuery: "compare prices across amazon walmart flipkart best buy",
  },
  {
    badge: "Card Discounts",
    title: "How to Stack Bank Card Offers & Coupons for Maximum Savings",
    slug: "credit-card-bank-offers-coupon-stacking-guide",
    searchQuery: "hdfc sbi icici chase credit card shopping discount guide",
  },
  {
    badge: "Price History",
    title: "How to Spot Fake Discounts & Check Price History Before Buying",
    slug: "best-price-tracking-tools-india-price-history-guide",
    searchQuery: "check if sale discount is real or fake price drop tracker",
  },
  {
    badge: "Coupon Codes",
    title: "Why Online Coupons Fail at Checkout & How to Find Working Codes",
    slug: "why-coupons-silently-fail-checkout",
    searchQuery: "how to find working discount codes without expired coupons",
  },
];

const POPULAR_SEARCH_TOPICS = [
  "Cheapest store for iPhone 16",
  "MacBook Air M3 lowest price today",
  "Sony WH-1000XM5 price drop history",
  "Amazon vs Flipkart price comparison",
  "Best credit card shopping discounts",
  "How to avoid fake online sale prices",
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-12 border-t border-border bg-background px-4 sm:px-6 py-20 sm:py-28"
    >
      {/* Anchor alias for backwards compatibility */}
      <div id="how" className="absolute -top-12 left-0 h-0 w-0" aria-hidden="true" />

      <div className="mx-auto max-w-6xl">
        {/* Clear, Human Header */}
        <div className="max-w-3xl">
          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground text-balance">
            Stop Juggling 5 Different Shopping Apps.
            <span className="text-primary block mt-1">
              GoCoupon Does It All in 1 Second.
            </span>
          </h2>

          <p className="mt-4 text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed text-balance">
            Most shoppers use one tool for Amazon price history, another website to compare store prices, a coupon app that gives expired codes, and banking apps for card offers. GoCoupon replaces them all with <strong>ONE free platform</strong> that guarantees you always get the lowest price before placing your order.
          </p>
        </div>

        {/* 4 Plain-English Pillars Grid */}
        <div className="mt-12 sm:mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SHOPPING_STEPS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article
                key={pillar.step}
                className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-xs transition-colors hover:border-primary/50"
              >
                <div>
                  {/* Step Number & Clean Icon */}
                  <div className="flex items-center justify-between pb-4 border-b border-border/50">
                    <span className="font-mono text-2xl font-black tracking-tight text-foreground/30 group-hover:text-primary transition-colors">
                      {pillar.step}
                    </span>
                    <div className="grid h-9 w-9 place-items-center rounded-xl border border-border/80 bg-background text-foreground/80 group-hover:border-primary/40 group-hover:text-primary transition-colors">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                  </div>

                  <span className="mt-4 block font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
                    {pillar.tag}
                  </span>

                  <h3 className="mt-1 font-display text-base sm:text-lg font-bold text-foreground leading-snug">
                    {pillar.title}
                  </h3>

                  <p className="mt-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {pillar.summary}
                  </p>
                </div>

                {/* Proof Line */}
                <div className="mt-6 pt-4 border-t border-border/50">
                  <div className="flex items-start gap-2 text-[11px] font-medium text-foreground/90">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{pillar.proof}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* 100% Privacy Card (Plain English, High Trust) */}
        <div className="mt-8 rounded-2xl border border-border/80 bg-card/40 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Lock className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">
                100% Safe &amp; Private: We Never Ask for Your Card Number
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                GoCoupon never reads or stores your bank logins, passwords, or credit card details. We simply match public store promotions and bank partner offers on your screen.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 font-mono text-[11px] text-muted-foreground shrink-0">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>100% Free &amp; Independent</span>
          </div>
        </div>

        {/* Real-Life Shopping Search Topics (SEO Power Strip) */}
        <div className="mt-8 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider mr-1">
            Common Shopping Searches:
          </span>
          {POPULAR_SEARCH_TOPICS.map((topic) => (
            <Link
              key={topic}
              to="/compare"
              className="rounded-full border border-border/70 bg-card/70 px-3 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              {topic}
            </Link>
          ))}
        </div>

        {/* High-Intent SEO Guides (Direct Google Search Queries) */}
        <div className="mt-16 sm:mt-20 border-t border-border/70 pt-12 sm:pt-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                <Search className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Smart Shopping Guides &amp; Deal Secrets</span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                Helpful Guides to Save Money on Every Online Purchase
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl">
                Practical guides explaining how price tracking works, how to spot fake discounts, and how to get maximum savings with your bank cards.
              </p>
            </div>

            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline shrink-0"
            >
              <span>View All Shopping Guides</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {/* Curated Guides with Real Search Intent */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SEARCH_INTENT_GUIDES.map((guide) => (
              <Link
                key={guide.slug}
                to="/blog/$slug"
                params={{ slug: guide.slug }}
                className="group flex flex-col justify-between rounded-xl border border-border/70 bg-card/50 p-4 sm:p-5 transition-all hover:border-primary/40 hover:bg-card/80 hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md border border-border bg-background/80 px-2 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
                      {guide.badge}
                    </span>
                    <FileText className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>

                  <h4 className="mt-3 text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                    {guide.title}
                  </h4>
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="font-mono text-[10px] truncate max-w-[170px]" title={guide.searchQuery}>
                    {guide.searchQuery}
                  </span>
                  <ArrowRight className="h-3 w-3 text-primary shrink-0 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
