import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import {
  DollarSign,
  Sparkles,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from "lucide-react";

export const Route = createFileRoute("/disclosure")({
  component: DisclosurePage,
  head: () =>
    createSeoHead({
      title: "Affiliate Disclosure & Transparency Promise – GoCoupon",
      description:
        "Learn how GoCoupon stays 100% free, how stores pay us a small bonus when we save you money, and our 100% Fair Savings Guarantee.",
      path: "/disclosure",
      keywords:
        "gocoupon affiliate disclosure, how gocoupon makes money, amazon associate disclaimer, free coupon extension disclosure",
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
      <section className="relative border-b border-border px-6 pb-16 pt-20 sm:pt-28 overflow-hidden text-center">
        <div className="mx-auto max-w-4xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            <HeartHandshake className="h-3.5 w-3.5" />
            <span>100% Open &amp; Honest</span>
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Affiliate Disclosure &amp; Transparency
          </h1>
          <p className="mt-5 text-base text-muted-foreground sm:text-lg leading-relaxed">
            We believe in 100% transparency with our users. Here is how GoCoupon makes money, why our extension
            is completely free for you, and how we guarantee your savings always come first.
          </p>
        </div>
      </section>

      {/* 3 Core Principles */}
      <section className="border-b border-border px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-center">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">Zero Cost to You</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                GoCoupon is 100% free. You will never pay higher prices or hidden fees. Store referral bonuses come from seller marketing budgets.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-center">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">100% Fair Promise</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                We always give you the coupon that saves you the most money, even if we earn zero commission from that specific code.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-center">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-sky-500/10 text-sky-500">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">No Hidden Actions</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                We never hijack your browser or redirect you secretly. Everything we do requires your clear, 1-click consent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl space-y-12 text-foreground/90">
          {/* Section 1 */}
          <article className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-foreground">
              1. How Does GoCoupon Stay Free?
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              When you use GoCoupon to save money on a store like Amazon, Flipkart, or Myntra, the store may pay us a small
              thank-you bonus (referral commission) when you complete your order.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Stores pay this out of their normal customer acquisition budget. The price you pay for products is never marked up — in fact,
              it is significantly lower because GoCoupon auto-clips green vouchers and applies working promo codes!
            </p>
          </article>

          {/* Section 2: Clear User Choice */}
          <article className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-foreground">
              2. Clear &amp; Honest User Choice
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              We follow Google Chrome&apos;s highest policy standards:
            </p>
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-start gap-3">
                <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 font-mono text-xs font-bold text-primary shrink-0">
                  Step 1
                </span>
                <div>
                  <strong className="text-foreground text-sm">Clear Labels Before You Click:</strong>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    We clearly explain bonus features before you click, such as <em>&ldquo;Unlock cash back savings on your order · 100% free to activate&rdquo;</em>.
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-4 flex items-start gap-3">
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-500 shrink-0">
                  Step 2
                </span>
                <div>
                  <strong className="text-foreground text-sm">Instant Confirmation:</strong>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    A confirmation appears stating <em>&ldquo;✨ Cash Back Bonus Activated!&rdquo;</em> so you always know what happened.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Section 3: Amazon Associates */}
          <article className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-foreground">
              3. Amazon Associates Program Notice
            </h2>
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 text-foreground space-y-3">
              <p className="text-sm font-medium leading-relaxed">
                <strong>Mandatory Amazon Disclosure:</strong> GoCoupon is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com, Amazon.in, and affiliated sites.
              </p>
              <p className="text-xs text-muted-foreground">
                &ldquo;As an Amazon Associate, GoCoupon earns from qualifying purchases.&rdquo; Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates.
              </p>
            </div>
          </article>

          {/* Section 4: 100% Fair Algorithm */}
          <article className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-foreground">
              4. Our 100% Fair Savings Guarantee
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Some coupon websites push discount codes that pay them high commissions, even if they save you less money.
            </p>
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 space-y-2">
              <div className="flex items-center gap-2 font-display text-base font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                <span>Our Unbiased Promise</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                GoCoupon ranks coupons strictly by how much money they save you. If Code A saves you $50 (and pays us $0) and Code B saves you $10 (and pays us $5), GoCoupon will apply Code A every single time.
              </p>
            </div>
          </article>

          {/* Section 5: Contact */}
          <article className="space-y-4 border-t border-border pt-8">
            <h2 className="font-display text-2xl font-bold text-foreground">
              5. Questions Regarding Our Disclosures?
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              If you have any questions about how GoCoupon operates, please reach out to us at{" "}
              <a href="mailto:support@gocoupon.io" className="text-primary font-medium hover:underline">
                support@gocoupon.io
              </a>{" "}
              or visit our{" "}
              <Link to="/contact" className="text-primary font-medium hover:underline">
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
