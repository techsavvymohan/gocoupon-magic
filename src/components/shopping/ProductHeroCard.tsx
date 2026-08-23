/**
 * @file ProductHeroCard.tsx
 * @description UI/UX Pro Max Product Hero Card with live offers, 90d low badge, and quick watch.
 */

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { CanonicalProduct } from "@/lib/services/canonical-types";
import { compareProductOffers } from "@/lib/services/comparison-engine";
import { calculatePriceMetrics } from "@/lib/services/price-history";
import { isProductInWatchlist, addToWatchlist, removeFromWatchlist } from "@/lib/services/watchlist-service";
import { PriceAlertModal } from "./PriceAlertModal";
import { TrendingDown, Bell, ExternalLink, ArrowRight, Star } from "lucide-react";
import { toast } from "sonner";

interface ProductHeroCardProps {
  product: CanonicalProduct;
}

export function ProductHeroCard({ product }: ProductHeroCardProps) {
  const comparison = compareProductOffers(product.id);
  const metrics = calculatePriceMetrics(product.id);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isWatched, setIsWatched] = useState(() => isProductInWatchlist(product.id));

  const bestDeal = comparison?.bestDeal;
  const currentPrice = bestDeal?.effectiveNetPrice || metrics.currentPrice;

  const handleToggleWatch = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isWatched) {
      removeFromWatchlist(product.id);
      setIsWatched(false);
      toast.info(`Removed from Watchlist`);
    } else {
      setIsAlertModalOpen(true);
    }
  };

  return (
    <>
      <article className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-2xl">
        <div>
          {/* Top Visual Container */}
          <div className="relative aspect-[16/11] w-full overflow-hidden rounded-2xl bg-muted">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {/* Lowest Store Pill */}
            {bestDeal && (
              <div className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur-md px-3 py-1 font-mono text-[10px] font-bold text-foreground border border-border shadow-xs">
                Lowest on {bestDeal.storeName}
              </div>
            )}
            {/* 90-Day Low Badge */}
            {metrics.isAllTimeLow && (
              <div className="absolute top-3 right-3 rounded-full bg-emerald-500 text-white px-2.5 py-1 font-mono text-[10px] font-bold shadow-sm flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                90D LOW
              </div>
            )}
          </div>

          {/* Product Meta */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span className="font-bold text-foreground">{product.brand}</span>
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-amber-500 font-bold">
                <Star className="h-3 w-3 fill-current" />
                {product.rating.toFixed(1)}
              </span>
            </div>

            <h3 className="mt-2 font-display text-base sm:text-lg font-bold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
              <Link to="/product/$productId" params={{ productId: product.id }}>
                {product.title}
              </Link>
            </h3>

            {/* Price & Savings Row */}
            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <span className="font-display text-2xl font-bold text-foreground tabular-nums">
                  ₹{currentPrice.toLocaleString("en-IN")}
                </span>
                {bestDeal && bestDeal.couponSavings > 0 && (
                  <span className="ml-2 text-xs font-mono text-emerald-500 font-bold tabular-nums">
                    (-₹{bestDeal.couponSavings.toLocaleString("en-IN")} coupon)
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleToggleWatch}
                aria-label={`Track price drop alert for ${product.title}`}
                className={`rounded-full p-2.5 min-h-[36px] min-w-[36px] flex items-center justify-center text-xs transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-90 ${
                  isWatched
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border border-border bg-muted/40 text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
                title="Track Price Drop Alert"
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Multi-Store Comparison Pill */}
            {comparison && (
              <div className="mt-3.5 flex items-center justify-between rounded-xl border border-border/70 bg-muted/25 px-3 py-2 text-xs">
                <span className="font-mono text-[11px] text-muted-foreground">
                  {comparison.storesComparedCount} Stores Scanned
                </span>
                <span className="font-mono text-[11px] text-emerald-500 font-bold tabular-nums">
                  Save up to ₹{comparison.maxSavings.toLocaleString("en-IN")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 flex items-center gap-2 border-t border-border pt-4">
          <Link
            to="/product/$productId"
            params={{ productId: product.id }}
            className="flex-1 rounded-xl border border-border bg-card py-2.5 min-h-[36px] flex items-center justify-center text-center text-xs font-bold text-foreground hover:bg-muted hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors touch-manipulation"
          >
            History &amp; Deals
          </Link>
          {bestDeal && (
            <a
              href={bestDeal.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Shop on ${bestDeal.storeName}`}
              className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2.5 min-h-[36px] text-xs font-bold text-primary-foreground shadow-xs hover:scale-105 active:scale-95 transition-transform touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span>Shop</span>
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          )}
        </div>
      </article>

      <PriceAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => {
          setIsAlertModalOpen(false);
          setIsWatched(isProductInWatchlist(product.id));
        }}
        productId={product.id}
        productTitle={product.title}
        productImage={product.imageUrl}
        currentPrice={currentPrice}
      />
    </>
  );
}
