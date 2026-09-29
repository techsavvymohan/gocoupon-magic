/**
 * @file WhyUsExpenseSaviour.tsx
 * @description High-impact homepage section explaining why GoCoupon is the ultimate
 * financial saviour for online shopping expenses compared to Honey, Buyhatke, or standard coupon apps.
 */

import React from "react";
import { Link } from "@tanstack/react-router";
import { useCurrency } from "@/context/CurrencyContext";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  TrendingDown,
  Layers,
  Zap,
  CreditCard,
  Ticket,
  ArrowRight,
  Wallet,
  Coins,
  ShieldCheck,
} from "lucide-react";
import { MagneticButton } from "../MagneticButton";

export function WhyUsExpenseSaviour() {
  const { isIndia } = useCurrency();

  const comparisons = [
    {
      capability: "Live Verified Promo Codes",
      honey: "Crowdsourced codes (often 0% saved)",
      trackers: "Shows price graph only, zero coupons",
      gocoupon: "Direct merchant API sync 24/7 with zero dead codes",
      highlight: true,
    },
    {
      capability: "Checkout Auto-Apply Speed",
      honey: "Slow 20–30s checkout delay",
      trackers: "No checkout extension applier",
      gocoupon: "Parallel code testing in under 2 seconds",
      highlight: true,
    },
    {
      capability: "Bank & Credit Card Rebates",
      honey: "Zero bank card intelligence",
      trackers: "Zero payment method recommendations",
      gocoupon: "Calculates max instant discount for HDFC, SBI, ICICI, Axis, Amex",
      highlight: true,
    },
    {
      capability: "Smart Store & Deal Search",
      honey: "No instant web search bar",
      trackers: "Search restricted to historical graphs",
      gocoupon: "Instant autocomplete across 240+ stores & 980+ live API deals",
      highlight: true,
    },
    {
      capability: "Outbound Redirection Reliability",
      honey: "Frequent broken redirect links",
      trackers: "Basic outbound links without failover",
      gocoupon: "Zero 503 errors with smart merchant destination failover",
      highlight: false,
    },
    {
      capability: "Typical Annual Household Savings",
      honey: isIndia ? "₹800 – ₹1,500 / year" : "$20 – $40 / year",
      trackers: isIndia ? "₹1,200 – ₹2,500 / year" : "$30 – $60 / year",
      gocoupon: isIndia ? "₹15,000 – ₹35,000+ / year" : "$300 – $600+ / year",
      highlight: true,
    },
  ];

  const expenseLeaks = [
    {
      icon: Ticket,
      title: "1. The Dead Coupon Trap",
      leak: "Wasting 15 mins on expired codes",
      solution:
        "Generic coupon directories leave broken codes active for months. GoCoupon tests and purges expired vouchers every 15 minutes through direct API sync.",
    },
    {
      icon: CreditCard,
      title: "2. Unclaimed Bank Discounts",
      leak: isIndia ? "Leaving ₹2,500+ card offers unclaimed" : "Missing $50+ card partner rebates",
      solution:
        "You already hold the cards in your wallet. GoCoupon highlights whether HDFC, ICICI, SBI, Axis, or Amex unlocks an extra 5% to 15% instant checkout discount.",
    },
    {
      icon: Zap,
      title: "3. Manual Checkout Friction",
      leak: "Missing secret checkout vouchers",
      solution:
        "Our free Chrome Extension pops up automatically at checkout on 240+ stores, testing all working promo codes and applying the highest net savings in 2 seconds.",
    },
    {
      icon: ShieldCheck,
      title: "4. Broken Affiliate Dead-Ends",
      leak: "Annoying 503 errors on other sites",
      solution:
        "GoCoupon's smart redirection engine guarantees zero 503 errors by automatically resolving clean destination URLs while auto-copying your promo code.",
    },
  ];

  return (
    <section className="relative overflow-hidden border-t border-border bg-card/20 px-4 sm:px-6 py-14 sm:py-20">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground text-balance">
            Stop Donating Money to Retail Tricks.
            <span className="text-primary block mt-1">
              We Rescue Your Monthly Budget.
            </span>
          </h2>

          <p className="mt-5 text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed text-balance">
            Other coupon apps only check one store and test broken promo codes. Passive trackers tell you to wait weeks.
            GoCoupon is the <strong>only complete 4-tier savings engine</strong> that slashes your checkout bill right now.
          </p>
        </div>

        {/* 4 Financial Leaks Breakdown */}
        <div className="mb-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {expenseLeaks.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-xs transition-colors hover:border-primary/50"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                      {item.leak}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-foreground">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {item.solution}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Head-to-Head Comparison Matrix */}
        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          {/* Table Header */}
          <div className="p-6 sm:p-7 border-b border-border bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                How GoCoupon Compares with Competitors
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Why manual coupon aggregators (GrabOn, CouponDuniya, Dealspotr) and passive trackers fail modern shoppers
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 dark:border-emerald-800 bg-emerald-100 dark:bg-emerald-950/60 px-3.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>All 4 Savings Tiers Covered</span>
            </div>
          </div>

          {/* Desktop Table / Responsive Rows */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="p-4 sm:p-5 font-bold">Shopping Challenge</th>
                  <th className="p-4 sm:p-5 font-medium opacity-80">Aggregators (GrabOn / CouponDuniya / Dealspotr)</th>
                  <th className="p-4 sm:p-5 font-medium opacity-80">Passive Trackers</th>
                  <th className="p-4 sm:p-5 font-bold text-primary bg-primary/5">GoCoupon Intelligence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {comparisons.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`transition-colors hover:bg-muted/20 ${
                      row.highlight ? "bg-muted/5" : ""
                    }`}
                  >
                    <td className="p-4 sm:p-5 font-semibold text-foreground font-display">
                      {row.capability}
                    </td>
                    <td className="p-4 sm:p-5 text-muted-foreground">
                      <div className="flex items-start gap-1.5">
                        <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>{row.honey}</span>
                      </div>
                    </td>
                    <td className="p-4 sm:p-5 text-muted-foreground">
                      <div className="flex items-start gap-1.5">
                        <XCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <span>{row.trackers}</span>
                      </div>
                    </td>
                    <td className="p-4 sm:p-5 font-medium text-foreground bg-primary/5">
                      <div className="flex items-start gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{row.gocoupon}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Bottom Callout */}
          <div className="p-6 sm:p-7 bg-muted/20 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h4 className="font-display text-base sm:text-lg font-bold text-foreground">
                {isIndia ? "Save ₹50,000+ this year without changing how you shop." : "Save $700+ this year without changing how you shop."}
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                GoCoupon stays asleep in your browser until you hit checkout, then collapses your landed price in 2 seconds.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <MagneticButton
                as="a"
                href="https://chromewebstore.google.com/detail/gbmfihnboadlmmjbikajlmocjmlpehij"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs sm:text-sm font-bold text-primary-foreground shadow-xs transition-all hover:scale-105 active:scale-95"
              >
                <span>Add GoCoupon Free</span>
                <ArrowRight className="h-4 w-4" />
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
