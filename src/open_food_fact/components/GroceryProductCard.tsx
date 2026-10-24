/**
 * @file src/open_food_fact/components/GroceryProductCard.tsx
 * @description Card component displaying packaged food product details,
 * Nutri-Score, NOVA group, and cross-store grocery delivery coupon links.
 */

import React, { useState } from "react";
import { Check, Copy, ExternalLink, ShoppingBag, Tag, Truck } from "lucide-react";
import type { FoodProductComparison, GroceryStoreOffer } from "../types.js";
import { NutriScoreBadge, NovaBadge } from "./NutriScoreBadge.js";

interface GroceryProductCardProps {
  comparison: FoodProductComparison;
  className?: string;
}

export const GroceryProductCard: React.FC<GroceryProductCardProps> = ({ comparison, className = "" }) => {
  const { product, offers, availableCouponsCount } = comparison;
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className={`bg-card text-card-foreground rounded-2xl border border-border/80 shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden ${className}`}>
      {/* Header Bar */}
      <div className="bg-muted/40 px-5 py-3 border-b border-border/60 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <ShoppingBag className="w-3.5 h-3.5 text-primary" />
          <span>Verified Packaged Grocery</span>
          {product.barcode && (
            <span className="font-mono bg-background/80 px-2 py-0.5 rounded border border-border/60 text-[11px] text-foreground lowercase">
              barcode: {product.barcode}
            </span>
          )}
        </div>
        {availableCouponsCount > 0 && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <Tag className="w-3 h-3" />
            <span>{availableCouponsCount} Active Store Coupons</span>
          </div>
        )}
      </div>

      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Product Image & Badges */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center">
            <div className="relative w-full max-w-[200px] aspect-square rounded-xl bg-muted/20 border border-border/50 flex items-center justify-center overflow-hidden p-3 shadow-inner">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.product_name}
                  width={200}
                  height={200}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <ShoppingBag className="w-12 h-12 stroke-[1.5] mb-2 opacity-50" />
                  <span className="text-xs">No image available</span>
                </div>
              )}
            </div>

            {/* Health & Nutrition Badges */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <NutriScoreBadge grade={product.nutriscore_grade} size="sm" showLabel={false} />
              {product.nova_group && <NovaBadge group={product.nova_group} size="sm" />}
            </div>
          </div>

          {/* Product Info & Store Comparison */}
          <div className="md:col-span-8 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-primary tracking-wide uppercase">
                {product.brands}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1">
                {product.product_name}
              </h3>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                {product.quantity && (
                  <span className="text-xs px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground font-medium border border-border/40">
                    Net Wt: {product.quantity}
                  </span>
                )}
                <NutriScoreBadge grade={product.nutriscore_grade} size="sm" showLabel={true} />
              </div>
            </div>

            {/* Store Matrix & Coupons */}
            <div className="mt-6">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Compare Retailers & Apply Instant Coupons
              </h4>
              <div className="space-y-2.5">
                {offers.map((offer) => (
                  <div
                    key={offer.storeId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-border/70 bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-background border border-border/60 flex items-center justify-center overflow-hidden p-1 flex-shrink-0">
                        {offer.logo ? (
                          <img src={offer.logo} alt={offer.storeName} width={32} height={32} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-sm">{offer.fallbackIcon}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">{offer.storeName}</span>
                          {offer.badge && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">
                              {offer.badge}
                            </span>
                          )}
                        </div>
                        {offer.deliveryTime && (
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Truck className="w-3 h-3 text-muted-foreground" />
                            <span>{offer.deliveryTime}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {(offer.price !== undefined || offer.estimatedPrice) && (
                        <div className="text-right mr-1">
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {offer.estimatedPrice || `${offer.currency || "₹"} ${offer.price?.toFixed(2)}`}
                          </span>
                          {offer.isLowest && (
                            <span className="block text-[9px] font-bold text-emerald-500 uppercase tracking-wider">
                              Best Price
                            </span>
                          )}
                        </div>
                      )}
                      {offer.couponCode && (
                        <button
                          type="button"
                          onClick={(e) => handleCopy(offer.couponCode!, e)}
                          title={`Copy code ${offer.couponCode}: ${offer.couponDescription || ""}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary transition-colors"
                        >
                          <Tag className="w-3 h-3" />
                          <span>{offer.couponCode}</span>
                          {copiedCode === offer.couponCode ? (
                            <Check className="w-3 h-3 text-emerald-500 ml-0.5" />
                          ) : (
                            <Copy className="w-3 h-3 opacity-60 ml-0.5" />
                          )}
                        </button>
                      )}

                      <a
                        href={offer.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
                      >
                        <span>View Deal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
