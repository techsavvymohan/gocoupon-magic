import React, { useState, useRef, useEffect } from "react";
import { useCurrency, SUPPORTED_CURRENCIES, CurrencyCode } from "@/context/CurrencyContext";
import { Coins, Check, ChevronDown, MapPin } from "lucide-react";

interface CurrencyToggleProps {
  className?: string;
  variant?: "default" | "compact" | "footer";
}

export function CurrencyToggle({ className = "", variant = "default" }: CurrencyToggleProps) {
  const { currency, setCurrency, currentCurrency, countryName, country } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSelectCurrency = (code: CurrencyCode) => {
    setCurrency(code);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Current currency: ${currency} (${currentCurrency.symbol}). Click to change currency.`}
        title={`Location: ${countryName || country || "Global"}. Current: ${currency} (${currentCurrency.symbol})`}
        className={`group inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/80 px-2.5 py-1.5 text-xs font-semibold text-foreground shadow-2xs backdrop-blur-md transition-all duration-200 hover:border-border hover:bg-accent active:scale-95 cursor-pointer touch-manipulation focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
          variant === "footer"
            ? "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300"
            : ""
        }`}
      >
        <span className="text-sm leading-none" aria-hidden="true">
          {currentCurrency.flag}
        </span>
        <span className="font-mono font-bold text-primary">{currentCurrency.symbol}</span>
        <span className="font-mono text-[11px] text-muted-foreground uppercase">{currentCurrency.code}</span>
        <ChevronDown
          className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Select currency"
          className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-border bg-card p-1.5 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border/50 mb-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Coins className="h-3 w-3" />
              <span>Select Currency</span>
            </div>
            {countryName && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80 font-mono">
                <MapPin className="h-2.5 w-2.5 text-primary" />
                <span className="truncate max-w-[80px]">{countryName}</span>
              </div>
            )}
          </div>

          <div className="space-y-0.5 max-h-72 overflow-y-auto">
            {SUPPORTED_CURRENCIES.map((curr) => {
              const isSelected = curr.code === currency;
              return (
                <button
                  key={curr.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectCurrency(curr.code)}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none" aria-hidden="true">
                      {curr.flag}
                    </span>
                    <div className="flex flex-col items-start leading-tight">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground">{curr.code}</span>
                        <span className="font-mono text-muted-foreground">({curr.symbol})</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{curr.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {curr.code !== "INR" && (
                      <span className="text-[10px] font-mono text-muted-foreground/70">
                        ≈ ₹{curr.rateToInr}
                      </span>
                    )}
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default CurrencyToggle;
