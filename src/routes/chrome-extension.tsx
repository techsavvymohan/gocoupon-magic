/**
 * @file src/routes/chrome-extension.tsx
 * @description GoCoupon Chrome Extension Landing Page Route Definition.
 */

import { createFileRoute } from "@tanstack/react-router";
import { createSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/chrome-extension")({
  head: () =>
    createSeoHead({
      title: "GoCoupon Chrome Extension: Automatically Find Working Coupons",
      description:
        "Download the official GoCoupon Chrome Extension. Automatically tests working coupons, clips Amazon vouchers, and compares prices across 200+ stores worldwide.",
      path: "/chrome-extension",
      keywords:
        "GoCoupon Chrome Extension, gocoupon extension, auto apply coupons, amazon coupon auto clip, price tracker extension, free shopping extension, promo codes worldwide",
    }),
});
