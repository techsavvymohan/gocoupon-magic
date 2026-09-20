/**
 * @file src/routes/how-it-works.tsx
 * @description How It Works Route Definition.
 */

import { createFileRoute } from "@tanstack/react-router";
import { createSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/how-it-works")({
  head: () =>
    createSeoHead({
      title: "How GoCoupon Works – Simple 1-Click Online Savings Guide",
      description:
        "Learn how GoCoupon automatically finds and applies the best discount codes and Amazon green coupons at checkout so you never overpay online.",
      path: "/how-it-works",
      keywords:
        "how coupon extension works, auto apply coupon code, amazon coupon clip, save money online, free discount finder",
    }),
});
