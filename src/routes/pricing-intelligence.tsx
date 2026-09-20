/**
 * @file src/routes/pricing-intelligence.tsx
 * @description Enterprise B2B Pricing Intelligence & MAP Compliance SaaS Platform Route Definition.
 */

import { createFileRoute } from "@tanstack/react-router";
import { createSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/pricing-intelligence")({
  head: () =>
    createSeoHead({
      title: "Enterprise Pricing Intelligence & MAP Monitoring API – GoCoupon",
      description:
        "Real-time e-commerce competitor price monitoring, MAP violation tracking, and historical trend APIs for consumer brands and D2C sellers across Amazon, Flipkart, and Croma.",
      path: "/pricing-intelligence",
      keywords:
        "pricing intelligence api, map monitoring software, e-commerce price tracker b2b, competitor price scraping api, buyhatke enterprise alternative",
    }),
});
