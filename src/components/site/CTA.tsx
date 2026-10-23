import { useExtensionBridge } from "@/lib/useExtensionBridge";
import { MagneticButton } from "../MagneticButton";
import { ArrowRight, Star, Tag, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useLiveStats } from "@/hooks/use-live-stats";

export function CTA() {
  const { isInstalled } = useExtensionBridge();
  const stats = useLiveStats();
  return (
    <section id="cta" className="relative px-4 sm:px-6 py-10 sm:py-14 border-t border-border">
      <div className="reveal relative mx-auto max-w-4xl rounded-2xl border border-border bg-card p-6 sm:p-10 text-center shadow-xs">
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground text-balance">
          Put Real Money Back
          <span className="text-primary block mt-1">
            Into Your Household Budget.
          </span>
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed text-balance">
          Every time you buy without GoCoupon, you risk leaving money on the table in hidden vouchers, store price differences, and unclaimed bank discounts.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {/* Desktop CTA: Chrome Web Store */}
          {isInstalled ? (
            <MagneticButton
              as="a"
              href="https://chromewebstore.google.com/detail/gbmfihnboadlmmjbikajlmocjmlpehij"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative hidden md:inline-flex min-h-[50px] items-center gap-2.5 sm:gap-3 overflow-hidden rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 px-7 py-3.5 text-sm font-bold text-white border border-emerald-300/40 shadow-lg shadow-emerald-600/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-emerald-500/40 active:scale-[0.98] animate-button-glow-pulse"
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

              {/* Shield Icon */}
              <ShieldCheck className="h-5 w-5 text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-6deg] shrink-0 drop-shadow-xs" />

              {/* Clean Human-Readable Label */}
              <span className="tracking-tight text-white drop-shadow-xs">Extension Active</span>
              <span className="inline-block h-1 w-1 rounded-full bg-emerald-200/80 shrink-0" />
              <span className="font-semibold text-emerald-50 tracking-tight drop-shadow-xs">Browse {stats.formattedCount} Deals</span>

              <ArrowRight className="h-4 w-4 text-emerald-100 transition-transform duration-300 group-hover:translate-x-1 shrink-0" />
            </MagneticButton>
          ) : (
            <MagneticButton
              as="a"
              href="https://chromewebstore.google.com/detail/gbmfihnboadlmmjbikajlmocjmlpehij"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground shadow-xs transition-all hover:scale-105 active:scale-95"
            >
              <span>Add GoCoupon Free — Start Saving</span>
              <ArrowRight className="h-4 w-4" />
            </MagneticButton>
          )}

          {/* Mobile CTA: Instant Store Search / Offers */}
          <Link
            to="/offers"
            className="inline-flex md:hidden items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground shadow-xs transition-all hover:scale-105 active:scale-95"
          >
            <Tag className="h-4 w-4" />
            <span>Find Working Coupons for Your Cart</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{stats.formattedCount} Active Deals Verified Today</span>
          </div>
        </div>
      </div>
    </section>
  );
}
