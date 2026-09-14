import { createFileRoute, redirect } from "@tanstack/react-router";
import { createSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/deals")({
  beforeLoad: () => {
    throw redirect({ to: "/offers" });
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
