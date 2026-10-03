import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { ProductHero } from "@/components/site/ProductHero";
import { CheckoutSimulator } from "@/components/site/CheckoutSimulator";
import { LogoMarquee } from "@/components/site/LogoMarquee";
import { GrabOnHero } from "@/components/site/GrabOnHero";
import { GrabOnPopularOffers } from "@/components/site/GrabOnPopularOffers";
import { GrabOnPopularStores } from "@/components/site/GrabOnPopularStores";
import { D2CWedgeComparison } from "@/components/site/D2CWedgeComparison";
import { AnimatedDealsCarousel } from "@/components/site/AnimatedDealsCarousel";
import { SecurityTrustPledge } from "@/components/site/SecurityTrustPledge";
import { WhyUsExpenseSaviour } from "@/components/site/WhyUsExpenseSaviour";
import { FAQ } from "@/components/site/FAQ";
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

      {/* 1. Flagship Product Hero */}
      <ProductHero />

      {/* 2. Interactive Live Checkout Simulator (1.4s Demo) */}
      <CheckoutSimulator />

      {/* 3. Partner Brand Marquee */}
      <LogoMarquee />

      {/* 4. Featured Deals Showcase & Top Picks */}
      <GrabOnHero />

      {/* 5. Popular Offers of the Day: Tested Working Coupons */}
      <GrabOnPopularOffers />

      {/* 6. Popular Stores Directory */}
      <GrabOnPopularStores />

      {/* 7. D2C Wedge Comparison (Compact, High-Contrast) */}
      <D2CWedgeComparison />

      {/* 8. Live Scrolling Deals Marquee */}
      <AnimatedDealsCarousel />

      {/* 9. Security & Privacy Architecture Pledge */}
      <SecurityTrustPledge />

      {/* 10. Common Checkout Leaks Solved */}
      <WhyUsExpenseSaviour />

      {/* 11. Frequently Asked Questions */}
      <FAQ />

      {/* 12. Final High-Conversion Call To Action */}
      <CTA />
    </SiteShell>
  );
}
