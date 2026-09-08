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
      title: "GoCoupon: Coupons, Price Comparison & Cashback Extension",
      description:
        "GoCoupon is the free shopping extension for working coupons, live price comparison, 90-day price history and cashback across online stores worldwide.",
      path: "/",
      keywords:
        "GoCoupon, gocoupon.io, go coupon, gocoupon extension, deals, discounts, coupons, promo codes, price tracking, price tracker, price comparison, compare prices, auto apply coupons, fake discount detector, cashback extension",
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

