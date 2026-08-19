import {
  Zap,
  Ticket,
  ShieldCheck,
  HeartHandshake,
  Sparkles,
  Feather,
} from "lucide-react";

const features = [
  {
    title: "1-Click Auto-Apply",
    body: "We test every working coupon code in seconds and automatically apply the one that saves you the most money.",
    icon: Zap,
  },
  {
    title: "Amazon Green Coupon Clicker",
    body: "Amazon hides green discount checkboxes on product pages. We spot them and click them for you automatically so you never miss out.",
    icon: Ticket,
  },
  {
    title: "100% Safe & Private",
    body: "We never see your credit cards, passwords, or personal messages. We only check for the discount code box at checkout.",
    icon: ShieldCheck,
  },
  {
    title: "Cart Safety Guarantee",
    body: "We test codes gently and safely so your checkout never freezes, errors out, or empties your cart.",
    icon: Feather,
  },
  {
    title: "100% Fair Savings Promise",
    body: "We always give you the biggest discount code first, with zero exceptions. Your savings always come first.",
    icon: HeartHandshake,
  },
  {
    title: "Ultra Lightweight & Fast",
    body: "Smaller than a single photo on your phone. Stays asleep while you browse and never slows down your computer.",
    icon: Sparkles,
  },
];

export function Features() {
  return (
    <section id="features" className="relative px-6 py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div className="reveal mb-16 max-w-2xl">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Features
          </p>
          <h2 className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl">
            Everything you want from coupons.
            <br />
            <span className="text-primary">Nothing you don&apos;t.</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Everything you need to save money effortlessly on your favorite stores — with zero clutter or hassle.
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
