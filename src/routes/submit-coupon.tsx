/**
 * @file src/routes/submit-coupon.tsx
 * @description Submit Coupon Route Definition.
 */

import { createFileRoute } from "@tanstack/react-router";
import { createSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/submit-coupon")({
  head: () =>
    createSeoHead({
      title: "Submit a Coupon – Share Verified Deals & Discounts | GoCoupon",
      description:
        "Submit working coupon codes, promo links, and exclusive store discounts to the GoCoupon community. Help thousands of shoppers worldwide save money.",
      path: "/submit-coupon",
      keywords:
        "submit coupon, share promo code, add discount code, community deals, verified coupons, gocoupon submit",
    }),
});
