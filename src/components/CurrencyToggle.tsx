import React from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { Globe } from "lucide-react";

export function CurrencyToggle({ className = "" }: { className?: string }) {
  const { currency, setCurrency, country, countryName } = useCurrency();

  const toggleCurrency = () => {
    const next = currency === "INR" ? "USD" : "INR";
    setCurrency(next);
  };

  const isIndia = currency === "INR";

  return (
    <button
      type="button"
      onClick={toggleCurrency}
      className={`group relative inline-flex h-9 items-center gap-1.5 rounded-full border border-border/80 bg-card/80 px-2.5 sm:px-3 text-xs font-semibold text-foreground shadow-2xs backdrop-blur-md transition-all duration-200 hover:border-primary/40 hover:bg-muted active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary touch-manipulation select-none min-h-[36px] ${className}`}
      aria-label={`Current currency: ${currency}. Click to switch to ${currency === "INR" ? "USD ($)" : "INR (₹)"}`}
      title={`Detected location: ${countryName || country || "Global"}. Click to switch currency.`}
    >
      <span className="flex items-center gap-1">
        {isIndia ? (
          <span className="text-sm leading-none" role="img" aria-label="India flag">
            🇮🇳
          </span>
        ) : (
          <span className="text-sm leading-none" role="img" aria-label="Global icon">
            🌐
          </span>
        )}
        <span className="font-mono text-[11px] font-bold text-foreground group-hover:text-primary transition-colors">
          {currency} ({isIndia ? "₹" : "$"})
        </span>
      </span>
    </button>
  );
}
