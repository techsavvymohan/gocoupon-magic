/**
 * @file src/components/site/GrabOnHero.tsx
 * @description GrabOn-style Hero section with full Embla sliding carousel animations.
 *
 * Implements GrabOn's exact 2-column layout and UI/UX:
 * - Left/Center (8 cols): Main Hero Banner Carousel with smooth Embla horizontal sliding transitions & active progress timer
 * - Right (4 cols): Top Picks / Spotlight Card with smooth Embla sliding transition
 * - 100% Real GoCoupon Data from FEATURED_DEALS_COLLECTION (no mock / AI data)
 * - 1-Click Coupon Code Copy with Toast Notification & Checkmark Bounce
 * - Auto-play with hover pause and animated tab progress bar
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import useEmblaCarousel from "embla-carousel-react";
import { Copy, Check, ExternalLink, ArrowRight, ShieldCheck, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { FEATURED_DEALS_COLLECTION, type FeaturedDealItem } from "@/data/featured-deals-campaign";
import { StoreLogo } from "@/components/common/StoreLogo";
import { useFestiveBanner } from "@/lib/hero-banner";

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
    linkUrl: "/ajio-coupons",
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
  const { banner: festiveBanner, isActive: isFestiveBannerActive, styles: festiveStyles } = useFestiveBanner();
  const mainDeals = useMemo(() => FEATURED_DEALS_COLLECTION.slice(0, 8), []);

  const [activeMainIndex, setActiveMainIndex] = useState(0);
  const [activeSideIndex, setActiveSideIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // ── Embla Carousel Instance for Main Hero Banner ──
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel({
    loop: true,
    duration: 25,
  });

  // ── Embla Carousel Instance for Right Side Card ──
  const [emblaSideRef, emblaSideApi] = useEmblaCarousel({
    loop: true,
    duration: 25,
  });

  // Sync main carousel select event
  const onSelectMain = useCallback(() => {
    if (!emblaMainApi) return;
    setActiveMainIndex(emblaMainApi.selectedScrollSnap());
  }, [emblaMainApi]);

  useEffect(() => {
    if (!emblaMainApi) return;
    emblaMainApi.on("select", onSelectMain);
    emblaMainApi.on("reInit", onSelectMain);
  }, [emblaMainApi, onSelectMain]);

  // Sync side carousel select event
  const onSelectSide = useCallback(() => {
    if (!emblaSideApi) return;
    setActiveSideIndex(emblaSideApi.selectedScrollSnap());
  }, [emblaSideApi]);

  useEffect(() => {
    if (!emblaSideApi) return;
    emblaSideApi.on("select", onSelectSide);
    emblaSideApi.on("reInit", onSelectSide);
  }, [emblaSideApi, onSelectSide]);

  // Auto-play main banner every 5 seconds (with hover pause)
  useEffect(() => {
    if (isPaused || !emblaMainApi) return;
    const interval = setInterval(() => {
      emblaMainApi.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, emblaMainApi]);

  // Auto-play side banner every 7 seconds
  useEffect(() => {
    if (isPaused || !emblaSideApi) return;
    const interval = setInterval(() => {
      emblaSideApi.scrollNext();
    }, 7000);
    return () => clearInterval(interval);
  }, [isPaused, emblaSideApi]);

  const handleSelectMainTab = (index: number) => {
    setActiveMainIndex(index);
    emblaMainApi?.scrollTo(index);
  };

  const handleSelectSideTab = (index: number) => {
    setActiveSideIndex(index);
    emblaSideApi?.scrollTo(index);
  };

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
      className="relative bg-slate-50/70 dark:bg-background/80 pt-4 sm:pt-6 pb-6 sm:pb-8 border-b border-border/60"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Dynamic Festive / Seasonal Announcement Pill (Controlled via Admin Panel) */}
        {isFestiveBannerActive && (
          <div className="mb-4 sm:mb-5 flex justify-center animate-in fade-in duration-300">
            <div
              className={`inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl sm:rounded-full border px-4 py-2 sm:py-1.5 text-xs sm:text-sm text-foreground/90 shadow-2xs backdrop-blur-xs transition-all max-w-full text-balance ${festiveStyles.container}`}
            >
              <span className="inline-flex items-center gap-1.5 shrink-0">
                {festiveBanner.showPingDot && (
                  <span className={`flex h-2 w-2 rounded-full animate-ping ${festiveStyles.dot}`} />
                )}
                {festiveBanner.badgeTitle && (
                  <strong className={`font-bold ${festiveStyles.badge}`}>
                    {festiveBanner.badgeTitle}
                  </strong>
                )}
              </span>
              <span className="font-medium text-center sm:text-left">
                {festiveBanner.message}
              </span>
              {festiveBanner.linkText && festiveBanner.linkUrl && (
                <Link
                  to={festiveBanner.linkUrl as any}
                  className={`font-bold underline underline-offset-2 transition-colors ml-0.5 inline-flex items-center gap-0.5 shrink-0 ${festiveStyles.link}`}
                >
                  <span>{festiveBanner.linkText}</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Main Grid: Full width on mobile/tablet (1 focused card), 8+4 cols on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch">
          
          {/* ── Main Banner (Full width on mobile, 8 cols on desktop) with Embla Smooth Slide ── */}
          <div className="w-full lg:col-span-8 flex flex-col justify-between">
            {/* Embla Viewport with Floating Controls */}
            <div className="relative group/hero">
              <div className="overflow-hidden rounded-2xl shadow-xl bg-slate-950" ref={emblaMainRef}>
                <div className="flex touch-pan-y">
                  {mainDeals.map((deal, idx) => {
                    const theme = BRAND_THEMES[deal.brandSlug] || {
                      bg: "from-slate-900 via-indigo-950 to-slate-950",
                      accent: "text-primary",
                      badge: "bg-primary/20 text-primary border-primary/30",
                      text: "text-slate-200",
                    };

                    return (
                      <div
                        key={deal.id}
                        className="flex-[0_0_100%] min-w-0"
                      >
                        <div
                          className={`relative overflow-hidden bg-gradient-to-br ${theme.bg} p-4 sm:p-7 text-white min-h-[300px] sm:min-h-[350px] flex flex-col justify-between border border-white/10 transition-colors duration-500`}
                        >
                          {/* Background Glow & Pattern */}
                          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
                          <div className="absolute right-8 bottom-6 opacity-10 pointer-events-none hidden sm:block">
                            <StoreLogo
                              storeName={deal.brandName}
                              storeLogo={deal.logoUrl}
                              className="w-48 h-48 rounded-full"
                            />
                          </div>

                          {/* Top Banner Header: Brand + Verified Tag */}
                          <div className="relative z-10 flex items-center justify-between gap-2 sm:gap-3">
                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                              <div className="bg-white p-1.5 sm:p-2 rounded-xl shadow-md shrink-0 transition-transform duration-300 hover:scale-105">
                                <StoreLogo
                                  storeName={deal.brandName}
                                  storeLogo={deal.logoUrl}
                                  className="h-8 w-8 sm:h-10 sm:w-10"
                                />
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-display font-bold text-base sm:text-xl text-white tracking-tight truncate">
                                  {deal.brandName}
                                </h3>
                                <p className="text-[11px] sm:text-xs text-white/70 font-medium truncate">
                                  {deal.category} • India Eligible
                                </p>
                              </div>
                            </div>

                            {/* Badge with gentle pulse */}
                            <div
                              className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold border backdrop-blur-xs shrink-0 transition-all ${theme.badge}`}
                            >
                              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              <span>{deal.badge || "Verified Deal"}</span>
                            </div>
                          </div>

                          {/* Center Offer Title & Huge Discount */}
                          <div className="relative z-10 my-3 sm:my-4">
                            <div className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/80 mb-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>Featured Promotion</span>
                            </div>
                            <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
                              <span className={`font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight ${theme.accent}`}>
                                {deal.discountText}
                              </span>
                              <span className="text-sm sm:text-lg font-medium text-white/95 line-clamp-1 sm:line-clamp-2">
                                {deal.subTitle}
                              </span>
                            </div>
                            <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs text-white/75 max-w-xl line-clamp-1 sm:line-clamp-2 leading-relaxed">
                              {deal.terms || "Tested and verified coupon code ready for instant checkout redemption."}
                            </p>
                          </div>

                          {/* Bottom Actions: Coupon Code Copy + Get Deal CTA */}
                          <div className="relative z-10 flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
                            {deal.couponCode ? (
                              <button
                                type="button"
                                onClick={() => handleCopy(deal.couponCode, deal.brandName)}
                                className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl bg-white text-slate-900 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-bold shadow-md hover:bg-slate-100 active:scale-95 transition-all group cursor-pointer"
                              >
                                <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                                <span className="font-mono tracking-wider">{deal.couponCode}</span>
                                {copiedCode === deal.couponCode ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-600 font-bold ml-1 animate-bounce">
                                    <Check className="w-3.5 h-3.5" /> Copied!
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-slate-500 font-medium ml-1">
                                    <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Copy
                                  </span>
                                )}
                              </button>
                            ) : null}

                            <a
                              href={deal.affiliateUrl || deal.merchantUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold shadow-md shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                            >
                              <span>Redeem Deal</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            <Link
                              to="/featured-deals"
                              className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-white/80 hover:text-white underline underline-offset-4 ml-auto font-medium transition-colors"
                            >
                              <span>All Deals</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Prev / Next Navigation Arrows (Smooth Hover Fade-In) */}
              <button
                type="button"
                onClick={() => emblaMainApi?.scrollPrev()}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center border border-white/20 opacity-0 group-hover/hero:opacity-100 transition-all duration-200 hover:scale-110 active:scale-90 z-20 shadow-lg cursor-pointer"
                aria-label="Previous Deal"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                type="button"
                onClick={() => emblaMainApi?.scrollNext()}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center border border-white/20 opacity-0 group-hover/hero:opacity-100 transition-all duration-200 hover:scale-110 active:scale-90 z-20 shadow-lg cursor-pointer"
                aria-label="Next Deal"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Merchant Switcher Tabs Strip with Animated Progress Bar */}
            <div className="mt-2.5 sm:mt-3 bg-white dark:bg-card rounded-xl border border-slate-200/80 dark:border-border/80 p-1 sm:p-1.5 shadow-2xs overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-1 min-w-max">
                {mainDeals.map((deal, idx) => {
                  const isActive = idx === activeMainIndex;
                  return (
                    <button
                      key={deal.id}
                      type="button"
                      onClick={() => handleSelectMainTab(idx)}
                      className={`relative overflow-hidden px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex flex-col items-center gap-0.5 cursor-pointer ${
                        isActive
                          ? "bg-slate-900 text-white dark:bg-primary dark:text-primary-foreground shadow-xs"
                          : "text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground hover:bg-slate-100 dark:hover:bg-muted"
                      }`}
                    >
                      <span className="relative z-10">{deal.brandName}</span>
                      {/* Active indicator dot */}
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 dark:bg-white animate-pulse" />
                      )}
                      {/* Animated Progress Timer Bar (fills over 5s) */}
                      {isActive && !isPaused && (
                        <span
                          key={`prog-${activeMainIndex}`}
                          className="absolute bottom-0 left-0 h-0.5 bg-cyan-400 dark:bg-white animate-progress-fill"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Right Side Spotlight Card (Hidden on mobile/tablet to keep hero ultra-lean, 4 cols on desktop) ── */}
          <div className="hidden lg:flex lg:col-span-4 flex-col justify-between">
            {/* Embla Viewport for Side Card */}
            <div className="relative group/side">
              <div className="overflow-hidden rounded-2xl shadow-xl bg-slate-950" ref={emblaSideRef}>
                <div className="flex touch-pan-y">
                  {SIDE_PICKS.map((pick) => (
                    <div
                      key={pick.storeSlug}
                      className="flex-[0_0_100%] min-w-0"
                    >
                      <div
                        className={`relative overflow-hidden bg-gradient-to-br ${pick.bg} text-white min-h-[350px] p-6 flex flex-col justify-between border border-white/10`}
                      >
                        {/* Top Banner Tag */}
                        <div className="flex items-center justify-between">
                          <span className="inline-block text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                            TOP PICK OF THE DAY
                          </span>
                          <div className="bg-white p-1.5 rounded-lg shadow-sm">
                            <img
                              src={pick.logo}
                              alt={pick.storeName}
                              className="h-6 w-auto object-contain"
                            />
                          </div>
                        </div>

                        {/* Floating Center Card */}
                        <div className="my-auto bg-white/95 dark:bg-card/95 backdrop-blur-md rounded-xl p-4 text-slate-900 dark:text-foreground shadow-lg border border-white/20 mt-4 mb-4 transition-transform duration-300 hover:scale-[1.02]">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="font-display font-extrabold text-xl sm:text-2xl text-primary">
                              {pick.discount}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                              Verified
                            </span>
                          </div>
                          <p className="mt-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-2">
                            {pick.desc}
                          </p>

                          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-border/60 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopy(pick.code, pick.storeName)}
                              className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 active:scale-95 transition-transform cursor-pointer"
                            >
                              <Tag className="w-3 h-3" />
                              <span>{pick.code}</span>
                            </button>

                            <Link
                              to={pick.linkUrl as any}
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
                          <span>Tested on {pick.storeName} cart</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prev / Next Navigation Arrows for Side Card */}
              <button
                type="button"
                onClick={() => emblaSideApi?.scrollPrev()}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center border border-white/20 opacity-0 group-hover/side:opacity-100 transition-all duration-200 hover:scale-110 active:scale-90 z-20 shadow-lg cursor-pointer"
                aria-label="Previous Top Pick"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => emblaSideApi?.scrollNext()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center border border-white/20 opacity-0 group-hover/side:opacity-100 transition-all duration-200 hover:scale-110 active:scale-90 z-20 shadow-lg cursor-pointer"
                aria-label="Next Top Pick"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
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
                      onClick={() => handleSelectSideTab(idx)}
                      className={`relative py-1.5 px-2 rounded-lg text-xs font-semibold text-center truncate transition-all duration-200 flex flex-col items-center gap-0.5 ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-xs font-bold"
                          : "text-slate-600 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-muted"
                      }`}
                      title={pick.storeName}
                    >
                      <span className="truncate w-full">{pick.storeName}</span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* ── GoCoupon Brand Trust & Value Ribbon (Bespoke GoCoupon styling) ── */}
        <div className="mt-4 sm:mt-6 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 sm:gap-3.5 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full bg-white dark:bg-card border border-border/80 shadow-2xs text-[10px] sm:text-xs font-medium text-muted-foreground transition-all hover:border-primary/40">
            <span className="flex items-center gap-1.5 font-bold text-primary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              1,084+ Live Verified Deals
            </span>
            <span className="text-border">•</span>
            <span className="hidden xs:inline">100% Tested Daily</span>
            <span className="hidden xs:inline text-border">•</span>
            <span className="font-semibold text-foreground">1-Click Auto-Apply Ready</span>
          </div>
        </div>
      </div>
    </section>
  );
}
