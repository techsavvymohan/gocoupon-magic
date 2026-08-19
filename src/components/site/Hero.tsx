import { MagneticButton } from "../MagneticButton";
import { TiltCard } from "../TiltCard";
import { Star, ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-32 pt-24 md:pt-32">
      {/* Subtle ambient backdrop glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 opacity-35 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle at center, var(--accent-glow-strong), rgba(245, 158, 11, 0.15), transparent 70%)",
        }}
      />
      <div className="grid-backdrop absolute inset-0" aria-hidden />

      <div className="relative mx-auto grid max-w-7xl items-start gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        {/* Left: copy */}
        <div className="reveal">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live on Amazon.com (US) · Flipkart &amp; Myntra Coming Soon</span>
          </div>

          <h1 className="font-display text-5xl font-bold leading-[1.05] text-foreground md:text-6xl lg:text-7xl text-balance">
            Stop overpaying.
            <br />
            <span className="text-primary">Apply every coupon</span>
            <br />
            in one click.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            GoCoupon automatically tests all working promo codes and auto-clips green discount vouchers at checkout on Amazon.com. One click. Maximum savings.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <MagneticButton
              as="a"
              href="https://chromewebstore.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:scale-105 hover:bg-primary-hover hover:shadow-[var(--shadow-accent)]"
            >
              <ChromeIcon />
              <span>Add to Chrome — Free</span>
            </MagneticButton>
            <a
              href="#how"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <span>See how it works</span>
              <ArrowRight className="h-4 w-4 text-primary" />
            </a>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="ml-1 text-foreground">4.9 / 5</span>
            </div>
            <span>·</span>
            <span>180,000+ active shoppers</span>
          </div>
        </div>

        {/* Right: Clean, Simplistic 3D tilt mockup */}
        <div className="reveal relative lg:-top-6" style={{ transitionDelay: "0.15s" }}>
          <ExtensionMockup />
        </div>
      </div>
    </section>
  );
}

function ChromeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
      <path d="M12 2v6M21 8.5l-5.2 3M3 8.5l5.2 3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ExtensionMockup() {
  return (
    <TiltCard
      className="mx-auto w-full max-w-[360px]"
      innerClassName="relative rounded-2xl border border-border bg-card p-5 shadow-xl transition-all duration-300"
    >
      {/* Browser address bar header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex flex-1 items-center justify-center px-3">
          <div className="flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1 font-mono text-[10px] font-medium text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-muted-foreground">https://</span>
            <span className="font-semibold text-foreground">amazon.com</span>
            <span className="text-muted-foreground">/cart</span>
          </div>
        </div>
      </div>

      {/* Clean extension popup container */}
      <div className="mt-3 rounded-xl border border-border bg-background p-4 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary font-display text-[11px] font-bold text-primary-foreground">
              gC
            </div>
            <div>
              <div className="text-xs font-bold text-foreground">GoCoupon</div>
              <div className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                Auto-Saved $40.00 at Checkout
              </div>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Active
          </span>
        </div>

        {/* Amazon Green Voucher Item */}
        <div className="mt-3 flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-700 dark:text-emerald-300 font-mono">
          <span>🎟️ Green Voucher Clipped</span>
          <span className="font-bold">-$15.00</span>
        </div>

        {/* Applied Best Promo Code Item */}
        <div className="mt-2 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className="rounded bg-primary/15 px-1.5 py-0.5 font-bold text-primary">
              SAVE25NOW
            </span>
            <span className="text-[10px] text-muted-foreground">Best Promo Code</span>
          </div>
          <span className="font-bold text-primary">-$25.00</span>
        </div>

        {/* Price drop summary */}
        <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-muted/30 p-2.5 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground line-through">$149.99</span>
            <span className="font-bold text-foreground">$109.99</span>
          </div>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            Saved $40.00 (27% OFF)
          </span>
        </div>
      </div>
    </TiltCard>
  );
}
