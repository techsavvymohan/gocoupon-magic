/**
 * @file src/lib/hero-banner.ts
 * @description Dynamic Festive & Seasonal Announcement Banner Configuration & State Hook.
 * Allows administrators to enable, edit, schedule, or disable seasonal festival banners
 * from the Admin Panel without hardcoded deployments.
 */

import { useState, useEffect } from "react";

export type BannerColorScheme = "amber" | "rose" | "emerald" | "indigo" | "purple";

export interface FestiveBannerConfig {
  enabled: boolean;
  badgeTitle: string; // e.g. "Festive Mega-Sales 2026:"
  message: string;    // e.g. "Amazon Great Indian Festival & Flipkart Big Billion Days verified codes live!"
  linkText: string;   // e.g. "Explore Deals"
  linkUrl: string;    // e.g. "/featured-deals"
  colorScheme: BannerColorScheme;
  showPingDot: boolean;
  expiresAt?: string; // Optional ISO string or YYYY-MM-DD
}

export const DEFAULT_FESTIVE_BANNER: FestiveBannerConfig = {
  enabled: true,
  badgeTitle: "Festive Mega-Sales 2026:",
  message: "Amazon Great Indian Festival & Flipkart Big Billion Days verified codes live!",
  linkText: "Explore Deals",
  linkUrl: "/featured-deals",
  colorScheme: "amber",
  showPingDot: true,
  expiresAt: "",
};

const STORAGE_KEY = "gocoupon_festive_banner_v1";
const UPDATE_EVENT = "gocoupon:festive-banner-updated";

export const COLOR_SCHEME_STYLES: Record<
  BannerColorScheme,
  {
    container: string;
    dot: string;
    badge: string;
    link: string;
    accent: string;
  }
> = {
  amber: {
    container: "border-amber-500/30 bg-amber-500/10",
    dot: "bg-amber-500",
    badge: "text-amber-700 dark:text-amber-400",
    link: "text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200",
    accent: "bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40",
  },
  rose: {
    container: "border-rose-500/30 bg-rose-500/10",
    dot: "bg-rose-500",
    badge: "text-rose-700 dark:text-rose-400",
    link: "text-rose-700 dark:text-rose-300 hover:text-rose-800 dark:hover:text-rose-200",
    accent: "bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-500/40",
  },
  emerald: {
    container: "border-emerald-500/30 bg-emerald-500/10",
    dot: "bg-emerald-500",
    badge: "text-emerald-700 dark:text-emerald-400",
    link: "text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200",
    accent: "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40",
  },
  indigo: {
    container: "border-indigo-500/30 bg-indigo-500/10",
    dot: "bg-indigo-500",
    badge: "text-indigo-700 dark:text-indigo-400",
    link: "text-indigo-700 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-200",
    accent: "bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border-indigo-500/40",
  },
  purple: {
    container: "border-purple-500/30 bg-purple-500/10",
    dot: "bg-purple-500",
    badge: "text-purple-700 dark:text-purple-400",
    link: "text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200",
    accent: "bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-500/40",
  },
};

/**
 * Validates whether the banner is currently active and not expired
 */
export function isBannerActive(banner: FestiveBannerConfig | null | undefined): boolean {
  if (!banner || !banner.enabled) return false;
  if (banner.expiresAt && banner.expiresAt.trim()) {
    const expiry = new Date(banner.expiresAt).getTime();
    if (!isNaN(expiry) && expiry < Date.now()) {
      return false;
    }
  }
  return true;
}

/**
 * Save banner config to localStorage and trigger instant app-wide event
 */
export function broadcastFestiveBannerUpdate(banner: FestiveBannerConfig) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(banner));
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: banner }));
  } catch (err) {
    console.warn("Unable to broadcast festive banner update:", err);
  }
}

/**
 * React hook to consume and reactively update the festive banner state
 */
export function useFestiveBanner() {
  const [banner, setBanner] = useState<FestiveBannerConfig>(() => {
    if (typeof window === "undefined") return DEFAULT_FESTIVE_BANNER;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_FESTIVE_BANNER, ...JSON.parse(stored) };
      }
    } catch {}
    return DEFAULT_FESTIVE_BANNER;
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchBanner() {
      try {
        const res = await fetch("/api/homepage/hero", { cache: "no-store" });
        if (!res.ok) return;
        const payload = await res.json();
        const serverBanner = payload?.data?.festiveBanner;
        if (active && serverBanner) {
          const merged = { ...DEFAULT_FESTIVE_BANNER, ...serverBanner };
          setBanner(merged);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch {}
        }
      } catch (err) {
        // Silently fall back to cached/default banner
      } finally {
        if (active) setIsLoading(false);
      }
    }

    fetchBanner();

    // Listen for real-time updates from admin actions in current or other tabs
    function handleUpdate(e: any) {
      if (e?.detail) {
        setBanner({ ...DEFAULT_FESTIVE_BANNER, ...e.detail });
      }
    }

    function handleStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setBanner({ ...DEFAULT_FESTIVE_BANNER, ...JSON.parse(e.newValue) });
        } catch {}
      }
    }

    window.addEventListener(UPDATE_EVENT, handleUpdate);
    window.addEventListener("storage", handleStorage);

    return () => {
      active = false;
      window.removeEventListener(UPDATE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return {
    banner,
    isActive: isBannerActive(banner),
    styles: COLOR_SCHEME_STYLES[banner.colorScheme] || COLOR_SCHEME_STYLES.amber,
    isLoading,
  };
}
