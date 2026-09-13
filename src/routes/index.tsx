import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Hero } from "@/components/site/Hero";
import { LogoMarquee } from "@/components/site/LogoMarquee";
import { Stats } from "@/components/site/Stats";
import { ExtensionShowcase } from "@/components/site/ExtensionShowcase";
import { HowItWorks } from "@/components/site/HowItWorks";
import { Features } from "@/components/site/Features";
import { AnimatedDealsCarousel } from "@/components/site/AnimatedDealsCarousel";
import { CardArbitrageShowcase } from "@/components/site/CardArbitrageShowcase";
import { ShoppingIntelligenceSpotlight } from "@/components/shopping/ShoppingIntelligenceSpotlight";
import { WhyUsExpenseSaviour } from "@/components/site/WhyUsExpenseSaviour";
import { FAQ } from "@/components/site/FAQ";
import { Blog } from "@/components/site/Blog";
import { CTA } from "@/components/site/CTA";
import { couponFaqs } from "@/data/faqs";
import { breadcrumbSchema, createSeoHead, faqSchema, organizationSchema, softwareAppSchema, websiteSchema } from "@/lib/seo";

export const Route = createFileRoute("/")({
  component: Index,
  head: () =>
    createSeoHead({
      title: "GoCoupon (Go Coupon) – Verified Coupons, Deals & Promo Codes | GrabOn & CouponDuniya Alternative",
      description:
        "Looking for Go Coupon, GrabOn, CouponDuniya or Dealspotr? GoCoupon features 970+ verified live deals, auto-applied promo codes, price tracking, and 10% instant bank discounts across 500+ stores. 100% free.",
      path: "/",
      keywords:
        "GoCoupon, go coupon, gocoupon, gocoupons, gocoupon.io, grabon, grabon alternative, grabon coupons, couponduniya, coupon duniya, coupondunia, couponduniya alternative, dealspotr, dealspottr, dealspottr coupons, deals, discounts, coupons, promo codes, price tracking, price tracker, price comparison, compare prices, auto apply coupons, fake discount detector, cashback extension",
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
      <Hero />
      <LogoMarquee />
      <CardArbitrageShowcase />
      <Stats />
      <AnimatedDealsCarousel />
      <ShoppingIntelligenceSpotlight />
      <WhyUsExpenseSaviour />
      <ExtensionShowcase />
      <HowItWorks />
      <Features />
      <FAQ />
      <Blog />
      <CTA />
    </SiteShell>
  );
}

