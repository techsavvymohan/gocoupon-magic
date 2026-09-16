/**
 * @file WatchlistGrid.tsx
 * @description Watchlist and Price Drop Alerts Dashboard.
 */

import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { getWatchlist, removeFromWatchlist, addToWatchlist } from "@/lib/services/watchlist-service";
import type { UserWatchItem } from "@/lib/services/canonical-types";
import { useCurrency } from "@/context/CurrencyContext";
import { Bell, Trash2, ExternalLink, TrendingDown, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export function WatchlistGrid() {
  const [items, setItems] = useState<UserWatchItem[]>(() => getWatchlist());
  const { formatPrice } = useCurrency();

  // Keep state synchronized across browser tabs in real-time
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key || e.key === "gocoupon_user_watchlist_v1") {
        setItems(getWatchlist());
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleRemove = (productId: string, title: string) => {
    const itemToRemove = items.find((i) => i.productId === productId);
    removeFromWatchlist(productId);
    setItems(getWatchlist());
    toast.info(`Removed ${title.slice(0, 25)}... from Watchlist`, {
      action: itemToRemove
        ? {
            label: "Undo",
            onClick: () => {
              addToWatchlist({
                productId: itemToRemove.productId,
                productTitle: itemToRemove.productTitle,
                productImage: itemToRemove.productImage,
                targetPrice: itemToRemove.targetPrice,
                currentLowestPrice: itemToRemove.currentLowestPrice,
                currency: itemToRemove.currency,
                email: itemToRemove.notifyChannels?.email,
              });
              setItems(getWatchlist());
              toast.success("Restored item to Watchlist");
            },
          }
        : undefined,
    });
  };

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border py-16 px-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Bell className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-display text-xl font-bold text-foreground">Your Watchlist is Empty</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Track price drops on your favorite electronics, headphones, and smartphones. Click the bell icon on any product page to set a target price.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/compare"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:scale-105 transition-transform"
          >
            <span>Explore Price Comparisons</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const isTargetReached = item.currentLowestPrice <= item.targetPrice;
        const dropAmount = item.initialPrice - item.currentLowestPrice;

        return (
          <div
            key={item.id}
            className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-lg"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <img
                  src={item.productImage}
                  alt={item.productTitle}
                  onError={(e) => {
                    e.currentTarget.src = "/icons/icon_128.png";
                  }}
                  className="h-16 w-16 rounded-2xl object-cover border border-border"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(item.productId, item.productTitle)}
                  aria-label={`Remove ${item.productTitle} from Watchlist`}
                  className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors focus:outline-hidden focus:ring-2 focus:ring-destructive/30"
                  title="Remove from Watchlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <h4 className="mt-4 font-display text-base font-bold text-foreground line-clamp-2">
                <Link to="/product/$productId" params={{ productId: item.productId }}>
                  {item.productTitle}
                </Link>
              </h4>

              {/* Price Target Info */}
              <div className="mt-4 space-y-2 rounded-2xl border border-border/60 bg-muted/20 p-3.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Current Price:</span>
                  <span className="font-display font-bold text-foreground">
                    {formatPrice(item.currentLowestPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Target Alert Price:</span>
                  <span className="font-display font-bold text-primary">
                    {formatPrice(item.targetPrice)}
                  </span>
                </div>

                {isTargetReached ? (
                  <div className="rounded-lg bg-emerald-500/10 px-2 py-1 text-center font-mono text-[11px] font-bold text-emerald-500">
                    🎉 TARGET PRICE HIT! Ready to buy.
                  </div>
                ) : (
                  <div className="text-[11px] text-muted-foreground font-mono text-center">
                    Needs {formatPrice(Math.max(0, item.currentLowestPrice - item.targetPrice))} more drop
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 border-t border-border pt-4">
              <Link
                to="/product/$productId"
                params={{ productId: item.productId }}
                className="flex-1 rounded-xl bg-primary py-2 text-center text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity"
              >
                View Price History &amp; Deals
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
