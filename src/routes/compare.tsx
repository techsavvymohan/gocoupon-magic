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
import { useCurrency } from "@/context/CurrencyContext";
import { useUserCards } from "@/context/UserCardsContext";
import { BankCardSelectorBar } from "@/components/shopping/BankCardSelectorBar";
import { BankOfferBadge } from "@/components/shopping/BankOfferBadge";
import { CardApplicationModal } from "@/components/shopping/CardApplicationModal";
import { SUPPORTED_BANK_CARDS, type BankCardDefinition } from "@/lib/services/bank-offers";
import {
  US_CREDIT_CARDS,
  calculateBnplInstallments,
} from "@/lib/services/international-market";
import {
  Search,
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
  Sparkles,
  Bell,
  ChevronDown,
  ChevronUp,
  Truck,
  Award,
  CreditCard,
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
  const { formatPrice, isIndia, symbol } = useCurrency();

  const [searchResult, setSearchResult] = useState<MultiPlatformSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("All");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [priceRange, setPriceRange] = useState<PriceRangeOption>("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeShoprs, setActiveShoprs] = useState<string>("");

  // Comparison & Price History Modal state
  const [selectedProduct, setSelectedProduct] = useState<MultiPlatformProductItem | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [showSpotlightHistory, setShowSpotlightHistory] = useState(false);
  const [alertTargetProduct, setAlertTargetProduct] = useState<MultiPlatformProductItem | null>(null);
  const [cardModalTarget, setCardModalTarget] = useState<BankCardDefinition | null>(null);

  // Bank Card Intelligence
  const { selectedCardId, activeCard, getSavingsForOffer } = useUserCards();

  const openAlertFor = (product: MultiPlatformProductItem) => {
    setAlertTargetProduct(product);
    setIsAlertModalOpen(true);
  };

  // Reset activeShoprs when search query or URL changes
  useEffect(() => {
    setActiveShoprs("");
  }, [activeSearchParam]);

  // When search query, URL, or activeShoprs changes, fetch products
  useEffect(() => {
    const trimmed = activeSearchParam.trim();
    if (!trimmed) {
      setSearchResult(null);
      return;
    }

    let isMounted = true;
    setIsSearching(true);

    searchProductsAcrossPlatforms(trimmed, { shoprs: activeShoprs })
      .then((res) => {
        if (!isMounted) return;
        setSearchResult(res);
        // If it's a direct URL with only 1 product, automatically select it for deep inspection
        if (res.isDirectUrl && res.products.length === 1) {
          setSelectedProduct(res.products[0]);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        toast.error("Unable to search platforms. Please try again.");
      })
      .finally(() => {
        if (isMounted) setIsSearching(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeSearchParam, activeShoprs]);

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

  // Google Shopping & Carousel Filter Chips
  const quickFilters = useMemo(() => {
    if (!searchResult?.filters || searchResult.filters.length === 0) return [];
    const carousel = searchResult.filters.find((f) => f.type === "Carousel Filters");
    if (carousel && carousel.options.length > 0) {
      return carousel.options;
    }
    return searchResult.filters
      .flatMap((f) => f.options)
      .filter((opt, idx, self) => opt.text && self.findIndex((o) => o.text === opt.text) === idx)
      .slice(0, 16);
  }, [searchResult?.filters]);

  // Identify exact SKU match (if found)
  const exactMatchProduct = useMemo(() => {
    if (!searchResult) return null;
    if (searchResult.exactMatchProduct) return searchResult.exactMatchProduct;
    if (searchResult.products.length > 0 && searchResult.products[0].isExactSkuMatch) {
      return searchResult.products[0];
    }
    return null;
  }, [searchResult]);

  // Secondary products list (excluding exact match when in "All" platform view)
  const secondaryProducts = useMemo(() => {
    if (!exactMatchProduct || selectedPlatform !== "All") {
      return displayedProducts;
    }
    return displayedProducts.filter((p) => p.id !== exactMatchProduct.id);
  }, [displayedProducts, exactMatchProduct, selectedPlatform]);

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

      {/* Curved Transparent Top Banner */}
      <div className="relative w-full flex justify-center bg-transparent">
        <img
          src="/hero-top-banner.webp"
          alt="GoCoupon — Shop Smarter, Pay Less"
          className="w-full h-auto max-h-[130px] sm:max-h-[170px] md:max-h-[200px] lg:max-h-[230px] object-contain object-top"
          width={2048}
          height={252}
          loading="eager"
          fetchPriority="high"
        />
      </div>

      {/* Hero Search Section */}
      <section className="relative border-b border-border bg-gradient-to-b from-background via-background/95 to-muted/20 px-4 sm:px-6 pb-12 pt-10 sm:pt-14">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 font-mono text-xs uppercase tracking-[0.2em] text-primary">
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            Multi-Platform Price Search Engine
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
            Compare 500+ Stores &amp; Calculate True Landed Cost
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground text-balance">
            Our Instant Price Drop engine benchmarks Amazon, Flipkart, Walmart, Best Buy, and 500+ verified retailers with 4-tier stacked savings and 30-day deal honesty verification.
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
              Searching across top online stores…
            </h2>
            <p className="text-xs font-mono text-muted-foreground max-w-md mx-auto">
              Scanning live product listings, stock status, coupons, and discounts across supported retailers.
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
                    className="bg-transparent font-bold text-foreground rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer touch-manipulation"
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
                  <strong>Top Trusted Stores on Top:</strong> Showing verified listings from{" "}
                  {isIndia ? (
                    <>
                      <strong>Amazon</strong>, <strong>Flipkart</strong>, <strong>Croma</strong>, <strong>Myntra</strong> &amp; <strong>Tata CLiQ</strong>
                    </>
                  ) : (
                    <>
                      <strong>Amazon US</strong>, <strong>Walmart</strong>, <strong>Target</strong>, <strong>Best Buy</strong> &amp; <strong>eBay</strong>
                    </>
                  )}{" "}
                  first.
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>Verified Merchant Guarantee</span>
              </div>
            </div>

            {/* Bank Card & EMI / BNPL Intelligence Selector Bar */}
            <BankCardSelectorBar />

            {/* Platform & Price Range Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
              {/* Platforms */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground mr-1 flex items-center gap-1">
                  <Store className="h-3.5 w-3.5" /> Platform:
                </span>
                {(isIndia
                  ? ["All", "Amazon", "Flipkart", "Croma", "Myntra", "Meesho", "Tata CLiQ"]
                  : ["All", "Amazon US", "Walmart", "Target", "Best Buy", "eBay", "Newegg"]
                ).map((store) => (
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
                {(isIndia
                  ? [
                      { label: "All", value: "all" },
                      { label: "< ₹2k", value: "under-2k" },
                      { label: "₹2k - ₹10k", value: "2k-10k" },
                      { label: "₹10k - ₹50k", value: "10k-50k" },
                      { label: "> ₹50k", value: "above-50k" },
                    ]
                  : [
                      { label: "All", value: "all" },
                      { label: "< $25", value: "under-2k" },
                      { label: "$25 - $120", value: "2k-10k" },
                      { label: "$120 - $600", value: "10k-50k" },
                      { label: "> $600", value: "above-50k" },
                    ]
                ).map((range) => (
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

            {/* Live Google Shopping & Carousel Filter Chips */}
            {quickFilters.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
                <span className="text-xs font-mono text-muted-foreground shrink-0 flex items-center gap-1.5 font-semibold">
                  <Filter className="h-3.5 w-3.5 text-primary" /> Filter:
                </span>
                {activeShoprs && (
                  <button
                    type="button"
                    onClick={() => setActiveShoprs("")}
                    className="inline-flex items-center gap-1 rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive transition-colors shrink-0 hover:bg-destructive/20 cursor-pointer"
                  >
                    <X className="h-3 w-3" /> Clear Filter
                  </button>
                )}
                {quickFilters.map((opt) => {
                  const isSelected = activeShoprs === opt.shoprs || Boolean(opt.selected);
                  return (
                    <button
                      key={opt.shoprs || opt.text}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setActiveShoprs("");
                        } else {
                          setActiveShoprs(opt.shoprs);
                        }
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-medium transition-all shrink-0 touch-manipulation cursor-pointer ${
                        isSelected
                          ? "bg-primary text-primary-foreground font-bold shadow-xs scale-105"
                          : "border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Spotlight Exact Product Comparison Matrix (when exact match SKU is identified) */}
            {exactMatchProduct && selectedPlatform === "All" && (
              <section
                aria-label="Exact Product Match Spotlight"
                className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-card via-card to-emerald-500/5 p-5 sm:p-8 shadow-xl mb-10 transition-all"
              >
                {/* Ambient background glow accents */}
                <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

                {/* Top Verification Header */}
                <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4 mb-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Verified Exact Match</span>
                    </div>
                    <span className="rounded-full bg-muted/80 px-2.5 py-1 font-mono text-[11px] text-muted-foreground flex items-center gap-1">
                      <Store className="h-3 w-3" />
                      <span>Live Comparison Across {exactMatchProduct.offers.length} Verified Stores</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Live Out-of-Pocket Pricing</span>
                  </div>
                </div>

                {/* Spotlight Hero: Thumbnail + Specs & Best Price Callout */}
                <div className="relative grid gap-6 md:grid-cols-12 items-center mb-8">
                  {/* Thumbnail Column */}
                  <div className="md:col-span-4 lg:col-span-3 flex justify-center">
                    <div className="relative aspect-square w-full max-w-[240px] rounded-2xl bg-white p-3 border border-border/80 shadow-md flex items-center justify-center group overflow-hidden">
                      <ProductCardImg src={exactMatchProduct.imageUrl} alt={exactMatchProduct.title} />
                      {exactMatchProduct.discountPercent > 0 && (
                        <div className="absolute top-2.5 right-2.5 rounded-full bg-emerald-500 px-2.5 py-0.5 font-mono text-[10px] font-black text-white shadow-xs">
                          {exactMatchProduct.discountPercent}% OFF
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info Column */}
                  <div className="md:col-span-8 lg:col-span-9 space-y-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="rounded-md bg-primary/10 text-primary px-2.5 py-0.5 font-mono text-xs font-bold">
                          {exactMatchProduct.brand}
                        </span>
                        <span className="rounded-md bg-muted px-2.5 py-0.5 font-mono text-xs font-medium text-foreground">
                          {exactMatchProduct.category}
                        </span>
                        <span className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                          <Star className="h-3.5 w-3.5 fill-amber-500" />
                          {exactMatchProduct.rating.toFixed(1)}
                          <span className="text-muted-foreground font-normal">
                            ({exactMatchProduct.reviewCount.toLocaleString()}&nbsp;reviews)
                          </span>
                        </span>
                      </div>

                      <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground text-balance">
                        {exactMatchProduct.title}
                      </h2>
                    </div>

                    {/* Best Offer Callout Banner with Bank Card Intelligence */}
                    {(() => {
                      const offersWithBank = exactMatchProduct.offers.map((offer) => {
                        const bankSavings = getSavingsForOffer(
                          offer.storeName,
                          offer.price,
                          exactMatchProduct.category
                        );
                        const netCostWithCard = Math.max(
                          99,
                          offer.effectiveNetPrice - bankSavings.totalCardSavings
                        );
                        return {
                          ...offer,
                          bankSavings,
                          netCostWithCard,
                        };
                      });

                      // Sort dynamically by lowest net out-of-pocket price factoring in bank card
                      offersWithBank.sort((a, b) => a.netCostWithCard - b.netCostWithCard);

                      const lowestOffer = offersWithBank[0] || {
                        storeName: exactMatchProduct.primaryStore,
                        effectiveNetPrice: exactMatchProduct.price,
                        netCostWithCard: exactMatchProduct.price,
                        affiliateUrl: exactMatchProduct.directUrl,
                        couponCode: undefined,
                        bankSavings: getSavingsForOffer(
                          exactMatchProduct.primaryStore,
                          exactMatchProduct.price,
                          exactMatchProduct.category
                        ),
                      };

                      const maxSavings =
                        exactMatchProduct.originalPrice > lowestOffer.netCostWithCard
                          ? exactMatchProduct.originalPrice - lowestOffer.netCostWithCard
                          : 0;

                      const recommendedCard = isIndia
                        ? SUPPORTED_BANK_CARDS.find(
                            (c) => c.id === lowestOffer.bankSavings?.cardId
                          ) || SUPPORTED_BANK_CARDS[0]
                        : US_CREDIT_CARDS.find(
                            (c) => c.id === lowestOffer.bankSavings?.cardId
                          ) || US_CREDIT_CARDS[0];

                      return (
                        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                              Guaranteed Lowest Net Checkout Price:
                            </span>
                            <div className="flex flex-wrap items-baseline gap-2.5 mt-1">
                              <span className="font-display text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                {formatPrice(lowestOffer.netCostWithCard)}
                              </span>
                              {exactMatchProduct.originalPrice > lowestOffer.netCostWithCard && (
                                <span className="font-mono text-sm sm:text-base text-muted-foreground line-through tabular-nums">
                                  {formatPrice(exactMatchProduct.originalPrice)}
                                </span>
                              )}
                              {maxSavings > 0 && (
                                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                  Save {formatPrice(maxSavings)}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              <span className="text-xs text-foreground font-medium">
                                Live offer on <strong>{lowestOffer.storeName}</strong>
                              </span>
                              {lowestOffer.bankSavings && lowestOffer.bankSavings.totalCardSavings > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-primary/15 border border-primary/25 px-2 py-0.5 text-[11px] font-mono font-bold text-primary">
                                  <CreditCard className="h-3 w-3" />
                                  <span>
                                    Includes {formatPrice(lowestOffer.bankSavings.totalCardSavings)} off via{" "}
                                    {lowestOffer.bankSavings.bankName}
                                  </span>
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2.5">
                            {lowestOffer.bankSavings && lowestOffer.bankSavings.totalCardSavings > 0 && (
                              <button
                                type="button"
                                onClick={() => setCardModalTarget(recommendedCard)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-2.5 min-h-[44px] text-xs font-bold text-primary hover:bg-primary/20 transition-colors touch-manipulation focus-visible:ring-2 focus-visible:ring-primary"
                                title={`Apply for ${recommendedCard.cardName}`}
                              >
                                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                <span>Need {recommendedCard.shortName}? Apply</span>
                              </button>
                            )}

                            <button
                              type="button"
                              id="spotlight-set-alert-btn"
                              onClick={() => openAlertFor(exactMatchProduct)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2.5 min-h-[44px] text-xs font-bold text-foreground hover:bg-muted transition-colors touch-manipulation focus-visible:ring-2 focus-visible:ring-primary"
                            >
                              <Bell className="h-4 w-4 text-amber-500" />
                              <span>Set Price Alert</span>
                            </button>

                            <button
                              type="button"
                              id="spotlight-toggle-history-btn"
                              onClick={() => setShowSpotlightHistory(!showSpotlightHistory)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2.5 min-h-[44px] text-xs font-bold text-foreground hover:bg-muted transition-colors touch-manipulation focus-visible:ring-2 focus-visible:ring-primary"
                            >
                              <TrendingDown className="h-4 w-4 text-primary" />
                              <span>{showSpotlightHistory ? "Hide Chart" : "30-Day Trend"}</span>
                              {showSpotlightHistory ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>

                            <a
                              id="spotlight-best-deal-cta"
                              href={lowestOffer.affiliateUrl || exactMatchProduct.directUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 dark:bg-emerald-500 px-5 py-2.5 min-h-[44px] text-xs font-bold text-white shadow-md hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all touch-manipulation focus-visible:ring-2 focus-visible:ring-emerald-400"
                            >
                              <span>Buy on {lowestOffer.storeName}</span>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Inline 90-Day Price History Graph (Toggleable) */}
                {showSpotlightHistory && (
                  <div className="mb-8 rounded-2xl border border-border/80 bg-background/60 p-4 sm:p-6 backdrop-blur-xs transition-all">
                    <PriceHistoryChart
                      productId={exactMatchProduct.id}
                      productTitle={exactMatchProduct.title}
                      currentPrice={exactMatchProduct.price}
                      onSetAlertClick={() => openAlertFor(exactMatchProduct)}
                    />
                  </div>
                )}

                {/* Cross-Merchant Price Comparison Table */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                      <Award className="h-4 w-4 text-emerald-500" />
                      <span>Cross-Merchant Price Matrix ({exactMatchProduct.offers.length} Stores)</span>
                    </h3>
                    <span className="font-mono text-xs text-muted-foreground hidden sm:inline">
                      Net Price = List Price − Instant Coupon − Cashback
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-xs">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/40 font-mono text-[11px] text-muted-foreground uppercase">
                          <th className="py-3 px-4">Merchant Store</th>
                          <th className="py-3 px-4">Base Price</th>
                          <th className="py-3 px-4">Instant Coupon</th>
                          <th className="py-3 px-4">Bank Card Offer</th>
                          <th className="py-3 px-4">goCoupon Cashback</th>
                          <th className="py-3 px-4">Delivery Speed</th>
                          <th className="py-3 px-4 font-bold text-foreground">Final Net Cost</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {exactMatchProduct.offers.map((offer, idx) => {
                          const bankSavings = getSavingsForOffer(
                            offer.storeName,
                            offer.price,
                            exactMatchProduct.category
                          );
                          const netWithCard = Math.max(
                            99,
                            offer.effectiveNetPrice - bankSavings.totalCardSavings
                          );
                          const isBest = offer.isLowest || idx === 0;

                          return (
                            <tr
                              key={offer.storeId + idx}
                              className={`transition-colors ${
                                isBest
                                  ? "bg-emerald-500/5 dark:bg-emerald-950/25 font-medium"
                                  : "hover:bg-muted/30"
                              }`}
                            >
                              {/* Store Name & Logo */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2.5">
                                  <StoreLogoImg
                                    src={offer.storeLogo}
                                    alt={offer.storeName}
                                    className="h-6 w-6 object-contain shrink-0"
                                  />
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-foreground text-xs sm:text-sm">
                                        {offer.storeName}
                                      </span>
                                      {isBest && (
                                        <span className="rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase">
                                          Best Price
                                        </span>
                                      )}
                                    </div>
                                    <span className="font-mono text-[10px] text-muted-foreground">
                                      Verified Partner
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Base Price */}
                              <td className="py-3.5 px-4 font-mono tabular-nums text-muted-foreground">
                                {formatPrice(offer.price)}
                              </td>

                              {/* Coupon Code */}
                              <td className="py-3.5 px-4">
                                {offer.couponCode ? (
                                  <div className="inline-flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleCopy(offer.couponCode!)}
                                      title="Click to copy coupon code"
                                      className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-2 py-1 font-mono text-[11px] font-bold text-primary hover:bg-primary/10 transition-colors touch-manipulation focus-visible:ring-2 focus-visible:ring-primary"
                                    >
                                      {copiedCode === offer.couponCode ? (
                                        <Check className="h-3 w-3 text-emerald-500" />
                                      ) : (
                                        <Copy className="h-3 w-3" />
                                      )}
                                      <span>{offer.couponCode}</span>
                                    </button>
                                    {offer.couponSavings && offer.couponSavings > 0 ? (
                                      <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                        - {formatPrice(offer.couponSavings)}
                                      </span>
                                    ) : null}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-[11px] italic">No code needed</span>
                                )}
                              </td>

                              {/* Bank Card Offer */}
                              <td className="py-3.5 px-4">
                                {bankSavings.totalCardSavings > 0 ? (
                                  <BankOfferBadge
                                    savingsResult={bankSavings}
                                    productTitle={exactMatchProduct.title}
                                    size="small"
                                  />
                                ) : (
                                  <span className="text-muted-foreground font-mono text-[11px]">—</span>
                                )}
                              </td>

                              {/* Cashback */}
                              <td className="py-3.5 px-4">
                                {offer.cashbackAmount && offer.cashbackAmount > 0 ? (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                    + {formatPrice(offer.cashbackAmount)}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground font-mono text-[11px]">—</span>
                                )}
                              </td>

                              {/* Delivery */}
                              <td className="py-3.5 px-4">
                                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                  <Truck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                  <span>{offer.deliveryTime}</span>
                                </span>
                              </td>

                              {/* Effective Net Price */}
                              <td className="py-3.5 px-4">
                                <div>
                                  <span
                                    className={`font-display text-sm sm:text-base font-extrabold tabular-nums ${
                                      isBest ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                                    }`}
                                  >
                                    {formatPrice(netWithCard)}
                                  </span>
                                  {bankSavings.totalCardSavings > 0 && (
                                    <span className="font-mono text-[10px] text-muted-foreground block line-through">
                                      {formatPrice(offer.effectiveNetPrice)}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* CTA Action */}
                              <td className="py-3.5 px-4 text-right">
                                <a
                                  href={offer.affiliateUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 min-h-[36px] text-xs font-bold transition-colors touch-manipulation focus-visible:ring-2 ${
                                    isBest
                                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs focus-visible:ring-emerald-400"
                                      : "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 focus-visible:ring-primary"
                                  }`}
                                >
                                  <span>Shop</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {/* Product Cards Grid: Secondary or Standard Results */}
            {secondaryProducts.length > 0 ? (
              <div className="space-y-4">
                {exactMatchProduct && selectedPlatform === "All" && (
                  <div className="flex items-center justify-between border-b border-border pb-3 pt-2">
                    <h3 className="font-display text-base sm:text-lg font-bold text-foreground">
                      Other Models &amp; Related Products ({secondaryProducts.length})
                    </h3>
                    <span className="text-xs text-muted-foreground font-mono">
                      Explore alternative variants
                    </span>
                  </div>
                )}

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {secondaryProducts.map((product) => (
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

                          {/* Pricing Row with Bank Intelligence */}
                          {(() => {
                            const cardSavings = getSavingsForOffer(
                              product.primaryStore,
                              product.price,
                              product.category
                            );
                            const lowestOfferPrice = product.offers[0]?.effectiveNetPrice || product.price;
                            const netCardPrice = Math.max(99, lowestOfferPrice - cardSavings.totalCardSavings);

                            return (
                              <div>
                                <div className="mt-3 flex items-baseline gap-2">
                                  <span className="font-display text-xl font-bold text-foreground tabular-nums">
                                    {formatPrice(netCardPrice)}
                                  </span>
                                  {(product.originalPrice > netCardPrice || product.price > netCardPrice) && (
                                    <span className="font-mono text-xs text-muted-foreground line-through tabular-nums">
                                      {formatPrice(product.originalPrice || product.price)}
                                    </span>
                                  )}
                                </div>

                                {cardSavings.totalCardSavings > 0 && (
                                  <div className="mt-1.5 flex items-center gap-1.5">
                                    <BankOfferBadge
                                      savingsResult={cardSavings}
                                      productTitle={product.title}
                                      size="small"
                                    />
                                    <span className="font-mono text-[10px] text-muted-foreground">
                                      with card
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {/* Compared Stores Pill */}
                          <div className="mt-2 text-[11px] text-muted-foreground flex items-center justify-between">
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              Compared in {product.offers.length} stores
                            </span>
                            <span className="font-mono text-[10px]">
                              Lowest: {formatPrice(product.offers[0]?.effectiveNetPrice || product.price)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="mt-5 pt-3 border-t border-border flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedProduct(product)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/30 px-3 py-2 min-h-[38px] text-xs font-bold text-foreground hover:bg-primary/10 hover:border-primary/40 transition-colors touch-manipulation focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <Layers className="h-3.5 w-3.5 text-primary" />
                          <span>Compare Prices</span>
                        </button>

                        <a
                          href={product.directUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1 rounded-xl bg-primary px-3.5 py-2 min-h-[38px] text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors touch-manipulation focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <span>Buy</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : !exactMatchProduct ? (
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
            ) : null}
          </div>
        )}

        {/* Default Landing / Showcase when no search active */}
        {!isSearching && !searchResult && (
          <div className="space-y-12">
            {/* Quick Category Explorers */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-sm">
              <div className="text-center max-w-xl mx-auto">
                <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                  <Search className="h-3.5 w-3.5" />
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
                <h3 className="font-display text-base font-bold text-foreground">1. Universal Store Network</h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  We check Amazon, Flipkart, Walmart, Best Buy, Myntra, Croma, and 500+ direct brand stores in real time with zero sponsored bias.
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                  <Percent className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-bold text-foreground">2. 4-Tier True Landed Cost</h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  We automatically stack merchant discounts, auto-applied promo codes, instant bank card rebates, and cashback to show the true checkout cost.
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-bold text-foreground">3. 30-Day Deal Honesty Radar</h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  Exposes artificial pre-festival price hikes using moving baseline analytics and alerts you when a product is an authentic all-time bargain.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Comparison & 30-Day History Modal */}
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
                      {formatPrice(selectedProduct.offers[0]?.effectiveNetPrice || selectedProduct.price)}
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

                        {/* Coupons & Cashback & Bank Info */}
                        <div className="flex items-center gap-3 text-right">
                          {(() => {
                            const bankSavings = getSavingsForOffer(
                              offer.storeName,
                              offer.price,
                              selectedProduct.category
                            );
                            const netWithCard = Math.max(
                              99,
                              offer.effectiveNetPrice - bankSavings.totalCardSavings
                            );

                            return (
                              <div className="flex items-center gap-3">
                                {bankSavings.totalCardSavings > 0 && (
                                  <BankOfferBadge
                                    savingsResult={bankSavings}
                                    productTitle={selectedProduct.title}
                                    size="small"
                                  />
                                )}

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
                                    {formatPrice(netWithCard)}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}

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

              {/* 30-Day Interactive Price History Graph */}
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
        onClose={() => {
          setIsAlertModalOpen(false);
          setAlertTargetProduct(null);
        }}
        productId={alertTargetProduct?.id || selectedProduct?.id || "product"}
        productTitle={alertTargetProduct?.title || selectedProduct?.title || "Product"}
        productImage={alertTargetProduct?.imageUrl || selectedProduct?.imageUrl || "/gc-logo.webp"}
        currentPrice={alertTargetProduct?.price || selectedProduct?.price || 1499}
      />

      {/* Direct Card Application & Benefits Modal */}
      <CardApplicationModal
        isOpen={cardModalTarget !== null}
        onClose={() => setCardModalTarget(null)}
        card={cardModalTarget}
      />
    </SiteShell>
  );
}
