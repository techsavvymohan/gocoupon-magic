/**
 * @file compare.tsx
 * @description Real-time Multi-Platform Product Search & Cross-Store Price Comparison Matrix.
 * Searches and lists products across Amazon, Flipkart, Myntra, Croma, Meesho, and Tata CLiQ.
 */

import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import { UrlResolverSearch } from "@/components/shopping/UrlResolverSearch";
import { PriceHistoryChart } from "@/components/shopping/PriceHistoryChart";
import { PriceAlertModal } from "@/components/shopping/PriceAlertModal";
import {
  searchProductsAcrossPlatforms,
  getPlatformTrustRank,
  isTopTrustedPlatform,
  type MultiPlatformProductItem,
  type MultiPlatformSearchResult,
} from "@/lib/services/multi-platform-search";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Tag,
  Layers,
  TrendingDown,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
  Star,
  Clock,
  Filter,
  ArrowUpDown,
  X,
  Store,
  Percent,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/compare")({
  component: ComparePage,
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) || "",
    url: (search.url as string) || "",
  }),
  head: () =>
    createSeoHead({
      title: "Price Comparison India: Compare Prices & Find Cheaper Products Across Stores – goCoupon",
      description:
        "Compare live prices, stackable coupons, delivery fees, and cashback across Amazon, Flipkart, Myntra, Croma, and Tata CLiQ. Find cheaper products and save up to 40% instantly.",
      path: "/compare",
      keywords:
        "price comparison india, compare prices, cheaper products, find cheapest price, amazon vs flipkart price comparison, lowest price online shopping, cross store comparison, product price checker, online price tracker",
    }),
});

type SortOption = "relevance" | "price-asc" | "price-desc" | "rating" | "savings";
type PriceRangeOption = "all" | "under-2k" | "2k-10k" | "10k-50k" | "above-50k";

function StoreLogoImg({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  if (!src || error) {
    return (
      <div
        className={`flex items-center justify-center rounded-md bg-muted font-mono font-bold text-muted-foreground ${
          className || "h-6 w-6 text-[10px]"
        }`}
      >
        {alt ? alt.trim().slice(0, 2).toUpperCase() : "ST"}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className || "h-6 w-6 object-contain"}
      onError={() => setError(true)}
    />
  );
}

function ProductCardImg({ src, alt }: { src: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  return (
    <img
      src={hasError ? "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80" : imgSrc}
      alt={alt}
      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}

export function ComparePage() {
  const { q, url } = useSearch({ from: "/compare" });
  const activeSearchParam = url || q || "";

  const [searchResult, setSearchResult] = useState<MultiPlatformSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("All");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [priceRange, setPriceRange] = useState<PriceRangeOption>("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Comparison & Price History Modal state
  const [selectedProduct, setSelectedProduct] = useState<MultiPlatformProductItem | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  // When search query or URL changes, fetch products from all shopping platforms
  useEffect(() => {
    if (activeSearchParam.trim()) {
      executeSearch(activeSearchParam.trim());
    } else {
      setSearchResult(null);
    }
  }, [activeSearchParam]);

  const executeSearch = async (queryOrUrl: string) => {
    setIsSearching(true);
    try {
      const res = await searchProductsAcrossPlatforms(queryOrUrl);
      setSearchResult(res);
      // If it's a direct URL with only 1 product, automatically select it for deep inspection
      if (res.isDirectUrl && res.products.length === 1) {
        setSelectedProduct(res.products[0]);
      }
    } catch {
      toast.error("Unable to search platforms. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    toast.success(`Copied coupon: ${code}`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Filter and sort products
  const displayedProducts = useMemo(() => {
    if (!searchResult) return [];
    let list = [...searchResult.products];

    // 1. Platform Filter
    if (selectedPlatform !== "All") {
      list = list.filter(
        (p) =>
          p.primaryStore.toLowerCase().includes(selectedPlatform.toLowerCase()) ||
          p.offers.some((o) => o.storeName.toLowerCase().includes(selectedPlatform.toLowerCase()))
      );
    }

    // 2. Price Range Filter
    if (priceRange === "under-2k") {
      list = list.filter((p) => p.price < 2000);
    } else if (priceRange === "2k-10k") {
      list = list.filter((p) => p.price >= 2000 && p.price <= 10000);
    } else if (priceRange === "10k-50k") {
      list = list.filter((p) => p.price >= 10000 && p.price <= 50000);
    } else if (priceRange === "above-50k") {
      list = list.filter((p) => p.price > 50000);
    }

    // 3. Sorting
    if (sortBy === "relevance") {
      list.sort((a, b) => {
        const rankA = a.trustTier ?? getPlatformTrustRank(a.primaryStore);
        const rankB = b.trustTier ?? getPlatformTrustRank(b.primaryStore);
        if (rankA !== rankB) return rankA - rankB;
        return b.rating - a.rating;
      });
    } else if (sortBy === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "savings") {
      list.sort((a, b) => b.maxSavingsVsOriginal - a.maxSavingsVsOriginal);
    }

    return list;
  }, [searchResult, selectedPlatform, sortBy, priceRange]);

  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Compare & Search", path: "/compare" },
    ...(activeSearchParam ? [{ name: `Results for "${activeSearchParam.slice(0, 25)}"`, path: `/compare?q=${encodeURIComponent(activeSearchParam)}` }] : []),
  ]);

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* Hero Search Section */}
      <section className="relative border-b border-border bg-gradient-to-b from-background via-background/95 to-muted/20 px-4 sm:px-6 pb-12 pt-14 sm:pt-20">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 font-mono text-xs uppercase tracking-[0.2em] text-primary">
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            Multi-Platform Price Search Engine
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
            Search Products Across All Shopping Platforms
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground text-balance">
            Find the lowest price across Amazon, Flipkart, Myntra, Croma, and Tata CLiQ with instant coupon application and 90-day price history.
          </p>

          <div className="mx-auto mt-6 sm:mt-8 max-w-3xl">
            <UrlResolverSearch
              size="large"
              showTrustBadges={true}
              showPopularChips={true}
            />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="px-4 sm:px-6 py-8 sm:py-12 max-w-7xl mx-auto">
        {/* Loading State */}
        {isSearching && (
          <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-lg animate-pulse space-y-4 my-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Loader2 className="h-7 w-7 animate-spin" aria-hidden="true" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground">
              Searching across Indian shopping platforms…
            </h2>
            <p className="text-xs font-mono text-muted-foreground max-w-md mx-auto">
              Scanning live product listings, stock status, coupons, and discounts on Amazon, Flipkart, Myntra, Croma, and Tata CLiQ.
            </p>
          </div>
        )}

        {/* Results View */}
        {!isSearching && searchResult && (
          <div className="space-y-6">
            {/* Results Header with Query & Store Badges */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground block">
                  Search Results
                </span>
                <h2 className="font-display text-2xl font-bold text-foreground mt-0.5">
                  Products for &ldquo;{searchResult.query}&rdquo;
                </h2>
                <span className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Found {displayedProducts.length} items across {searchResult.availableStores.length} stores
                </span>
              </div>

              {/* Sorting & Filter Controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium">
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-transparent font-bold text-foreground focus:outline-none cursor-pointer"
                  >
                    <option value="relevance" className="bg-card text-foreground">Best Match (Top Stores First)</option>
                    <option value="price-asc" className="bg-card text-foreground">Price: Low to High</option>
                    <option value="price-desc" className="bg-card text-foreground">Price: High to Low</option>
                    <option value="rating" className="bg-card text-foreground">Customer Rating</option>
                    <option value="savings" className="bg-card text-foreground">Biggest Savings</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Top Trusted Stores Priority Callout Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-xs text-foreground">
              <div className="flex items-center gap-2 font-medium">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-amber-950 font-black text-[10px]">
                  ★
                </span>
                <span>
                  <strong>Top Trusted Stores on Top:</strong> Showing verified listings from <strong>Amazon</strong>, <strong>Flipkart</strong>, <strong>Croma</strong>, <strong>Myntra</strong> &amp; <strong>Tata CLiQ</strong> first.
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>Verified Merchant Guarantee</span>
              </div>
            </div>

            {/* Platform & Price Range Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
              {/* Platforms */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground mr-1 flex items-center gap-1">
                  <Store className="h-3.5 w-3.5" /> Platform:
                </span>
                {["All", "Amazon", "Flipkart", "Croma", "Myntra", "Meesho", "Tata CLiQ"].map((store) => (
                  <button
                    key={store}
                    type="button"
                    onClick={() => setSelectedPlatform(store)}
                    className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all touch-manipulation ${
                      selectedPlatform === store
                        ? "bg-primary text-primary-foreground shadow-xs scale-105"
                        : "border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
                    }`}
                  >
                    {store}
                  </button>
                ))}
              </div>

              {/* Price Range */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-muted-foreground font-mono mr-1">Price:</span>
                {[
                  { label: "All", value: "all" },
                  { label: "< ₹2k", value: "under-2k" },
                  { label: "₹2k - ₹10k", value: "2k-10k" },
                  { label: "₹10k - ₹50k", value: "10k-50k" },
                  { label: "> ₹50k", value: "above-50k" },
                ].map((range) => (
                  <button
                    key={range.value}
                    type="button"
                    onClick={() => setPriceRange(range.value as PriceRangeOption)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      priceRange === range.value
                        ? "bg-muted text-foreground font-bold border border-primary/40"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Cards Grid */}
            {displayedProducts.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {displayedProducts.map((product) => (
                  <article
                    key={product.id}
                    className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
                  >
                    <div>
                      {/* Product Thumbnail Container */}
                      <div
                        onClick={() => setSelectedProduct(product)}
                        className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted/30 p-2 flex items-center justify-center cursor-pointer"
                        title="Click to compare prices across stores"
                      >
                        <ProductCardImg src={product.imageUrl} alt={product.title} />

                        {/* Origin Store Badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-background/95 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-foreground border border-border shadow-xs">
                          <StoreLogoImg src={product.primaryStoreLogo} alt={product.primaryStore} className="h-3.5 w-3.5 object-contain" />
                          <span>{product.primaryStore}</span>
                        </div>

                        {/* Top Trusted Store Badge */}
                        {(product.isTrustedStore || isTopTrustedPlatform(product.primaryStore)) && (
                          <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-amber-500/95 backdrop-blur-md px-2 py-0.5 font-mono text-[9px] font-extrabold text-amber-950 shadow-xs">
                            <ShieldCheck className="h-2.5 w-2.5" />
                            <span>Top Trusted</span>
                          </div>
                        )}

                        {/* Discount Badge */}
                        {product.discountPercent > 0 && (
                          <div className="absolute top-3 right-3 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            {product.discountPercent}% OFF
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] font-bold text-foreground shrink-0">
                              {product.brand}
                            </span>
                            <span className="rounded-md bg-primary/5 text-primary px-1.5 py-0.5 font-mono text-[9px] font-semibold truncate">
                              {product.category}
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-amber-500 font-bold shrink-0 ml-2">
                            <Star className="h-3 w-3 fill-amber-500" />
                            {product.rating.toFixed(1)}
                            <span className="text-muted-foreground font-normal">({product.reviewCount})</span>
                          </span>
                        </div>

                        <h3
                          onClick={() => setSelectedProduct(product)}
                          className="font-display text-sm font-bold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors cursor-pointer"
                          title="Click to view all stores & price history"
                        >
                          {product.title}
                        </h3>

                        {/* Pricing Row */}
                        <div className="mt-3 flex items-baseline gap-2">
                          <span className="font-display text-xl font-bold text-foreground tabular-nums">
                            ₹{product.price.toLocaleString("en-IN")}
                          </span>
                          {product.originalPrice > product.price && (
                            <span className="font-mono text-xs text-muted-foreground line-through tabular-nums">
                              ₹{product.originalPrice.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>

                        {/* Compared Stores Pill */}
                        <div className="mt-2 text-[11px] text-muted-foreground flex items-center justify-between">
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            Compared in {product.offers.length} stores
                          </span>
                          <span className="font-mono text-[10px]">
                            Lowest: ₹{(product.offers[0]?.effectiveNetPrice || product.price).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="mt-5 pt-3 border-t border-border flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedProduct(product)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/30 px-3 py-2 min-h-[38px] text-xs font-bold text-foreground hover:bg-primary/10 hover:border-primary/40 transition-colors touch-manipulation"
                      >
                        <Layers className="h-3.5 w-3.5 text-primary" />
                        <span>Compare Prices</span>
                      </button>

                      <a
                        href={product.directUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1 rounded-xl bg-primary px-3.5 py-2 min-h-[38px] text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors touch-manipulation"
                      >
                        <span>Buy</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center max-w-lg mx-auto">
                <Filter className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="font-display text-lg font-bold text-foreground">No matching products found</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try adjusting your platform filters or price range to view more results.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlatform("All");
                    setPriceRange("all");
                  }}
                  className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Default Landing / Showcase when no search active */}
        {!isSearching && !searchResult && (
          <div className="space-y-12">
            {/* Quick Category Explorers */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-sm">
              <div className="text-center max-w-xl mx-auto">
                <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  Popular Searches
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                  Compare Top Products in India
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Click any trending item or paste a link from Amazon, Flipkart, or Myntra to compare live prices, delivery times, and active promo codes.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-2.5">
                {[
                  "iPhone 15",
                  "Sony WH-1000XM5",
                  "MacBook Air M3",
                  "Samsung Galaxy S24",
                  "boAt Airdopes",
                  "Nike Air Force 1",
                  "OnePlus 12R",
                  "PlayStation 5",
                  "iPad 10th Gen",
                  "Noise ColorFit Smartwatch",
                ].map((item) => (
                  <Link
                    key={item}
                    to="/compare"
                    search={{ q: item } as any}
                    className="rounded-2xl border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground hover:border-primary hover:bg-primary/5 hover:text-primary transition-all active:scale-95 shadow-2xs"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>

            {/* How It Works Matrix */}
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Store className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-bold text-foreground">1. Multi-Store Search</h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  We check Amazon, Flipkart, Myntra, Croma, Meesho, and Tata CLiQ in real time so you don&apos;t have to open 10 browser tabs.
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                  <Percent className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-bold text-foreground">2. Net Price Calculation</h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  We automatically deduct verified store promo codes, bank card discounts, and goCoupon cashback to show the true checkout cost.
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-bold text-foreground">3. 90-Day Price Tracker</h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  Spot artificial pre-sale price hikes and get notified instantly via price drop alerts when the price hits an all-time low.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Comparison & 90-Day History Modal */}
      {selectedProduct && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
        >
          <div className="relative w-full max-w-4xl rounded-3xl border border-border bg-card shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-border bg-muted/20">
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.title}
                  className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl object-contain bg-white p-1 border border-border shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded-md bg-primary/10 text-primary px-2 py-0.5 font-mono text-[10px] font-bold">
                      {selectedProduct.brand}
                    </span>
                    <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] font-bold text-foreground">
                      {selectedProduct.category}
                    </span>
                    <span className="rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 font-mono text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Live Verified Stores
                    </span>
                  </div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-foreground truncate">
                    {selectedProduct.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
              {/* Best Deal Banner */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                    Lowest Net Price Available:
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      ₹{(selectedProduct.offers[0]?.effectiveNetPrice || selectedProduct.price).toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      on {selectedProduct.offers[0]?.storeName || selectedProduct.primaryStore}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAlertModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-background px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    <span>Set Price Alert</span>
                  </button>

                  <a
                    href={selectedProduct.offers[0]?.affiliateUrl || selectedProduct.directUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 dark:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                  >
                    <span>Go to Deal</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Side-by-Side Store Comparison Table */}
              <div>
                <h4 className="font-display text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                  <Store className="h-4 w-4 text-primary" />
                  <span>Cross-Merchant Price Comparison ({selectedProduct.offers.length} Stores)</span>
                </h4>

                <div className="overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="divide-y divide-border">
                    {selectedProduct.offers.map((offer, idx) => (
                      <div
                        key={offer.storeId + idx}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 transition-colors ${
                          offer.isLowest ? "bg-emerald-500/5 dark:bg-emerald-950/20" : "hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <StoreLogoImg
                            src={offer.storeLogo}
                            alt={offer.storeName}
                            className="h-6 w-6 object-contain"
                          />

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs sm:text-sm text-foreground">{offer.storeName}</span>
                              {offer.isLowest && (
                                <span className="rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 font-mono text-[9px] font-bold">
                                  BEST PRICE
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-muted-foreground block">{offer.deliveryTime}</span>
                          </div>
                        </div>

                        {/* Coupons & Cashback Info */}
                        <div className="flex items-center gap-3 text-right">
                          {offer.couponCode && (
                            <button
                              type="button"
                              onClick={() => handleCopy(offer.couponCode!)}
                              className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-background px-2 py-1 text-[10px] font-mono font-bold text-primary hover:border-primary transition-colors"
                            >
                              {copiedCode === offer.couponCode ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                              <span>{offer.couponCode}</span>
                            </button>
                          )}

                          <div>
                            <span className="font-mono text-[10px] text-muted-foreground block">Net Cost:</span>
                            <span className="font-display text-base sm:text-lg font-bold text-foreground tabular-nums">
                              ₹{offer.effectiveNetPrice.toLocaleString("en-IN")}
                            </span>
                          </div>

                          <a
                            href={offer.affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-2xs hover:bg-primary/90 transition-colors"
                          >
                            <span>Shop</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 90-Day Interactive Price History Graph */}
              <div>
                <PriceHistoryChart
                  productId={selectedProduct.id}
                  productTitle={selectedProduct.title}
                  currentPrice={selectedProduct.price}
                  onSetAlertClick={() => setIsAlertModalOpen(true)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price Alert Modal */}
      <PriceAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        productId={selectedProduct?.id || "product"}
        productTitle={selectedProduct?.title || "Product"}
        currentPrice={selectedProduct?.price || 1499}
      />
    </SiteShell>
  );
}
