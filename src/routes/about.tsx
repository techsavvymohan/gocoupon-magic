import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import {
  MapPin,
  Shield,
  Zap,
  Target,
  Globe,
  ArrowRight,
  Heart,
  CheckCircle,
  ExternalLink,
  Mail,
  ShieldAlert,
  ShoppingBag,
  TrendingDown,
  Layers,
} from "lucide-react";
import { MagneticButton } from "@/components/MagneticButton";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () =>
    createSeoHead({
      title: "About GoCoupon: The Official Coupon & Price Comparison Platform",
      description:
        "Learn about GoCoupon (gocoupon.io), India's official coupon and price comparison platform. Discover our mission, supported stores, privacy standards, and team.",
      path: "/about",
      keywords:
        "About GoCoupon, GoCoupon official, gocoupon.io, GoCoupon team, coupon extension India, price comparison India, 90 day price tracker, official GoCoupon website",
    }),
});

export function AboutPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "About GoCoupon", path: "/about" },
  ]);

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border px-6 pb-20 pt-20 sm:pt-28">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-primary">
            <Globe className="h-3.5 w-3.5" />
            Official Platform &amp; Entity Overview • Global Store Coverage 🌐
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            About <span className="text-primary font-extrabold">GoCoupon</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
            GoCoupon is an official free Chrome extension and shopping intelligence platform for online shoppers worldwide.
            We empower consumers with real-time multi-store price comparison, 30-day price history tracking,
            and 1-click verified coupon code auto-application at checkout across 200+ global and regional online stores.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <MagneticButton
              as="a"
              href="https://chromewebstore.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:scale-105"
            >
              <span>Add GoCoupon to Chrome — Free</span>
              <ArrowRight className="h-4 w-4" />
            </MagneticButton>
            <Link
              to="/how-it-works"
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              How GoCoupon Works
            </Link>
          </div>
        </div>
      </section>

      {/* Official Domain & Brand Identification Card (Crucial for Entity Verification) */}
      <section className="border-b border-border bg-card/60 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border-2 border-primary/30 bg-background/80 p-8 sm:p-12 shadow-xl backdrop-blur-md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-border pb-8">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Globe className="h-3.5 w-3.5" />
                  Official Domain Verification
                </div>
                <h2 className="mt-3 font-display text-2xl sm:text-3xl font-bold text-foreground">
                  How to Identify the Official GoCoupon Website
                </h2>
                <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                  Please verify you are on the genuine, secure, and official GoCoupon platform.
                </p>
              </div>
              <div className="shrink-0 font-mono text-sm sm:text-base font-bold text-primary rounded-2xl border border-primary/40 bg-primary/10 px-4 py-2.5">
                https://gocoupon.io/
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Official GoCoupon Entity Properties
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
                  <li>
                    <strong className="text-foreground">Official Domain:</strong> Only{" "}
                    <span className="font-mono text-foreground font-semibold">https://gocoupon.io/</span> is the official website for our browser extension, tools, and comparisons.
                  </li>
                  <li>
                    <strong className="text-foreground">Supported Geography:</strong> Global coverage with specialized support for international marketplaces (Amazon US &amp; Global, Walmart, Target, eBay) and leading regional e-commerce stores (Flipkart, Myntra, Ajio, Meesho, Croma, Nykaa, and 200+ partner merchants worldwide).
                  </li>
                  <li>
                    <strong className="text-foreground">Zero Cost:</strong> GoCoupon is 100% free with no subscriptions, paid tiers, or account requirements.
                  </li>
                  <li>
                    <strong className="text-foreground">Contact &amp; Support:</strong> Official communications originate strictly from{" "}
                    <a href="mailto:support@gocoupon.io" className="text-primary font-mono hover:underline">
                      support@gocoupon.io
                    </a>
                    .
                  </li>
                  <li>
                    <strong className="text-foreground">Ad Space Verification:</strong>{" "}
                    <span className="font-mono text-muted-foreground text-xs">admitad-verification: 0826</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3 rounded-2xl border border-border bg-muted/40 p-5">
                <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <ShieldAlert className="h-4 w-4 text-amber-500" />
                  Distinction From Unrelated Similarly Named Sites
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  GoCoupon (gocoupon.io) is an independent technology platform operated by a global remote-first team. We are <strong className="text-foreground">not affiliated with</strong> third-party regional or foreign websites such as <em>gocoupon.in</em> or <em>GoCoupons.ca</em>.
                </p>
                <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  Always ensure that any browser extension, price check, or promo code tool you install carries the official GoCoupon digital signature and links directly to{" "}
                  <span className="font-mono text-foreground font-semibold">gocoupon.io</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verifiable Platform Capabilities Section */}
      <section className="border-b border-border bg-muted/30 px-6 py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 sm:grid-cols-4">
          {[
            { value: "200+", label: "Stores Supported Worldwide" },
            { value: "90 Days", label: "Historical Price Tracking" },
            { value: "850 ms", label: "Parallel Coupon Testing" },
            { value: "$0", label: "Always 100% Free to Use" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl tabular-nums">
                {stat.value}
              </div>
              <div className="mt-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The Origin Story */}
      <section className="border-b border-border px-6 py-20">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
            Our Mission &amp; Origin
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why we created GoCoupon
          </h2>
          <div className="space-y-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
            <p>
              Shopping online worldwide is thrilling, but coupon hunting has traditionally been frustrating.
              Shoppers routinely open multiple browser tabs searching for promo codes, only to discover that 9 out of 10 codes are expired, clickbait, or restricted to bank cards they don&apos;t hold.
            </p>
            <p>
              At the same time, online pricing has become increasingly dynamic. Sellers frequently adjust prices or advertise misleading percentage discounts right before major sales events like Black Friday, Cyber Monday, Prime Day, or festive sales.
            </p>
            <p>
              We built <strong className="text-foreground">GoCoupon</strong> to solve both problems with transparent, automated shopping intelligence:
            </p>
            <ul className="space-y-3 pl-2">
              <li className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-primary shrink-0 mt-1" />
                <span>
                  <strong className="text-foreground">Instant Price Drop (IPD) Engine:</strong> While other tools make you passively wait weeks for an alert, GoCoupon engineers immediate savings right at checkout by combining live seller discounts, hidden coupon codes, and bank card rebates.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Layers className="h-5 w-5 text-primary shrink-0 mt-1" />
                <span>
                  <strong className="text-foreground">4-Tier True Landed Cost Calculator:</strong> Factors in store sticker price, auto-applied promo codes, instant payment card rebates, and cashback to calculate the net out-of-pocket price before you pay.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <TrendingDown className="h-5 w-5 text-primary shrink-0 mt-1" />
                <span>
                  <strong className="text-foreground">30-Day Deal Honesty Verification:</strong> Exposes artificial pre-sale price hikes with moving baseline analytics so you always know whether a deal is an authentic bargain or an inflated marketing trick.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Four Guiding Principles */}
      <section className="border-b border-border px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              Core Ethics
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Our Four Guiding Principles
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {[
              {
                icon: Zap,
                title: "1. Sub-Second Performance",
                description:
                  "Nobody wants checkout delay. Our lightweight engine tests candidate codes in parallel in under 850 milliseconds without slowing down your computer.",
              },
              {
                icon: Shield,
                title: "2. Privacy by Design & Sandboxed Safety",
                description:
                  "We never sell your browsing history, track search queries outside checkout, or log keystrokes. GoCoupon operates in a secure, sandboxed browser environment.",
              },
              {
                icon: Target,
                title: "3. Maximum Discount Savings",
                description:
                  "We rank codes strictly by how much money you save. If Code A saves more than Code B, we apply Code A 100% of the time, zero exceptions.",
              },
              {
                icon: Heart,
                title: "4. Always 100% Free",
                description:
                  "We will never introduce premium tiers, paid subscriptions, or locked features. GoCoupon is completely free for every shopper, forever.",
              },
            ].map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/40 hover:shadow-lg"
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <pillar.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Official Directory of GoCoupon Product & Legal Links */}
      <section className="border-b border-border bg-muted/20 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              Site Navigation &amp; Governance
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Official GoCoupon Directory &amp; Transparency Pages
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "GoCoupon Official Extension",
                to: "/chrome-extension",
                desc: "Features, permissions, installation & supported stores.",
              },
              {
                title: "How GoCoupon Works",
                to: "/how-it-works",
                desc: "Transparent code testing and discount ranking algorithm.",
              },
              {
                title: "Price Comparison Engine",
                to: "/compare",
                desc: "Real-time Amazon vs. Flipkart vs. Croma checkout comparison.",
              },
              {
                title: "Verified Store Offers",
                to: "/offers",
                desc: "Live tested coupons and exclusive merchant deals.",
              },
              {
                title: "Security & Trust Architecture",
                to: "/security",
                desc: "Google Manifest V3 sandboxing and local data handling.",
              },
              {
                title: "Affiliate Partnership Disclosure",
                to: "/disclosure",
                desc: "Transparent monetization via referral commissions.",
              },
              {
                title: "Terms of Service",
                to: "/terms",
                desc: "User license and acceptable usage policy.",
              },
              {
                title: "Privacy Policy",
                to: "/privacy",
                desc: "Comprehensive zero-browsing-log commitment.",
              },
              {
                title: "All 200+ Stores Directory",
                to: "/stores",
                desc: "Complete index of supported global and regional merchants.",
              },
            ].map((link) => (
              <Link
                key={link.title}
                to={link.to}
                className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div>
                  <h4 className="font-display font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                    <span>{link.title}</span>
                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h4>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {link.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Support & Contact Footer Callout */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-gradient-to-b from-card to-background p-10 text-center shadow-lg sm:p-16">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Have questions about GoCoupon?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            Our engineering and support team is here to help shoppers, merchants, and partners worldwide.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:support@gocoupon.io"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:scale-105"
            >
              <Mail className="h-4 w-4" />
              <span>Contact support@gocoupon.io</span>
            </a>
            <Link
              to="/chrome-extension"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3 text-sm font-semibold text-foreground transition-all hover:bg-accent"
            >
              <span>Get the Chrome Extension</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
