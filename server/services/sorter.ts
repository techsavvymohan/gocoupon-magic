/**
 * @file server/services/sorter.ts
 * @description Universal Multi-Criteria Sorting Engine for GoCoupon.
 *
 * Implements strict type-safe sorting algorithms across:
 * - Stores: Popularity (weighted algorithm), Rating, Coupon Count, Max Discount, Cashback %, Name
 * - Deals: Discount %, Trending (usesCount), Verification Status, Expiration Urgency, Store Name
 * - Coupons: Verified Success Rate, Savings Amount, Freshness, Store Name
 * - Search Results: Accuracy Score, Price (asc/desc), Discount %
 */

import type { StoreRecord } from "../../src/lib/server-data/stores-db.js";
import type { DealRecord } from "../../src/lib/server-data/deals-db.js";
import type { CanonicalCoupon } from "./taxonomy.js";

export type SortOrder = "asc" | "desc";

// ── 1. Stores Sorting ────────────────────────────────────────────────────────

export type StoreSortField = "popularity" | "rating" | "couponsCount" | "maxDiscount" | "cashback" | "name";

function parsePercentValue(text: string): number {
  if (!text) return 0;
  const match = text.match(/([0-9.]+)\s*%/);
  return match ? parseFloat(match[1]) : 0;
}

function computeStorePopularityScore(store: StoreRecord): number {
  // Weighted: rating * log2(couponsCount + 2) + badge bonus
  const badgeBonus = store.badge?.includes("Top") ? 5 : store.badge ? 2 : 0;
  return store.rating * Math.log2(store.couponsCount + 2) + badgeBonus;
}

export function sortStores(
  stores: StoreRecord[],
  sortBy: StoreSortField = "popularity",
  order: SortOrder = "desc"
): StoreRecord[] {
  const sorted = [...stores];

  sorted.sort((a, b) => {
    let comp = 0;
    switch (sortBy) {
      case "rating":
        comp = a.rating - b.rating;
        break;
      case "couponsCount":
        comp = a.couponsCount - b.couponsCount;
        break;
      case "maxDiscount":
        comp = parsePercentValue(a.maxDiscount) - parsePercentValue(b.maxDiscount);
        break;
      case "cashback":
        comp = parsePercentValue(a.cashbackRate) - parsePercentValue(b.cashbackRate);
        break;
      case "name":
        comp = a.name.localeCompare(b.name);
        break;
      case "popularity":
      default:
        comp = computeStorePopularityScore(a) - computeStorePopularityScore(b);
        break;
    }

    return order === "asc" ? comp : -comp;
  });

  return sorted;
}

// ── 2. Deals Sorting ──────────────────────────────────────────────────────────

export type DealSortField = "discount" | "trending" | "verified" | "expiry" | "store";

function parseDealDiscountValue(text: string): number {
  if (!text) return 0;
  // % discount e.g. "60% OFF" -> 60
  const pctMatch = text.match(/([0-9]+)\s*%/);
  if (pctMatch) return parseInt(pctMatch[1], 10);

  // Flat rupee discount e.g. "₹2,000 OFF" -> normalized score 40
  const rupeeMatch = text.match(/(?:₹|Rs\.?)\s*([0-9,]+)/i);
  if (rupeeMatch) {
    const val = parseInt(rupeeMatch[1].replace(/,/g, ""), 10);
    return Math.min(100, Math.round(val / 50)); // Normalize rupee values into equivalent discount scale
  }

  return 0;
}

function parseExpiryDays(expiresIn: string): number {
  if (!expiresIn) return 999;
  if (expiresIn.includes("day left") || expiresIn.includes("1 day")) return 1;
  const match = expiresIn.match(/([0-9]+)\s*days?/i);
  return match ? parseInt(match[1], 10) : 30;
}

export function sortDeals(
  deals: DealRecord[],
  sortBy: DealSortField = "discount",
  order: SortOrder = "desc"
): DealRecord[] {
  const sorted = [...deals];

  sorted.sort((a, b) => {
    let comp = 0;
    switch (sortBy) {
      case "trending":
        comp = a.usesCount - b.usesCount;
        break;
      case "verified":
        comp = (a.badge?.toLowerCase() === "verified" ? 1 : 0) - (b.badge?.toLowerCase() === "verified" ? 1 : 0);
        break;
      case "expiry":
        // Sort by days left (fewer days = more urgent)
        comp = parseExpiryDays(a.expiresIn) - parseExpiryDays(b.expiresIn);
        break;
      case "store":
        comp = a.storeName.localeCompare(b.storeName);
        break;
      case "discount":
      default:
        comp = parseDealDiscountValue(a.discount) - parseDealDiscountValue(b.discount);
        break;
    }

    return order === "asc" ? comp : -comp;
  });

  return sorted;
}

// ── 3. Coupons Sorting ────────────────────────────────────────────────────────

export type CouponSortField = "successRate" | "discount" | "freshness" | "store";

export function sortCoupons(
  coupons: CanonicalCoupon[],
  sortBy: CouponSortField = "successRate",
  order: SortOrder = "desc"
): CanonicalCoupon[] {
  const sorted = [...coupons];

  sorted.sort((a, b) => {
    let comp = 0;
    switch (sortBy) {
      case "discount":
        comp = (a.discountPercent || (a.discountAmount ? a.discountAmount / 100 : 0)) -
               (b.discountPercent || (b.discountAmount ? b.discountAmount / 100 : 0));
        break;
      case "store":
        comp = a.storeName.localeCompare(b.storeName);
        break;
      case "freshness":
        comp = (a.lastVerified?.includes("Today") ? 1 : 0) - (b.lastVerified?.includes("Today") ? 1 : 0);
        break;
      case "successRate":
      default:
        comp = (a.successRate ?? 0) - (b.successRate ?? 0);
        break;
    }

    return order === "asc" ? comp : -comp;
  });

  return sorted;
}
