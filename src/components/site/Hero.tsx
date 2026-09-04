/**
 * @file Hero.tsx
 * @description Clean, centered hero section with top banner illustration and centered search box.
 */

import { UrlResolverSearch } from "../shopping/UrlResolverSearch";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 sm:pb-24">
      {/* Full-Width Edge-to-Edge Top Banner (50% compact height) */}
      <div className="relative w-full overflow-hidden bg-[#F6C34C] dark:bg-[#b88520]">
        <img
          src="/hero-top-banner.webp"
          alt="GoCoupon — Shop Smarter, Pay Less"
          className="w-full h-[130px] sm:h-[170px] md:h-[200px] lg:h-[220px] object-cover object-center"
          width={1263}
          height={379}
          loading="eager"
          fetchPriority="high"
        />
      </div>

      {/* Centered Hero Content & Search Box */}
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 pt-8 sm:pt-12 text-center">
        {/* Category Tag Pill */}
        <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3.5 py-1 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground shadow-2xs">
          <span>PRICE TRACKER &amp; AUTO-APPLY COUPONS</span>
        </div>

        {/* Main Headline */}
        <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground text-balance">
          Compare prices &amp; track drops across 100+ stores
        </h1>

        {/* Sub-Headline */}
        <p className="mt-2.5 text-sm sm:text-lg font-medium text-muted-foreground">
          Save instantly, every time you shop online!
        </p>

        {/* Centered Search Box */}
        <div className="mt-7 sm:mt-9 mx-auto max-w-3xl text-left">
          <UrlResolverSearch
            size="large"
            showPopularChips={true}
            showTrustBadges={true}
          />
        </div>

        {/* Pro Tip Pill */}
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/5 px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 shadow-2xs">
          <span>💡</span>
          <span>
            <strong>Pro Tip:</strong> Paste any Amazon India, Flipkart or Myntra link to find the lowest price in 1 click
          </span>
        </div>
      </div>
    </section>
  );
}
