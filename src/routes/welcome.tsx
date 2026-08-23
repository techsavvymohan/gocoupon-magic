import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import {
  CheckCircle2,
  Sparkles,
  Pin,
  ShoppingBag,
  Zap,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Check,
} from "lucide-react";
import { MagneticButton } from "@/components/MagneticButton";

export const Route = createFileRoute("/welcome")({
  component: WelcomePage,
  head: () =>
    createSeoHead({
      title: "Welcome to goCoupon – Extension Setup & Quick Start Guide",
      description:
        "Congratulations on installing goCoupon! Follow these 3 simple steps to pin the extension and start auto-applying discount coupons on Flipkart, Amazon, and Myntra.",
      path: "/welcome",
      keywords:
        "welcome to gocoupon, gocoupon extension setup, how to pin chrome extension, coupon auto apply tutorial",
    }),
});

function WelcomePage() {
  const [demoState, setDemoState] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [testedCode, setTestedCode] = useState("");

  const runDemo = () => {
    setDemoState("running");
    setProgress(0);
    const codes = ["WELCOME100", "FESTIVE200", "SUPER50", "FKFEST2026", "MEGA500"];
    let step = 0;

    const interval = setInterval(() => {
      if (step < codes.length) {
        setTestedCode(codes[step]);
        setProgress(Math.round(((step + 1) / codes.length) * 100));
        step++;
      } else {
        clearInterval(interval);
        setDemoState("done");
      }
    }, 450);
  };

  const resetDemo = () => {
    setDemoState("idle");
    setProgress(0);
    setTestedCode("");
  };

  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Welcome Guide", path: "/welcome" },
  ]);

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* Hero Celebration */}
      <section className="relative overflow-hidden border-b border-border px-6 pb-16 pt-20 sm:pt-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-emerald-500">
            <CheckCircle2 className="h-4 w-4" />
            Extension Installed Successfully! 🎉
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            You&apos;re ready to start saving money automatically.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Welcome to the goCoupon family! Complete these 3 quick steps so you never miss a discount at checkout.
          </p>
        </div>
      </section>

      {/* 3 Step Setup Guide */}
      <section className="border-b border-border px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative rounded-3xl border border-border bg-card p-8 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-mono text-sm font-bold text-primary-foreground">
                  01
                </span>
                <Pin className="h-5 w-5 text-primary" />
              </div>
              <h2 className="mt-6 font-display text-xl font-bold text-foreground">
                Pin to Chrome Toolbar
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Click the puzzle icon <span className="font-mono text-xs font-bold text-foreground">🧩</span> in the top right of Chrome, find <strong>goCoupon</strong>, and click the <strong>Pin 📌</strong> icon so it stays visible.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-3xl border border-border bg-card p-8 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-mono text-sm font-bold text-primary-foreground">
                  02
                </span>
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <h2 className="mt-6 font-display text-xl font-bold text-foreground">
                Shop Like Normal
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Visit Flipkart, Amazon, Myntra, or Meesho. Add any items to your shopping cart and proceed to the checkout page.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-3xl border border-border bg-card p-8 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-mono text-sm font-bold text-primary-foreground">
                  03
                </span>
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h2 className="mt-6 font-display text-xl font-bold text-foreground">
                1-Click Auto Apply
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                goCoupon will pop up automatically. Click <strong>&ldquo;Apply Best Coupon&rdquo;</strong> and watch your cart price drop!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Simulator Card */}
      <section className="border-b border-border bg-muted/20 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-primary">
              <Zap className="h-3.5 w-3.5" aria-hidden="true" />
              Interactive Simulation
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
              See How goCoupon Works on Your Favorite Stores
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Try this interactive checkout preview to see how fast goCoupon finds and applies savings.
            </p>
          </div>

          <div className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-xl sm:p-8">
            <div className="grid gap-8 md:grid-cols-2 md:items-center">
              {/* Cart Summary */}
              <div className="space-y-4 rounded-2xl border border-border bg-background p-6">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="font-display font-semibold text-foreground">Your Shopping Cart</span>
                  <span className="font-mono text-xs text-muted-foreground">Flipkart Store</span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Noise Wireless ANC Earbuds</span>
                    <span className="font-mono text-foreground font-medium tabular-nums">₹3,499</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charge</span>
                    <span className="font-mono text-emerald-500 font-medium">FREE</span>
                  </div>
                  {demoState === "done" && (
                    <div className="flex justify-between text-emerald-500 font-medium animate-fade-in">
                      <span>goCoupon Discount (FKFEST2026)</span>
                      <span className="font-mono tabular-nums">- ₹500</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between border-t border-border pt-3 font-display font-bold text-foreground">
                  <span>Total Payable:</span>
                  <span className="font-mono text-lg text-primary tabular-nums">
                    {demoState === "done" ? "₹2,999" : "₹3,499"}
                  </span>
                </div>
              </div>

              {/* Extension Simulator Widget */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-3">
                  <Zap className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">goCoupon Extension</h3>

                {demoState === "idle" && (
                  <div className="mt-4 space-y-3">
                    <p className="text-xs text-muted-foreground">
                      5 coupons found for this cart. Ready to test?
                    </p>
                    <button
                      type="button"
                      onClick={runDemo}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 min-h-[40px] text-xs font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-105 active:scale-95 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <span>Simulate Auto-Apply</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                )}

                {demoState === "running" && (
                  <div className="mt-4 w-full space-y-3">
                    <div className="font-mono text-xs text-primary font-semibold animate-pulse">
                      Testing code: {testedCode}
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground">{progress}% complete</span>
                  </div>
                )}

                {demoState === "done" && (
                  <div className="mt-4 space-y-3 animate-fade-in">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 font-mono text-xs font-bold text-emerald-500">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      Saved ₹500!
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Applied best code <strong className="text-foreground">FKFEST2026</strong> automatically.
                    </p>
                    <button
                      type="button"
                      onClick={resetDemo}
                      className="inline-flex items-center gap-1 text-xs font-mono text-primary hover:underline touch-manipulation min-h-[32px] px-2"
                    >
                      <RotateCcw className="h-3 w-3" aria-hidden="true" />
                      Test Auto-Apply Again
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Start Shopping Quick Links */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ready to test on your favorite store?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
            Open any store below and experience the magic on your next purchase.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://www.flipkart.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-primary hover:scale-105"
            >
              <span>🛍️ Open Flipkart</span>
            </a>
            <a
              href="https://www.amazon.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-primary hover:scale-105"
            >
              <span>📦 Open Amazon India</span>
            </a>
            <a
              href="https://www.myntra.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-primary hover:scale-105"
            >
              <span>👗 Open Myntra</span>
            </a>
            <a
              href="https://www.meesho.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-primary hover:scale-105"
            >
              <span>🏷️ Open Meesho</span>
            </a>
          </div>

          <div className="mt-12 flex items-center justify-center gap-2 font-mono text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>100% Free • Safe &amp; Private • No Account Required</span>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
