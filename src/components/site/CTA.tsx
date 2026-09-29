import { MagneticButton } from "../MagneticButton";
import { ArrowRight, Star } from "lucide-react";

export function CTA() {
  return (
    <section id="cta" className="relative px-4 sm:px-6 py-14 sm:py-20 border-t border-border">
      <div className="reveal relative mx-auto max-w-4xl rounded-2xl border border-border bg-card p-8 sm:p-16 text-center shadow-xs">
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground text-balance">
          Put Real Money Back
          <span className="text-primary block mt-1">
            Into Your Household Budget.
          </span>
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed text-balance">
          Every time you buy without GoCoupon, you risk leaving money on the table in hidden vouchers, store price differences, and unclaimed bank discounts. Add GoCoupon in 10 seconds — free forever.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <MagneticButton
            as="a"
            href="https://chromewebstore.google.com/detail/gbmfihnboadlmmjbikajlmocjmlpehij"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground shadow-xs transition-all hover:scale-105 active:scale-95"
          >
            <span>Add GoCoupon Free — Start Saving</span>
            <ArrowRight className="h-4 w-4" />
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
            <span>(18k+ reviews)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
