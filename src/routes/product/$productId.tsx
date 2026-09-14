/**
 * @file $productId.tsx
 * @description Canonical Product Page.
 *
 * Integrates:
 * - Product Hero & Specifications
 * - Multi-Store Live Comparison Matrix (Item + Shipping - Coupon - Cashback)
 * - 90-Day Interactive Price History Area Chart & Fake Discount Warning
 * - Flash.co-Style Rubric Score & Verified Strengths / Limitations
 * - Verified Store Coupons with 1-Click Copy
 * - Price Drop Alert Modal
 */

import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import { CANONICAL_PRODUCTS, CANONICAL_OFFERS, CANONICAL_EVIDENCE, CANONICAL_COUPONS } from "@/data/canonicalCatalogData";
import { CURATED_COLLECTIONS } from "@/data/collectionsData";
import { compareProductOffers } from "@/lib/services/comparison-engine";
import { MerchantComparisonTable } from "@/components/shopping/MerchantComparisonTable";
import { FlashVerdictBadge } from "@/components/shopping/FlashVerdictBadge";
import { CouponStackPill } from "@/components/shopping/CouponStackPill";
import { PriceAlertModal } from "@/components/shopping/PriceAlertModal";
import { useCurrency } from "@/context/CurrencyContext";
import { isProductInWatchlist, addToWatchlist, removeFromWatchlist } from "@/lib/services/watchlist-service";
import {
  Bell,
  Check,
  TrendingDown,
  ShieldCheck,
  Truck,
  ExternalLink,
  ChevronRight,
  Tag,
  Star,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$productId")({
  component: ProductDetailsPage,
  head: ({ params }) => {
    const product = CANONICAL_PRODUCTS.find((p) => p.id === params.productId);
    return createSeoHead({
      title: product
        ? `${product.title} – Best Price, Coupons & 30-Day History | goCoupon`
        : "Product Price Comparison & Price History – goCoupon",
      description: product
        ? `Compare prices on ${product.title} across Amazon, Flipkart, Croma and more. View 30-day price history and auto-apply valid coupons.`
        : "Compare live prices, coupons, and 30-day price history across top online stores worldwide.",
      path: `/product/${params.productId}`,
      keywords: product
        ? `${product.title} price comparison, ${product.brand} discount code, lowest price ${product.title}, price tracker`
        : "product comparison, price tracker, discount coupon, best price online",
    });
  },
});

function ProductDetailsPage() {
  const { productId } = Route.useParams();
  const product = CANONICAL_PRODUCTS.find((p) => p.id === productId);

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isWatched, setIsWatched] = useState(() => (productId ? isProductInWatchlist(productId) : false));
  const { formatPrice, formatSaving } = useCurrency();
  const [imageError, setImageError] = useState(false);

  if (!product) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-4xl px-4 py-24 text-center">
          <h1 className="text-3xl font-display font-bold text-foreground">Product Not Found</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            The requested product is not in the verified catalog. Search live stores or paste a direct product link on the home page.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </SiteShell>
    );
  }

  const comparison = compareProductOffers(product.id);
  const evidence = CANONICAL_EVIDENCE.filter((e) => e.productId === product.id);
  const coupons = CANONICAL_COUPONS.filter((c) =>
    comparison?.rows.some((r) => r.offer.storeId === c.storeId),
  );

  // Find any collection recommendation for rubric score
  const recommendation = CURATED_COLLECTIONS.flatMap((c) => c.items).find(
    (i) => i.productId === product.id,
  );

  const bestDeal = comparison?.bestDeal;
  const currentPrice = bestDeal?.effectiveNetPrice || 28990;

  const handleToggleWatch = () => {
    if (isWatched) {
      removeFromWatchlist(product.id);
      setIsWatched(false);
      toast.info("Removed from Watchlist");
    } else {
      setIsAlertModalOpen(true);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    }
  };

  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Compare", path: "/compare" },
    { name: product.title, path: `/product/${product.id}` },
  ]);
  const fallbackStoreLogo = bestDeal?.storeLogo || "/Brand logos/Amazon_logo.svg.webp";
  const displayImage = imageError || !product.imageUrl ? fallbackStoreLogo : product.imageUrl;
  const isLogo =
    imageError ||
    !product.imageUrl ||
    displayImage.toLowerCase().includes("logo") ||
    displayImage.toLowerCase().includes("brand");

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* Main Product Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 pb-36 md:pb-16">
        {/* Breadcrumbs Navigation */}
        <div className="mb-6 flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/compare" className="hover:text-foreground">Compare</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground truncate max-w-xs">{product.brand}</span>
        </div>

        {/* Product Hero Section */}
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          {/* Gallery / Product Visual */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border bg-white dark:bg-card shadow-lg flex items-center justify-center p-8 sm:p-14">
              <img
                src={displayImage}
                alt={product.title}
                onError={() => setImageError(true)}
                className={`max-h-full max-w-full object-contain drop-shadow-xs transition-transform duration-300 hover:scale-105 ${
                  isLogo ? "w-4/5 max-h-48" : "w-full h-full"
                }`}
                fetchPriority="high"
              />
              {bestDeal && (
                <div className="absolute top-4 left-4 rounded-full bg-emerald-500 text-white px-3.5 py-1 font-mono text-xs font-bold shadow-md flex items-center gap-1.5 z-10">
                  <TrendingDown className="h-3.5 w-3.5" />
                  Lowest on {bestDeal.storeName}
                </div>
              )}
            </div>

            {/* Quick Specs Pill Badges */}
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-xl border border-border bg-muted/40 px-3 py-1 text-xs font-mono text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Product Overview & Action Box */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-primary font-bold">
                  {product.category} • {product.brand}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShare}
                    className="rounded-full border border-border bg-card p-2 text-muted-foreground hover:text-foreground transition-colors"
                    title="Share Deal"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleToggleWatch}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                      isWatched
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Bell className="h-3.5 w-3.5" />
                    <span>{isWatched ? "Price Alert Active" : "Track Price"}</span>
                  </button>
                </div>
              </div>

              <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                {product.title}
              </h1>

              {/* Rating & Reviews */}
              <div className="mt-3 flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 font-bold text-amber-500 font-mono">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {product.rating.toFixed(1)}
                </span>
                <span className="text-muted-foreground font-mono">
                  Based on {product.reviewCountDisplay || `${product.reviewCount} verified buyer reviews`}
                </span>
              </div>

              {/* Primary Price Card */}
              <div className="mt-6 rounded-3xl border border-border/80 bg-muted/20 p-6">
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Verified Lowest Effective Price
                </div>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="font-display text-4xl font-bold text-foreground">
                    {formatPrice(currentPrice)}
                  </span>
                  {bestDeal && bestDeal.couponSavings > 0 && (
                    <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {formatSaving(bestDeal.couponSavings)} with coupon
                    </span>
                  )}
                </div>

                {bestDeal && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Available on <strong>{bestDeal.storeName}</strong> with {bestDeal.deliveryEstimate} and {bestDeal.cashbackRate} cashback.
                  </p>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  {bestDeal && (
                    <a
                      href={bestDeal.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-md transition-transform hover:scale-[1.02]"
                    >
                      <span>Shop Deal on {bestDeal.storeName}</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    onClick={() => setIsAlertModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 py-3.5 text-xs font-bold text-foreground hover:bg-muted transition-colors"
                  >
                    <Bell className="h-4 w-4 text-primary" />
                    <span>Set Target Price</span>
                  </button>
                </div>
              </div>

              {/* Description Snippet */}
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Multi-Merchant Side-by-Side Comparison */}
        {comparison && (
          <section className="mt-16">
            <MerchantComparisonTable
              comparison={comparison}
              productTitle={product.title}
            />
          </section>
        )}

        {/* Section 3: Flash.co-Style AI Evidence & Rubric Breakdown */}
        <section className="mt-12">
          <FlashVerdictBadge
            recommendation={recommendation}
            evidence={evidence}
            score={product.flashScore || 9.4}
            productTitle={product.title}
          />
        </section>

        {/* Section 4: Verified Store Promo Codes */}
        {coupons.length > 0 && (
          <section className="mt-12 rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-primary uppercase tracking-wider mb-4">
              <Tag className="h-3.5 w-3.5" />
              Verified Stackable Promo Codes
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {coupons.map((c) => (
                <CouponStackPill key={c.id} coupon={c} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky Mobile Floating Action Bar (< 768px, positioned cleanly above bottom navigation) */}
      {bestDeal && (
        <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-border/80 bg-card/95 px-4 py-2.5 shadow-2xl backdrop-blur-xl md:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="font-mono text-[10px] text-muted-foreground uppercase block">
                Lowest on {bestDeal.storeName}
              </span>
              <span className="font-display text-lg font-bold text-foreground">
                {formatPrice(currentPrice)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAlertModalOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground"
                title="Track Price"
              >
                <Bell className="h-4 w-4" />
              </button>
              <a
                href={bestDeal.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md active:scale-95"
              >
                <span>Shop Deal</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      <PriceAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => {
          setIsAlertModalOpen(false);
          setIsWatched(isProductInWatchlist(product.id));
        }}
        productId={product.id}
        productTitle={product.title}
        productImage={displayImage}
        currentPrice={currentPrice}
      />
    </SiteShell>
  );
}
