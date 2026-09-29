import { createFileRoute, redirect } from "@tanstack/react-router";
import { createSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/deals")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : typeof search.search === "string" ? search.search : undefined,
  }),
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/offers",
      search: search.q ? { q: search.q } : undefined,
    });
  },
  head: () =>
    createSeoHead({
      title: "Today's Best Online Deals, Discounts & Coupons – GoCoupon",
      description:
        "Explore hand-verified online shopping deals, exclusive brand promo codes, and all-time low price drops with GoCoupon.",
      path: "/offers",
      keywords: "deals, discounts, offers, coupons, promo codes, gocoupon deals",
    }),
  component: () => null,
});
