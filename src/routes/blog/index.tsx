/**
 * @file src/routes/blog/index.tsx
 * @description Blog Index Route Definition.
 */

import { createFileRoute } from "@tanstack/react-router";
import { createSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/blog/")({
  head: () =>
    createSeoHead({
      title: "The Savings Intelligence Journal – goCoupon Engineering & Arbitrage Desk",
      description:
        "Deconstructing e-commerce pricing algorithms, coupon mechanics, 30-day price tracking graphs, and discount stacking secrets from the goCoupon research lab.",
      path: "/blog",
      keywords:
        "savings intelligence blog, price tracking india, coupon stacking secrets, amazon flipkart price comparison, gocoupon research, consumer arbitrage india",
    }),
});
