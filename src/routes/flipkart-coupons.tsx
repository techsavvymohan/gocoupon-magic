import { createFileRoute } from "@tanstack/react-router";
import { SeoLandingPage } from "@/components/site/SeoLandingPage";
import { breadcrumbSchema, createSeoHead, faqSchema } from "@/lib/seo";

const faqs = [
  {
    q: "How do I get Flipkart coupon codes today?",
    a: "Install goCoupon and open your Flipkart cart. The extension tests available coupon codes and applies the highest discount.",
  },
  {
    q: "Can I stack Flipkart coupons and bank offers?",
    a: "Often yes. goCoupon applies the strongest cart coupon first, and you can select an eligible bank offer during payment.",
  },
  {
    q: "Why does a Flipkart promo code fail?",
    a: "Common reasons include minimum order value, category lock, expired code, one-time user limits, or payment restrictions.",
  },
] as const;

export const Route = createFileRoute("/flipkart-coupons")({
  component: FlipkartCouponsPage,
  head: () =>
    createSeoHead({
      title: "Flipkart Coupons & Cashback Offers – Flipkart Promo Codes",
      description:
        "Discover the latest Flipkart coupon codes and cashback offers with goCoupon. Auto-apply valid Flipkart promo codes and maximize checkout savings.",
      path: "/flipkart-coupons",
      keywords: "flipkart coupon code, flipkart promo code, flipkart discount code, flipkart cashback offers",
    }),
});

function FlipkartCouponsPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Flipkart Coupons", path: "/flipkart-coupons" },
  ]);
  const faq = faqSchema(faqs.map((f) => ({ question: f.q, answer: f.a })));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <SeoLandingPage
        eyebrow="Flipkart coupon codes"
        title="Flipkart coupons, promo codes and cashback offers in one place."
        description="goCoupon automatically tests and applies valid Flipkart coupons so you can save more at checkout without manual trial and error."
        primaryCtaLabel="Install extension"
        primaryCtaTo="/extension"
        bullets={[
          "Finds and applies working Flipkart promo codes instantly.",
          "Highlights coupon plus bank-offer combinations.",
          "Helps you avoid expired or low-value coupon attempts.",
          "Built for high-intent sale windows like Big Billion Days.",
        ]}
        faqs={faqs.map((f) => ({ q: f.q, a: f.a }))}
        breadcrumb={[
          { name: "Home", path: "/" },
          { name: "Flipkart Coupons", path: "/flipkart-coupons" },
        ]}
      />
    </>
  );
}
