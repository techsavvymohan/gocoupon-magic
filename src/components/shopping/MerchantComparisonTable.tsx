/**
 * @file MerchantComparisonTable.tsx
 * @description UI/UX Pro Max Multi-Store Price Comparison Matrix.
 *
 * Responsive Features:
 * - Desktop: Sleek high-density comparative table matrix
 * - Mobile: Dedicated touch-optimized merchant cards with math breakdown
 * - 1-Click coupon code copy with toast feedback
 * - Visual price delta highlight & verified best deal badge
 */

import { useState } from "react";
import { type ProductComparisonSummary, type ComparisonRow } from "@/lib/services/comparison-engine";
import { Check, Copy, ExternalLink, ShieldCheck, Truck, Tag, TrendingDown, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface MerchantComparisonTableProps {
  comparison: ProductComparisonSummary;
  productTitle?: string;
}

export function MerchantComparisonTable({ comparison, productTitle }: MerchantComparisonTableProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    toast.success(`Copied code: ${code}`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xl">
      {/* Header Summary Banner */}
      <div className="border-b border-border bg-muted/30 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-emerald-500 uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified Multi-Store Comparison
          </div>
          <h3 className="font-display text-lg font-bold text-foreground">
            Comparing {comparison.storesComparedCount} Live Merchant Offers
          </h3>
        </div>

        {comparison.maxSavings > 0 && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-mono text-muted-foreground uppercase block">
                Max Price Spread
              </span>
              <span className="font-display text-base font-bold text-emerald-600 dark:text-emerald-400">
                Save up to ₹{comparison.maxSavings.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Rows Container */}
      <div className="divide-y divide-border">
        {comparison.rows.map((row) => (
          <div
            key={row.offer.id}
            className={`p-5 sm:p-6 transition-colors ${
              row.isBestDeal
                ? "bg-primary/[0.05] ring-1 ring-inset ring-primary/20 rounded-xl my-1 mx-1"
                : "hover:bg-muted/15"
            }`}
          >
            {/* Desktop View (>= 768px) */}
            <div className="hidden md:grid md:grid-cols-[1.3fr_1.1fr_1fr_1.2fr] md:items-center md:gap-6">
              {/* Store Branding & Logistics */}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-card p-2 shadow-2xs">
                  {row.storeLogo ? (
                    <img
                      src={row.storeLogo}
                      alt={row.storeName}
                      className="h-full w-full object-contain"
                      loading="lazy"
                      width={48}
                      height={48}
                    />
                  ) : (
                    <span className="text-xl" role="img" aria-label={row.storeName}>🛍️</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display text-base font-bold text-foreground">
                      {row.storeName}
                    </h4>
                    {row.isBestDeal && (
                      <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        BEST DEAL
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Truck className="h-3 w-3" />
                      {row.deliveryEstimate}
                    </span>
                    {row.shippingFee === 0 ? (
                      <span className="text-emerald-500 font-medium font-mono text-[11px]">Free Shipping</span>
                    ) : (
                      <span className="font-mono text-[11px]">+₹{row.shippingFee} Shipping</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Discounts, Coupons & Cashback */}
              <div>
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  Discounts &amp; Rewards
                </div>
                <div className="mt-1.5 flex flex-col gap-1">
                  {row.bestCouponCode ? (
                    <button
                      type="button"
                      onClick={() => handleCopy(row.bestCouponCode!)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-2.5 py-1 text-xs font-mono font-bold text-primary hover:bg-primary/10 transition-colors w-fit group"
                      title="Click to copy coupon code"
                    >
                      <Tag className="h-3 w-3" />
                      <span>{copiedCode === row.bestCouponCode ? "Copied!" : row.bestCouponCode}</span>
                      <span className="text-[10px] text-emerald-500 font-bold">
                        (-₹{row.couponSavings.toLocaleString("en-IN")})
                      </span>
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground">No extra coupons</span>
                  )}
                  <span className="font-mono text-[11px] text-emerald-500 font-semibold">
                    +{row.cashbackRate} Cashback (~₹{row.cashbackAmount.toLocaleString("en-IN")})
                  </span>
                </div>
              </div>

              {/* Effective Net Price */}
              <div>
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  Effective Price
                </div>
                <div className="mt-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-2xl font-bold text-foreground tabular-nums">
                      ₹{row.effectiveNetPrice.toLocaleString("en-IN")}
                    </span>
                    {row.couponSavings > 0 && (
                      <span className="text-xs text-muted-foreground line-through tabular-nums">
                        ₹{row.itemPrice.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  {row.savingsVsWorst > 0 && (
                    <span className="font-mono text-[10px] text-emerald-500 font-semibold block tabular-nums">
                      Save ₹{row.savingsVsWorst.toLocaleString("en-IN")} vs highest
                    </span>
                  )}
                </div>
              </div>

              {/* Outbound Action CTA */}
              <div className="flex flex-col items-end gap-1">
                <a
                  href={row.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-bold transition-transform shadow-sm active:scale-98 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    row.isBestDeal
                      ? "bg-primary text-primary-foreground hover:scale-[1.02] shadow-primary/25"
                      : "border border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted"
                  }`}
                  aria-label={`Buy ${productTitle || "product"} on ${row.storeName}`}
                >
                  <span>{row.isBestDeal ? `Shop on ${row.storeName}` : `Buy on ${row.storeName}`}</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
                <span className="text-[9px] text-muted-foreground font-mono">
                  Verified partner link
                </span>
              </div>
            </div>

            {/* Mobile View (< 768px) */}
            <div className="flex flex-col gap-4 md:hidden">
              {/* Header: Store + Price */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-card p-1.5 shadow-2xs">
                    {row.storeLogo ? (
                      <img
                        src={row.storeLogo}
                        alt={row.storeName}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-lg">🛍️</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-base font-bold text-foreground">
                        {row.storeName}
                      </h4>
                      {row.isBestDeal && (
                        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                          BEST DEAL
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Truck className="h-3 w-3" /> {row.deliveryEstimate}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-display text-xl font-bold text-foreground block">
                    ₹{row.effectiveNetPrice.toLocaleString("en-IN")}
                  </span>
                  {row.couponSavings > 0 && (
                    <span className="text-[11px] text-muted-foreground line-through">
                      ₹{row.itemPrice.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>

              {/* Discount / Coupon Strip on Mobile */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/40 p-2.5 text-xs font-mono">
                {row.bestCouponCode ? (
                  <button
                    type="button"
                    onClick={() => handleCopy(row.bestCouponCode!)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-primary/40 bg-card px-2 py-1 text-[11px] font-bold text-primary"
                  >
                    <Tag className="h-3 w-3" />
                    <span>{copiedCode === row.bestCouponCode ? "Copied!" : row.bestCouponCode}</span>
                    <span className="text-emerald-500 font-bold">
                      (-₹{row.couponSavings.toLocaleString("en-IN")})
                    </span>
                  </button>
                ) : (
                  <span className="text-[11px] text-muted-foreground">Standard Price</span>
                )}

                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  +{row.cashbackRate} Cashback
                </span>
              </div>

              {/* Mobile Action Button */}
              <a
                href={row.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 min-h-[44px] text-xs font-bold transition-transform shadow-sm active:scale-98 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  row.isBestDeal
                    ? "bg-primary text-primary-foreground shadow-primary/20"
                    : "border border-border bg-card text-foreground hover:bg-muted"
                }`}
                aria-label={`Buy on ${row.storeName}`}
              >
                <span>{row.isBestDeal ? `Shop on ${row.storeName}` : `Buy on ${row.storeName}`}</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
