import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { getPostBySlug, posts, type Post, type PostSection } from "@/data/posts";
import { absoluteUrl, breadcrumbSchema, createSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPostBySlug(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  component: PostPage,
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) return { meta: [{ title: "Post not found — goCoupon Blog" }] };
    return createSeoHead({
      title: `${post.title} — goCoupon Blog`,
      description: post.excerpt,
      path: `/blog/${post.slug}`,
      type: "article",
      keywords: "coupon guide india, cashback tips, promo code strategies, online shopping savings",
    });
  },
});

function PostPage() {
  const { post } = Route.useLoaderData();
  const related = posts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: "goCoupon" },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
    datePublished: post.date,
    dateModified: post.date,
  };

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <article className="border-b border-border px-6 pb-20 pt-16 sm:pt-24">
        <div className="mx-auto max-w-3xl">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
          >
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link to="/blog" className="hover:text-foreground">
              Blog
            </Link>
          </nav>

          <div className="mb-5 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="rounded-full border border-border px-2 py-0.5 text-foreground/80">
              {post.tag}
            </span>
            <span>{post.date}</span>
            <span>·</span>
            <span>{post.read}</span>
          </div>

          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">{post.excerpt}</p>

          <div className="mt-8 flex items-center gap-3 border-t border-border pt-6">
            <div
              aria-hidden
              className="grid h-10 w-10 place-items-center rounded-full font-display text-sm font-bold"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              gC
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">{post.author}</div>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Published {post.date}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-3xl">
          <div className="prose-gc space-y-6 text-foreground/90">
            {post.body.map((section: PostSection, i: number) => (
              <Section key={i} section={section} />
            ))}
          </div>
        </div>
      </article>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Keep reading
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
                More from the blog
              </h2>
            </div>
            <Link
              to="/blog"
              className="text-sm font-medium text-primary transition-opacity hover:opacity-80"
            >
              All posts →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {related.map((p) => (
              <RelatedCard key={p.slug} post={p} />
            ))}
          </div>
          <p className="mt-10 text-sm text-muted-foreground">
            Explore more savings pages:{" "}
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
            </Link>
            , and{" "}
            <Link to="/meesho-coupons" className="text-primary">
              Meesho coupon codes
            </Link>
            .
          </p>
        </div>
      </section>
    </SiteShell>
  );
}

function Section({ section }: { section: PostSection }) {
  switch (section.type) {
    case "h2":
      return (
        <h2 className="mt-10 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {section.text}
        </h2>
      );
    case "h3":
      return (
        <h3 className="mt-8 font-display text-xl font-semibold tracking-tight text-foreground">
          {section.text}
        </h3>
      );
    case "p":
      return <p className="text-base leading-7 text-foreground/85">{section.text}</p>;
    case "ul":
      return (
        <ul className="list-disc space-y-2 pl-6 text-foreground/85 marker:text-primary">
          {section.items.map((it, i) => (
            <li key={i} className="leading-7">
              {it}
            </li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote className="border-l-2 border-primary/60 bg-card/60 px-5 py-4 text-foreground/90">
          <p className="font-display text-lg italic">{section.text}</p>
          {section.cite && (
            <cite className="mt-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground not-italic">
              — {section.cite}
            </cite>
          )}
        </blockquote>
      );
    case "link":
      return (
        <aside
          aria-label="Related reading"
          className="mt-10 rounded-2xl border border-border bg-card/60 p-6"
        >
          <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Continue reading
          </div>
          <ul className="space-y-2">
            {section.items.map((item) => (
              <li key={item.to + item.label} className="leading-7">
                <Link
                  to={item.to}
                  className="text-primary underline-offset-4 transition-opacity hover:opacity-80 hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      );
    default:
      return null;
  }
}

function RelatedCard({ post }: { post: Post }) {
  return (
    <article className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40">
      <div className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        <span className="rounded-full border border-border px-2 py-0.5 text-foreground/80">
          {post.tag}
        </span>
        <span>{post.date}</span>
      </div>
      <h3 className="font-display text-lg font-bold leading-snug tracking-tight text-foreground">
        <Link
          to="/blog/$slug"
          params={{ slug: post.slug }}
          className="transition-colors hover:text-primary"
        >
          {post.title}
        </Link>
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {post.read}
        </span>
        <Link
          to="/blog/$slug"
          params={{ slug: post.slug }}
          className="text-sm font-medium text-primary transition-opacity group-hover:opacity-80"
        >
          Read →
        </Link>
      </div>
    </article>
  );
}
