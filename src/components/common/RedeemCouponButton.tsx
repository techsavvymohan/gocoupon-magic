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
    if (clean.length <= 16) {
      return clean;
    }
    return "DISCOUNT";
  }, [deal.discount]);

  // Last 2 characters of code peeking out on the right (e.g. "0 0" or "M P")
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
        className={`group/btn relative inline-flex items-center transition-all duration-200 select-none cursor-pointer ${
          fullWidth ? "w-full" : ""
        } ${className}`}
        title={`Activate ${deal.discount} at ${deal.storeName}`}
      >
        {/* Solid cover button taking main space */}
        <div className="relative z-10 flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 group-hover/btn:from-orange-600 group-hover/btn:to-amber-600 text-white font-black text-xs uppercase tracking-wider py-2.5 px-3.5 shadow-sm transition-all duration-200">
          <Flame className="h-3.5 w-3.5 shrink-0 fill-white" />
          <span className="truncate">ACTIVATE {discountLabel}</span>
        </div>

        {/* Compact white stub, -3% in size than blue box, shrunk snugly toward the button */}
        <div className="relative z-0 shrink-0 flex items-center justify-center h-[94%] -ml-1 pl-2.5 pr-3 bg-card border-2 border-l-0 border-dashed border-orange-400/50 group-hover/btn:border-orange-500 rounded-r-xl transition-colors min-w-[42px] max-w-[48px]">
          <span className="font-mono text-xs font-black text-orange-500 tracking-wider whitespace-nowrap">
            DEAL
          </span>
        </div>
      </a>
    );
  }

  // Hidden Code Voucher:
  // - Solid Blue Button covers the coupon code and takes up the main width.
  // - White peek box is shrunk tightly to the blue button ("little open only")
  // - White box height is -3% smaller than the blue button (tucked in slightly)
  return (
    <a
      href={affiliateUrl}
      target="_blank"
      rel="noopener noreferrer nofollow"
      onClick={(e) => onRedeem(deal, e)}
      className={`group/btn relative inline-flex items-center transition-all duration-200 select-none cursor-pointer ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      title={`Click to copy code and open ${deal.storeName}`}
    >
      {/* Front Solid Cover Button (dominates width, covers and hides the coupon code) */}
      <div className="relative z-10 flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary group-hover/btn:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-wider py-2.5 px-3.5 shadow-sm transition-all duration-200">
        <Copy className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">REDEEM {discountLabel} CODE</span>
      </div>

      {/* Right White Box Stub: "little open only" (compact 42-46px) and "-3% in size than blue box" (h-[94%] / inset) */}
      <div className="relative z-0 shrink-0 flex items-center justify-center h-[94%] -ml-1 pl-2.5 pr-3 bg-card border-2 border-l-0 border-dashed border-primary/40 group-hover/btn:border-primary rounded-r-xl transition-colors min-w-[42px] max-w-[48px]">
        <span className="font-mono text-xs font-black text-foreground/85 tracking-widest whitespace-nowrap">
          {codePeek}
        </span>
      </div>
    </a>
  );
}
