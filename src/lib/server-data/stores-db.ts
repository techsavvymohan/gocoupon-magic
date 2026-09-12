/**
 * @file src/lib/server-data/stores-db.ts
 * @description Server-side store data module.
 *
 * This is the single source of truth for store data that the API reads.
 * The frontend no longer imports storesData.ts directly — it fetches
 * from /api/stores instead, which reads from this module.
 *
 * Phase 2 upgrade: Replace the exported array with a Supabase query:
 *   const { data } = await supabase.from("stores").select("*");
 *   return data;
 */

export interface StoreRecord {
  id: string;
  name: string;
  slug: string;
  category: "Fashion" | "Electronics" | "Food" | "Travel" | "Beauty" | "Home" | "Recharge" | "General";
  logo?: string;
  fallbackIcon: string;
  badge?: string;
  rating: number;
  couponsCount: number;
  maxDiscount: string;
  cashbackRate: string;
  description: string;
  features: string[];
  popularCoupon: {
    code: string;
    description: string;
    discount: string;
  };
  link: string;
  isInternalRoute?: boolean;
}

// ---------------------------------------------------------------------------
// Phase 1: Static data served through the API (NOT bundled into the browser)
// ---------------------------------------------------------------------------
// This data is identical to what was in src/data/storesData.ts, but now it
// lives server-side. The frontend no longer imports it directly — it calls
// GET /api/stores which returns this as JSON.
//
// Phase 2: Replace this with:
//   const { data, error } = await supabase.from("stores").select("*").order("rating", { ascending: false });
//   if (error) throw error;
//   return data as StoreRecord[];
// ---------------------------------------------------------------------------

export const STORES_DB: StoreRecord[] = [
  {
    id: "amazon",
    name: "Amazon",
    slug: "amazon-coupons",
    category: "General",
    logo: "/Brand logos/Amazon_logo.svg.webp",
    fallbackIcon: "📦",
    badge: "Top Global Store",
    rating: 4.9,
    couponsCount: 68,
    maxDiscount: "75% OFF",
    cashbackRate: "Up to 7.0%",
    description: "The world's largest online marketplace with Prime delivery, Lightning deals, auto-clipped vouchers, and category-wide discounts on 100M+ products worldwide.",
    features: ["Voucher Auto-Clipper", "Prime Delivery Deals", "Lightning Deals Auto-Scan"],
    popularCoupon: {
      code: "AMZSAVE15",
      description: "15% instant savings on tech accessories, home essentials & personal care",
      discount: "15% OFF",
    },
    link: "/amazon-coupons",
    isInternalRoute: true,
  },
  {
    id: "walmart",
    name: "Walmart",
    slug: "walmart-coupons",
    category: "General",
    logo: "/icons/WMT-Wordmark-Small-TrueBlue-RGB.png",
    fallbackIcon: "🛒",
    badge: "Everyday Low Prices",
    rating: 4.8,
    couponsCount: 45,
    maxDiscount: "60% OFF",
    cashbackRate: "Up to 6.5%",
    description: "Global retail leader offering rollback discounts, electronics deals, groceries, home appliances, and Walmart+ member perks.",
    features: ["Rollback Discounts", "Free Curbside Pickup", "Walmart+ Exclusive Codes"],
    popularCoupon: {
      code: "ROLLBACK20",
      description: "Extra $20 off orders over $75 across electronics and home goods",
      discount: "$20 OFF",
    },
    link: "https://www.walmart.com",
  },
  {
    id: "target",
    name: "Target",
    slug: "target-coupons",
    category: "General",
    logo: "/icons/target.svg",
    fallbackIcon: "🎯",
    badge: "Circle Rewards",
    rating: 4.7,
    couponsCount: 38,
    maxDiscount: "50% OFF",
    cashbackRate: "Up to 5.0%",
    description: "Popular lifestyle retailer known for trendy fashion, home decor, electronics, and Target Circle automatic rewards.",
    features: ["Target Circle Auto-Apply", "RedCard 5% Extra Savings", "Weekly Ad Discounts"],
    popularCoupon: {
      code: "CIRCLESAVE",
      description: "5% off your purchase with Target Circle membership",
      discount: "5% OFF",
    },
    link: "https://www.target.com",
  },
  {
    id: "flipkart",
    name: "Flipkart",
    slug: "flipkart-coupons",
    category: "General",
    logo: "/Brand logos/flipkart.webp",
    fallbackIcon: "🛍️",
    badge: "India's #1 Store",
    rating: 4.9,
    couponsCount: 72,
    maxDiscount: "80% OFF",
    cashbackRate: "Up to 8.5%",
    description: "India's leading e-commerce marketplace with SuperCoins, Bank of the Day offers, and Flash Sale lightning deals across 150M+ products.",
    features: ["SuperCoin Auto-Collect", "Bank Flash Deals", "No Cost EMI Finder"],
    popularCoupon: {
      code: "FKSAVE20",
      description: "Flat ₹200 OFF on Fashion, Electronics & Home with Flipkart Pay Later",
      discount: "₹200 OFF",
    },
    link: "/flipkart-coupons",
    isInternalRoute: true,
  },
  {
    id: "myntra",
    name: "Myntra",
    slug: "myntra-coupons",
    category: "Fashion",
    logo: "/Brand logos/myntra.webp",
    fallbackIcon: "👗",
    badge: "Fashion Leader",
    rating: 4.8,
    couponsCount: 56,
    maxDiscount: "70% OFF",
    cashbackRate: "Up to 6.2%",
    description: "India's #1 fashion destination with Myntra Insider exclusive early access, End of Reason Sale coupons, and brand-curated seasonal fashion lookbooks.",
    features: ["Insider Club Early Access", "Style Pass Rewards", "Branded Sale Auto-Apply"],
    popularCoupon: {
      code: "MYNTRASAVE",
      description: "Flat ₹500 off on first branded fashion purchase above ₹1,999",
      discount: "₹500 OFF",
    },
    link: "/myntra-coupons",
    isInternalRoute: true,
  },
  {
    id: "meesho",
    name: "Meesho",
    slug: "meesho-coupons",
    category: "Fashion",
    logo: "/Brand logos/Meesho_logo.webp",
    fallbackIcon: "🏷️",
    badge: "Budget Fashion",
    rating: 4.7,
    couponsCount: 43,
    maxDiscount: "80% OFF",
    cashbackRate: "Up to 5.5%",
    description: "Social commerce powerhouse featuring direct-from-manufacturer pricing, ethnic wear, home decor, and budget electronics with zero delivery charges.",
    features: ["0 Delivery Charges", "Free Returns", "Direct Factory Pricing"],
    popularCoupon: {
      code: "MEESHOFREE",
      description: "Free delivery on all Meesho orders with no minimum order value",
      discount: "Free Delivery",
    },
    link: "/meesho-coupons",
    isInternalRoute: true,
  },
  {
    id: "croma",
    name: "Croma",
    slug: "croma-coupons",
    category: "Electronics",
    fallbackIcon: "⚡",
    badge: "Electronics Expert",
    rating: 4.7,
    couponsCount: 29,
    maxDiscount: "40% OFF",
    cashbackRate: "Up to 3.5%",
    description: "India's leading consumer electronics and appliances specialist with expert product advice, extended warranties, and Tata NeuPass rewards.",
    features: ["Expert Product Advice", "Extended Warranty", "NeuCoins Rewards"],
    popularCoupon: {
      code: "CROMASAVE10",
      description: "10% instant discount on mobiles, laptops & home appliances over ₹10,000",
      discount: "10% OFF",
    },
    link: "https://www.croma.com",
  },
  {
    id: "nykaa",
    name: "Nykaa",
    slug: "nykaa-coupons",
    category: "Beauty",
    logo: "/Brand logos/nykaa-logo.webp",
    fallbackIcon: "💄",
    badge: "Beauty Authority",
    rating: 4.8,
    couponsCount: 44,
    maxDiscount: "50% OFF",
    cashbackRate: "Up to 4.8%",
    description: "India's premium beauty and wellness marketplace with 4,000+ authentic brands including L'Oreal, Maybelline, Kay Beauty, and exclusive Nykaa Black luxury launches.",
    features: ["Authentic Brand Guarantee", "Beauty Advisor Chat", "Nykaa Pink Rewards"],
    popularCoupon: {
      code: "NYKAABEAUTY",
      description: "Get 20% OFF on first beauty purchase + free shipping above ₹499",
      discount: "20% OFF",
    },
    link: "https://www.nykaa.com",
  },
  {
    id: "ajio",
    name: "Ajio",
    slug: "ajio-coupons",
    category: "Fashion",
    fallbackIcon: "🛍️",
    badge: "Premium Fashion",
    rating: 4.6,
    couponsCount: 31,
    maxDiscount: "75% OFF",
    cashbackRate: "Up to 5.0%",
    description: "Reliance's premium fashion marketplace with 5,000+ international and Indian designer brands, exclusive Ajio own-label drops, and weekly flash sale events.",
    features: ["Curated Premium Brands", "Ajio Luxe Section", "Reliance JioPoints"],
    popularCoupon: {
      code: "AJIOFASHION",
      description: "Flat 25% off on international fashion brands above ₹2,499",
      discount: "25% OFF",
    },
    link: "https://www.ajio.com",
  },
  {
    id: "tatacliq",
    name: "Tata CLiQ",
    slug: "tata-cliq-coupons",
    category: "Electronics",
    logo: "/Brand logos/Tata-cliq.webp",
    fallbackIcon: "💎",
    badge: "Authentic Products",
    rating: 4.7,
    couponsCount: 27,
    maxDiscount: "45% OFF",
    cashbackRate: "Up to 4.5%",
    description: "Tata's premium omnichannel marketplace guaranteeing 100% authentic products, same-day luxury delivery, and exclusive Tata NeuPass integration for NeuCoin stacking.",
    features: ["100% Authenticity Guarantee", "NeuCoins Stacking", "Premium Brand Access"],
    popularCoupon: {
      code: "CLIQSAVE",
      description: "₹500 instant OFF on Tata CLiQ orders above ₹3,999",
      discount: "₹500 OFF",
    },
    link: "https://www.tatacliq.com",
  },
  {
    id: "swiggy",
    name: "Swiggy",
    slug: "swiggy-coupons",
    category: "Food",
    fallbackIcon: "🍕",
    badge: "Fastest Delivery",
    rating: 4.6,
    couponsCount: 24,
    maxDiscount: "60% OFF",
    cashbackRate: "Up to 5.0%",
    description: "India's leading food delivery platform with 30-minute restaurant-quality deliveries, Swiggy One membership benefits, and exclusive Instamart grocery deals.",
    features: ["30-Min Delivery SLA", "Swiggy One Discounts", "Instamart Grocery Deals"],
    popularCoupon: {
      code: "SWIGGY50",
      description: "50% OFF up to ₹100 on your next Swiggy food order",
      discount: "50% OFF",
    },
    link: "https://www.swiggy.com",
  },
  {
    id: "zomato",
    name: "Zomato",
    slug: "zomato-coupons",
    category: "Food",
    fallbackIcon: "🍔",
    badge: "Zomato Gold",
    rating: 4.6,
    couponsCount: 22,
    maxDiscount: "60% OFF",
    cashbackRate: "Up to 4.5%",
    description: "Premium food delivery with Zomato Gold restaurant discounts, Pro exclusive early access to new restaurants, and zero delivery charges for Pro subscribers.",
    features: ["Zomato Gold 1+1 Dishes", "Pro Exclusive Deals", "Zero Delivery Fee"],
    popularCoupon: {
      code: "ZOMATOPRO",
      description: "60% off up to ₹120 on food orders via Zomato app",
      discount: "60% OFF",
    },
    link: "https://www.zomato.com",
  },
  {
    id: "makemytrip",
    name: "MakeMyTrip",
    slug: "makemytrip-coupons",
    category: "Travel",
    fallbackIcon: "✈️",
    badge: "India's #1 OTA",
    rating: 4.7,
    couponsCount: 33,
    maxDiscount: "₹3,000 OFF",
    cashbackRate: "Up to 5.0%",
    description: "India's largest online travel agency with the best flight deals, hotel packages, international holiday packages, and exclusive MyCash rewards on every booking.",
    features: ["MyCash Instant Rewards", "Zero Cancellation Fee", "Holiday Package Deals"],
    popularCoupon: {
      code: "MMTFLIGHTS",
      description: "Save ₹3,000 on domestic flight bookings above ₹10,000",
      discount: "₹3,000 OFF",
    },
    link: "https://www.makemytrip.com",
  },
  {
    id: "ixigo",
    name: "Ixigo",
    slug: "ixigo-coupons",
    category: "Travel",
    fallbackIcon: "🚂",
    badge: "Train & Flights",
    rating: 4.5,
    couponsCount: 19,
    maxDiscount: "₹500 OFF",
    cashbackRate: "Up to 3.0%",
    description: "AI-powered travel aggregator for trains, flights, buses, and hotels with live PNR prediction, train tracking, and lowest guaranteed flight fare alerts.",
    features: ["Live Train Tracker", "PNR Prediction AI", "Fare Drop Alerts"],
    popularCoupon: {
      code: "IXIGOSAVE",
      description: "₹100 OFF on bus bookings and ₹200 OFF on flights via Ixigo",
      discount: "₹200 OFF",
    },
    link: "https://www.ixigo.com",
  },
  {
    id: "reliance_digital",
    name: "Reliance Digital",
    slug: "reliance-digital-coupons",
    category: "Electronics",
    fallbackIcon: "🔌",
    badge: "Electronics Hub",
    rating: 4.6,
    couponsCount: 25,
    maxDiscount: "35% OFF",
    cashbackRate: "Up to 3.0%",
    description: "India's largest consumer electronics retail chain with expert service guarantees, brand authorised service centers, and RelianceOne loyalty reward integration.",
    features: ["Brand Authorised Service", "RelianceOne Rewards", "Expert Tech Advice"],
    popularCoupon: {
      code: "RDTECH10",
      description: "10% off on ACs, Washing Machines and Refrigerators above ₹20,000",
      discount: "10% OFF",
    },
    link: "https://www.reliancedigital.in",
  },
];

export type StoreSortOption = "popularity" | "rating" | "couponsCount" | "maxDiscount" | "cashback" | "name";

function parsePercent(text: string): number {
  if (!text) return 0;
  const match = text.match(/([0-9.]+)\s*%/);
  return match ? parseFloat(match[1]) : 0;
}

function getStorePopularity(store: StoreRecord): number {
  const badgeWeight = store.badge?.includes("Top") ? 5 : store.badge ? 2 : 0;
  return store.rating * Math.log2(store.couponsCount + 2) + badgeWeight;
}

/**
 * Returns all stores, optionally filtered by category and/or search query,
 * and sorted by popularity, rating, coupons count, max discount, cashback, or name.
 */
export function queryStores(options: {
  category?: string;
  q?: string;
  sortBy?: StoreSortOption;
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}): { stores: StoreRecord[]; total: number } {
  let results = [...STORES_DB];

  if (options.category && options.category.toLowerCase() !== "all") {
    const catLower = options.category.toLowerCase();
    results = results.filter((s) => {
      const sCat = s.category.toLowerCase();
      return sCat === catLower || sCat.includes(catLower) || catLower.includes(sCat);
    });
  }

  if (options.q) {
    const q = options.q.toLowerCase();
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.popularCoupon.code.toLowerCase().includes(q)
    );
  }

  // Sorting
  const sortBy = options.sortBy || "popularity";
  const order = options.order || "desc";

  results.sort((a, b) => {
    let comp = 0;
    switch (sortBy) {
      case "rating":
        comp = a.rating - b.rating;
        break;
      case "couponsCount":
        comp = a.couponsCount - b.couponsCount;
        break;
      case "maxDiscount":
        comp = parsePercent(a.maxDiscount) - parsePercent(b.maxDiscount);
        break;
      case "cashback":
        comp = parsePercent(a.cashbackRate) - parsePercent(b.cashbackRate);
        break;
      case "name":
        comp = a.name.localeCompare(b.name);
        break;
      case "popularity":
      default:
        comp = getStorePopularity(a) - getStorePopularity(b);
        break;
    }
    return order === "asc" ? comp : -comp;
  });

  const total = results.length;
  const offset = options.offset ?? 0;
  const limit = options.limit ?? results.length;

  return {
    stores: results.slice(offset, offset + limit),
    total,
  };
}
