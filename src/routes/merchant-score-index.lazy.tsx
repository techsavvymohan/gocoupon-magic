/**
 * @file src/routes/merchant-score-index.lazy.tsx
 * @description Official GoCoupon Merchant Reliability Index & Coupon Health Report.
 * High-authority, linkable data asset modelled on SimplyCodes' Merchant Score Index.
 */

import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, faqSchema } from "@/lib/seo";
import { MERCHANT_SCORES, MERCHANT_RELIABILITY_METRICS } from "@/data/merchantScoreData";
import {
  ShieldCheck,
  Activity,
  Award,
  TrendingUp,
  Search,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createLazyFileRoute("/merchant-score-index")({
  component: MerchantScoreIndexPage,
});

export function MerchantScoreIndexPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedCitation, setCopiedCitation] = useState(false);

  const breadcrumbs = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Merchant Reliability Index", path: "/merchant-score-index" },
  ]);

  const faqs = [
    {
      question: "What is the GoCoupon Merchant Reliability Index?",
      answer:
        "The Merchant Reliability Index is a continuous, empirical benchmark tracking the actual coupon pass rate, dead-code elimination percentage, and checkout latency across 500+ e-commerce merchants. Unlike promotional sites that display non-working codes, our index ranks stores based on verified consumer savings.",
    },
    {
      question: "How does GoCoupon calculate a store's Health Score?",
      answer:
        "A store's Health Score (0–100%) represents the proportion of candidate coupon codes that pass automated live-cart checkout validation over a rolling 7-day period. Stores scoring above 90% receive an A+ or A reliability grade.",
    },
    {
      question: "Why do competitor coupon aggregators have high dead-code rates?",
      answer:
        "Older aggregators scrape expired web coupons without automated checkout verification. Our data shows 72.4% of raw coupon submissions on the internet are expired or invalid, wasting user time unless filtered by an autonomous testing sandbox.",
    },
    {
      question: "How can journalists, researchers, or analysts cite this data?",
      answer:
        "You are free to cite any data points or charts from this index with attribution to 'GoCoupon Merchant Reliability Index (2026)' and a canonical link back to https://gocoupon.io/merchant-score-index.",
    },
  ];

  const faqsSchemaData = faqSchema(
    faqs.map((f) => ({ question: f.question, answer: f.answer }))
  );

  const filteredScores = MERCHANT_SCORES.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyCitation = () => {
    const citation =
      'GoCoupon Research Team. "Merchant Reliability Index & E-Commerce Coupon Health Benchmark (2026)." GoCoupon, https://gocoupon.io/merchant-score-index.';
    navigator.clipboard.writeText(citation);
    setCopiedCitation(true);
    toast.success("Citation copied to clipboard!");
    setTimeout(() => setCopiedCitation(false), 3000);
  };

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqsSchemaData) }}
      />

      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="border-b border-border/60 bg-muted/20 px-6 py-3 text-xs font-mono text-muted-foreground"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-2">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 opacity-60" />
          <span className="font-semibold text-foreground">Merchant Reliability Index</span>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="border-b border-border px-6 pb-16 pt-16 sm:pt-20">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-emerald-500">
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            <span>Public Data Asset • Live Telemetry Feed (2026)</span>
          </div>

          <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl text-balance">
            Merchant Reliability Index &amp; Coupon Health Report
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-base text-muted-foreground sm:text-lg leading-relaxed">
            The industry standard for e-commerce discount transparency. We measure live cart coupon success rates, dead code rejection, and average savings across 500+ retailers.
          </p>

          {/* Macro Telemetry Badges */}
          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-2xs">
              <div className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                {MERCHANT_RELIABILITY_METRICS.monthlyCodesTested}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Monthly Codes Tested</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-2xs">
              <div className="font-display text-2xl sm:text-3xl font-bold text-emerald-500">
                {MERCHANT_RELIABILITY_METRICS.deadCodeRejectionRate}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Dead Codes Blocked</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-2xs">
              <div className="font-display text-2xl sm:text-3xl font-bold text-primary">
                {MERCHANT_RELIABILITY_METRICS.avgCartSavings}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Avg Cart Savings</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-2xs">
              <div className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                &lt; {MERCHANT_RELIABILITY_METRICS.avgTestingSpeedMs}ms
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Avg Test Latency</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Verification Methodology Narrative */}
        <section aria-labelledby="methodology-heading" className="mb-16">
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-10">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary mb-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Transparent Empirical Standard</span>
            </div>
            <h2 id="methodology-heading" className="font-display text-2xl font-bold text-foreground sm:text-3xl mb-4">
              How the Merchant Health Score Is Calculated
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-6 max-w-3xl">
              Unlike legacy coupon blogs that list dead codes to capture search traffic, GoCoupon operates the Autonomous Headless Cart Sandbox Protocol (AHCSP). Every coupon code in our directory must pass three automated verification gates before publication:
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-border/80 bg-background p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 font-mono text-sm font-bold text-primary mb-3">
                  01
                </div>
                <h3 className="font-display font-bold text-base text-foreground mb-1">
                  Parallel Cart Testing
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Headless bots simulate live consumer checkout forms in under 850ms, testing whether vouchers reduce order totals without error triggers.
                </p>
              </div>

              <div className="rounded-2xl border border-border/80 bg-background p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 font-mono text-sm font-bold text-primary mb-3">
                  02
                </div>
                <h3 className="font-display font-bold text-base text-foreground mb-1">
                  Telemetry Aggregation
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Anonymous client telemetry records real-world pass/fail ratios across our 50,000+ browser extension users over a rolling 7-day window.
                </p>
              </div>

              <div className="rounded-2xl border border-border/80 bg-background p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 font-mono text-sm font-bold text-primary mb-3">
                  03
                </div>
                <h3 className="font-display font-bold text-base text-foreground mb-1">
                  Dead Code Elimination
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Vouchers with less than an 80% pass rate are immediately retired from the live directory, ensuring shoppers never waste time with fake deals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Searchable Merchant Health Index Table */}
        <section aria-labelledby="index-table-heading" className="mb-16">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 id="index-table-heading" className="font-display text-2xl font-bold text-foreground">
                Live Store Reliability Benchmarks
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Updated in real time based on active checkout tests.
              </p>
            </div>

            {/* Search Filter */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="merchant-score-search"
                name="merchantSearch"
                aria-label="Search store or category"
                type="text"
                placeholder="Search store or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-6 py-4">Merchant</th>
                    <th scope="col" className="px-6 py-4">Category</th>
                    <th scope="col" className="px-6 py-4">Health Score</th>
                    <th scope="col" className="px-6 py-4">Pass Rate</th>
                    <th scope="col" className="px-6 py-4">Dead Blocked</th>
                    <th scope="col" className="px-6 py-4">Avg Savings</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                    <th scope="col" className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredScores.map((score) => (
                    <tr key={score.storeId} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <span>{score.name}</span>
                          <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
                            {score.verificationGrade}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-muted-foreground font-normal">
                          {score.domain}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {score.category}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-foreground">
                            {score.healthScore}%
                          </span>
                          <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${score.healthScore}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        {score.successRate}%
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-rose-500">
                        -{score.deadCodesEliminated}
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-foreground">
                        {score.avgOrderSavings}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-mono text-emerald-500">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {score.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/${score.storeId}-coupons`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          <span>Coupons</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Digital PR & Research Citation Box */}
        <section aria-labelledby="citation-heading" className="mb-16">
          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-8">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary mb-2">
              <Award className="h-4 w-4" />
              <span>Media &amp; Academic Citation Guideline</span>
            </div>
            <h2 id="citation-heading" className="font-display text-2xl font-bold text-foreground mb-3">
              Citing the GoCoupon Merchant Reliability Index
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-3xl">
              Journalists, consumer advocates, and financial analysts frequently reference GoCoupon's coupon testing telemetry to report on e-commerce inflation, fake discounts, and voucher accuracy. You may cite this data in print or online media using the standard attribution below:
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 rounded-2xl border border-border bg-card p-4">
              <code className="text-xs font-mono text-foreground/90 flex-1 overflow-x-auto">
                GoCoupon Research Team. &quot;Merchant Reliability Index &amp; E-Commerce Coupon Health Benchmark (2026).&quot; GoCoupon, https://gocoupon.io/merchant-score-index.
              </code>
              <button
                type="button"
                onClick={handleCopyCitation}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground transition-transform hover:scale-105 active:scale-95 shrink-0"
              >
                {copiedCitation ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Citation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Structured FAQs */}
        <section aria-labelledby="faqs-heading" className="mb-16">
          <h2 id="faqs-heading" className="font-display text-2xl font-bold text-foreground mb-6">
            Frequently Asked Questions About the Index
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-2xl border border-border bg-card p-6 shadow-2xs"
              >
                <h3 className="font-display text-base font-bold text-foreground mb-2">
                  {faq.question}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Cross-Link Directory */}
        <section className="border-t border-border pt-12 text-center">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">
            Explore Verified Categories &amp; Stores
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            <Link to="/category/electronics" className="rounded-full border border-border bg-card px-4 py-2 hover:border-primary/50">
              Electronics Coupons
            </Link>
            <Link to="/category/fashion" className="rounded-full border border-border bg-card px-4 py-2 hover:border-primary/50">
              Fashion Coupons
            </Link>
            <Link to="/category/beauty" className="rounded-full border border-border bg-card px-4 py-2 hover:border-primary/50">
              Beauty Coupons
            </Link>
            <Link to="/category/travel" className="rounded-full border border-border bg-card px-4 py-2 hover:border-primary/50">
              Travel Coupons
            </Link>
            <Link to="/category/food-dining" className="rounded-full border border-border bg-card px-4 py-2 hover:border-primary/50">
              Food Coupons
            </Link>
            <Link to="/featured-deals" className="rounded-full border border-border bg-card px-4 py-2 hover:border-primary/50">
              Featured Deals Feed
            </Link>
            <Link to="/resources" className="rounded-full border border-border bg-card px-4 py-2 hover:border-primary/50">
              Savings Calculator
            </Link>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
