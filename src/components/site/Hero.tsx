/**
 * @file Hero.tsx
 * @description Clean, centered hero section with top banner illustration and unified Store & Deal Search.
 */

import { Link } from "@tanstack/react-router";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { useFestiveBanner } from "@/lib/hero-banner";

export function Hero() {
  const { banner, isActive, styles } = useFestiveBanner();

  return (
    <section className="relative overflow-hidden pt-8 sm:pt-12 pb-10 sm:pb-14">
      {/* Centered Hero Content */}
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
        {/* Main Headline */}
        <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground text-balance">
          Find Working Coupons &amp; Deals in 1 Second
          <span className="block mt-1 sm:mt-2 text-xl sm:text-3xl md:text-4xl font-bold text-primary">
            — Auto-Apply Promo Codes, Unlock Secret Discounts &amp; Save
          </span>
        </h1>

        {/* Dynamic Festive / Seasonal Announcement Pill (Controlled via Admin Panel) */}
        {isActive && (
          <div
            className={`mt-4 sm:mt-5 inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl sm:rounded-full border px-4 py-2 sm:py-1.5 text-xs sm:text-sm text-foreground/90 shadow-2xs backdrop-blur-xs transition-all max-w-full text-balance ${styles.container}`}
          >
            <span className="inline-flex items-center gap-1.5 shrink-0">
              {banner.showPingDot && (
                <span className={`flex h-2 w-2 rounded-full animate-ping ${styles.dot}`} />
              )}
              {banner.badgeTitle && (
                <strong className={`font-bold ${styles.badge}`}>
                  {banner.badgeTitle}
                </strong>
              )}
            </span>
            <span className="font-medium text-center sm:text-left">
              {banner.message}
            </span>
            {banner.linkText && banner.linkUrl && (
              <Link
                to={banner.linkUrl as any}
                className={`font-bold underline underline-offset-2 transition-colors ml-0.5 inline-flex items-center gap-0.5 shrink-0 ${styles.link}`}
              >
                <span>{banner.linkText}</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        )}

        {/* Trust Callout */}
        <div className="mt-6 sm:mt-7 inline-flex items-center gap-2.5 rounded-full border border-border/80 bg-card/90 px-4 sm:px-5 py-2 text-xs sm:text-sm text-foreground/80 shadow-2xs">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span>
            <strong className="font-semibold text-foreground">100% Verified:</strong> 980+ live codes tested today across 240+ partner stores with instant 1-click tracking.
          </span>
        </div>

        {/* Action CTAs */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://chromewebstore.google.com/detail/gbmfihnboadlmmjbikajlmocjmlpehij"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs sm:text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:scale-105 active:scale-95 touch-manipulation focus-visible:ring-2 focus-visible:ring-primary"
          >
            <img
              src="/icons/icon_48.png"
              onError={(e) => {
                e.currentTarget.src = "/icons/icon_128.png";
              }}
              alt=""
              aria-hidden="true"
              className="h-5 w-5 object-contain"
              width={20}
              height={20}
            />
            <span>Add to Chrome — It&apos;s 100% Free</span>
          </a>
          <Link
            to="/offers"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-border bg-card/80 px-5 py-2.5 text-xs sm:text-sm font-semibold text-foreground hover:bg-muted active:scale-95 transition-all shadow-2xs touch-manipulation focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span>Explore All 980+ Deals</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
