/**
 * @file UrlResolverSearch.tsx
 * @description Intelligent Shopping Search and Multi-Store URL Resolver.
 *
 * UI/UX Pro Max Features:
 * - 1-Click Clipboard Paste detection
 * - Instant clear input button
 * - Verified merchant badge indicators (Amazon, Flipkart, Myntra, Croma, boAt)
 * - Glassmorphic animated focus glow
 * - Touch-friendly quick-try chips for mobile and desktop
 */

import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { resolveProduct } from "@/lib/services/product-resolver";
import { Search, TrendingUp, ArrowRight, Clipboard, X, Check } from "lucide-react";
import { toast } from "sonner";

interface UrlResolverSearchProps {
  placeholder?: string;
  className?: string;
  size?: "default" | "large";
}

export function UrlResolverSearch({
  placeholder = "Paste Amazon / Flipkart URL or search any product...",
  className = "",
  size = "default",
}: UrlResolverSearchProps) {
  const [query, setQuery] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const navigate = useNavigate();

  const handleSearchOrResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsResolving(true);
    const resolved = resolveProduct(query);

    setTimeout(() => {
      setIsResolving(false);
      if (resolved) {
        toast.success(`Matched: ${resolved.product.title.slice(0, 35)}...`);
        navigate({
          to: "/product/$productId",
          params: { productId: resolved.product.id },
        });
      } else {
        navigate({
          to: "/compare",
          search: { q: query.trim() } as any,
        });
      }
    }, 250);
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text.trim()) {
          setQuery(text.trim());
          const resolved = resolveProduct(text.trim());
          if (resolved) {
            toast.success(`Resolved product from clipboard!`);
            navigate({
              to: "/product/$productId",
              params: { productId: resolved.product.id },
            });
          } else {
            toast.info("Pasted from clipboard");
          }
        }
      }
    } catch {
      toast.info("Please paste the link using Ctrl+V or Long-Press");
    }
  };

  const handleClear = () => {
    setQuery("");
  };

  const isLarge = size === "large";

  return (
    <div className={`relative w-full ${className}`}>
      <form onSubmit={handleSearchOrResolve} className="group relative flex items-center">
        {/* Search / Spinner Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none transition-colors group-focus-within:text-primary">
          {isResolving ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden="true" />
          ) : (
            <Search className="h-5 w-5" aria-hidden="true" />
          )}
        </div>

        {/* Search Input Box */}
        <input
          type="search"
          name="productOrStoreUrl"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder.replace(/\.{3}/g, "…")}
          autoComplete="off"
          spellCheck={false}
          inputMode="search"
          aria-label="Paste product URL or search products"
          className={`w-full rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xl text-foreground shadow-lg transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 touch-manipulation ${
            isLarge
              ? "py-4 pl-12 pr-40 sm:pr-44 text-sm sm:text-base"
              : "py-3 pl-11 pr-32 text-xs sm:text-sm"
          }`}
        />

        {/* Right Actions: Paste / Clear + Submit */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {query ? (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-lg p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors touch-manipulation"
              aria-label="Clear search input"
              title="Clear input"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1.5 min-h-[36px] text-[11px] font-mono text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors touch-manipulation"
              aria-label="Paste URL from clipboard"
              title="Paste from clipboard"
            >
              <Clipboard className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Paste</span>
            </button>
          )}

          <button
            type="submit"
            disabled={!query.trim() || isResolving}
            aria-label="Compare prices across stores"
            className={`inline-flex items-center gap-1.5 rounded-xl bg-primary font-bold text-primary-foreground shadow-sm transition-transform hover:scale-[1.03] active:scale-[0.97] disabled:opacity-40 min-h-[36px] touch-manipulation ${
              isLarge ? "px-4 py-2.5 text-xs sm:text-sm" : "px-3 py-1.5 text-xs"
            }`}
          >
            {isResolving ? (
              <span>Resolving…</span>
            ) : (
              <>
                <span>Compare</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Supported Stores & Quick Chips */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Quick Example Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-primary" aria-hidden="true" /> Popular:
          </span>
          {[
            { label: "Sony XM5", query: "Sony WH-1000XM5" },
            { label: "MacBook M3", query: "MacBook Air M3" },
            { label: "boAt Airdopes", query: "boAt Airdopes" },
            { label: "Samsung S24", query: "Samsung S24 Ultra" },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setQuery(item.query);
                const resolved = resolveProduct(item.query);
                if (resolved) {
                  navigate({
                    to: "/product/$productId",
                    params: { productId: resolved.product.id },
                  });
                }
              }}
              className="rounded-lg border border-border/60 bg-card/60 backdrop-blur-sm px-2.5 py-1 min-h-[28px] text-[11px] font-medium text-foreground hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors active:scale-95 touch-manipulation"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Supported Stores Dots */}
        <div className="hidden md:flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
          <span>Supported:</span>
          <span className="inline-flex items-center gap-1 text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Amazon
          </span>
          <span className="inline-flex items-center gap-1 text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Flipkart
          </span>
          <span className="inline-flex items-center gap-1 text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-pink-500" /> Myntra
          </span>
          <span className="inline-flex items-center gap-1 text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" /> Croma
          </span>
        </div>
      </div>
    </div>
  );
}
