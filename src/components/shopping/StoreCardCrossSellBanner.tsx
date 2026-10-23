/**
 * @file StoreCardCrossSellBanner.tsx
 * @description Store-Specific Bank Card Cross-Sell Banner (Double Monetization Engine).
 * Contextually detects the store (Flipkart, Swiggy, Travel, Amazon/General) and displays
 * the highest-converting co-branded or universal cashback card with instant approval link,
 * generating ₹1,200 - ₹2,362 CPA bounties via verified bank affiliate programs.
 */

import React from "react";
import { Link } from "@tanstack/react-router";
import {
  SUPPORTED_BANK_CARDS,
  type BankCardDefinition,
} from "@/lib/services/bank-offers";
import { BankLogoIcon } from "@/components/icons/BankLogos";
import {
  ShieldCheck,
  Zap,
  Sparkles,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Flame,
} from "lucide-react";

export interface StoreCardCrossSellBannerProps {
  storeName?: string;
  category?: string;
  className?: string;
}

export function getRecommendedCardForStore(
  storeName?: string,
  category?: string
): {
  card: BankCardDefinition;
  headline: string;
  highlightPerk: string;
  tagline: string;
  badgeText: string;
  badgeColor: string;
} {
  const normStore = (storeName || "").toLowerCase();
  const normCat = (category || "").toLowerCase();

  // 1. Flipkart store -> Flipkart Axis Bank Card (₹1,890 - ₹2,362 bounty)
  if (normStore.includes("flipkart")) {
    const card =
      SUPPORTED_BANK_CARDS.find((c) => c.id === "axis") || SUPPORTED_BANK_CARDS[0];
    return {
      card,
      headline: "Extra 5% Unlimited Cashback on Flipkart + ₹500 Voucher",
      highlightPerk:
        "Flat 5% Unlimited Cashback auto-credited each billing cycle + ₹500 Flipkart voucher on card activation.",
      tagline: "Official Flipkart Co-Branded Card Partner",
      badgeText: "₹500 WELCOME VOUCHER",
      badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    };
  }

  // 2. Swiggy / Food delivery -> HDFC Swiggy Card (₹1,829 bounty)
  if (
    normStore.includes("swiggy") ||
    normStore.includes("zomato") ||
    normStore.includes("domino") ||
    normStore.includes("mcdonald") ||
    normStore.includes("food") ||
    normCat.includes("food") ||
    normCat.includes("dining") ||
    normCat.includes("grocery")
  ) {
    const card =
      SUPPORTED_BANK_CARDS.find((c) => c.id === "hdfc") || SUPPORTED_BANK_CARDS[1];
    return {
      card,
      headline: "Flat 10% Cashback on Swiggy + 3-Mo. Free Swiggy One",
      highlightPerk:
        "10% Flat Cashback on Swiggy Food, Instamart & Dineout + 5% across 1,000+ top online shopping stores.",
      tagline: "Food & Grocery Privilege Partner",
      badgeText: "FREE SWIGGY ONE INCLUDED",
      badgeColor: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
    };
  }

  // 3. Travel / Flight / Hotel booking -> Federal Scapia Travel Card (₹1,200 bounty)
  if (
    normStore.includes("booking") ||
    normStore.includes("makemytrip") ||
    normStore.includes("agoda") ||
    normStore.includes("klook") ||
    normStore.includes("cleartrip") ||
    normStore.includes("easemytrip") ||
    normStore.includes("ixigo") ||
    normStore.includes("yatra") ||
    normStore.includes("goibibo") ||
    normStore.includes("travel") ||
    normStore.includes("flight") ||
    normStore.includes("hotel") ||
    normCat.includes("travel") ||
    normCat.includes("flight") ||
    normCat.includes("hotel")
  ) {
    const card =
      SUPPORTED_BANK_CARDS.find((c) => c.id === "scapia") || SUPPORTED_BANK_CARDS[0];
    return {
      card,
      headline: "Zero Forex Fee (0%) + Unlimited Airport Lounge Access",
      highlightPerk:
        "Lifetime FREE Card: 0% Forex markup worldwide, unlimited domestic airport lounges, and up to 20% Scapia Coins on flights & stays.",
      tagline: "Zero Forex International Travel Card",
      badgeText: "LIFETIME FREE (₹0 FEES)",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    };
  }

  // 4. Default / General stores (Amazon, Myntra, Ajio, Nykaa, Croma, Boat, Tata CLiQ, etc.) -> SBI Sprint Cashback Card (₹1,890 bounty)
  const card =
    SUPPORTED_BANK_CARDS.find((c) => c.id === "sbi") || SUPPORTED_BANK_CARDS[2];
  return {
    card,
    headline: `Extra 5% Unlimited Cashback on ${storeName || "All Online Orders"}`,
    highlightPerk: `Flat 5% Unlimited Cashback on ${storeName || "all online shopping"} with zero merchant restrictions. Auto-credited every month.`,
    tagline: "Universal 5% Online Shopping Cashback Card",
    badgeText: "FLAT 5% AUTO-CASHBACK",
    badgeColor: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
  };
}

export function StoreCardCrossSellBanner({
  storeName,
  category,
  className = "",
}: StoreCardCrossSellBannerProps) {
  const { card, headline, highlightPerk, tagline, badgeText, badgeColor } =
    getRecommendedCardForStore(storeName, category);

  return (
    <section
      aria-label={`Double savings at ${storeName || "this store"} with bank card`}
      className={`relative overflow-hidden rounded-3xl border-2 border-primary/25 bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8 shadow-xl transition-all hover:border-primary/40 ${className}`}
    >
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
        {/* Left Column: Bank Logo + Strategic Benefit */}
        <div className="flex-1 space-y-4">
          {/* Eyebrow Pill */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-primary border border-primary/20">
              <Zap className="h-3.5 w-3.5 fill-primary" />
              <span>Double Monetization Arbitrage</span>
            </span>

            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider border font-mono ${badgeColor}`}
            >
              <Sparkles className="h-3 w-3" />
              <span>{badgeText}</span>
            </span>
          </div>

          {/* Main Headline */}
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 shrink-0 rounded-2xl bg-white dark:bg-card border border-border/80 p-2 shadow-md flex items-center justify-center">
              <BankLogoIcon cardId={card.id} className="h-10 w-10 object-contain" />
            </div>

            <div>
              <h3 className="font-display text-xl sm:text-2xl font-black tracking-tight text-foreground">
                {headline}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground font-medium">
                {card.cardName} &bull; <span className="text-primary font-semibold">{tagline}</span>
              </p>
            </div>
          </div>

          {/* Key Value Prop & Stacking Benefit */}
          <div className="rounded-2xl border border-border/70 bg-background/60 p-4 backdrop-blur-xs">
            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
              <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                How It Works:{" "}
              </strong>
              {highlightPerk}
            </p>

            <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Stacks directly on top of store promo codes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>100% digital 2-minute instant approval</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Fee: {card.annualFee}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Welcome Perk: {card.welcomeBonus}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: High-Converting CTA Box */}
        <div className="lg:w-80 shrink-0 flex flex-col items-stretch gap-3 rounded-2xl border border-border/80 bg-background/80 p-5 shadow-xs backdrop-blur-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Annual Estimated Reward</span>
            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
              ₹3,500 – ₹7,200/yr
            </span>
          </div>

          <a
            href={card.affiliateApplyUrl}
            target="_blank"
            rel="noopener sponsored nofollow"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-center"
          >
            <span>Apply Now (Instant Approval)</span>
            <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground text-center">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Official Bank Partner &bull; Zero Impact on CIBIL</span>
          </div>

          <div className="pt-2 border-t border-border/60 text-center">
            <Link
              to="/offers"
              search={{ tab: "banks" }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Compare All 4 Bank Cards</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
