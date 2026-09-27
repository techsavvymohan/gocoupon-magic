/**
 * @file src/routes/category/$slug.tsx
 * @description Dedicated Category Landing Route Definition for SEO & GEO Discovery.
 */

import { createFileRoute } from "@tanstack/react-router";
import { createSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ params }) => {
    const { CATEGORIES_TAXONOMY } = await import("@/data/categoriesData");
    const category = CATEGORIES_TAXONOMY.find((c) => c.slug === params.slug);
    return { category, slug: params.slug };
  },
  head: ({ loaderData, params }) => {
    const cat = loaderData?.category;
    return createSeoHead({
      title: cat
        ? cat.seoTitle
        : `${params.slug.toUpperCase()} Coupons & Promo Codes (2026) | GoCoupon`,
      description: cat
        ? cat.seoDescription
        : `Verified working coupon codes, discounts, and bank offers for ${params.slug} stores on GoCoupon.`,
      path: `/category/${params.slug}`,
      keywords: `${params.slug} coupons, ${params.slug} promo codes, discount vouchers, bank offers`,
    });
  },
});
