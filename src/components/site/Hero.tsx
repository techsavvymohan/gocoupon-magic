/**
 * @file Hero.tsx
 * @description Hero section with mobile-first search resolver card on top and desktop side-by-side layout.
 */

import { Link } from "@tanstack/react-router";
import { MagneticButton } from "../MagneticButton";
import { UrlResolverSearch } from "../shopping/UrlResolverSearch";
import { Star, ArrowRight, Search, ShieldCheck, Layers, TrendingDown, Clock } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 sm:px-6 pb-20 sm:pb-32 pt-20 sm:pt-24 md:pt-28">
      {/* Ambient backdrop glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 opacity-35 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle at center, var(--accent-glow-strong), rgba(245, 158, 11, 0.15), transparent 70%)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-8 lg:gap-12 lg:grid-cols-[1.05fr_1.1fr]">
        {/* URL Resolver & Scanner Card (Top on Mobile with order-1, Right on Desktop with order-2) */}
        <div className="reveal relative order-1 lg:order-2" style={{ transitionDelay: "0.1s" }}>
          <div className="rounded-3xl border border-border/80 bg-card/95 p-5 sm:p-8 shadow-2xl backdrop-blur-xl">
            {/* Card Header */}
            <div className="mb-4 sm:mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <h3 className="font-display text-sm sm:text-lg font-bold text-foreground">
                    Instant Product &amp; URL Resolver
                  </h3>
                  <span className="font-mono text-[10px] text-emerald-500 flex items-center gap-1 font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Price &amp; 90d Low Scanner Active
                  </span>
                </div>
              </div>

              <span className="rounded-full bg-primary/10 border border-primary/20 px-2 sm:px-2.5 py-0.5 font-mono text-[9px] sm:text-[10px] font-bold text-primary">
                GoCoupon Engine
              </span>
            </div>

            <p className="text-xs text-muted-foreground mb-4 sm:mb-5 leading-relaxed">
              Paste any Amazon, Flipkart, Myntra, or Croma link to compare live prices, check 90-day history, and grab stackable coupons:
            </p>

            {/* Prominent URL Resolver Input Component */}
            <UrlResolverSearch
              size="large"
              placeholder="Paste Amazon, Flipkart URL or search product..."
            />

            {/* Quick Live Preview Bar */}
            <div className="mt-4 sm:mt-5 rounded-2xl border border-border/60 bg-muted/20 p-3 sm:p-3.5 text-xs font-mono">
              <div className="flex items-center justify-between text-muted-foreground mb-1.5">
                <span className="text-[11px] flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3 text-primary" /> Live Comparison Preview:
                </span>
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                  Save up to ₹4,354
                </span>
              </div>
              <div className="flex items-center justify-between text-foreground">
                <span className="font-bold truncate pr-2 text-xs">Sony WH-1000XM5</span>
                <span className="font-bold text-primary text-xs">
                  ₹24,636{" "}
                  <span className="text-[10px] text-muted-foreground font-normal">on Amazon</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Copy & CTAs (Below Search on Mobile with order-2, Left on Desktop with order-1) */}
        <div className="reveal order-2 lg:order-1">
          <div className="mb-4 sm:mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3.5 py-1.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Multi-Store Comparison • 90-Day Tracker • Auto Coupons</span>
          </div>

          <h1 className="font-display text-3xl font-bold leading-[1.1] text-foreground sm:text-5xl md:text-6xl text-balance">
            Stop overpaying.
            <br />
            <span className="text-primary">Compare prices &amp; coupons</span>
            <br />
            in one click.
          </h1>

          <p className="mt-4 sm:mt-5 max-w-xl text-sm sm:text-lg leading-relaxed text-muted-foreground">
            GoCoupon scans live prices across Amazon, Flipkart, Myntra &amp; Croma, detects fake pre-sale discounts, and automatically applies working promo codes.
          </p>

          <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Desktop Only: Add to Chrome extension button (hidden on mobile devices) */}
            <MagneticButton
              as="a"
              href="https://chromewebstore.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2.5 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:scale-105 hover:bg-primary-hover hover:shadow-[var(--shadow-accent)] active:scale-95"
            >
              <ChromeIcon />
              <span>Add to Chrome — Free</span>
            </MagneticButton>

            {/* Mobile Primary Action */}
            <Link
              to="/compare"
              className="sm:hidden inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs font-bold text-primary-foreground shadow-md w-full active:scale-95"
            >
              <span>Explore Multi-Store Comparisons</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            {/* Secondary Action on Desktop */}
            <Link
              to="/compare"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              <span>Explore Comparisons</span>
              <ArrowRight className="h-4 w-4 text-primary" />
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] sm:text-xs uppercase tracking-wider text-muted-foreground">
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="ml-1 text-foreground">4.9 / 5</span>
            </div>
            <span>·</span>
            <span>180,000+ shoppers saving daily</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChromeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
      <path d="M12 2v6M21 8.5l-5.2 3M3 8.5l5.2 3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
