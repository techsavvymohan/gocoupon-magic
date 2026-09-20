/**
 * @file collections/$slug.tsx
 * @description Detailed Evidence-Backed Category Guide Route Definition.
 */

import { createFileRoute } from "@tanstack/react-router";
import { createSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/collections/$slug")({
  loader: async ({ params }) => {
    const { CURATED_COLLECTIONS } = await import("@/data/collectionsData");
    const col = CURATED_COLLECTIONS.find((c) => c.slug === params.slug);
    return { col };
  },
  head: ({ loaderData, params }) => {
    const col = loaderData?.col;
    return createSeoHead({
      title: col
        ? `${col.title} – Evidence-Backed Shortlist | goCoupon`
        : "Category Buying Guide & Recommendations – goCoupon",
      description: col
        ? col.subtitle
        : "Evidence-backed category rankings and buying guides powered by goCoupon.",
      path: `/collections/${params.slug}`,
    });
  },
});
