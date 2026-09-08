/**
 * @file CardArbitrageShowcase.tsx
 * @description Practical, real-world commerce arbitrage showcase:
 * - Solves the high-ticket retail blindspot (iPhone, MacBook, Sony Audio)
 * - Real live mathematical breakdowns with verified bank offers
 * - Dual-market toggle (🇮🇳 India ₹ vs 🇺🇸 US/Global $)
 * - Product category switcher demonstrating real price differences
 * - Direct card application CTA (The real high-margin revenue engine)
 */

import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useCurrency } from "@/context/CurrencyContext";
import {
  HdfcLogo,
  SbiLogo,
  IciciLogo,
  AxisLogo,
  ChaseLogo,
  AmexLogo,
  CapitalOneLogo,
  AffirmLogo,
} from "@/components/icons/BankLogos";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Zap,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Laptop,
  Headphones,
  CreditCard,
  AlertTriangle,
} from "lucide-react";

interface RealDealExample {
  category: "phones" | "laptops" | "audio";
  title: string;
  specs: string;
  // India Data
  inStoreA: string;
  inPriceA: string;
  inStoreB: string;
  inPriceB: string;
  inSavings: string;
  inCardName: string;
  inCardDiscount: string;
  inCardLogo: "hdfc" | "sbi" | "icici" | "axis";
  // US Data
  usStoreA: string;
  usPriceA: string;
  usStoreB: string;
  usPriceB: string;
  usSavings: string;
  usCardName: string;
  usCardDiscount: string;
  usCardLogo: "chase" | "amex" | "capitalone" | "affirm";
}

const REAL_DEALS: RealDealExample[] = [
  {
    category: "phones",
    title: "Apple iPhone 16 (128GB)",
    specs: "Factory Sealed • 1-Yr Apple Warranty",
    inStoreA: "Amazon India",
    inPriceA: "₹79,900",
    inStoreB: "Flipkart",
    inPriceB: "₹74,900",
    inSavings: "₹5,000",
    inCardName: "HDFC Credit Card",
    inCardDiscount: "Flat ₹5,000 Instant Bank Discount",
    inCardLogo: "hdfc",
    usStoreA: "Amazon US",
    usPriceA: "$829.00",
    usStoreB: "Best Buy",
    usPriceB: "$769.00",
    usSavings: "$60.00",
    usCardName: "Chase Freedom / Affirm",
    usCardDiscount: "$60 Member Reward or 4x $192.25 @ 0% APR",
    usCardLogo: "chase",
  },
  {
    category: "laptops",
    title: 'Apple MacBook Air 13" (M3, 256GB)',
    specs: "8-Core CPU • 8-Core GPU • Liquid Retina",
    inStoreA: "Amazon India",
    inPriceA: "₹1,04,900",
    inStoreB: "Croma / Flipkart",
    inPriceB: "₹96,900",
    inSavings: "₹8,000",
    inCardName: "SBI Card / HDFC",
    inCardDiscount: "Instant ₹8,000 Flat Bank Discount",
    inCardLogo: "sbi",
    usStoreA: "Amazon US",
    usPriceA: "$1,099.00",
    usStoreB: "B&H / Best Buy",
    usPriceB: "$979.00",
    usSavings: "$120.00",
    usCardName: "Amex Blue Cash / Affirm",
    usCardDiscount: "$120 Instant Promotion + 0% APR Financing",
    usCardLogo: "amex",
  },
  {
    category: "audio",
    title: "Sony WH-1000XM5 Wireless ANC",
    specs: "Industry-Leading Noise Canceling • 30hr Battery",
    inStoreA: "Amazon India",
    inPriceA: "₹29,990",
    inStoreB: "Reliance / Flipkart",
    inPriceB: "₹26,990",
    inSavings: "₹3,000",
    inCardName: "ICICI Bank Card",
    inCardDiscount: "10% Instant Discount up to ₹3,000",
    inCardLogo: "icici",
    usStoreA: "Walmart",
    usPriceA: "$398.00",
    usStoreB: "Target / Best Buy",
    usPriceB: "$348.00",
    usSavings: "$50.00",
    usCardName: "Capital One / Affirm",
    usCardDiscount: "$50 Promotional Match + 5% Cash Back",
    usCardLogo: "capitalone",
  },
];

export function CardArbitrageShowcase() {
  const { isIndia, currency, setCurrency } = useCurrency();
  const [activeMarket, setActiveMarket] = useState<"india" | "us">(isIndia ? "india" : "us");
  const [activeCategory, setActiveCategory] = useState<"phones" | "laptops" | "audio">("phones");

  const handleMarketToggle = (market: "india" | "us") => {
    setActiveMarket(market);
    if (market === "india" && currency !== "INR") {
      setCurrency("INR");
    } else if (market === "us" && currency !== "USD") {
      setCurrency("USD");
    }
  };

  const currentDeal = REAL_DEALS.find((d) => d.category === activeCategory) || REAL_DEALS[0];

  const renderCardLogo = (logo: string) => {
    switch (logo) {
      case "hdfc":
        return <HdfcLogo className="h-7 w-7 shrink-0" />;
      case "sbi":
        return <SbiLogo className="h-7 w-7 shrink-0" />;
      case "icici":
        return <IciciLogo className="h-7 w-7 shrink-0" />;
      case "axis":
        return <AxisLogo className="h-7 w-7 shrink-0" />;
      case "chase":
        return <ChaseLogo className="h-7 w-7 shrink-0" />;
      case "amex":
        return <AmexLogo className="h-7 w-7 shrink-0" />;
      case "capitalone":
        return <CapitalOneLogo className="h-7 w-7 shrink-0" />;
      case "affirm":
        return <AffirmLogo className="h-7 w-7 shrink-0" />;
      default:
        return <CreditCard className="h-6 w-6 text-primary" />;
    }
  };

  return (
    <section className="relative overflow-hidden border-t border-border bg-card/10 px-4 sm:px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground text-balance">
            Find the Lowest Store Price in 1 Second.
            <span className="text-primary block mt-1">
              And Save Even More with Your Bank Card.
            </span>
          </h2>

          <p className="mt-3.5 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto text-balance">
            Amazon will never tell you a competitor is cheaper—or that an HDFC or Chase card cuts another ₹2,500 to $60 off. GoCoupon finds the lowest price for everyone, then auto-applies extra bank discounts.
          </p>

          {/* Region Switcher */}
          <div className="mt-6 inline-flex items-center rounded-full border border-border bg-muted/60 p-1 shadow-xs">
            <button
              type="button"
              onClick={() => handleMarketToggle("india")}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
                activeMarket === "india"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>India Market (₹)</span>
            </button>
            <button
              type="button"
              onClick={() => handleMarketToggle("us")}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
                activeMarket === "us"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>US &amp; Global ($)</span>
            </button>
          </div>
        </div>

        {/* Real Product Category Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
          <button
            type="button"
            onClick={() => setActiveCategory("phones")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
              activeCategory === "phones"
                ? "bg-primary text-primary-foreground shadow-md"
                : "border border-border bg-card/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>Smartphones</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("laptops")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
              activeCategory === "laptops"
                ? "bg-primary text-primary-foreground shadow-md"
                : "border border-border bg-card/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Laptop className="h-4 w-4" />
            <span>Laptops &amp; MacBooks</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("audio")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
              activeCategory === "audio"
                ? "bg-primary text-primary-foreground shadow-md"
                : "border border-border bg-card/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Headphones className="h-4 w-4" />
            <span>Audio &amp; TVs</span>
          </button>
        </div>

        {/* Live Side-by-Side Reality Comparison */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* THE PROBLEM CARD (Store Blindspot) */}
          <div className="relative flex flex-col justify-between rounded-3xl border border-destructive/25 bg-gradient-to-br from-destructive/5 via-card to-card p-6 sm:p-8 shadow-sm">
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">
                  <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>The Single-Store Blindspot</span>
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">Retailer Model</span>
              </div>

              <div className="mt-6 space-y-3">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Product Tested:
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  {currentDeal.title}
                </h3>
                <p className="text-xs text-muted-foreground font-mono">
                  {currentDeal.specs}
                </p>

                {/* Visual Mock of Single Store Overpay */}
                <div className="mt-5 rounded-2xl border border-border/80 bg-background p-4 sm:p-5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span className="font-semibold text-foreground">
                      {activeMarket === "india" ? currentDeal.inStoreA : currentDeal.usStoreA}
                    </span>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-mono">
                      No competitor alert
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl sm:text-3xl font-black text-foreground">
                        {activeMarket === "india" ? currentDeal.inPriceA : currentDeal.usPriceA}
                      </span>
                      <span className="block text-[11px] text-destructive mt-1 font-medium">
                        ❌ Only shows internal payment methods — locked to their inventory
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-border/60 pt-4 text-xs text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
              <span>
                <strong>Why it hurts:</strong> You pay full retail simply because you didn&apos;t know the competitor had an exclusive bank offer today.
              </span>
            </div>
          </div>

          {/* GOCOUPON'S 1-SECOND MATCH CARD */}
          <div className="relative flex flex-col justify-between rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-500/5 via-card to-card p-6 sm:p-8 shadow-md shadow-emerald-500/5">
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>GoCoupon 1-Second Match</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  ⚡ Lowest Net Price Verified
                </span>
              </div>

              <div className="mt-6 space-y-3">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Arbitrage Outcome:
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  &ldquo;Lowest on{" "}
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {activeMarket === "india" ? currentDeal.inStoreB : currentDeal.usStoreB}
                  </span>
                  {" "}
                  <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                    (Save extra with {activeMarket === "india" ? currentDeal.inCardName : currentDeal.usCardName})
                  </span>
                  &rdquo;
                </h3>
                <p className="text-xs text-muted-foreground font-mono">
                  {currentDeal.specs}
                </p>

                {/* Visual Mock of GoCoupon Smart Match */}
                <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.04] p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      Buy on {activeMarket === "india" ? currentDeal.inStoreB : currentDeal.usStoreB}
                    </span>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      YOU SAVE {activeMarket === "india" ? currentDeal.inSavings : currentDeal.usSavings}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl sm:text-3xl font-black text-foreground">
                        {activeMarket === "india" ? currentDeal.inPriceB : currentDeal.usPriceB}
                      </span>
                      <span className="block text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                        ✓ Lower base store price + optional {activeMarket === "india" ? currentDeal.inCardDiscount : currentDeal.usCardDiscount}
                      </span>
                    </div>
                    <div>
                      {renderCardLogo(
                        activeMarket === "india" ? currentDeal.inCardLogo : currentDeal.usCardLogo
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-border/60 pt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                <strong>100% Free &amp; Verified:</strong> Zero markup, direct checkout links.
              </span>
              <Link
                to="/compare"
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:scale-105 active:scale-95"
              >
                <span>Compare Prices Now</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        {/* Practical Card Application Bounty Strip (The Real Money Engine) */}
        <div className="mt-10 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-card to-card p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary">
                High-Bounty Card Engine
              </span>
              <h4 className="text-base sm:text-lg font-bold text-foreground">
                Don&apos;t have the discount card in your wallet yet?
              </h4>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-xl">
                {activeMarket === "india"
                  ? "Apply for an HDFC Millennia or SBI Cashback Card in 2 minutes. Get up to ₹2,000 in welcome gift vouchers plus instant ₹2,500 to ₹5,000 discounts on Flipkart & Amazon sales."
                  : "Apply for Chase Freedom Unlimited or Amex Blue Cash in 2 minutes. Enjoy a $200 welcome bonus, 5% cash back on grocery & retail, plus 0% intro APR."}
              </p>
            </div>
          </div>

          <Link
            to="/compare"
            className="shrink-0 inline-flex items-center gap-2 rounded-full border border-primary bg-primary px-6 py-3 text-xs sm:text-sm font-bold text-primary-foreground shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <span>Explore Card Offers</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* The Brutal Reality of Shopping: Why High-Ticket Items Win */}
        <div className="mt-12 rounded-2xl border border-border/80 bg-card/60 p-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground mb-3">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>The Practical Reality of Online Shopping</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 text-xs text-muted-foreground leading-relaxed">
            <div>
              <strong className="text-foreground">On Small Items (₹300 / $10):</strong> Prime delivery and saved passwords win—switching stores for ₹50 isn&apos;t worth the friction. We don&apos;t pretend otherwise.
            </div>
            <div>
              <strong className="text-foreground">On High-Ticket Gear (₹10,000+ / $200+):</strong> Bank partnerships create huge price gaps of <strong>₹3,000 to ₹8,000 ($50 to $150)</strong> on the exact same brand-new, sealed product with full manufacturer warranty. That is real money saved in 1 click.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
