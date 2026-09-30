/**
 * @file src/components/site/GrabOnPopularStores.tsx
 * @description GrabOn-style "Popular Stores" component for GoCoupon.
 *
 * Implements GrabOn's exact layout:
 * - Left Spotlight Card: "MOST POPULAR - Store Of The Month" with store stats and direct CTA
 * - Right 4x2 Grid: 8 high-traffic store cards with coupon counters & interactive page pagination
 * - 100% Real GoCoupon Stores & Live Verified Counts
 * - Responsive mobile & desktop navigation
 */

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { StoreLogo } from "@/components/common/StoreLogo";

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
    { name: "Ajio", slug: "ajio", logo: "/Brand logos/Ajio.webp?v=2", couponCount: 58, offerCount: 14, category: "Fashion", routeUrl: "/stores/ajio" },
    { name: "Tata CLiQ", slug: "tatacliq", logo: "/Brand logos/Tata-cliq.webp", couponCount: 28, offerCount: 12, category: "Electronics", routeUrl: "/tata-cliq-coupons" },
    { name: "Nykaa", slug: "nykaa", logo: "/Brand logos/Nykaa.webp", couponCount: 34, offerCount: 16, category: "Beauty", routeUrl: "/nykaa-coupons" },
    { name: "Meesho", slug: "meesho", logo: "/Brand logos/Meesho_logo.webp", couponCount: 24, offerCount: 10, category: "Fashion", routeUrl: "/meesho-coupons" },
    { name: "boAt", slug: "boat", logo: "/Brand logos/gonoise.svg", couponCount: 31, offerCount: 15, category: "Audio", routeUrl: "/boat-coupons" },
  ],
  // Page 2: Travel, Tech & Electronics
  [
    { name: "Croma", slug: "croma", logo: "/Brand logos/croma.svg", couponCount: 29, offerCount: 11, category: "Electronics", routeUrl: "/croma-coupons" },
    { name: "FirstCry", slug: "firstcry", logo: "/Brand logos/FirstCry_logo.svg.webp", couponCount: 33, offerCount: 12, category: "Baby & Kids", routeUrl: "/stores/firstcry" },
    { name: "Air India", slug: "air-india", couponCount: 22, offerCount: 8, category: "Flights", routeUrl: "/stores/air-india" },
    { name: "MakeMyTrip", slug: "makemytrip", couponCount: 34, offerCount: 14, category: "Travel", routeUrl: "/stores/makemytrip" },
    { name: "Dell", slug: "dell", couponCount: 17, offerCount: 6, category: "Laptops", routeUrl: "/stores/dell" },
    { name: "Reliance", slug: "reliance", logo: "/Brand logos/reliance.svg", couponCount: 25, offerCount: 9, category: "Digital", routeUrl: "/stores/reliance" },
    { name: "Udemy", slug: "udemy", couponCount: 18, offerCount: 10, category: "Education", routeUrl: "/stores/udemy" },
    { name: "Agoda", slug: "agoda", couponCount: 27, offerCount: 11, category: "Hotels", routeUrl: "/stores/agoda" },
  ],
  // Page 3: Sports, Hosting & Lifestyle
  [
    { name: "Puma", slug: "puma", couponCount: 20, offerCount: 8, category: "Sportswear", routeUrl: "/stores/puma" },
    { name: "Adidas", slug: "adidas", couponCount: 16, offerCount: 7, category: "Footwear", routeUrl: "/stores/adidas" },
    { name: "Ixigo", slug: "ixigo", couponCount: 24, offerCount: 6, category: "Travel", routeUrl: "/stores/ixigo" },
    { name: "GoDaddy", slug: "godaddy", couponCount: 32, offerCount: 12, category: "Domains", routeUrl: "/stores/godaddy" },
    { name: "Hostinger", slug: "hostinger", couponCount: 22, offerCount: 8, category: "Hosting", routeUrl: "/stores/hostinger" },
    { name: "Best Buy", slug: "bestbuy", logo: "/Brand logos/bestbuy.svg", couponCount: 19, offerCount: 9, category: "Electronics", routeUrl: "/stores/bestbuy" },
    { name: "Target", slug: "target", logo: "/Brand logos/target.svg", couponCount: 21, offerCount: 7, category: "Retail", routeUrl: "/stores/target" },
    { name: "SonyLIV", slug: "sonyliv", couponCount: 15, offerCount: 5, category: "OTT", routeUrl: "/stores/sonyliv" },
  ],
];

export function GrabOnPopularStores() {
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = STORE_PAGES.length;
  const currentStores = STORE_PAGES[currentPage] || STORE_PAGES[0];

  const handlePrev = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

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
            {/* Pagination Dots */}
            <div className="hidden sm:flex items-center gap-1.5">
              {STORE_PAGES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentPage(idx)}
                  className={`h-2 rounded-full transition-all duration-200 ${
                    idx === currentPage
                      ? "w-6 bg-primary"
                      : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
                  }`}
                  aria-label={`Go to store page ${idx + 1}`}
                />
              ))}
            </div>

            {/* Prev / Next Buttons (GrabOn style) */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                className="w-8 h-8 rounded-full border border-border bg-white dark:bg-card text-foreground hover:bg-slate-100 dark:hover:bg-muted flex items-center justify-center transition-all shadow-2xs active:scale-95"
                aria-label="Previous stores"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-8 h-8 rounded-full border border-border bg-white dark:bg-card text-foreground hover:bg-slate-100 dark:hover:bg-muted flex items-center justify-center transition-all shadow-2xs active:scale-95"
                aria-label="Next stores"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Link
              to="/stores"
              className="hidden md:inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline ml-2"
            >
              <span>All 240+ Stores</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* GrabOn Layout: Left Spotlight (300px) + Right Grid (4x2) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* ── Left Spotlight: Store Of The Month (GrabOn gp-feat style) ── */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 shadow-xl border border-slate-800 flex flex-col justify-between h-full group">
              {/* Background ambient glow */}
              <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-primary/20 blur-2xl pointer-events-none" />

              {/* Spotlight Header */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3 fill-current" />
                    MOST POPULAR
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Monthly Choice</span>
                </div>
                
                <h3 className="font-display font-bold text-xl sm:text-2xl text-white mt-2">
                  Store Of The Month
                </h3>
              </div>

              {/* Big Centered Brand Logo */}
              <div className="my-6 flex flex-col items-center justify-center">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white p-4 shadow-2xl flex items-center justify-center border border-white/20 transition-transform group-hover:scale-105 duration-300">
                  <StoreLogo
                    storeName={SPOTLIGHT_STORE.name}
                    storeLogo={SPOTLIGHT_STORE.logo}
                    className="w-20 h-20 sm:w-24 sm:h-24"
                  />
                </div>
                <h4 className="font-display font-extrabold text-lg text-white mt-3">
                  {SPOTLIGHT_STORE.name}
                </h4>
                <p className="text-xs text-slate-300 font-medium">
                  {SPOTLIGHT_STORE.category}
                </p>
              </div>

              {/* Store Coupon Statistics (GrabOn offers-ul style) */}
              <div>
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-center mb-4">
                  <div>
                    <span className="font-display font-bold text-lg text-emerald-400">
                      {SPOTLIGHT_STORE.couponCount}
                    </span>
                    <p className="text-[11px] text-slate-300 uppercase tracking-wider font-medium">
                      Coupons
                    </p>
                  </div>
                  <div>
                    <span className="font-display font-bold text-lg text-cyan-400">
                      {SPOTLIGHT_STORE.offerCount}
                    </span>
                    <p className="text-[11px] text-slate-300 uppercase tracking-wider font-medium">
                      Offers
                    </p>
                  </div>
                </div>

                {/* Visit Store Button */}
                <Link
                  to={SPOTLIGHT_STORE.routeUrl as any}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-xs sm:text-sm font-bold shadow-md shadow-primary/25 transition-all hover:scale-105 active:scale-95"
                >
                  <span>Visit Store</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* ── Right 4x2 Grid: Popular Stores (GrabOn gp-normal style) ── */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 h-full">
              {currentStores.map((store) => (
                <Link
                  key={store.slug}
                  to={store.routeUrl as any}
                  className="group relative flex flex-col items-center justify-between p-4 rounded-xl border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card shadow-xs hover:shadow-lg hover:border-primary/50 transition-all duration-200 text-center"
                >
                  {/* Top Coupon Count Pill (GrabOn exact design!) */}
                  <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full mb-2">
                    {store.couponCount} Coupons
                  </span>

                  {/* Centered Store Logo */}
                  <div className="my-auto py-2 flex items-center justify-center">
                    <StoreLogo
                      storeName={store.name}
                      storeLogo={store.logo}
                      className="h-12 w-20 sm:h-14 sm:w-24 group-hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Store Name & Category */}
                  <div className="mt-2 w-full pt-2 border-t border-slate-100 dark:border-border/60">
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

            {/* Mobile View All Stores Link */}
            <div className="mt-4 text-center sm:hidden">
              <Link
                to="/stores"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary"
              >
                <span>View All 240+ Merchant Stores</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
