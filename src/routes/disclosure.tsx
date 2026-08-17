import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import { Info, CheckCircle2, DollarSign, ShieldAlert, Sparkles, HeartHandshake } from "lucide-react";

export const Route = createFileRoute("/disclosure")({
  component: DisclosurePage,
  head: () =>
    createSeoHead({
      title: "Affiliate Disclosure & Transparency Statement – goCoupon",
      description:
        "Learn how goCoupon works, how we earn affiliate commissions from Amazon, Flipkart, and other stores at zero extra cost to you, and our commitment to unbiased savings.",
      path: "/disclosure",
      keywords:
        "goCoupon affiliate disclosure, amazon associate disclaimer, how gocoupon makes money, affiliate transparency, coupon extension monetization",
    }),
});

function DisclosurePage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Affiliate Disclosure", path: "/disclosure" },
  ]);

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* Hero Section */}
      <section className="relative border-b border-border px-6 pb-16 pt-20 sm:pt-28">
        <div className="mx-auto max-w-4xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            <HeartHandshake className="h-3.5 w-3.5" />
            100% Transparency
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Affiliate Disclosure
          </h1>
          <p className="mt-5 text-base text-muted-foreground sm:text-lg">
            At goCoupon, we believe complete transparency builds lasting trust. This page explains exactly
            how goCoupon is funded, how our affiliate relationships work, and why you never pay a single rupee for our service.
          </p>
        </div>
      </section>

      {/* Core Principles */}
      <section className="border-b border-border px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <DollarSign className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">Zero Cost to You</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Using goCoupon is 100% free. You will never pay higher prices or hidden fees by using our extension or website.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">Algorithmic Integrity</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Our code ranking algorithm always selects the coupon that gives you the highest net savings, regardless of commission rates.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">ASCI &amp; FTC Compliant</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                We strictly adhere to guidelines from the Advertising Standards Council of India (ASCI) and global FTC disclosure standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl space-y-12 text-foreground/90">
          <article className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-foreground">
              1. How Does goCoupon Make Money?
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              When you use goCoupon to find and apply a coupon or click on an affiliate link to a merchant site
              (such as Flipkart, Amazon India, Myntra, Meesho, Nykaa, etc.), the merchant may pay us a referral
              commission when you complete a qualifying purchase.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              These commissions are paid directly by the retail merchants out of their marketing budgets as a
              cost of customer acquisition. The price you pay for products is exactly the same (or lower with
              our working coupons and cashback) as it would be if you shopped without goCoupon.
            </p>
          </article>

          <article className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-foreground">
              2. Amazon Associates Program Disclosure
            </h2>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 text-foreground">
              <p className="text-sm font-medium leading-relaxed">
                <strong>Mandatory Amazon Disclosure:</strong> goCoupon is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.in and affiliated sites.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                &ldquo;As an Amazon Associate, goCoupon earns from qualifying purchases.&rdquo; Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates.
              </p>
            </div>
          </article>

          <article className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-foreground">
              3. Other Merchant &amp; Affiliate Network Partnerships
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              In addition to Amazon, goCoupon maintains direct and indirect affiliate arrangements with various
              retailers and affiliate networks operating in India, including:
            </p>
            <ul className="grid gap-2.5 sm:grid-cols-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Flipkart Affiliate Program</span>
              </li>
              <li className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Myntra &amp; AJIO Affiliate Networks</span>
              </li>
              <li className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Impact, CJ, &amp; vCommission Partners</span>
              </li>
              <li className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Direct Brand Partnerships</span>
              </li>
            </ul>
          </article>

          <article className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-foreground">
              4. Our Editorial &amp; Code Selection Guarantee
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Our code selection engine is 100% automated. When you are at checkout, goCoupon runs a test
              cycle across all eligible candidate promo codes. It ranks the results strictly by the net rupee amount
              saved on your cart. We do <strong>not</strong> prioritize coupons that yield higher affiliate payouts
              over coupons that save you more money. Your savings always come first.
            </p>
          </article>

          <article className="space-y-4 border-t border-border pt-8">
            <h2 className="font-display text-2xl font-bold text-foreground">
              5. Questions Regarding Our Disclosures
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              If you have any questions about how our affiliate model operates, or if you represent a merchant
              looking to partner with goCoupon, please contact us at{" "}
              <a href="mailto:partnerships@gocoupon.io" className="text-primary hover:underline">
                partnerships@gocoupon.io
              </a>{" "}
              or visit our{" "}
              <Link to="/contact" className="text-primary hover:underline">
                Contact Page
              </Link>
              .
            </p>
          </article>
        </div>
      </section>
    </SiteShell>
  );
}
