/**
 * @file src/components/site/AnnouncementBar.tsx
 * @description High-conversion sticky announcement bar on top of the header announcing the Live Offers hub.
 */

import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Flame, ArrowRight, X, Sparkles } from "lucide-react";

const STORAGE_KEY = "gocoupon_offers_announcement_v1";

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    try {
      const isDismissed = sessionStorage.getItem(STORAGE_KEY);
      if (!isDismissed) {
        setIsVisible(true);
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "true");
    } catch {}
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Site Announcement"
      className="relative z-[101] w-full overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 text-white shadow-xs"
    >
      {/* Subtle ambient light effect */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.15),rgba(255,255,255,0))]" />

      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-3 sm:px-6 text-xs font-medium">
        {/* Main Announcement Link */}
        <Link
          to="/offers"
          className="group flex flex-1 items-center justify-center gap-2 sm:gap-2.5 truncate text-white/95 hover:text-white transition-colors"
        >
          {/* Live Badge */}
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-xs shrink-0 text-amber-300">
            <Flame className="h-3 w-3 fill-amber-300 shrink-0 animate-pulse" />
            <span>OFFERS</span>
          </span>

          {/* Headline text */}
          <span className="truncate">
            <strong className="font-extrabold text-white">970+ Verified Live Deals</strong>
            <span className="hidden sm:inline"> across 240+ Merchant Stores &amp; Extra 10% Bank Offers</span>
            <span className="sm:hidden"> &amp; 240+ Stores are live!</span>
          </span>

          {/* Action CTA */}
          <span className="inline-flex items-center gap-1 font-bold text-amber-300 underline underline-offset-2 shrink-0 group-hover:text-amber-200 transition-colors ml-1">
            <span>Explore Now</span>
            <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5 shrink-0" />
          </span>
        </Link>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className="ml-2.5 rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
