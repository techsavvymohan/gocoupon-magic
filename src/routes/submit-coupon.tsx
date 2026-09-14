import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { createSeoHead, breadcrumbSchema } from "@/lib/seo";
import { useSubmitCoupon } from "@/components/submit_coupon/useSubmitCoupon";
import { ALLOWED_CATEGORIES } from "@/components/submit_coupon/validation";
import {
  Tag,
  CheckCircle2,
  Plus,
  Loader2,
  Building2,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe2,
} from "lucide-react";

export const Route = createFileRoute("/submit-coupon")({
  component: SubmitCouponPage,
  head: () =>
    createSeoHead({
      title: "Submit a Coupon – Share Verified Deals & Discounts | GoCoupon",
      description:
        "Submit working coupon codes, promo links, and exclusive store discounts to the GoCoupon community. Help thousands of shoppers worldwide save money.",
      path: "/submit-coupon",
      keywords:
        "submit coupon, share promo code, add discount code, community deals, verified coupons, gocoupon submit",
    }),
});

const POPULAR_STORES = [
  "Amazon",
  "Flipkart",
  "Myntra",
  "Walmart",
  "Target",
  "Nike",
  "Apple",
  "Nykaa",
  "Ajio",
  "Samsung",
  "Croma",
  "Booking.com",
];

function SubmitCouponPage() {
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
  } = useSubmitCoupon();

  const breadcrumbs = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Submit Coupon", path: "/submit-coupon" },
  ]);

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <div className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Community Savings Engine</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground text-balance">
            Share a Verified Coupon or Deal
          </h1>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto text-balance">
            Found a working promo code or hidden discount? Share it with our global community. Our verification engine tests submissions in parallel.
          </p>
        </div>

        {/* Form Container */}
        <div className="mt-10 rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-xl backdrop-blur-md">
          {isSuccess && lastResult ? (
            <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in-95">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 ring-8 ring-emerald-500/10 mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                Thank You for Sharing!
              </h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md">
                Your coupon for <strong className="text-foreground">{values.storeName}</strong> ({values.code}) has been submitted to the verification queue.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-xs sm:text-sm font-semibold text-foreground hover:bg-accent cursor-pointer transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Submit Another Coupon</span>
                </button>
                <Link
                  to="/offers"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs sm:text-sm font-bold text-primary-foreground shadow-md hover:scale-105 transition-transform"
                >
                  <span>Explore Live Deals</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Quick Pick Store Pills */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Popular Stores
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_STORES.map((store) => (
                    <button
                      key={store}
                      type="button"
                      onClick={() => setFieldValue("storeName", store)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                        values.storeName.toLowerCase() === store.toLowerCase()
                          ? "bg-primary text-primary-foreground font-bold shadow-xs"
                          : "border border-border/70 bg-muted/30 text-foreground hover:border-primary/40 hover:bg-primary/5"
                      }`}
                    >
                      {store}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid: Store Name & Promo Code */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="storeName" className="block text-xs font-semibold text-foreground mb-1.5">
                    Store or Brand Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      id="storeName"
                      type="text"
                      placeholder="e.g. Amazon, Myntra, Nike"
                      value={values.storeName}
                      onChange={(e) => setFieldValue("storeName", e.target.value)}
                      className={`w-full rounded-2xl border bg-background/80 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-2 focus:ring-primary ${
                        errors.storeName ? "border-rose-500" : "border-border"
                      }`}
                    />
                  </div>
                  {errors.storeName && (
                    <p className="mt-1 text-xs text-rose-500">{errors.storeName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="code" className="block text-xs font-semibold text-foreground mb-1.5">
                    Coupon / Promo Code <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Tag className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      id="code"
                      type="text"
                      placeholder="e.g. SAVE20, FESTIVE100"
                      value={values.code}
                      onChange={(e) => setFieldValue("code", e.target.value.toUpperCase())}
                      className={`w-full rounded-2xl border bg-background/80 pl-10 pr-4 py-2.5 font-mono text-sm uppercase text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-2 focus:ring-primary ${
                        errors.code ? "border-rose-500" : "border-border"
                      }`}
                    />
                  </div>
                  {errors.code && (
                    <p className="mt-1 text-xs text-rose-500">{errors.code}</p>
                  )}
                </div>
              </div>

              {/* Grid: Discount & Category */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="discount" className="block text-xs font-semibold text-foreground mb-1.5">
                    Discount Value <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="discount"
                    type="text"
                    placeholder="e.g. 25% OFF, Flat $50 OFF, Free Shipping"
                    value={values.discount}
                    onChange={(e) => setFieldValue("discount", e.target.value)}
                    className={`w-full rounded-2xl border bg-background/80 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-2 focus:ring-primary ${
                      errors.discount ? "border-rose-500" : "border-border"
                    }`}
                  />
                  {errors.discount && (
                    <p className="mt-1 text-xs text-rose-500">{errors.discount}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="category" className="block text-xs font-semibold text-foreground mb-1.5">
                    Category
                  </label>
                  <div className="relative">
                    <Layers className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <select
                      id="category"
                      value={values.category}
                      onChange={(e) => setFieldValue("category", e.target.value)}
                      className="w-full appearance-none rounded-2xl border border-border bg-background/80 pl-10 pr-10 py-2.5 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                    >
                      {ALLOWED_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Deal URL & Submitter Email */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="url" className="block text-xs font-semibold text-foreground mb-1.5">
                    Deal / Store URL (Optional)
                  </label>
                  <input
                    id="url"
                    type="url"
                    placeholder="https://store.com/promo"
                    value={values.url || ""}
                    onChange={(e) => setFieldValue("url", e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background/80 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-foreground mb-1.5">
                    Your Email (Optional, for contributor credit)
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="shopper@domain.com"
                    value={values.email || ""}
                    onChange={(e) => setFieldValue("email", e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background/80 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Terms / Conditions */}
              <div>
                <label htmlFor="terms" className="block text-xs font-semibold text-foreground mb-1.5">
                  Terms or Restrictions (Optional)
                </label>
                <textarea
                  id="terms"
                  rows={2}
                  placeholder="e.g. Valid on minimum order of $50. Applies to first-time orders only."
                  value={values.terms || ""}
                  onChange={(e) => setFieldValue("terms", e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background/80 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Trust Callout */}
              <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-muted/30 p-3.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500" />
                <span>
                  All submissions are automatically scanned for spam and verified against store checkout forms before appearing on the public deals feed.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying and Submitting...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Submit Verified Coupon</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Global Impact Highlights */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3 text-center">
          <div className="rounded-2xl border border-border/60 bg-card/60 p-5">
            <Zap className="mx-auto h-5 w-5 text-amber-500 mb-2" />
            <h4 className="text-sm font-bold text-foreground">850ms Verification</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Codes are tested in parallel against real checkout endpoints.
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/60 p-5">
            <Globe2 className="mx-auto h-5 w-5 text-blue-500 mb-2" />
            <h4 className="text-sm font-bold text-foreground">Worldwide Reach</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Supports 8 currencies and 200+ global brands across 6 languages.
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/60 p-5">
            <ShieldCheck className="mx-auto h-5 w-5 text-emerald-500 mb-2" />
            <h4 className="text-sm font-bold text-foreground">100% Free Forever</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              No account required to submit or use community verified deals.
            </p>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}

export default SubmitCouponPage;
