/**
 * @file AnimatedDealsCarousel.tsx
 * @description Auto-sliding deal marquee carousel powered by real live deals from /api/deals.
 *
 * 100% Real Available Deals:
 * - Direct integration with useDeals() hook querying live Cuelinks & Admitad database
 * - Zero hardcoded or mock demo data
 * - 1-Click Coupon Code Copy + Safe Affiliate Redirection (/api/redirect/deal)
 * - Authentic store logos with Google S2 Favicon API fallback
 * - Auto-pauses on hover for frictionless user interaction
 * - Strictly zero "sparkle" icons
 */

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useDeals } from "@/hooks/use-deals";
import { useLiveStats } from "@/hooks/use-live-stats";
import { buildDealRedirectUrl } from "@/lib/services/store-registry";
import type { Deal } from "@/lib/api/deals-api";
import { Tag, Copy, Check, ExternalLink, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

/**
 * Real Google S2 Favicon API helper.
 */
function getRealStoreLogo(explicitLogo?: string, storeName = "Store"): string {
  if (explicitLogo && (explicitLogo.startsWith("http") || explicitLogo.startsWith("/Brand logos/"))) {
    return explicitLogo;
  }
  const clean = storeName.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `https://www.google.com/s2/favicons?domain=${clean}.com&sz=128`;
}

function CarouselDealCard({
  deal,
  copiedCode,
  onCopy,
}: {
  deal: Deal;
  copiedCode: string | null;
  onCopy: (code: string, storeName: string, redirectUrl?: string, e?: React.MouseEvent) => void;
}) {
  const hasWorkingCode = deal.code && deal.code !== "DEALACTIVATED";
  const logoUrl = getRealStoreLogo(deal.storeLogo, deal.storeName);

  const redirectUrl = buildDealRedirectUrl({
    url: deal.link,
    dealId: deal.id,
    storeName: deal.storeName,
    storeSlug: deal.storeSlug,
    title: deal.title,
    code: deal.code,
    source: "homepage_carousel",
  });

  return (
    <div className="group relative flex w-[310px] sm:w-[330px] shrink-0 flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5">
      {/* Top Store Info & Badges */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 shrink-0 rounded-lg border border-border/80 bg-white p-1 flex items-center justify-center overflow-hidden shadow-2xs">
              <img
                src={logoUrl}
                alt={deal.storeName}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  const clean = deal.storeName.toLowerCase().replace(/[^a-z0-9]/g, "");
                  e.currentTarget.src = `https://www.google.com/s2/favicons?domain=${clean}.com&sz=128`;
                }}
                loading="lazy"
                width={24}
                height={24}
              />
            </div>
            <div className="min-w-0">
              <span className="font-display text-xs font-bold text-foreground truncate block">
                {deal.storeName}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground uppercase">
                {deal.category}
              </span>
            </div>
          </div>

          {/* Discount Badge */}
          {deal.discount && deal.discount !== "Verified Deal" ? (
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
              {deal.discount}
            </span>
          ) : (
            <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 font-mono text-[10px] font-bold text-primary shrink-0">
              Verified
            </span>
          )}
        </div>

        {/* Deal Title */}
        <h3 className="mt-3 font-display text-sm font-bold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {deal.title}
        </h3>
      </div>

      {/* Verification & Meta Row */}
      <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="h-3 w-3" />
          <span>{deal.verifiedDate || "Verified Today"}</span>
        </span>
        {deal.usesCount > 0 && (
          <span className="opacity-75">{deal.usesCount.toLocaleString()} used</span>
        )}
      </div>

      {/* Bottom Action Row */}
      <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3">
        {hasWorkingCode ? (
          <a
            href={redirectUrl}
            target="_blank"
            rel="noopener sponsored nofollow"
            onClick={(e) => {
              e.stopPropagation();
              onCopy(deal.code, deal.storeName, redirectUrl, e);
            }}
            className={`flex-1 inline-flex items-stretch h-9 sm:h-10 rounded-xl sm:rounded-2xl overflow-hidden border border-indigo-200/50 dark:border-indigo-900/50 shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer select-none ${
              copiedCode === deal.code ? "bg-emerald-600 text-white ring-2 ring-emerald-500/30" : "bg-[#3f38d6] dark:bg-indigo-600 hover:bg-[#352fc4] text-white"
            }`}
            title={`Click to copy code and open ${deal.storeName}`}
          >
            <div className="flex-1 flex items-center justify-center gap-1.5 px-2 text-[11px] sm:text-xs font-bold">
              {copiedCode === deal.code ? (
                <>
                  <Check className="h-3.5 w-3.5 animate-bounce shrink-0 stroke-[2.5]" />
                  <span>COPIED!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 shrink-0 stroke-[2.2]" />
                  <span className="uppercase font-sans font-bold tracking-wider">
                    {deal.discount && deal.discount !== "Deal" ? `REDEEM ${deal.discount}` : "REDEEM CODE"}
                  </span>
                </>
              )}
            </div>
            <div
              className={`w-11 sm:w-13 shrink-0 flex items-center justify-center border-l select-none font-sans font-extrabold text-xs sm:text-sm tracking-widest ${
                copiedCode === deal.code
                  ? "bg-emerald-700 text-white border-emerald-500/40"
                  : "bg-[#d4d4d8] dark:bg-zinc-700 text-white border-white/20 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]"
              }`}
            >
              {copiedCode === deal.code
                ? "✓"
                : deal.code.length >= 2
                ? `${deal.code.slice(-2, -1)} ${deal.code.slice(-1)}`
                : deal.code}
            </div>
          </a>
        ) : (
          <div className="flex-1 rounded-xl bg-muted/60 py-2 px-2 text-center text-[11px] font-mono text-muted-foreground font-semibold">
            No Code Needed
          </div>
        )}

        {/* External Redeem CTA */}
        <a
          href={redirectUrl}
          target="_blank"
          rel="noopener sponsored nofollow"
          aria-label={`Redeem ${deal.storeName} deal: ${deal.title}`}
          className="rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90 shrink-0 inline-flex items-center gap-1 shadow-2xs"
          onClick={() => {
            if (hasWorkingCode) {
              navigator.clipboard.writeText(deal.code).catch(() => {});
            }
          }}
        >
          <span>Redeem</span>
          <ArrowRight className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

export function AnimatedDealsCarousel() {
  const liveStats = useLiveStats();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Fetch real live deals directly from /api/deals
  const { deals, isLoading } = useDeals({ limit: 12, sortBy: "trending" });

  const handleCopy = (code: string, storeName: string, redirectUrl?: string, e?: React.MouseEvent) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedCode(code);
    toast.success(`Coupon "${code}" copied!`, {
      description: `Opening ${storeName} to apply at checkout.`,
    });
    const isAnchor = Boolean(e?.currentTarget && (e.currentTarget as HTMLElement).tagName === "A");
    if (!isAnchor && redirectUrl && redirectUrl !== "#") {
      window.open(redirectUrl, "_blank", "noopener");
    }
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // If loading or empty, don't show broken state
  if (isLoading || !deals || deals.length === 0) return null;

  // Duplicate list for seamless infinite marquee scrolling
  const doubleDeals = [...deals, ...deals];

  return (
    <section className="border-t border-b border-border bg-card/20 py-8 sm:py-10 overflow-hidden relative">
      {/* Header Row */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mb-6 sm:mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary font-bold flex items-center gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live Verified Deals Pool
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Trending Verified Coupons &amp; Steal Deals
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Synchronized 24/7 directly from merchant affiliate feeds. Hover any deal card to pause sliding, auto-copy promo codes, and shop directly.
          </p>
        </div>

        <Link
          to="/offers"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-primary hover:underline shrink-0"
        >
          <span>Explore All {liveStats.formattedCount} Deals</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Marquee Track */}
      <div className="relative w-full overflow-hidden">
        {/* Soft edge fade gradients */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-16 sm:w-28 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-16 sm:w-28 bg-gradient-to-l from-background to-transparent" />

        <div className="flex w-max space-x-5 sm:space-x-6 animate-[marquee_45s_linear_infinite] hover:[animation-play-state:paused] px-4 sm:px-6">
          {doubleDeals.map((deal, idx) => (
            <CarouselDealCard
              key={`${deal.id}-${idx}`}
              deal={deal}
              copiedCode={copiedCode}
              onCopy={handleCopy}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
