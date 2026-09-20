/**
 * @file $productId.tsx
 * @description Canonical Product Page Route Definition.
 */

import { createFileRoute } from "@tanstack/react-router";
import { createSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/product/$productId")({
  loader: async ({ params }) => {
    const { CANONICAL_PRODUCTS } = await import("@/data/canonicalCatalogData");
    const product = CANONICAL_PRODUCTS.find((p) => p.id === params.productId);
    return { product };
  },
  head: ({ loaderData, params }) => {
    const product = loaderData?.product;
    return createSeoHead({
      title: product
        ? `${product.title} – Best Price, Coupons & 30-Day History | goCoupon`
        : "Product Price Comparison & Price History – goCoupon",
      description: product
        ? `Compare prices on ${product.title} across Amazon, Flipkart, Croma and more. View 30-day price history and auto-apply valid coupons.`
        : "Compare live prices, coupons, and 30-day price history across top online stores worldwide.",
      path: `/product/${params.productId}`,
      keywords: product
        ? `${product.title} price comparison, ${product.brand} discount code, lowest price ${product.title}, price tracker`
        : "product comparison, price tracker, discount coupon, best price online",
    });
  },
});
