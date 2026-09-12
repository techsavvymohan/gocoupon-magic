/**
 * @file Hero.tsx
 * @description Clean, centered hero section with top banner illustration and centered search box.
 */

import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight } from "lucide-react";
import { UrlResolverSearch } from "../shopping/UrlResolverSearch";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 sm:pb-24">
      {/* Curved Transparent Top Banner */}
      <div className="relative w-full flex justify-center bg-transparent">
        <img
          src="/hero-top-banner.webp"
          alt="GoCoupon — Shop Smarter, Pay Less"
          className="w-full h-auto max-h-[140px] sm:max-h-[180px] md:max-h-[220px] lg:max-h-[260px] object-contain object-top"
          width={2048}
          height={252}
          loading="eager"
          fetchPriority="high"
        />
      </div>

      {/* Centered Hero Content & Search Box */}
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 pt-5 sm:pt-8 text-center">
        {/* Main Headline */}
        <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground text-balance">
          Find Your Lowest Price in 1 Second
          <span className="block mt-1 sm:mt-2 text-xl sm:text-3xl md:text-4xl font-bold text-primary">
            — Auto-Apply Coupons, Track Real Prices &amp; Stack Card Discounts
          </span>
        </h1>

        {/* Sub-Headline / Authoritative Entity Intro */}
        <p className="mx-auto mt-3.5 max-w-3xl text-sm sm:text-base md:text-lg font-normal text-muted-foreground text-balance">
          Stores will never tell you a competitor is cheaper. GoCoupon cross-checks 500+ stores, auto-applies working coupons, exposes fake sales, and stacks your bank card discounts in 1 click. 100% free &amp; private.
        </p>

        {/* Centered Search Box — Prioritized directly below heading */}
        <div className="mt-6 sm:mt-8 mx-auto max-w-3xl text-left">
          <UrlResolverSearch size="large" showPopularChips={true} showTrustBadges={true} />
        </div>

        {/* Advisory Callout */}
        <div className="mt-7 inline-flex items-center gap-2.5 rounded-full border border-border bg-card/90 px-4 sm:px-5 py-2 text-xs sm:text-sm text-foreground/80 shadow-2xs">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
          </span>
          <span>
            <strong className="font-semibold text-foreground">Pro Tip:</strong> Works for everyone! Compare store prices instantly, auto-apply coupons, and optionally select your bank card to unlock extra savings.
          </span>
        </div>

        {/* Action CTAs — Relocated below primary search intent */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/chrome-extension"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs sm:text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:scale-105 active:scale-95 touch-manipulation focus-visible:ring-2 focus-visible:ring-primary"
          >
            <img src="/icons/icon.svg" alt="GoCoupon" className="h-5 w-5 object-contain" width={20} height={20} />
            <span>Add to Chrome — It&apos;s 100% Free</span>
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-border bg-card/80 px-5 py-2.5 text-xs sm:text-sm font-semibold text-foreground hover:bg-muted active:scale-95 transition-all shadow-2xs touch-manipulation focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span>How It Works</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
