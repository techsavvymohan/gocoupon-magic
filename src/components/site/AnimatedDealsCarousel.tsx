/**
 * @file AnimatedDealsCarousel.tsx
 * @description Auto-sliding deal marquee carousel.
 *
 * Data is now sourced from the affiliate layer via useCarouselProducts hook
 * instead of the previous hard-coded inline arrays.
 *
 * The marquee animation, card layout, and all visual design are unchanged.
 * Section headings are now provider-neutral (not Amazon-specific).
 *
 * To show Impact/Awin products here instead of Amazon, change the provider prop.
 */

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useCarouselProducts } from "@/hooks/use-products";
import { getAffiliateCTA } from "@/lib/products/product-cta";
import { trackCTAClick } from "@/lib/analytics/affiliate-analytics";
import { getDisplayProvider } from "@/lib/affiliates/index";
import type { GoCouponProduct } from "@/lib/products/product-types";

interface AnimatedDealsCarouselProps {
  /** Override provider (defaults to the active display provider) */
  provider?: string;
  /** Marketplace country */
  country?: "IN" | "US";
}

function CarouselCard({
  product,
  copiedCode,
  onCopy,
}: {
  product: GoCouponProduct;
  copiedCode: string | null;
  onCopy: (code: string) => void;
}) {
  const cta = getAffiliateCTA(product.provider);

  return (
    <div className="group relative flex w-[320px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border/80 bg-card p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5">

      {/* Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-muted" />
        )}
        {product.badge && (
          <div className="absolute top-2.5 left-2.5 rounded-full bg-background/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-medium text-foreground border border-border/50">
            {product.badge}
          </div>
        )}
        {product.rating && (
          <div className="absolute top-2.5 right-2.5 rounded-full bg-primary/90 px-2 py-0.5 font-mono text-[10px] font-bold text-primary-foreground">
            {product.rating.toFixed(1)} ★
          </div>
        )}
      </div>

      {/* Card Details */}
      <div className="mt-3 flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span>{product.category}</span>
            <span>{product.reviewCountDisplay}</span>
          </div>

          <h3 className="mt-1.5 font-display text-base font-bold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
            <a
              href={product.affiliateUrl}
              target="_blank"
              rel={cta.rel}
              aria-label={`${product.title} — ${cta.ariaLabel}`}
              onClick={() =>
                trackCTAClick({
                  provider: product.provider,
                  productId: product.providerProductId,
                  country: product.country,
                  cta: "carousel_title_click",
                })
              }
            >
              {product.title}
            </a>
          </h3>

          {/* Price Row */}
          <div className="mt-3 flex items-baseline gap-2">
            {product.dealPriceDisplay && (
              <span className="font-display text-xl font-bold text-foreground">
                {product.dealPriceDisplay}
              </span>
            )}
            {product.originalPriceDisplay && (
              <span className="text-xs text-muted-foreground line-through">
                {product.originalPriceDisplay}
              </span>
            )}
            {product.savingLabel && (
              <span className="text-[11px] font-medium text-emerald-500 font-mono">
                {product.savingLabel}
              </span>
            )}
          </div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3">
          {product.couponCode && (
            <button
              type="button"
              onClick={() => onCopy(product.couponCode!)}
              className="flex-1 rounded-xl border border-dashed border-primary/40 bg-primary/5 py-1.5 px-2.5 text-center text-xs font-mono font-medium text-primary hover:bg-primary/10 transition-colors"
              aria-label={`Copy coupon code ${product.couponCode}`}
            >
              {copiedCode === product.couponCode ? "Copied!" : product.couponCode}
            </button>
          )}
          {/* CTA — requires explicit user click */}
          <a
            href={product.affiliateUrl}
            target="_blank"
            rel={cta.rel}
            className="rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 shrink-0"
            aria-label={cta.ariaLabel}
            onClick={() =>
              trackCTAClick({
                provider: product.provider,
                productId: product.providerProductId,
                country: product.country,
                cta: cta.label,
              })
            }
          >
            {cta.label} ↗
          </a>
        </div>
      </div>
    </div>
  );
}

export function AnimatedDealsCarousel({
  provider,
  country = "IN",
}: AnimatedDealsCarouselProps = {}) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const resolvedProvider = provider ?? getDisplayProvider();
  const { products } = useCarouselProducts({ provider: resolvedProvider, country, limit: 6 });

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  if (products.length === 0) return null;

  // Duplicate for seamless infinite loop
  const doubleDeals = [...products, ...products];

  // Determine "view all" link based on active provider
  const isAmazon = resolvedProvider === "amazon";

  return (
    <section className="border-t border-b border-border bg-card/20 py-20 overflow-hidden relative">
      <div className="mx-auto max-w-7xl px-6 mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Auto-Sliding Deals
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Featured Products & Stackable Promos
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Auto-sliding right-to-left deal marquee. Hover any card to pause sliding and copy valid
            promo codes.
          </p>
        </div>
        {isAmazon && (
          <Link
            to="/amazon-coupons"
            className="text-xs font-mono uppercase tracking-[0.15em] text-primary hover:underline"
          >
            View All Amazon Deals →
          </Link>
        )}
      </div>

      {/* Marquee Track */}
      <div className="relative w-full overflow-hidden">
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

        <div className="flex w-max space-x-6 animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused] px-6">
          {doubleDeals.map((product, idx) => (
            <CarouselCard
              key={`${product.id}-${idx}`}
              product={product}
              copiedCode={copiedCode}
              onCopy={handleCopy}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Legacy export for backward compatibility with any existing imports
export type { AnimatedDealsCarouselProps };
