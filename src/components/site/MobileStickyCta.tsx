import { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowRight, X } from "lucide-react";

export function MobileStickyCta() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    // Check if dismissed in this session
    try {
      if (sessionStorage.getItem("gocoupon_dismiss_mobile_cta") === "true") {
        setIsDismissed(true);
      }
    } catch (e) {
      void e;
    }

    const handleScroll = () => {
      // Show when scrolled past 320px
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

  // Suppress while cookie consent banner is active to prevent stacking on small screens
  let hasCookieConsent = true;
  try {
    hasCookieConsent = Boolean(localStorage.getItem("gocoupon_cookie_consent"));
  } catch {
    hasCookieConsent = true;
  }

  // Don't show on product pages (product pages already have their own dedicated deal action bar)
  // or if dismissed or not scrolled enough or if cookie consent banner is pending
  if (isDismissed || !isVisible || !hasCookieConsent || pathname.startsWith("/product/")) {
    return null;
  }

  return (
    <div
      role="complementary"
      aria-label="Quick Chrome extension install"
      className="fixed bottom-16 left-3 right-3 z-30 md:hidden rounded-2xl border border-primary/30 bg-card/95 p-2.5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <img
            src="/icons/icon.svg"
            onError={(e) => {
              e.currentTarget.src = "/icons/icon_128.png";
            }}
            alt="GoCoupon Extension"
            className="h-8 w-8 shrink-0 object-contain"
            width={32}
            height={32}
          />
          <div className="min-w-0">
            <span className="block truncate text-xs font-bold text-foreground">
              Auto-Apply Working Coupons
            </span>
            <span className="block truncate text-[10px] text-muted-foreground">
              Save ₹500+ across 200+ stores
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            to="/chrome-extension"
            className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-xs active:scale-95 touch-manipulation min-h-[36px]"
          >
            <span>Get Free</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>

          <button
            type="button"
            onClick={handleDismiss}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/80 hover:text-foreground touch-manipulation"
            aria-label="Dismiss banner"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
