import React from "react";
import type { LucideIcon } from "lucide-react";
import type { RealCategory } from "./types";

export interface CategoryCardProps {
  category: RealCategory;
  metaIcon: LucideIcon;
  isSelected: boolean;
  onSelect: (name: string) => void;
}

export const CategoryCard = React.memo(function CategoryCard({
  category,
  metaIcon: CatIcon,
  isSelected,
  onSelect,
}: CategoryCardProps) {
  return (
    <button
      type="button"
      role="button"
      aria-pressed={isSelected}
      aria-label={`Category ${category.name}, ${category.offersCount} deals, ${category.couponsCount} codes`}
      onClick={() => onSelect(category.name)}
      className={`text-left group flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        isSelected
          ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
          : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <div className="w-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <CatIcon className="h-5 w-5" />
          </div>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {category.maxDiscount || "Verified Deals"}
          </span>
        </div>

        <h3 className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors">
          {category.name}
        </h3>
        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
          {category.description || `Hand-verified ${category.name} discount coupons & deals.`}
        </p>

        {category.topStores && category.topStores.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {category.topStores.map((st) => (
              <span
                key={st}
                className="rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium"
              >
                {st}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="w-full mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
        <span className="font-mono font-bold text-foreground">
          {category.offersCount} Deals
        </span>
        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          {category.couponsCount} Codes
        </span>
      </div>
    </button>
  );
});
