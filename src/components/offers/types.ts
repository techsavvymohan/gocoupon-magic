export type SidebarTab = "categories" | "brands" | "stores" | "banks" | "festivals" | "product-deals";

export interface PopularBrand {
  name: string;
  query: string;
  logo: string;
  tagline: string;
  couponsCount: number;
  offersCount: number;
  bgClass?: string;
  textColorClass?: string;
}

export interface BankOffer {
  bankName: string;
  logo: string;
  cardType: string;
  discount: string;
  code: string;
  applicableStores: string[];
  minOrder: string;
  maxSavings: string;
}

export interface RealCategory {
  name: string;
  slug: string;
  offersCount: number;
  couponsCount: number;
  stores?: Set<string>;
  maxDiscount: string;
  storesCount?: number;
  topStores?: string[];
  description?: string;
}

export interface RealStore {
  name: string;
  logo?: string;
  offersCount: number;
  couponsCount: number;
  category: string;
}
