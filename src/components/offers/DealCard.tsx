import React from "react";
import { Clock, Users, ChevronDown } from "lucide-react";
import { StoreLogo } from "@/components/common/StoreLogo";
import { RedeemCouponButton } from "@/components/common/RedeemCouponButton";
import { buildDealRedirectUrl, wrapAffiliateTracking } from "@/lib/services/store-registry";
import type { Deal } from "@/lib/api/deals-api";

export interface DealCardProps {
  deal: Deal;
  viewDensity: "4-col" | "3-col" | "2-col" | "list";
  isCopied: boolean;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onCardClick: (deal: Deal, e: React.MouseEvent) => void;
  onRedeem: (deal: Deal) => void;
}

export const DealCard = React.memo(function DealCard({
  deal,
  viewDensity,
  isCopied,
  isExpanded,
  onToggleExpand,
  onCardClick,
  onRedeem,
}: DealCardProps) {
  const isListView = viewDensity === "list";
  const affiliateUrl = buildDealRedirectUrl({
    url: deal.link,
    dealId: deal.id,
    storeName: deal.storeName,
    storeSlug: deal.storeSlug,
    title: deal.title,
    code: deal.code,
    source: isListView ? "gocoupon_offers_list" : "gocoupon_offers_grid",
  });

  const accentClass =
    deal.badge === "Verified"
      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60"
      : deal.badge === "Exclusive"
      ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800/60"
      : "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60";

  // Keyboard accessibility handler for main card
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.target === e.currentTarget) {
      onCardClick(deal, e as unknown as React.MouseEvent);
    }
  };

  if (isListView) {
    return (
      <article
        role="article"
        tabIndex={0}
        aria-label={`${deal.storeName} - ${deal.title}`}
        onClick={(e) => onCardClick(deal, e)}
        onKeyDown={handleKeyDown}
        className="group relative flex flex-col md:flex-row md:items-center justify-between gap-5 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 transition-all duration-200 hover:border-primary/50 hover:shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <StoreLogo
            storeName={deal.storeName}
            storeLogo={deal.storeLogo}
            trackingUrl={deal.link}
            className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl p-2 shrink-0 group-hover:scale-105 transition-transform"
            imageClassName="max-h-full max-w-full object-contain"
          />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-bold text-xs text-foreground">{deal.storeName}</span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                {deal.badge || "Verified"}
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                &bull; {deal.category}
              </span>
            </div>

            <h3 className="font-display text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
              {deal.title}
            </h3>

            {deal.terms && (
              <div className="mt-1">
                <p className={`text-xs text-muted-foreground ${isExpanded ? "" : "line-clamp-1"} leading-relaxed`}>
                  {deal.terms}
                </p>
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpand(deal.id);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer pt-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                >
                  <span>{isExpanded ? "Read less" : "Read more"}</span>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                </button>
              </div>
            )}

            <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] font-mono text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3 text-sky-400" />
                <span>{deal.expiresIn}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Users className="h-3 w-3" />
                <span>{(deal.usesCount || 1200).toLocaleString()} shoppers saved</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Area */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-border/60">
          <div className="text-left md:text-right">
            <div className="font-mono text-xl sm:text-2xl font-black text-foreground">
              {deal.discount}
            </div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">
              Instant Discount
            </span>
          </div>

          <RedeemCouponButton
            deal={deal}
            affiliateUrl={affiliateUrl}
            isCopied={isCopied}
            onRedeem={onRedeem}
            className="min-w-[200px]"
          />
        </div>
      </article>
    );
  }

  // Grid View (2-col, 3-col, 4-col)
  return (
    <article
      role="article"
      tabIndex={0}
      aria-label={`${deal.storeName} - ${deal.title}`}
      onClick={(e) => onCardClick(deal, e)}
      onKeyDown={handleKeyDown}
      className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <div>
        {/* Top: Store logo + Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <StoreLogo
              storeName={deal.storeName}
              storeLogo={deal.storeLogo}
              trackingUrl={deal.link}
              className="h-7 w-7 rounded-lg p-1 shrink-0"
              imageClassName="max-h-full max-w-full object-contain"
            />
            <span className="text-xs font-bold text-foreground truncate leading-none">
              {deal.storeName}
            </span>
          </div>
          <span className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide shrink-0 ${accentClass}`}>
            {deal.badge || "Verified"}
          </span>
        </div>

        {/* Discount + Title */}
        <div className="mb-2.5">
          <div className="text-xl font-black tracking-tight text-foreground leading-none mb-1 truncate">
            {deal.discount}
          </div>
          <h3 className="text-xs font-medium text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {deal.title}
          </h3>
        </div>

        {/* Terms & Conditions toggle */}
        {deal.terms && (
          <div className="mb-2.5">
            <p className={`text-[11px] text-muted-foreground ${isExpanded ? "" : "line-clamp-1"} leading-snug`}>
              {deal.terms}
            </p>
            <button
              type="button"
              aria-expanded={isExpanded}
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(deal.id);
              }}
              className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-primary hover:underline cursor-pointer pt-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            >
              <span>{isExpanded ? "Less" : "Terms"}</span>
              <ChevronDown className={`h-2.5 w-2.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
            </button>
          </div>
        )}

        {/* Expiry line */}
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-3 font-mono">
          <Clock className="h-3 w-3 text-muted-foreground/60 shrink-0" />
          <span>{deal.expiresIn}</span>
          <span className="ml-auto opacity-70">{deal.category}</span>
        </div>
      </div>

      {/* Bottom CTA Button */}
      <div className="pt-2 border-t border-border/50">
        <RedeemCouponButton
          deal={deal}
          affiliateUrl={affiliateUrl}
          isCopied={isCopied}
          onRedeem={onRedeem}
          fullWidth
        />
      </div>
    </article>
  );
});
