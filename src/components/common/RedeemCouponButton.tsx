import React from "react";
import { Check, ExternalLink, Flame, Sparkles } from "lucide-react";
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

  // Last 2 characters of code peeking on the right (like the screenshot "0 0")
  const codePeek = React.useMemo(() => {
    if (!hasCode) return "";
    const clean = deal.code.trim().toUpperCase();
    const lastTwo = clean.slice(-2);
    return lastTwo.split("").join(" ");
  }, [deal.code, hasCode]);

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

  if (!hasCode) {
    // Steal Deal / Instant applied discount (no code required)
    return (
      <a
        href={affiliateUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
        onClick={(e) => onRedeem(deal, e)}
        className={`group/btn inline-flex items-stretch rounded-xl border-2 border-dashed border-orange-500/50 hover:border-orange-500 bg-background shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer select-none ${
          fullWidth ? "w-full" : ""
        } ${className}`}
        title={`Activate ${deal.discount} at ${deal.storeName}`}
      >
        <span className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 group-hover/btn:from-orange-600 group-hover/btn:to-amber-600 text-white px-3.5 py-2 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors">
          <Flame className="h-3.5 w-3.5 fill-white shrink-0" />
          <span className="truncate">ACTIVATE {discountLabel}</span>
        </span>
        <span className="bg-card px-3 py-2 text-xs font-mono font-black text-orange-500 border-l-2 border-dashed border-orange-500/40 flex items-center justify-center shrink-0 min-w-[42px] uppercase">
          DEAL
        </span>
      </a>
    );
  }

  // Authentic two-part Reveal Code button matching user screenshot:
  // [ REDEEM RS 200 OFF CODE ] [ 0 0 ]
  return (
    <a
      href={affiliateUrl}
      target="_blank"
      rel="noopener noreferrer nofollow"
      onClick={(e) => onRedeem(deal, e)}
      className={`group/btn inline-flex items-stretch rounded-xl border-2 border-dashed border-primary/40 hover:border-primary bg-background shadow-xs hover:shadow-md hover:scale-[1.01] transition-all duration-200 overflow-hidden cursor-pointer select-none ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      title={`Click to copy code and open ${deal.storeName}`}
    >
      {/* Solid primary action button */}
      <span className="flex-1 bg-primary group-hover/btn:bg-primary/90 text-primary-foreground px-3.5 py-2 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors">
        <Sparkles className="h-3.5 w-3.5 shrink-0 fill-primary-foreground/30" />
        <span className="truncate">REDEEM {discountLabel} CODE</span>
      </span>

      {/* Dashed peek cutout showing last 2 digits of the code */}
      <span
        className="bg-card px-3 py-2 text-xs font-mono font-black text-foreground/80 group-hover/btn:text-primary border-l-2 border-dashed border-primary/40 flex items-center justify-center shrink-0 min-w-[44px] transition-colors"
        title="Last 2 digits of code revealed. Click to copy full code!"
      >
        {codePeek}
      </span>
    </a>
  );
}
