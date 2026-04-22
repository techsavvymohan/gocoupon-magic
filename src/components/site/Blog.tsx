import { Link } from "@tanstack/react-router";
import { posts } from "@/data/posts";

export function Blog() {
  const featured = posts.slice(0, 3);

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
          <Link
            to="/blog"
            className="reveal text-sm font-medium text-primary transition-opacity hover:opacity-80"
            aria-label="View all blog posts"
          >
            View all posts →
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {featured.map((p, i) => (
            <article
              key={p.slug}
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
          Looking for store pages? Visit <Link to="/amazon-coupons" className="text-primary">Amazon coupons</Link>,{" "}
          <Link to="/flipkart-coupons" className="text-primary">Flipkart coupons</Link>,{" "}
          <Link to="/myntra-coupons" className="text-primary">Myntra coupons</Link> and{" "}
          <Link to="/meesho-coupons" className="text-primary">Meesho coupons</Link>.
        </p>
      </div>
    </section>
  );
}
