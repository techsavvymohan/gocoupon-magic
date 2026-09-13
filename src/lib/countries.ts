/**
 * @file src/lib/countries.ts
 * @description Country definitions and normalization for GoCoupon stores.
 */

export const DEFAULT_COUNTRY_CODE = "IN";

export interface CountryOption {
  code: string;
  name: string;
  flag: string;
}

export const SUPPORTED_COUNTRIES: CountryOption[] = [
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "GLOBAL", name: "Global / Worldwide", flag: "🌍" },
];

export function normalizeCountryCode(code?: string): string {
  if (!code) return DEFAULT_COUNTRY_CODE;
  const upper = String(code).trim().toUpperCase();
  const match = SUPPORTED_COUNTRIES.find((c) => c.code === upper);
  return match ? match.code : DEFAULT_COUNTRY_CODE;
}

export function sanitizeCountryList(list: any): string[] {
  if (!Array.isArray(list)) return [DEFAULT_COUNTRY_CODE];
  const cleaned = list
    .map((c) => normalizeCountryCode(c))
    .filter((c, idx, arr) => arr.indexOf(c) === idx);
  return cleaned.length > 0 ? cleaned : [DEFAULT_COUNTRY_CODE];
}
