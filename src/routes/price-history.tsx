/**
 * @file price-history.tsx
 * @description Redirect /price-history to /offers to focus user attention on high-converting live deals & coupons.
 */

import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/price-history")({
  beforeLoad: () => {
    throw redirect({ to: "/offers" });
  },
  component: () => null,
});
