/**
 * @file mock-products.ts
 * @description Development-only mock affiliate products.
 *
 * WARNING: This data is for local development and testing only.
 * NEVER use mock affiliate links in production.
 * NEVER display mock data to real users.
 *
 * These products exist solely so the full GoCoupon product UI
 * (cards, carousel, affiliate CTA, click tracking) can be tested
 * without real provider credentials.
 *
 * The mock provider is controlled by VITE_MOCK_PROVIDER_ENABLED=true.
 */

import type { AffiliateProduct } from "../types";

export const MOCK_PRODUCTS: AffiliateProduct[] = [
  {
    provider: "mock",
    providerProductId: "MOCK-001",
    title: "[DEV] Wireless Noise-Cancelling Headphones",
    description: "Mock product for development. Not a real product listing.",
    imageUrl: "/amazon-deals-tech.webp",
    productUrl: "https://example.com/mock-product-001",
    affiliateUrl: "https://example.com/mock-product-001?ref=mock",
    price: 4999,
    currency: "INR",
    originalPrice: 8999,
    discountPercentage: 44,
    rating: 4.5,
    reviewCount: 1200,
    availability: "In Stock",
    category: "Electronics & Tech",
    country: "IN",
    metadata: {
      badge: "[DEV] Mock Deal • 44% OFF",
      couponCode: "MOCKTEST10",
      tags: ["[DEV] Mock Tag 1", "[DEV] Mock Tag 2"],
      savingLabel: "Save ₹4,000",
      isMock: true,
    },
  },
  {
    provider: "mock",
    providerProductId: "MOCK-002",
    title: "[DEV] Smart Home Kitchen Setup",
    description: "Mock product for development. Not a real product listing.",
    imageUrl: "/amazon-deals-home.webp",
    productUrl: "https://example.com/mock-product-002",
    affiliateUrl: "https://example.com/mock-product-002?ref=mock",
    price: 3499,
    currency: "INR",
    originalPrice: 5999,
    discountPercentage: 42,
    rating: 4.3,
    reviewCount: 870,
    availability: "In Stock",
    category: "Home & Appliances",
    country: "IN",
    metadata: {
      badge: "[DEV] Mock Deal • 42% OFF",
      couponCode: "MOCKTEST20",
      tags: ["[DEV] Mock Tag A", "[DEV] Mock Tag B"],
      savingLabel: "Save ₹2,500",
      isMock: true,
    },
  },
  {
    provider: "mock",
    providerProductId: "MOCK-003",
    title: "[DEV] Minimalist Smartwatch Bundle",
    description: "Mock product for development. Not a real product listing.",
    imageUrl: "/amazon-deals-fashion.webp",
    productUrl: "https://example.com/mock-product-003",
    affiliateUrl: "https://example.com/mock-product-003?ref=mock",
    price: 1999,
    currency: "INR",
    originalPrice: 3999,
    discountPercentage: 50,
    rating: 4.7,
    reviewCount: 2300,
    availability: "In Stock",
    category: "Fashion & Watches",
    country: "IN",
    metadata: {
      badge: "[DEV] Mock Deal • 50% OFF",
      couponCode: "MOCKTEST30",
      tags: ["[DEV] Mock Tag X", "[DEV] Mock Tag Y"],
      savingLabel: "Save ₹2,000",
      isMock: true,
    },
  },
];
