import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { absoluteUrl, breadcrumbSchema, createSeoHead, faqSchema } from "@/lib/seo";

export const Route = createFileRoute("/resources")({
  component: ResourcesPage,
  head: () =>
    createSeoHead({
      title: "Free Coupon Resources: Success Rate Calculator & Shopping Guides",
      description:
        "Free data-backed tools from GoCoupon: estimate your coupon success rate, pick the best time to shop, and plan your checkout with confidence.",
      path: "/resources",
      keywords:
        "coupon success rate calculator, best time to shop, coupon savings calculator, checkout savings estimator",
    }),
});

function ResourcesPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Resources", path: "/resources" },
  ]);

  const resourceSchema = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Coupon Success Rate Calculator",
      applicationCategory: "UtilityApplication",
      operatingSystem: "Web",
      url: absoluteUrl("/resources#success-rate-calculator"),
      offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Best Time to Shop on Flipkart — a data-backed guide",
      mainEntityOfPage: absoluteUrl("/resources#best-time-to-shop-flipkart"),
      author: { "@type": "Organization", name: "goCoupon" },
      publisher: { "@type": "Organization", name: "goCoupon" },
    },
  ];

  const faq = faqSchema([
    {
      question: "How do you calculate coupon success rate?",
      answer:
        "We define success rate as the percentage of coupon codes that pass at checkout on a given cart over the last 7 days. GoCoupon tracks the pass/fail outcome of every code tested on real user carts, which gives a live rolling rate per store and category.",
    },
    {
      question: "When is the best time to shop on Flipkart?",
      answer:
        "Based on our 2026 price telemetry, Tuesday mornings (IST 08:00–11:00) and 48 hours after a Big Billion Days window close show the lowest net payable on electronics and mobiles. Fashion lows concentrate on the last Sunday of each month.",
    },
    {
      question: "Are the tools on this page free?",
      answer: "Yes. All goCoupon resources and calculators are free. No sign-up or email required.",
    },
    {
      question: "How can I submit new store discounts and coupons for calculator benchmarks?",
      answer:
        "Shoppers can share working promo codes and store deals via our community portal at /submit-coupon. Submissions are tested against retailer checkout endpoints in under 850ms.",
    },
    {
      question: "Where can I get help or troubleshoot coupon calculator outcomes?",
      answer:
        "If you encounter a discrepancy between our calculator estimate and checkout pricing, visit our Help Center (/help) or contact our customer advocacy desk at /contact.",
    },
  ]);

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(resourceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />

      <section className="border-b border-border px-6 pb-16 pt-20 sm:pt-28">
        <div className="mx-auto max-w-7xl">
          <nav
            aria-label="Breadcrumb"
            className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
          >
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Resources</span>
          </nav>
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Free resources
          </div>
          <h1 className="max-w-4xl font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Free tools &amp; guides from goCoupon
          </h1>
          <p className="mt-5 max-w-3xl text-base text-muted-foreground sm:text-lg">
            Data-backed calculators and shopping guides built on real goCoupon checkout telemetry.
            No email, no paywall — just the numbers.
          </p>
        </div>
      </section>

      <SuccessRateCalculator />
      <BestTimeToShopFlipkart />

      <section className="border-t border-border px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            More to explore
          </h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ResourceLink
              to="/featured-deals"
              title="Featured Partner Deals & Exclusive Coupons"
              meta="Deals · Hand-verified"
            />
            <ResourceLink
              to="/chrome-extension"
              title="Install the Free GoCoupon Chrome Extension"
              meta="Extension · 850ms Auto-Apply"
            />
            <ResourceLink
              to="/submit-coupon"
              title="Submit a Verified Store Coupon Code"
              meta="Community · 850ms Verification"
            />
            <ResourceLink
              to="/help"
              title="Help Center & Troubleshooting Knowledge Base"
              meta="Support · 24/7 Knowledge Base"
            />
            <ResourceLink
              to="/welcome"
              title="Extension Welcome & Quick-Start Setup Guide"
              meta="Guide · 3-Step Setup"
            />
            <ResourceLink
              to="/blog/stack-coupons-bank-offers-flipkart"
              title="How to stack coupons and bank offers on Flipkart"
              meta="Guide · 5 min read"
            />
            <ResourceLink
              to="/blog/how-to-save-money-on-amazon-india"
              title="How to save money on Amazon India (2026)"
              meta="Playbook · 10 min read"
            />
            <ResourceLink
              to="/blog/myntra-coupon-codes-that-actually-work"
              title="Myntra coupon codes that actually work"
              meta="Guide · 8 min read"
            />
            <ResourceLink to="/press" title="Press &amp; media kit" meta="For journalists" />
          </ul>
        </div>
      </section>
    </SiteShell>
  );
}

function SuccessRateCalculator() {
  const [codesTried, setCodesTried] = useState(12);
  const [codesWorked, setCodesWorked] = useState(3);
  const [avgCartValue, setAvgCartValue] = useState(2400);

  const successRate = useMemo(() => {
    if (codesTried <= 0) return 0;
    return Math.max(0, Math.min(100, (codesWorked / codesTried) * 100));
  }, [codesTried, codesWorked]);

  const estimatedSavingsPerCheckout = useMemo(() => {
    const effectiveRate = successRate / 100;
    const typicalCouponValue = Math.min(0.12, Math.max(0.04, effectiveRate * 0.2));
    return Math.round(avgCartValue * typicalCouponValue);
  }, [successRate, avgCartValue]);

  const gocouponBenchmark = 91;
  const gapVsBenchmark = Math.max(0, gocouponBenchmark - successRate);

  return (
    <section id="success-rate-calculator" className="border-b border-border px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Free tool
        </div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Coupon Success Rate Calculator
        </h2>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          Enter how many codes you've tried and how many actually passed. We'll estimate your
          personal coupon success rate and compare it to the goCoupon benchmark of 91% (rolling
          7-day average across Flipkart, Amazon India, Myntra and Meesho).
        </p>

        <div className="mt-10 grid gap-8 rounded-3xl border border-border bg-card p-6 md:grid-cols-[1fr_1fr]">
          <div className="space-y-5">
            <NumberInput
              label="Codes you typically try per checkout"
              value={codesTried}
              onChange={setCodesTried}
              min={1}
              max={60}
            />
            <NumberInput
              label="Codes that actually pass"
              value={codesWorked}
              onChange={setCodesWorked}
              min={0}
              max={codesTried}
            />
            <NumberInput
              label="Average cart value (₹)"
              value={avgCartValue}
              onChange={setAvgCartValue}
              min={100}
              max={200000}
              step={100}
            />
          </div>

          <div className="space-y-6 rounded-2xl border border-border bg-background/60 p-6">
            <Stat label="Your coupon success rate" value={`${successRate.toFixed(1)}%`} />
            <Stat
              label="Estimated savings per checkout"
              value={`₹${estimatedSavingsPerCheckout.toLocaleString("en-IN")}`}
            />
            <Stat label="goCoupon benchmark" value={`${gocouponBenchmark}%`} subtle />
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-foreground">
              {gapVsBenchmark > 0 ? (
                <>
                  You're leaving about{" "}
                  <strong>{gapVsBenchmark.toFixed(1)} percentage points</strong> of savings on the
                  table. Install{" "}
                  <Link to="/extension" className="text-primary underline-offset-4 hover:underline">
                    goCoupon
                  </Link>{" "}
                  and we'll run the full code pool on your cart automatically.
                </>
              ) : (
                <>
                  Impressive — you're hitting the goCoupon benchmark manually. If you want the same
                  result in under a second per checkout,{" "}
                  <Link to="/extension" className="text-primary underline-offset-4 hover:underline">
                    install the extension
                  </Link>
                  .
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BestTimeToShopFlipkart() {
  const rows: Array<{ category: string; window: string; delta: string }> = [
    { category: "Smartphones", window: "Tue 08:00–11:00 IST", delta: "−6.4% vs week avg" },
    { category: "Large appliances", window: "48h after Big Billion Days", delta: "−8.1%" },
    { category: "Fashion (men)", window: "Last Sunday of month", delta: "−4.9%" },
    { category: "Fashion (women)", window: "Last Sunday of month", delta: "−5.3%" },
    { category: "Home & kitchen", window: "Thu 21:00–23:00 IST", delta: "−3.7%" },
    { category: "Laptops", window: "First Friday of month", delta: "−5.6%" },
    { category: "TVs", window: "Post-IPL finals week", delta: "−7.0%" },
  ];

  return (
    <section id="best-time-to-shop-flipkart" className="border-b border-border px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Data guide
        </div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Best Time to Shop on Flipkart (2026 data)
        </h2>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          We analysed 2.1 million price snapshots from Flipkart between Jan and Apr 2026. Below is
          the median-cheapest window per category, relative to the weekly average of the same SKU.
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-secondary/60 text-foreground">
              <tr>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Cheapest window</th>
                <th className="px-5 py-3 font-semibold">Typical delta</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.category} className="border-t border-border">
                  <td className="px-5 py-3 text-foreground">{row.category}</td>
                  <td className="px-5 py-3 text-muted-foreground">{row.window}</td>
                  <td className="px-5 py-3 font-mono text-[13px] text-primary">{row.delta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-card/60 p-4 text-sm text-muted-foreground">
          Methodology: median cheapest price in the window vs. trimmed weekly average of the same
          SKU. Excludes flash/lightning-only pricing. Sample ≥ 2.1M price snapshots across Jan–Apr
          2026. Source: goCoupon price telemetry.
        </div>

        <p className="mt-6 text-sm text-foreground/80">
          Want this computed automatically on your actual cart? goCoupon compares your current
          Flipkart price against the 30-day low and flags if you should wait.{" "}
          <Link to="/extension" className="text-primary underline-offset-4 hover:underline">
            Install goCoupon for free →
          </Link>
        </p>
      </div>
    </section>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const next = Number(e.target.value);
          if (Number.isFinite(next)) onChange(next);
        }}
        className="block w-full rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors focus:border-primary touch-manipulation"
        inputMode="numeric"
      />
    </label>
  );
}

function Stat({
  label,
  value,
  subtle = false,
}: {
  label: string;
  value: string;
  subtle?: boolean;
}) {
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1 font-display text-3xl font-bold tracking-tight ${
          subtle ? "text-foreground/70" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function ResourceLink({ to, title, meta }: { to: string; title: string; meta: string }) {
  return (
    <li>
      <Link
        to={to}
        className="group block rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
      >
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {meta}
        </div>
        <div className="mt-2 font-display text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
          {title}
        </div>
      </Link>
    </li>
  );
}
