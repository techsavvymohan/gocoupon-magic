/**
 * @file src/open_food_fact/components/GroceryQuickLookup.tsx
 * @description Interactive lookup widget allowing users to paste barcodes (EAN-13, UPC)
 * or search packaged foods with live Nutri-Score & retailer coupon matching.
 */

import React, { useState } from "react";
import { Search, Barcode, Loader2, Tag, AlertCircle } from "lucide-react";
import type { FoodProductComparison, FoodProduct } from "../types.js";
import { GroceryProductCard } from "./GroceryProductCard.js";

const QUICK_EXAMPLES = [
  { name: "Nutella (400g)", barcode: "3017620422003" },
  { name: "Oreo Original", barcode: "7622210449283" },
  { name: "Ferrero Rocher", barcode: "8000500003787" },
  { name: "Nutella (France)", barcode: "3017620425035" },
];

export const GroceryQuickLookup: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<FoodProductComparison | null>(null);
  const [searchResults, setSearchResults] = useState<FoodProduct[]>([]);

  const handleLookup = async (inputQuery: string) => {
    const term = inputQuery.trim();
    if (!term) return;

    setLoading(true);
    setError(null);
    setSearchResults([]);

    const isNumericBarcode = /^[0-9]{8,14}$/.test(term.replace(/[-\s]/g, ""));
    const cleanBarcode = term.replace(/[^0-9]/g, "");

    try {
      if (isNumericBarcode) {
        // Direct barcode compare
        const res = await fetch(`/api/open-food-fact/compare/${cleanBarcode}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setComparison(data.data);
        } else {
          setError(data.message || `No product found for barcode ${cleanBarcode} in Open Food Facts.`);
          setComparison(null);
        }
      } else {
        // Keyword search
        const res = await fetch(`/api/open-food-fact/search?q=${encodeURIComponent(term)}&limit=6`);
        const data = await res.json();
        if (res.ok && data.success && data.products.length > 0) {
          setSearchResults(data.products);
          // Auto-select first result to display comparison
          const firstBarcode = data.products[0].barcode;
          if (firstBarcode) {
            const compRes = await fetch(`/api/open-food-fact/compare/${firstBarcode}`);
            const compData = await compRes.json();
            if (compRes.ok && compData.success) {
              setComparison(compData.data);
            }
          }
        } else {
          setError(`No grocery products found matching "${term}". Try searching by brand or pasting a barcode.`);
          setComparison(null);
        }
      }
    } catch (err) {
      console.error("[GroceryQuickLookup] Lookup error:", err);
      setError("Unable to reach Open Food Facts network. Please check connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = async (prod: FoodProduct) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/open-food-fact/compare/${prod.barcode}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setComparison(data.data);
      }
    } catch {
      setError("Failed to load store comparison for this product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Input Form */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-6 shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Barcode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-foreground">
              Grocery & Barcode Coupon Matcher
            </h3>
            <p className="text-xs text-muted-foreground">
              Paste any UPC/EAN barcode or search grocery essentials (Powered by Open Food Facts)
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup(query);
          }}
          className="flex flex-col sm:flex-row gap-2 mt-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="grocery-barcode-query"
              name="groceryQuery"
              aria-label="Grocery barcode or product search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Paste barcode (e.g. 3017620422003) or search 'Nutella', 'Oats'..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm flex-shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <Tag className="w-4 h-4" />
                <span>Find Deals</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Example Chips */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
          <span className="font-medium mr-1">Quick Try:</span>
          {QUICK_EXAMPLES.map((item) => (
            <button
              key={item.barcode}
              type="button"
              onClick={() => {
                setQuery(item.barcode);
                handleLookup(item.barcode);
              }}
              className="px-2.5 py-1 rounded-md bg-secondary/80 hover:bg-secondary text-secondary-foreground font-mono text-[11px] transition-colors border border-border/40"
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Multiple Search Results Selector */}
      {searchResults.length > 1 && (
        <div className="mt-4 p-4 rounded-xl bg-muted/40 border border-border/60">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Found {searchResults.length} matching products:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {searchResults.map((prod) => (
              <button
                key={prod.barcode}
                type="button"
                onClick={() => handleSelectProduct(prod)}
                className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                  comparison?.product.barcode === prod.barcode
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-border/60 bg-card hover:bg-muted text-card-foreground"
                }`}
              >
                <div className="truncate font-medium">{prod.product_name}</div>
                <div className="text-[11px] text-muted-foreground truncate">{prod.brands} {prod.quantity ? `• ${prod.quantity}` : ""}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Product Comparison Card */}
      {comparison && (
        <div className="mt-6">
          <GroceryProductCard comparison={comparison} />
        </div>
      )}
    </div>
  );
};
