/**
 * @file src/routes/merchant-score-index.tsx
 * @description GoCoupon Merchant Reliability Index & Coupon Health Report Route Definition.
 */

import { createFileRoute } from "@tanstack/react-router";
import { createSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/merchant-score-index")({
  head: () =>
    createSeoHead({
      title: "Merchant Reliability Index & Coupon Health | GoCoupon",
      description:
        "Official 2026 data study: GoCoupon benchmarks store coupon success rates, dead code rejection, and average cart savings across 500+ top online stores.",
      path: "/merchant-score-index",
      keywords:
        "merchant reliability index, coupon success rate, store health score, coupon data study, online store discounts benchmark 2026",
    }),
});
