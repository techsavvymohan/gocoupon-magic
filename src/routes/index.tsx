import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { Hero } from "@/components/site/Hero";
import { LogoMarquee } from "@/components/site/LogoMarquee";
import { couponFaqs } from "@/data/faqs";
import { breadcrumbSchema, createSeoHead, faqSchema, organizationSchema, softwareAppSchema, websiteSchema } from "@/lib/seo";

// ─── Below-fold sections lazy-loaded to reduce initial JS parse cost ───────────
// The browser paints Hero + LogoMarquee instantly while these modules stream in.
const Stats = lazy(() => import("@/components/site/Stats").then(m => ({ default: m.Stats })));
const AnimatedDealsCarousel = lazy(() => import("@/components/site/AnimatedDealsCarousel").then(m => ({ default: m.AnimatedDealsCarousel })));
const ExtensionShowcase = lazy(() => import("@/components/site/ExtensionShowcase").then(m => ({ default: m.ExtensionShowcase })));
const HowItWorks = lazy(() => import("@/components/site/HowItWorks").then(m => ({ default: m.HowItWorks })));
const WhyUsExpenseSaviour = lazy(() => import("@/components/site/WhyUsExpenseSaviour").then(m => ({ default: m.WhyUsExpenseSaviour })));
const Features = lazy(() => import("@/components/site/Features").then(m => ({ default: m.Features })));
const FAQ = lazy(() => import("@/components/site/FAQ").then(m => ({ default: m.FAQ })));
const Blog = lazy(() => import("@/components/site/Blog").then(m => ({ default: m.Blog })));
const CTA = lazy(() => import("@/components/site/CTA").then(m => ({ default: m.CTA })));

// Minimal height-preserving skeleton to prevent layout shift while sections load
function SectionSkeleton({ height = "400px" }: { height?: string }) {
  return <div style={{ height, contain: "content" }} aria-hidden="true" />;
}

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
      {/* ── Below fold: streamed in after first paint ─────────────────── */}
      <Suspense fallback={<SectionSkeleton height="280px" />}>
        <Stats />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="360px" />}>
        <AnimatedDealsCarousel />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="480px" />}>
        <ExtensionShowcase />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="360px" />}>
        <HowItWorks />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="320px" />}>
        <WhyUsExpenseSaviour />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="320px" />}>
        <Features />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="400px" />}>
        <FAQ />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="360px" />}>
        <Blog />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="240px" />}>
        <CTA />
      </Suspense>
    </SiteShell>
  );
}
