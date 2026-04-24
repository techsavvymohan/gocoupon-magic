import { createFileRoute } from "@tanstack/react-router";
import { SeoLandingPage } from "@/components/site/SeoLandingPage";
import { breadcrumbSchema, createSeoHead, faqSchema } from "@/lib/seo";

const faqs = [
  {
    q: "How do I apply Myntra coupon codes?",
    a: "Add products to cart and open checkout with goCoupon enabled. It checks and applies valid Myntra coupon codes automatically.",
  },
  {
    q: "Do Myntra Insider offers work with coupons?",
    a: "Some insider offers stack, some replace coupon savings. goCoupon helps compare both paths and keeps the best final price.",
  },
  {
    q: "Which categories get the best Myntra discounts?",
    a: "Fashion, beauty and seasonal sale collections usually see the highest percentage discounts and coupon activity.",
  },
] as const;

export const Route = createFileRoute("/myntra-coupons")({
  component: MyntraCouponsPage,
  head: () =>
    createSeoHead({
      title: "Myntra Coupons & Promo Codes – Myntra Sale Deals 2026",
      description:
        "Unlock extra savings with Myntra coupon codes on goCoupon. Auto-apply working Myntra promo codes and compare cashback + insider pricing.",
      path: "/myntra-coupons",
      keywords:
        "myntra coupon code, myntra promo code, myntra discount coupon, myntra cashback offers",
    }),
});

function MyntraCouponsPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Myntra Coupons", path: "/myntra-coupons" },
  ]);
  const faq = faqSchema(faqs.map((f) => ({ question: f.q, answer: f.a })));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
      <SeoLandingPage
        eyebrow="Myntra promo codes"
        title="Myntra coupon codes that help you save more on fashion."
        description="goCoupon finds validated Myntra promo codes, tests them at checkout, and applies the one that gives the highest net savings."
        primaryCtaLabel="Install extension"
        primaryCtaTo="/extension"
        bullets={[
          "Automatically tests multiple Myntra coupon combinations.",
          "Compares insider pricing and promo code outcomes.",
          "Optimized for EORS and festival sale traffic.",
          "Cuts checkout friction for repeat fashion buyers.",
        ]}
        faqs={faqs.map((f) => ({ q: f.q, a: f.a }))}
        breadcrumb={[
          { name: "Home", path: "/" },
          { name: "Myntra Coupons", path: "/myntra-coupons" },
        ]}
      />
    </>
  );
}
