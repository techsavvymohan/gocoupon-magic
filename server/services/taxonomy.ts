/**
 * @file server/services/taxonomy.ts
 * @description Standardized Category Taxonomy & Classification Engine for GoCoupon.
 *
 * Provides a canonical taxonomy of commerce categories with metadata, subcategories,
 * keyword signatures, and cross-entity aggregation for Stores, Deals, and Coupons.
 */

import { STORES_DB, type StoreRecord } from "../../src/lib/server-data/stores-db.js";
import { DEALS_DB, type DealRecord } from "../../src/lib/server-data/deals-db.js";
import { CANONICAL_COUPONS } from "../../src/data/canonicalCatalogData.js";

export type CanonicalCoupon = typeof CANONICAL_COUPONS[number];

export interface CategoryDefinition {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  subcategories: string[];
  keywords: string[];
  popularStores: string[];
}

export const CANONICAL_CATEGORIES: Record<string, CategoryDefinition> = {
  electronics: {
    id: "electronics",
    name: "Electronics & Gadgets",
    slug: "electronics",
    icon: "💻",
    description: "Smartphones, laptops, smartwatches, headphones, gaming gear, and consumer electronics.",
    subcategories: ["Mobiles & Accessories", "Laptops & Computers", "Audio & Headphones", "Wearables", "Gaming"],
    keywords: ["electronics", "mobile", "phone", "laptop", "headphone", "audio", "camera", "tv", "gadget", "tablet", "pc"],
    popularStores: ["Amazon", "Flipkart", "Croma", "Reliance Digital", "Apple"],
  },
  fashion: {
    id: "fashion",
    name: "Fashion & Apparel",
    slug: "fashion",
    icon: "👗",
    description: "Men's & women's clothing, footwear, luxury fashion, watches, and jewelry.",
    subcategories: ["Men's Clothing", "Women's Clothing", "Footwear", "Watches & Accessories", "Ethnic Wear"],
    keywords: ["fashion", "clothing", "apparel", "shoes", "sneakers", "dress", "shirt", "jeans", "watch", "saree", "kurti"],
    popularStores: ["Myntra", "Ajio", "Meesho", "Zara", "H&M"],
  },
  food: {
    id: "food",
    name: "Food, Dining & Grocery",
    slug: "food",
    icon: "🍕",
    description: "Food delivery vouchers, restaurant dining discounts, online groceries, and gourmet foods.",
    subcategories: ["Food Delivery", "Dining & Restaurants", "Online Grocery", "Gourmet & Snacks"],
    keywords: ["food", "dining", "restaurant", "grocery", "pizza", "burger", "meal", "coffee", "drinks", "supermarket"],
    popularStores: ["Swiggy", "Zomato", "Blinkit", "Zepto", "BigBasket", "Dominos"],
  },
  travel: {
    id: "travel",
    name: "Travel & Bookings",
    slug: "travel",
    icon: "✈️",
    description: "Flight tickets, hotel stays, holiday packages, bus bookings, and cab rides.",
    subcategories: ["Flights", "Hotels", "Holiday Packages", "Buses & Cabs", "Homestays"],
    keywords: ["travel", "flight", "hotel", "holiday", "bus", "cab", "trip", "booking", "resort", "airline"],
    popularStores: ["MakeMyTrip", "Goibibo", "Booking.com", "Yatra", "Cleartrip", "Uber", "Ola"],
  },
  beauty: {
    id: "beauty",
    name: "Beauty & Personal Care",
    slug: "beauty",
    icon: "💄",
    description: "Skincare, haircare, cosmetics, perfumes, wellness supplements, and luxury grooming.",
    subcategories: ["Skincare", "Haircare", "Makeup", "Fragrances", "Men's Grooming"],
    keywords: ["beauty", "skincare", "cosmetics", "makeup", "haircare", "perfume", "grooming", "serum", "lipstick"],
    popularStores: ["Nykaa", "Purplle", "Tira", "Mamaearth", "Biotique"],
  },
  home: {
    id: "home",
    name: "Home, Kitchen & Living",
    slug: "home",
    icon: "🏠",
    description: "Furniture, kitchen appliances, home decor, cookware, and bedding essentials.",
    subcategories: ["Large Appliances", "Kitchenware", "Furniture", "Home Decor", "Bedding"],
    keywords: ["home", "kitchen", "furniture", "appliance", "decor", "cookware", "bedding", "lighting", "refrigerator"],
    popularStores: ["Pepperfry", "Urban Ladder", "IKEA", "Amazon Home", "Wakefit"],
  },
  recharge: {
    id: "recharge",
    name: "Recharge & Bill Payments",
    slug: "recharge",
    icon: "⚡",
    description: "Mobile recharges, DTH, electricity bills, broadband payments, and FASTag cashback.",
    subcategories: ["Mobile Prepaid/Postpaid", "DTH Recharge", "Electricity & Water", "FASTag & Tolls"],
    keywords: ["recharge", "bill", "electricity", "broadband", "dth", "fastag", "utility", "mobile bill"],
    popularStores: ["Paytm", "Google Pay", "PhonePe", "Amazon Pay", "Airtel Thanks"],
  },
  general: {
    id: "general",
    name: "General & Marketplaces",
    slug: "general",
    icon: "🛍️",
    description: "Multi-category megastores, department stores, hypermarkets, and global retail platforms.",
    subcategories: ["Hypermarkets", "Department Stores", "Global Platforms", "Daily Essentials"],
    keywords: ["general", "marketplace", "store", "shopping", "mall", "department", "multi-category"],
    popularStores: ["Amazon", "Walmart", "Flipkart", "Target", "eBay"],
  },
};

/**
 * Normalizes an arbitrary string category into one of our canonical category IDs.
 */
export function normalizeCategoryId(input: string): string {
  if (!input) return "general";
  const lower = input.toLowerCase().trim();

  for (const [id, def] of Object.entries(CANONICAL_CATEGORIES)) {
    if (id === lower || def.name.toLowerCase().includes(lower) || def.slug === lower) {
      return id;
    }
    if (def.keywords.some((kw) => lower.includes(kw))) {
      return id;
    }
  }

  return "general";
}

export interface CategoryStatsItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  subcategories: string[];
  storesCount: number;
  dealsCount: number;
  couponsCount: number;
}

/**
 * Computes live category statistics across all stores, deals, and coupons.
 */
export function getCategoryTaxonomyStats(): CategoryStatsItem[] {
  return Object.values(CANONICAL_CATEGORIES).map((cat) => {
    const matchedStores = STORES_DB.filter(
      (s) => normalizeCategoryId(s.category) === cat.id
    );
    const matchedDeals = DEALS_DB.filter(
      (d) => normalizeCategoryId(d.category) === cat.id
    );
    const matchedCoupons = CANONICAL_COUPONS.filter((c) => {
      const store = STORES_DB.find((s) => s.id === c.storeId || s.name.toLowerCase() === c.storeName.toLowerCase());
      if (store) {
        return normalizeCategoryId(store.category) === cat.id;
      }
      return cat.keywords.some((kw) => (c.title + " " + c.description).toLowerCase().includes(kw));
    });

    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      description: cat.description,
      subcategories: cat.subcategories,
      storesCount: matchedStores.length,
      dealsCount: matchedDeals.length,
      couponsCount: matchedCoupons.length,
    };
  });
}
