/**
 * @file src/open_food_fact/types.ts
 * @description Type definitions for the Open Food Facts module in GoCoupon.
 */

export type NutriScoreGrade = "a" | "b" | "c" | "d" | "e" | "unknown";

export type NovaGroup = 1 | 2 | 3 | 4 | null;

export interface FoodProduct {
  barcode: string;
  product_name: string;
  brands: string;
  quantity?: string;
  image_url?: string;
  nutriscore_grade?: NutriScoreGrade;
  nova_group?: NovaGroup;
  ecoscore_grade?: string;
  categories?: string;
  ingredients_text?: string;
  stores?: string;
}

export interface GroceryStoreOffer {
  storeId: string;
  storeName: string;
  logo: string;
  fallbackIcon: string;
  domain: string;
  estimatedPrice?: string;
  price?: number;
  currency?: string;
  couponCode?: string;
  couponDiscount?: string;
  couponDescription?: string;
  affiliateUrl: string;
  deliveryTime?: string;
  inStock: boolean;
  badge?: string;
  isLowest?: boolean;
}

export interface FoodProductComparison {
  product: FoodProduct;
  offers: GroceryStoreOffer[];
  lowestOffer?: GroceryStoreOffer;
  availableCouponsCount: number;
  timestamp: string;
}

export interface FoodSearchResponse {
  success: boolean;
  count: number;
  query: string;
  products: FoodProduct[];
}
