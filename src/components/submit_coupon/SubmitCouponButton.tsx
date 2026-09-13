/**
 * @file src/components/submit_coupon/SubmitCouponButton.tsx
 * @description Universal trigger button component for launching the Submit Coupon modal.
 */

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { SubmitCouponModal } from "./SubmitCouponModal";
import type { SubmitCouponButtonProps } from "./types";

export function SubmitCouponButton({
  variant = "primary",
  label = "Submit Coupon",
  defaultStore,
  defaultCategory,
  className = "",
  onSuccess,
}: SubmitCouponButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getVariantStyles = () => {
    switch (variant) {
      case "header":
        return "inline-flex items-center gap-1 font-semibold text-foreground/80 hover:text-primary transition-colors cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-muted/50 text-xs";
      case "outline":
        return "inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card hover:bg-muted/70 px-3.5 py-2 text-xs font-semibold text-foreground transition-all cursor-pointer shadow-xs";
      case "pill":
        return "inline-flex items-center gap-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer";
      case "ghost":
        return "inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer";
      case "primary":
      default:
        return "inline-flex items-center gap-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer";
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`${getVariantStyles()} ${className}`}
      >
        <Plus className="h-3.5 w-3.5 shrink-0" />
        <span>{label}</span>
      </button>

      <SubmitCouponModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        defaultStore={defaultStore}
        defaultCategory={defaultCategory}
        onSuccess={onSuccess}
      />
    </>
  );
}
