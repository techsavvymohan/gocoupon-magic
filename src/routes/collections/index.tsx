/**
 * @file collections/index.tsx
 * @description Curated Flash-Style Category Guides & Shortlists Index.
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import { CURATED_COLLECTIONS } from "@/data/collectionsData";
import { ArrowRight, Award, ShieldCheck, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/collections/")({
  component: CollectionsIndexPage,
  head: () =>
    createSeoHead({
      title: "Curated Buying Guides & Evidence-Backed Rankings – goCoupon",
      description:
        "Explore Flash.co-inspired category shortlists. Top products scored with transparent rubrics across noise cancellation, battery life, thermals, and value.",
      path: "/collections",
      keywords: "best headphones india, buying guides 2026, top laptops india, evidence backed product reviews",
    }),
});

function CollectionsIndexPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Curated Collections", path: "/collections" },
  ]);

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <section className="relative border-b border-border px-6 pb-16 pt-20 sm:pt-28">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 font-mono text-xs uppercase tracking-[0.2em] text-primary">
            <Award className="h-3.5 w-3.5" />
            Evidence-Backed Product Shortlists
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Only the Top 1%. Backed by Real Proof.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            We synthesize lab benchmarks, tear-downs, and thousands of verified buyer reviews into transparent weighted rubrics.
          </p>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2">
            {CURATED_COLLECTIONS.map((col) => (
              <article
                key={col.slug}
                className="group relative flex flex-col justify-between rounded-3xl border border-border bg-card p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-primary uppercase tracking-wider">
                      {col.category} • {col.budgetCapLabel}
                    </span>
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      {col.rubricVersion}
                    </span>
                  </div>

                  <h2 className="mt-4 font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    <Link to="/collections/$slug" params={{ slug: col.slug }}>
                      {col.title}
                    </Link>
                  </h2>

                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    {col.subtitle}
                  </p>

                  {/* Top Item Preview */}
                  {col.items[0]?.product && (
                    <div className="mt-6 rounded-2xl border border-border/80 bg-muted/20 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-amber-500 font-display text-sm font-bold text-white">
                          #1
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-mono text-muted-foreground block">Top Recommendation:</span>
                          <h4 className="truncate text-xs font-bold text-foreground">
                            {col.items[0].product.title}
                          </h4>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
                  <span className="font-mono text-xs text-muted-foreground">
                    Updated {col.updatedDate}
                  </span>
                  <Link
                    to="/collections/$slug"
                    params={{ slug: col.slug }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:underline"
                  >
                    <span>Read Full Evidence &amp; Rubric</span>
                    <ArrowRight className="h-4 w-4" />
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
