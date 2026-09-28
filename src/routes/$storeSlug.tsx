import { createFileRoute } from "@tanstack/react-router";
import { createSeoHead } from "@/lib/seo";
import { getStoreBySlug } from "@/lib/store-catalog-helper";

export const Route = createFileRoute("/$storeSlug")({
  loader: ({ params }) => {
    const store = getStoreBySlug(params.storeSlug);
    return { store, slug: params.storeSlug };
  },
  head: ({ loaderData, params }) => {
    const store = loaderData?.store;
    const storeName = store ? store.name : params.storeSlug.replace(/-coupons$/, "").replace(/-/g, " ");
    return createSeoHead({
      title: `${storeName} Coupon Codes & Deals (2026) | GoCoupon`,
      description: `Verified ${storeName} promo codes, discount vouchers, and bank card offers for 2026. Auto-apply the highest working discount on GoCoupon.io.`,
      path: `/${params.storeSlug}`,
      keywords: `${storeName.toLowerCase()} coupons, ${storeName.toLowerCase()} promo code, ${storeName.toLowerCase()} discount vouchers, bank card offers 2026`,
    });
  },
});
