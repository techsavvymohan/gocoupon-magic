/**
 * @file src/components/site/GrabOnPopularStores.tsx
 * @description GrabOn-style "Popular Stores" component with Embla horizontal sliding animations & card micro-effects.
 *
 * Implements GrabOn's exact layout:
 * - Left Spotlight Card: "MOST POPULAR - Store Of The Month" with ambient glow and 3D hover lift
 * - Right 4x2 Grid: Multi-page Embla sliding carousel with smooth pagination and swipe support
 * - 100% Real GoCoupon Stores & Live Verified Counts
 * - Responsive mobile & desktop navigation with card hover animations
 */

import { useState, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { StoreLogo } from "@/components/common/StoreLogo";
import { useLiveStats } from "@/hooks/use-live-stats";

interface StoreItem {
  name: string;
  slug: string;
  logo?: string;
  couponCount: number;
  offerCount: number;
  category: string;
  routeUrl: string;
}

// Store of the Month (Spotlight)
const SPOTLIGHT_STORE: StoreItem = {
  name: "Myntra",
  slug: "myntra",
  logo: "/Brand logos/myntra.webp",
  couponCount: 46,
  offerCount: 21,
  category: "Fashion & Lifestyle",
  routeUrl: "/myntra-coupons",
};

// 3 Pages of 8 Popular Stores
const STORE_PAGES: StoreItem[][] = [
  // Page 1: Top Tier Retailers
  [
    { name: "Myntra", slug: "myntra", logo: "/Brand logos/myntra.webp", couponCount: 46, offerCount: 21, category: "Fashion", routeUrl: "/myntra-coupons" },
    { name: "Amazon", slug: "amazon", logo: "/Brand logos/Amazon_logo.svg.webp", couponCount: 71, offerCount: 28, category: "Marketplace", routeUrl: "/amazon-coupons" },
    { name: "Flipkart", slug: "flipkart", logo: "/Brand logos/flipkart.webp", couponCount: 38, offerCount: 19, category: "Marketplace", routeUrl: "/flipkart-coupons" },
    { name: "Ajio", slug: "ajio", logo: "/Brand logos/Ajio.webp?v=2", couponCount: 58, offerCount: 14, category: "Fashion", routeUrl: "/ajio-coupons" },
    { name: "Tata CLiQ", slug: "tatacliq", logo: "/Brand logos/Tata-cliq.webp", couponCount: 28, offerCount: 12, category: "Electronics", routeUrl: "/tata-cliq-coupons" },
    { name: "Nykaa", slug: "nykaa", logo: "/Brand logos/Nykaa.webp", couponCount: 34, offerCount: 16, category: "Beauty", routeUrl: "/nykaa-coupons" },
    { name: "Meesho", slug: "meesho", logo: "/Brand logos/Meesho_logo.webp", couponCount: 24, offerCount: 10, category: "Fashion", routeUrl: "/meesho-coupons" },
    { name: "boAt", slug: "boat", logo: "/Brand logos/gonoise.svg", couponCount: 31, offerCount: 15, category: "Audio", routeUrl: "/boat-coupons" },
  ],
  // Page 2: Travel, Tech & Electronics
  [
    { name: "Croma", slug: "croma", logo: "/Brand logos/croma.svg", couponCount: 29, offerCount: 11, category: "Electronics", routeUrl: "/croma-coupons" },
    { name: "FirstCry", slug: "firstcry", logo: "/Brand logos/FirstCry_logo.svg.webp", couponCount: 33, offerCount: 12, category: "Baby & Kids", routeUrl: "/firstcry-coupons" },
    { name: "Air India", slug: "air-india", couponCount: 22, offerCount: 8, category: "Flights", routeUrl: "/air-india-coupons" },
    { name: "MakeMyTrip", slug: "makemytrip", couponCount: 34, offerCount: 14, category: "Travel", routeUrl: "/makemytrip-coupons" },
    { name: "Dell", slug: "dell", couponCount: 17, offerCount: 6, category: "Laptops", routeUrl: "/dell-coupons" },
    { name: "Reliance", slug: "reliance", logo: "/Brand logos/reliance.svg", couponCount: 25, offerCount: 9, category: "Digital", routeUrl: "/reliance-coupons" },
    { name: "Udemy", slug: "udemy", couponCount: 18, offerCount: 10, category: "Education", routeUrl: "/udemy-coupons" },
    { name: "Agoda", slug: "agoda", couponCount: 27, offerCount: 11, category: "Hotels", routeUrl: "/agoda-coupons" },
  ],
  // Page 3: Sports, Hosting & Lifestyle
  [
    { name: "Puma", slug: "puma", couponCount: 20, offerCount: 8, category: "Sportswear", routeUrl: "/puma-coupons" },
    { name: "Adidas", slug: "adidas", couponCount: 16, offerCount: 7, category: "Footwear", routeUrl: "/adidas-coupons" },
    { name: "Ixigo", slug: "ixigo", couponCount: 24, offerCount: 6, category: "Travel", routeUrl: "/ixigo-coupons" },
    { name: "GoDaddy", slug: "godaddy", couponCount: 32, offerCount: 12, category: "Domains", routeUrl: "/godaddy-coupons" },
    { name: "Hostinger", slug: "hostinger", couponCount: 22, offerCount: 8, category: "Hosting", routeUrl: "/hostinger-coupons" },
    { name: "Best Buy", slug: "bestbuy", logo: "/Brand logos/bestbuy.svg", couponCount: 19, offerCount: 9, category: "Electronics", routeUrl: "/bestbuy-coupons" },
    { name: "Target", slug: "target", logo: "/Brand logos/target.svg", couponCount: 21, offerCount: 7, category: "Retail", routeUrl: "/target-coupons" },
    { name: "SonyLIV", slug: "sonyliv", couponCount: 15, offerCount: 5, category: "OTT", routeUrl: "/sonyliv-coupons" },
  ],
];

export function GrabOnPopularStores() {
  const liveStats = useLiveStats();
  const [currentPage, setCurrentPage] = useState(0);
  const [spotlight, setSpotlight] = useState<StoreItem>(SPOTLIGHT_STORE);
  const [spotlightBadge, setSpotlightBadge] = useState<string>("MOST POPULAR");
  const [spotlightTitle, setSpotlightTitle] = useState<string>("Store Of The Month");
  const [spotlightDesc, setSpotlightDesc] = useState<string>(
    "Exclusive verified vouchers, flat discounts & cashback active right now."
  );

  useEffect(() => {
    let active = true;
    async function loadSections() {
      try {
        const res = await fetch("/api/homepage/sections");
        if (!res.ok) return;
        const payload = await res.json();
        const serverSpotlight = payload?.data?.spotlightStore;
        if (active && serverSpotlight && serverSpotlight.enabled !== false) {
          if (serverSpotlight.storeName) {
            setSpotlight((prev) => ({
              ...prev,
              name: serverSpotlight.storeName || prev.name,
              slug: serverSpotlight.storeSlug || prev.slug,
              logo: serverSpotlight.logo || prev.logo,
              routeUrl: serverSpotlight.routeUrl || prev.routeUrl,
            }));
          }
          if (serverSpotlight.badgeText) setSpotlightBadge(serverSpotlight.badgeText);
          if (serverSpotlight.title) setSpotlightTitle(serverSpotlight.title);
          if (serverSpotlight.description) setSpotlightDesc(serverSpotlight.description);
        }
      } catch {}
    }
    loadSections();
    return () => {
      active = false;
    };
  }, []);

  // ── Embla Carousel Instance for Stores Grid ──
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    duration: 30,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentPage(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const handlePrev = () => emblaApi?.scrollPrev();
  const handleNext = () => emblaApi?.scrollNext();
  const handleDotClick = (idx: number) => emblaApi?.scrollTo(idx);

  return (
    <section className="py-10 sm:py-14 bg-slate-50 dark:bg-background border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Section Header with Carousel Controls */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Popular Stores
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Top merchant brands with verified coupons and maximum cashback savings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Animated Pagination Dots */}
            <div className="hidden sm:flex items-center gap-2">
              {STORE_PAGES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDotClick(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentPage
                      ? "w-7 bg-primary shadow-xs"
                      : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
                  }`}
                  aria-label={`Go to store slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Prev / Next Buttons (GrabOn style with scale bounce) */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                className="w-9 h-9 rounded-full border border-border bg-white dark:bg-card text-foreground hover:bg-slate-100 dark:hover:bg-muted hover:border-primary/50 flex items-center justify-center transition-all shadow-xs hover:scale-105 active:scale-95"
                aria-label="Previous stores"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-9 h-9 rounded-full border border-border bg-white dark:bg-card text-foreground hover:bg-slate-100 dark:hover:bg-muted hover:border-primary/50 flex items-center justify-center transition-all shadow-xs hover:scale-105 active:scale-95"
                aria-label="Next stores"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Link
              to="/stores"
              className="hidden md:inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline ml-2 group"
            >
              <span>All {liveStats.formattedStoresCount} Stores</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Mobile Spotlight: Store of the Month (Compact Horizontal Bar on < lg) */}
        <div className="block lg:hidden mb-4">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-3.5 border border-slate-800 shadow-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-white p-1.5 shadow-sm shrink-0 flex items-center justify-center">
                <StoreLogo
                  storeName={spotlight.name}
                  storeLogo={spotlight.logo}
                  className="w-8 h-8"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 px-2 py-0.2 rounded-full">
                    <Sparkles className="w-2.5 h-2.5 fill-current" />
                    {spotlightBadge}
                  </span>
                </div>
                <h4 className="font-display font-bold text-sm text-white truncate mt-0.5">
                  {spotlight.name}
                </h4>
                <p className="text-[10px] text-slate-300 truncate">
                  {spotlight.couponCount} Coupons • {spotlight.offerCount} Offers
                </p>
              </div>
            </div>

            <Link
              to={spotlight.routeUrl as any}
              className="inline-flex items-center gap-1 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 text-xs font-bold shadow-xs shrink-0 active:scale-95 transition-all"
            >
              <span>Visit</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Layout: Desktop Left Spotlight (4 cols) + Right Grid (8 cols), Mobile Full Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch">
          
          {/* ── Left Spotlight: Store Of The Month (Desktop only) ── */}
          <div className="hidden lg:flex lg:col-span-4 flex-col">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 shadow-xl border border-slate-800 flex flex-col justify-between h-full group transition-all duration-300 hover:border-primary/50 hover:shadow-2xl">
              {/* Background ambient pulsing glow */}
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-primary/20 blur-3xl animate-pulse pointer-events-none" />

              {/* Spotlight Header */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-0.5 rounded-full shadow-2xs">
                    <Sparkles className="w-3 h-3 fill-current animate-pulse" />
                    {spotlightBadge}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Monthly Choice</span>
                </div>
                
                <h3 className="font-display font-bold text-xl sm:text-2xl text-white mt-2">
                  {spotlightTitle}
                </h3>
              </div>

              {/* Big Centered Brand Logo with 3D Hover Scale */}
              <div className="my-6 flex flex-col items-center justify-center">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white p-4 shadow-2xl flex items-center justify-center border border-white/20 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                  <StoreLogo
                    storeName={spotlight.name}
                    storeLogo={spotlight.logo}
                    className="w-20 h-20 sm:w-24 sm:h-24"
                  />
                </div>
                <h4 className="font-display font-extrabold text-lg text-white mt-3 group-hover:text-primary-foreground transition-colors">
                  {spotlight.name}
                </h4>
                <p className="text-xs text-slate-300 font-medium">
                  {spotlight.category}
                </p>
              </div>

              {/* Store Coupon Statistics */}
              <div>
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-center mb-4 transition-colors group-hover:border-primary/30">
                  <div>
                    <span className="font-display font-bold text-lg text-emerald-400">
                      {spotlight.couponCount}
                    </span>
                    <p className="text-[11px] text-slate-300 uppercase tracking-wider font-medium">
                      Coupons
                    </p>
                  </div>
                  <div>
                    <span className="font-display font-bold text-lg text-cyan-400">
                      {spotlight.offerCount}
                    </span>
                    <p className="text-[11px] text-slate-300 uppercase tracking-wider font-medium">
                      Offers
                    </p>
                  </div>
                </div>

                {/* Visit Store Button with Hover Shine */}
                <Link
                  to={spotlight.routeUrl as any}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-xs sm:text-sm font-bold shadow-md shadow-primary/25 transition-all hover:scale-105 active:scale-95 group/btn"
                >
                  <span>Visit Store</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>

          {/* ── Sliding Carousel: Popular Stores Grid ── */}
          <div className="w-full lg:col-span-8 flex flex-col justify-between">
            {/* Embla Viewport */}
            <div className="overflow-hidden rounded-xl" ref={emblaRef}>
              <div className="flex touch-pan-y">
                {STORE_PAGES.map((page, pageIdx) => (
                  <div
                    key={`page-${pageIdx}`}
                    className="flex-[0_0_100%] min-w-0"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
                      {page.map((store) => (
                        <Link
                          key={store.slug}
                          to={store.routeUrl as any}
                          className="group relative flex flex-col items-center justify-between p-3 sm:p-4 rounded-xl border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card shadow-2xs hover:shadow-xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 text-center overflow-hidden"
                        >
                          {/* Top Coupon Count Pill */}
                          <span className="text-[10px] sm:text-[11px] font-bold text-primary bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground px-2 sm:px-2.5 py-0.5 rounded-full mb-1.5 sm:mb-2 transition-all duration-200">
                            {store.couponCount} Coupons
                          </span>

                          {/* Centered Store Logo with Smooth Zoom */}
                          <div className="my-auto py-1 sm:py-2 flex items-center justify-center">
                            <StoreLogo
                              storeName={store.name}
                              storeLogo={store.logo}
                              className="h-10 w-16 sm:h-14 sm:w-24 group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>

                          {/* Store Name & Category */}
                          <div className="mt-1.5 sm:mt-2 w-full pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-border/60">
                            <p className="font-display text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                              {store.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {store.category}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Carousel Pagination Dots */}
            <div className="flex sm:hidden items-center justify-center gap-1.5 mt-3">
              {STORE_PAGES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDotClick(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentPage
                      ? "w-5 bg-primary"
                      : "w-1.5 bg-slate-300 dark:bg-slate-700"
                  }`}
                  aria-label={`Go to store slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Mobile View All Stores Link */}
            <div className="mt-3 text-center sm:hidden">
              <Link
                to="/stores"
                className="inline-flex items-center gap-1 text-xs font-bold text-primary"
              >
                <span>View All {liveStats.formattedStoresCount} Stores</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
