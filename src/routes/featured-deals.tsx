/**
 * @file src/routes/featured-deals.tsx
 * @description Featured Deals Route Definition.
 */

import { createFileRoute } from "@tanstack/react-router";
import { createSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/featured-deals")({
  head: () =>
    createSeoHead({
      title: "Featured Deals & Exclusive Coupons | GoCoupon",
      description:
        "Discover handpicked featured deals, verified coupon codes and exclusive savings from trusted brands worldwide. Shop smarter with GoCoupon.",
      path: "/featured-deals",
      keywords:
        "featured deals, verified coupon codes, exclusive discount offers, partner deals, best online discounts, India coupon offers, international coupon deals, working promo codes",
    }),
});
