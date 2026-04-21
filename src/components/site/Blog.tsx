const posts: { tag: string; date: string; title: string; excerpt: string; read: string }[] = [
  {
    tag: "Guides",
    date: "Apr 12, 2026",
    title: "How to stack coupons and bank offers on Flipkart",
    excerpt:
      "A practical walkthrough of combining coupon codes with card discounts to squeeze the maximum off your cart — without the trial-and-error.",
    read: "5 min read",
  },
  {
    tag: "Deals",
    date: "Apr 03, 2026",
    title: "The truth about Amazon India lightning deals",
    excerpt:
      "We tracked 1,200 lightning deals over 30 days. Here's when prices actually drop, and how goCoupon catches the best window automatically.",
    read: "7 min read",
  },
  {
    tag: "Product",
    date: "Mar 24, 2026",
    title: "Inside goCoupon 2.4 — faster checkout, smarter codes",
    excerpt:
      "Our latest release tests coupons 3× faster and supports Myntra Insider pricing. A short look at what shipped and what's next.",
    read: "4 min read",
  },
];

export function Blog() {
  return (
    <section id="blog" className="border-t border-border px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="reveal mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              From the blog
            </div>
            <h2 className="reveal max-w-2xl font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Save smarter with guides, deal breakdowns and product updates.
            </h2>
          </div>
          <a
            href="#blog"
            className="reveal text-sm font-medium text-primary transition-opacity hover:opacity-80"
            aria-label="View all blog posts"
          >
            View all posts →
          </a>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((p, i) => (
            <article
              key={p.title}
              className="reveal group flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <span className="rounded-full border border-border px-2 py-0.5 text-foreground/80">
                  {p.tag}
                </span>
                <span>{p.date}</span>
              </div>
              <h3 className="font-display text-xl font-bold leading-snug tracking-tight text-foreground">
                {p.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.excerpt}</p>
              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {p.read}
                </span>
                <a
                  href="#blog"
                  className="text-sm font-medium text-primary transition-opacity group-hover:opacity-80"
                  aria-label={`Read: ${p.title}`}
                >
                  Read →
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
