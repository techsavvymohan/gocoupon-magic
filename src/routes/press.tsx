import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { absoluteUrl, breadcrumbSchema, createSeoHead, faqSchema } from "@/lib/seo";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Download,
  Globe,
  HelpCircle,
  Mail,
  Newspaper,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/press")({
  component: PressPage,
  head: () =>
    createSeoHead({
      title: "Press Kit, Brand Assets & Media Desk – GoCoupon",
      description:
        "Official media kit, logos, platform statistics, fast facts and editorial contacts for GoCoupon — the shopping intelligence platform and browser extension.",
      path: "/press",
      keywords:
        "gocoupon press, gocoupon media kit, gocoupon in the news, gocoupon logos, gocoupon brand guidelines, coupon extension press kit",
    }),
});

const pressFaqs = [
  {
    question: "What is GoCoupon's core mission and business model?",
    answer:
      "GoCoupon is an autonomous shopping intelligence platform designed to eliminate deceptive retail pricing and coupon failure. It operates 100% free for consumers, monetizing solely through performance-based affiliate commissions paid by partner merchants when users make successful purchases. GoCoupon never sells personal browsing data or serves paywalled discount tiers.",
  },
  {
    question: "How does GoCoupon differ from legacy aggregators like GrabOn or Honey?",
    answer:
      "Unlike legacy coupon websites that display outdated, affiliate-spam codes with high failure rates (often exceeding 65%), GoCoupon runs parallel algorithmic testing on live checkout carts in under 850 milliseconds. It also integrates 30-day price history trackers to detect artificial pre-sale price markups and stacks bank credit card promotions automatically.",
  },
  {
    question: "What user data does GoCoupon collect or store?",
    answer:
      "GoCoupon enforces a strict Zero-Data-Retention architecture under Google Chrome Manifest V3. The extension operates in a sandboxed local environment. It never inspects passwords, personal messages, credit card numbers, or browsing activity outside supported merchant checkout forms.",
  },
  {
    question: "Can journalists and researchers access aggregate shopping data?",
    answer:
      "Yes. The GoCoupon Data Lab provides anonymized pricing trends, category discount benchmarks, inflation indices, and festival sale historical data to credentialed journalists, researchers, and market analysts. Direct requests should be sent to press@gocoupon.io.",
  },
  {
    question: "Where can editors download official vector logos and high-resolution brand assets?",
    answer:
      "High-resolution vector SVG and lossless WebP logos, brand icon packs, executive photos, and product UI screenshots are available directly in the Brand Assets section of this press kit or by emailing press@gocoupon.io.",
  },
];

function PressPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Press & Media", path: "/press" },
  ]);

  const newsArticleSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "GoCoupon in the News & Media Kit",
    url: absoluteUrl("/press"),
    about: {
      "@type": "Organization",
      name: "GoCoupon",
      url: absoluteUrl("/"),
    },
  };

  const faqData = faqSchema(pressFaqs);

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />

      {/* Hero Header */}
      <section className="border-b border-border px-6 pb-16 pt-20 sm:pt-28 bg-background">
        <div className="mx-auto max-w-7xl">
          <nav
            aria-label="Breadcrumb"
            className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
          >
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Press</span>
          </nav>

          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            <Newspaper className="h-3.5 w-3.5" />
            Media &amp; Public Relations Desk
          </div>
          <h1 className="max-w-4xl font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Press Kit &amp; Media Resources
          </h1>
          <p className="mt-5 max-w-3xl text-base text-muted-foreground sm:text-lg leading-relaxed">
            Everything journalists, analysts, and content creators need to cover GoCoupon accurately — verified platform statistics, brand assets, technical architecture summaries, and editorial interview contacts.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="mailto:press@gocoupon.io"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:scale-105"
            >
              <Mail className="h-4 w-4" />
              <span>Contact Press Desk (press@gocoupon.io)</span>
            </a>
            <a
              href="/gc-logo.webp"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              download
            >
              <Download className="h-4 w-4" />
              <span>Download Official Brand Pack</span>
            </a>
          </div>
        </div>
      </section>

      {/* Key Takeaways for Media */}
      <section className="border-b border-border px-6 py-16 bg-muted/20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Key Editorial Takeaways
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              Essential background points summarizing GoCoupon’s market positioning and consumer value.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-base text-foreground">Autonomous Coupon Testing</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Applies the mathematically optimal discount combination in under 850 milliseconds at checkout without manual code hunting.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 mb-3">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-base text-foreground">Fake Sale Detection</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                30-day and 90-day price history graphs expose artificial pre-festival price hikes across Amazon, Flipkart, Walmart, and Target.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 mb-3">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-base text-foreground">Zero-Data Monetization</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Built strictly on Google Chrome Manifest V3. No browsing history sale, no invasive trackers, and no mandatory account sign-up.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 mb-3">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-base text-foreground">Multi-Currency &amp; Global Reach</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Supports shoppers across 8 global currencies and 200+ top retail merchants including Myntra, Swiggy, Booking.com, and Nykaa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fast Facts & Platform Statistics */}
      <section className="border-b border-border px-6 py-16 bg-background">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Company Fast Facts &amp; Telemetry
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl">
            Verified platform metrics from the GoCoupon Shopping Intelligence Lab (Q1 2026).
          </p>
          <dl className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Fact label="Founded" value="2024 (Bangalore, India · Global Operations)" />
            <Fact label="Category" value="Shopping Intelligence & Price Comparison" />
            <Fact label="Extension Architecture" value="Google Chrome Manifest V3 (Zero Remote Code)" />
            <Fact label="Supported Stores" value="500+ Verified Global & Indian Retailers" />
            <Fact label="Active Users" value="180,000+ Active Shoppers" />
            <Fact label="Coupon Success Rate" value="89.2% Verified Cart Application" />
            <Fact label="Monthly Codes Verified" value="18,400+ Parallel Checked Promos" />
            <Fact label="Average Savings Per Checkout" value="₹1,240 ($18.50) Per Order" />
            <Fact label="Pricing Model" value="100% Free Forever (Performance Affiliate Model)" />
          </dl>
        </div>
      </section>

      {/* How GoCoupon Works: Technical Architecture for Journalists */}
      <section className="border-b border-border px-6 py-16 bg-muted/10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl mb-10">
            <h2 className="font-display text-3xl font-bold text-foreground">
              How GoCoupon Works: Technical Architecture
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              A brief technical summary explaining how GoCoupon replaces manual coupon hunting with real-time checkout automation.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6">
              <span className="font-mono text-xs font-bold text-primary">STEP 1</span>
              <h3 className="font-display font-bold text-lg text-foreground mt-2">Local Cart Detection</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                When a user reaches a supported merchant checkout, the extension detects the coupon input form locally in the browser DOM without sending cart contents to third parties.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <span className="font-mono text-xs font-bold text-primary">STEP 2</span>
              <h3 className="font-display font-bold text-lg text-foreground mt-2">Parallel Micro-Testing</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                GoCoupon queries our high-speed verified coupon database and tests candidates in parallel directly against the merchant checkout endpoint in ~850ms.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <span className="font-mono text-xs font-bold text-primary">STEP 3</span>
              <h3 className="font-display font-bold text-lg text-foreground mt-2">Discount Maximization</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                The single code or bank card discount combination that results in the lowest final payable amount is applied, automatically securing the maximum savings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quotes for Attribution */}
      <section className="border-b border-border px-6 py-16 bg-background">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Quotes for Editorial Attribution
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Quote>
              GoCoupon’s mission is to make online sticker prices honest. By testing candidate promo codes and tracking 30-day historical prices, we ensure consumers never overpay or fall victim to artificial pre-sale markups.
            </Quote>
            <Quote>
              Legacy coupon websites made money by wasting consumer time with non-working voucher codes. GoCoupon reverses that dynamic by applying verified discounts in under a second with total transparency.
            </Quote>
          </div>
          <p className="mt-4 text-xs font-mono text-muted-foreground">
            Attribution: GoCoupon Executive Team, 2026. Free for citation with link to gocoupon.io.
          </p>
        </div>
      </section>

      {/* Brand Style Guide */}
      <section className="border-b border-border px-6 py-16 bg-muted/20">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Brand Style Guidelines
          </h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            <li className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
              Official Product Name: <strong className="text-foreground">GoCoupon</strong> (camelCase wordmark: <strong className="text-foreground">goCoupon</strong>).
            </li>
            <li className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
              Canonical Web Link: Always link to{" "}
              <a
                href="https://gocoupon.io/"
                className="text-primary underline-offset-4 hover:underline font-semibold"
              >
                https://gocoupon.io/
              </a>{" "}
              (avoid .com or regional typos).
            </li>
            <li className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
              Product Definition: GoCoupon is a free shopping intelligence web platform and Google Chrome extension.
            </li>
            <li className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
              Privacy Standard: Operates under Google Chrome Manifest V3 with zero personal identity or payment tracking.
            </li>
          </ul>
        </div>
      </section>

      {/* Frequently Asked Media Questions */}
      <section className="border-b border-border px-6 py-16 bg-background">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Frequently Asked Media Questions
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Quick answers for editors, analysts, and reporters covering e-commerce and shopping technology.
            </p>
          </div>

          <div className="space-y-4">
            {pressFaqs.map((faq, index) => (
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
        </div>
      </section>

      {/* Useful Contextual Links */}
      <section className="px-6 py-16 bg-muted/10">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Explore GoCoupon Resources &amp; Tools
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <LinkRow to="/" label="GoCoupon Homepage & Live Deals" />
            <LinkRow to="/chrome-extension" label="Google Chrome Extension" />
            <LinkRow to="/how-it-works" label="How Auto-Apply Works" />
            <LinkRow to="/featured-deals" label="Featured Partner Deals" />
            <LinkRow to="/resources" label="Free Shopping Calculators" />
            <LinkRow to="/help" label="Help Center & FAQs" />
            <LinkRow to="/submit-coupon" label="Submit a Coupon" />
            <LinkRow to="/contact" label="Contact Support Desk" />
            <LinkRow to="/thank-you" label="Inquiry Confirmation Status" />
          </ul>
        </div>
      </section>
    </SiteShell>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-2 font-display text-base font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function Quote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="rounded-2xl border border-border bg-card p-6 shadow-xs">
      <p className="font-display text-base sm:text-lg leading-relaxed text-foreground">“{children}”</p>
    </blockquote>
  );
}

function LinkRow({ to, label }: { to: string; label: string }) {
  return (
    <li>
      <Link
        to={to}
        className="inline-flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline font-medium"
      >
        <span>{label}</span>
        <span>→</span>
      </Link>
    </li>
  );
}
