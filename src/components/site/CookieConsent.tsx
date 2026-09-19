import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Cookie, ShieldCheck, X } from "lucide-react";

const CONSENT_STORAGE_KEY = "gocoupon_cookie_consent";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!saved) {
        // Delay slightly for smooth page entrance
        const timer = setTimeout(() => setIsVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // If localStorage is blocked, do not force banner
    }
  }, []);

  const handleConsent = (level: "all" | "essential") => {
    try {
      localStorage.setItem(
        CONSENT_STORAGE_KEY,
        JSON.stringify({ level, timestamp: new Date().toISOString() }),
      );
    } catch (e) {
      void e;
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      role="region"
      aria-label="Cookie preferences"
      className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Cookie className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-display text-sm font-bold text-foreground">
              Cookie &amp; Privacy Choices
            </h3>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              We respect your privacy &amp; never sell personal data.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleConsent("essential")}
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary touch-manipulation min-h-[32px] min-w-[32px] flex items-center justify-center"
          aria-label="Dismiss cookie notice with essential cookies only"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        GoCoupon uses essential cookies for site security and optional analytics to measure deal
        accuracy. Read our{" "}
        <Link
          to="/privacy"
          className="font-medium text-primary underline underline-offset-2 hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xs"
        >
          Privacy Policy
        </Link>{" "}
        to learn more.
      </p>

      <div className="mt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => handleConsent("essential")}
          className="rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted/80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary touch-manipulation min-h-[38px] transition-all"
        >
          Essential Only
        </button>
        <button
          type="button"
          onClick={() => handleConsent("all")}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary touch-manipulation min-h-[38px] transition-all"
        >
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Accept All</span>
        </button>
      </div>
    </aside>
  );
}
