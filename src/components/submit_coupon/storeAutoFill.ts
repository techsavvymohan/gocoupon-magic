/**
 * @file src/components/submit_coupon/storeAutoFill.ts
 * @description Smart store website URL and category auto-fill engine for community submissions.
 */

import type { AllowedCategory } from "./validation";

export interface StorePreset {
  name: string;
  url: string;
  category: AllowedCategory;
  domain: string;
  aliases?: string[];
}

export const STORE_PRESETS: StorePreset[] = [
  // Top E-Commerce & Retail
  { name: "Amazon", url: "https://www.amazon.in", domain: "amazon.in", category: "General", aliases: ["amazon india", "amazon.com", "amzn"] },
  { name: "Flipkart", url: "https://www.flipkart.com", domain: "flipkart.com", category: "Electronics", aliases: ["fk"] },
  { name: "Walmart", url: "https://www.walmart.com", domain: "walmart.com", category: "General" },
  { name: "Target", url: "https://www.target.com", domain: "target.com", category: "General" },
  { name: "Tata CLiQ", url: "https://www.tatacliq.com", domain: "tatacliq.com", category: "Fashion", aliases: ["tatacliq", "tata cliq luxury"] },
  { name: "FirstCry", url: "https://www.firstcry.com", domain: "firstcry.com", category: "Home", aliases: ["first cry"] },

  // Fashion & Apparel
  { name: "Myntra", url: "https://www.myntra.com", domain: "myntra.com", category: "Fashion" },
  { name: "Ajio", url: "https://www.ajio.com", domain: "ajio.com", category: "Fashion", aliases: ["ajio luxe"] },
  { name: "Nike", url: "https://www.nike.com", domain: "nike.com", category: "Fashion" },
  { name: "Adidas", url: "https://www.adidas.co.in", domain: "adidas.co.in", category: "Fashion" },
  { name: "Puma", url: "https://in.puma.com", domain: "puma.com", category: "Fashion" },
  { name: "H&M", url: "https://www2.hm.com", domain: "hm.com", category: "Fashion", aliases: ["hm"] },
  { name: "Zara", url: "https://www.zara.com", domain: "zara.com", category: "Fashion" },
  { name: "Levi's", url: "https://www.levi.in", domain: "levi.in", category: "Fashion", aliases: ["levis"] },
  { name: "Shoppers Stop", url: "https://www.shoppersstop.com", domain: "shoppersstop.com", category: "Fashion" },
  { name: "Lenskart", url: "https://www.lenskart.com", domain: "lenskart.com", category: "Fashion" },

  // Electronics & Gadgets
  { name: "boAt", url: "https://www.boat-lifestyle.com", domain: "boat-lifestyle.com", category: "Electronics", aliases: ["boat lifestyle", "boat"] },
  { name: "Samsung", url: "https://www.samsung.com", domain: "samsung.com", category: "Electronics" },
  { name: "Apple", url: "https://www.apple.com", domain: "apple.com", category: "Electronics" },
  { name: "Croma", url: "https://www.croma.com", domain: "croma.com", category: "Electronics" },
  { name: "OnePlus", url: "https://www.oneplus.in", domain: "oneplus.in", category: "Electronics", aliases: ["one plus"] },
  { name: "Xiaomi", url: "https://www.mi.com", domain: "mi.com", category: "Electronics", aliases: ["mi", "redmi"] },
  { name: "Dell", url: "https://www.dell.com", domain: "dell.com", category: "Electronics" },
  { name: "Lenovo", url: "https://www.lenovo.com", domain: "lenovo.com", category: "Electronics" },
  { name: "HP", url: "https://www.hp.com", domain: "hp.com", category: "Electronics" },

  // Beauty & Personal Care
  { name: "Nykaa", url: "https://www.nykaa.com", domain: "nykaa.com", category: "Beauty", aliases: ["nykaa man"] },
  { name: "Plum Goodness", url: "https://plumgoodness.com", domain: "plumgoodness.com", category: "Beauty", aliases: ["plum"] },
  { name: "Mamaearth", url: "https://mamaearth.in", domain: "mamaearth.in", category: "Beauty" },
  { name: "Purplle", url: "https://www.purplle.com", domain: "purplle.com", category: "Beauty" },
  { name: "The Body Shop", url: "https://www.thebodyshop.in", domain: "thebodyshop.in", category: "Beauty" },

  // Travel & Hospitality
  { name: "Booking.com", url: "https://www.booking.com", domain: "booking.com", category: "Travel", aliases: ["booking"] },
  { name: "Agoda", url: "https://www.agoda.com", domain: "agoda.com", category: "Travel" },
  { name: "MakeMyTrip", url: "https://www.makemytrip.com", domain: "makemytrip.com", category: "Travel", aliases: ["mmt"] },
  { name: "Klook", url: "https://www.klook.com", domain: "klook.com", category: "Travel" },
  { name: "Cleartrip", url: "https://www.cleartrip.com", domain: "cleartrip.com", category: "Travel" },
  { name: "Goibibo", url: "https://www.goibibo.com", domain: "goibibo.com", category: "Travel" },
  { name: "Uber", url: "https://www.uber.com", domain: "uber.com", category: "Travel" },

  // Food & Grocery
  { name: "Swiggy", url: "https://www.swiggy.com", domain: "swiggy.com", category: "Food", aliases: ["instamart"] },
  { name: "Zomato", url: "https://www.zomato.com", domain: "zomato.com", category: "Food" },
  { name: "Domino's", url: "https://www.dominos.co.in", domain: "dominos.co.in", category: "Food", aliases: ["dominos"] },
  { name: "Pizza Hut", url: "https://www.pizzahut.co.in", domain: "pizzahut.co.in", category: "Food" },
  { name: "KFC", url: "https://online.kfc.co.in", domain: "kfc.co.in", category: "Food" },
  { name: "Blinkit", url: "https://blinkit.com", domain: "blinkit.com", category: "Food" },
  { name: "Zepto", url: "https://www.zeptonow.com", domain: "zeptonow.com", category: "Food" },
  { name: "BigBasket", url: "https://www.bigbasket.com", domain: "bigbasket.com", category: "Food" },

  // Home & Furniture
  { name: "Pepperfry", url: "https://www.pepperfry.com", domain: "pepperfry.com", category: "Home" },
  { name: "Urban Ladder", url: "https://www.urbanladder.com", domain: "urbanladder.com", category: "Home" },
  { name: "Wakefit", url: "https://www.wakefit.co", domain: "wakefit.co", category: "Home" },

  // Hosting, SaaS & Telecom Recharge
  { name: "Hostinger", url: "https://www.hostinger.com", domain: "hostinger.com", category: "General" },
  { name: "Jio", url: "https://www.jio.com", domain: "jio.com", category: "Recharge" },
  { name: "Airtel", url: "https://www.airtel.in", domain: "airtel.in", category: "Recharge" },
  { name: "Vi", url: "https://www.myvi.in", domain: "myvi.in", category: "Recharge", aliases: ["vodafone", "idea"] },
  { name: "Paytm", url: "https://paytm.com", domain: "paytm.com", category: "Recharge" },
];

function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Searches for stores matching a query for live autocomplete suggestions.
 */
export function searchStorePresets(query: string, limit = 5): StorePreset[] {
  if (!query || query.trim().length < 1) return [];
  const q = normalize(query);

  return STORE_PRESETS.filter((store) => {
    if (normalize(store.name).includes(q)) return true;
    if (normalize(store.domain).includes(q)) return true;
    if (store.aliases?.some((a) => normalize(a).includes(q))) return true;
    return false;
  }).slice(0, limit);
}

/**
 * Finds an exact or fuzzy match for a store name and returns auto-fill suggestions.
 */
export function resolveStoreAutoFill(storeName: string): {
  url?: string;
  category?: AllowedCategory;
  matchedStore?: StorePreset;
} | null {
  if (!storeName || !storeName.trim()) return null;
  const q = normalize(storeName);

  // Exact or alias match
  const match = STORE_PRESETS.find((store) => {
    if (normalize(store.name) === q) return true;
    if (store.aliases?.some((a) => normalize(a) === q)) return true;
    return false;
  });

  if (match) {
    return {
      url: match.url,
      category: match.category,
      matchedStore: match,
    };
  }

  // If user typed a domain name like "store.com"
  if (storeName.includes(".") && !storeName.includes(" ")) {
    let clean = storeName.trim();
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = `https://${clean}`;
    }
    return {
      url: clean,
      category: "General",
    };
  }

  return null;
}
