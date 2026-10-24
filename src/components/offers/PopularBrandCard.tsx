import React from "react";
import { Check } from "lucide-react";
import type { PopularBrand } from "./types";

export interface PopularBrandCardProps {
  brand: PopularBrand;
  isSelected: boolean;
  onSelect: (query: string) => void;
}

export const PopularBrandCard = React.memo(function PopularBrandCard({
  brand,
  isSelected,
  onSelect,
}: PopularBrandCardProps) {
  return (
    <button
      type="button"
      role="button"
      aria-pressed={isSelected}
      aria-label={`Brand ${brand.name}, ${brand.couponsCount} coupons, ${brand.offersCount} offers`}
      onClick={() => onSelect(brand.query)}
      className={`text-left group relative flex flex-col justify-between rounded-2xl border bg-card p-4 transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        isSelected
          ? "border-primary ring-2 ring-primary/20 shadow-md bg-primary/5"
          : "border-border/80 hover:border-primary/50"
      }`}
    >
      {isSelected && (
        <div className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          <Check className="h-3 w-3 stroke-[3]" />
        </div>
      )}

      {/* Centered Brand Logo Box */}
      <div
        className={`h-24 sm:h-28 w-full rounded-xl flex items-center justify-center p-3 mb-3 transition-colors ${
          brand.bgClass || "bg-muted/20 group-hover:bg-muted/40"
        }`}
      >
        <img
          src={brand.logo}
          alt={brand.name}
          width={120}
          height={48}
          className="max-h-12 max-w-[120px] object-contain drop-shadow-xs group-hover:scale-105 transition-transform"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Brand Name & Counts */}
      <div className="w-full">
        <h3 className="font-display font-bold text-sm sm:text-base text-foreground leading-snug">
          {brand.name}
        </h3>
        <div className="text-xs text-muted-foreground mt-0.5 font-medium">
          {brand.couponsCount} Coupons &bull; {brand.offersCount} Offers
        </div>
      </div>
    </button>
  );
});
