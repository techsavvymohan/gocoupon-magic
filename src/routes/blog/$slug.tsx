import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { getPostBySlug, posts, type Post, type PostSection } from "@/data/posts";
import { absoluteUrl, breadcrumbSchema, createSeoHead } from "@/lib/seo";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { parseMarkdownToSections, FormattedText } from "@/lib/markdown";
import {
  Copy,
  Check,
  Info,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  ArrowLeft,
  Clock,
  Calendar,
  Share2,
} from "lucide-react";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    let post = getPostBySlug(params.slug);
    if (!post) {
      try {
        const res = await fetch(`/api/blogs/${params.slug}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const b = json.data;
            const parsedBody: PostSection[] = Array.isArray(b.body) && b.body.length > 0
              ? b.body
              : (b.content
                  ? parseMarkdownToSections(b.content)
                  : [{ type: "p" as const, text: b.shortDescription || b.excerpt || "" }]
                );

            post = {
              slug: b.slug,
              tag: b.category || b.tag || "General",
              date: b.date || (b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent"),
              title: b.title,
              excerpt: b.shortDescription || b.excerpt || "",
              read: b.readTime || b.read || "5 min read",
              author: b.author || "GoCoupon Editorial",
              cover: b.image || b.cover,
              body: parsedBody,
            };
          }
        }
      } catch {
        // network or server error fallback
      }
    }
    if (!post) throw notFound();
    return { post };
  },
  component: PostPage,
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) return { meta: [{ title: "Post not found — goCoupon Blog" }] };
    return createSeoHead({
      title: `${post.title} — goCoupon Engineering & Deals Blog`,
      description: post.excerpt,
      path: `/blog/${post.slug}`,
      type: "article",
      keywords: `${post.tag.toLowerCase()}, buyhatke alternative, flash.co alternative, price tracker india, auto apply coupon extension, ${post.slug.split("-").join(" ")}`,
    });
  },
});

function PostPage() {
  const { post } = Route.useLoaderData();
  const related = posts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

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

  const faqItems = post.body
    .filter(
      (sec: PostSection): sec is Extract<PostSection, { type: "callout" }> =>
        sec.type === "callout" &&
        Boolean(
          sec.title &&
            (sec.title.endsWith("?") ||
              sec.title.toLowerCase().startsWith("can") ||
              sec.title.toLowerCase().startsWith("how") ||
              sec.title.toLowerCase().startsWith("is") ||
              sec.title.toLowerCase().startsWith("does") ||
              sec.title.toLowerCase().startsWith("which") ||
              sec.title.toLowerCase().startsWith("what"))
        )
    )
    .map((sec: Extract<PostSection, { type: "callout" }>) => ({
      "@type": "Question",
      name: sec.title,
      acceptedAnswer: {
        "@type": "Answer",
        text: sec.text,
      },
    }));

  const faqSchema =
    faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems,
        }
      : null;

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
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <article className="border-b border-border px-6 pb-20 pt-16 sm:pt-24">
        <div className="mx-auto max-w-3xl">
          {/* Breadcrumb Navigation */}
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
          >
            <Link to="/blog" className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
              <ArrowLeft className="h-3 w-3" />
              Back to Blog
            </Link>
            <span className="opacity-40">/</span>
            <span className="text-foreground/80 truncate">{post.tag}</span>
          </nav>

          {/* Meta header */}
          <div className="mb-5 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-bold text-primary">
              {post.tag}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3 opacity-60" />
              {post.date}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 opacity-60" />
              {post.read}
            </span>
          </div>

          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>

          {/* Author Card & Share Action */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
            <div className="flex items-center gap-3">
              <div
                aria-hidden
                className="grid h-10 w-10 place-items-center rounded-xl font-display text-xs font-bold shadow-xs"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                gC
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{post.author}</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Verified Engineering Post
                </div>
              </div>
            </div>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-mono text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors shadow-2xs"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-semibold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share Article</span>
                </>
              )}
            </button>
          </div>

          {post.cover && (
            <div className="mt-10 overflow-hidden rounded-3xl border border-border/80 bg-muted/20 shadow-xl">
              <img
                src={getOptimizedImageUrl(post.cover, { width: 1200 })}
                alt={post.title}
                className="w-full h-auto max-h-[480px] object-cover"
                loading="eager"
              />
            </div>
          )}
        </div>

        {/* Post Body Content */}
        <div className="mx-auto mt-14 max-w-3xl">
          <div className="prose-gc space-y-6 text-foreground/90 leading-relaxed">
            {post.body.map((section: PostSection, i: number) => (
              <Section key={i} section={section} />
            ))}
          </div>
        </div>
      </article>

      {/* Related Posts Section */}
      <section className="px-6 py-20 bg-muted/20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                Keep Reading
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
                More Engineering &amp; Savings Guides
              </h2>
            </div>
            <Link
              to="/blog"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-opacity hover:opacity-80"
            >
              <span>All Articles</span>
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {related.map((p) => (
              <RelatedCard key={p.slug} post={p} />
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function Section({ section }: { section: PostSection }) {
  switch (section.type) {
    case "h2":
      return (
        <h2 className="mt-12 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl border-b border-border/60 pb-3">
          <FormattedText text={section.text} />
        </h2>
      );
    case "h3":
      return (
        <h3 className="mt-8 font-display text-xl font-bold tracking-tight text-foreground">
          <FormattedText text={section.text} />
        </h3>
      );
    case "p":
      return (
        <p className="text-base leading-7 text-foreground/85">
          <FormattedText text={section.text} />
        </p>
      );
    case "ul":
      return (
        <ul className="list-disc space-y-2.5 pl-6 text-foreground/85 marker:text-primary">
          {section.items.map((it, i) => (
            <li key={i} className="leading-7">
              <FormattedText text={it} />
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="list-decimal space-y-2.5 pl-6 text-foreground/85 marker:text-primary marker:font-bold">
          {section.items.map((it, i) => (
            <li key={i} className="leading-7">
              <FormattedText text={it} />
            </li>
          ))}
        </ol>
      );
    case "hr":
      return <hr className="my-10 border-t border-border/70" />;
    case "quote":
      return (
        <blockquote className="my-6 border border-border/80 bg-muted/20 p-6 text-foreground/90 rounded-2xl">
          <p className="font-display text-lg italic leading-relaxed text-foreground">
            “<FormattedText text={section.text} />”
          </p>
          {section.cite && (
            <cite className="mt-3 block font-mono text-[11px] uppercase tracking-[0.2em] text-primary not-italic">
              — <FormattedText text={section.cite} />
            </cite>
          )}
        </blockquote>
      );
    case "callout": {
      const isWarning = section.variant === "warning";
      const isSuccess = section.variant === "success";

      const Icon = isWarning ? AlertTriangle : isSuccess ? CheckCircle2 : Info;
      const borderClass = isWarning
        ? "border-amber-500/30 bg-amber-500/5 text-foreground"
        : isSuccess
        ? "border-emerald-500/30 bg-emerald-500/5 text-foreground"
        : "border-primary/30 bg-primary/5 text-foreground";

      const iconColor = isWarning
        ? "text-amber-500"
        : isSuccess
        ? "text-emerald-500"
        : "text-primary";

      return (
        <aside className={`my-8 rounded-2xl border p-5 shadow-2xs backdrop-blur-xs ${borderClass}`}>
          <div className="flex items-start gap-3">
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconColor}`} />
            <div className="w-full">
              {section.title && (
                <strong className="block font-display text-sm font-bold text-foreground mb-1">
                  <FormattedText text={section.title} />
                </strong>
              )}
              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                <FormattedText text={section.text} />
              </p>
            </div>
          </div>
        </aside>
      );
    }
    case "code":
      return <CodeBlock code={section.code} language={section.language} caption={section.caption} />;
    case "table":
      return (
        <div className="my-8 overflow-hidden rounded-2xl border border-border shadow-md bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="border-b border-border bg-muted/80 font-mono text-xs uppercase tracking-wider text-foreground">
                <tr>
                  {section.headers.map((h, i) => (
                    <th key={i} className="px-5 py-3.5 font-bold whitespace-nowrap">
                      <FormattedText text={h} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {section.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-muted/30 transition-colors odd:bg-card even:bg-muted/10">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-5 py-3.5 text-foreground/90 font-medium leading-relaxed">
                        <FormattedText text={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    case "link":
      return (
        <aside
          aria-label="Related reading"
          className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-2xs"
        >
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-primary font-bold">
            Continue Reading &amp; Resources
          </div>
          <ul className="space-y-2.5">
            {section.items.map((item) => (
              <li key={item.to + item.label} className="leading-7">
                <Link
                  to={item.to}
                  className="font-medium text-primary underline-offset-4 transition-opacity hover:opacity-80 hover:underline inline-flex items-center gap-1.5"
                >
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      );
    case "image":
      return (
        <figure className="my-8 overflow-hidden rounded-2xl border border-border bg-card shadow-md">
          <img
            src={getOptimizedImageUrl(section.url)}
            alt={section.alt || section.caption || "Blog article image"}
            className="w-full object-cover max-h-[500px]"
            loading="lazy"
          />
          {section.caption && (
            <figcaption className="p-3 text-center font-mono text-xs text-muted-foreground border-t border-border/60 bg-muted/20">
              {section.caption}
            </figcaption>
          )}
        </figure>
      );
    default:
      return null;
  }
}

function CodeBlock({ code, language, caption }: { code: string; language?: string; caption?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-border bg-[#0d1117] text-[#c9d1d9] shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <span className="ml-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {language || "code"}
          </span>
          {caption && (
            <span className="text-[11px] text-muted-foreground/80 font-mono hidden sm:inline">
              · {caption}
            </span>
          )}
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-mono text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
        >
          {copied ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Check size={12} /> Copied!
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Copy size={12} /> Copy Code
            </span>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function RelatedCard({ post }: { post: Post }) {
  return (
    <article className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-md">
      <div className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
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
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-2">{post.excerpt}</p>
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {post.read}
        </span>
        <Link
          to="/blog/$slug"
          params={{ slug: post.slug }}
          className="text-sm font-semibold text-primary transition-opacity group-hover:opacity-80"
        >
          Read →
        </Link>
      </div>
    </article>
  );
}
