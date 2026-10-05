/**
 * @file ProductHero.tsx
 * @description Modern, product-focused hero section replacing the generic affiliate clone
 * look with high-converting value propositions, live telemetry, and direct interactive demo CTA.
 */

import { Link } from "@tanstack/react-router";
import { useExtensionBridge } from "@/lib/useExtensionBridge";
import { Zap, ShieldCheck, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { useFestiveBanner } from "@/lib/hero-banner";
import { MagneticButton } from "../MagneticButton";

export function ProductHero() {
  const { isInstalled } = useExtensionBridge();
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
            <MagneticButton
              as="a"
              href="#checkout-simulator"
              onClick={(e) => {
                const el = document.getElementById("checkout-simulator");
                if (el) {
                  e.preventDefault();
                  el.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="group relative inline-flex min-h-[50px] items-center gap-2.5 sm:gap-3 overflow-hidden rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 px-6 sm:px-7 py-3 text-sm font-bold text-white border border-emerald-300/40 shadow-lg shadow-emerald-600/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-emerald-500/40 active:scale-[0.98] animate-button-glow-pulse cursor-pointer select-none"
            >
              {/* Animated Light Shimmer Sweep */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-full animate-shimmer-fast bg-gradient-to-r from-transparent via-white/25 to-transparent"
              />

              {/* Pulsing Live Radar Beacon */}
              <span className="relative flex h-2.5 w-2.5 items-center justify-center shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-200 opacity-80" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white shadow-xs" />
              </span>

              {/* Verified Shield Icon with Hover Micro-Motion */}
              <ShieldCheck className="h-5 w-5 text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-6deg] shrink-0 drop-shadow-xs" />

              {/* Clear, Intuitive Non-Technical Copy */}
              <span className="tracking-tight text-white drop-shadow-xs">Extension Active</span>
              <span className="inline-block h-1 w-1 rounded-full bg-emerald-200/80 shrink-0" />
              <span className="font-semibold text-emerald-50 tracking-tight drop-shadow-xs">Ready to Save</span>

              {/* Micro-animated Arrow */}
              <ArrowRight className="h-4 w-4 text-emerald-100 transition-transform duration-300 group-hover:translate-x-1 shrink-0" />
            </MagneticButton>
          ) : (
            <MagneticButton
              as="a"
              href="https://chromewebstore.google.com/detail/gbmfihnboadlmmjbikajlmocjmlpehij"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[50px] items-center gap-2.5 rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
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
            </MagneticButton>
          )}

          {isInstalled ? (
            <Link
              to="/offers"
              className="inline-flex min-h-[50px] items-center gap-2 rounded-full border border-border bg-card/80 px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted hover:border-primary/40 active:scale-95 transition-all shadow-2xs cursor-pointer"
            >
              <span>Browse 1,390+ Deals →</span>
            </Link>
          ) : (
            <a
              href="#checkout-simulator"
              onClick={(e) => {
                const el = document.getElementById("checkout-simulator");
                if (el) {
                  e.preventDefault();
                  el.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="inline-flex min-h-[50px] items-center gap-2 rounded-full border border-border bg-card/80 px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted active:scale-95 transition-all shadow-2xs cursor-pointer"
            >
              <Zap className="h-4 w-4 text-primary" />
              <span>Try Live Simulator ↓</span>
            </a>
          )}
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
