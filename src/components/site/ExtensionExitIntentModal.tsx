/**
 * @file src/components/site/ExtensionExitIntentModal.tsx
 * @description Exit-intent modal promoting the GoCoupon Chrome Extension on high-intent shopping pages.
 *
 * Appears when:
 * 1. Desktop user moves cursor toward top of browser to exit.
 * 2. Or after high-intent engagement on store/deal pages without an installed extension.
 *
 * Copy:
 * "Never search for coupons again — Add GoCoupon to Chrome for Free (Auto-Apply)"
 */

import { useState, useEffect, useCallback } from "react";
import { X, Zap, ShieldCheck, Star, ArrowRight, CheckCircle2 } from "lucide-react";
import { useExtensionBridge } from "@/lib/useExtensionBridge";

const STORAGE_KEY = "gocoupon_exit_intent_dismissed_v1";
const CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/gbmfihnboadlmmjbikajlmocjmlpehij";

export function ExtensionExitIntentModal() {
  const { isInstalled } = useExtensionBridge();
  const [isOpen, setIsOpen] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  const triggerModal = useCallback(() => {
    if (isInstalled || hasTriggered) return;

    try {
      const dismissed = sessionStorage.getItem(STORAGE_KEY);
      if (dismissed === "true") return;
    } catch {}

    setIsOpen(true);
    setHasTriggered(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "true");
    } catch {}
  }, [isInstalled, hasTriggered]);

  const handleClose = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (isInstalled) return;

    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "true") {
        setHasTriggered(true);
        return;
      }
    } catch {}

    // 1. Desktop mouse exit-intent listener
    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger when mouse moves up past the top of the viewport (intending to close tab / switch tab)
      if (e.clientY <= 12 && e.relatedTarget === null) {
        triggerModal();
      }
    };

    // 2. High-intent fallback timer (after 45s of active browsing)
    const engagementTimer = setTimeout(() => {
      triggerModal();
    }, 45000);

    // 3. Listen for coupon copy events
    const handleCouponCopy = () => {
      // If user copied a code, show them the automated alternative after 2.5s
      setTimeout(() => {
        triggerModal();
      }, 2500);
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("gocoupon-coupon-copied", handleCouponCopy);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("gocoupon-coupon-copied", handleCouponCopy);
      clearTimeout(engagementTimer);
    };
  }, [isInstalled, triggerModal]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen || isInstalled) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ext-modal-title"
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Dim backdrop with blur */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg rounded-3xl border border-border/80 bg-background p-6 sm:p-8 shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600/25 via-indigo-600/30 to-violet-600/25 blur-3xl" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary">
            <Zap className="h-3.5 w-3.5 fill-current" />
            <span>FREE CHROME EXTENSION</span>
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-1">
            <Star className="h-3 w-3 fill-current" />
            <span>4.9 / 5</span>
          </span>
        </div>

        {/* Main Headline */}
        <h2
          id="ext-modal-title"
          className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-tight"
        >
          Never search for coupons again.
        </h2>

        {/* Subheading */}
        <p className="mt-2 text-sm sm:text-base font-semibold text-primary">
          Add GoCoupon to Chrome for Free (Auto-Apply)
        </p>

        {/* Value Proposition */}
        <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Stop manually testing expired promo codes. When you reach checkout on{" "}
          <strong className="text-foreground">
            Flipkart, Amazon, Hostinger, BoAt, Ajio,
          </strong>{" "}
          or 1,600+ partner stores, GoCoupon auto-tests every verified voucher and applies the
          biggest discount in 2 seconds.
        </p>

        {/* Checklist */}
        <div className="mt-5 space-y-2.5 rounded-2xl border border-border/60 bg-muted/30 p-4">
          <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>
              <strong>1-Click Auto-Apply:</strong> Automatically tests up to 15 codes in parallel at
              checkout.
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>
              <strong>Guaranteed Highest Savings:</strong> Always selects the single best code to
              lower your cart total.
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
            <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0" />
            <span>
              <strong>100% Free &amp; Private:</strong> Certified by Google Chrome Web Store. Zero
              card or password access.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-3">
          <a
            href={CHROME_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
            className="group flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 py-3.5 px-6 font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-98 text-sm"
          >
            <ChromeIcon className="h-4 w-4 text-white" />
            <span>Add to Chrome — It's 100% Free</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </a>

          <button
            type="button"
            onClick={handleClose}
            className="text-xs text-muted-foreground hover:text-foreground py-1 text-center font-medium transition-colors cursor-pointer"
          >
            No thanks, I'll test coupon codes manually
          </button>
        </div>
      </div>
    </div>
  );
}

function ChromeIcon({ className = "h-4 w-4" }: { className?: string }) {
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
