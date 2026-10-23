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

  // Hidden Code Voucher:
  // - Outer container with w-full, fixed height, and overflow-hidden ensures 100% containment in the card.
  // - Left section covers the code and displays punchy call to action.
  // - Right stub shows the last 2 digits behind a dashed line neatly INSIDE the button.
  return (
    <a
      href={affiliateUrl}
      target="_blank"
      rel="noopener sponsored nofollow"
      onClick={handleClick}
      className={`group/btn h-10 rounded-xl overflow-hidden inline-flex items-stretch border border-primary/30 shadow-xs hover:shadow-md transition-all duration-150 select-none cursor-pointer active:scale-[0.99] max-w-full ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      title={`Click to copy code and open ${deal.storeName}`}
    >
      {/* Left Action Button (dominates width, covers and hides the coupon code) */}
      <div className="flex-1 min-w-0 bg-primary group-hover/btn:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wide px-3 flex items-center justify-center gap-1.5 transition-colors">
        <Copy className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">
          {discountLabel !== "DEAL" ? `REDEEM ${discountLabel}` : "REDEEM CODE"}
        </span>
      </div>

      {/* Right Code Peek Stub: cleanly contained inside the button with a dashed divider */}
      <div className="w-12 shrink-0 border-l border-dashed border-primary-foreground/30 bg-black/15 dark:bg-black/30 flex items-center justify-center font-mono text-xs font-black text-primary-foreground tracking-widest select-none">
        <span>{codePeek || "***"}</span>
      </div>
    </a>
  );
}
