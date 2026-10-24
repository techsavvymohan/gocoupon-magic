/**
 * @file D2CWedgeComparison.tsx
 * @description Compact, high-contrast product positioning matrix comparing GoCoupon
 * against Honey and generic coupon blogs on Indian D2C and modern checkout flows.
 */

import { Check, X, Sparkles } from "lucide-react";
import { useLiveStats } from "@/hooks/use-live-stats";

export function D2CWedgeComparison() {
  const liveStats = useLiveStats();
  const rows = [
    {
      feature: "Indian D2C Checkouts",
      honey: "Fails on 80% of local carts",
      blogs: "Broken copy-paste codes",
      gocoupon: `${liveStats.formattedStoresCount} D2C Brands Supported`,
      gocouponDetail: "The Souled Store, boAt, Mamaearth, Snitch & more",
    },
    {
      feature: "Bank & UPI Stacking",
      honey: "No payment intelligence",
      blogs: "Static banners only",
      gocoupon: "Auto-Calculated at Checkout",
      gocouponDetail: "Stacks HDFC, ICICI, SBI, Axis cards & UPI discounts",
    },
    {
      feature: "Auto-Apply Speed",
      honey: "Slow 25s sequential lag",
      blogs: "15+ mins manual copy-paste",
      gocoupon: "1.4s Parallel Testing",
      gocouponDetail: "Tests all codes in parallel without freezing cart",
    },
    {
      feature: "Coupon Freshness",
      honey: "Expired crowdsourced clutter",
      blogs: "Outdated ad-clickbait links",
      gocoupon: "Verified Daily via Headless Tests",
      gocouponDetail: "Dead and expired codes auto-purged every 6 hours",
    },
    {
      feature: "Privacy & Security",
      honey: "Browsing history tracked",
      blogs: "Heavy third-party trackers",
      gocoupon: "Manifest V3 Sandboxed",
      gocouponDetail: "Zero credit card or password access • No login needed",
    },
  ];

  return (
    <section className="relative border-t border-border bg-slate-50/70 dark:bg-card/30 px-4 sm:px-6 py-8 sm:py-12 overflow-hidden">
      <div className="mx-auto max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[11px] font-semibold text-primary mb-2">
            <Sparkles className="h-3 w-3" />
            <span>Why GoCoupon Beats Generic Tools</span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Engineered for Checkouts Where Other Extensions Fail
          </h2>
        </div>

        {/* High-Contrast Compact Table */}
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[600px] border-collapse text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/60 font-display text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4 w-1/4">Feature</th>
                <th className="py-3 px-4 w-1/4 text-muted-foreground">US Extensions (Honey)</th>
                <th className="py-3 px-4 w-1/4 text-muted-foreground">Coupon Blogs</th>
                <th className="py-3 px-4 w-1/4 text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-950/20 border-l border-blue-200 dark:border-blue-900/40">
                  GoCoupon
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((row, idx) => (
                <tr key={idx} className="transition-colors hover:bg-muted/20">
                  <td className="py-3 px-4 font-semibold text-foreground">
                    {row.feature}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                      <X className="h-3.5 w-3.5 shrink-0" />
                      <span>{row.honey}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <X className="h-3.5 w-3.5 text-rose-500/80 shrink-0" />
                      <span>{row.blogs}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 bg-blue-50/50 dark:bg-blue-950/20 border-l border-blue-200 dark:border-blue-900/40">
                    <div className="flex items-start gap-1.5">
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {row.gocoupon}
                        </span>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                          {row.gocouponDetail}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
