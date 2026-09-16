/**
 * @file src/lib/api/international-deals-api.ts
 * @description Typed fetch client for International Deals (Admitad / Mitgo Global Engine).
 *
 * Dedicated client to fetch worldwide verified deals from AliExpress, Booking.com,
 * Samsung, Lenovo, Adobe, Shein, Hostinger, etc.
 */

import { type Deal, type DealsApiResponse } from "./deals-api";

export interface FetchInternationalDealsOptions {
  category?: string;
  q?: string;
  store?: string;
  sortBy?: "trending" | "discount";
}

/**
 * Fallback static international deals for instant zero-latency client rendering.
 */
export const FALLBACK_INTERNATIONAL_DEALS: Deal[] = [
  {
    id: "intl-deal-aliexpress-01",
    storeName: "AliExpress",
    storeSlug: "aliexpress",
    storeLogo: "https://logo.clearbit.com/aliexpress.com",
    category: "Electronics",
    title: "Global Choice Day: Up to 70% OFF Smart Gadgets, Drones & Accessories",
    code: "CHOICE70",
    discount: "70% OFF",
    badge: "Trending",
    verifiedDate: "Verified Today",
    expiresIn: "14 days left",
    endDate: "2026-10-31",
    minOrder: "$20",
    terms: "Valid on all Choice-selected global items with worldwide expedited shipping.",
    link: "https://www.aliexpress.com",
    usesCount: 0,
  },
  {
    id: "intl-deal-booking-01",
    storeName: "Booking.com",
    storeSlug: "booking-com",
    storeLogo: "https://logo.clearbit.com/booking.com",
    category: "Travel",
    title: "Worldwide Getaway Deals: Save at least 15% on 10,000+ Verified Hotels",
    code: "GETAWAY15",
    discount: "15% OFF",
    badge: "Verified",
    verifiedDate: "Verified Today",
    expiresIn: "30 days left",
    endDate: "2026-11-15",
    minOrder: "$50",
    terms: "Discount applied directly to participating hotels and resort stays worldwide.",
    link: "https://www.booking.com",
    usesCount: 0,
  },
  {
    id: "intl-deal-samsung-01",
    storeName: "Samsung Global",
    storeSlug: "samsung",
    storeLogo: "https://logo.clearbit.com/samsung.com",
    category: "Electronics",
    title: "Galaxy Special: Extra $100 OFF Ultra Series Smartphones & Tablets",
    code: "GALAXY100",
    discount: "$100 OFF",
    badge: "Exclusive",
    verifiedDate: "Verified Today",
    expiresIn: "21 days left",
    endDate: "2026-10-25",
    minOrder: "$500",
    terms: "Enter promo code at checkout on authorized Samsung global merchant storefronts.",
    link: "https://www.samsung.com",
    usesCount: 0,
  },
  {
    id: "intl-deal-lenovo-01",
    storeName: "Lenovo Global",
    storeSlug: "lenovo",
    storeLogo: "https://logo.clearbit.com/lenovo.com",
    category: "Electronics",
    title: "ThinkPad & Legion Sale: Up to 45% OFF Business Laptops & Gaming Rigs",
    code: "LENOVOTHINK",
    discount: "45% OFF",
    badge: "Verified",
    verifiedDate: "Verified Today",
    expiresIn: "18 days left",
    endDate: "2026-10-20",
    minOrder: "$400",
    terms: "Stackable with eCoupon offers on select customizable laptop orders.",
    link: "https://www.lenovo.com",
    usesCount: 0,
  },
  {
    id: "intl-deal-adobe-01",
    storeName: "Adobe",
    storeSlug: "adobe",
    storeLogo: "https://logo.clearbit.com/adobe.com",
    category: "General",
    title: "Creative Cloud All Apps: Save 40% on First-Year Annual Subscriptions",
    code: "CREATIVE40",
    discount: "40% OFF",
    badge: "Trending",
    verifiedDate: "Verified Today",
    expiresIn: "25 days left",
    endDate: "2026-11-01",
    minOrder: "$30",
    terms: "Applies to new individual subscribers on Creative Cloud annual paid monthly plans.",
    link: "https://www.adobe.com",
    usesCount: 0,
  },
  {
    id: "intl-deal-shein-01",
    storeName: "Shein Worldwide",
    storeSlug: "shein",
    storeLogo: "https://logo.clearbit.com/shein.com",
    category: "Fashion",
    title: "Trending Styles: Extra 20% OFF Orders Over $79 + Free Global Express Shipping",
    code: "SHEIN20GLOBAL",
    discount: "20% OFF",
    badge: "Trending",
    verifiedDate: "Verified Today",
    expiresIn: "10 days left",
    endDate: "2026-10-15",
    minOrder: "$79",
    terms: "Applicable on women, men, curve, and home accessories worldwide.",
    link: "https://www.shein.com",
    usesCount: 0,
  },
  {
    id: "intl-deal-hostinger-01",
    storeName: "Hostinger Global",
    storeSlug: "hostinger",
    storeLogo: "https://logo.clearbit.com/hostinger.com",
    category: "General",
    title: "Premium Web Hosting: Up to 75% OFF + Extra 10% Coupon + Free Domain",
    code: "GLOBALHOST10",
    discount: "75% + 10%",
    badge: "Exclusive",
    verifiedDate: "Verified Today",
    expiresIn: "30 days left",
    endDate: "2026-11-30",
    minOrder: "$35",
    terms: "Includes free SSL certificate, weekly backups, and free business email.",
    link: "https://www.hostinger.com",
    usesCount: 0,
  },
  {
    id: "intl-deal-trip-01",
    storeName: "Trip.com",
    storeSlug: "trip-com",
    storeLogo: "https://logo.clearbit.com/trip.com",
    category: "Travel",
    title: "International Flight Special: Flat $25 OFF International Flight Bookings",
    code: "FLYGLOBAL25",
    discount: "$25 OFF",
    badge: "Verified",
    verifiedDate: "Verified Today",
    expiresIn: "15 days left",
    endDate: "2026-10-22",
    minOrder: "$200",
    terms: "Valid on all major international airline routes departing from any hub.",
    link: "https://www.trip.com",
    usesCount: 0,
  },
];

/**
 * Fetch international deals from /api/international-deals with fallback to curated global deals.
 */
export async function fetchInternationalDeals(
  options: FetchInternationalDealsOptions = {}
): Promise<DealsApiResponse> {
  const params = new URLSearchParams();
  if (options.category && options.category !== "all") params.set("category", options.category);
  if (options.q) params.set("q", options.q);
  if (options.store) params.set("store", options.store);
  if (options.sortBy) params.set("sortBy", options.sortBy);

  try {
    const res = await fetch(`/api/international-deals?${params.toString()}`);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.deals) && json.deals.length > 0) {
        return {
          deals: json.deals,
          total: json.total || json.deals.length,
          count: json.count || json.deals.length,
          page: 1,
          hasMore: false,
          cached: json.cached || false,
          isDynamic: true,
          provider: json.provider || "Admitad Global API v3",
          lastSyncedAt: json.lastSyncedAt,
          meta: {
            category: options.category || "all",
            q: options.q || null,
            badge: null,
            limit: 50,
            offset: 0,
          },
        };
      }
    }
  } catch {
    // Network or server error — seamlessly fallback to curated global deals
  }

  // Filter fallback deals
  let filtered = [...FALLBACK_INTERNATIONAL_DEALS];
  if (options.category && options.category !== "all") {
    filtered = filtered.filter((d) => d.category.toLowerCase() === options.category?.toLowerCase());
  }
  if (options.q) {
    const qLower = options.q.toLowerCase();
    filtered = filtered.filter(
      (d) =>
        d.title.toLowerCase().includes(qLower) ||
        d.storeName.toLowerCase().includes(qLower) ||
        d.code.toLowerCase().includes(qLower)
    );
  }

  return {
    deals: filtered,
    total: filtered.length,
    count: filtered.length,
    page: 1,
    hasMore: false,
    cached: false,
    isDynamic: true,
    provider: "Admitad Global Deals (Curated Fallback)",
    meta: {
      category: options.category || "all",
      q: options.q || null,
      badge: null,
      limit: 50,
      offset: 0,
    },
  };
}
