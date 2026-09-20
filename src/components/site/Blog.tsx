import { Link } from "@tanstack/react-router";

interface FeaturedPost {
  slug: string;
  tag: string;
  date: string;
  title: string;
  excerpt: string;
  read: string;
  cover?: string;
}

const featured: FeaturedPost[] = [
  {
    slug: "why-other-coupon-apps-fail-and-how-gocoupon-saves-thousands",
    tag: "Expense Saviour",
    date: "Sep 8, 2026",
    title: "Why Other Coupon Apps Leave 70% of Your Money on the Table (And How GoCoupon Rescues Your Budget)",
    excerpt:
      "Most coupon apps only test dead promo codes while you overpay by ₹3,000 to $100 on every order. Here is how GoCoupon's 4-tier savings collapse puts ₹50,000+ back into your family budget every year.",
    read: "5 min read",
  },
  {
    slug: "how-gocoupon-finds-best-discounts",
    tag: "Shopping Tips",
    date: "Aug 19, 2026",
    title: "How GoCoupon Automatically Finds the Biggest Online Discounts in Seconds",
    excerpt:
      "Stop wasting time searching for expired coupon codes on random websites. Here is how GoCoupon tests real codes and saves you money in one click.",
    read: "4 min read",
  },
  {
    slug: "amazon-clip-coupons-vs-promo-codes",
    tag: "Amazon Tips",
    date: "Aug 15, 2026",
    title: "The Amazon Green Coupon Trick: How to Save an Extra 20% on Every Order",
    excerpt:
      "Did you know Amazon hides secret green discount checkboxes on product pages? Here is how they work and how GoCoupon automatically clips them for you.",
    read: "5 min read",
  },
];

export function Blog() {

  return (
    <section id="blog" className="border-t border-border px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="reveal mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-primary font-bold">
              <span>Why Us Only • The Expense Saviour</span>
            </div>
            <h2 className="reveal max-w-3xl font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
              Stop Donating Your Hard-Earned Money to Overpriced Checkouts.
            </h2>
            <p className="reveal mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
              Online stores count on you being too busy to cross-check competing stores or dig for hidden card discounts. We expose the real shopping math and rescue your monthly budget.
            </p>
          </div>
          <Link
            to="/blog"
            className="reveal inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary transition-opacity hover:opacity-80"
            aria-label="View all shopping guides"
          >
            <span>Read All Expense Guides</span>
            <span>→</span>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {featured.map((p, i) => (
            <article
              key={p.slug}
              className="reveal group flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              {p.cover && (
                <div className="-mx-6 -mt-6 mb-5 aspect-[16/9] overflow-hidden bg-muted">
                  <img
                    src={p.cover}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <span className="rounded-full border border-border px-2 py-0.5 text-foreground/80">
                  {p.tag}
                </span>
                <span>{p.date}</span>
              </div>
              <h3 className="font-display text-xl font-bold leading-snug tracking-tight text-foreground">
                <Link
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="transition-colors hover:text-primary"
                >
                  {p.title}
                </Link>
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.excerpt}</p>
              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {p.read}
                </span>
                <Link
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="text-sm font-medium text-primary transition-opacity group-hover:opacity-80"
                  aria-label={`Read: ${p.title}`}
                >
                  Read →
                </Link>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Looking for store pages? Visit{" "}
          <Link to="/amazon-coupons" className="text-primary">
            Amazon coupons
          </Link>
          ,{" "}
          <Link to="/flipkart-coupons" className="text-primary">
            Flipkart coupons
          </Link>
          ,{" "}
          <Link to="/myntra-coupons" className="text-primary">
            Myntra coupons
          </Link>{" "}
          and{" "}
          <Link to="/meesho-coupons" className="text-primary">
            Meesho coupons
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
