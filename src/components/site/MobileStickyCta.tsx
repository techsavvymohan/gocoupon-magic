import { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowRight, X, Tag } from "lucide-react";
import { useLiveStats } from "@/hooks/use-live-stats";

export function MobileStickyCta() {
  const stats = useLiveStats();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    try {
      if (sessionStorage.getItem("gocoupon_dismiss_mobile_cta") === "true") {
        setIsDismissed(true);
      }
    } catch (e) {
      void e;
    }

    const handleScroll = () => {
      if (window.scrollY > 320 && !isDismissed) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    try {
      sessionStorage.setItem("gocoupon_dismiss_mobile_cta", "true");
    } catch (e) {
      void e;
    }
  };

  let hasCookieConsent = true;
  try {
    hasCookieConsent = Boolean(localStorage.getItem("gocoupon_cookie_consent"));
  } catch {
    hasCookieConsent = true;
  }

  if (
    isDismissed ||
    !isVisible ||
    !hasCookieConsent ||
    pathname.startsWith("/product/") ||
    pathname.startsWith("/offers")
  ) {
    return null;
  }

  return (
    <div
      role="complementary"
      aria-label="Quick mobile deal finder"
      className="fixed bottom-[72px] left-3 right-3 z-30 md:hidden rounded-xl border border-primary/25 bg-card/95 p-2 shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Tag className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="block truncate text-xs font-bold text-foreground">
              Need a Working Coupon?
            </span>
            <span className="block truncate text-[10px] text-muted-foreground font-mono">
              {stats.formattedCount} tested codes today
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            to="/offers"
            className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-xs active:scale-95 touch-manipulation min-h-[36px]"
          >
            <span>View Offers</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>

          <button
            type="button"
            onClick={handleDismiss}
            className="flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/80 hover:text-foreground touch-manipulation cursor-pointer min-h-[36px] min-w-[36px]"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
