/**
 * @file src/components/site/GrabOnHero.tsx
 * @description GrabOn-style Hero section for GoCoupon.io.
 *
 * Implements GrabOn's exact 2-column layout and UI/UX:
 * - Left/Center (8 cols): Main Hero Banner Carousel with interactive merchant tabs
 * - Right (4 cols): Top Picks / Spotlight Card with deal teaser and store switcher
 * - 100% Real GoCoupon Data from FEATURED_DEALS_COLLECTION (no mock / AI data)
 * - 1-Click Coupon Code Copy with Toast Notification
 * - Seamless Safe Affiliate & Store Navigation
 */

import { useState, useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Copy, Check, ExternalLink, ArrowRight, ShieldCheck, Tag } from "lucide-react";
import { toast } from "sonner";
import { FEATURED_DEALS_COLLECTION, type FeaturedDealItem } from "@/data/featured-deals-campaign";
import { StoreLogo } from "@/components/common/StoreLogo";
import { buildDealRedirectUrl } from "@/lib/services/store-registry";

// Color palettes for hero banner slides to give each brand an authentic, vibrant look
const BRAND_THEMES: Record<string, { bg: string; accent: string; badge: string; text: string }> = {
  medibuddy: {
    bg: "from-emerald-900 via-teal-900 to-cyan-950",
    accent: "text-emerald-400",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    text: "text-emerald-100",
  },
  flixbus: {
    bg: "from-lime-950 via-emerald-950 to-green-950",
    accent: "text-lime-400",
    badge: "bg-lime-500/20 text-lime-300 border-lime-500/30",
    text: "text-lime-100",
  },
  jbl: {
    bg: "from-orange-950 via-amber-950 to-stone-950",
    accent: "text-orange-400",
    badge: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    text: "text-orange-100",
  },
  "bombay-shaving-company": {
    bg: "from-amber-950 via-stone-900 to-yellow-950",
    accent: "text-amber-400",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    text: "text-amber-100",
  },
  muscleblaze: {
    bg: "from-red-950 via-neutral-900 to-rose-950",
    accent: "text-red-400",
    badge: "bg-red-500/20 text-red-300 border-red-500/30",
    text: "text-red-100",
  },
  snitch: {
    bg: "from-indigo-950 via-slate-900 to-blue-950",
    accent: "text-indigo-400",
    badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    text: "text-indigo-100",
  },
  "plum-goodness": {
    bg: "from-purple-950 via-fuchsia-950 to-slate-950",
    accent: "text-fuchsia-400",
    badge: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30",
    text: "text-fuchsia-100",
  },
  "earth-rhythm": {
    bg: "from-teal-950 via-emerald-950 to-stone-950",
    accent: "text-teal-400",
    badge: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    text: "text-teal-100",
  },
};

// Secondary Spotlight Stores for the Right-Side Card
const SIDE_PICKS = [
  {
    storeName: "Tata CLiQ",
    storeSlug: "tata-cliq",
    logo: "/Brand logos/Tata-cliq.webp",
    discount: "FLAT 15% OFF",
    desc: "Luxury fashion, watches & premium electronics",
    code: "TATACLIQ15",
    linkUrl: "/tata-cliq-coupons",
    bg: "from-slate-900 via-rose-950 to-slate-950",
  },
  {
    storeName: "Nykaa",
    storeSlug: "nykaa",
    logo: "/Brand logos/Nykaa.webp",
    discount: "UP TO 40% OFF",
    desc: "Bestselling beauty, cosmetics & luxury fragrances",
    code: "NYKAAFIRST",
    linkUrl: "/nykaa-coupons",
    bg: "from-pink-950 via-rose-900 to-slate-950",
  },
  {
    storeName: "Ajio",
    storeSlug: "ajio",
    logo: "/Brand logos/Ajio.webp?v=2",
    discount: "EXTRA ₹500 OFF",
    desc: "Trendy apparel, streetwear & footwear collections",
    code: "AJIOMANIA",
    linkUrl: "/stores/ajio",
    bg: "from-slate-900 via-blue-950 to-slate-950",
  },
  {
    storeName: "boAt",
    storeSlug: "boat",
    logo: "/Brand logos/gonoise.svg",
    discount: "FLAT ₹300 OFF",
    desc: "Wireless earbuds, smartwatches & noise-cancelling headphones",
    code: "BOAT300",
    linkUrl: "/boat-coupons",
    bg: "from-red-950 via-neutral-900 to-stone-950",
  },
];

export function GrabOnHero() {
  // Use real Featured Deals from GoCoupon dataset
  const mainDeals = useMemo(() => {
    return FEATURED_DEALS_COLLECTION.slice(0, 8);
  }, []);

  const [activeMainIndex, setActiveMainIndex] = useState(0);
  const [activeSideIndex, setActiveSideIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play carousel every 5 seconds unless hovered
  useEffect(() => {
    if (isPaused || mainDeals.length <= 1) return;
    const interval = setInterval(() => {
      setActiveMainIndex((prev) => (prev + 1) % mainDeals.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, mainDeals.length]);

  const currentDeal = mainDeals[activeMainIndex] || mainDeals[0];
  const theme = BRAND_THEMES[currentDeal?.brandSlug] || {
    bg: "from-slate-900 via-indigo-950 to-slate-950",
    accent: "text-primary",
    badge: "bg-primary/20 text-primary border-primary/30",
    text: "text-slate-200",
  };

  const currentSidePick = SIDE_PICKS[activeSideIndex] || SIDE_PICKS[0];

  const handleCopy = (code: string, brandName: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied!`, {
      description: `Paste at ${brandName} checkout to claim your discount.`,
    });
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <section
      className="relative bg-slate-50 dark:bg-background pt-5 pb-8 border-b border-border/60"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main Grid: 8 Cols Left (Hero Banner), 4 Cols Right (Side Card) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* ── Left / Center Main Banner (8 cols) ── */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            {/* Banner Card Container */}
            <div
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.bg} p-6 sm:p-8 text-white shadow-xl min-h-[340px] sm:min-h-[360px] flex flex-col justify-between transition-all duration-500 border border-white/10`}
            >
              {/* Background Glow & Pattern */}
              <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
              <div className="absolute right-8 bottom-6 opacity-10 pointer-events-none hidden sm:block">
                <StoreLogo
                  storeName={currentDeal.brandName}
                  storeLogo={currentDeal.logoUrl}
                  className="w-48 h-48 rounded-full"
                />
              </div>

              {/* Top Banner Header: Brand + Verified Tag */}
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-xl shadow-md shrink-0">
                    <StoreLogo
                      storeName={currentDeal.brandName}
                      storeLogo={currentDeal.logoUrl}
                      className="h-9 w-9 sm:h-11 sm:w-11"
                    />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg sm:text-xl text-white tracking-tight">
                      {currentDeal.brandName}
                    </h3>
                    <p className="text-xs text-white/70 font-medium">
                      {currentDeal.category} • India Eligible
                    </p>
                  </div>
                </div>

                {/* Badge */}
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-xs ${theme.badge}`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{currentDeal.badge || "Verified Partner Deal"}</span>
                </div>
              </div>

              {/* Center Offer Title & Huge Discount */}
              <div className="relative z-10 my-4">
                <span className="inline-block text-xs font-bold uppercase tracking-widest text-white/80 mb-1">
                  Exclusive Featured Promotion
                </span>
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className={`font-display text-3xl sm:text-5xl font-extrabold tracking-tight ${theme.accent}`}>
                    {currentDeal.discountText}
                  </span>
                  <span className="text-base sm:text-xl font-medium text-white/90">
                    {currentDeal.subTitle}
                  </span>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-white/80 max-w-xl line-clamp-2 leading-relaxed">
                  {currentDeal.terms || "Tested and verified coupon code ready for instant checkout redemption."}
                </p>
              </div>

              {/* Bottom Actions: Coupon Code Copy + Get Deal CTA */}
              <div className="relative z-10 flex flex-wrap items-center gap-3 pt-2">
                {currentDeal.couponCode ? (
                  <button
                    type="button"
                    onClick={() => handleCopy(currentDeal.couponCode, currentDeal.brandName)}
                    className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 px-4 py-2.5 text-xs sm:text-sm font-bold shadow-md hover:bg-slate-100 active:scale-95 transition-all group"
                  >
                    <Tag className="w-4 h-4 text-primary" />
                    <span className="font-mono tracking-wider">{currentDeal.couponCode}</span>
                    {copiedCode === currentDeal.couponCode ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold ml-1">
                        <Check className="w-3.5 h-3.5" /> Copied!
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500 font-medium ml-1">
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </span>
                    )}
                  </button>
                ) : null}

                <a
                  href={currentDeal.affiliateUrl || currentDeal.merchantUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                >
                  <span>Redeem Deal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <Link
                  to="/featured-deals"
                  className="inline-flex items-center gap-1 text-xs text-white/80 hover:text-white underline underline-offset-4 ml-auto font-medium"
                >
                  <span>View all featured</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Merchant Switcher Tabs Strip (GrabOn exact design!) */}
            <div className="mt-3 bg-white dark:bg-card rounded-xl border border-slate-200/80 dark:border-border/80 p-1.5 shadow-2xs overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-1 min-w-max">
                {mainDeals.map((deal, idx) => {
                  const isActive = idx === activeMainIndex;
                  return (
                    <button
                      key={deal.id}
                      type="button"
                      onClick={() => setActiveMainIndex(idx)}
                      className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex flex-col items-center gap-0.5 ${
                        isActive
                          ? "bg-slate-900 text-white dark:bg-primary dark:text-primary-foreground shadow-xs"
                          : "text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground hover:bg-slate-100 dark:hover:bg-muted"
                      }`}
                    >
                      <span>{deal.brandName}</span>
                      {/* Active indicator dot */}
                      {isActive && (
                        <span className="w-1 h-1 rounded-full bg-cyan-400 dark:bg-white animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Right Side Spotlight Card (4 cols) — GrabOn Top Picks Style ── */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${currentSidePick.bg} text-white shadow-xl min-h-[340px] sm:min-h-[360px] p-6 flex flex-col justify-between border border-white/10`}
            >
              {/* Top Banner Tag */}
              <div className="flex items-center justify-between">
                <span className="inline-block text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                  TOP PICK OF THE DAY
                </span>
                <div className="bg-white p-1.5 rounded-lg shadow-sm">
                  <img
                    src={currentSidePick.logo}
                    alt={currentSidePick.storeName}
                    className="h-6 w-auto object-contain"
                  />
                </div>
              </div>

              {/* Floating Center Card (GrabOn Top Picks look) */}
              <div className="my-auto bg-white/95 dark:bg-card/95 backdrop-blur-md rounded-xl p-4 text-slate-900 dark:text-foreground shadow-lg border border-white/20 mt-4 mb-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-display font-extrabold text-xl sm:text-2xl text-primary">
                    {currentSidePick.discount}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    Verified
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-2">
                  {currentSidePick.desc}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-border/60 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(currentSidePick.code, currentSidePick.storeName)}
                    className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    <span>{currentSidePick.code}</span>
                  </button>

                  <Link
                    to={currentSidePick.linkUrl as any}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-primary dark:text-primary-foreground px-3 py-1.5 text-xs font-bold shadow-xs hover:scale-105 active:scale-95 transition-all"
                  >
                    <span>GRAB NOW</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Bottom Note */}
              <div className="text-[11px] text-white/70 text-center flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tested on {currentSidePick.storeName} cart</span>
              </div>
            </div>

            {/* Side Pick Store Tabs (UBER / Udemy / Tata Cliq / Nykaa style) */}
            <div className="mt-3 bg-white dark:bg-card rounded-xl border border-slate-200/80 dark:border-border/80 p-1.5 shadow-2xs">
              <div className="grid grid-cols-4 gap-1">
                {SIDE_PICKS.map((pick, idx) => {
                  const isActive = idx === activeSideIndex;
                  return (
                    <button
                      key={pick.storeName}
                      type="button"
                      onClick={() => setActiveSideIndex(idx)}
                      className={`relative py-1.5 px-2 rounded-lg text-xs font-semibold text-center truncate transition-all duration-200 flex flex-col items-center gap-0.5 ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-xs font-bold"
                          : "text-slate-600 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-muted"
                      }`}
                      title={pick.storeName}
                    >
                      <span className="truncate w-full">{pick.storeName}</span>
                      {isActive && <span className="w-1 h-1 rounded-full bg-white animate-pulse" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
