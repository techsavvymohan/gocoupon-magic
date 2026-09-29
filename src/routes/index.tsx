import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { Hero } from "@/components/site/Hero";
import { LogoMarquee } from "@/components/site/LogoMarquee";
import { couponFaqs } from "@/data/faqs";
import { breadcrumbSchema, createSeoHead, faqSchema, organizationSchema, softwareAppSchema, websiteSchema } from "@/lib/seo";

// ─── Below-fold sections lazy-loaded to reduce initial JS parse cost ───────────
// The browser paints Hero + LogoMarquee instantly while these stream in.
// Suspense fallback is null (no skeleton) because modules load near-instantly
// from the local asset cache — visible skeleton gaps are worse than a quick pop-in.
const Stats = lazy(() => import("@/components/site/Stats").then(m => ({ default: m.Stats })));
const AnimatedDealsCarousel = lazy(() => import("@/components/site/AnimatedDealsCarousel").then(m => ({ default: m.AnimatedDealsCarousel })));
const ExtensionShowcase = lazy(() => import("@/components/site/ExtensionShowcase").then(m => ({ default: m.ExtensionShowcase })));
const HowItWorks = lazy(() => import("@/components/site/HowItWorks").then(m => ({ default: m.HowItWorks })));
const WhyUsExpenseSaviour = lazy(() => import("@/components/site/WhyUsExpenseSaviour").then(m => ({ default: m.WhyUsExpenseSaviour })));
const Features = lazy(() => import("@/components/site/Features").then(m => ({ default: m.Features })));
const FAQ = lazy(() => import("@/components/site/FAQ").then(m => ({ default: m.FAQ })));
const Blog = lazy(() => import("@/components/site/Blog").then(m => ({ default: m.Blog })));
const CTA = lazy(() => import("@/components/site/CTA").then(m => ({ default: m.CTA })));

export const Route = createFileRoute("/")({
  component: Index,
  head: () =>
    createSeoHead({
      title: "GoCoupon – Verified Coupons, Promo Codes & Deals (2026) | 1-Click Auto-Apply Extension",
      description:
        "Find verified working coupon codes, promo vouchers, and live merchant deals across 240+ online stores. Install the free GoCoupon Chrome extension to auto-apply tested discount codes at checkout.",
      path: "/",
      keywords:
        "coupons, promo codes, discount codes, verified coupons, working coupons today, chrome extension auto apply coupons, coupon code extension, amazon promo codes, myntra discount coupons, swiggy coupons, booking.com hotel discount, online shopping deals india 2026, gocoupon",
    }),
});

function Index() {
  const website = websiteSchema();
  const org = organizationSchema();
  const app = softwareAppSchema();
  const breadcrumb = breadcrumbSchema([{ name: "Home", path: "/" }]);
  const faq = faqSchema(couponFaqs);

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(app) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />

      {/* ── Above fold: eagerly rendered ─────────────────────────────── */}
      <Hero />
      <LogoMarquee />

      {/* ── Below fold: lazy-loaded, null fallback = no gap ─────────── */}
      <Suspense fallback={null}>
        <Stats />
      </Suspense>
      <Suspense fallback={null}>
        <AnimatedDealsCarousel />
      </Suspense>
      <Suspense fallback={null}>
        <ExtensionShowcase />
      </Suspense>
      <Suspense fallback={null}>
        <HowItWorks />
      </Suspense>
      <Suspense fallback={null}>
        <WhyUsExpenseSaviour />
      </Suspense>
      <Suspense fallback={null}>
        <Features />
      </Suspense>
      <Suspense fallback={null}>
        <FAQ />
      </Suspense>
      <Suspense fallback={null}>
        <Blog />
      </Suspense>
      <Suspense fallback={null}>
        <CTA />
      </Suspense>
    </SiteShell>
  );
}
