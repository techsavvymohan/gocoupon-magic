import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";

export type CurrencyCode = "INR" | "USD";

export interface CurrencyContextType {
  currency: CurrencyCode;
  symbol: string;
  country: string;
  countryName: string;
  ip?: string;
  isIndia: boolean;
  isLoading: boolean;
  exchangeRate: number; // INR per 1 USD
  setCurrency: (currency: CurrencyCode) => void;
  formatPrice: (amountInInr: number, options?: { showDecimals?: boolean }) => string;
  formatSaving: (amountInInr: number) => string;
  formatPriceString: (priceString: string) => string;
  convertInrToUsd: (amountInInr: number) => number;
  convertUsdToInr: (amountInUsd: number) => number;
}

const INR_PER_USD = 85;

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY_CURRENCY = "gocoupon_currency";
const STORAGE_KEY_COUNTRY = "gocoupon_country";
const STORAGE_KEY_IP = "gocoupon_ip";
const STORAGE_KEY_TIMESTAMP = "gocoupon_geo_timestamp";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // Initialize with fast heuristic / cached storage
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(STORAGE_KEY_CURRENCY);
      if (cached === "INR" || cached === "USD") return cached;

      // Fast client-side timezone check as initial default before IP resolves
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        if (tz.toLowerCase().includes("kolkata") || tz.toLowerCase().includes("calcutta") || tz.toLowerCase().includes("india")) {
          return "INR";
        }
      } catch {}
    }
    // Default for international is USD until IP confirms otherwise
    return "USD";
  });

  const [country, setCountry] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY_COUNTRY) || "";
    }
    return "";
  });

  const [ip, setIp] = useState<string | undefined>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY_IP) || undefined;
    }
    return undefined;
  });

  const [isLoading, setIsLoading] = useState(true);

  // Fetch real IP Geolocation in background
  useEffect(() => {
    let isMounted = true;

    async function detectCountryByIp() {
      // Check if user recently resolved IP in the last 12 hours
      const cachedTs = localStorage.getItem(STORAGE_KEY_TIMESTAMP);
      const cachedCountry = localStorage.getItem(STORAGE_KEY_COUNTRY);
      const cachedCurrency = localStorage.getItem(STORAGE_KEY_CURRENCY);

      if (cachedTs && cachedCountry && cachedCurrency) {
        const age = Date.now() - parseInt(cachedTs, 10);
        if (age < 12 * 60 * 60 * 1000) {
          // Fresh cache valid
          if (isMounted) {
            setCountry(cachedCountry);
            setCurrencyState(cachedCurrency as CurrencyCode);
            setIsLoading(false);
          }
          return;
        }
      }

      let detectedCountry = "";
      let detectedIp = "";

      // 1. Primary: Fast & CORS-friendly api.country.is
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch("https://api.country.is/", {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data && data.country) {
            detectedCountry = String(data.country).toUpperCase();
            detectedIp = data.ip || "";
          }
        }
      } catch {
        // Continue to secondary fallback
      }

      // 2. Secondary fallback: ipwho.is
      if (!detectedCountry) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);
          const res = await fetch("https://ipwho.is/", {
            signal: controller.signal,
            headers: { Accept: "application/json" },
          });
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            if (data && data.country_code) {
              detectedCountry = String(data.country_code).toUpperCase();
              detectedIp = data.ip || "";
            }
          }
        } catch {
          // Continue to heuristic fallback
        }
      }

      // 3. Heuristic fallback (Timezone & Navigator)
      if (!detectedCountry) {
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
          if (
            tz.toLowerCase().includes("kolkata") ||
            tz.toLowerCase().includes("calcutta") ||
            tz.toLowerCase().includes("india")
          ) {
            detectedCountry = "IN";
          } else {
            detectedCountry = "US";
          }
        } catch {
          detectedCountry = "US";
        }
      }

      if (!isMounted) return;

      // Decision rule:
      // If Indian IP -> default currency is INR (₹)
      // If any other IP -> default currency is USD ($)
      const targetCurrency: CurrencyCode = detectedCountry === "IN" ? "INR" : "USD";

      setCountry(detectedCountry);
      if (detectedIp) setIp(detectedIp);
      setCurrencyState(targetCurrency);
      setIsLoading(false);

      // Persist to localStorage
      try {
        localStorage.setItem(STORAGE_KEY_COUNTRY, detectedCountry);
        localStorage.setItem(STORAGE_KEY_CURRENCY, targetCurrency);
        if (detectedIp) localStorage.setItem(STORAGE_KEY_IP, detectedIp);
        localStorage.setItem(STORAGE_KEY_TIMESTAMP, Date.now().toString());
      } catch {}
    }

    detectCountryByIp();

    return () => {
      isMounted = false;
    };
  }, []);

  // Manual currency switcher
  const setCurrency = useCallback((newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem(STORAGE_KEY_CURRENCY, newCurrency);
    } catch {}
  }, []);

  // Helpers
  const convertInrToUsd = useCallback((inr: number) => {
    return inr / INR_PER_USD;
  }, []);

  const convertUsdToInr = useCallback((usd: number) => {
    return Math.round(usd * INR_PER_USD);
  }, []);

  const formatPrice = useCallback(
    (amountInInr: number, options?: { showDecimals?: boolean }) => {
      if (isNaN(amountInInr)) return currency === "INR" ? "₹0" : "$0.00";

      if (currency === "INR") {
        return `₹${Math.round(amountInInr).toLocaleString("en-IN")}`;
      }

      // USD conversion
      const usdValue = amountInInr / INR_PER_USD;
      const showDecimals = options?.showDecimals ?? (usdValue < 50);

      if (showDecimals) {
        return `$${usdValue.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      }

      return `$${Math.round(usdValue).toLocaleString("en-US")}`;
    },
    [currency]
  );

  const formatSaving = useCallback(
    (amountInInr: number) => {
      if (isNaN(amountInInr) || amountInInr <= 0) return "";

      if (currency === "INR") {
        return `Save ₹${Math.round(amountInInr).toLocaleString("en-IN")}`;
      }

      const usdValue = amountInInr / INR_PER_USD;
      if (usdValue < 10) {
        return `Save $${usdValue.toFixed(2)}`;
      }
      return `Save $${Math.round(usdValue).toLocaleString("en-US")}`;
    },
    [currency]
  );

  /**
   * Helper that converts any existing price string like "₹24,990" or "₹500 OFF"
   * into the appropriate currency format.
   */
  const formatPriceString = useCallback(
    (priceString: string): string => {
      if (!priceString) return "";
      if (currency === "INR") return priceString;

      // Extract number from string like "₹24,990" or "₹15,000 OFF"
      const match = priceString.match(/₹\s*([0-9,]+)/);
      if (!match) return priceString;

      const numStr = match[1].replace(/,/g, "");
      const numVal = parseFloat(numStr);
      if (isNaN(numVal)) return priceString;

      const usdVal = numVal / INR_PER_USD;
      const formattedUsd =
        usdVal >= 100
          ? `$${Math.round(usdVal).toLocaleString("en-US")}`
          : `$${usdVal.toFixed(2)}`;

      return priceString.replace(/₹\s*[0-9,]+/, formattedUsd);
    },
    [currency]
  );

  const symbol = currency === "INR" ? "₹" : "$";
  const isIndia = currency === "INR";
  const countryName = country === "IN" ? "India" : country || "Global";

  const contextValue = useMemo<CurrencyContextType>(
    () => ({
      currency,
      symbol,
      country,
      countryName,
      ip,
      isIndia,
      isLoading,
      exchangeRate: INR_PER_USD,
      setCurrency,
      formatPrice,
      formatSaving,
      formatPriceString,
      convertInrToUsd,
      convertUsdToInr,
    }),
    [
      currency,
      symbol,
      country,
      countryName,
      ip,
      isIndia,
      isLoading,
      setCurrency,
      formatPrice,
      formatSaving,
      formatPriceString,
      convertInrToUsd,
      convertUsdToInr,
    ]
  );

  return <CurrencyContext.Provider value={contextValue}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Fallback if rendered outside CurrencyProvider (e.g. testing)
    return {
      currency: "USD",
      symbol: "$",
      country: "",
      countryName: "Global",
      isIndia: false,
      isLoading: false,
      exchangeRate: INR_PER_USD,
      setCurrency: () => {},
      formatPrice: (amt) => `$${(amt / INR_PER_USD).toFixed(2)}`,
      formatSaving: (amt) => `Save $${(amt / INR_PER_USD).toFixed(2)}`,
      formatPriceString: (s) => s,
      convertInrToUsd: (amt) => amt / INR_PER_USD,
      convertUsdToInr: (amt) => amt * INR_PER_USD,
    };
  }
  return context;
}
