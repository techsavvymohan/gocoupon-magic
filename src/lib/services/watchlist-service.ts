/**
 * @file watchlist-service.ts
 * @description Watchlist and Target Price Alert Service.
 *
 * Provides localStorage persistence, target price validation, and alert triggers.
 */

import type { UserWatchItem } from "./canonical-types";

const WATCHLIST_STORAGE_KEY = "gocoupon_user_watchlist_v1";

/**
 * Gets all saved watch items from localStorage.
 */
export function getWatchlist(): UserWatchItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as UserWatchItem[];
  } catch {
    return [];
  }
}

/**
 * Saves a product to the watchlist with a target price.
 */
export function addToWatchlist(item: {
  productId: string;
  productTitle: string;
  productImage: string;
  targetPrice: number;
  currentLowestPrice: number;
  currency?: "INR" | "USD";
  email?: string;
}): UserWatchItem {
  const current = getWatchlist();
  const existingIdx = current.findIndex((i) => i.productId === item.productId);

  const watchItem: UserWatchItem = {
    id: `watch_${item.productId}`,
    productId: item.productId,
    productTitle: item.productTitle,
    productImage: item.productImage,
    targetPrice: item.targetPrice,
    currentLowestPrice: item.currentLowestPrice,
    initialPrice: item.currentLowestPrice,
    targetHit: item.currentLowestPrice <= item.targetPrice,
    currency: item.currency || "INR",
    createdAt: Date.now(),
    notifyChannels: {
      browser: true,
      email: item.email,
    },
  };

  let updated: UserWatchItem[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = watchItem;
  } else {
    updated = [watchItem, ...current];
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("[Watchlist] Failed to save:", e);
    }
  }

  return watchItem;
}

/**
 * Removes an item from the watchlist.
 */
export function removeFromWatchlist(productId: string): void {
  const current = getWatchlist();
  const filtered = current.filter((i) => i.productId !== productId);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.error("[Watchlist] Failed to remove:", e);
    }
  }
}

/**
 * Checks if a product is already in the user's watchlist.
 */
export function isProductInWatchlist(productId: string): boolean {
  const current = getWatchlist();
  return current.some((i) => i.productId === productId);
}

/**
 * Returns a specific watch item.
 */
export function getWatchItem(productId: string): UserWatchItem | undefined {
  const current = getWatchlist();
  return current.find((i) => i.productId === productId);
}
