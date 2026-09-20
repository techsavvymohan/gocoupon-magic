/**
 * @file src/routes/stores.tsx
 * @description Stores Directory Route Definition.
 */

import { createFileRoute } from "@tanstack/react-router";
import { createSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/stores")({
  head: () =>
    createSeoHead({
      title: "Top 200+ Online Stores Coupons & Deals Directory (2026) – GoCoupon",
      description:
        "Browse verified working coupon codes, promo vouchers, and up to 10% cashback across 200+ top online shopping stores worldwide including Amazon, Walmart, Target, Flipkart, Myntra, and more.",
      path: "/stores",
      keywords:
        "all stores coupons, online store deals, shopping discounts, store directory, brand promo codes worldwide, amazon coupons, walmart deals, flipkart promo codes",
    }),
});
