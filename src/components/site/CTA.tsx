import { MagneticButton } from "../MagneticButton";
import { Heart, Sparkles, ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section id="cta" className="relative overflow-hidden px-6 py-32">
      <div
        className="reveal relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-rose-500/30 p-12 text-center shadow-2xl md:p-20"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, var(--accent-glow-strong), rgba(245, 158, 11, 0.15), transparent 70%), var(--card)",
        }}
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">
          <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500 animate-pulse" />
          <span>Made for Smart Shoppers</span>
        </div>

        <h2 className="font-display text-4xl font-bold leading-[1.05] text-foreground md:text-6xl text-balance">
          Fall in love with saving money.
          <br />
          <span className="text-primary block mt-1">
            Get GoCoupon 100% Free.
          </span>
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg leading-relaxed">
          Compare prices across Amazon India, Flipkart, Myntra, Croma &amp; 25+ stores, track 90-day price drops, and auto-apply working coupons in 1 click. Zero signup, no credit card, and completely free.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
          <MagneticButton
            as="a"
            href="https://chromewebstore.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 px-8 py-4 text-base font-bold text-white shadow-xl transition-all hover:scale-105 hover:shadow-rose-500/30"
          >
            <span>Add to Chrome — It&apos;s 100% Free</span>
            <ArrowRight className="h-4 w-4" />
          </MagneticButton>
          <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
            <span className="text-amber-500">★★★★★</span>
            <span className="font-semibold text-foreground">4.9 / 5</span>
            <span>(18k+ reviews)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
