/**
 * @file D2CWedgeComparison.tsx
 * @description Product positioning comparison highlighting why GoCoupon beats Honey,
 * Coupert, and generic coupon blogs on Indian D2C and modern Shopify checkout flows.
 */

import { Check, X, ShieldAlert, Zap, Sparkles } from "lucide-react";

export function D2CWedgeComparison() {
  const rows = [
    {
      feature: "Indian D2C Checkout Support",
      honey: "Fails on 80% of local carts (Shopify, Custom D2C)",
      blogs: "Useless copy-paste codes with 90% failure",
      gocoupon: "Custom selectors for 240+ D2C checkouts (Souled Store, boAt, Mamaearth, Snitch)",
      highlight: true,
    },
    {
      feature: "Bank & UPI Instant Rebate Stacking",
      honey: "Zero card or payment intelligence",
      blogs: "Generic banners with zero live calculation",
      gocoupon: "Auto-stacks HDFC, ICICI, SBI, Axis cards & UPI discounts with coupon codes",
      highlight: true,
    },
    {
      feature: "Parallel Auto-Apply Speed",
      honey: "Slow 25-30s sequential lag that freezes checkout",
      blogs: "Manual copy-pasting for 15+ minutes",
      gocoupon: "Ultra-fast parallel testing in under 1.4 seconds",
      highlight: true,
    },
    {
      feature: "Coupon Freshness Guarantee",
      honey: "Crowdsourced clutter with months-old expired codes",
      blogs: "Spam blogs designed purely to drop ad cookies",
      gocoupon: "Automated headless cart verification runs every 6 hours; dead codes purged",
      highlight: true,
    },
    {
      feature: "Security & Privacy Standard",
      honey: "Tracks user browsing & shopping profiles",
      blogs: "Hundreds of third-party tracker scripts",
      gocoupon: "Manifest V3 Sandboxed • Zero card data access • No login required",
      highlight: true,
    },
  ];

  return (
    <section className="relative border-t border-border bg-slate-50/60 dark:bg-card/40 px-4 sm:px-6 py-12 sm:py-20 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 font-mono text-xs font-semibold text-primary mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The Defensible Difference</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground text-balance">
            Why Generic Extensions Fail
            <span className="text-primary block mt-1">On Indian &amp; D2C Checkouts.</span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed text-balance">
            Honey, Coupert, and RetailMeNot were built for US retail giants like Walmart and Target. When tested on modern Indian D2C stores, their scrapers break. GoCoupon is engineered specifically to solve local checkouts.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto rounded-3xl border border-border/80 bg-card shadow-xl">
          <table className="w-full min-w-[650px] border-collapse text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 font-display text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-4 px-6 w-1/4">Feature / Capability</th>
                <th className="py-4 px-5 w-1/4 text-muted-foreground">US Extensions (Honey / Coupert)</th>
                <th className="py-4 px-5 w-1/4 text-muted-foreground">Generic Coupon Blogs</th>
                <th className="py-4 px-6 w-1/4 text-primary font-bold bg-primary/5 border-l border-primary/20">
                  GoCoupon Engine
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((row, idx) => (
                <tr key={idx} className="transition-colors hover:bg-muted/30">
                  <td className="py-4 px-6 font-semibold text-foreground">
                    {row.feature}
                  </td>
                  <td className="py-4 px-5 text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <X className="h-4 w-4 text-rose-500/80 shrink-0 mt-0.5" />
                      <span>{row.honey}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <X className="h-4 w-4 text-rose-500/80 shrink-0 mt-0.5" />
                      <span>{row.blogs}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 bg-primary/5 font-semibold text-foreground border-l border-primary/20">
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-primary-foreground/90 dark:text-foreground">{row.gocoupon}</span>
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
