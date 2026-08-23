/**
 * @file collections/$slug.tsx
 * @description Detailed Evidence-Backed Category Guide.
 */

import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import { CURATED_COLLECTIONS } from "@/data/collectionsData";
import { CANONICAL_EVIDENCE } from "@/data/canonicalCatalogData";
import { FlashVerdictBadge } from "@/components/shopping/FlashVerdictBadge";
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, ChevronRight, Award } from "lucide-react";

export const Route = createFileRoute("/collections/$slug")({
  component: CollectionDetailsPage,
  head: ({ params }) => {
    const col = CURATED_COLLECTIONS.find((c) => c.slug === params.slug);
    return createSeoHead({
      title: col
        ? `${col.title} – Evidence-Backed Shortlist | goCoupon`
        : "Category Buying Guide & Recommendations – goCoupon",
      description: col
        ? col.subtitle
        : "Evidence-backed category rankings and buying guides powered by goCoupon.",
      path: `/collections/${params.slug}`,
    });
  },
});

function CollectionDetailsPage() {
  const { slug } = Route.useParams();
  const collection = CURATED_COLLECTIONS.find((c) => c.slug === slug) || CURATED_COLLECTIONS[0];

  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Collections", path: "/collections" },
    { name: collection.title, path: `/collections/${collection.slug}` },
  ]);

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/collections" className="hover:text-foreground">Collections</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground truncate max-w-xs">{collection.category}</span>
        </div>

        {/* Collection Header */}
        <div className="border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-primary uppercase tracking-wider mb-2">
            <Award className="h-4 w-4" />
            Curated Shortlist • {collection.budgetCapLabel}
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {collection.title}
          </h1>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            {collection.subtitle}
          </p>

          {/* Methodology Banner */}
          <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground">
            <span className="font-mono font-bold text-primary block mb-1">
              SCORING METHODOLOGY ({collection.rubricVersion}):
            </span>
            <p className="leading-relaxed">{collection.methodologySummary}</p>
          </div>
        </div>

        {/* Ranked Products List */}
        <div className="mt-12 space-y-12">
          {collection.items.map((item) => {
            const itemEvidence = CANONICAL_EVIDENCE.filter((e) => e.productId === item.productId);

            return (
              <div
                key={item.id}
                className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-md"
              >
                {/* Header Rank Badge */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-display text-xl font-bold">
                      #{item.rank}
                    </div>
                    <div>
                      <span className="font-mono text-xs text-muted-foreground uppercase">
                        Rank #{item.rank} Overall
                      </span>
                      <h2 className="font-display text-2xl font-bold text-foreground">
                        <Link to="/product/$productId" params={{ productId: item.productId }}>
                          {item.product.title}
                        </Link>
                      </h2>
                    </div>
                  </div>

                  <Link
                    to="/product/$productId"
                    params={{ productId: item.productId }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:scale-105 transition-transform"
                  >
                    <span>View Price History &amp; Deals</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* Rubric Breakdown Component */}
                <div className="mt-6">
                  <FlashVerdictBadge
                    recommendation={item}
                    evidence={itemEvidence}
                    score={item.overallScore}
                    productTitle={item.product.title}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SiteShell>
  );
}
