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
          <div className="rounded-3xl border border-border/80 bg-card/95 p-6 sm:p-8 shadow-xl backdrop-blur-xl">
            {/* Clean Professional Header */}
            <div className="mb-5 sm:mb-6">
              <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Search Products or Paste Any Link
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
                Compare live prices across Amazon India, Flipkart, Croma, Myntra &amp; 25+ stores.
              </p>
            </div>

            {/* Prominent URL Resolver Input Component */}
            <UrlResolverSearch
              size="large"
              showPopularChips={true}
            />
          </div>
        </div>

        {/* Copy & CTAs (Below Search on Mobile with order-2, Left on Desktop with order-1) */}
        <div className="reveal order-2 lg:order-1">
          <div className="mb-4 sm:mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3.5 py-1.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Auto-Apply Coupon Extension • Live Price Comparison • 90-Day Tracker</span>
          </div>

          <h1 className="font-display text-3xl font-bold leading-[1.1] text-foreground sm:text-5xl md:text-6xl text-balance">
            Never search for coupons again.
            <br />
            <span className="text-primary">Auto-apply best discounts</span>
            <br />
            &amp; compare store prices.
          </h1>

          <p className="mt-4 sm:mt-5 max-w-xl text-sm sm:text-lg leading-relaxed text-muted-foreground">
            GoCoupon&apos;s free Chrome extension automatically finds, tests, and applies working discount codes at checkout across Amazon India, Flipkart, Myntra &amp; 200+ stores. Plus, compare real-time prices and track 90-day price trends before you buy.
          </p>

          <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Desktop Only: Add to Chrome extension button */}
            <MagneticButton
              as="a"
              href="https://chromewebstore.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2.5 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:scale-105 hover:bg-primary-hover hover:shadow-[var(--shadow-accent)] active:scale-95"
            >
              <ChromeIcon />
              <span>Add to Chrome — Free Auto-Applier</span>
            </MagneticButton>

            {/* Mobile Actions */}
            <div className="sm:hidden flex flex-col gap-2 w-full">
              <a
                href="https://chromewebstore.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs font-bold text-primary-foreground shadow-md w-full active:scale-95"
              >
                <ChromeIcon />
                <span>Add to Chrome — Free Auto-Applier</span>
              </a>
              <Link
                to="/compare"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-6 py-2.5 text-xs font-semibold text-foreground shadow-2xs w-full active:scale-95"
              >
                <span>Search &amp; Compare 25+ Stores</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Secondary Action on Desktop */}
            <Link
              to="/compare"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              <span>Search &amp; Compare Stores</span>
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
            <span>180,000+ Indian shoppers saving daily</span>
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
