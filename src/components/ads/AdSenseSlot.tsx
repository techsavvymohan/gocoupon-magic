/**
 * @file src/components/ads/AdSenseSlot.tsx
 * @description Layout-Shift-Free (Zero-CLS) Google AdSense & High-Yield Affiliate Placement Container.
 *
 * Monetizes high-intent shoppers on /compare, /stores, and /blog:
 * - Prevents Cumulative Layout Shift (CLS) with pre-reserved min-heights
 * - Supports Google AdSense banner and in-feed formats
 * - Graceful fallback to high-yield Credit Card affiliation (₹1,500 - ₹3,500 bounty) when ads are blocked or pending approval
 */

import { useEffect, useRef } from "react";
import { CreditCard, ExternalLink } from "lucide-react";

interface AdSenseSlotProps {
  slotId?: string;
  format?: "leaderboard" | "rectangle" | "horizontal" | "card-affiliate";
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export function AdSenseSlot({ slotId, format = "horizontal", className = "" }: AdSenseSlotProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const adsenseClientId = import.meta.env.VITE_ADSENSE_CLIENT_ID || "";

  useEffect(() => {
    if (adsenseClientId && slotId && typeof window !== "undefined") {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        // Suppress AdSense duplicate load warnings
      }
    }
  }, [adsenseClientId, slotId]);

  // High-Yield Credit Card Affiliate Fallback Banner (when AdSense is not configured or in dev)
  if (!adsenseClientId || !slotId || format === "card-affiliate") {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-emerald-950/40 via-background to-blue-950/20 p-4 shadow-md transition-all hover:border-emerald-500/40 ${className}`}
        style={{ minHeight: format === "rectangle" ? "250px" : "90px" }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Featured High-Savings Card
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.2 text-[9px] font-bold text-emerald-400">
                  Flat 5% Cashback
                </span>
              </div>
              <h4 className="mt-0.5 font-display text-sm font-bold text-foreground">
                SBI Cashback &amp; HDFC Millennia Credit Cards
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Get an extra 5% instant cashback on Amazon, Flipkart, Myntra &amp; Swiggy orders. Zero joining fee via GoCoupon.
              </p>
            </div>
          </div>

          <a
            href="https://gocoupon.io/compare?card=sbi-cashback"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
          >
            Apply &amp; Get ₹1,500 Bonus
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    );
  }

  const heightClass =
    format === "leaderboard"
      ? "min-h-[90px]"
      : format === "rectangle"
      ? "min-h-[250px]"
      : "min-h-[100px]";

  return (
    <div
      ref={adRef}
      className={`relative my-4 flex items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-muted/10 text-center ${heightClass} ${className}`}
    >
      <span className="absolute top-1 right-2 text-[9px] font-mono uppercase text-muted-foreground/40">
        Advertisement
      </span>
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%" }}
        data-ad-client={adsenseClientId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
