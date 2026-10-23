/**
 * @file UrlResolverSearch.tsx
 * @description Ultra-clean Shopping Search & Multi-Store URL Resolver with SearXNG API and Cuelinks Instant Open Integration.
 *
 * Features:
 * - Top-Priority Partner Stores with 1-Click "⚡ Instant Open" Cuelinks affiliate redirection
 * - Direct SearXNG HTTP API integration (GET /search?q=...&format=json)
 * - Live real-time suggestions & autocomplete dropdown powered by SearXNG & local index
 * - WAI-ARIA APG compliant combobox with full keyboard navigation (ArrowUp/Down, Enter, Esc)
 * - Dynamic store placeholder rotating between Myntra, Amazon, Flipkart, Ajio & Meesho
 * - Supported store avatar stack (Amazon, Flipkart, Myntra, Meesho)
 * - 1-Click Clipboard Paste detection & clear button
 * - Optional connected trust badges row (200+ Stores, 90-Day Tracker, 100% Free Extension)
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  unifiedProductSearch,
  type UnifiedProductSuggestion,
} from "@/lib/services/unified-search-router";
import {
  findMatchingStores,
  buildStoreAffiliateUrl,
  wrapAffiliateTracking,
  type RegisteredStore,
} from "@/lib/services/store-registry";
import {
  Search,
  ArrowRight,
  X,
  ShieldCheck,
  ExternalLink,
  Tag,
  CheckCircle2,
  Store as StoreIcon,
  Zap,
  Barcode,
  Clipboard,
} from "lucide-react";
import type { FoodProductComparison } from "@/open_food_fact/types.js";
import { NutriScoreBadge } from "@/open_food_fact/components/NutriScoreBadge.js";
import { toast } from "sonner";

export interface UrlResolverSearchProps {
  placeholder?: string;
  className?: string;
  size?: "default" | "large";
  showTrustBadges?: boolean;
  showPopularChips?: boolean;
  onSearchSubmit?: (query: string) => void;
  initialQuery?: string;
}

const SUPPORTED_STORES = [
  { name: "Myntra", logo: "/Brand logos/myntra.webp", color: "#f43f5e" },
  { name: "Amazon", logo: "/Brand logos/Amazon_logo.svg.webp", color: "#f59e0b" },
  { name: "Flipkart", logo: "/Brand logos/flipkart.webp", color: "#3b82f6" },
  { name: "Meesho", logo: "/Brand logos/Meesho_logo.webp", color: "#ec4899" },
];

const ROTATING_PLACEHOLDERS = [
  "Search or paste any Amazon link for the best price",
  "Search or paste any Walmart, Target or eBay link",
  "Search or paste any Flipkart or Myntra link",
  "Search or paste any Ajio or Meesho link",
  "Search any product (e.g. Sony XM5, MacBook Pro, iPhone 16)…",
];

export function UrlResolverSearch({
  placeholder,
  className = "",
  size = "default",
  showTrustBadges = false,
  showPopularChips = true,
  onSearchSubmit,
  initialQuery = "",
}: UrlResolverSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isResolving, setIsResolving] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Focus and submission guard refs
  const [isFocused, setIsFocused] = useState(false);
  const isFocusedRef = useRef(false);
  const justSubmittedRef = useRef(false);

  // Sync internal query state if initialQuery changes from external navigation
  useEffect(() => {
    if (initialQuery !== undefined) {
      justSubmittedRef.current = true;
      setShowDropdown(false);
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Real-time suggestions & store matches state
  const [matchedStores, setMatchedStores] = useState<RegisteredStore[]>([]);
  const [searxngSuggestions, setSearxngSuggestions] = useState<string[]>([]);
  const [isLoadingSearxng, setIsLoadingSearxng] = useState(false);
  const [foodComparison, setFoodComparison] = useState<FoodProductComparison | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Rotate placeholder text every 3.2s when input is empty and not focused
  useEffect(() => {
    if (placeholder || query || isFocused) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % ROTATING_PLACEHOLDERS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [placeholder, query, isFocused]);

  const activePlaceholder = placeholder || ROTATING_PLACEHOLDERS[placeholderIndex];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setIsFocused(false);
        isFocusedRef.current = false;
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live Query, Store Priority Matching & Catalog Fetcher
  useEffect(() => {
    // If just submitted or not focused by user, do not reopen dropdown
    if (justSubmittedRef.current) {
      justSubmittedRef.current = false;
      setShowDropdown(false);
      return;
    }

    if (!isFocusedRef.current) {
      setShowDropdown(false);
      return;
    }

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setMatchedStores([]);
      setSearxngSuggestions([]);
      setFoodComparison(null);
      setShowDropdown(false);
      setSelectedIndex(-1);
      return;
    }

    // 0. Check for numeric barcode input (UPC/EAN: 8 to 14 digits)
    const isBarcode = /^[0-9]{8,14}$/.test(trimmed.replace(/[-\s]/g, ""));
    if (isBarcode) {
      const cleanBarcode = trimmed.replace(/[^0-9]/g, "");
      fetch(`/api/open-food-fact/compare/${cleanBarcode}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.data && isFocusedRef.current && !justSubmittedRef.current) {
            setFoodComparison(data.data);
            setShowDropdown(true);
          } else {
            setFoodComparison(null);
          }
        })
        .catch(() => setFoodComparison(null));
    } else {
      setFoodComparison(null);
    }

    // 1. Instant local store matching (<1ms) — comes ON TOP
    const storeHits = findMatchingStores(trimmed, 3);
    setMatchedStores(storeHits);
    if (storeHits.length > 0 && isFocusedRef.current && !justSubmittedRef.current) {
      setShowDropdown(true);
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // 2. Debounced shopping product suggestions & query autocomplete (<50ms response)
    setIsLoadingSearxng(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        let suggestions: string[] = [];
        try {
          const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(trimmed)}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.suggestions)) {
              suggestions = data.suggestions;
            }
          }
        } catch {
          // Fallback to local search router below
        }

        if (suggestions.length === 0) {
          const fallback = await unifiedProductSearch(trimmed, { limit: 6 });
          suggestions = fallback.suggestions || [];
        }

        setSearxngSuggestions(suggestions.slice(0, 6));

        // Only open if user is still actively focused and hasn't submitted
        if (
          isFocusedRef.current &&
          !justSubmittedRef.current &&
          (storeHits.length > 0 || suggestions.length > 0)
        ) {
          setShowDropdown(true);
        }
      } catch {
        // Keep existing results
      } finally {
        setIsLoadingSearxng(false);
      }
    }, 80);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query]);

  const handleExecuteSearch = useCallback(
    (searchQuery: string) => {
      const trimmed = searchQuery.trim();
      if (!trimmed) return;

      justSubmittedRef.current = true;
      isFocusedRef.current = false;
      setIsFocused(false);
      setShowDropdown(false);
      setSelectedIndex(-1);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      inputRef.current?.blur();

      if (onSearchSubmit) {
        onSearchSubmit(trimmed);
        return;
      }

      // If user inputs or pastes an HTTP URL, instantly resolve with verified affiliate attribution
      if (/^https?:\/\//i.test(trimmed)) {
        const affUrl = wrapAffiliateTracking(trimmed, "gocoupon_url_resolver");
        toast.success("Resolved partner store! Opening with verified cashback tracking...");
        window.open(affUrl, "_blank", "noopener");
        return;
      }

      navigate({
        to: "/compare",
        search: { q: trimmed } as unknown as Record<string, string>,
      });
    },
    [navigate, onSearchSubmit],
  );

  const handleInstantOpen = useCallback(
    (store: RegisteredStore, openWindow = true) => {
      justSubmittedRef.current = true;
      isFocusedRef.current = false;
      setIsFocused(false);
      setShowDropdown(false);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      inputRef.current?.blur();

      const affUrl = buildStoreAffiliateUrl(store, "gocoupon_instant_search");
      toast.success(`Opening ${store.name} with verified partner auto-savings!`);
      if (openWindow) {
        window.open(affUrl, "_blank", "noopener");
      }
    },
    [],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    justSubmittedRef.current = true;
    isFocusedRef.current = false;
    setIsFocused(false);
    setShowDropdown(false);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    inputRef.current?.blur();

    if (showDropdown && selectedIndex >= 0) {
      // 1. Selected Store Hit
      if (selectedIndex < matchedStores.length) {
        const selectedStore = matchedStores[selectedIndex];
        if (selectedStore) {
          handleInstantOpen(selectedStore);
          return;
        }
      }
      // 2. Selected Autocomplete Suggestion
      else {
        const suggIdx = selectedIndex - matchedStores.length;
        const selectedSuggestion = searxngSuggestions[suggIdx];
        if (selectedSuggestion) {
          setQuery(selectedSuggestion);
          handleExecuteSearch(selectedSuggestion);
          return;
        }
      }
    }
    handleExecuteSearch(query);
  };

  // Keyboard navigation for dropdown combobox
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) {
      if (e.key === "ArrowDown" && query.trim().length >= 2) {
        setShowDropdown(true);
      }
      return;
    }

    const totalItems = matchedStores.length + searxngSuggestions.length;
    if (totalItems === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % totalItems);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  };

  const handleClear = () => {
    setQuery("");
    setMatchedStores([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const isLarge = size === "large";

  return (
    <div ref={containerRef} className={`group/search w-full ${className}`}>
      {/* Search Input Card & Dropdown Anchor Wrapper */}
      <div className="relative w-full">
        {/* Ambient Luminous Glow Halo */}
        <div
          className="absolute -inset-1 sm:-inset-1.5 rounded-[22px] sm:rounded-[30px] bg-gradient-to-r from-primary/30 via-amber-500/20 to-primary/30 opacity-75 blur-xl transition-all duration-500 group-hover/search:opacity-100 group-focus-within/search:opacity-100 pointer-events-none"
          aria-hidden="true"
        />

      {/* Main Search Input Form Card */}
      <form
        onSubmit={handleSubmit}
        className={`group relative flex items-center w-full rounded-2xl sm:rounded-3xl border-2 border-primary/40 dark:border-primary/50 hover:border-primary/80 bg-card/98 backdrop-blur-2xl shadow-xl shadow-primary/10 hover:shadow-2xl hover:shadow-primary/20 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20 focus-within:shadow-2xl focus-within:shadow-primary/25 transition-all duration-300 ${
          isLarge
            ? "py-2 sm:py-2.5 px-3 sm:px-4 min-h-[58px] sm:min-h-[66px]"
            : "py-1.5 px-3 min-h-[48px]"
        }`}
      >
        {/* Left Magnifying Glass / Loading Spinner */}
        <div className="flex items-center justify-center pl-1 sm:pl-2 pr-2.5 text-primary transition-colors shrink-0 pointer-events-none">
          {isResolving || isLoadingSearxng ? (
            <div
              className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"
              aria-hidden="true"
            />
          ) : (
            <Search className="h-5 w-5 sm:h-5 sm:w-5" aria-hidden="true" />
          )}
        </div>

        {/* Text Input */}
        <input
          ref={inputRef}
          type="search"
          name="productOrStoreUrl"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            isFocusedRef.current = true;
            justSubmittedRef.current = false;
            if (
              query.trim().length >= 2 &&
              (matchedStores.length > 0 || searxngSuggestions.length > 0 || foodComparison)
            ) {
              setShowDropdown(true);
            }
          }}
          onBlur={() => {
            setTimeout(() => {
              setIsFocused(false);
              isFocusedRef.current = false;
              setShowDropdown(false);
            }, 180);
          }}
          onKeyDown={handleKeyDown}
          placeholder={activePlaceholder}
          autoComplete="off"
          spellCheck={false}
          inputMode="search"
          role="combobox"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-label="Search store or paste product URL"
          className="w-full flex-1 bg-transparent border-none text-foreground placeholder:text-muted-foreground/70 text-base font-normal focus:outline-none focus:ring-0 focus-visible:outline-none py-1 sm:py-2 pr-2 touch-manipulation min-w-0 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
        />

        {/* Right Section: Supports / Brand Avatars / Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {query ? (
            <>
              <button
                type="button"
                onClick={handleClear}
                className="rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Clear search input"
                title="Clear input"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="submit"
                disabled={!query.trim() || isResolving}
                aria-label="Compare prices or open store"
                className="inline-flex items-center gap-1.5 rounded-xl sm:rounded-2xl bg-primary px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-primary-foreground shadow-xs transition-transform hover:scale-[1.03] active:scale-[0.97] disabled:opacity-40 min-h-[36px] sm:min-h-[40px] touch-manipulation cursor-pointer"
              >
                {isResolving ? (
                  <span>Searching…</span>
                ) : /^https?:\/\//i.test(query.trim()) ? (
                  <>
                    <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" aria-hidden="true" />
                    <span>Open &amp; Save</span>
                  </>
                ) : (
                  <>
                    <span>Compare</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (text && text.trim()) {
                      const trimmed = text.trim();
                      setQuery(trimmed);
                      if (/^https?:\/\//i.test(trimmed)) {
                        const affUrl = wrapAffiliateTracking(trimmed, "gocoupon_url_resolver");
                        toast.success("Resolved partner store! Opening with verified cashback tracking...");
                        window.open(affUrl, "_blank", "noopener");
                      } else {
                        inputRef.current?.focus();
                      }
                    }
                  } catch {
                    inputRef.current?.focus();
                  }
                }}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-muted/60 hover:bg-muted text-[11px] font-medium text-foreground px-2.5 py-1.5 transition-colors border border-border/60 cursor-pointer"
                title="Paste merchant link from clipboard"
              >
                <Clipboard className="h-3 w-3 text-primary" />
                <span>Paste Link</span>
              </button>

              <span className="hidden sm:inline text-xs sm:text-sm font-normal text-muted-foreground/75 select-none mr-1">
                supports
              </span>

              <div
                className="flex items-center -space-x-2 sm:-space-x-2.5 py-0.5"
                aria-label="Supported stores"
              >
                {SUPPORTED_STORES.map((store) => (
                  <div
                    key={store.name}
                    title={`Supports ${store.name}`}
                    className="relative inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white dark:bg-neutral-800 border-2 border-background shadow-xs transition-transform hover:scale-125 hover:z-10"
                  >
                    <img
                      src={store.logo}
                      alt={store.name}
                      className="h-4 w-4 sm:h-5 sm:w-5 object-contain"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </form>

      {/* Live Dropdown Suggestions — Stores Top-Ranked */}
      {showDropdown &&
        (foodComparison || /^https?:\/\//i.test(query.trim()) || matchedStores.length > 0 || searxngSuggestions.length > 0) && (
          <div
            role="listbox"
            id="search-suggestions-list"
            className="absolute top-full left-0 right-0 mt-1.5 sm:mt-2 z-50 rounded-2xl sm:rounded-3xl border border-border/80 bg-card/98 backdrop-blur-2xl p-2.5 sm:p-3 shadow-2xl text-left animate-in fade-in zoom-in-95 duration-150 divide-y divide-border/40 max-h-[70vh] sm:max-h-[480px] overflow-y-auto overscroll-contain"
          >
            {/* ── 0. DIRECT URL MONETIZATION CARD ── */}
            {/^https?:\/\//i.test(query.trim()) && (
              <div className="pb-2.5">
                <div
                  onClick={() => {
                    const affUrl = wrapAffiliateTracking(query.trim(), "gocoupon_url_resolver");
                    toast.success("Opening partner store with verified cashback tracking!");
                    window.open(affUrl, "_blank", "noopener");
                  }}
                  className="group/url flex items-center justify-between gap-3 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 transition-all bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 hover:from-amber-500/25 hover:to-orange-500/20 border border-amber-500/30 cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500">
                      <Zap className="h-5 w-5 fill-amber-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground truncate">
                          ⚡ Instant Open &amp; Activate Cashback
                        </span>
                        <span className="rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 border border-emerald-500/30">
                          100% Tracked
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate font-mono mt-0.5">
                        {query.trim()}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-amber-500 group-hover/url:translate-x-0.5 transition-transform">
                    <span>Open</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            )}
            {/* ── 0. OPEN FOOD FACTS BARCODE MATCH ── */}
            {foodComparison && (
              <div className="pb-2.5">
                <div className="flex items-center justify-between px-2 py-0.5 mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                    <Barcode className="h-3.5 w-3.5" />
                    Barcode Matched (Open Food Facts)
                  </span>
                  <NutriScoreBadge grade={foodComparison.product.nutriscore_grade} size="sm" showLabel={false} />
                </div>
                <div
                  onClick={() => {
                    setQuery(foodComparison.product.product_name);
                    handleExecuteSearch(foodComparison.product.product_name);
                  }}
                  className="group/food flex items-center justify-between gap-3 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 transition-all bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/30 cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div className="relative h-11 w-11 shrink-0 rounded-xl bg-white dark:bg-neutral-900 p-1 border border-border/80 shadow-2xs flex items-center justify-center overflow-hidden">
                      {foodComparison.product.image_url ? (
                        <img
                          src={foodComparison.product.image_url}
                          alt={foodComparison.product.product_name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <Barcode className="h-6 w-6 text-emerald-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">
                          {foodComparison.product.brands}
                        </span>
                        {foodComparison.product.quantity && (
                          <span className="text-[10px] text-muted-foreground">
                            • {foodComparison.product.quantity}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-foreground truncate group-hover/food:text-emerald-600 dark:group-hover/food:text-emerald-400 transition-colors">
                        {foodComparison.product.product_name}
                      </p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {foodComparison.availableCouponsCount} stores with active coupons
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="hidden sm:inline">Compare</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            )}

            {/* ── 1. PARTNER STORES & INSTANT OPEN (SURFACED FIRST ON TOP) ── */}
            {matchedStores.length > 0 && (
              <div className="pb-2.5">
                <div className="flex items-center justify-between px-2 py-0.5 mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
                    <StoreIcon className="h-3.5 w-3.5 text-primary" />
                    Stores &amp; Instant Open
                  </span>
                  <span className="text-[9px] font-mono font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Zap className="h-2.5 w-2.5 fill-emerald-500 text-emerald-500" />
                    Verified Auto-Savings Active
                  </span>
                </div>

                <ul className="space-y-1.5">
                  {matchedStores.map((store, idx) => {
                    const isSelected = selectedIndex === idx;
                    const affiliateUrl = buildStoreAffiliateUrl(store, "gocoupon_instant_search");

                    return (
                      <li
                        key={store.id}
                        role="option"
                        aria-selected={isSelected}
                        className={`group/store flex items-center justify-between gap-3 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 transition-all ${
                          isSelected
                            ? "bg-primary/15 border border-primary/40 shadow-xs"
                            : "bg-muted/30 hover:bg-muted/70 border border-border/40 hover:border-primary/40"
                        }`}
                      >
                        {/* Store Info Container */}
                        <div
                          className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 cursor-pointer"
                          onClick={() => handleInstantOpen(store)}
                        >
                          {/* Logo */}
                          <div className="relative h-10 w-10 sm:h-11 sm:w-11 shrink-0 rounded-xl bg-white dark:bg-neutral-900 p-1.5 border border-border/80 shadow-2xs flex items-center justify-center overflow-hidden">
                            <img
                              src={store.logo}
                              alt={store.name}
                              className="h-full w-full object-contain"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                            <span className="font-mono font-bold text-xs text-muted-foreground">
                              {store.name.slice(0, 2).toUpperCase()}
                            </span>
                          </div>

                          {/* Details */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                              <span className="text-xs sm:text-sm font-bold text-foreground group-hover/store:text-primary transition-colors">
                                {store.name}
                              </span>

                              {store.isInstantOpen ? (
                                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-1.5 py-0.2 flex items-center gap-0.5">
                                  <Zap className="h-2.5 w-2.5 fill-emerald-500 text-emerald-500" />
                                  Instant Open
                                </span>
                              ) : (
                                <span className="rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-700 dark:text-sky-300 text-[10px] font-bold px-1.5 py-0.2 flex items-center gap-0.5">
                                  <CheckCircle2 className="h-2.5 w-2.5 text-sky-600" />
                                  Available
                                </span>
                              )}

                              <span className="text-[10px] font-mono text-muted-foreground hidden sm:inline">
                                • {store.domain}
                              </span>
                            </div>

                            <p className="text-[11px] text-muted-foreground truncate">
                              {store.defaultCoupon ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                  <strong className="font-mono">{store.defaultCoupon.code}</strong> —{" "}
                                  {store.defaultCoupon.description}
                                </span>
                              ) : (
                                <span>{store.cashbackRate} Cashback Available</span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Actions Right */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {store.internalRoute && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDropdown(false);
                                navigate({ to: store.internalRoute! });
                              }}
                              className="hidden md:inline-flex items-center rounded-lg border border-border/80 bg-card px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                            >
                              Coupons
                            </button>
                          )}

                          <a
                            href={affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInstantOpen(store, false);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-3 py-1.5 sm:py-2 shadow-xs transition-all touch-manipulation focus-visible:ring-2 focus-visible:ring-emerald-400"
                            title={`Instant Open ${store.name} with verified partner auto-savings`}
                          >
                            <span>Instant Open</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* ── 2. PRODUCT AUTOCOMPLETE RECOMMENDATIONS ── */}
            {searxngSuggestions.length > 0 && (
              <div className="py-2">
                <div className="flex items-center justify-between px-2 py-0.5 mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
                    <Search className="h-3 w-3 text-primary" />
                    Product Recommendations
                  </span>
                  <span className="text-[9px] font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    Multi-Store Compare
                  </span>
                </div>
                <ul className="space-y-1">
                  {searxngSuggestions.map((suggestion, idx) => {
                    const isSelected = selectedIndex === matchedStores.length + idx;
                    return (
                      <li
                        key={suggestion}
                        role="option"
                        aria-selected={isSelected}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          justSubmittedRef.current = true;
                          isFocusedRef.current = false;
                          setIsFocused(false);
                          setShowDropdown(false);
                          if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
                          inputRef.current?.blur();
                          setQuery(suggestion);
                          handleExecuteSearch(suggestion);
                        }}
                        onClick={() => {
                          justSubmittedRef.current = true;
                          isFocusedRef.current = false;
                          setIsFocused(false);
                          setShowDropdown(false);
                          if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
                          inputRef.current?.blur();
                          setQuery(suggestion);
                          handleExecuteSearch(suggestion);
                        }}
                        className={`group/sugg flex items-center justify-between rounded-xl px-3 py-2 text-xs sm:text-sm transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                            : "text-foreground hover:bg-muted/80 hover:text-primary"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <Search
                            className={`h-3.5 w-3.5 shrink-0 ${
                              isSelected ? "text-primary-foreground" : "text-primary/70 group-hover/sugg:text-primary"
                            }`}
                          />
                          <span className="truncate font-medium">{suggestion}</span>
                        </div>

                        <div className="shrink-0 flex items-center gap-1.5 text-[11px] font-mono opacity-80 group-hover/sugg:opacity-100">
                          <span className={`hidden sm:inline text-[10px] font-semibold ${isSelected ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                            Compare Stores
                          </span>
                          <ArrowRight
                            className={`h-3.5 w-3.5 transition-transform group-hover/sugg:translate-x-0.5 ${
                              isSelected ? "text-primary-foreground" : "text-primary"
                            }`}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Bottom Footer Tip */}
            <div className="pt-2 px-2 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Real-Time Cross-Store Engine Active
              </span>
              <span>Press ↵ to open or compare</span>
            </div>
          </div>
        )}
      </div>

      {/* Popular High-Ticket Search Chips */}
      {showPopularChips && (
        <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5 text-xs">
          <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider mr-1">
            Compare High-Ticket:
          </span>
          {[
            "iPhone 16",
            "MacBook Air M3",
            "Sony WH-1000XM5",
            "Samsung Galaxy S24",
            "iPad Air",
          ].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                setQuery(chip);
                handleExecuteSearch(chip);
              }}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-card/80 px-3 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors shadow-2xs cursor-pointer active:scale-95"
            >
              <span>{chip}</span>
            </button>
          ))}
        </div>
      )}

      {/* Redesigned Premium Trust Proof Strip */}
      {showTrustBadges && (
        <div className="mt-5 flex items-center justify-center select-none">
          <div className="inline-flex flex-wrap items-center justify-center gap-y-2 gap-x-3 sm:gap-x-4.5 rounded-full border border-border/80 bg-background/80 dark:bg-card/50 px-4 sm:px-5 py-2 text-xs shadow-2xs backdrop-blur-md transition-all hover:border-primary/30">
            <div className="inline-flex items-center gap-2 font-medium">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <StoreIcon className="h-3 w-3" aria-hidden="true" />
              </span>
              <span className="text-xs sm:text-[13px] font-semibold tracking-tight text-foreground/90">
                200+ Stores Worldwide
              </span>
            </div>

            <span className="hidden sm:inline-block h-3.5 w-px bg-border/80" aria-hidden="true" />

            <div className="inline-flex items-center gap-2 font-medium">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Zap className="h-3 w-3 fill-current" aria-hidden="true" />
              </span>
              <span className="text-xs sm:text-[13px] font-semibold tracking-tight text-foreground/90">
                Auto-Apply Working Coupons
              </span>
            </div>

            <span className="hidden sm:inline-block h-3.5 w-px bg-border/80" aria-hidden="true" />

            <div className="inline-flex items-center gap-2 font-medium">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="text-xs sm:text-[13px] font-semibold tracking-tight text-foreground/90">
                100% Free Chrome Extension
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
