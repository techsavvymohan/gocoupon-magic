import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Hero } from "@/components/site/Hero";
import { LogoMarquee } from "@/components/site/LogoMarquee";
import { Stats } from "@/components/site/Stats";
import { AnimatedDealsCarousel } from "@/components/site/AnimatedDealsCarousel";
import { ExtensionShowcase } from "@/components/site/ExtensionShowcase";
import { HowItWorks } from "@/components/site/HowItWorks";
import { WhyUsExpenseSaviour } from "@/components/site/WhyUsExpenseSaviour";
import { Features } from "@/components/site/Features";
import { FAQ } from "@/components/site/FAQ";
import { Blog } from "@/components/site/Blog";
import { CTA } from "@/components/site/CTA";
import { couponFaqs } from "@/data/faqs";
import { breadcrumbSchema, createSeoHead, faqSchema, organizationSchema, softwareAppSchema, websiteSchema } from "@/lib/seo";

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

      {/* ── Cohesive, seamless homepage sections without gaping or layout shifts ── */}
      <Hero />
      <LogoMarquee />
      <Stats />
      <AnimatedDealsCarousel />
      <ExtensionShowcase />
      <HowItWorks />
      <WhyUsExpenseSaviour />
      <Features />
      <FAQ />
      <Blog />
      <CTA />
    </SiteShell>
  );
}
