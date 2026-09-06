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
    title: "Card-Linked Net Price Intelligence",
    body: "Calculates real checkout prices factoring in instant discounts from HDFC, SBI, ICICI, Axis and cash back rewards from Chase, Amex, Capital One, or Affirm 0% APR.",
    icon: Zap,
  },
  {
    title: "Unbiased Multi-Store Comparison",
    body: "Real-time pricing across Amazon, Flipkart, Walmart, Best Buy, Target, Croma, and 200+ stores. Completely store-agnostic—finding your lowest price is our only objective.",
    icon: Layers,
  },
  {
    title: "1-Second Instant Arbitrage",
    body: "Stores will never tell you when a competitor is cheaper. In 1 second, GoCoupon highlights the single best store for your specific card so you can click and save.",
    icon: Ticket,
  },
  {
    title: "Interactive 90-Day Price Tracker",
    body: "Historical price curves expose fake pre-sale markups and artificial discounts, revealing the true lowest price ever recorded so you buy at the optimal moment.",
    icon: TrendingDown,
  },
  {
    title: "1-Click Auto-Apply Coupons",
    body: "Automatically tests every verified promo code and clips on-page voucher checkboxes in under 2 seconds at checkout across all major retail platforms.",
    icon: ShieldCheck,
  },
  {
    title: "100% Free & Privacy-First",
    body: "Zero signup required, no credit cards stored, and no personal data collection. Free forever—partner stores pay our referral fee when you successfully save.",
    icon: Lock,
  },
];

export function Features() {
  return (
    <section id="features" className="relative px-6 py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div className="reveal mb-16 max-w-2xl">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Commerce Intelligence
          </p>
          <h2 className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl">
            Everything you need to buy smart.
            <br />
            <span className="text-primary">Nothing you don&apos;t.</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            From real-time multi-store price comparisons and 90-day price history curves to auto-applied coupon codes — all built to ensure you never overpay.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="reveal group relative rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg"
                style={{ transitionDelay: `${(i % 3) * 0.08}s` }}
              >
                <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl border border-border bg-secondary/80 text-primary transition-colors group-hover:border-primary/40 group-hover:bg-primary/10">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {f.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
