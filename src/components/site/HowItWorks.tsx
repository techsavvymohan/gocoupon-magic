/**
 * @file HowItWorks.tsx
 * @description The Autonomous Commerce Intelligence Engine: How GoCoupon Works.
 *
 * Aesthetic, high-conviction architectural breakdown explaining why GoCoupon
 * holds an insurmountable category monopoly over legacy single-feature tools
 * (Keepa, Honey, Google Shopping).
 *
 * Clean, Swiss-inspired typography, zero sparkles, zero noise.
 * Integrated high-SEO search knowledge index for Google ranking.
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
  Cpu,
  FileText,
} from "lucide-react";

const ENGINE_PILLARS = [
  {
    step: "01",
    tag: "SPATIAL INGESTION",
    title: "Multi-Store Parallel Telemetry",
    summary:
      "Legacy tools are trapped in single stores. GoCoupon queries 200+ authorized enterprise endpoints in parallel—including Amazon, Flipkart, Walmart, Best Buy, Target, and Croma—eliminating retail silos in 400 milliseconds.",
    proof: "Indexes 200+ merchants simultaneously with zero paid advertising bias.",
    icon: Layers,
  },
  {
    step: "02",
    tag: "TEMPORAL TELEMETRY",
    title: "90-Day Fake Sale Markup Shield",
    summary:
      "Retailers frequently spike list prices by 15% to 30% right before major sales to market artificial discounts. Our historical telemetry curves audit price fluctuations to verify if a deal is an authentic all-time low.",
    proof: "Real-time historical curve validation before you add to cart.",
    icon: TrendingDown,
  },
  {
    step: "03",
    tag: "SETTLEMENT ARBITRAGE",
    title: "Bank Card & Financing Optimization",
    summary:
      "Retailers lock billions in exclusive bank partnerships (HDFC, SBI, ICICI, Chase, Amex, Affirm). GoCoupon computes these dynamic discounts against checkout rules, revealing competitor price gaps of ₹3,000–₹8,000 / $50–$150.",
    proof: "Optional card-linked booster. Works for any shopper, regardless of payment mode.",
    icon: CreditCard,
  },
  {
    step: "04",
    tag: "VERIFIED EXECUTION",
    title: "DOM-Level Voucher Injection",
    summary:
      "Broken crowd-sourced promo codes and expired spam waste minutes. GoCoupon autonomously tests verified merchant vouchers directly in your browser checkout in under 2 seconds, applying mathematical savings.",
    proof: "Zero dead codes. Zero affiliate pop-up clutter. 100% verified math.",
    icon: CheckCircle2,
  },
];

const HIGH_INTENT_SEARCH_GUIDES = [
  {
    topic: "Cross-Store Price Comparison",
    title: "How to Find Cheaper Products Online: The Multi-Store Price Comparison Guide",
    slug: "how-to-find-cheaper-products-online-price-comparison-guide",
    searchIntent: "price comparison across stores, best price finder online",
    badge: "Price Comparison",
  },
  {
    topic: "Credit Card Discount Stacking",
    title: "Credit Card & Bank Offers: The Complete Checkout Stacking Guide",
    slug: "credit-card-bank-offers-coupon-stacking-guide",
    searchIntent: "bank card discount coupons, hdfc sbi chase card discount",
    badge: "Card Arbitrage",
  },
  {
    topic: "Fake Sale Detection",
    title: "Best Price Tracking Tools & Price History Guide (Exposing Fake Markups)",
    slug: "best-price-tracking-tools-india-price-history-guide",
    searchIntent: "amazon price history tracker, fake discount detector, price drop alerts",
    badge: "Price History",
  },
  {
    topic: "Automated Coupon Verification",
    title: "Why Coupons Silently Fail at Checkout & How Automated Stacking Works",
    slug: "why-coupons-silently-fail-checkout",
    searchIntent: "working coupon codes, auto apply promo codes, coupon extensions",
    badge: "Voucher Stacking",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative scroll-mt-12 border-t border-border/70 bg-gradient-to-b from-background via-card/25 to-background px-4 sm:px-6 py-20 sm:py-28">
      {/* Anchor alias for backwards compatibility */}
      <div id="how" className="absolute -top-12 left-0 h-0 w-0" aria-hidden="true" />

      <div className="mx-auto max-w-6xl">
        {/* Conceptual Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3.5 py-1 text-xs font-mono font-medium text-foreground/80 mb-4 shadow-2xs">
            <Cpu className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span>The Commerce Intelligence Architecture</span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground text-balance">
            Why Every Other Shopping Tool Is Now Obsolete.
          </h2>

          <p className="mt-4 text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed text-balance">
            For 15 years, consumer shopping software was fractured: Keepa only tracked Amazon, Honey only tested coupons, and Google Shopping sold ranking to the highest ad bidder. GoCoupon unifies the entire commerce intelligence layer into ONE sovereign mathematical engine.
          </p>
        </div>

        {/* 4-Stage Architectural Grid */}
        <div className="mt-12 sm:mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ENGINE_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article
                key={pillar.step}
                className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-7 shadow-xs backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/90"
              >
                <div>
                  {/* Step Header */}
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

                {/* Bottom Proof Metric */}
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

        {/* Zero-Knowledge Privacy Standard (Aesthetic & High-Trust) */}
        <div className="mt-8 rounded-2xl border border-border/80 bg-card/40 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Lock className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">
                Client-Side Mathematical Privacy (Zero Financial Ingestion)
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                GoCoupon never reads, requests, or stores card numbers, CVVs, or logins. Discount algorithms match published merchant rules client-side.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 font-mono text-[11px] text-muted-foreground shrink-0">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Independent &amp; Store-Agnostic</span>
          </div>
        </div>

        {/* High-Intent Search & Editorial Knowledge Index (SEO Foundation) */}
        <div className="mt-16 sm:mt-20 border-t border-border/70 pt-12 sm:pt-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                <Search className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Verified Shopping &amp; Discount Knowledge Base</span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                Deep-Dive Shopping Intelligence &amp; Research Guides
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl">
                Read our in-depth research on exposing fake retail discounts, cross-store price comparisons, and card discount stacking secrets.
              </p>
            </div>

            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline shrink-0"
            >
              <span>Explore All Guides</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {/* Curated High-Ranking Topic Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HIGH_INTENT_SEARCH_GUIDES.map((guide) => (
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
                  <span className="font-mono text-[10px] truncate max-w-[170px]">
                    {guide.searchIntent}
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
