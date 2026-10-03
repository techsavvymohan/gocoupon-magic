import { useExtensionBridge } from "@/lib/useExtensionBridge";
import { MagneticButton } from "../MagneticButton";
import { ArrowRight, Star, Tag } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function CTA() {
  const { isInstalled, version } = useExtensionBridge();
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
            <Link
              to="/offers"
              className="hidden md:inline-flex items-center gap-2 rounded-full bg-emerald-600 px-7 py-3.5 text-sm font-bold text-white shadow-xs transition-all hover:scale-105 active:scale-95"
            >
              <span>Extension Active (v{version || "1.2.0"}) — Browse 1,390+ Deals</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
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
            <span>1,390+ Active Deals Verified Today</span>
          </div>
        </div>
      </div>
    </section>
  );
}
