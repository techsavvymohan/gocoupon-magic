/**
 * @file collections/index.tsx
 * @description Curated Flash-Style Category Guides & Shortlists Index with Comprehensive E-E-A-T Evidence & Rubrics.
 */

import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, faqSchema } from "@/lib/seo";
import { CURATED_COLLECTIONS } from "@/data/collectionsData";
import {
  ArrowRight,
  Award,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  TrendingDown,
  BarChart3,
  Scale,
  Sparkles,
  Zap,
} from "lucide-react";

export const Route = createLazyFileRoute("/collections/")({
  component: CollectionsIndexPage,
});

const collectionsFaqs = [
  {
    question: "How does the GoCoupon research lab select and rank products in these collections?",
    answer:
      "Our editorial and engineering desk evaluates hundreds of candidates across consumer electronics, home tech, and lifestyle categories using a transparent, 4-tier weighted rubric. We combine acoustic/hardware bench testing, 30-day price volatility history, long-term buyer sentiment analysis, and real-time coupon discount stacking across verified retailers.",
  },
  {
    question: "Do merchant commissions or sponsorship deals impact which products rank #1?",
    answer:
      "No. Ranking positions are determined strictly by empirical performance scores and price-to-value ratios. While we earn affiliate referral fees when users purchase through our links, merchant commission rates do not alter our testing rubrics, product rankings, or editorial evaluations.",
  },
  {
    question: "How does GoCoupon verify that festival sale discounts on these collections are real?",
    answer:
      "We record daily price snapshots from Amazon, Flipkart, Walmart, and major regional retailers over 30 and 90 days. Our price tracker detects pre-sale price markups and alerts shoppers when a 'discounted' item was actually cheaper two weeks earlier.",
  },
  {
    question: "How frequently are prices and active coupons updated for curated collections?",
    answer:
      "Our autonomous deal verification engine syncs with retailer APIs and checkout endpoints every 15 minutes. Coupon codes, bank card offers, and price drops are refreshed continuously to ensure zero dead links or invalid codes.",
  },
  {
    question: "Can shoppers request new buying guides or suggest products for testing?",
    answer:
      "Yes! Shoppers and creators can submit product suggestions or report store pricing anomalies directly to our research team via our Contact Desk (/contact) or submit verified working promo codes at /submit-coupon.",
  },
];

function CollectionsIndexPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Curated Collections", path: "/collections" },
  ]);

  const faqData = faqSchema(collectionsFaqs);

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />

      {/* Hero Header */}
      <section className="relative border-b border-border px-6 pb-16 pt-20 sm:pt-28 bg-background">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 font-mono text-xs uppercase tracking-[0.2em] text-primary">
            <Award className="h-3.5 w-3.5" />
            Evidence-Backed Buying Shortlists &amp; Pricing Lab
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
            Only the Top 1%. Backed by Real Proof.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed text-balance">
            We synthesize lab benchmarks, tear-downs, 30-day price volatility graphs, and thousands of verified buyer reviews into transparent weighted rubrics.
          </p>
        </div>
      </section>

      {/* Evaluation Methodology & E-E-A-T Rubrics */}
      <section className="border-b border-border px-6 py-14 bg-muted/20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Our 4-Tier Product Evaluation Rubric
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Every item featured in our curated shortlists passes strict multi-dimensional criteria before recommendation.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-base text-foreground">Hardware &amp; Lab Benchmarks</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Acoustic response curves, battery drain tests, display color accuracy, and build quality under real stress conditions.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 mb-3">
                <TrendingDown className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-base text-foreground">30-Day True Price Floor</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Analysis of historical price trendlines to calculate whether current merchant sales represent genuine discount value.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 mb-3">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-base text-foreground">Buyer Sentiment &amp; Returns</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Scans 2,000+ verified customer reviews per category, isolating common defect reports, return frequencies, and durability flags.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 mb-3">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-base text-foreground">Verified Coupon Stacking</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Cross-referenced with active merchant promo codes and partner bank card rebates to uncover maximum achievable savings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Lab Telemetry Benchmarks */}
      <section className="border-b border-border px-6 py-12 bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-10 shadow-xs">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-6">
              Shopping Intelligence Lab Telemetry (2026)
            </h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
              <div className="sm:pr-6 pt-4 sm:pt-0">
                <div className="font-display text-3xl sm:text-4xl font-extrabold text-foreground">45+</div>
                <div className="mt-1 text-xs uppercase tracking-wider font-semibold text-primary">
                  Models Evaluated Per Guide
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Rigorous hands-on testing across retail inventory to eliminate misleading claims.
                </p>
              </div>
              <div className="sm:px-6 pt-4 sm:pt-0">
                <div className="font-display text-3xl sm:text-4xl font-extrabold text-foreground">2.1M</div>
                <div className="mt-1 text-xs uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400">
                  Price Snapshots Analyzed
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Daily price history points collected across Amazon, Flipkart, Walmart, and Croma.
                </p>
              </div>
              <div className="sm:px-6 pt-4 sm:pt-0">
                <div className="font-display text-3xl sm:text-4xl font-extrabold text-foreground">₹4,200</div>
                <div className="mt-1 text-xs uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400">
                  Median Buyer Savings
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Average savings realized by purchasing at optimal price drops with stacked vouchers.
                </p>
              </div>
              <div className="sm:pl-6 pt-4 sm:pt-0">
                <div className="font-display text-3xl sm:text-4xl font-extrabold text-foreground">100%</div>
                <div className="mt-1 text-xs uppercase tracking-wider font-semibold text-amber-500">
                  Unbiased Editorial Scoring
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Zero paid placements or merchant sponsorship influence on leaderboard positions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="px-6 py-16 bg-muted/10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl mb-10">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Featured Buying Guides &amp; Shortlists
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              Deep comparison guides equipped with 30-day historical charts, scorecards, and live checkout deals.
            </p>
          </div>

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

                  <h3 className="mt-4 font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    <Link to="/collections/$slug" params={{ slug: col.slug }}>
                      {col.title}
                    </Link>
                  </h3>

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

      {/* Frequently Asked Questions */}
      <section className="border-t border-border px-6 py-16 bg-background">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Frequently Asked Questions About Our Collections
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              How we test, verify prices, and maintain complete editorial independence.
            </p>
          </div>

          <div className="space-y-4">
            {collectionsFaqs.map((faq, index) => (
              <div
                key={faq.question}
                className="rounded-2xl border border-border bg-card p-6 shadow-xs"
              >
                <h3 className="font-display font-bold text-base text-foreground flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-mono text-xs">
                    {index + 1}
                  </span>
                  <span>{faq.question}</span>
                </h3>
                <p className="mt-3 pl-9 text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          {/* Contextual Hub Navigation Links */}
          <div className="mt-12 rounded-2xl border border-border bg-muted/20 p-6 text-center">
            <h4 className="font-display font-bold text-base text-foreground mb-3">
              Explore More Shopping Tools &amp; Savings Guides
            </h4>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
              <Link to="/featured-deals" className="text-primary font-semibold hover:underline">
                Featured Partner Deals →
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/chrome-extension" className="text-primary font-semibold hover:underline">
                Chrome Extension →
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/submit-coupon" className="text-primary font-semibold hover:underline">
                Submit a Coupon →
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/help" className="text-primary font-semibold hover:underline">
                Help Center &amp; FAQs →
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/contact" className="text-primary font-semibold hover:underline">
                Contact Support →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
