type Testimonial = {
  quote: string;
  name: string;
  role: string;
  location: string;
  avatarBg: string;
  initials: string;
  store: string;
  saved: string;
  rating: number;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "I order on Amazon.com weekly. GoCoupon automatically clicked the green voucher on my air purifier and applied a $35 promo code at checkout. Saved $50 in 2 seconds!",
    name: "Sarah Jenkins",
    role: "Product Designer",
    location: "Seattle, WA",
    avatarBg: "bg-indigo-600 text-white",
    initials: "SJ",
    store: "Amazon.com",
    saved: "Saved $50.00",
    rating: 5,
  },
  {
    quote:
      "Was buying a monitor on Amazon.com and GoCoupon auto-tested 14 promo codes in 1.8 seconds. It picked the highest-saving code and dropped my cart total instantly.",
    name: "Marcus Chen",
    role: "Software Engineer",
    location: "San Francisco, CA",
    avatarBg: "bg-blue-600 text-white",
    initials: "MC",
    store: "Amazon.com",
    saved: "Saved $48.50",
    rating: 5,
  },
  {
    quote:
      "I used to waste 15 minutes googling expired promo codes before checking out on Amazon. GoCoupon tests real working codes automatically right in my browser.",
    name: "Emily Taylor",
    role: "Marketing Manager",
    location: "Austin, TX",
    avatarBg: "bg-emerald-600 text-white",
    initials: "ET",
    store: "Amazon.com",
    saved: "Saved $24.00",
    rating: 5,
  },
  {
    quote:
      "We buy office supplies and tech gear on Amazon every week. The savings add up fast — GoCoupon has saved our team over $600 this year alone.",
    name: "David Miller",
    role: "Business Owner",
    location: "Chicago, IL",
    avatarBg: "bg-amber-600 text-white",
    initials: "DM",
    store: "Amazon.com",
    saved: "Saved $620/yr",
    rating: 5,
  },
  {
    quote:
      "The Amazon green voucher auto-clicker is pure magic. It spots those hidden discount checkboxes on product pages and clips them before you even reach checkout.",
    name: "Jessica Thorne",
    role: "UX Researcher",
    location: "New York, NY",
    avatarBg: "bg-purple-600 text-white",
    initials: "JT",
    store: "Amazon.com",
    saved: "Voucher Auto-Clipped",
    rating: 5,
  },
  {
    quote:
      "Super lightweight Chrome extension. Never slows down my browser, stays completely private, and saves me money every time I shop on Amazon.com.",
    name: "Alex Rivera",
    role: "Content Creator",
    location: "Miami, FL",
    avatarBg: "bg-rose-600 text-white",
    initials: "AR",
    store: "Amazon.com",
    saved: "Saved $35.00",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="relative overflow-hidden px-6 py-28">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Verified Amazon.com (US) Shoppers</span>
            </div>
            <h2 className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl">
              Loved by Amazon.com Shoppers Across the US.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground font-mono">
              ⚡ Currently available for <span className="font-bold text-foreground">Amazon.com (US)</span>. Support for Flipkart, Myntra, Meesho &amp; Walmart is coming soon!
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 text-amber-500 font-bold">
              {"★".repeat(5)}
            </span>
            <span className="font-bold text-foreground">4.9 / 5.0</span>
            <span>(12,400+ Amazon reviews)</span>
          </div>
        </div>

        {/* Clear, Flat Marquee Slider */}
        <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
          <div className="flex w-max space-x-6 animate-[marquee_45s_linear_infinite] hover:[animation-play-state:paused] py-2">
            {[...testimonials, ...testimonials].map((t, index) => (
              <div
                key={`${t.name}-${index}`}
                className="w-[360px] shrink-0 rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary"
              >
                {/* Card Top: Rating + Store Savings */}
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-amber-500">
                    {"★".repeat(t.rating)}
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="rounded-md border border-border bg-secondary px-2 py-0.5 font-bold text-foreground">
                      {t.store}
                    </span>
                    <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 font-bold text-emerald-600 dark:text-emerald-400">
                      {t.saved}
                    </span>
                  </div>
                </div>

                {/* Quote */}
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-3 border-t border-border/60 pt-4">
                  <div
                    className={`grid h-9 w-9 place-items-center rounded-full font-display text-xs font-bold ${t.avatarBg}`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{t.name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {t.role} • {t.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
