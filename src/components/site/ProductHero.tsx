/**
 * @file ProductHero.tsx
 * @description Modern, product-focused hero section replacing the generic affiliate clone
 * look with high-converting value propositions, live telemetry, and direct interactive demo CTA.
 */

import { Link } from "@tanstack/react-router";
import { useExtensionBridge } from "@/lib/useExtensionBridge";
import { Zap, ShieldCheck, ArrowRight, Sparkles, CheckCircle2, Clock } from "lucide-react";
import { useFestiveBanner } from "@/lib/hero-banner";

export function ProductHero() {
  const { isInstalled, version } = useExtensionBridge();
  const { banner, isActive, styles } = useFestiveBanner();

  return (
    <section className="relative overflow-hidden pt-8 sm:pt-14 pb-12 sm:pb-16 bg-gradient-to-b from-card/30 via-background to-background border-b border-border/60">
      {/* Background radial highlight */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-full max-w-4xl rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center">
        {/* Dynamic Festive / Seasonal Announcement Pill (Admin Controlled) */}
        {isActive && (
          <div
            className={`mb-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl sm:rounded-full border px-4 py-2 sm:py-1.5 text-xs sm:text-sm text-foreground/90 shadow-2xs backdrop-blur-xs transition-all max-w-full text-balance ${styles.container}`}
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

        {/* Sharp Wedge Eyebrow */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 font-mono text-xs font-semibold text-primary mb-5">
          <span className="text-sm">🇮🇳</span>
          <span>Engineered for D2C &amp; Top Online Checkouts</span>
        </div>

        {/* Main Headline */}
        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground text-balance leading-[1.15]">
          Never Pay Full Price Online Again.
          <span className="text-primary block mt-1.5 sm:mt-2">
            Real Coupons That Actually Work at Checkout.
          </span>
        </h1>

        {/* Subhead */}
        <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed text-balance">
          Stop typing expired codes from spam blogs. GoCoupon auto-tests verified promo codes, clips hidden merchant vouchers, and stacks instant bank card discounts in <strong>1.4 seconds</strong>.
        </p>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          {isInstalled ? (
            <a
              href="#checkout-simulator"
              className="inline-flex min-h-[48px] items-center gap-2.5 rounded-full bg-emerald-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ShieldCheck className="h-5 w-5 text-white" />
              <span>Extension Active (v{version || "1.2.0"}) — Test Carts</span>
            </a>
          ) : (
            <a
              href="https://chromewebstore.google.com/detail/gbmfihnboadlmmjbikajlmocjmlpehij"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center gap-2.5 rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
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
          )}

          <a
            href="#checkout-simulator"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-border bg-card/80 px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted active:scale-95 transition-all shadow-2xs cursor-pointer"
          >
            <Zap className="h-4 w-4 text-primary" />
            <span>Try Live Simulator ↓</span>
          </a>
        </div>

        {/* Trust Telemetry Strip */}
        <div className="mt-10 pt-6 border-t border-border/60 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-primary" />
            <span><strong className="text-foreground">1.4s</strong> Auto-Apply Speed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span><strong className="text-foreground">Manifest V3</strong> Sandboxed Safe</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
            <span><strong className="text-foreground">94.8%</strong> Cart Verification Rate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-amber-500" />
            <span>Updated Today: <strong className="text-foreground">1,390+ Deals</strong></span>
          </div>
        </div>
      </div>
    </section>
  );
}
