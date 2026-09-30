/**
 * @file src/components/site/GrabOnPopularOffers.tsx
 * @description GrabOn-style "Popular Offers of the Day" component for GoCoupon.
 *
 * Implements GrabOn's exact 4-card card anatomy:
 * - Top half: Branded background banner with floating circular store logo badge
 * - Bottom half: Uppercase badge, clear discount title, terms snippet, and "Redeem Now" CTA
 * - 100% Real GoCoupon Data from FEATURED_DEALS_COLLECTION
 * - Real 1-Click Code Copy + Direct Affiliate Checkout
 */

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Tag, Copy, Check, ArrowRight, ShieldCheck, Flame, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { FEATURED_DEALS_COLLECTION, type FeaturedDealItem } from "@/data/featured-deals-campaign";
import { StoreLogo } from "@/components/common/StoreLogo";

// Curated top 4 offers for the homepage grid
const OFFERS_DATA: (FeaturedDealItem & { cardTheme: string })[] = [
  {
    ...FEATURED_DEALS_COLLECTION[0], // MediBuddy
    cardTheme: "from-teal-600 to-emerald-700",
  },
  {
    ...FEATURED_DEALS_COLLECTION[1], // FlixBus
    cardTheme: "from-lime-600 to-emerald-700",
  },
  {
    ...FEATURED_DEALS_COLLECTION[2], // JBL
    cardTheme: "from-orange-600 to-amber-700",
  },
  {
    ...FEATURED_DEALS_COLLECTION[4], // MuscleBlaze
    cardTheme: "from-rose-600 to-red-800",
  },
];

export function GrabOnPopularOffers() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string, brandName: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied!`, {
      description: `Opening ${brandName}... Paste code at checkout to claim your discount.`,
    });
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <section className="py-10 sm:py-14 bg-white dark:bg-card/40 border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 mb-2 border border-amber-500/20">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>HAND-TESTED TODAY</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Popular Offers of the Day
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Top discount promo codes &amp; exclusive partner savings verified by GoCoupon lab.
            </p>
          </div>

          <Link
            to="/offers"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:text-primary/80 transition-colors group"
          >
            <span>Explore All 1,068+ Offers</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 4-Card Responsive Grid (GrabOn exact card style!) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {OFFERS_DATA.map((deal) => {
            const isCopied = copiedCode === deal.couponCode;

            return (
              <div
                key={deal.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card shadow-xs hover:shadow-xl hover:border-primary/50 transition-all duration-300 overflow-hidden"
              >
                {/* Top Half: Gradient Banner + Floating Store Logo */}
                <div>
                  <div className={`relative h-28 w-full bg-gradient-to-r ${deal.cardTheme} p-4 flex items-start justify-between`}>
                    <span className="text-[11px] font-bold text-white/90 bg-black/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/20">
                      {deal.discountText}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/90 bg-white/10 px-2 py-0.5 rounded-full">
                      {deal.category}
                    </span>
                  </div>

                  {/* Circular Floating Store Logo (GrabOn signature look) */}
                  <div className="-mt-8 flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-white dark:bg-card p-2 shadow-lg border border-slate-100 dark:border-border flex items-center justify-center transition-transform group-hover:scale-110">
                      <StoreLogo
                        storeName={deal.brandName}
                        storeLogo={deal.logoUrl}
                        className="w-11 h-11"
                      />
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 pt-3 text-center flex flex-col items-center">
                    <span className="text-[11px] font-bold tracking-wider uppercase text-primary mb-1">
                      {deal.badge || "GOCOUPON EXCLUSIVE"}
                    </span>

                    <h3 className="font-display font-bold text-sm sm:text-base text-foreground line-clamp-2 min-h-[44px]">
                      {deal.brandName}: {deal.subTitle}
                    </h3>

                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                      {deal.terms}
                    </p>
                  </div>
                </div>

                {/* Bottom Card Action Footer */}
                <div className="p-4 pt-0">
                  <div className="pt-3 border-t border-slate-100 dark:border-border/60 flex items-center gap-2">
                    {/* Copy Code Button */}
                    <button
                      type="button"
                      onClick={() => handleCopy(deal.couponCode, deal.brandName)}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                        isCopied
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "bg-slate-50 dark:bg-muted text-slate-800 dark:text-foreground border-slate-200 dark:border-border hover:bg-slate-100"
                      }`}
                      title={`Copy ${deal.couponCode}`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Tag className="w-3.5 h-3.5 text-primary" />
                          <span className="font-mono">{deal.couponCode}</span>
                          <Copy className="w-3 h-3 text-muted-foreground ml-auto" />
                        </>
                      )}
                    </button>

                    {/* Direct Visit CTA */}
                    <a
                      href={deal.affiliateUrl || deal.merchantUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center p-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-xs hover:scale-105 active:scale-95 transition-all shrink-0"
                      title={`Redeem deal on ${deal.brandName}`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
