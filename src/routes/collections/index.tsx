/**
 * @file collections/index.tsx
 * @description Curated Flash-Style Category Guides & Shortlists Index Route Definition.
 */

import { createFileRoute } from "@tanstack/react-router";
import { createSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/collections/")({
  head: () =>
    createSeoHead({
      title: "Curated Buying Guides & Evidence-Backed Rankings – goCoupon",
      description:
        "Explore Flash.co-inspired category shortlists. Top products scored with transparent rubrics across noise cancellation, battery life, thermals, and value.",
      path: "/collections",
      keywords: "best headphones india, buying guides 2026, top laptops india, evidence backed product reviews",
    }),
});
