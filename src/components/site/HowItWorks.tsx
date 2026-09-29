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
    tag: "SMART SEARCH BAR",
    title: "Instant Store & Deal Finder",
    summary:
      "Search any brand or category in 1 second. Type Booking.com, Myntra, or Swiggy, or search deals like Shoes, Hotels, or Flights to instantly see verified promo codes and active discounts with 1-click auto-copy.",
    proof: "Instant autocomplete across 240+ partner stores and 980+ live API deals.",
    icon: Search,
  },
  {
    step: "02",
    tag: "CHROME EXTENSION",
    title: "1-Click Auto-Apply at Checkout",
    summary:
      "Never search for coupon codes manually again. When you reach checkout on Amazon, Flipkart, Myntra, or 240+ stores, GoCoupon's free browser extension tests all active codes in parallel and applies the highest savings automatically.",
    proof: "Applies working promo codes in under 2 seconds with zero popup spam.",
    icon: Zap,
  },
  {
    step: "03",
    tag: "LIVE VERIFIED DEALS",
    title: "980+ Promo Codes Synced 24/7",
    summary:
      "Stop wasting time on expired coupon sites. GoCoupon connects directly to official merchant affiliate networks and checkout endpoints around the clock, testing and verifying every discount code so dead vouchers are purged immediately.",
    proof: "Live sync every 15 minutes across 240+ stores with zero broken links.",
    icon: TrendingDown,
  },
  {
    step: "04",
    tag: "BANK CARD STACKING",
    title: "Extra 10% Instant Card Savings",
    summary:
      "Maximize every purchase by pairing store discount codes with instant bank partner promotions. GoCoupon highlights whether HDFC, ICICI, SBI, Axis, or Amex unlocks an additional 5% to 15% off at final payment.",
    proof: "Calculates stacked savings before you pay without ever asking for card details.",
    icon: CreditCard,
  },
];

const SEARCH_INTENT_GUIDES = [
  {
    badge: "Auto-Apply Coupons",
    title: "How to Automatically Apply Working Promo Codes at Checkout",
    slug: "chrome-extension-to-automatically-apply-coupons-india",
    searchQuery: "free chrome extension to auto apply coupons and promo codes",
  },
  {
    badge: "Card Discounts",
    title: "How to Stack Bank Card Offers & Coupons for Maximum Savings",
    slug: "credit-card-bank-offers-coupon-stacking-guide",
    searchQuery: "hdfc sbi icici credit card shopping discount guide",
  },
  {
    badge: "Store Promo Codes",
    title: "Myntra & Ajio Coupon Codes That Actually Work in 2026",
    slug: "myntra-coupon-codes-that-actually-work",
    searchQuery: "myntra working discount coupons end of season sale",
  },
  {
    badge: "Coupon Truth",
    title: "Why Online Coupons Fail at Checkout & How to Find Working Codes",
    slug: "why-coupons-silently-fail-checkout",
    searchQuery: "how to find working discount codes without expired coupons",
  },
];

const POPULAR_SEARCH_TOPICS = [
  "Working Myntra coupon codes today",
  "Amazon India promo codes & bank offers",
  "Booking.com hotel discount coupons",
  "Swiggy food promo codes & vouchers",
  "Free Chrome extension to auto-apply coupons",
  "How to stack bank credit card discounts",
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-12 border-t border-border bg-background px-4 sm:px-6 py-10 sm:py-14"
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
        <div className="mt-8 sm:mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                    <span className="font-mono text-2xl font-black tracking-tight text-foreground/70 group-hover:text-primary transition-colors">
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
              to="/offers"
              className="rounded-full border border-border/70 bg-card/70 px-3 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              {topic}
            </Link>
          ))}
        </div>

        {/* High-Intent SEO Guides (Direct Google Search Queries) */}
        <div className="mt-10 sm:mt-12 border-t border-border/70 pt-8 sm:pt-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
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
