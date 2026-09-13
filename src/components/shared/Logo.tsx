/**
 * @file src/components/shared/Logo.tsx
 * @description Shared Logo component for GoCoupon.
 */

import React from "react";
import { Link } from "@tanstack/react-router";

export default function Logo({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2 group">
      <img
        src="/gc-logo.webp"
        alt="GoCoupon"
        className={`dark:hidden ${className} transition-transform group-hover:scale-105`}
        width={120}
        height={28}
      />
      <img
        src="/gc-logo-dark.webp"
        alt="GoCoupon"
        className={`hidden dark:block ${className} transition-transform group-hover:scale-105`}
        width={120}
        height={28}
      />
    </Link>
  );
}
