import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import { Sparkles, Shield, Zap, Target, Users, Award, ArrowRight, Heart, Cpu, CheckCircle } from "lucide-react";
import { MagneticButton } from "@/components/MagneticButton";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () =>
    createSeoHead({
      title: "About Us – Our Mission to Make Shopping Cheaper in India | goCoupon",
      description:
        "Meet the team behind goCoupon. Founded in Bengaluru in 2024, our mission is to eliminate expired coupons and save online shoppers billions of rupees automatically.",
      path: "/about",
      keywords:
        "about goCoupon, goCoupon team, goCoupon mission, bangalore tech startup, coupon extension founders, shopping assistant india",
    }),
});

function AboutPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
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
            <Sparkles className="h-3.5 w-3.5" />
            Built in Bengaluru, India 🇮🇳
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            We exist to end the frustration of{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              expired coupon codes
            </span>
            .
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground sm:text-xl">
            Every day, millions of Indian online shoppers waste time copying fake codes from listicle websites.
            goCoupon replaces the manual search with intelligent, one-click automation that guarantees the lowest possible cart price.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <MagneticButton
              as="a"
              href="https://chromewebstore.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:scale-105"
            >
              <span>Add to Chrome — Free</span>
              <ArrowRight className="h-4 w-4" />
            </MagneticButton>
            <Link
              to="/how-it-works"
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="border-b border-border bg-muted/30 px-6 py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 sm:grid-cols-4">
          {[
            { value: "₹4.8 Cr+", label: "User Savings to Date" },
            { value: "120,000+", label: "Active Chrome Users" },
            { value: "< 850ms", label: "Average Auto-Test Time" },
            { value: "98.4%", label: "Working Code Accuracy" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                {stat.value}
              </div>
              <div className="mt-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The Story Section */}
      <section className="border-b border-border px-6 py-20">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
            Our Story &amp; Origin
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why we built goCoupon
          </h2>
          <div className="space-y-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
            <p>
              In late 2024, our founders in Bengaluru were shopping during the festive sales on Flipkart and Amazon.
              Like most shoppers, they opened six different browser tabs searching for &ldquo;Flipkart promo codes today&rdquo;, only to find that 9 out of 10 codes were expired, clickbait, or restricted to specific credit cards they didn't own.
            </p>
            <p>
              The coupon industry in India was broken. It relied on spammy affiliate portals cluttered with ads and non-working codes designed solely to trigger affiliate cookies without delivering real savings.
            </p>
            <p>
              We asked a simple question: <strong className="text-foreground">Why can't an extension test all valid codes directly in the browser in less than a second, and apply the real winner automatically?</strong> That simple idea led to the creation of goCoupon.
            </p>
          </div>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="border-b border-border px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              What We Stand For
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Our Four Guiding Principles
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {[
              {
                icon: Zap,
                title: "1. Sub-Second Speed",
                description:
                  "Nobody wants to wait 30 seconds at checkout. Our lightweight asynchronous engine tests candidate codes in parallel in under 850 milliseconds.",
              },
              {
                icon: Shield,
                title: "2. Privacy by Default",
                description:
                  "We never sell your browsing history, track search queries outside checkout, or log keystrokes. goCoupon operates with strict data minimization.",
              },
              {
                icon: Target,
                title: "3. Maximum Rupee Savings",
                description:
                  "We rank codes strictly by how many rupees you save. If Code A saves ₹300 and Code B saves ₹100, we apply Code A 100% of the time, zero exceptions.",
              },
              {
                icon: Heart,
                title: "4. Always 100% Free",
                description:
                  "We will never introduce premium tiers, paid subscriptions, or locked features. goCoupon is free for everyone, forever.",
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

      {/* Technology Engine */}
      <section className="border-b border-border bg-muted/20 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-primary">
                <Cpu className="h-3.5 w-3.5" />
                Engineering Architecture
              </div>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Built on Chrome Manifest V3 for speed &amp; safety.
              </h2>
              <p className="mt-4 text-base text-muted-foreground">
                Unlike legacy extensions that hog memory and inject bloated scripts, goCoupon is engineered from the ground up on Google's modern Manifest V3 platform.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Zero background CPU drain when you aren't on a store checkout page",
                  "Automated real-time stale code purging via distributed verification nodes",
                  "Support for combined coupon + bank credit card stacking logic",
                  "Sandboxed DOM mutation observers for instant coupon input detection",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/90">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                </div>
                <span className="font-mono text-xs text-muted-foreground">goCoupon Engine v2.4</span>
              </div>
              <div className="mt-6 space-y-4 font-mono text-xs">
                <div className="rounded bg-muted/60 p-3 text-muted-foreground">
                  <span className="text-emerald-500">[STATUS]</span> Cart detected on flipkart.com/checkout
                </div>
                <div className="rounded bg-muted/60 p-3 text-muted-foreground">
                  <span className="text-primary">[SCAN]</span> Testing 18 candidate coupons...
                </div>
                <div className="rounded border border-primary/40 bg-primary/10 p-3 text-foreground">
                  <span className="font-bold text-primary">[WINNER]</span> Applied FKFEST2026 (-₹500 net savings)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-gradient-to-b from-card to-background p-10 text-center shadow-lg sm:p-16">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Join 120,000+ smart shoppers saving every day.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            Install the free Chrome extension in seconds and never pay full price on Amazon, Flipkart, or Myntra again.
          </p>
          <div className="mt-8">
            <MagneticButton
              as="a"
              href="https://chromewebstore.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-md transition-all hover:scale-105"
            >
              <span>Add goCoupon to Chrome — It's Free</span>
              <ArrowRight className="h-4 w-4" />
            </MagneticButton>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
