/**
 * @file compare.tsx
 * @description Real-time Multi-Platform Product Search & Cross-Store Price Comparison Matrix.
 * Clean, results-focused e-commerce layout with top search, sidebar filters, sorting, and side-by-side price breakdown.
 */

import { createLazyFileRoute, Link, useSearch, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema } from "@/lib/seo";
import { UrlResolverSearch } from "@/components/shopping/UrlResolverSearch";
import { PriceAlertModal } from "@/components/shopping/PriceAlertModal";
import { AdSenseSlot } from "@/components/ads/AdSenseSlot";
import { useLoadingBus } from "@/context/LoadingContext";
import {
  searchProductsAcrossPlatforms,
  getPlatformTrustRank,
  isTopTrustedPlatform,
  type MultiPlatformProductItem,
  type MultiPlatformSearchResult,
} from "@/lib/services/multi-platform-search";
import { useCurrency } from "@/context/CurrencyContext";
import { useUserCards } from "@/context/UserCardsContext";
import { BankOfferBadge } from "@/components/shopping/BankOfferBadge";
import { CardApplicationModal } from "@/components/shopping/CardApplicationModal";
import { SUPPORTED_BANK_CARDS, type BankCardDefinition } from "@/lib/services/bank-offers";
import { wrapAffiliateTracking } from "@/lib/services/store-registry";
import { US_CREDIT_CARDS } from "@/lib/services/international-market";
import { GroceryProductCard } from "@/open_food_fact/components/GroceryProductCard.js";
import type { FoodProductComparison } from "@/open_food_fact/types.js";
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
  Bell,
  Truck,
  Award,
  CreditCard,
  SlidersHorizontal,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createLazyFileRoute("/compare")({
  component: ComparePage,
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
          className || "h-5 w-5 text-[9px]"
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
      className={className || "h-5 w-5 object-contain"}
      onError={() => setError(true)}
    />
  );
}

function ProductCardImg({
  src,
  alt,
  category,
}: {
  src?: string;
  alt: string;
  category?: string;
}) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const altLower = (alt || "").toLowerCase();
  const catLower = (category || "").toLowerCase();
  const isPhone =
    catLower.includes("smartphone") ||
    catLower.includes("mobile") ||
    catLower.includes("phone") ||
    altLower.includes("phone") ||
    altLower.includes("5g") ||
    altLower.includes("vivo") ||
    altLower.includes("iphone") ||
    altLower.includes("samsung") ||
    altLower.includes("pixel") ||
    altLower.includes("redmi") ||
    altLower.includes("oneplus") ||
    altLower.includes("realme");
  const isLaptop =
    catLower.includes("laptop") ||
    catLower.includes("computer") ||
    altLower.includes("laptop") ||
    altLower.includes("macbook") ||
    altLower.includes("thinkpad");
  const isAudio =
    catLower.includes("audio") ||
    catLower.includes("headphone") ||
    altLower.includes("headphone") ||
    altLower.includes("earphone") ||
    altLower.includes("airpods") ||
    altLower.includes("airdopes");
  const isWatch =
    catLower.includes("watch") ||
    altLower.includes("smartwatch") ||
    altLower.includes("fitbit");
  const isJeans =
    altLower.includes("jean") ||
    altLower.includes("denim") ||
    catLower.includes("jean") ||
    catLower.includes("denim");
  const isFootwear =
    catLower.includes("footwear") ||
    catLower.includes("shoe") ||
    altLower.includes("shoe") ||
    altLower.includes("sneaker") ||
    altLower.includes("sandal") ||
    altLower.includes("boot");
  const isFashion =
    catLower.includes("fashion") ||
    catLower.includes("apparel") ||
    catLower.includes("clothing") ||
    altLower.includes("shirt") ||
    altLower.includes("t-shirt") ||
    altLower.includes("tshirt") ||
    altLower.includes("hoodie") ||
    altLower.includes("jacket") ||
    altLower.includes("pant") ||
    altLower.includes("trouser") ||
    altLower.includes("dress") ||
    altLower.includes("kurta");
  const isBeauty =
    catLower.includes("beauty") ||
    catLower.includes("personal care") ||
    altLower.includes("serum") ||
    altLower.includes("cream") ||
    altLower.includes("lotion") ||
    altLower.includes("sunscreen") ||
    altLower.includes("shampoo") ||
    altLower.includes("facewash");
  const isCamera =
    catLower.includes("camera") ||
    altLower.includes("camera") ||
    altLower.includes("polaroid") ||
    altLower.includes("dslr");

  let fallbackUrl =
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&auto=format&fit=crop&q=80";
  if (isJeans) {
    fallbackUrl =
      "https://images.unsplash.com/photo-1542272604-780c96856592?w=600&auto=format&fit=crop&q=80";
  } else if (isFootwear) {
    fallbackUrl =
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80";
  } else if (isFashion) {
    fallbackUrl =
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80";
  } else if (isBeauty) {
    fallbackUrl =
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80";
  } else if (isPhone) {
    fallbackUrl = altLower.includes("iphone")
      ? "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80"
      : "https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=600&auto=format&fit=crop&q=80";
  } else if (isLaptop) {
    fallbackUrl =
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80";
  } else if (isAudio) {
    fallbackUrl =
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80";
  } else if (isWatch) {
    fallbackUrl =
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";
  }

  // Reject old stale camera fallback if not a camera
  const isStaleCameraFallback =
    imgSrc && imgSrc.includes("photo-1526170375885-4d8ecf77b99f") && !isCamera;
  const isStaleWatchFallback =
    imgSrc && imgSrc.includes("photo-1523275335684-37898b6baf30") && !isWatch;

  const effectiveSrc =
    !imgSrc || hasError || isStaleCameraFallback || isStaleWatchFallback
      ? fallbackUrl
      : imgSrc;

  return (
    <img
      src={effectiveSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}

export function ComparePage() {
  const navigate = useNavigate();
  const { q, url } = useSearch({ from: "/compare" });
  const activeSearchParam = url || q || "";
  const { formatPrice, isIndia, symbol } = useCurrency();
  const { startLoading } = useLoadingBus();

  const [searchResult, setSearchResult] = useState<MultiPlatformSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Filter & Sorting State
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [minPriceInput, setMinPriceInput] = useState<string>("");
  const [maxPriceInput, setMaxPriceInput] = useState<string>("");
  const [brandSearch, setBrandSearch] = useState<string>("");
  const [priceRange, setPriceRange] = useState<PriceRangeOption>("all");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeShoprs, setActiveShoprs] = useState<string>("");

  // Comparison & Price History Modal state
  const [selectedProduct, setSelectedProduct] = useState<MultiPlatformProductItem | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertTargetProduct, setAlertTargetProduct] = useState<MultiPlatformProductItem | null>(null);
  const [cardModalTarget, setCardModalTarget] = useState<BankCardDefinition | null>(null);
  const [foodComparison, setFoodComparison] = useState<FoodProductComparison | null>(null);

  // Bank Card Intelligence
  const {
    selectedCardId,
    setSelectedCardId,
    isCardDiscountApplied,
    setCardDiscountApplied,
    allCards,
    getSavingsForOffer,
  } = useUserCards();

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
      setFoodComparison(null);
      setSearchError(null);
      return;
    }

    let isMounted = true;
    setIsSearching(true);
    setSearchError(null);
    const stopLoading = startLoading("compare-search");

    // Check Open Food Facts if search query is a barcode
    const isBarcode = /^[0-9]{8,14}$/.test(trimmed.replace(/[-\s]/g, ""));
    if (isBarcode) {
      const cleanBarcode = trimmed.replace(/[^0-9]/g, "");
      fetch(`/api/open-food-fact/compare/${cleanBarcode}`)
        .then((r) => r.json())
        .then((data) => {
          if (isMounted && data.success && data.data) {
            setFoodComparison(data.data);
          } else if (isMounted) {
            setFoodComparison(null);
          }
        })
        .catch(() => {
          if (isMounted) setFoodComparison(null);
        });
    } else {
      setFoodComparison(null);
    }

    searchProductsAcrossPlatforms(trimmed, { shoprs: activeShoprs })
      .then((res) => {
        if (!isMounted) return;
        setSearchResult(res);
        setSearchError(null);
        if (res.isDirectUrl && res.products.length === 1) {
          setSelectedProduct(res.products[0]);
        }
      })
      .catch((err) => {
        console.error("Platform comparison search error:", err);
        if (!isMounted) return;
        setSearchError(
          err?.message || "Unable to retrieve price comparisons. Please check your network connection and try again."
        );
        setSearchResult({
          query: trimmed,
          products: [],
          availableStores: [],
          totalFound: 0,
          lowestOverallPrice: 0,
          highestOverallSavings: 0,
          isDirectUrl: false,
        });
      })
      .finally(() => {
        if (isMounted) setIsSearching(false);
        stopLoading();
      });

    return () => {
      isMounted = false;
      stopLoading();
    };
  }, [activeSearchParam, activeShoprs, startLoading, retryCount]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    toast.success(`Copied coupon: ${code}`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const allProducts = searchResult?.products || [];

  // Dynamic Price bounds for sliders/inputs
  const priceBounds = useMemo(() => {
    if (allProducts.length === 0) return { min: 0, max: 100000 };
    let min = Infinity;
    let max = -Infinity;
    for (const p of allProducts) {
      if (p.price < min) min = p.price;
      if (p.price > max) max = p.price;
    }
    return {
      min: min === Infinity ? 0 : Math.floor(min),
      max: max === -Infinity ? 100000 : Math.ceil(max),
    };
  }, [allProducts]);

  // Dynamic Stores list with counts
  const availableStoresWithCount = useMemo(() => {
    if (allProducts.length === 0) return [];
    const counts: Record<string, number> = {};
    for (const p of allProducts) {
      if (p.primaryStore) {
        counts[p.primaryStore] = (counts[p.primaryStore] || 0) + 1;
      }
      for (const o of p.offers) {
        if (o.storeName && o.storeName !== p.primaryStore) {
          counts[o.storeName] = (counts[o.storeName] || 0) + 1;
        }
      }
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [allProducts]);

  // Dynamic Brands list with counts
  const availableBrandsWithCount = useMemo(() => {
    if (allProducts.length === 0) return [];
    const counts: Record<string, number> = {};
    for (const p of allProducts) {
      const b = p.brand?.trim();
      if (b && b !== "Generic" && b !== "Various" && b.length > 1) {
        counts[b] = (counts[b] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [allProducts]);

  const filteredBrands = useMemo(() => {
    if (!brandSearch.trim()) return availableBrandsWithCount;
    const lower = brandSearch.toLowerCase();
    return availableBrandsWithCount.filter((b) => b.name.toLowerCase().includes(lower));
  }, [availableBrandsWithCount, brandSearch]);

  const togglePlatform = (storeName: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(storeName)
        ? prev.filter((s) => s !== storeName)
        : [...prev, storeName]
    );
  };

  const toggleBrand = (brandName: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandName)
        ? prev.filter((b) => b !== brandName)
        : [...prev, brandName]
    );
  };

  const applyPriceFilter = () => {
    const minVal = minPriceInput ? Number(minPriceInput) : null;
    const maxVal = maxPriceInput ? Number(maxPriceInput) : null;
    setMinPrice(minVal);
    setMaxPrice(maxVal);
    setPriceRange("all");
  };

  const resetFilters = () => {
    setSelectedPlatforms([]);
    setSelectedBrands([]);
    setMinPrice(null);
    setMaxPrice(null);
    setMinPriceInput("");
    setMaxPriceInput("");
    setPriceRange("all");
    setActiveShoprs("");
    setBrandSearch("");
  };

  const activeFilterCount =
    (selectedPlatforms.length > 0 ? selectedPlatforms.length : 0) +
    (selectedBrands.length > 0 ? selectedBrands.length : 0) +
    (minPrice !== null || maxPrice !== null || priceRange !== "all" ? 1 : 0) +
    (activeShoprs ? 1 : 0);

  // Filter and sort products
  const displayedProducts = useMemo(() => {
    if (!searchResult) return [];
    let list = [...searchResult.products];

    // 1. Platform Filter
    if (selectedPlatforms.length > 0) {
      list = list.filter((p) =>
        selectedPlatforms.some((sp) => {
          const spLower = sp.toLowerCase();
          return (
            p.primaryStore.toLowerCase().includes(spLower) ||
            p.offers.some((o) => o.storeName.toLowerCase().includes(spLower))
          );
        })
      );
    }

    // 2. Brand Filter
    if (selectedBrands.length > 0) {
      list = list.filter((p) =>
        selectedBrands.some((sb) => p.brand?.toLowerCase() === sb.toLowerCase())
      );
    }

    // 3. Custom Min / Max Price Filter
    if (minPrice !== null && minPrice > 0) {
      list = list.filter((p) => p.price >= minPrice);
    }
    if (maxPrice !== null && maxPrice > 0) {
      list = list.filter((p) => p.price <= maxPrice);
    }

    // 4. Preset Price Range Filter
    if (priceRange === "under-2k") {
      list = list.filter((p) => p.price < (isIndia ? 2000 : 25));
    } else if (priceRange === "2k-10k") {
      list = list.filter((p) =>
        isIndia ? p.price >= 2000 && p.price <= 10000 : p.price >= 25 && p.price <= 120
      );
    } else if (priceRange === "10k-50k") {
      list = list.filter((p) =>
        isIndia ? p.price >= 10000 && p.price <= 50000 : p.price >= 120 && p.price <= 600
      );
    } else if (priceRange === "above-50k") {
      list = list.filter((p) => p.price > (isIndia ? 50000 : 600));
    }

    // 5. Sorting
    if (sortBy === "relevance") {
      list.sort((a, b) => {
        if (a.isExactSkuMatch && !b.isExactSkuMatch) return -1;
        if (!a.isExactSkuMatch && b.isExactSkuMatch) return 1;
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
      list.sort(
        (a, b) =>
          b.discountPercent - a.discountPercent ||
          b.maxSavingsVsOriginal - a.maxSavingsVsOriginal
      );
    }

    return list;
  }, [
    searchResult,
    selectedPlatforms,
    selectedBrands,
    minPrice,
    maxPrice,
    priceRange,
    sortBy,
    isIndia,
  ]);

  // Google Shopping Carousel Filter Chips
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

  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Compare & Search", path: "/compare" },
    ...(activeSearchParam
      ? [
          {
            name: `Results for "${activeSearchParam.slice(0, 25)}"`,
            path: `/compare?q=${encodeURIComponent(activeSearchParam)}`,
          },
        ]
      : []),
  ]);

  // Render Filters Sidebar content (reused in desktop sidebar and mobile drawer)
  const renderFiltersContent = () => (
    <div className="space-y-6 text-foreground">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <span className="font-display text-sm font-bold tracking-tight">Filters</span>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-primary/15 text-primary text-[10px] font-bold px-2 py-0.5">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Price Range Section */}
      <div className="space-y-3 pb-5 border-b border-border">
        <h4 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Price Range
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-mono text-muted-foreground block mb-1">
              Min Price
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {symbol}
              </span>
              <input
                type="number"
                placeholder={String(priceBounds.min || 0)}
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyPriceFilter()}
                className="w-full rounded-lg border border-border bg-background py-1.5 pl-6 pr-2 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-mono text-muted-foreground block mb-1">
              Max Price
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {symbol}
              </span>
              <input
                type="number"
                placeholder={String(priceBounds.max || 100000)}
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyPriceFilter()}
                className="w-full rounded-lg border border-border bg-background py-1.5 pl-6 pr-2 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={applyPriceFilter}
          className="w-full rounded-lg bg-muted hover:bg-muted/80 py-1.5 text-xs font-bold text-foreground transition-colors cursor-pointer"
        >
          Apply Price
        </button>

        {/* Quick Range Presets */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            { label: "All", value: "all" },
            { label: isIndia ? "< ₹2k" : "< $25", value: "under-2k" },
            { label: isIndia ? "₹2k-10k" : "$25-$120", value: "2k-10k" },
            { label: isIndia ? "₹10k-50k" : "$120-$600", value: "10k-50k" },
            { label: isIndia ? "> ₹50k" : "> $600", value: "above-50k" },
          ].map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => {
                setPriceRange(preset.value as PriceRangeOption);
                setMinPrice(null);
                setMaxPrice(null);
                setMinPriceInput("");
                setMaxPriceInput("");
              }}
              className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                priceRange === preset.value && minPrice === null && maxPrice === null
                  ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stores & Platforms Section */}
      {availableStoresWithCount.length > 0 && (
        <div className="space-y-2.5 pb-5 border-b border-border">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Stores ({availableStoresWithCount.length})
            </h4>
            {selectedPlatforms.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedPlatforms([])}
                className="text-[10px] font-semibold text-primary hover:underline lowercase cursor-pointer"
              >
                reset
              </button>
            )}
          </div>
          <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
            {availableStoresWithCount.map((store) => {
              const isChecked = selectedPlatforms.includes(store.name);
              return (
                <label
                  key={store.name}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-muted/50 cursor-pointer select-none transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => togglePlatform(store.name)}
                      className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                    <span
                      className={`truncate text-xs ${
                        isChecked ? "font-bold text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {store.name}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                    ({store.count})
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Brands Section */}
      {availableBrandsWithCount.length > 0 && (
        <div className="space-y-2.5 pb-5 border-b border-border">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Brands ({availableBrandsWithCount.length})
            </h4>
            {selectedBrands.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedBrands([])}
                className="text-[10px] font-semibold text-primary hover:underline lowercase cursor-pointer"
              >
                reset
              </button>
            )}
          </div>

          {availableBrandsWithCount.length > 5 && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search brands…"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-1 pl-7 pr-2 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          )}

          <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
            {filteredBrands.map((brand) => {
              const isChecked = selectedBrands.includes(brand.name);
              return (
                <label
                  key={brand.name}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-muted/50 cursor-pointer select-none transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleBrand(brand.name)}
                      className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                    <span
                      className={`truncate text-xs ${
                        isChecked ? "font-bold text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {brand.name}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                    ({brand.count})
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Bank Card Savings Intelligence Helper */}
      <div className="rounded-2xl border border-border/80 bg-muted/20 p-3.5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <CreditCard className="h-4 w-4 text-primary shrink-0" />
            <div>
              <span className="text-xs font-bold text-foreground block">
                Bank Card Savings
              </span>
              <span className="text-[10px] text-muted-foreground">
                {isCardDiscountApplied ? "Enabled on prices" : "Off by default"}
              </span>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isCardDiscountApplied}
            onClick={() => setCardDiscountApplied(!isCardDiscountApplied)}
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer ${
              isCardDiscountApplied
                ? "bg-emerald-600 text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {isCardDiscountApplied ? "ON" : "OFF"}
          </button>
        </div>

        {isCardDiscountApplied && (
          <div className="pt-2 border-t border-border/50">
            <label className="text-[10px] font-mono text-muted-foreground block mb-1">
              Select Specific Card:
            </label>
            <select
              value={selectedCardId}
              onChange={(e) => setSelectedCardId(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-1 px-2 text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
            >
              <option value="none">Standard Price (No Card)</option>
              <option value="all">Best Available Deal (Any Card)</option>
              {allCards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.shortName} ({Math.round(card.defaultCashbackPct * 100)}% off)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* Top Search Bar (Clean, Centered, E-Commerce Style — Hero Banner & Marketing text removed) */}
      <div className="border-b border-border bg-background/95 backdrop-blur-md px-4 py-3 sm:py-4 shadow-2xs">
        <div className="mx-auto max-w-4xl">
          <UrlResolverSearch
            size="default"
            showTrustBadges={false}
            showPopularChips={false}
            initialQuery={activeSearchParam}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
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
              Scanning live product listings, stock status, coupons, and discounts across Amazon,
              Flipkart, Croma, Reliance Digital, and partner stores.
            </p>
          </div>
        )}

        {/* Results View */}
        {!isSearching && searchResult && (
          <div className="space-y-4">
            {/* Top Results Header: Query, Count, Mobile Filter Trigger & Sort Dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
              <div>
                <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                  Search Results for &ldquo;{searchResult.query}&rdquo;
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5 inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Found {displayedProducts.length} items across {availableStoresWithCount.length || searchResult.availableStores.length} stores
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                {/* Mobile Filter Drawer Trigger */}
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className="md:hidden inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <Filter className="h-3.5 w-3.5 text-primary" />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.2">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs">
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground font-medium">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-transparent font-bold text-foreground focus-visible:outline-none cursor-pointer"
                  >
                    <option value="relevance" className="bg-card text-foreground">
                      Popularity / Best Match
                    </option>
                    <option value="price-asc" className="bg-card text-foreground">
                      Price: Low to High
                    </option>
                    <option value="price-desc" className="bg-card text-foreground">
                      Price: High to Low
                    </option>
                    <option value="rating" className="bg-card text-foreground">
                      Customer Rating
                    </option>
                    <option value="savings" className="bg-card text-foreground">
                      Biggest Discount
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filter Chips Bar */}
            {(activeFilterCount > 0 || activeShoprs) && (
              <div className="flex flex-wrap items-center gap-2 py-1">
                <span className="text-xs font-mono text-muted-foreground">Active filters:</span>
                {selectedPlatforms.map((store) => (
                  <span
                    key={store}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary"
                  >
                    <span>{store}</span>
                    <button
                      type="button"
                      onClick={() => togglePlatform(store)}
                      className="hover:text-destructive cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {selectedBrands.map((brand) => (
                  <span
                    key={brand}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary"
                  >
                    <span>{brand}</span>
                    <button
                      type="button"
                      onClick={() => toggleBrand(brand)}
                      className="hover:text-destructive cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {(minPrice !== null || maxPrice !== null) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    <span>
                      {symbol}
                      {minPrice || 0} - {symbol}
                      {maxPrice || "max"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setMinPrice(null);
                        setMaxPrice(null);
                        setMinPriceInput("");
                        setMaxPriceInput("");
                      }}
                      className="hover:text-destructive cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {priceRange !== "all" && minPrice === null && maxPrice === null && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    <span>Price: {priceRange}</span>
                    <button
                      type="button"
                      onClick={() => setPriceRange("all")}
                      className="hover:text-destructive cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {activeShoprs && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    <span>Filter: {activeShoprs}</span>
                    <button
                      type="button"
                      onClick={() => setActiveShoprs("")}
                      className="hover:text-destructive cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-muted-foreground hover:text-foreground font-semibold underline ml-1 cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Quick Carousel Filter Chips (from SearXNG / Google Shopping) */}
            {quickFilters.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
                <span className="text-xs font-mono text-muted-foreground shrink-0 flex items-center gap-1">
                  <Tag className="h-3 w-3 text-primary" /> Popular:
                </span>
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
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all shrink-0 cursor-pointer ${
                        isSelected
                          ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                          : "border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Main 2-Column E-Commerce Layout: Sidebar Filters + Products Grid */}
            <div className="flex items-start gap-8 pt-2">
              {/* Left Sidebar (Desktop) */}
              <aside className="hidden md:block w-64 lg:w-72 shrink-0 sticky top-24 rounded-3xl border border-border bg-card p-5 shadow-xs">
                {renderFiltersContent()}
              </aside>

              {/* Right Content Area */}
              <main className="flex-1 min-w-0 space-y-6">
                {/* Open Food Facts Barcode & Grocery Intelligence Matrix (if barcode search) */}
                {foodComparison && (
                  <div className="mb-6">
                    <GroceryProductCard comparison={foodComparison} />
                  </div>
                )}

                {/* Compact Top Verified Exact Match Highlight (if identified) */}
                {exactMatchProduct && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span className="font-medium text-foreground truncate">
                        Lowest price for <strong>{exactMatchProduct.title}</strong> is{" "}
                        <strong className="text-emerald-600 dark:text-emerald-400 font-display">
                          {formatPrice(exactMatchProduct.price)}
                        </strong>{" "}
                        on <strong>{exactMatchProduct.primaryStore}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(exactMatchProduct)}
                      className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer shrink-0"
                    >
                      <span>Compare all {exactMatchProduct.offers.length} stores</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* Product Cards Grid */}
                {displayedProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                    {displayedProducts.map((product) => (
                      <article
                        key={product.id}
                        className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-xs transition-all duration-200 hover:shadow-md hover:border-primary/40"
                      >
                        <div>
                          {/* Product Image Area */}
                          <div
                            role="button"
                            tabIndex={0}
                            aria-label={`View price comparison for ${product.title}`}
                            onClick={() => setSelectedProduct(product)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelectedProduct(product);
                              }
                            }}
                            className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted/20 p-3 flex items-center justify-center cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-primary"
                          >
                            <ProductCardImg
                              src={product.imageUrl}
                              alt={product.title}
                              category={product.category}
                            />

                            {/* Store Badge */}
                            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-md bg-background/90 backdrop-blur-md px-2 py-0.5 text-[11px] font-bold text-foreground border border-border/70 shadow-2xs">
                              <StoreLogoImg
                                src={product.primaryStoreLogo}
                                alt={product.primaryStore}
                                className="h-3.5 w-3.5 object-contain"
                              />
                              <span>{product.primaryStore}</span>
                            </div>

                            {/* Discount Badge */}
                            {product.discountPercent > 0 && (
                              <div className="absolute top-2.5 right-2.5 rounded-md bg-emerald-500 text-white font-mono font-bold text-[10px] px-1.5 py-0.5 shadow-2xs">
                                {product.discountPercent}% OFF
                              </div>
                            )}

                            {/* Exact Match / Top Trusted Badge */}
                            {product.isExactSkuMatch ? (
                              <div className="absolute bottom-2.5 left-2.5 rounded-md bg-emerald-600 text-white font-mono font-bold text-[9px] px-1.5 py-0.5 flex items-center gap-1 shadow-2xs">
                                <CheckCircle2 className="h-2.5 w-2.5" /> Exact Match
                              </div>
                            ) : isTopTrustedPlatform(product.primaryStore) ? (
                              <div className="absolute bottom-2.5 left-2.5 rounded-md bg-amber-500 text-amber-950 font-bold text-[9px] px-1.5 py-0.5 flex items-center gap-1 shadow-2xs">
                                <ShieldCheck className="h-2.5 w-2.5" /> Top Store
                              </div>
                            ) : null}
                          </div>

                          {/* Product Details */}
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span className="font-mono text-[10px] font-bold text-primary uppercase truncate max-w-[120px]">
                                {product.brand || product.category}
                              </span>
                              <div className="flex items-center gap-1 text-amber-500 font-bold text-[11px]">
                                <Star className="h-3 w-3 fill-amber-500" />
                                <span>{product.rating.toFixed(1)}</span>
                                {product.reviewCount > 0 && (
                                  <span className="text-muted-foreground font-normal">
                                    ({product.reviewCount})
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Product Title */}
                            <h3
                              role="button"
                              tabIndex={0}
                              onClick={() => setSelectedProduct(product)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setSelectedProduct(product);
                                }
                              }}
                              title={product.title}
                              className="font-display text-sm font-semibold text-foreground line-clamp-2 leading-snug cursor-pointer hover:text-primary transition-colors min-h-[2.5rem] focus:outline-hidden focus:underline"
                            >
                              {product.title}
                            </h3>

                            {/* Price Line */}
                            <div className="mt-2.5 flex items-baseline gap-2">
                              <span className="font-display text-lg sm:text-xl font-bold text-foreground tabular-nums">
                                {formatPrice(product.price)}
                              </span>
                              {product.originalPrice > product.price && (
                                <span className="font-mono text-xs text-muted-foreground line-through tabular-nums">
                                  {formatPrice(product.originalPrice)}
                                </span>
                              )}
                            </div>

                            {/* Bank Offer Note (if active) */}
                            {(() => {
                              const cardSavings = getSavingsForOffer(
                                product.primaryStore,
                                product.price,
                                product.category
                              );
                              if (cardSavings.totalCardSavings > 0) {
                                return (
                                  <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                    <CreditCard className="h-3 w-3 shrink-0" />
                                    <span className="truncate">
                                      Save {formatPrice(cardSavings.totalCardSavings)} with card
                                    </span>
                                  </div>
                                );
                              }
                              return null;
                            })()}

                            {/* Multi-Store Comparison Indicator */}
                            <div className="mt-2 text-[11px] text-muted-foreground flex items-center justify-between border-t border-border/50 pt-2">
                              <span className="text-muted-foreground font-medium">
                                {product.offers.length > 1
                                  ? `Compared in ${product.offers.length} stores`
                                  : `Available on ${product.primaryStore}`}
                              </span>
                              {product.offers.length > 1 && (
                                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">
                                  Lowest: {formatPrice(product.offers[0]?.effectiveNetPrice || product.price)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Card Buttons: Compare Stores & Buy Now */}
                        <div className="mt-4 pt-2.5 border-t border-border flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedProduct(product)}
                            className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl border border-border bg-muted/40 hover:bg-primary/10 hover:border-primary/40 px-2.5 py-2 text-xs font-bold text-foreground transition-colors cursor-pointer"
                            title="View cross-store price comparison"
                          >
                            <Layers className="h-3.5 w-3.5 text-primary" />
                            <span>Compare</span>
                          </button>

                          <a
                            href={wrapAffiliateTracking(product.directUrl, "gocoupon_compare_grid")}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-primary hover:bg-primary/90 px-3 py-2 text-xs font-bold text-primary-foreground shadow-2xs transition-colors"
                          >
                            <span>Buy Now</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : searchError ? (
                  <div className="rounded-3xl border border-rose-500/30 bg-rose-500/5 p-10 sm:p-12 text-center max-w-lg mx-auto animate-in fade-in duration-200">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mb-3">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-foreground">
                      Unable to Load Comparisons
                    </h3>
                    <p className="mt-1.5 text-xs text-muted-foreground max-w-md mx-auto">
                      {searchError}
                    </p>
                    <div className="mt-5 flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setRetryCount((c) => c + 1)}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Retry Search</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center max-w-lg mx-auto">
                    <Filter className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <h3 className="font-display text-lg font-bold text-foreground">
                      No matching products found
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Try adjusting your store or brand filters, or clear price limits.
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
                      >
                        Reset All Filters
                      </button>
                      {searchResult?.query &&
                        searchResult.query.split(/[\(\[\-\|]/)[0].trim() !== searchResult.query && (
                          <button
                            type="button"
                            onClick={() => {
                              resetFilters();
                              const simplified = searchResult.query.split(/[\(\[\-\|]/)[0].trim();
                              if (simplified) {
                                navigate({
                                  to: "/compare",
                                  search: { q: simplified } as unknown as Record<string, string>,
                                });
                              }
                            }}
                            className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors"
                          >
                            Search &ldquo;{searchResult.query.split(/[\(\[\-\|]/)[0].trim()}&rdquo; instead
                          </button>
                        )}
                    </div>
                  </div>
                )}
              </main>
            </div>
          </div>
        )}

        {/* Default Landing / Showcase when no search query active */}
        {!isSearching && !searchResult && (
          <div className="space-y-10 py-6">
            {/* Quick Popular Comparison Suggestions */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-xs">
              <div className="text-center max-w-xl mx-auto">
                <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                  <Search className="h-3.5 w-3.5" />
                  Popular Comparisons
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                  Compare Top Products in India
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Type any product above or pick a trending comparison to see real-time prices across
                  Amazon, Flipkart, Croma, and more.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-2.5">
                {[
                  "iPhone 16",
                  "iPhone 15",
                  "Sony WH-1000XM5",
                  "MacBook Air M3",
                  "Samsung Galaxy S24",
                  "boAt Airdopes",
                  "OnePlus 12R",
                  "PlayStation 5",
                  "iPad 10th Gen",
                  "Noise Smartwatch",
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
                <h3 className="font-display text-base font-bold text-foreground">
                  1. Universal Store Network
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  We check Amazon, Flipkart, Croma, Reliance Digital, and direct brand stores in real
                  time with zero sponsored bias.
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                  <Percent className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-bold text-foreground">
                  2. True Landed Cost
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  We calculate merchant discounts, auto-applied promo codes, and bank card rebates to
                  show your true checkout price.
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-bold text-foreground">
                  3. Price Drop Alerts
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  Set a target price and get notified instantly when your favorite product drops to an
                  all-time low.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-xs"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <div className="relative ml-auto h-full w-full max-w-xs bg-card border-l border-border p-5 shadow-2xl overflow-y-auto z-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <span className="font-display text-base font-bold text-foreground flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" /> Filter Results
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {renderFiltersContent()}
            </div>
            <div className="pt-4 border-t border-border mt-6">
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-sm"
              >
                View {displayedProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Comparison Modal (Side-by-side store pricing matrix) */}
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
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-white p-1 border border-border shrink-0 overflow-hidden flex items-center justify-center">
                  <ProductCardImg
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.title}
                    category={selectedProduct.category}
                  />
                </div>
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
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
              {/* Best Deal Banner */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                    Lowest Net Price Available:
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {formatPrice(
                        selectedProduct.offers[0]?.effectiveNetPrice || selectedProduct.price
                      )}
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      on {selectedProduct.offers[0]?.storeName || selectedProduct.primaryStore}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openAlertFor(selectedProduct)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-background px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    <span>Set Price Alert</span>
                  </button>

                  <a
                    href={wrapAffiliateTracking(
                      selectedProduct.offers[0]?.affiliateUrl || selectedProduct.directUrl,
                      "gocoupon_compare_modal_top"
                    )}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
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
                              <span className="font-bold text-xs sm:text-sm text-foreground">
                                {offer.storeName}
                              </span>
                              {offer.isLowest && (
                                <span className="rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 font-mono text-[9px] font-bold">
                                  BEST PRICE
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-muted-foreground block">
                              {offer.deliveryTime}
                            </span>
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
                                    className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-background px-2 py-1 text-[10px] font-mono font-bold text-primary hover:border-primary transition-colors cursor-pointer"
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
                                  <span className="font-mono text-[10px] text-muted-foreground block">
                                    Net Cost:
                                  </span>
                                  <span className="font-display text-base sm:text-lg font-bold text-foreground tabular-nums">
                                    {formatPrice(netWithCard)}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}

                          <a
                            href={wrapAffiliateTracking(offer.affiliateUrl, "gocoupon_compare_modal_row")}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
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

              {/* Price Drop Alert Callout & Sponsor */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl border border-border/80 bg-muted/40">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Waiting for a price drop?</p>
                      <p className="text-[11px] text-muted-foreground">
                        Get notified immediately when prices drop across verified stores.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openAlertFor(selectedProduct)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
                  >
                    <Bell className="h-3.5 w-3.5" />
                    <span>Set Alert</span>
                  </button>
                </div>
                <AdSenseSlot format="card-affiliate" className="mt-4" />
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
        productImage={
          alertTargetProduct?.imageUrl || selectedProduct?.imageUrl || "/gc-logo.webp"
        }
        currentPrice={alertTargetProduct?.price || selectedProduct?.price || 1499}
      />

      {/* Card Application Modal */}
      <CardApplicationModal
        isOpen={cardModalTarget !== null}
        onClose={() => setCardModalTarget(null)}
        card={cardModalTarget}
      />
    </SiteShell>
  );
}
