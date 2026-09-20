/**
 * @file src/routes/privacy.tsx
 * @description GoCoupon Privacy Policy Route Definition.
 */

import { createFileRoute } from "@tanstack/react-router";
import { createSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () =>
    createSeoHead({
      title: "Privacy Policy & Chrome Web Store User Data Disclosure – GoCoupon",
      description:
        "Official GoCoupon Privacy Policy. Learn about our Chrome Web Store User Data Policy compliance, Manifest V3 security, zero data selling, and strict privacy protection.",
      path: "/privacy",
      keywords:
        "GoCoupon privacy policy, chrome web store user data policy, chrome extension privacy, coupon extension data collection, limited use compliance, gocoupon security, Purple Nickel compliance",
    }),
});
