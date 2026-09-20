/**
 * @file src/routes/offers.tsx
 * @description Offers Hub Route Definition.
 */

import { createFileRoute } from "@tanstack/react-router";
import { createSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/offers")({
  head: () =>
    createSeoHead({
      title: "Today's Best Online Offers, Deals & Coupons – GoCoupon (Go Coupon)",
      description:
        "Explore 970+ hand-verified online shopping offers, exclusive brand promo codes, 30-80% discounts, and bank card savings across 240+ stores with GoCoupon. A verified alternative to GrabOn, CouponDuniya & Dealspotr.",
      path: "/offers",
      keywords:
        "GoCoupon, go coupon, gocoupon, gocoupons, grabon offers, grabon coupons, couponduniya deals, coupon duniya offers, dealspottr, dealspotr coupons, offers, deals, discounts, today's offers, popular brands coupons, amazon offers, flipkart offers, myntra discount coupons, electronics offers, coupon codes, daily offers",
    }),
});
