/**
 * @file src/routes/about.tsx
 * @description About Page Route Definition.
 */

import { createFileRoute } from "@tanstack/react-router";
import { createSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () =>
    createSeoHead({
      title: "About GoCoupon: The Official Coupon & Price Comparison Platform",
      description:
        "Learn about GoCoupon (gocoupon.io), India's official coupon and price comparison platform. Discover our mission, supported stores, privacy standards, and team.",
      path: "/about",
      keywords:
        "About GoCoupon, GoCoupon official, gocoupon.io, GoCoupon team, coupon extension India, price comparison India, 90 day price tracker, official GoCoupon website",
    }),
});
