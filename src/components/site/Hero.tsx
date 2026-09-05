/**
 * @file Hero.tsx
 * @description Clean, centered hero section with top banner illustration and centered search box.
 */

import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight, ShieldCheck, Star } from "lucide-react";
import { UrlResolverSearch } from "../shopping/UrlResolverSearch";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 sm:pb-24">
      {/* Top Banner Container - Completely covers left-to-right border with compact vertical height */}
      <div className="relative w-full flex justify-center bg-transparent">
        <img
          src="/hero-top-banner.webp"
          alt="GoCoupon — Shop Smarter, Pay Less"
          className="w-full h-[90px] sm:h-[140px] md:h-auto md:max-h-[240px] object-cover md:object-contain object-center md:object-top"
          width={2048}
          height={252}
          loading="eager"
          fetchPriority="high"
        />
      </div>

      {/* Centered Hero Content & Search Box */}
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 pt-5 sm:pt-8 text-center">
        {/* Category Tag Pill */}
        <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3.5 py-1 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground shadow-2xs">
          <span>PRICE TRACKER &amp; AUTO-APPLY COUPONS</span>
        </div>

        {/* Main Headline */}
        <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground text-balance">
          GoCoupon: Compare Prices, Track Drops &amp; Auto-Apply Coupons Across 200+ Stores
          Worldwide
        </h1>

        {/* Sub-Headline / Authoritative Entity Intro */}
        <p className="mx-auto mt-3 max-w-3xl text-sm sm:text-base md:text-lg font-normal text-muted-foreground text-balance">
          GoCoupon is the official free Chrome extension and shopping intelligence platform for
          online shoppers worldwide. Compare prices, track 90-day price history, find working
          coupons, and apply the best available savings at checkout.
        </p>

        {/* Direct Above-The-Fold Action CTAs */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/chrome-extension"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs sm:text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 touch-manipulation min-h-[44px]"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span>Add to Chrome — It&apos;s 100% Free</span>
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-5 py-3 text-xs sm:text-sm font-semibold text-foreground hover:bg-muted active:scale-95 transition-all shadow-2xs touch-manipulation min-h-[44px]"
          >
            <span>How It Works</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          </a>
        </div>

        {/* Social Proof Mini-Row */}
        <div className="mt-3 flex items-center justify-center gap-2 text-[11px] sm:text-xs text-muted-foreground">
          <div className="flex items-center text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="font-semibold text-foreground">4.9/5 Rating</span>
          <span>•</span>
          <span>Chrome Web Store</span>
          <span>•</span>
          <span>100K+ Smart Shoppers</span>
        </div>

        {/* Centered Search Box */}
        <div className="mt-7 sm:mt-9 mx-auto max-w-3xl text-left">
          <UrlResolverSearch size="large" showPopularChips={true} showTrustBadges={true} />
        </div>

        {/* Pro Tip Pill */}
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/5 px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 shadow-2xs">
          <span>💡</span>
          <span>
            <strong>Pro Tip:</strong> Paste any product link (Amazon, Walmart, Target, Flipkart,
            etc.) to find the lowest price in 1 click
          </span>
        </div>
      </div>
    </section>
  );
}
