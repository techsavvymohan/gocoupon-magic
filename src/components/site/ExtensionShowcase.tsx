/**
 * @file ExtensionShowcase.tsx
 * @description Dedicated homepage showcase for the GoCoupon Auto Discount Coupon Applier Chrome Extension.
 */

import { useState } from "react";
import { MagneticButton } from "../MagneticButton";
import {
  Zap,
  Ticket,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ShoppingBag,
  Percent,
  Star,
} from "lucide-react";

export function ExtensionShowcase() {
  const [demoState, setDemoState] = useState<"idle" | "testing" | "applied">("applied");

  const runDemo = () => {
    setDemoState("testing");
    setTimeout(() => {
      setDemoState("applied");
    }, 1800);
  };

  return (
    <section id="extension-showcase" className="relative border-t border-border px-4 sm:px-6 py-20 sm:py-28 overflow-hidden bg-card/20">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Copy Column (7 cols) */}
          <div className="reveal lg:col-span-7">
            <h2 className="font-display text-3xl font-extrabold leading-tight text-foreground sm:text-4xl md:text-5xl text-balance">
              Pops up at checkout.
              <span className="text-primary block mt-1">Tests every coupon code.</span>
              Stacks instant card savings in 2 seconds.
            </h2>

            <p className="mt-5 max-w-xl text-sm sm:text-base leading-relaxed text-muted-foreground">
              Stop hunting through spammy coupon websites for expired promo codes. When you reach checkout on Amazon, Flipkart, Walmart, Best Buy, or 500+ partner stores worldwide, GoCoupon's Savings Capsule HUD auto-tests every verified code in parallel and stacks your highest bank rebate.
            </p>

            {/* Feature Highlights Grid */}
            <div className="mt-8 grid gap-3.5 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-xs">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground">1-Click Auto-Apply</h4>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Tests all active codes in under 1.8 seconds and applies the highest net savings automatically.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-xs">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Ticket className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground">Voucher Auto-Clipper</h4>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Spots and auto-clicks hidden discount checkboxes and on-page merchant vouchers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-xs">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <Percent className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground">Bank Card &amp; Financing Stacking</h4>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Stacks promo codes with eligible HDFC, SBI, ICICI, Chase, Amex &amp; Affirm financing for maximum savings.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-xs">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground">100% Safe &amp; Private</h4>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Bank-grade sandboxed security. Zero access to credit cards, passwords, or personal browsing data.
                  </p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <MagneticButton
                as="a"
                href="https://chromewebstore.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:scale-105 active:scale-95"
              >
                <ChromeIcon />
                <span>Add to Chrome — It&apos;s 100% Free</span>
              </MagneticButton>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="flex items-center text-amber-400">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <Star className="h-3.5 w-3.5 fill-current" />
                </div>
                <span className="font-semibold text-foreground">4.9 / 5</span>
                <span>(180k+ users)</span>
              </div>
            </div>
          </div>

          {/* Interactive Extension Mockup Column (5 cols) */}
          <div className="reveal lg:col-span-5">
            <div className="relative mx-auto max-w-sm rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
              {/* Browser Window Bar */}
              <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  <ShoppingBag className="h-3 w-3 text-emerald-500" />
                  <span>flipkart.com/checkout</span>
                </div>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Extension Connected" />
              </div>

              {/* Extension Popup Card */}
              <div className="rounded-2xl border border-primary/20 bg-background/90 p-4 shadow-inner">
                {/* Popup Header */}
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm tracking-tight">
                      <span className="text-black dark:text-white">Go</span>
                      <span className="text-blue-600 dark:text-blue-400">Coupon</span>
                    </span>
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.2 font-mono text-[9px] font-bold text-primary">
                      EXTENSION
                    </span>
                  </div>
                  <span className="font-mono text-[10px] font-semibold text-emerald-500 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Cart Detected
                  </span>
                </div>

                {/* State Content */}
                {demoState === "testing" ? (
                  <div className="py-6 text-center space-y-4">
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                      <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-bold text-foreground">
                        Testing 8 Verified Codes…
                      </h4>
                      <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                        Running code: <span className="font-bold text-primary">FLIPDEAL500</span>
                      </p>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-primary animate-[pulse_1s_infinite] w-3/4 rounded-full" />
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 space-y-3">
                    {/* Voucher Auto-Clipped Notification */}
                    <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span className="text-[11px] text-foreground font-medium">On-Page Coupon Auto-Clipped</span>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-emerald-500">–₹150</span>
                    </div>

                    {/* Winning Code Highlight */}
                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-primary">FLIPDEAL500</span>
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-500">
                          BEST CODE
                        </span>
                      </div>
                      <div className="mt-1 flex items-baseline justify-between">
                        <span className="text-xs text-muted-foreground">Discount Applied:</span>
                        <span className="font-mono text-sm font-bold text-emerald-500">–₹500.00</span>
                      </div>
                    </div>

                    {/* Cart Math */}
                    <div className="space-y-1.5 rounded-xl border border-border bg-muted/30 p-3 font-mono text-xs">
                      <div className="flex justify-between text-muted-foreground text-[11px]">
                        <span>Original Cart Total:</span>
                        <span className="line-through">₹4,499.00</span>
                      </div>
                      <div className="flex justify-between text-emerald-500 font-bold text-[11px]">
                        <span>Total GoCoupon Savings:</span>
                        <span>–₹650.00</span>
                      </div>
                      <div className="border-t border-border pt-1.5 flex justify-between font-bold text-foreground text-xs">
                        <span>Final Net Amount:</span>
                        <span className="text-primary font-extrabold text-sm">₹3,849.00</span>
                      </div>
                    </div>

                    {/* Interactive Button */}
                    <button
                      type="button"
                      onClick={runDemo}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-95 active:scale-98 transition-all cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Test Codes Again (Live Demo)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Assurance Note */}
              <div className="mt-3 flex items-center justify-center gap-2 font-mono text-[10px] text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                <span>Auto-clicks vouchers on Amazon &amp; Flipkart</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChromeIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <path d="M12 2a10 10 0 0 1 8.66 5H12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M20.66 7A10 10 0 0 1 12 22l4.33-7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M3.34 7l4.33 7.5L12 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
