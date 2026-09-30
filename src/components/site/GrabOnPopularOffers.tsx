/**
 * @file src/components/site/GrabOnPopularOffers.tsx
 * @description GrabOn-style "Popular Offers of the Day" with rich micro-animations & card effects.
 *
 * Implements GrabOn's exact card anatomy and animations:
 * - Card Hover Lift: translateY(-8px) with smooth cubic-bezier easing
 * - Shimmer Light Sweep on hover across card banner
 * - Store Logo 3D Zoom & Tilt: scale(1.15) with smooth rotation
 * - Copy Button Click Animation: Checkmark bounce & ripple feedback
 * - 100% Real GoCoupon Data from FEATURED_DEALS_COLLECTION
 */

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Tag, Copy, Check, ArrowRight, ShieldCheck, Flame, ExternalLink, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { FEATURED_DEALS_COLLECTION, type FeaturedDealItem } from "@/data/featured-deals-campaign";
import { StoreLogo } from "@/components/common/StoreLogo";

// Curated top 4 offers for the homepage grid
const OFFERS_DATA: (FeaturedDealItem & { cardTheme: string })[] = [
  {
    ...FEATURED_DEALS_COLLECTION[0], // MediBuddy
    cardTheme: "from-teal-600 via-emerald-600 to-teal-800",
  },
  {
    ...FEATURED_DEALS_COLLECTION[1], // FlixBus
    cardTheme: "from-lime-600 via-green-600 to-emerald-800",
  },
  {
    ...FEATURED_DEALS_COLLECTION[2], // JBL
    cardTheme: "from-orange-600 via-amber-600 to-amber-800",
  },
  {
    ...FEATURED_DEALS_COLLECTION[3], // Ajmal Perfumes
    cardTheme: "from-rose-600 via-red-600 to-pink-800",
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
              <Flame className="w-3.5 h-3.5 fill-current animate-pulse" />
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
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-200" />
          </Link>
        </div>

        {/* 4-Card Responsive Grid with Rich Hover Animations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {OFFERS_DATA.map((deal) => {
            const isCopied = copiedCode === deal.couponCode;

            return (
              <div
                key={deal.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card shadow-xs hover:shadow-2xl hover:border-primary/60 transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              >
                {/* Diagonal Shimmer Reflection on Card Hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-card-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-20" />

                {/* Top Half: Gradient Banner + Floating Store Logo */}
                <div>
                  <div className={`relative h-28 w-full bg-gradient-to-r ${deal.cardTheme} p-4 flex items-start justify-between overflow-hidden`}>
                    <span className="text-[11px] font-bold text-white/95 bg-black/25 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/20 shadow-xs">
                      {deal.discountText}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/90 bg-white/15 px-2 py-0.5 rounded-full">
                      {deal.category}
                    </span>
                  </div>

                  {/* Circular Floating Store Logo with 3D Zoom & Tilt Animation */}
                  <div className="-mt-8 flex justify-center relative z-10">
                    <div className="w-16 h-16 rounded-full bg-white dark:bg-card p-2 shadow-lg border border-slate-100 dark:border-border flex items-center justify-center transition-all duration-300 group-hover:scale-115 group-hover:-rotate-3 group-hover:shadow-xl">
                      <StoreLogo
                        storeName={deal.brandName}
                        storeLogo={deal.logoUrl}
                        className="w-11 h-11"
                      />
                    </div>
                  </div>

                  {/* Card Content with typography transitions */}
                  <div className="p-5 pt-3 text-center flex flex-col items-center">
                    <span className="text-[11px] font-bold tracking-wider uppercase text-primary mb-1 transition-colors group-hover:text-primary-hover">
                      {deal.badge || "GOCOUPON EXCLUSIVE"}
                    </span>

                    <h3 className="font-display font-bold text-sm sm:text-base text-foreground line-clamp-2 min-h-[44px] transition-colors group-hover:text-primary">
                      {deal.brandName}: {deal.subTitle}
                    </h3>

                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {deal.terms}
                    </p>
                  </div>
                </div>

                {/* Bottom Card Action Footer */}
                <div className="p-4 pt-0">
                  <div className="pt-3 border-t border-slate-100 dark:border-border/60 flex items-center gap-2">
                    {/* Copy Code Button with Bounce Effect */}
                    <button
                      type="button"
                      onClick={() => handleCopy(deal.couponCode, deal.brandName)}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 border active:scale-95 ${
                        isCopied
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                          : "bg-slate-50 dark:bg-muted text-slate-800 dark:text-foreground border-slate-200 dark:border-border hover:bg-slate-100 dark:hover:bg-muted/80 hover:border-primary/40"
                      }`}
                      title={`Copy ${deal.couponCode}`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 animate-bounce" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Tag className="w-3.5 h-3.5 text-primary group-hover:rotate-12 transition-transform" />
                          <span className="font-mono tracking-wider">{deal.couponCode}</span>
                          <Copy className="w-3 h-3 text-muted-foreground ml-auto" />
                        </>
                      )}
                    </button>

                    {/* Direct Visit CTA with hover pulse */}
                    <a
                      href={deal.affiliateUrl || deal.merchantUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center p-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-xs hover:scale-110 active:scale-90 transition-all shrink-0"
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
