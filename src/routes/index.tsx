import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Hero } from "@/components/site/Hero";
import { LogoMarquee } from "@/components/site/LogoMarquee";
import { Stats } from "@/components/site/Stats";
import { HowItWorks } from "@/components/site/HowItWorks";
import { Features } from "@/components/site/Features";
import { AnimatedDealsCarousel } from "@/components/site/AnimatedDealsCarousel";
import { AmazonAffiliateCards } from "@/components/site/AmazonAffiliateCards";
import { ShoppingIntelligenceSpotlight } from "@/components/shopping/ShoppingIntelligenceSpotlight";
import { Testimonials } from "@/components/site/Testimonials";
import { Pricing } from "@/components/site/Pricing";
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
      title: "goCoupon™ – Auto-Apply Working Coupons & Live Price Tracker (Save Up to 40%)",
      description:
        "Never search for coupon codes again. goCoupon automatically tests and applies the best working promo codes, tracks 90-day price drops, and unlocks cashback on Amazon, Flipkart, Myntra & 200+ stores.",
      path: "/",
      keywords:
        "coupon codes india, coupon extension chrome, cashback extension india, amazon india coupons, flipkart coupon code, myntra promo code, meesho coupon code, price tracker india",
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
      <HowItWorks />
      <Features />
      <AnimatedDealsCarousel />
      <AmazonAffiliateCards />
      <ShoppingIntelligenceSpotlight />
      <About />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Blog />
      <ContactForm />
      <CTA />
    </SiteShell>
  );
}
