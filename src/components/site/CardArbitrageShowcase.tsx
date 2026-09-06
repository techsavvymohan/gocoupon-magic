/**
 * @file CardArbitrageShowcase.tsx
 * @description High-impact visual showcase explaining why shoppers need GoCoupon:
 * The Problem (Stores will never tell you a competitor is cheaper with your card)
 * vs. GoCoupon's Value (In 1 second: Lowest on [Store] for [Your Card]).
 * Seamlessly supports both India (₹) and International/US ($).
 */

import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useCurrency } from "@/context/CurrencyContext";
import { 
  HdfcLogo, 
  SbiLogo, 
  ChaseLogo, 
  AmexLogo, 
  AffirmLogo 
} from "@/components/icons/BankLogos";
import { 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  ShieldCheck, 
  Globe2, 
  Sparkles,
  TrendingDown
} from "lucide-react";

export function CardArbitrageShowcase() {
  const { isIndia, currency, setCurrency } = useCurrency();
  const [activeMarket, setActiveMarket] = useState<"india" | "us">(isIndia ? "india" : "us");

  const handleToggle = (market: "india" | "us") => {
    setActiveMarket(market);
    if (market === "india" && currency !== "INR") {
      setCurrency("INR");
    } else if (market === "us" && currency !== "USD") {
      setCurrency("USD");
    }
  };

  return (
    <section className="relative overflow-hidden border-t border-border bg-gradient-to-b from-card/40 via-background to-card/20 px-4 sm:px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-4">
            <Zap className="h-3.5 w-3.5" aria-hidden="true" />
            <span>The GoCoupon Advantage</span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground text-balance">
            Stores Want You to Overpay.
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-primary bg-clip-text text-transparent">
              We Find Your Lowest Price in 1 Second.
            </span>
          </h2>

          <p className="mt-3.5 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto text-balance">
            Retailers are locked to their own inventory. GoCoupon is store-agnostic—we cross-check every store against your exact credit cards, bank discounts, and financing.
          </p>

          {/* Dual Region / Market Toggle */}
          <div className="mt-6 inline-flex items-center rounded-full border border-border bg-muted/60 p-1 shadow-xs">
            <button
              type="button"
              onClick={() => handleToggle("india")}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-bold transition-all ${
                activeMarket === "india"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>🇮🇳</span>
              <span>India Market (₹)</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggle("us")}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-bold transition-all ${
                activeMarket === "us"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>🇺🇸</span>
              <span>US &amp; Global ($)</span>
            </button>
          </div>
        </div>

        {/* The Problem vs The Value: Side-by-Side Comparison */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* THE PROBLEM CARD */}
          <div className="relative flex flex-col justify-between rounded-3xl border border-destructive/25 bg-gradient-to-br from-destructive/5 via-card to-card p-6 sm:p-8 shadow-sm">
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">
                  <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>The Single-Store Blindspot</span>
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">What Retailers Do</span>
              </div>

              <div className="mt-6 space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                  {activeMarket === "india"
                    ? "Amazon will never tell you Flipkart is ₹2,500 cheaper with your card."
                    : "Amazon or Walmart will never tell you Best Buy is $60 cheaper with your card."}
                </h3>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every store operates in a silo. When you browse on a single website, they only show their own retail price—even when a competitor offers an instant 10% bank discount, 5% cash back, or 0% APR installment plan on the exact same product.
                </p>

                {/* Visual Mock of Single Store Limitation */}
                <div className="mt-6 rounded-2xl border border-border/80 bg-background/80 p-4 sm:p-5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span className="font-semibold text-foreground">
                      {activeMarket === "india" ? "Browsing on Amazon India" : "Browsing on Amazon US"}
                    </span>
                    <span className="line-through text-muted-foreground/60">
                      {activeMarket === "india" ? "MRP ₹39,999" : "MSRP $849.00"}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl sm:text-3xl font-black text-foreground">
                        {activeMarket === "india" ? "₹37,000" : "$849.00"}
                      </span>
                      <span className="block text-[11px] text-destructive mt-0.5">
                        ❌ Misses external HDFC/SBI &amp; Chase/Amex card offers
                      </span>
                    </div>
                    <span className="rounded-lg bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                      Store locked
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-border/60 pt-4 text-xs text-muted-foreground flex items-center gap-2">
              <span className="text-destructive font-bold">Result:</span>
              <span>Shoppers overpay by an average of 8% to 15% per order without knowing it.</span>
            </div>
          </div>

          {/* GOCOUPON'S VALUE CARD */}
          <div className="relative flex flex-col justify-between rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-500/5 via-card to-card p-6 sm:p-8 shadow-md shadow-emerald-500/5">
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>GoCoupon 1-Second Value</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  ⚡ 1-Second Match
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                  {activeMarket === "india" ? (
                    <>
                      &ldquo;For your <span className="text-emerald-600 dark:text-emerald-400">HDFC Card</span> → Lowest on Flipkart at <span className="text-emerald-600 dark:text-emerald-400">₹34,500</span>.&rdquo;
                    </>
                  ) : (
                    <>
                      &ldquo;For your <span className="text-emerald-600 dark:text-emerald-400">Chase / Affirm</span> → Lowest on Best Buy at <span className="text-emerald-600 dark:text-emerald-400">$789</span>.&rdquo;
                    </>
                  )}
                </h3>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  GoCoupon is store-agnostic. We scan prices across stores in real time and automatically calculate the exact net checkout price for your specific wallet. You click, save instantly, and we receive a small partner commission.
                </p>

                {/* Visual Mock of GoCoupon's Smart Match */}
                <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.03] p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      {activeMarket === "india" ? "GoCoupon Smart Match (Flipkart)" : "GoCoupon Smart Match (Best Buy)"}
                    </span>
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                      {activeMarket === "india" ? "SAVE ₹2,500" : "SAVE $60.00"}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl sm:text-3xl font-black text-foreground">
                        {activeMarket === "india" ? "₹34,500" : "$789.00"}
                      </span>
                      <span className="block text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                        {activeMarket === "india"
                          ? "✓ Instant ₹2,500 HDFC Bank discount applied automatically"
                          : "✓ $60 Chase reward discount + optional 4x $197 with Affirm"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {activeMarket === "india" ? (
                        <>
                          <HdfcLogo className="h-6 w-6 shrink-0" />
                          <SbiLogo className="h-6 w-6 shrink-0" />
                        </>
                      ) : (
                        <>
                          <ChaseLogo className="h-6 w-6 shrink-0" />
                          <AmexLogo className="h-6 w-6 shrink-0" />
                          <AffirmLogo className="h-6 w-6 shrink-0" />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-border/60 pt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                <strong>100% Free:</strong> You get the lowest price, store pays our referral fee.
              </span>
              <Link
                to="/compare"
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:scale-105 active:scale-95"
              >
                <span>Try Live Comparison</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        {/* 3 Core Pillars Strip */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3 border-t border-border/80 pt-10">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">1-Second Net Price Calculation</h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Instant calculations with stackable bank discounts, coupon codes, and financing.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">100% Store-Agnostic</h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Zero bias toward Amazon, Flipkart, or Walmart. Our only job is finding your lowest price.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <TrendingDown className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Fake Sale Markup Protection</h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                90-day price history curves warn you if a &ldquo;discount&rdquo; was inflated right before a sale.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
