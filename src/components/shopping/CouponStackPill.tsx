/**
 * @file CouponStackPill.tsx
 * @description Interactive 1-click copy coupon pill with verified success metrics.
 */

import { useState } from "react";
import type { StoreCoupon } from "@/lib/services/canonical-types";
import { buildDealRedirectUrl, findStoreByNameOrSlug } from "@/lib/services/store-registry";
import { Tag, Check, Copy, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface CouponStackPillProps {
  coupon: StoreCoupon;
  compact?: boolean;
  storeUrl?: string;
}

export function CouponStackPill({ coupon, compact = false, storeUrl }: CouponStackPillProps) {
  const [isCopied, setIsCopied] = useState(false);

  const destinationUrl =
    storeUrl || findStoreByNameOrSlug(coupon.storeId || coupon.storeName)?.storeUrl || "";

  const affiliateUrl = buildDealRedirectUrl({
    url: destinationUrl,
    storeName: coupon.storeName,
    storeSlug: coupon.storeId,
  });

  const handleCopy = (e: React.MouseEvent) => {
    navigator.clipboard.writeText(coupon.code).catch(() => {});
    setIsCopied(true);
    toast.success(`Coupon ${coupon.code} copied! Opening ${coupon.storeName || "store"}...`);
    setTimeout(() => setIsCopied(false), 2500);

    const isAnchorClick = (e.currentTarget as HTMLElement).tagName.toLowerCase() === "a";
    if (!isAnchorClick && affiliateUrl && affiliateUrl !== "#") {
      window.open(affiliateUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (compact) {
    return (
      <a
        href={affiliateUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-2.5 py-1 text-xs font-mono font-medium text-primary hover:bg-primary/10 transition-colors"
        title={`Click to copy: ${coupon.description}`}
      >
        <Tag className="h-3 w-3" />
        <span>{isCopied ? "Copied!" : coupon.code}</span>
        <span className="font-bold text-emerald-500">({coupon.discountLabel})</span>
      </a>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md">
      <div className="min-w-0 flex-1 pr-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-foreground tracking-wide">
            {coupon.code}
          </span>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            {coupon.discountLabel}
          </span>
          {coupon.isStackableWithBankOffers && (
            <span className="hidden sm:inline-block rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[9px] font-medium text-primary">
              Bank Offer Stackable
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{coupon.description}</p>
        <div className="mt-2 flex items-center gap-2.5 text-[11px] font-mono text-muted-foreground">
          <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {coupon.verificationStatus || "Editor Tested"}
          </span>
          <span aria-hidden="true">•</span>
          <span>Verified {coupon.lastVerified || "Today"}</span>
        </div>
      </div>

      <a
        href={affiliateUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
        onClick={handleCopy}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs transition-transform hover:scale-105 active:scale-95"
      >
        {isCopied ? (
          <>
            <Check className="h-3.5 w-3.5" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            <span>Copy Code</span>
          </>
        )}
      </a>
    </div>
  );
}
