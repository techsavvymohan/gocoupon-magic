import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { ProductHero } from "@/components/site/ProductHero";
import { CheckoutSimulator } from "@/components/site/CheckoutSimulator";
import { LogoMarquee } from "@/components/site/LogoMarquee";
import { D2CWedgeComparison } from "@/components/site/D2CWedgeComparison";
import { GrabOnHero } from "@/components/site/GrabOnHero";
import { GrabOnPopularOffers } from "@/components/site/GrabOnPopularOffers";
import { GrabOnPopularStores } from "@/components/site/GrabOnPopularStores";
import { AnimatedDealsCarousel } from "@/components/site/AnimatedDealsCarousel";
import { ExtensionShowcase } from "@/components/site/ExtensionShowcase";
import { SecurityTrustPledge } from "@/components/site/SecurityTrustPledge";
import { HowItWorks } from "@/components/site/HowItWorks";
import { WhyUsExpenseSaviour } from "@/components/site/WhyUsExpenseSaviour";
import { Features } from "@/components/site/Features";
import { FAQ } from "@/components/site/FAQ";
import { Blog } from "@/components/site/Blog";
import { CTA } from "@/components/site/CTA";
import { couponFaqs } from "@/data/faqs";
import {
  breadcrumbSchema,
  createSeoHead,
  faqSchema,
  organizationSchema,
  softwareAppSchema,
  websiteSchema,
} from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    createSeoHead({
      title: "GoCoupon — Verified Coupons, Promo Codes & Deals (2026) | 1-Click Auto-Apply Extension",
      description:
        "Find verified working coupon codes, promo vouchers, and live merchant deals across 240+ online stores. Install the free GoCoupon Chrome extension to auto-apply tested discount codes at checkout.",
      path: "/",
      keywords:
        "coupons, promo codes, discount codes, verified coupons, working coupons today, chrome extension auto apply coupons, coupon code extension, amazon promo codes, myntra discount coupons, swiggy coupons, booking.com hotel discount, online shopping deals india 2026, gocoupon",
    }),
  component: Index,
});

function Index() {
  const website = websiteSchema();
  const org = organizationSchema();
  const app = softwareAppSchema();
  const breadcrumb = breadcrumbSchema([{ name: "Home", path: "/" }]);
  const faq = faqSchema(couponFaqs);

  return (
    <SiteShell hideFooterCta={true}>
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

      {/* 1. Flagship Product Hero: Sharp Wedge Positioning & Live Telemetry */}
      <ProductHero />

      {/* 2. Visceral Interactive Checkout Simulator: Real ₹2,499 -> ₹1,799 in 1.4s */}
      <CheckoutSimulator />

      {/* 3. Partner Brand Marquee: Trust & Coverage Validation */}
      <LogoMarquee />

      {/* 4. D2C Wedge Comparison: Why GoCoupon Beats Honey & Generic Scraping Blogs */}
      <D2CWedgeComparison />

      {/* 5. Featured Deals Showcase & Top Picks */}
      <GrabOnHero />

      {/* 6. Popular Offers of the Day: Tested Working Coupons */}
      <GrabOnPopularOffers />

      {/* 7. Popular Stores: Store of the Month & Directory Grid */}
      <GrabOnPopularStores />

      {/* 8. Live Scrolling Deals Marquee */}
      <AnimatedDealsCarousel />

      {/* 9. Chrome Extension Dedicated Deep-Dive */}
      <ExtensionShowcase />

      {/* 10. Security & Privacy Architecture Pledge: Manifest V3 & Zero Financial Access */}
      <SecurityTrustPledge />

      {/* 11. How It Works Step-by-Step */}
      <HowItWorks />

      {/* 12. Expense Leak Diagnosis & Household Savings */}
      <WhyUsExpenseSaviour />

      {/* 13. Platform Features */}
      <Features />

      {/* 14. Frequently Asked Questions */}
      <FAQ />

      {/* 15. Savings Editorial & Guides */}
      <Blog />

      {/* 16. Final High-Conversion Call To Action */}
      <CTA />
    </SiteShell>
  );
}
