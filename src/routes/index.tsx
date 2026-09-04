import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Hero } from "@/components/site/Hero";
import { LogoMarquee } from "@/components/site/LogoMarquee";
import { Stats } from "@/components/site/Stats";
import { ExtensionShowcase } from "@/components/site/ExtensionShowcase";
import { HowItWorks } from "@/components/site/HowItWorks";
import { Features } from "@/components/site/Features";
import { AnimatedDealsCarousel } from "@/components/site/AnimatedDealsCarousel";
import { AmazonAffiliateCards } from "@/components/site/AmazonAffiliateCards";
import { ShoppingIntelligenceSpotlight } from "@/components/shopping/ShoppingIntelligenceSpotlight";
import { Testimonials } from "@/components/site/Testimonials";
import { FAQ } from "@/components/site/FAQ";
import { Blog } from "@/components/site/Blog";
import { ContactForm } from "@/components/site/ContactForm";
import { CTA } from "@/components/site/CTA";
import { About } from "@/components/site/About";
import { couponFaqs } from "@/data/faqs";
import { breadcrumbSchema, createSeoHead, faqSchema, organizationSchema, softwareAppSchema } from "@/lib/seo";

export const Route = createFileRoute("/")({
  component: Index,
  head: () =>
    createSeoHead({
      title: "goCoupon: Deals, Discounts, Coupons, Price Tracking & Comparison India – Find Cheaper Products",
      description:
        "Find cheaper products instantly with goCoupon. Compare live prices across Amazon, Flipkart & Croma, auto-apply 100% working discount coupons, track 90-day price drops, and grab today's best online shopping deals in India.",
      path: "/",
      keywords:
        "deals, discounts, coupons, coupon codes, promo codes, price tracking, price tracker india, price comparison, compare prices, cheaper products, lowest price online, amazon vs flipkart price, auto apply coupons, fake discount detector, online shopping savings",
    }),
});

function Index() {
  const breadcrumb = breadcrumbSchema([{ name: "Home", path: "/" }]);
  const faq = faqSchema(couponFaqs);
  const org = organizationSchema();
  const app = softwareAppSchema();

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(app) }}
      />
      <Hero />
      <LogoMarquee />
      <Stats />
      <ExtensionShowcase />
      <HowItWorks />
      <Features />
      <AnimatedDealsCarousel />
      <AmazonAffiliateCards />
      <ShoppingIntelligenceSpotlight />
      <About />
      <Testimonials />
      <FAQ />
      <Blog />
      <ContactForm />
      <CTA />
    </SiteShell>
  );
}
