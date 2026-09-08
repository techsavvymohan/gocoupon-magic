/**
 * @file server/services/geo-resolver.ts
 * @description Geolocation & Multi-Currency International Engine.
 *
 * Resolves user region from headers (Cloudflare cf-ipcountry or x-forwarded-for),
 * provides localized currencies, exchange rates, and regional retailer mappings.
 */

import type { RegionCode } from "./bank-offers.js";

export interface GeoProfile {
  region: RegionCode;
  countryName: string;
  currency: "INR" | "USD" | "GBP" | "EUR" | "AED";
  currencySymbol: string;
  primaryStores: string[];
  locale: string;
}

export const REGIONAL_PROFILES: Record<RegionCode, GeoProfile> = {
  IN: {
    region: "IN",
    countryName: "India",
    currency: "INR",
    currencySymbol: "₹",
    primaryStores: ["Amazon India", "Flipkart", "Croma", "Myntra", "Tata Cliq", "Reliance Digital"],
    locale: "en-IN",
  },
  US: {
    region: "US",
    countryName: "United States",
    currency: "USD",
    currencySymbol: "$",
    primaryStores: ["Amazon US", "Walmart", "Best Buy", "Target", "Newegg", "B&H Photo"],
    locale: "en-US",
  },
  UK: {
    region: "UK",
    countryName: "United Kingdom",
    currency: "GBP",
    currencySymbol: "£",
    primaryStores: ["Amazon UK", "Currys", "Argos", "ASOS", "Very", "John Lewis"],
    locale: "en-GB",
  },
  EU: {
    region: "EU",
    countryName: "European Union",
    currency: "EUR",
    currencySymbol: "€",
    primaryStores: ["Amazon EU", "MediaMarkt", "Fnac", "Zalando", "Otto"],
    locale: "de-DE",
  },
  AE: {
    region: "AE",
    countryName: "United Arab Emirates",
    currency: "AED",
    currencySymbol: "AED",
    primaryStores: ["Amazon UAE", "Noon", "Sharaf DG", "Namshi", "Carrefour UAE"],
    locale: "en-AE",
  },
};

/**
 * Exchange rates relative to USD (baseline as of 2026).
 */
export const FOREX_RATES_TO_USD: Record<string, number> = {
  USD: 1.0,
  EUR: 1.08,
  GBP: 1.28,
  INR: 0.0116, // ~86 INR per USD
  AED: 0.272,  // ~3.67 AED per USD
};

/**
 * Resolves the geographic profile from request headers with fallback to India.
 */
export function resolveGeoProfile(headers: Record<string, string | string[] | undefined>): GeoProfile {
  const cfCountry = typeof headers["cf-ipcountry"] === "string" ? headers["cf-ipcountry"].toUpperCase() : "";
  const countryHeader = typeof headers["x-country-code"] === "string" ? headers["x-country-code"].toUpperCase() : "";
  const candidate = cfCountry || countryHeader;

  if (candidate === "US" || candidate === "CA") return REGIONAL_PROFILES.US;
  if (candidate === "GB" || candidate === "UK") return REGIONAL_PROFILES.UK;
  if (candidate === "AE" || candidate === "SA" || candidate === "QA") return REGIONAL_PROFILES.AE;
  if (["DE", "FR", "ES", "IT", "NL", "SE"].includes(candidate)) return REGIONAL_PROFILES.EU;
  if (candidate === "IN") return REGIONAL_PROFILES.IN;

  // Default fallback to India (flagship market)
  return REGIONAL_PROFILES.IN;
}

/**
 * Formats a numerical amount with the correct regional currency symbol.
 */
export function formatRegionalPrice(amount: number, currency: string = "INR"): string {
  switch (currency.toUpperCase()) {
    case "USD":
      return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case "GBP":
      return `£${amount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case "EUR":
      return `€${amount.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case "AED":
      return `AED ${amount.toLocaleString("en-AE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    case "INR":
    default:
      return `₹${amount.toLocaleString("en-IN")}`;
  }
}
