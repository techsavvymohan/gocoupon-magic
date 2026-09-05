import React from "react";
import { useCurrency } from "@/context/CurrencyContext";

interface CurrencyToggleProps {
  className?: string;
}

export function CurrencyToggle({ className = "" }: CurrencyToggleProps) {
  const { currency, setCurrency, countryName, country } = useCurrency();

  const isIndia = currency === "INR";

  const toggleCurrency = () => {
    setCurrency(isIndia ? "USD" : "INR");
  };

  return (
    <button
      type="button"
      onClick={toggleCurrency}
      className={`group relative inline-flex h-9 items-center rounded-full border border-border/80 bg-muted/40 p-1 shadow-2xs backdrop-blur-md transition-all duration-200 hover:border-border active:scale-95 cursor-pointer select-none touch-manipulation focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${className}`}
      aria-label={`Current currency: ${currency} (${isIndia ? "₹" : "$"}). Click to switch to ${isIndia ? "USD ($)" : "INR (₹)"}`}
      title={`Location: ${countryName || country || "Global"}. Current: ${currency}. Click to switch.`}
    >
      {/* Rupee Symbol (₹) - Golden when ON */}
      <span
        className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200 ${
          isIndia
            ? "bg-card text-amber-500 dark:text-amber-400 shadow-xs ring-1 ring-amber-500/30 font-black scale-105"
            : "text-muted-foreground/40 font-medium group-hover:text-muted-foreground/70"
        }`}
      >
        <span className="font-mono text-sm leading-none drop-shadow-2xs">₹</span>
      </span>

      {/* Dollar Symbol ($) - Green when ON */}
      <span
        className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200 ${
          !isIndia
            ? "bg-card text-emerald-500 dark:text-emerald-400 shadow-xs ring-1 ring-emerald-500/30 font-black scale-105"
            : "text-muted-foreground/40 font-medium group-hover:text-muted-foreground/70"
        }`}
      >
        <span className="font-mono text-sm leading-none drop-shadow-2xs">$</span>
      </span>
    </button>
  );
}

export default CurrencyToggle;
