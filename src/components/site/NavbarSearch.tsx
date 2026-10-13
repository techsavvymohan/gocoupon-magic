/**
 * @file NavbarSearch.tsx
 * @description GrabOn-Style Live Search Bar for GoCoupon Header Navigation.
 * Provides instant real-time store, coupon, and category autocomplete with
 * live API integration, keyboard navigation, brand logos, and 1-click discovery.
 */

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Search, X, Store, Tag, ArrowRight, ExternalLink, ShieldCheck, Copy, Check } from "lucide-react";
import { getStoreCatalog, type StoreCatalogEntry } from "@/lib/store-catalog-helper";
import { fetchDeals, type Deal } from "@/lib/api/deals-api";
import { toast } from "sonner";

interface NavbarSearchProps {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onSelect?: () => void;
}

export function NavbarSearch({
  className = "",
  placeholder = "Search for brands, categories, coupons...",
  autoFocus = false,
  onSelect,
}: NavbarSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [apiDeals, setApiDeals] = useState<Array<{
    id: string;
    storeName: string;
    storeSlug: string;
    title: string;
    code?: string;
    discount?: string;
  }>>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // All catalog stores from helper
  const allStores = useMemo(() => {
    try {
      const catalog = getStoreCatalog();
      return Array.from(catalog.values());
    } catch {
      return [];
    }
  }, []);

  // Debounced API search across 1,500+ live deals
  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed.length < 2) {
      setApiDeals([]);
      setIsSearchingApi(false);
      return;
    }

    const cleanApiQ = trimmed
      .replace(/\b(coupons?|coupon\s*codes?|promo\s*codes?|promos?|discounts?|deals?|offers?|vouchers?|codes?|2026|today|online|free|flat)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    const queryToUse = cleanApiQ.length >= 2 ? cleanApiQ : trimmed;

    setIsSearchingApi(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetchDeals({ q: queryToUse, limit: 5 });
        let deals = (res.deals || []).map((d) => ({
          id: d.id,
          storeName: d.storeName,
          storeSlug: d.storeSlug || d.storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          title: d.title,
          code: d.code,
          discount: d.discount,
        }));

        // If fewer than 2 results, also check international deals
        if (deals.length < 3) {
          try {
            const { fetchInternationalDeals } = await import("@/lib/api/international-deals-api");
            const intlRes = await fetchInternationalDeals({ q: queryToUse });
            if (intlRes.deals && intlRes.deals.length > 0) {
              const existingIds = new Set(deals.map((d) => d.id));
              for (const d of intlRes.deals) {
                if (!existingIds.has(d.id)) {
                  deals.push({
                    id: d.id,
                    storeName: d.storeName,
                    storeSlug: d.storeSlug || d.storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                    title: d.title,
                    code: d.code,
                    discount: d.discount,
                  });
                }
              }
            }
          } catch {}
        }

        setApiDeals(deals.slice(0, 5));
      } catch {
        setApiDeals([]);
      } finally {
        setIsSearchingApi(false);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [query]);

  // Combined matching stores and deals
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { stores: [], deals: [], hasMore: false };

    const cleanQ = q
      .replace(/\b(coupons?|coupon\s*codes?|promo\s*codes?|promos?|discounts?|deals?|offers?|vouchers?|codes?|2026|today|online|free|flat)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    const matchesIntent = (target: string) => {
      const t = (target || "").toLowerCase();
      if (!t) return false;
      if (t.includes(q) || q.includes(t)) return true;
      if (cleanQ.length >= 2 && (t.includes(cleanQ) || cleanQ.includes(t))) return true;
      return false;
    };

    // 1. Match stores from catalog
    const matchedStores = allStores
      .filter((s) => {
        return matchesIntent(s.name) || matchesIntent(s.category) || matchesIntent(s.slug);
      })
      .slice(0, 5);

    // 2. Match deals from catalog stores + API live deals
    const dealMap = new Map<string, {
      id: string;
      storeName: string;
      storeSlug: string;
      title: string;
      code?: string;
      discount?: string;
    }>();

    // Catalog deals
    for (const s of allStores) {
      for (const d of s.deals) {
        const title = (d.title || "").toLowerCase();
        const code = (d.code || "").toLowerCase();
        const storeName = s.name.toLowerCase();
        if (matchesIntent(title) || matchesIntent(code) || matchesIntent(storeName)) {
          dealMap.set(d.id || code || title, {
            id: d.id || `${s.slug}-${code}`,
            storeName: s.name,
            storeSlug: s.slug,
            title: d.title,
            code: d.code,
            discount: d.discount,
          });
        }
      }
    }

    // Merge live API deals
    for (const d of apiDeals) {
      if (!dealMap.has(d.id) && !dealMap.has(d.code || d.title)) {
        dealMap.set(d.id, d);
      }
    }

    const matchedDeals = Array.from(dealMap.values()).slice(0, 5);
    const totalMatches = matchedStores.length + matchedDeals.length;

    return {
      stores: matchedStores,
      deals: matchedDeals,
      hasMore: totalMatches > 0,
    };
  }, [query, allStores, apiDeals]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut: Cmd+K / Ctrl+K / '/'
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQ = query.trim();
    if (!cleanQ) return;

    setIsOpen(false);
    onSelect?.();

    // If query matches a store exactly or closely, jump to that store
    const cleanLower = cleanQ.toLowerCase();
    const strippedLower = cleanLower
      .replace(/\b(coupons?|coupon\s*codes?|promo\s*codes?|promos?|discounts?|deals?|offers?|vouchers?|codes?|2026|today|online|free|flat)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    const exactStore = allStores.find((s) => {
      const sName = s.name.toLowerCase();
      const sSlug = s.slug.replace(/-coupons$/, "").toLowerCase();
      return (
        sName === cleanLower ||
        sSlug === cleanLower ||
        s.slug.toLowerCase() === cleanLower ||
        (strippedLower.length >= 2 && (sName === strippedLower || sSlug === strippedLower))
      );
    });

    if (exactStore) {
      navigate({ to: `/${exactStore.slug}` as any });
      return;
    }

    // Default: navigate directly to offers search with query parameter
    navigate({
      to: "/offers" as any,
      search: { q: cleanQ } as any,
    });
  };

  const handleSelectStore = (slug: string) => {
    setIsOpen(false);
    onSelect?.();
    const cleanSlug = slug.startsWith("/") ? slug.slice(1) : slug;
    navigate({ to: `/${cleanSlug}` as any });
  };

  const handleCopyCode = (e: React.MouseEvent, code: string, storeSlug: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    toast.success(`Coupon code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 3000);
    handleSelectStore(storeSlug);
  };

  const hasResults = results.stores.length > 0 || results.deals.length > 0;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative flex items-center w-full">
        {/* Search Icon */}
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/80 flex items-center justify-center">
          <Search className="h-4 w-4" />
        </div>

        {/* GrabOn-Style Main Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          placeholder={placeholder}
          aria-label="Search stores, coupons, and discounts"
          className="w-full h-10 sm:h-10.5 pl-10 pr-18 sm:pr-20 rounded-xl sm:rounded-xl border border-border/70 bg-card/80 hover:bg-card/95 hover:border-primary/40 focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground shadow-2xs transition-all duration-200 outline-none"
        />

        {/* Right Side: Clear Button or ⌘K Shortcut Hint */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer touch-manipulation"
              aria-label="Clear search"
            >
              <X className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            </button>
          ) : (
            <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded-md border border-border/80 bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground shadow-2xs select-none pointer-events-none">
              <span className="text-[11px]">⌘</span>K
            </kbd>
          )}
        </div>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-[110] max-h-[460px] overflow-y-auto rounded-2xl border border-border/80 bg-card/98 backdrop-blur-xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-150 divide-y divide-border/50">
          {/* Section 1: Matching Stores */}
          {results.stores.length > 0 && (
            <div className="p-2 space-y-1">
              <div className="flex items-center justify-between px-2 pb-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Store className="h-3.5 w-3.5 text-primary" />
                  <span>Matching Stores</span>
                </span>
                <span className="text-[10px] lowercase text-muted-foreground/80 font-normal">press enter to visit</span>
              </div>

              {results.stores.map((store) => (
                <button
                  key={store.slug}
                  type="button"
                  onClick={() => handleSelectStore(store.slug)}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-muted/70 transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg border border-border/80 bg-background p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                      {store.logo ? (
                        <img
                          src={store.logo}
                          alt=""
                          className="h-full w-full object-contain"
                          loading="lazy"
                          width={24}
                          height={24}
                        />
                      ) : (
                        <span className="text-sm">{store.fallbackIcon}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors truncate">
                          {store.name}
                        </span>
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      </div>
                      <span className="text-[11px] text-muted-foreground font-medium block truncate">
                        {store.category} • {store.maxDiscount}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      {store.couponsCount > 0 ? `${store.couponsCount} Deals` : "Verified"}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-primary transition-all" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Section 2: Matching Deals & Promo Codes */}
          {results.deals.length > 0 && (
            <div className="p-2 space-y-1">
              <div className="px-2 pt-1 pb-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-amber-500" />
                <span>Live Verified Promo Codes &amp; Deals</span>
              </div>

              {results.deals.map((deal) => (
                <div
                  key={deal.id}
                  onClick={() => handleSelectStore(deal.storeSlug)}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-muted/70 transition-colors text-left group cursor-pointer gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                        {deal.storeName}
                      </span>
                      {deal.discount && (
                        <span className="rounded-md bg-primary/10 border border-primary/20 px-1.5 py-0.2 text-[10px] font-bold text-primary shrink-0">
                          {deal.discount}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {deal.title}
                    </p>
                  </div>

                  {deal.code ? (
                    <button
                      type="button"
                      onClick={(e) => handleCopyCode(e, deal.code!, deal.storeSlug)}
                      className="shrink-0 flex items-center gap-1 rounded-lg border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/15 px-2 py-1 font-mono text-[11px] font-black text-primary transition-colors cursor-pointer"
                      title="Click to copy coupon code"
                    >
                      {copiedCode === deal.code ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-500" />
                          <span className="text-emerald-500">COPIED</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>{deal.code}</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="shrink-0 rounded-lg bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground">
                      Activate Deal
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* No results fallback */}
          {!hasResults && !isSearchingApi && (
            <div className="py-6 px-4 text-center">
              <p className="text-xs font-semibold text-foreground">No direct matches for &ldquo;{query}&rdquo;</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Press Enter to search across all live verified offers in Deals Vault
              </p>
            </div>
          )}

          {/* Footer View All Banner */}
          <div className="p-2 bg-muted/30 rounded-b-xl">
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/15 text-primary text-xs font-bold transition-colors cursor-pointer"
            >
              <span>View all results for &ldquo;{query}&rdquo; in Deals Vault</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
