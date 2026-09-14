import React from "react";
import { Check } from "lucide-react";
import { StoreLogo } from "@/components/common/StoreLogo";
import type { RealStore } from "./types";

export interface StoreDirectoryCardProps {
  store: RealStore;
  isSelected: boolean;
  onSelect: (name: string) => void;
}

export const StoreDirectoryCard = React.memo(function StoreDirectoryCard({
  store,
  isSelected,
  onSelect,
}: StoreDirectoryCardProps) {
  return (
    <button
      type="button"
      role="button"
      aria-pressed={isSelected}
      aria-label={`Store ${store.name}, ${store.offersCount} deals, ${store.couponsCount} coupon codes`}
      onClick={() => onSelect(store.name)}
      className={`text-left group relative flex flex-col justify-between rounded-2xl border p-3.5 transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        isSelected
          ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
          : "border-border bg-card hover:border-primary/40"
      }`}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          <Check className="h-2.5 w-2.5 stroke-[3]" />
        </div>
      )}

      <div className="w-full flex flex-col items-center text-center">
        <StoreLogo
          storeName={store.name}
          storeLogo={store.logo}
          className="h-12 w-12 rounded-xl p-1.5 mb-2 shadow-xs"
          imageClassName="max-h-full max-w-full object-contain"
        />
        <h4 className="font-display font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {store.name}
        </h4>
        <span className="text-[10px] text-muted-foreground mt-0.5 font-medium">
          {store.category}
        </span>
      </div>

      <div className="w-full mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[10px] font-mono">
        <span className="text-foreground font-bold">{store.offersCount} Deals</span>
        {store.couponsCount > 0 ? (
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{store.couponsCount} Codes</span>
        ) : (
          <span className="text-muted-foreground">Active</span>
        )}
      </div>
    </button>
  );
});
