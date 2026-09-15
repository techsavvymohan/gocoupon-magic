/**
 * @file src/components/submit_coupon/SubmitCouponModal.tsx
 * @description Modern, accessible modal dialog for community coupon submissions.
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Plus,
  Tag,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Building2,
  Layers,
} from "lucide-react";
import { useSubmitCoupon } from "./useSubmitCoupon";
import { ALLOWED_CATEGORIES } from "./validation";
import type { SubmitCouponModalProps } from "./types";

// Popular store quick-pick suggestions
const QUICK_STORES = [
  "Amazon",
  "Flipkart",
  "Myntra",
  "Nykaa",
  "Ajio",
  "Samsung",
  "Croma",
  "FirstCry",
  "Klook",
  "Tata CLiQ",
];

export function SubmitCouponModal({
  isOpen,
  onClose,
  defaultStore,
  defaultCategory,
  onSuccess,
}: SubmitCouponModalProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    values,
    errors,
    isSubmitting,
    isSuccess,
    lastResult,
    setFieldValue,
    handleSubmit,
    resetForm,
  } = useSubmitCoupon({
    defaultStore,
    defaultCategory,
    onSuccess,
  });

  const handleClose = () => {
    resetForm();
    setShowAdvanced(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 shadow-2xl border-border/80 bg-card">
        {isSuccess ? (
          /* ── SUCCESS CONFIRMATION VIEW ── */
          <div className="py-6 text-center space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
              <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h3 className="font-display text-xl font-black text-foreground">
                Coupon Submitted Successfully!
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Thank you for contributing! Your deal is now queued for live verification and visible in the community feed.
              </p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-muted/40 p-4 max-w-sm mx-auto text-left space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Store:</span>
                <strong className="text-foreground">{values.storeName}</strong>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Code:</span>
                <strong className="text-primary font-bold text-sm tracking-wider">
                  {values.code}
                </strong>
              </div>
              {values.discount && (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Savings:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {values.discount}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Submit Another
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* ── SUBMISSION FORM VIEW ── */
          <>
            <DialogHeader className="space-y-1.5 text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-0.5 text-[11px] font-bold text-primary w-fit">
                <Plus className="h-3.5 w-3.5" />
                <span>Community Deals</span>
              </div>
              <DialogTitle className="font-display text-xl font-extrabold text-foreground">
                Submit a Coupon or Offer
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                Found a working promo code or price drop? Share it to help shoppers save and earn community verification status.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-3">
              {/* Store Name Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>
                    Store or Merchant Name <span className="text-rose-500">*</span>
                  </span>
                  {errors.storeName && (
                    <span className="text-[10px] text-rose-500 font-semibold">{errors.storeName}</span>
                  )}
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amazon, Myntra, Flipkart, Nike"
                    value={values.storeName}
                    onChange={(e) => setFieldValue("storeName", e.target.value)}
                    className={`w-full rounded-xl border bg-background pl-9 pr-3 py-2 text-xs text-foreground transition-colors focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${
                      errors.storeName ? "border-rose-500" : "border-border"
                    }`}
                  />
                </div>

                {/* Quick Store Chips */}
                {!values.storeName && (
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    <span className="text-[10px] text-muted-foreground mr-1">Popular:</span>
                    {QUICK_STORES.slice(0, 5).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFieldValue("storeName", s)}
                        className="rounded-md bg-muted/60 hover:bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Coupon Code Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>
                    Coupon or Promo Code <span className="text-rose-500">*</span>
                  </span>
                  {errors.code && (
                    <span className="text-[10px] text-rose-500 font-semibold">{errors.code}</span>
                  )}
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. FESTIVE50, SAVE200, FLAT15"
                    value={values.code}
                    onChange={(e) => setFieldValue("code", e.target.value.toUpperCase())}
                    className={`w-full rounded-xl border bg-background pl-9 pr-3 py-2 text-xs font-mono font-bold text-primary uppercase tracking-wider transition-colors focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${
                      errors.code ? "border-rose-500" : "border-border"
                    }`}
                  />
                </div>
              </div>

              {/* Discount / Savings & Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Discount */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground block">
                    Discount / Savings
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 50% OFF, ₹500 off"
                    value={values.discount}
                    onChange={(e) => setFieldValue("discount", e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                </div>

                {/* Category Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground block">
                    Shopping Category
                  </label>
                  <select
                    value={values.category}
                    onChange={(e) => setFieldValue("category", e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  >
                    {ALLOWED_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Advanced / Optional Fields Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer pt-1"
                >
                  <span>{showAdvanced ? "Hide additional details" : "+ Add website link, terms or email"}</span>
                  {showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
              </div>

              {showAdvanced && (
                <div className="space-y-3 pt-2 border-t border-border/60 animate-in fade-in-50 duration-200">
                  {/* Store Link */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>Store Website URL (Optional)</span>
                      {errors.url && (
                        <span className="text-[10px] text-rose-500 font-semibold">{errors.url}</span>
                      )}
                    </label>
                    <input
                      type="text"
                      placeholder="https://www.store.com/sale"
                      value={values.url}
                      onChange={(e) => setFieldValue("url", e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                    />
                  </div>

                  {/* Terms & Exclusions */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground block">
                      Terms &amp; Restrictions (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Min order ₹1,999. Valid for new users only."
                      value={values.terms}
                      onChange={(e) => setFieldValue("terms", e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                    />
                  </div>

                  {/* User Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>Your Email (Optional, for contributor credit)</span>
                      {errors.email && (
                        <span className="text-[10px] text-rose-500 font-semibold">{errors.email}</span>
                      )}
                    </label>
                    <input
                      type="email"
                      placeholder="yourname@gmail.com"
                      value={values.email}
                      onChange={(e) => setFieldValue("email", e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-border/70 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Verifying &amp; Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      <span>Submit for Verification</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
