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
      "Was buying a ₹14k phone on Flipkart and goCoupon just worked — no clicking around testing 12 expired codes. Saved me ₹1,200 in literally one second.",
    name: "Aarav Mehta",
    role: "Product Designer",
    location: "Bangalore",
    avatarBg: "bg-indigo-600 text-white",
    initials: "AM",
    store: "Flipkart",
    saved: "Saved ₹1,200",
    rating: 5,
  },
  {
    quote:
      "I'm cynical about extensions like this — goCoupon proved me wrong every single time on Myntra. Cashback hit my UPI on the 3rd of every month like clockwork.",
    name: "Priya Iyer",
    role: "Software Engineer",
    location: "Pune",
    avatarBg: "bg-pink-600 text-white",
    initials: "PI",
    store: "Myntra",
    saved: "UPI Cashback",
    rating: 5,
  },
  {
    quote:
      "Run a small import business and order on Amazon weekly. The savings sound boring until you add them up — goCoupon makes them ridiculous over a year.",
    name: "Rohit Bansal",
    role: "Founder",
    location: "Jaipur",
    avatarBg: "bg-amber-600 text-white",
    initials: "RB",
    store: "Amazon IN",
    saved: "Saved ₹18,000/yr",
    rating: 5,
  },
  {
    quote:
      "I shop Meesho and Nykaa for beauty & home items constantly. goCoupon finds stackable bank coupons I didn't even know existed on checkout!",
    name: "Ananya Sharma",
    role: "Marketing Lead",
    location: "Delhi NCR",
    avatarBg: "bg-teal-600 text-white",
    initials: "AS",
    store: "Meesho & Nykaa",
    saved: "Saved ₹850",
    rating: 5,
  },
  {
    quote:
      "The auto-test feature is insanely fast. Watching 15 coupon codes get scanned in 0.4 seconds and pick the winner is developer art.",
    name: "Vikramaditya Roy",
    role: "Tech Lead",
    location: "Hyderabad",
    avatarBg: "bg-blue-600 text-white",
    initials: "VR",
    store: "Tata CLiQ",
    saved: "Saved ₹3,100",
    rating: 5,
  },
  {
    quote:
      "Applied a ₹2,400 coupon on Ajio during Diwali sale automatically. Easily the best Chrome extension I've installed this year for festive shopping.",
    name: "Sneha Kulkarni",
    role: "Content Creator",
    location: "Mumbai",
    avatarBg: "bg-purple-600 text-white",
    initials: "SK",
    store: "Ajio",
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
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              Verified Reviews
            </p>
            <h2 className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl">
              Loved by 180,000+ shoppers across India.
            </h2>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 text-amber-500 font-bold">
              {"★".repeat(5)}
            </span>
            <span className="font-bold text-foreground">4.9 / 5.0</span>
            <span>(12,400+ reviews)</span>
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
                  <div className="flex items-center gap-1 text-amber-500 text-xs">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {t.saved}
                  </span>
                </div>

                {/* Review Text */}
                <blockquote className="text-sm leading-relaxed text-foreground font-medium">
                  "{t.quote}"
                </blockquote>

                {/* Author Info */}
                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`grid h-8 w-8 place-items-center rounded-full ${t.avatarBg} font-mono text-xs font-bold`}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-foreground">
                          {t.name}
                        </span>
                        <span
                          title="Verified Buyer"
                          className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-bold text-white"
                        >
                          ✓
                        </span>
                      </div>
                      <div className="font-mono text-[10px] text-muted-foreground">
                        {t.role} · {t.location}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] font-semibold text-muted-foreground">
                    {t.store}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
