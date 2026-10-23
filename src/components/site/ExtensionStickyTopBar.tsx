/**
 * @file src/components/site/ExtensionStickyTopBar.tsx
 * @description High-conversion sticky top bar promoting the GoCoupon Chrome Extension.
 *
 * Appears across high-intent store and deal pages:
 * "Never search for coupons again — Add GoCoupon to Chrome for Free (Auto-Apply)"
 */

import { useState, useEffect } from "react";
import { X, Sparkles, Star, ArrowRight } from "lucide-react";
import { useExtensionBridge } from "@/lib/useExtensionBridge";

const STORAGE_KEY = "gocoupon_dismiss_sticky_ext_bar_v1";
const CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/gbmfihnboadlmmjbikajlmocjmlpehij";

export function ExtensionStickyTopBar() {
  const { isInstalled } = useExtensionBridge();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // If extension is already installed, hide promo bar
    if (isInstalled) {
      setIsVisible(false);
      return;
    }

    try {
      const isDismissed = sessionStorage.getItem(STORAGE_KEY);
      if (!isDismissed) {
        setIsVisible(true);
      }
    } catch {
      setIsVisible(true);
    }
  }, [isInstalled]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "true");
    } catch {}
  };

  if (!isVisible || isInstalled) return null;

  return (
    <div
      role="banner"
      aria-label="Chrome Extension Announcement"
      className="relative z-[102] w-full overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 text-white shadow-sm select-none"
    >
      {/* Subtle ambient light gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.18),rgba(255,255,255,0))]" />

      <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-3 sm:px-6 text-xs font-medium">
        {/* Main CTA Link */}
        <a
          href={CHROME_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-1 items-center justify-center gap-2 sm:gap-3 truncate text-white/95 hover:text-white transition-opacity duration-200"
        >
          {/* Badge */}
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-xs shrink-0 text-amber-300 border border-white/25">
            <Sparkles className="h-3 w-3 fill-amber-300 shrink-0 animate-pulse text-amber-300" />
            <span className="hidden xs:inline">FREE EXTENSION</span>
            <span className="xs:hidden">FREE</span>
          </span>

          {/* Copy Message */}
          <span className="truncate">
            <span className="font-extrabold text-white">Never search for coupons again</span>
            <span className="hidden md:inline text-white/90">
              {" "}
              — Add GoCoupon to Chrome for Free (Auto-Apply)
            </span>
            <span className="md:hidden text-amber-200 font-semibold"> — Auto-Apply Free</span>
          </span>

          {/* Rating pill (Hidden on mobile) */}
          <span className="hidden lg:inline-flex items-center gap-1 rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-semibold text-amber-300 shrink-0">
            <Star className="h-2.5 w-2.5 fill-amber-300 text-amber-300" />
            <span>4.9 / 5</span>
          </span>

          {/* Action Button */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3 py-1 text-[11px] shadow-xs shrink-0 transition-transform duration-150 group-hover:scale-105 ml-1">
            <ChromeIcon className="h-3.5 w-3.5 text-slate-950 shrink-0" />
            <span>Add to Chrome — Free</span>
            <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5 shrink-0" />
          </span>
        </a>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss extension top bar"
          className="ml-2 -mr-1 flex h-8 w-8 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer shrink-0 touch-manipulation"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function ChromeIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <path
        d="M12 2a10 10 0 0 1 8.66 5H12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M20.66 7A10 10 0 0 1 12 22l4.33-7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M3.34 7l4.33 7.5L12 22"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
