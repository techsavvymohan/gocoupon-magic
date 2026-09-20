/**
 * @file compare.tsx
 * @description Real-time Multi-Platform Product Search & Cross-Store Price Comparison Matrix (Route Definition).
 */

import { createFileRoute } from "@tanstack/react-router";
import { createSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/compare")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) || "",
    url: (search.url as string) || "",
  }),
  head: () =>
    createSeoHead({
      title: "Price Comparison India: Compare Prices & Find Cheaper Products Across Stores – goCoupon",
      description:
        "Compare live prices, stackable coupons, delivery fees, and cashback across Amazon, Flipkart, Myntra, Croma, and Tata CLiQ. Find cheaper products and save up to 40% instantly.",
      path: "/compare",
      keywords:
        "price comparison india, compare prices, cheaper products, find cheapest price, amazon vs flipkart price comparison, lowest price online shopping, cross store comparison, product price checker, online price tracker",
    }),
});
