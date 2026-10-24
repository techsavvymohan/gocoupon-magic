import React from "react";
import { Check, Copy, ExternalLink, Flame } from "lucide-react";
import type { Deal } from "@/lib/api/deals-api";

interface RedeemCouponButtonProps {
  deal: Deal;
  affiliateUrl: string;
  isCopied: boolean;
  onRedeem: (deal: Deal, e: React.MouseEvent) => void;
  className?: string;
  fullWidth?: boolean;
}

export function RedeemCouponButton({
  deal,
  affiliateUrl,
  isCopied,
  onRedeem,
  className = "",
  fullWidth = false,
}: RedeemCouponButtonProps) {
  const hasCode = Boolean(deal.code && deal.code.trim().length > 1);

  // Format short discount label for button (e.g. "50% OFF" or "RS 200")
  const discountLabel = React.useMemo(() => {
    if (!deal.discount) return "DEAL";
    const clean = deal.discount
      .replace(/₹/g, "RS ")
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase();
    if (clean.length <= 10) {
      return clean;
    }
    return "DEAL";
  }, [deal.discount]);

  // Last 2 characters of code peeking out on the right (e.g. "0 0" or "M P")
  const codePeek = React.useMemo(() => {
    if (!hasCode) return "";
    const clean = deal.code.trim().toUpperCase();
    const lastTwo = clean.slice(-2);
    return lastTwo.split("").join(" ");
  }, [deal.code, hasCode]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRedeem(deal, e);
    try {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("gocoupon-coupon-copied", { detail: { deal } })
        );
      }
    } catch {}
  };

  // Copied state: reveals full code with checkmark
  if (isCopied) {
    return (
      <a
        href={affiliateUrl}
        target="_blank"
        rel="noopener sponsored nofollow"
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 text-xs font-mono font-bold shadow-xs transition-all duration-200 cursor-pointer select-none max-w-full overflow-hidden ${
          fullWidth ? "w-full" : ""
        } ${className}`}
        title="Coupon code copied! Click to open store again"
      >
        <Check className="h-4 w-4 stroke-[3] text-white animate-in zoom-in-50 shrink-0" />
        <span className="truncate">
          {hasCode ? `COPIED: ${deal.code}` : "DEAL ACTIVATED!"}
        </span>
        <ExternalLink className="h-3.5 w-3.5 opacity-80 shrink-0 ml-0.5" />
      </a>
    );
  }

  // Automatic discount (no coupon code required) - High conversion gradient button
  if (!hasCode) {
    return (
      <a
        href={affiliateUrl}
        target="_blank"
        rel="noopener sponsored nofollow"
        onClick={handleClick}
        className={`group/btn h-10 rounded-xl overflow-hidden inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs uppercase tracking-wide px-3 shadow-xs hover:shadow-md transition-all duration-150 select-none cursor-pointer active:scale-[0.99] max-w-full ${
          fullWidth ? "w-full" : ""
        } ${className}`}
        title={`Activate ${deal.discount || "deal"} at ${deal.storeName}`}
      >
        <Flame className="h-3.5 w-3.5 fill-white shrink-0" />
        <span className="truncate">
          ACTIVATE {discountLabel !== "DEAL" ? `${discountLabel} ` : ""}DEAL
        </span>
        <ExternalLink className="h-3.5 w-3.5 opacity-80 shrink-0 ml-0.5" />
      </a>
    );
  }

  // Ticket-Stub Split Button matching reference design:
  // - Left: Vibrant Indigo action button with Copy icon and REDEEM {discount}
  // - Right: Light silver contrasting tab with pure white spaced last 2 characters (e.g. "2  6")
  return (
    <a
      href={affiliateUrl}
      target="_blank"
      rel="noopener sponsored nofollow"
      onClick={handleClick}
      className={`group/stub relative inline-flex items-stretch h-11 sm:h-12 rounded-xl sm:rounded-2xl overflow-hidden border border-indigo-200/50 dark:border-indigo-900/50 shadow-md shadow-indigo-500/10 hover:shadow-lg transition-all active:scale-[0.98] select-none cursor-pointer max-w-full ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      title={`Click to copy code and open ${deal.storeName}`}
    >
      {/* Left Action Button (vibrant royal indigo-blue) */}
      <div className="flex-1 min-w-0 bg-[#3f38d6] hover:bg-[#352fc4] text-white font-bold text-xs sm:text-sm uppercase tracking-wider px-3 sm:px-4 flex items-center justify-center gap-2 transition-colors">
        <Copy className="h-4 w-4 stroke-[2.2] text-white shrink-0 group-hover/stub:scale-105 transition-transform" />
        <span className="truncate font-sans font-bold">
          {discountLabel !== "DEAL" ? `REDEEM ${discountLabel}` : "REDEEM CODE"}
        </span>
      </div>

      {/* Right Teaser Tab: Solid light silver background with bold white spaced digits (e.g. 2  6) */}
      <div className="w-14 sm:w-16 shrink-0 bg-[#d4d4d8] dark:bg-zinc-700 border-l border-white/20 flex items-center justify-center font-sans font-extrabold text-sm sm:text-base text-white tracking-widest select-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">
        <span>{codePeek || "**"}</span>
      </div>
    </a>
  );
}
