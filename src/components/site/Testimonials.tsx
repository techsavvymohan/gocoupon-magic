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
      "Was buying Sony WH-1000XM5 on Amazon India for ₹29,990. GoCoupon showed Croma had it for ₹26,990 plus applied a ₹1,500 bank discount. Saved ₹4,500 in 10 seconds!",
    name: "Aditya Sharma",
    role: "Senior Software Engineer",
    location: "Bengaluru, Karnataka",
    avatarBg: "bg-indigo-600 text-white",
    initials: "AS",
    store: "Amazon & Croma",
    saved: "Saved ₹4,500",
    rating: 5,
  },
  {
    quote:
      "The 90-day price tracker is invaluable. I almost bought running shoes during a 'mega sale' until GoCoupon showed the seller raised the price right before discounting it. Bought them 3 days later at true all-time low.",
    name: "Priya Nair",
    role: "Product Manager",
    location: "Mumbai, Maharashtra",
    avatarBg: "bg-emerald-600 text-white",
    initials: "PN",
    store: "Myntra",
    saved: "Saved ₹1,850",
    rating: 5,
  },
  {
    quote:
      "I shop on Flipkart and Amazon weekly. The coupon auto-tester tried 9 promo codes at checkout and knocked ₹650 off my cart without me searching through spammy coupon sites.",
    name: "Rohan Verma",
    role: "Growth Marketer",
    location: "New Delhi, Delhi",
    avatarBg: "bg-blue-600 text-white",
    initials: "RV",
    store: "Flipkart",
    saved: "Saved ₹650",
    rating: 5,
  },
  {
    quote:
      "Saved over ₹18,000 on home appliances by comparing prices across Flipkart, Reliance Digital, and Tata CLiQ. The net price comparison factoring in card offers is a complete game changer.",
    name: "Sneha Kulkarni",
    role: "Architect",
    location: "Pune, Maharashtra",
    avatarBg: "bg-amber-600 text-white",
    initials: "SK",
    store: "Reliance Digital",
    saved: "Saved ₹18,200",
    rating: 5,
  },
  {
    quote:
      "The green coupon box auto-clicker on Amazon India is brilliant. Half the time I never notice the tiny 10% coupon checkbox beneath the price until GoCoupon clicks it for me automatically.",
    name: "Karthik Raja",
    role: "Financial Analyst",
    location: "Chennai, Tamil Nadu",
    avatarBg: "bg-purple-600 text-white",
    initials: "KR",
    store: "Amazon India",
    saved: "Voucher Auto-Clipped",
    rating: 5,
  },
  {
    quote:
      "Super clean, ultra-fast, and completely private. No spammy popups or redirect loops. It gives you the raw 90-day price history and the lowest store price right when you need it.",
    name: "Ananya Deshmukh",
    role: "UX Designer",
    location: "Hyderabad, Telangana",
    avatarBg: "bg-rose-600 text-white",
    initials: "AD",
    store: "Tata CLiQ",
    saved: "Saved ₹2,400",
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
              <span>Verified Indian Shoppers</span>
            </div>
            <h2 className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl">
              Loved by Smart Shoppers Across India.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground font-mono">
              ⚡ Real-time savings across Amazon India, Flipkart, Myntra, Croma, Tata CLiQ &amp; Reliance Digital.
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 text-amber-500 font-bold">
              {"★".repeat(5)}
            </span>
            <span className="font-bold text-foreground">5-Star Community Feedback</span>
            <span>(Verified shopper stories)</span>
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
