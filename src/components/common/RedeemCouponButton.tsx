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

  // Format discount for button label: e.g. "RS 200 OFF" or "50% OFF"
  const discountLabel = React.useMemo(() => {
    if (!deal.discount) return "DEAL";
    const clean = deal.discount
      .replace(/₹/g, "RS ")
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase();
    // If short enough to fit nicely, use it (e.g. "RS 200 OFF" or "50% OFF")
    if (clean.length <= 16) {
      return clean;
    }
    return "DISCOUNT";
  }, [deal.discount]);

  // Last 2 characters of code peeking out on the right (matching screenshot e.g. "0 0")
  const codePeek = React.useMemo(() => {
    if (!hasCode) return "";
    const clean = deal.code.trim().toUpperCase();
    const lastTwo = clean.slice(-2);
    return lastTwo.split("").join(" ");
  }, [deal.code, hasCode]);

  // Copied state: reveals full code with checkmark
  if (isCopied) {
    return (
      <a
        href={affiliateUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
        onClick={(e) => onRedeem(deal, e)}
        className={`inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-mono font-bold shadow-md transition-all duration-200 scale-[1.01] cursor-pointer select-none ${
          fullWidth ? "w-full" : ""
        } ${className}`}
        title="Coupon code copied! Click to open store again"
      >
        <Check className="h-4 w-4 stroke-[3] text-white animate-in zoom-in-50 shrink-0" />
        <span className="truncate">
          {hasCode ? `COPIED: ${deal.code}` : "DISCOUNT ACTIVATED!"}
        </span>
        <ExternalLink className="h-3.5 w-3.5 opacity-80 shrink-0 ml-1" />
      </a>
    );
  }

  // Automatic discount (no coupon code required)
  if (!hasCode) {
    return (
      <a
        href={affiliateUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
        onClick={(e) => onRedeem(deal, e)}
        className={`group/btn relative inline-flex items-center justify-between rounded-xl border-2 border-dashed border-orange-500/50 hover:border-orange-500 bg-background/80 p-0.5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden select-none ${
          fullWidth ? "w-full" : ""
        } ${className}`}
        title={`Activate ${deal.discount} at ${deal.storeName}`}
      >
        {/* Underlying deal peek */}
        <div className="absolute inset-0 flex items-center justify-end pr-3 font-mono text-xs font-black text-orange-500 tracking-wider pointer-events-none">
          DEAL
        </div>

        {/* Solid cover button */}
        <div className="relative z-10 flex-1 mr-10 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 group-hover/btn:from-orange-600 group-hover/btn:to-amber-600 text-white px-3.5 py-2 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-transform duration-200 group-hover/btn:-translate-x-0.5">
          <Flame className="h-3.5 w-3.5 shrink-0 fill-white" />
          <span className="truncate">ACTIVATE {discountLabel}</span>
        </div>

        {/* Peek spacer */}
        <div className="w-10 shrink-0" aria-hidden="true" />
      </a>
    );
  }

  // Hidden Code Voucher Box:
  // An outer dashed ticket container with the code sitting inside.
  // The solid blue button sits ON TOP as a cover overlay, hiding all but the last 2 digits peeking out!
  return (
    <a
      href={affiliateUrl}
      target="_blank"
      rel="noopener noreferrer nofollow"
      onClick={(e) => onRedeem(deal, e)}
      className={`group/btn relative inline-flex items-center justify-between rounded-xl border-2 border-dashed border-primary/50 hover:border-primary bg-card/60 p-0.5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden select-none ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      title={`Click to copy code and open ${deal.storeName}`}
    >
      {/* Underlying hidden code layer - peek showing last 2 digits on the right */}
      <div className="absolute inset-0 flex items-center justify-end pr-3 font-mono text-xs font-black text-foreground/80 tracking-widest pointer-events-none">
        <span>{codePeek}</span>
      </div>

      {/* Solid cover button covering and hiding the coupon code from the left */}
      <div className="relative z-10 flex-1 mr-9 sm:mr-11 rounded-lg bg-primary group-hover/btn:bg-primary/90 text-primary-foreground px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm transition-transform duration-200 group-hover/btn:-translate-x-0.5">
        <Copy className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">REDEEM {discountLabel} CODE</span>
      </div>

      {/* Spacer matching peek area width */}
      <div className="w-9 sm:w-11 shrink-0" aria-hidden="true" />
    </a>
  );
}
