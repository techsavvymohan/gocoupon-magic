import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";

export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP" | "AED" | "SGD" | "CAD" | "AUD";

export interface CurrencyMeta {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
  rateToInr: number; // How many INR = 1 unit of this currency
}

export const SUPPORTED_CURRENCIES: CurrencyMeta[] = [
  { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳", rateToInr: 1.0 },
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸", rateToInr: 85.0 },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺", rateToInr: 92.5 },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧", rateToInr: 108.0 },
  { code: "AED", symbol: "AED ", name: "UAE Dirham", flag: "🇦🇪", rateToInr: 23.1 },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", flag: "🇸🇬", rateToInr: 64.2 },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦", rateToInr: 62.5 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "🇦🇺", rateToInr: 56.0 },
];

export interface CurrencyContextType {
  currency: CurrencyCode;
  symbol: string;
  currentCurrency: CurrencyMeta;
  currencies: CurrencyMeta[];
  country: string;
  countryName: string;
  ip?: string;
  isIndia: boolean;
  isLoading: boolean;
  exchangeRate: number; // INR per 1 USD (for backward compatibility)
  setCurrency: (currency: CurrencyCode) => void;
  formatPrice: (amountInInr: number, options?: { showDecimals?: boolean }) => string;
  formatSaving: (amountInInr: number) => string;
  formatPriceString: (priceString: string) => string;
  convertInrToUsd: (amountInInr: number) => number;
  convertUsdToInr: (amountInUsd: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY_CURRENCY = "gocoupon_currency";
const STORAGE_KEY_COUNTRY = "gocoupon_country";
const STORAGE_KEY_IP = "gocoupon_ip";
const STORAGE_KEY_TIMESTAMP = "gocoupon_geo_timestamp";

function getCurrencyForCountry(countryCode: string): CurrencyCode {
  const code = countryCode.toUpperCase().trim();
  if (code === "IN") return "INR";
  if (code === "GB" || code === "UK") return "GBP";
  if (["DE", "FR", "ES", "IT", "NL", "BE", "AT", "IE", "PT", "FI", "GR"].includes(code)) return "EUR";
  if (["AE", "SA", "QA", "KW", "OM", "BH"].includes(code)) return "AED";
  if (["SG", "MY", "ID", "TH", "VN", "PH"].includes(code)) return "SGD";
  if (code === "CA") return "CAD";
  if (code === "AU" || code === "NZ") return "AUD";
  return "USD";
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(STORAGE_KEY_CURRENCY) as CurrencyCode;
      if (cached && SUPPORTED_CURRENCIES.some((c) => c.code === cached)) return cached;

      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        if (tz.toLowerCase().includes("kolkata") || tz.toLowerCase().includes("calcutta") || tz.toLowerCase().includes("india")) {
          return "INR";
        }
        if (tz.toLowerCase().includes("london") || tz.toLowerCase().includes("europe/belfast")) {
          return "GBP";
        }
        if (tz.toLowerCase().includes("berlin") || tz.toLowerCase().includes("paris") || tz.toLowerCase().includes("madrid") || tz.toLowerCase().includes("rome")) {
          return "EUR";
        }
        if (tz.toLowerCase().includes("dubai")) {
          return "AED";
        }
        if (tz.toLowerCase().includes("singapore")) {
          return "SGD";
        }
      } catch {}
    }
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

  // Background IP Geolocation detection
  useEffect(() => {
    let isMounted = true;

    async function detectCountryByIp() {
      const cachedTs = localStorage.getItem(STORAGE_KEY_TIMESTAMP);
      const cachedCountry = localStorage.getItem(STORAGE_KEY_COUNTRY);
      const cachedCurrency = localStorage.getItem(STORAGE_KEY_CURRENCY);

      if (cachedTs && cachedCountry && cachedCurrency) {
        const age = Date.now() - parseInt(cachedTs, 10);
        if (age < 12 * 60 * 60 * 1000) {
          if (isMounted) {
            setCountry(cachedCountry);
            if (SUPPORTED_CURRENCIES.some((c) => c.code === cachedCurrency)) {
              setCurrencyState(cachedCurrency as CurrencyCode);
            }
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
        const timeoutId = setTimeout(() => controller.abort(), 3000);
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
      } catch {}

      // 2. Secondary fallback: ipwho.is
      if (!detectedCountry) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
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
        } catch {}
      }

      if (!detectedCountry) {
        detectedCountry = "US";
      }

      if (!isMounted) return;

      const targetCurrency = getCurrencyForCountry(detectedCountry);

      setCountry(detectedCountry);
      if (detectedIp) setIp(detectedIp);
      setCurrencyState(targetCurrency);
      setIsLoading(false);

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

  const currentCurrency = useMemo(() => {
    return SUPPORTED_CURRENCIES.find((c) => c.code === currency) || SUPPORTED_CURRENCIES[0];
  }, [currency]);

  const symbol = currentCurrency.symbol;
  const isIndia = currency === "INR";

  const setCurrency = useCallback((newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem(STORAGE_KEY_CURRENCY, newCurrency);
    } catch {}
  }, []);

  const convertInrToUsd = useCallback((inr: number) => {
    return inr / 85.0;
  }, []);

  const convertUsdToInr = useCallback((usd: number) => {
    return Math.round(usd * 85.0);
  }, []);

  const formatPrice = useCallback(
    (amountInInr: number, options?: { showDecimals?: boolean }) => {
      if (isNaN(amountInInr)) return `${symbol}0`;

      if (currency === "INR") {
        return `₹${Math.round(amountInInr).toLocaleString("en-IN")}`;
      }

      const rate = currentCurrency.rateToInr;
      const convertedValue = amountInInr / rate;
      const showDecimals = options?.showDecimals ?? (convertedValue < 50);

      const formatted = showDecimals
        ? convertedValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : Math.round(convertedValue).toLocaleString("en-US");

      return `${symbol}${formatted}`;
    },
    [currency, currentCurrency, symbol]
  );

  const formatSaving = useCallback(
    (amountInInr: number) => {
      if (isNaN(amountInInr) || amountInInr <= 0) return "";

      if (currency === "INR") {
        return `Save ₹${Math.round(amountInInr).toLocaleString("en-IN")}`;
      }

      const rate = currentCurrency.rateToInr;
      const convertedValue = amountInInr / rate;

      if (convertedValue < 10) {
        return `Save ${symbol}${convertedValue.toFixed(2)}`;
      }
      return `Save ${symbol}${Math.round(convertedValue).toLocaleString("en-US")}`;
    },
    [currency, currentCurrency, symbol]
  );

  const formatPriceString = useCallback(
    (priceString: string): string => {
      if (!priceString) return "";
      if (currency === "INR") return priceString;

      return priceString.replace(/₹\s*([\d,]+(\.\d+)?)/g, (_match, p1) => {
        const numeric = parseFloat(p1.replace(/,/g, ""));
        if (isNaN(numeric)) return priceString;
        return formatPrice(numeric);
      });
    },
    [currency, formatPrice]
  );

  const value = useMemo(
    () => ({
      currency,
      symbol,
      currentCurrency,
      currencies: SUPPORTED_CURRENCIES,
      country,
      countryName: country,
      ip,
      isIndia,
      isLoading,
      exchangeRate: 85.0,
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
      currentCurrency,
      country,
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

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
