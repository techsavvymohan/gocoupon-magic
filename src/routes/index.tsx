import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Hero } from "@/components/site/Hero";
import { LogoMarquee } from "@/components/site/LogoMarquee";
import { Stats } from "@/components/site/Stats";
import { HowItWorks } from "@/components/site/HowItWorks";
import { Features } from "@/components/site/Features";
import { Testimonials } from "@/components/site/Testimonials";
import { Pricing } from "@/components/site/Pricing";
import { FAQ } from "@/components/site/FAQ";
import { Blog } from "@/components/site/Blog";
import { CTA } from "@/components/site/CTA";
import { couponFaqs } from "@/data/faqs";
import { breadcrumbSchema, createSeoHead, faqSchema } from "@/lib/seo";

export const Route = createFileRoute("/")({
  component: Index,
  head: () =>
    createSeoHead({
      title: "goCoupon – Auto-Apply Coupon Codes & Cashback Extension",
      description:
        "Get automatic coupons and cashback on Flipkart, Amazon, Myntra, Meesho and more with goCoupon. Install our Chrome extension to save at checkout.",
      path: "/",
      keywords:
        "coupon extension chrome, cashback extension india, amazon india coupons, flipkart coupon code, myntra promo code, meesho coupon code",
    }),
});

function Index() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
  ]);
  const faq = faqSchema(couponFaqs);

  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <Hero />
      <LogoMarquee />
      <Stats />
      <HowItWorks />
      <Features />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Blog />
      <CTA />
    </SiteShell>
  );
}
