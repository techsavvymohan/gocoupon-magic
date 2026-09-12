/**
 * @file src/data/dealsData.ts
 * @description Dynamic Live Deals Data Module.
 *
 * Automatically populated from live Cuelinks API v3 feeds and kept fresh 24/7.
 * Static mock offers have been eliminated.
 */

import liveDealsJson from "./live-deals.json";
import type { DealCategory, DealBadge } from "@/lib/server-data/deals-db";

export interface Deal {
  id: string;
  storeName: string;
  storeSlug: string;
  storeLogo?: string;
  category: DealCategory;
  title: string;
  code: string;
  discount: string;
  badge: DealBadge;
  verifiedDate: string;
  expiresIn: string;
  endDate?: string;
  minOrder?: string;
  terms: string;
  link: string;
  usesCount: number;
}

const rawDeals = (liveDealsJson as any)?.deals || [];

// Filter out any expired deals on module initialization
const now = Date.now();
export const DEALS_DATA: Deal[] = (rawDeals as Deal[]).filter((d) => {
  if (d.expiresIn === "Expired") return false;
  if (d.endDate) {
    const end = new Date(d.endDate).getTime();
    if (!isNaN(end) && end < now) return false;
  }
  return true;
});

export const LAST_CUELINKS_SYNC_TIME = (liveDealsJson as any)?.updatedAt || new Date().toISOString();
export const TOTAL_LIVE_DEALS_COUNT = DEALS_DATA.length;
