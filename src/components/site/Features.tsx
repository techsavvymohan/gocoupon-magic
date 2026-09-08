import {
  Zap,
  Ticket,
  ShieldCheck,
  Lock,
  Layers,
  TrendingDown,
} from "lucide-react";

const features = [
  {
    title: "Instant Price Drop (IPD) Engine",
    body: "Don't wait weeks for a passive price drop alert. GoCoupon calculates instant savings right when you buy by combining live merchant discounts, hidden promo codes, and card offers immediately.",
    icon: Zap,
  },
  {
    title: "4-Tier True Landed Cost Calculation",
    body: "Sticker Price minus Auto-Coupon minus Bank Instant Rebate minus Cashback reward. We calculate the exact out-of-pocket payment before you complete checkout.",
    icon: Layers,
  },
  {
    title: "30-Day Deal Honesty Radar",
    body: "Exposes fake sales and pre-festival price hikes using our 30-day baseline analysis. Instantly flags whether a product is a Real Bargain or an artificial marketing markup.",
    icon: TrendingDown,
  },
  {
    title: "Bank Card & Payment Arbitrage",
    body: "Dynamically checks which card in your wallet (HDFC, SBI, ICICI, Axis, Amex, Chase, Citi) unlocks the highest instant checkout rebate, without ever asking for card numbers.",
    icon: Ticket,
  },
  {
    title: "Universal Multi-Store Intelligence",
    body: "Real-time pricing across Amazon, Flipkart, Walmart, Best Buy, Target, Croma, and 500+ direct brand stores worldwide. 100% unbiased—finding you the lowest price is our only objective.",
    icon: ShieldCheck,
  },
  {
    title: "Bank-Grade Privacy & 1-Click Savings",
    body: "Tests every working code in under 2 seconds. Operates in a local sandboxed browser environment with zero keystroke logging, zero personal data harvesting, and zero cost.",
    icon: Lock,
  },
];

export function Features() {
  return (
    <section id="features" className="relative px-4 sm:px-6 py-20 sm:py-28 overflow-hidden border-t border-border">
      <div className="mx-auto max-w-7xl">
        <div className="reveal mb-14 max-w-2xl">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground text-balance">
            Instant savings when you buy.
            <span className="text-primary block mt-1">Not weeks later.</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            From our Instant Price Drop engine and 4-tier stacked savings calculator to 30-day Deal Honesty verification — engineered to guarantee you never overpay online.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="reveal group relative rounded-xl border border-border bg-card p-6 sm:p-7 shadow-xs transition-colors hover:border-primary/50"
                style={{ transitionDelay: `${(i % 3) * 0.08}s` }}
              >
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <h3 className="font-display text-base sm:text-lg font-bold text-foreground">
                  {f.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
