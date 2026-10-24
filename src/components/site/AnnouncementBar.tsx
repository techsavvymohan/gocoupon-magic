/**
 * @file src/components/site/AnnouncementBar.tsx
 * @description High-conversion sticky announcement bar dynamically connected to /api/deals.
 * Auto-fetches real live deals from the API and rotates trending offers and real-time deal counts.
 */

import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useDeals } from "@/hooks/use-deals";
import { useLiveStats } from "@/hooks/use-live-stats";
import { Flame, ArrowRight, X, Tag } from "lucide-react";

const STORAGE_KEY = "gocoupon_offers_announcement_v1";

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const liveStats = useLiveStats();

  // Auto-fetch real live deals and live total count from the API
  const { deals, total } = useDeals({ limit: 8, sortBy: "trending" });

  useEffect(() => {
    try {
      const isDismissed = sessionStorage.getItem(STORAGE_KEY);
      if (!isDismissed) {
        setIsVisible(true);
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  // Auto-cycle through overview and live deals every 4.5 seconds
  useEffect(() => {
    if (!deals || deals.length === 0 || isPaused) return;

    const totalSlides = deals.length + 1; // 0 is overview, 1..N are deals
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % totalSlides);
        setIsTransitioning(false);
      }, 200);
    }, 4500);

    return () => clearInterval(interval);
  }, [deals, isPaused]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "true");
    } catch {}
  };

  if (!isVisible) return null;

  const isOverview = currentIndex === 0 || !deals || deals.length === 0;
  const currentDeal = !isOverview && deals ? deals[currentIndex - 1] : null;
  const totalCount = total > 0 ? `${total}+` : (liveStats.formattedCount || "1,700+");

  return (
    <div
      role="region"
      aria-label="Site Announcement"
      className="relative z-[101] w-full overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 text-white shadow-xs select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Subtle ambient light effect */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.15),rgba(255,255,255,0))]" />

      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-3 sm:px-6 text-xs font-medium">
        {/* Dynamic Announcement Content */}
        <Link
          to="/offers"
          className={`group flex flex-1 items-center justify-center gap-2 sm:gap-2.5 truncate text-white/95 hover:text-white transition-opacity duration-200 ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          {isOverview || !currentDeal ? (
            <>
              {/* Live Badge */}
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-xs shrink-0 text-amber-300">
                <Flame className="h-3 w-3 fill-amber-300 shrink-0 animate-pulse" />
                <span>OFFERS</span>
              </span>

              {/* Dynamic Live Headline */}
              <span className="truncate">
                <strong className="font-extrabold text-white">{totalCount} Verified Live Deals</strong>
                <span className="hidden sm:inline"> across {liveStats.formattedStoresCount} Merchant Stores &amp; Extra 10% Bank Offers</span>
                <span className="sm:hidden"> &amp; {liveStats.formattedStoresCount} Stores</span>
              </span>

              {/* Action CTA */}
              <span className="inline-flex items-center gap-1 font-bold text-amber-300 underline underline-offset-2 shrink-0 group-hover:text-amber-200 transition-colors ml-1">
                <span>Explore All</span>
                <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5 shrink-0" />
              </span>
            </>
          ) : (
            <>
              {/* Store Pill Badge */}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-xs shrink-0 text-amber-300">
                <Flame className="h-3 w-3 fill-amber-300 shrink-0 animate-pulse" />
                <span className="truncate max-w-[120px]">{currentDeal.storeName}</span>
              </span>

              {/* Deal Highlight Content */}
              <span className="truncate flex items-center gap-2 min-w-0">
                {currentDeal.discount && currentDeal.discount !== "Verified Deal" && (
                  <span className="rounded bg-amber-400 text-slate-950 font-extrabold text-[10px] px-1.5 py-0.2 shrink-0">
                    {currentDeal.discount}
                  </span>
                )}
                <span className="truncate font-medium">{currentDeal.title}</span>
                {currentDeal.code && currentDeal.code !== "DEALACTIVATED" && (
                  <span className="hidden md:inline-flex items-center gap-1 font-mono text-[10px] font-bold bg-white/20 px-1.5 py-0.2 rounded border border-white/30 text-white shrink-0">
                    <Tag className="h-2.5 w-2.5" />
                    <span>{currentDeal.code}</span>
                  </span>
                )}
              </span>

              {/* Action CTA */}
              <span className="inline-flex items-center gap-1 font-bold text-amber-300 underline underline-offset-2 shrink-0 group-hover:text-amber-200 transition-colors ml-1">
                <span>Claim Deal</span>
                <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5 shrink-0" />
              </span>
            </>
          )}
        </Link>

        {/* Dismiss Button (accessible touch target for mobile thumb) */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className="ml-1 sm:ml-2.5 -mr-1.5 flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer shrink-0 touch-manipulation"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
