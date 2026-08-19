/**
 * @file AffiliateProductGrid.tsx
 * @description Generic provider-independent affiliate product grid.
 *
 * This component renders GoCouponProduct objects.
 * It does NOT contain any provider-specific logic (no `if provider === "amazon"`).
 * The CTA label, affiliate URL, and disclosure are all provider-agnostic.
 *
 * Usage:
 *   <AffiliateProductGrid products={products} />
 *
 * The component:
 *   1. Renders a grid of product cards
 *   2. Uses product.affiliateCTA for the CTA button text (never hard-coded)
 *   3. Tracks affiliate clicks via affiliate-analytics
 *   4. Requires an explicit user click before navigating to the affiliate URL
 *   5. Shows AffiliateDisclosure for the active providers
 */

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { GoCouponProduct } from "@/lib/products/product-types";
import { AffiliateDisclosure } from "./AffiliateDisclosure";
import { trackCTAClick } from "@/lib/analytics/affiliate-analytics";
import { getAffiliateCTA } from "@/lib/products/product-cta";

interface AffiliateProductGridProps {
  products: GoCouponProduct[];
  /** Section eyebrow label e.g. "Amazon Verified Affiliate Deals" */
  eyebrow?: string;
  /** Section heading */
  heading?: string;
  /** Section description */
  description?: string;
  /** Link to show all deals (optional) */
  viewAllHref?: string;
  /** Link text */
  viewAllLabel?: string;
  /** Show disclosure (default: true) */
  showDisclosure?: boolean;
}

/**
 * Formats the review count for display.
 */
function fmtReviews(count?: number, display?: string): string {
  if (display) return display;
  if (!count) return "";
  return count >= 1000 ? `${(count / 1000).toFixed(1)}k ratings` : `${count} ratings`;
}

export function AffiliateProductGrid({
  products,
  eyebrow = "Verified Affiliate Deals",
  heading = "Curated Deals & Stackable Promo Codes",
  description = "Handpicked top-rated products eligible for goCoupon auto-apply promos and instant bank card discounts.",
  viewAllHref,
  viewAllLabel = "View All Deals →",
  showDisclosure = true,
}: AffiliateProductGridProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Derive active providers for disclosure
  const activeProviders = [...new Set(products.map((p) => p.provider))];

  if (products.length === 0) return null;

  return (
    <section className="border-t border-border px-6 py-20 bg-card/30">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              {eyebrow}
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
          {viewAllHref && (
            <Link
              to={viewAllHref}
              className="inline-flex items-center text-xs font-mono uppercase tracking-[0.15em] text-primary hover:underline"
            >
              {viewAllLabel}
            </Link>
          )}
        </div>

        {/* Product Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {products.map((product) => {
            const cta = getAffiliateCTA(product.provider);

            return (
              <div
                key={product.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              >

                {/* Product Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground/30">
                      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {product.badge && (
                    <div className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur-md px-3 py-1 text-[11px] font-medium text-foreground border border-border/50">
                      {product.badge}
                    </div>
                  )}
                  {product.rating && (
                    <div className="absolute top-3 right-3 rounded-full bg-primary/90 px-2.5 py-1 font-mono text-[10px] font-bold text-primary-foreground">
                      {product.rating.toFixed(1)} ★
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="mt-4 flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                      <span>{product.category}</span>
                      <span className="text-[11px]">
                        {fmtReviews(product.reviewCount, product.reviewCountDisplay)}
                      </span>
                    </div>

                    <h3 className="mt-2 font-display text-lg font-bold leading-snug text-foreground group-hover:text-primary transition-colors">
                      {/* Product title links to affiliate URL — requires explicit user click */}
                      <a
                        href={product.affiliateUrl}
                        target="_blank"
                        rel={cta.rel}
                        className="focus:outline-none"
                        onClick={() =>
                          trackCTAClick({
                            provider: product.provider,
                            productId: product.providerProductId,
                            country: product.country,
                            cta: "product_title_click",
                          })
                        }
                        aria-label={`${product.title} — ${cta.ariaLabel}`}
                      >
                        {product.title}
                      </a>
                    </h3>

                    {/* Price Row */}
                    <div className="mt-4 flex items-baseline gap-2">
                      {product.dealPriceDisplay && (
                        <span className="font-display text-2xl font-bold text-foreground">
                          {product.dealPriceDisplay}
                        </span>
                      )}
                      {product.originalPriceDisplay && (
                        <span className="text-sm text-muted-foreground line-through">
                          {product.originalPriceDisplay}
                        </span>
                      )}
                      {product.savingLabel && (
                        <span className="text-xs font-medium text-emerald-500 font-mono">
                          {product.savingLabel}
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    {product.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {product.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="mt-6 flex items-center gap-2 border-t border-border/60 pt-4">
                    {product.couponCode && (
                      <button
                        type="button"
                        onClick={() => handleCopy(product.couponCode!)}
                        className="flex-1 rounded-xl border border-dashed border-primary/40 bg-primary/5 py-2 px-3 text-center text-xs font-mono font-medium text-primary hover:bg-primary/10 transition-colors"
                        aria-label={`Copy coupon code ${product.couponCode}`}
                      >
                        {copiedCode === product.couponCode
                          ? "Copied Code!"
                          : `Code: ${product.couponCode}`}
                      </button>
                    )}
                    {/* PRIMARY CTA — requires explicit user click */}
                    <a
                      href={product.affiliateUrl}
                      target="_blank"
                      rel={cta.rel}
                      className="rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 shrink-0"
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
          })}
        </div>

        {/* Affiliate Disclosure */}
        {showDisclosure && (
          <div className="mt-8">
            <AffiliateDisclosure providers={activeProviders} compact />
          </div>
        )}
      </div>
    </section>
  );
}
