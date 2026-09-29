/**
 * @file src/routes/category/$slug.lazy.tsx
 * @description Rich Dedicated Category Page Component with Sequential Headings, AEO Direct Answers,
 * Brand Cards, Stacking Guides, FAQs, and Contextual Links.
 */

import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, faqSchema } from "@/lib/seo";
import { CATEGORIES_TAXONOMY } from "@/data/categoriesData";
import {
  Tag,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  CreditCard,
  BookOpen,
  CheckCircle2,
  Clock,
} from "lucide-react";

export const Route = createLazyFileRoute("/category/$slug")({
  component: CategorySlugPage,
});

function CategorySlugPage() {
  const { slug } = Route.useParams();
  const category =
    CATEGORIES_TAXONOMY.find((c) => c.slug === slug) || CATEGORIES_TAXONOMY[0];

  const breadcrumbs = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Categories", path: "/categories" },
    { name: category.name, path: `/category/${category.slug}` },
  ]);

  const faqsSchemaData = faqSchema(
    category.faqs.map((f) => ({ question: f.question, answer: f.answer }))
  );

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
          <Link to="/categories" className="hover:text-foreground">
            Categories
          </Link>
          <ChevronRight className="h-3.5 w-3.5 opacity-60" />
          <span className="font-semibold text-foreground">{category.name}</span>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="border-b border-border px-6 pb-12 pt-12 sm:pt-16">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 font-mono text-xs uppercase tracking-wider text-primary">
            <Tag className="h-3.5 w-3.5" />
            <span>Category Hub • {category.avgSavings}</span>
          </div>

          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
            {category.h1}
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-base text-muted-foreground sm:text-lg leading-relaxed">
            {category.lead}
          </p>

          {/* Quick Metrics Bar */}
          <div className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-border bg-card/80 p-4 text-xs font-medium text-muted-foreground backdrop-blur-xs max-w-2xl">
            <div className="flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-primary" />
              <span>Top Discount: <strong className="text-foreground">{category.topDiscount}</strong></span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-emerald-500" />
              <span>Average Latency: <strong className="text-foreground">&lt; 850ms</strong></span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Tested: <strong className="text-foreground">Today</strong></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* AEO / GEO Direct Answer Box */}
        <section
          aria-labelledby="direct-answer-heading"
          className="mb-12 rounded-3xl border border-primary/30 bg-primary/5 p-6 sm:p-8 backdrop-blur-md"
        >
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary mb-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Direct Savings Summary &amp; AI Answer</span>
          </div>
          <h2 id="direct-answer-heading" className="font-display text-xl font-bold text-foreground sm:text-2xl mb-3">
            How to Get the Maximum Discount on {category.name}
          </h2>
          <p className="text-base text-foreground/90 leading-relaxed font-sans">
            {category.directAnswer}
          </p>
        </section>

        {/* Primary Stores Grid */}
        <section aria-labelledby="stores-heading" className="mb-16">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 id="stores-heading" className="font-display text-2xl font-bold text-foreground">
                Verified Stores &amp; Brands in {category.shortName}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Active coupons tested sequentially on live shopping carts.
              </p>
            </div>
            <Link
              to="/stores"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-primary hover:underline"
            >
              <span>View All 200+ Stores</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {category.primaryStores.map((store) => (
              <div
                key={store.name}
                className="group relative rounded-3xl border border-border bg-card p-6 shadow-xs transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {store.name}
                    </h3>
                    <span className="text-xs font-mono text-muted-foreground">{store.domain}</span>
                  </div>
                  <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-mono font-semibold text-emerald-500">
                    {store.healthScore}% Health
                  </div>
                </div>

                <div className="mb-4 rounded-xl border border-border/60 bg-muted/30 p-3 text-xs">
                  <div className="flex justify-between items-center text-muted-foreground mb-1">
                    <span>Popular Verified Code:</span>
                    <span className="font-mono font-bold text-foreground">{store.popularCode}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Active Tested Codes:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {store.activeCodes} Live
                    </span>
                  </div>
                </div>

                {store.slug ? (
                  <Link
                    to={store.slug.startsWith("/") ? store.slug : `/${store.slug}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 py-2.5 text-xs font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                  >
                    <span>View {store.name} Coupons</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <a
                    href={`https://${store.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-xs font-semibold text-foreground transition-colors hover:border-primary"
                  >
                    <span>Visit Official Store</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Bank & Payment Stacking Offers */}
        <section aria-labelledby="bank-offers-heading" className="mb-16">
          <div className="rounded-3xl border border-border bg-card p-8">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary mb-2">
              <CreditCard className="h-4 w-4" />
              <span>Stackable Bank &amp; Card Discounts</span>
            </div>
            <h2 id="bank-offers-heading" className="font-display text-2xl font-bold text-foreground mb-3">
              Payment Offers That Stack With {category.shortName} Coupons
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
              Unlike competitor coupon sites that hide terms, GoCoupon monitors bank portal agreements so you can apply store vouchers and card cashbacks on the same transaction.
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.bankOffers.map((offer) => (
                <div
                  key={offer.bank}
                  className="rounded-2xl border border-border/70 bg-background p-5 shadow-2xs"
                >
                  <div className="font-display font-bold text-sm text-foreground mb-1">
                    {offer.bank}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    {offer.offer}
                  </p>
                  <div className="inline-block rounded-lg bg-primary/10 px-2.5 py-1 font-mono text-[11px] font-bold text-primary">
                    {offer.code}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Expert Shopping Strategies */}
        <section aria-labelledby="saving-tips-heading" className="mb-16">
          <h2 id="saving-tips-heading" className="font-display text-2xl font-bold text-foreground mb-6">
            Expert Saving Strategies for {category.name}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {category.savingTips.map((tip, idx) => (
              <div
                key={tip.title}
                className="rounded-3xl border border-border bg-card p-6 shadow-xs"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 font-mono text-sm font-bold text-primary mb-4">
                  0{idx + 1}
                </div>
                <h3 className="font-display text-base font-bold text-foreground mb-2">
                  {tip.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {tip.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Guides (Internal Linking Graph) */}
        {category.relatedGuides.length > 0 && (
          <section aria-labelledby="guides-heading" className="mb-16">
            <div className="rounded-3xl border border-border bg-muted/20 p-8">
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary mb-2">
                <BookOpen className="h-4 w-4" />
                <span>Editorial Shopping Research</span>
              </div>
              <h2 id="guides-heading" className="font-display text-2xl font-bold text-foreground mb-4">
                Recommended Buying Guides &amp; Savings Studies
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {category.relatedGuides.map((guide) => (
                  <Link
                    key={guide.slug}
                    to={guide.slug.startsWith("best-") ? `/collections/${guide.slug}` : `/blog/${guide.slug}`}
                    className="group rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-xs"
                  >
                    <h3 className="font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {guide.title}
                    </h3>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{guide.readTime}</span>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Structured FAQs */}
        <section aria-labelledby="faqs-heading" className="mb-16">
          <h2 id="faqs-heading" className="font-display text-2xl font-bold text-foreground mb-6">
            Frequently Asked Questions About {category.name} Coupons
          </h2>
          <div className="space-y-4">
            {category.faqs.map((faq) => (
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

        {/* Category Cross-Navigation Hub */}
        <section aria-labelledby="cross-nav-heading" className="border-t border-border pt-12 text-center">
          <h2 id="cross-nav-heading" className="font-display text-xl font-bold text-foreground mb-4">
            Browse Other Verified Shopping Categories
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {CATEGORIES_TAXONOMY.filter((c) => c.slug !== category.slug).map((c) => (
              <Link
                key={c.slug}
                to={`/category/${c.slug}`}
                className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:border-primary/50 transition-colors shadow-2xs"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
