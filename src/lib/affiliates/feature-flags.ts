/**
 * @file feature-flags.ts
 * @description Env-driven feature flags for the affiliate system.
 *
 * SECURITY NOTE:
 *   Only VITE_-prefixed variables are included in the browser bundle.
 *   AMAZON_CLIENT_ID and AMAZON_CLIENT_SECRET must NEVER use the VITE_ prefix.
 *   Those secrets live only in Vercel Serverless Function environment variables.
 *
 * Usage:
 *   import { AMAZON_ENABLED } from "@/lib/affiliates/feature-flags";
 *   if (AMAZON_ENABLED) { ... }
 */

function readBoolFlag(key: string, defaultValue = false): boolean {
  const val = import.meta.env[key];
  if (val === undefined || val === null || val === "") return defaultValue;
  return val === "true" || val === "1";
}

/** Master switch: disables the entire affiliate system when false */
export const AFFILIATE_SYSTEM_ENABLED: boolean = readBoolFlag(
  "VITE_AFFILIATE_SYSTEM_ENABLED",
  true,
);

/**
 * Amazon provider flag.
 * Set VITE_AMAZON_ENABLED=true ONLY after adding real credentials to env.
 * The website continues working normally when this is false.
 */
export const AMAZON_ENABLED: boolean =
  AFFILIATE_SYSTEM_ENABLED && readBoolFlag("VITE_AMAZON_ENABLED", false);

/**
 * Mock provider flag.
 * Set VITE_MOCK_PROVIDER_ENABLED=true during development to test the
 * full product UI without real provider credentials.
 * Must NEVER be true in production.
 */
export const MOCK_PROVIDER_ENABLED: boolean =
  AFFILIATE_SYSTEM_ENABLED && readBoolFlag("VITE_MOCK_PROVIDER_ENABLED", true);

/** Impact provider (not yet implemented — always false in Phase 1) */
export const IMPACT_ENABLED: boolean =
  AFFILIATE_SYSTEM_ENABLED && readBoolFlag("VITE_IMPACT_ENABLED", false);

/** Awin provider (not yet implemented — always false in Phase 1) */
export const AWIN_ENABLED: boolean =
  AFFILIATE_SYSTEM_ENABLED && readBoolFlag("VITE_AWIN_ENABLED", false);

/** CJ provider (not yet implemented — always false in Phase 1) */
export const CJ_ENABLED: boolean =
  AFFILIATE_SYSTEM_ENABLED && readBoolFlag("VITE_CJ_ENABLED", false);

/** ShareASale provider (not yet implemented — always false in Phase 1) */
export const SHARESALE_ENABLED: boolean =
  AFFILIATE_SYSTEM_ENABLED && readBoolFlag("VITE_SHARESALE_ENABLED", false);

/**
 * Utility: returns true if at least one real (non-mock) provider is enabled.
 * Used to decide whether to show affiliate disclosure.
 */
export function hasAnyRealProviderEnabled(): boolean {
  return AMAZON_ENABLED || IMPACT_ENABLED || AWIN_ENABLED || CJ_ENABLED || SHARESALE_ENABLED;
}

/**
 * Utility: returns a list of currently enabled provider names (for logging/debugging).
 */
export function getEnabledProviders(): string[] {
  const providers: string[] = [];
  if (AMAZON_ENABLED) providers.push("amazon");
  if (IMPACT_ENABLED) providers.push("impact");
  if (AWIN_ENABLED) providers.push("awin");
  if (CJ_ENABLED) providers.push("cj");
  if (SHARESALE_ENABLED) providers.push("sharesale");
  if (MOCK_PROVIDER_ENABLED) providers.push("mock");
  return providers;
}
