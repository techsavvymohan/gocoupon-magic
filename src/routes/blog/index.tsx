import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { posts, type Post } from "@/data/posts";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import { Search, Sparkles, ArrowRight, Tag, BookOpen, Layers } from "lucide-react";

export const Route = createFileRoute("/blog/")({
  component: BlogIndex,
  head: () =>
    createSeoHead({
      title: "Smart Shopping & Coupon Blog – Easy Money Saving Guides | GoCoupon",
      description:
        "Read easy shopping guides, Amazon green coupon tricks, discount stacking secrets, and privacy reviews from the GoCoupon team.",
      path: "/blog",
      keywords:
        "shopping savings blog, amazon coupon tricks, how to save money online, coupon stacking guide, gocoupon tips",
    }),
});

const allTags = [
  "All",
  "Shopping Tips",
  "Amazon Tips",
  "Safety & Privacy",
  "Shopping Guides",
  "Cashback & Deals",
] as const;

function BlogIndex() {
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesTag =
        selectedTag === "All" || post.tag.toLowerCase() === selectedTag.toLowerCase();
      const matchesSearch =
        searchQuery.trim() === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tag.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTag && matchesSearch;
    });
  }, [selectedTag, searchQuery]);

  const featured = posts[0];

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

      {/* Header Section */}
      <section className="relative border-b border-border px-6 pb-16 pt-20 sm:pt-28 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[400px] w-[700px] -translate-x-1/2 opacity-20 blur-[100px]"
          style={{
            background:
              "radial-gradient(circle at center, var(--accent-glow-strong), transparent 70%)",
          }}
        />

        <div className="mx-auto max-w-7xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            <BookOpen className="h-3.5 w-3.5" />
            Engineering &amp; Savings Desk
          </div>
          <h1 className="max-w-3xl font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Save smarter. Engineered from first principles.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
            Technical architecture deep dives, coupon scoring algorithms, Amazon clip voucher
            analyses, and practical checkout strategies from the GoCoupon team.
          </p>

          {/* Search Bar & Tag Filters */}
          <div className="mt-10 space-y-5 max-w-3xl">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search money-saving guides (e.g. Amazon, Green Coupons, Cash Back, Discounts)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-border bg-card/80 py-3.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all shadow-xs backdrop-blur-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Tag Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {allTags.map((t) => {
                const isActive = selectedTag === t;
                return (
                  <button
                    key={t}
                    onClick={() => setSelectedTag(t)}
                    className={`rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] transition-all cursor-pointer ${
                      isActive
                        ? "bg-primary text-primary-foreground font-bold shadow-xs scale-105"
                        : "border border-border bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Article Section (Show only if no active filter/search or if featured matches) */}
      {selectedTag === "All" && searchQuery === "" && (
        <section className="border-b border-border px-6 py-16 bg-muted/10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary font-bold">
              <Sparkles className="h-3.5 w-3.5" />
              Featured Technical Breakdown
            </div>
            <Link
              to="/blog/$slug"
              params={{ slug: featured.slug }}
              className="group grid items-stretch gap-8 rounded-3xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-xl md:grid-cols-[1.2fr_1fr]"
            >
              <div className="flex flex-col justify-between">
                <div>
                  <div className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-bold text-primary">
                      {featured.tag}
                    </span>
                    <span>{featured.date}</span>
                    <span>·</span>
                    <span>{featured.read}</span>
                  </div>
                  <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl group-hover:text-primary transition-colors">
                    {featured.title}
                  </h2>
                  <p className="mt-4 max-w-xl text-muted-foreground text-sm leading-relaxed sm:text-base">
                    {featured.excerpt}
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-2 font-semibold text-primary">
                  <span>Read full architecture analysis</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
              <div
                aria-hidden
                className="hidden min-h-[240px] rounded-2xl border border-border/80 p-6 md:flex flex-col justify-between"
                style={{
                  background:
                    "radial-gradient(120% 80% at 100% 0%, var(--accent-glow-strong), transparent 60%), radial-gradient(80% 60% at 0% 100%, var(--accent-tint), transparent 60%), linear-gradient(180deg, color-mix(in srgb, var(--card) 60%, transparent), var(--card))",
                }}
              >
                <div className="font-mono text-xs text-primary font-bold">GOCOUPON ARCHITECTURE</div>
                <div className="rounded-xl border border-border bg-background/80 p-4 font-mono text-xs text-foreground/90 backdrop-blur-xs">
                  <div>Score = (w1·Health) + (w2·Uses)</div>
                  <div className="text-emerald-500 font-bold mt-1">✓ Stage: live_verified (1.00)</div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Grid of Articles */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between gap-6 border-b border-border/60 pb-4">
            <div>
              <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {selectedTag === "All" && !searchQuery ? "All Articles" : `Filtered Results (${selectedTag})`}
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
                {searchQuery ? `Articles matching "${searchQuery}"` : "Latest Stories & Deep Dives"}
              </h2>
            </div>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {filteredPosts.length} {filteredPosts.length === 1 ? "article" : "articles"}
            </span>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card p-12 text-center">
              <h3 className="font-display text-lg font-bold text-foreground">No articles found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                No stories match your current search or tag filter.
              </p>
              <button
                onClick={() => {
                  setSelectedTag("All");
                  setSearchQuery("");
                }}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((p) => (
                <article
                  key={p.slug}
                  className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
                >
                  <div>
                    <div className="mb-4 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      <span className="rounded-full border border-border px-2.5 py-0.5 text-foreground/80 font-semibold">
                        {p.tag}
                      </span>
                      <span>{p.date}</span>
                    </div>
                    <h3 className="font-display text-lg font-bold leading-snug tracking-tight text-foreground group-hover:text-primary transition-colors">
                      <Link to="/blog/$slug" params={{ slug: p.slug }}>
                        {p.title}
                      </Link>
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                      {p.excerpt}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      {p.read}
                    </span>
                    <Link
                      to="/blog/$slug"
                      params={{ slug: p.slug }}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-opacity group-hover:opacity-80"
                    >
                      <span>Read</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
