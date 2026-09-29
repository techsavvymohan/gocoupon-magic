/**
 * @file canonical-types.ts
 * @description Canonical commerce data contracts for GoCoupon.
 *
 * Strict separation of:
 * - CanonicalProduct (normalized cross-store item)
 * - MerchantStore (store metadata & capabilities)
 * - MerchantOffer (store-specific live listing)
 * - PriceSnapshot (historical time-series data point)
 * - StoreCoupon (verified promo code / discount)
 * - ProductEvidence (traceable review / lab test / citation)
 * - CategoryRecommendation (Flash-style rubric-scored collection item)
 * - UserWatchItem (target-price watchlist alert)
 */

export interface CanonicalProduct {
  id: string; // e.g. "prod_sony_wh1000xm5"
  slug: string; // e.g. "sony-wh-1000xm5-wireless-headphones"
  title: string;
  brand: string;
  category: "Electronics" | "Fashion" | "Beauty" | "Home" | "Food" | "Travel" | "General";
  subcategory?: string;
  description: string;
  imageUrl: string;
  galleryUrls?: string[];
  identifiers: {
    asin?: string;
    ean?: string;
    upc?: string;
    modelNumber?: string;
    flipkartId?: string;
    myntraId?: string;
  };
  specs: Record<string, string | number | boolean>;
  tags: string[];
  rating: number;
  reviewCount: number;
  reviewCountDisplay?: string;
  flashScore?: number; // 1-10 overall Flash verdict score
}

export type CommerceCategory =
  | "Electronics"
  | "Mobiles"
  | "Fashion"
  | "Beauty"
  | "Home"
  | "Food"
  | "Travel"
  | "General";

export interface MerchantStore {
  id: string; // e.g. "amazon", "flipkart", "myntra", "croma", "tatacliq", "boat"
  name: string;
  slug: string;
  domain: string;
  logoUrl?: string;
  fallbackIcon?: string;
  affiliateNetwork: "Amazon Associates" | "Impact" | "Cuelinks" | "Direct" | "EarnKaro";
  partnerTag?: string;
  cashbackRate: string;
  cashbackPercentage: number; // Base / default fallback commission percentage
  categoryTiers?: Partial<Record<CommerceCategory, number>>;
  isAutoApplySupported: boolean;
  rating: number;
}

export interface MerchantOffer {
  id: string; // e.g. "off_amz_sony_xm5"
  productId: string;
  storeId: string;
  storeName: string;
  storeLogo?: string;
  rawUrl: string;
  affiliateUrl: string;
  sellerName?: string;
  itemPrice: number;
  originalPrice?: number;
  discountPercentage?: number;
  shippingFee: number;
  currency: "INR" | "USD";
  stockStatus: "In Stock" | "Low Stock" | "Out of Stock" | "Pre-Order";
  deliveryTime?: string;
  lastCheckedAt: number; // Unix ms
  isBestPrice?: boolean;
  couponSavings?: number; // Estimated savings from best available coupon
  cashbackEstimated?: number;
  effectiveNetPrice: number; // itemPrice + shippingFee - couponSavings - cashbackEstimated
}

export interface PriceSnapshot {
  id: string;
  productId: string;
  offerId: string;
  storeId: string;
  price: number;
  originalPrice?: number;
  shippingFee?: number;
  currency: "INR" | "USD";
  availability: "In Stock" | "Out of Stock";
  recordedAt: number; // Unix ms
  source: string;
}

export interface StoreCoupon {
  id: string;
  storeId: string;
  storeName: string;
  code: string;
  title: string;
  description: string;
  discountLabel: string;
  discountAmount?: number;
  discountPercent?: number;
  minOrderValue?: number;
  maxDiscount?: number;
  expiresAt: string;
  status: "Active" | "Expiring Soon" | "Exclusive" | "Bank Offer";
  verificationStatus: "Editor Tested" | "Merchant Partner";
  lastVerified: string;
  successRate?: number; // Optional/legacy
  verifiedUses?: number; // Optional/legacy
  isStackableWithBankOffers: boolean;
  applicableCategories?: string[];
  terms?: string;
}

export interface ProductEvidence {
  id: string;
  productId: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceType:
    | "Tech Reviewer"
    | "Lab Benchmark"
    | "Buyer Consensus"
    | "Reddit Community"
    | "Editorial";
  authorOrChannel: string;
  claimType:
    | "Battery Life"
    | "Noise Cancellation"
    | "Sound Quality"
    | "Build Quality"
    | "Value"
    | "Camera"
    | "Durability";
  claimExcerpt: string;
  sentiment: "Positive" | "Neutral" | "Critical";
  confidenceScore: number; // 0.0 to 1.0
  publishedDate: string;
}

export interface CategoryRecommendation {
  id: string;
  collectionSlug: string;
  collectionTitle: string;
  category: string;
  productId: string;
  product: CanonicalProduct;
  rank: number;
  overallScore: number; // e.g. 9.4 / 10
  rubricBreakdown: {
    pillar1: { label: string; score: number; maxScore: number };
    pillar2: { label: string; score: number; maxScore: number };
    pillar3: { label: string; score: number; maxScore: number };
    pillar4: { label: string; score: number; maxScore: number };
    pillar5: { label: string; score: number; maxScore: number };
  };
  verdictSummary: string;
  keyPros: string[];
  keyCons: string[];
  bestFor: string;
  rubricVersion: string;
}

export interface UserWatchItem {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  targetPrice: number;
  currentLowestPrice: number;
  initialPrice: number;
  targetHit: boolean;
  currency: "INR" | "USD";
  createdAt: number;
  notifyChannels: {
    browser: boolean;
    email?: string;
  };
}

export interface ProductOffer {
  id: string;
  storeId: string;
  storeName: string;
  storeLogo?: string;
  productUrl: string;
  originalPrice: number;
  currentPrice: number;
  guaranteedCheckoutPrice: number;
  effectiveNetPrice: number;
  estimatedCashback: number;
  appliedCoupons: Array<{
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
    description: string;
    isStackable: boolean;
    verificationStatus: string;
    lastVerified: string;
  }>;
  inStock: boolean;
  deliveryDays: number;
  rating: number;
  reviewsCount: number;
  lastUpdated: string;
}

export function normalizeCommerceCategory(category?: string, query?: string): CommerceCategory {
  const text = `${category || ""} ${query || ""}`.toLowerCase();
  if (/phone|iphone|samsung|mobile|pixel|oneplus|realme|redmi|poco|vivo|oppo/.test(text)) return "Mobiles";
  if (/laptop|macbook|headphone|earbud|audio|camera|playstation|ps5|xbox|monitor|tv|electronics/.test(text)) return "Electronics";
  if (/shoe|sneaker|shirt|t-shirt|pant|jeans|dress|clothing|wear|jacket|fashion/.test(text)) return "Fashion";
  if (/perfume|cologne|makeup|lipstick|shampoo|skincare|serum|beauty/.test(text)) return "Beauty";
  if (/kitchen|vacuum|blender|dyson|bed|furniture|home/.test(text)) return "Home";
  if (/pizza|burger|snack|food|beverage|tea|coffee/.test(text)) return "Food";
  if (/flight|hotel|tour|travel|trip/.test(text)) return "Travel";
  return "General";
}

