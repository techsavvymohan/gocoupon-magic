import React, { useState } from "react";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema } from "@/lib/seo";
import { useSubmitCoupon } from "@/components/submit_coupon/useSubmitCoupon";
import { EmailOtpVerifier } from "@/components/submit_coupon/EmailOtpVerifier";
import { STORE_PRESETS, searchStorePresets } from "@/components/submit_coupon/storeAutoFill";
import { ALLOWED_CATEGORIES } from "@/components/submit_coupon/validation";
import {
  Tag,
  CheckCircle2,
  Plus,
  Loader2,
  Building2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe2,
  Lock,
} from "lucide-react";

export const Route = createLazyFileRoute("/submit-coupon")({
  component: SubmitCouponPage,
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
    isSendingOtp,
    isOtpSent,
    isVerifyingOtp,
    isEmailVerified,
    verifiedEmail,
    cooldown,
    handleSendOtp,
    handleVerifyOtp,
    handleChangeEmail,
    handleSelectStorePreset,
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
            <Tag className="h-3.5 w-3.5" />
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
                  to="/thank-you"
                  search={{ source: "coupon" }}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2.5 text-xs sm:text-sm font-semibold text-primary hover:bg-primary/20 transition-colors"
                >
                  <span>Verification Status</span>
                </Link>
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
                      onClick={() => {
                        const preset = STORE_PRESETS.find((p) => p.name.toLowerCase() === store.toLowerCase());
                        if (preset) {
                          handleSelectStorePreset(preset);
                        } else {
                          setFieldValue("storeName", store);
                        }
                      }}
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="storeName" className="block text-xs font-semibold text-foreground">
                      Store or Brand Name <span className="text-rose-500">*</span>
                    </label>
                    {values.url && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        ✓ Auto-filled {values.category} &amp; URL
                      </span>
                    )}
                  </div>
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
                  {/* Live Store Suggestions */}
                  {values.storeName.trim().length > 1 &&
                    searchStorePresets(values.storeName, 4).length > 0 &&
                    !STORE_PRESETS.some((p) => p.name.toLowerCase() === values.storeName.toLowerCase()) && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground">Auto-fill:</span>
                        {searchStorePresets(values.storeName, 4).map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => handleSelectStorePreset(p)}
                            className="inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-[11px] font-semibold text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                          >
                            <span>{p.name}</span>
                            <span className="text-[9px] text-muted-foreground font-normal">({p.category})</span>
                          </button>
                        ))}
                      </div>
                    )}
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

              {/* Submitter Email & OTP Verification (Mandatory) */}
              <EmailOtpVerifier
                email={values.email}
                otp={values.otp}
                emailError={errors.email}
                otpError={errors.otp}
                isSendingOtp={isSendingOtp}
                isOtpSent={isOtpSent}
                isVerifyingOtp={isVerifyingOtp}
                isEmailVerified={isEmailVerified}
                verifiedEmail={verifiedEmail}
                cooldown={cooldown}
                onEmailChange={(val) => setFieldValue("email", val)}
                onOtpChange={(val) => setFieldValue("otp", val)}
                onSendOtp={handleSendOtp}
                onVerifyOtp={handleVerifyOtp}
                onChangeEmail={handleChangeEmail}
                disabled={isSubmitting}
              />

              {/* Deal URL & Terms */}
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
                  <label htmlFor="terms" className="block text-xs font-semibold text-foreground mb-1.5">
                    Terms or Restrictions (Optional)
                  </label>
                  <input
                    id="terms"
                    type="text"
                    placeholder="e.g. Valid on minimum order of $50."
                    value={values.terms || ""}
                    onChange={(e) => setFieldValue("terms", e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background/80 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Trust Callout */}
              <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-muted/30 p-3.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500" />
                <span>
                  All community submissions are verified via OTP from <strong>support@gocoupon.io</strong> to guarantee genuine coupons and prevent spam.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !isEmailVerified}
                className={`inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer ${
                  isEmailVerified
                    ? "bg-primary text-primary-foreground shadow-primary/25"
                    : "bg-muted text-muted-foreground border border-border cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting Verified Coupon...</span>
                  </>
                ) : !isEmailVerified ? (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Verify Email with OTP to Submit</span>
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

        {/* Contextual Guidance & SLA Links */}
        <div className="mt-10 rounded-2xl border border-border/80 bg-muted/20 p-5 text-center text-xs text-muted-foreground">
          <span>Need troubleshooting assistance or want to understand validation rules? Explore our </span>
          <Link to="/help" className="text-primary font-semibold hover:underline">Help Center &amp; FAQs</Link>
          <span>, view our </span>
          <Link to="/featured-deals" className="text-primary font-semibold hover:underline">Handpicked Featured Deals</Link>
          <span>, or check our </span>
          <Link to="/thank-you" search={{ source: "coupon" }} className="text-primary font-semibold hover:underline">Submission Confirmation Policy</Link>
          <span>.</span>
        </div>
      </div>
    </SiteShell>
  );
}

export default SubmitCouponPage;
