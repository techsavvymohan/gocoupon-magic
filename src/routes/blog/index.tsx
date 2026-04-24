import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { posts } from "@/data/posts";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/blog/")({
  component: BlogIndex,
  head: () =>
    createSeoHead({
      title: "Shopping & Coupon Tips Blog – Save More with goCoupon",
      description:
        "Read coupon strategies, cashback guides, sale-season playbooks and product updates. Learn how to save more on Amazon, Flipkart, Myntra and Meesho.",
      path: "/blog",
      keywords:
        "coupon tips blog, cashback guide india, how to apply coupon code, best coupon extension chrome",
    }),
});

const tags = ["All", "Guides", "Deals", "Product"] as const;

function BlogIndex() {
  const featured = posts[0];
  const rest = posts.slice(1);
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
  ]);

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <section className="border-b border-border px-6 pb-16 pt-20 sm:pt-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Blog
          </div>
          <h1 className="max-w-3xl font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Save smarter. One post at a time.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Practical guides, honest deal breakdowns, and occasional product notes from the goCoupon
            team.
          </p>

          <div className="mt-10 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Featured
          </div>
          <Link
            to="/blog/$slug"
            params={{ slug: featured.slug }}
            className="group grid items-stretch gap-8 rounded-3xl border border-border bg-card p-8 transition-colors hover:border-primary/40 md:grid-cols-[1.2fr_1fr]"
          >
            <div className="flex flex-col justify-between">
              <div>
                <div className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  <span className="rounded-full border border-border px-2 py-0.5 text-foreground/80">
                    {featured.tag}
                  </span>
                  <span>{featured.date}</span>
                  <span>·</span>
                  <span>{featured.read}</span>
                </div>
                <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                  {featured.title}
                </h2>
                <p className="mt-4 max-w-xl text-muted-foreground">{featured.excerpt}</p>
              </div>
              <div className="mt-6">
                <span className="text-sm font-medium text-primary transition-opacity group-hover:opacity-80">
                  Read the post →
                </span>
              </div>
            </div>
            <div
              aria-hidden
              className="hidden min-h-[220px] rounded-2xl border border-border md:block"
              style={{
                background:
                  "radial-gradient(120% 80% at 100% 0%, var(--accent-glow-strong), transparent 60%), radial-gradient(80% 60% at 0% 100%, var(--accent-tint), transparent 60%), linear-gradient(180deg, color-mix(in srgb, var(--card) 60%, transparent), var(--card))",
              }}
            />
          </Link>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                All posts
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Latest stories
              </h2>
            </div>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {posts.length} posts
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((p) => (
              <article
                key={p.slug}
                className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
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
                  >
                    Read →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
