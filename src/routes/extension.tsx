/**
 * @file src/routes/extension.tsx
 * @description GoCoupon Extension Route Definition.
 */

import { createFileRoute } from "@tanstack/react-router";
import { createSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/extension")({
  head: () =>
    createSeoHead({
      title: "Download GoCoupon Chrome Extension – Free Automatic Coupon & Deal Finder",
      description:
        "Install the free GoCoupon Chrome extension. Automatically tests working coupon codes, auto-clips Amazon green vouchers, and saves you money in 1 click.",
      path: "/extension",
      keywords:
        "download gocoupon extension, free chrome coupon extension, amazon coupon auto clip, auto apply promo codes, best shopping extension chrome",
    }),
});
