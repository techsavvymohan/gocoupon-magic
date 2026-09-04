import {
  Zap,
  Ticket,
  ShieldCheck,
  Sparkles,
  Layers,
  TrendingDown,
} from "lucide-react";

const features = [
  {
    title: "1-Click Auto-Apply Promo Codes",
    body: "Our Chrome extension automatically tests all verified coupon codes in under 2 seconds at checkout on 200+ stores and applies the biggest discount.",
    icon: Zap,
  },
  {
    title: "Hidden Voucher Auto-Clipper",
    body: "Spots and auto-clicks hidden green discount checkboxes, coupon vouchers, and bank card offers directly on Amazon India and Flipkart product pages.",
    icon: Ticket,
  },
  {
    title: "Live Multi-Store Comparison",
    body: "Compare real-time prices across Amazon India, Flipkart, Croma, Myntra, Tata CLiQ & Reliance Digital side-by-side with net checkout cost calculation.",
    icon: Layers,
  },
  {
    title: "Interactive 90-Day Price Tracker",
    body: "Accurate historical price curves expose fake pre-sale markups, revealing the true lowest price ever recorded so you buy at the perfect time.",
    icon: TrendingDown,
  },
  {
    title: "Top Trusted Stores Prioritized",
    body: "Search results guarantee authentic, verified listings from India's most trusted e-commerce platforms ranked on top with genuine seller ratings.",
    icon: ShieldCheck,
  },
  {
    title: "100% Free & Privacy-First",
    body: "Zero signup, no credit cards, and no personal data collection. Ultra-lightweight and fast — stays asleep until you are ready to shop.",
    icon: Sparkles,
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
