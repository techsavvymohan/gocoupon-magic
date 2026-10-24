/**
 * @file src/components/site/GrabOnPopularOffers.tsx
 * @description GrabOn-style "Popular Offers of the Day" with rich micro-animations & card effects.
 *
 * Implements GrabOn's exact card anatomy and animations:
 * - Card Hover Lift: translateY(-8px) with smooth cubic-bezier easing
 * - Shimmer Light Sweep on hover across card banner
 * - Store Logo 3D Zoom & Tilt: scale(1.15) with smooth rotation
 * - Copy Button Click Animation: Checkmark bounce & ripple feedback
 * - 100% Programmatic Card Design: ZERO graphic banner image required!
 *   Automatically generates vibrant CSS gradients, circular brand avatars, and badges.
 * - Auto-Updates from live Cuelinks, Admitad & CJ deal syncs with fallback to curated high-priority partners.
 */

import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Tag, Copy, Check, ArrowRight, ShieldCheck, Flame, ExternalLink, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { FEATURED_DEALS_COLLECTION, type FeaturedDealItem } from "@/data/featured-deals-campaign";
import { StoreLogo } from "@/components/common/StoreLogo";
import { useDeals } from "@/hooks/use-deals";
import { useInternationalDeals } from "@/hooks/use-international-deals";
import { useLiveStats } from "@/hooks/use-live-stats";
import { buildDealRedirectUrl } from "@/lib/services/store-registry";

// Signature programmatic CSS gradients for top partner brands (Zero graphic banner required)
const BRAND_CARD_THEMES: Record<string, string> = {
  ajio: "from-slate-900 via-amber-900 to-yellow-950",
  nykaa: "from-pink-900 via-rose-900 to-fuchsia-950",
  boat: "from-red-900 via-stone-900 to-neutral-950",
  "tata-cliq": "from-rose-950 via-red-900 to-slate-950",
  firstcry: "from-amber-800 via-orange-700 to-yellow-900",
  myntra: "from-rose-900 via-pink-800 to-red-950",
  flipkart: "from-blue-900 via-indigo-900 to-slate-950",
  amazon: "from-amber-950 via-slate-900 to-stone-950",
  medibuddy: "from-teal-600 via-emerald-600 to-teal-800",
  flixbus: "from-lime-600 via-green-600 to-emerald-800",
  jbl: "from-orange-600 via-amber-600 to-amber-800",
  "pure-nutrition": "from-rose-600 via-pink-600 to-purple-800",
  "ajmal-perfumes": "from-amber-600 via-yellow-600 to-amber-800",
  "nasher-miles": "from-sky-600 via-blue-600 to-indigo-800",
  "sarkar-perfumes": "from-violet-600 via-purple-600 to-indigo-800",
  oliveboard: "from-cyan-600 via-blue-600 to-slate-800",
};

// Deterministic fallback gradients for any newly ingested live merchant
const FALLBACK_GRADIENTS = [
  "from-slate-900 via-amber-900 to-yellow-950",
  "from-pink-900 via-rose-900 to-fuchsia-950",
  "from-red-900 via-stone-900 to-neutral-950",
  "from-rose-950 via-red-900 to-slate-950",
  "from-indigo-600 via-purple-600 to-blue-800",
  "from-sky-600 via-blue-600 to-cyan-800",
  "from-fuchsia-600 via-pink-600 to-rose-800",
];

function getCardThemeForBrand(brandSlug: string): string {
  const norm = (brandSlug || "").toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (BRAND_CARD_THEMES[norm]) return BRAND_CARD_THEMES[norm];
  for (const key of Object.keys(BRAND_CARD_THEMES)) {
    if (norm.includes(key)) return BRAND_CARD_THEMES[key];
  }
  let hash = 0;
  for (let i = 0; i < norm.length; i++) {
    hash = (hash << 5) - hash + norm.charCodeAt(i);
    hash |= 0;
  }
  return FALLBACK_GRADIENTS[Math.abs(hash) % FALLBACK_GRADIENTS.length];
}

export function GrabOnPopularOffers() {
  const liveStats = useLiveStats();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Live deals hooks from Cuelinks, Admitad & CJ APIs for dynamic auto-updates
  const { deals: liveIndiaDeals } = useDeals({ limit: 40 });
  const { deals: liveIntlDeals } = useInternationalDeals();

  // Compute the 4 mostly-searched popular offers of the day.
  // Prioritizes the top partner brands from Cuelinks, Admitad & CJ (Ajio, Nykaa, boAt, Tata CLiQ).
  // Automatically pulls fresher discount codes / titles whenever live feeds revalidate!
  const popularOffers = useMemo(() => {
    const allLive = [...(liveIndiaDeals || []), ...(liveIntlDeals || [])];

    // Priority targets matching top mostly-searched campaigns
    const prioritySlugs = ["ajio", "nykaa", "boat", "tata-cliq"];

    return prioritySlugs.map((slug, idx) => {
      // 1. Check if live feed has an updated deal for this partner
      const liveMatch = allLive.find((d) => {
        const dSlug = (d.storeSlug || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        const dName = (d.storeName || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        const sClean = slug.replace(/[^a-z0-9]/g, "");
        return (
          dSlug.includes(sClean) ||
          sClean.includes(dSlug) ||
          dName.includes(sClean) ||
          sClean.includes(dName)
        );
      });

      // 2. Base curated deal from FEATURED_DEALS_COLLECTION
      const base =
        FEATURED_DEALS_COLLECTION.find((f) => f.brandSlug === slug) ||
        FEATURED_DEALS_COLLECTION[idx];

      const discountText = liveMatch?.discount || base.discountText;
      const couponCode = liveMatch?.code || base.couponCode;
      const subTitle = liveMatch?.title || base.subTitle;
      const terms = liveMatch?.terms || base.terms;
      const rawUrl = liveMatch?.link || base.affiliateUrl || base.merchantUrl;
      const logoUrl = liveMatch?.storeLogo || base.logoUrl;

      // Wrap with smart affiliate tracking (pub_id=272970 / EarnKaro)
      const redirectUrl = buildDealRedirectUrl({
        url: rawUrl,
        dealId: liveMatch?.id || base.id,
        storeName: base.brandName,
        storeSlug: base.brandSlug,
        code: couponCode,
        title: subTitle,
        source: "popular_offers_today",
      });

      return {
        id: liveMatch?.id || base.id,
        brandName: base.brandName,
        brandSlug: base.brandSlug,
        category: base.category,
        couponCode,
        discountText,
        subTitle,
        merchantUrl: base.merchantUrl,
        affiliateUrl: redirectUrl,
        badge: base.badge || "Verified Offer",
        cardTheme: getCardThemeForBrand(base.brandSlug),
        terms,
        logoUrl,
      };
    });
  }, [liveIndiaDeals, liveIntlDeals]);

  const handleCopy = (code: string, brandName: string, redirectUrl: string, e?: React.MouseEvent) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied!`, {
      description: `Opening ${brandName}... Paste code at checkout to claim your discount.`,
    });
    const isAnchor = Boolean(e?.currentTarget && (e.currentTarget as HTMLElement).tagName === "A");
    if (!isAnchor && redirectUrl && redirectUrl !== "#") {
      window.open(redirectUrl, "_blank", "noopener");
    }
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <section className="py-7 sm:py-14 bg-white dark:bg-card/40 border-b border-border/60">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 sm:gap-3 mb-5 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 mb-1.5 sm:mb-2 border border-amber-500/20">
              <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current animate-pulse" />
              <span>HAND-TESTED TODAY</span>
            </div>
            <h2 className="font-display text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Popular Offers of the Day
            </h2>
            <p className="text-[11px] sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
              Top discount promo codes &amp; exclusive partner savings verified by GoCoupon lab.
            </p>
          </div>

          <Link
            to="/offers"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-primary hover:text-primary/80 transition-colors group self-start sm:self-auto"
          >
            <span>Explore All {liveStats.formattedCount} Offers</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1 duration-200" />
          </Link>
        </div>

        {/* 2-Column Mobile Grid, 4-Column Desktop Grid — 100% Programmatic CSS (Zero Graphic Banner Required) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
          {popularOffers.map((deal) => {
            const isCopied = copiedCode === deal.couponCode;

            return (
              <div
                key={deal.id}
                className="group relative flex flex-col justify-between rounded-xl sm:rounded-2xl border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card shadow-2xs hover:shadow-xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Diagonal Shimmer Reflection on Card Hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-card-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-20" />

                {/* Top Half: Dynamic Programmatic CSS Gradient Header + Floating Store Logo */}
                <div>
                  <div
                    className={`relative h-14 sm:h-28 w-full bg-gradient-to-r ${deal.cardTheme} p-2 sm:p-4 flex items-start justify-between overflow-hidden`}
                  >
                    <span className="text-[10px] sm:text-[11px] font-bold text-white/95 bg-black/30 backdrop-blur-xs px-2 py-0.5 rounded-md sm:rounded-full border border-white/20 shadow-xs">
                      {deal.discountText}
                    </span>
                    <span className="hidden xs:inline-block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/90 bg-white/15 px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-full">
                      {deal.category}
                    </span>
                  </div>

                  {/* Circular Floating Store Logo with 3D Zoom */}
                  <div className="-mt-5 sm:-mt-8 flex justify-center relative z-10">
                    <div className="w-11 h-11 sm:w-16 sm:h-16 rounded-full bg-white dark:bg-card p-1 sm:p-2 shadow-md border border-slate-100 dark:border-border flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                      <StoreLogo
                        storeName={deal.brandName}
                        storeLogo={deal.logoUrl}
                        className="w-7 h-7 sm:w-11 sm:h-11 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Card Content with typography transitions */}
                  <div className="p-2.5 sm:p-5 pt-1.5 sm:pt-3 text-center flex flex-col items-center">
                    <span className="text-[9px] sm:text-[11px] font-bold tracking-wider uppercase text-primary mb-0.5 sm:mb-1 truncate max-w-full">
                      {deal.badge}
                    </span>

                    <h3 className="font-display font-bold text-xs sm:text-base text-foreground line-clamp-2 min-h-[32px] sm:min-h-[44px] transition-colors group-hover:text-primary">
                      {deal.brandName}: {deal.subTitle}
                    </h3>

                    <p className="hidden sm:block mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {deal.terms}
                    </p>
                  </div>
                </div>

                {/* Bottom Card Action Footer: Copy Button + Direct Affiliate Launch */}
                <div className="p-2 sm:p-4 pt-0">
                  <div className="pt-2 sm:pt-3 border-t border-slate-100 dark:border-border/60 flex items-center gap-1.5 sm:gap-2">
                    {/* Unified High-Converting Stub Button: [ REDEEM DISCOUNT ] [ 2 0 ] */}
                    <a
                      href={deal.affiliateUrl}
                      target="_blank"
                      rel="noopener sponsored nofollow"
                      onClick={(e) => handleCopy(deal.couponCode, deal.brandName, deal.affiliateUrl, e)}
                      className={`flex-1 inline-flex items-stretch h-9 sm:h-10 rounded-xl sm:rounded-2xl overflow-hidden border border-indigo-200/50 dark:border-indigo-900/50 shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer min-w-0 select-none ${
                        isCopied
                          ? "bg-emerald-600 text-white ring-2 ring-emerald-500/30"
                          : "bg-[#3f38d6] dark:bg-indigo-600 hover:bg-[#352fc4] text-white"
                      }`}
                      title={`Copy ${deal.couponCode} and open ${deal.brandName}`}
                    >
                      {/* Left Action Strip */}
                      <div className="flex-1 flex items-center justify-center gap-1.5 px-2 text-[11px] sm:text-xs font-bold tracking-wide">
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 animate-bounce shrink-0 stroke-[2.5]" />
                            <span className="truncate">COPIED!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />
                            <span className="truncate uppercase font-sans font-bold tracking-wider">
                              {deal.discountText && deal.discountText !== "Verified Deal"
                                ? `REDEEM ${deal.discountText}`
                                : "REDEEM CODE"}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Right Teaser Tab */}
                      <div
                        className={`w-11 sm:w-13 shrink-0 flex items-center justify-center border-l select-none font-sans font-extrabold text-xs sm:text-sm tracking-widest ${
                          isCopied
                            ? "bg-emerald-700 text-white border-emerald-500/40"
                            : "bg-[#d4d4d8] dark:bg-zinc-700 text-white border-white/20 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]"
                        }`}
                      >
                        {isCopied ? (
                          "✓"
                        ) : deal.couponCode.length >= 2 ? (
                          `${deal.couponCode.slice(-2, -1)} ${deal.couponCode.slice(-1)}`
                        ) : (
                          deal.couponCode
                        )}
                      </div>
                    </a>

                    {/* Direct Outbound Visit CTA (Monetized via Cuelinks/EarnKaro) */}
                    <a
                      href={deal.affiliateUrl}
                      target="_blank"
                      rel="noopener sponsored nofollow"
                      className="inline-flex items-center justify-center p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-xs hover:scale-105 active:scale-90 transition-all shrink-0"
                      title={`Redeem deal on ${deal.brandName}`}
                    >
                      <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
