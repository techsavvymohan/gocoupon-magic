import { createFileRoute } from "@tanstack/react-router";
import { SeoLandingPage } from "@/components/site/SeoLandingPage";
import { AmazonAffiliateCards } from "@/components/site/AmazonAffiliateCards";
import { AnimatedDealsCarousel } from "@/components/site/AnimatedDealsCarousel";
import { AffiliateDisclosure } from "@/components/affiliate/AffiliateDisclosure";
import { breadcrumbSchema, createSeoHead, faqSchema } from "@/lib/seo";


const faqs = [
  {
    q: "How do I find valid Amazon India coupon codes?",
    a: "Use goCoupon during checkout. It auto-tests valid Amazon coupon codes and applies the best one available for your cart.",
  },
  {
    q: "Can I use Amazon coupons with bank offers?",
    a: "In many carts yes. Apply the coupon first, then choose an eligible bank or card offer at payment.",
  },
  {
    q: "Do Amazon promo codes work on all products?",
    a: "No. Most are category or seller specific and may require minimum cart value or specific payment methods.",
  },
] as const;

export const Route = createFileRoute("/amazon-coupons")({
  component: AmazonCouponsPage,
  head: () =>
    createSeoHead({
      title: "Amazon India Coupons & Promo Codes – Save on Electronics and Fashion",
      description:
        "Find verified Amazon India coupon codes with goCoupon. Auto-apply the best Amazon promo code at checkout and save more on every order.",
      path: "/amazon-coupons",
      keywords:
        "amazon india coupons, amazon promo code, amazon discount code, amazon cashback offers india",
    }),
});

function AmazonCouponsPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Amazon Coupons", path: "/amazon-coupons" },
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
        eyebrow="Amazon coupon codes"
        title="Amazon India coupons and promo codes that actually work."
        description="goCoupon finds and auto-applies valid Amazon coupon codes at checkout so you do not waste time testing expired promos."
        primaryCtaLabel="Install extension"
        primaryCtaTo="/extension"
        bullets={[
          "Auto-tests working Amazon promo codes in seconds.",
          "Helps combine coupon savings with eligible bank offers.",
          "Shows expected net savings before final payment.",
          "Works across popular categories like electronics, fashion and home.",
        ]}
        faqs={faqs.map((f) => ({ q: f.q, a: f.a }))}
        breadcrumb={[
          { name: "Home", path: "/" },
          { name: "Amazon Coupons", path: "/amazon-coupons" },
        ]}
      >
        <AnimatedDealsCarousel />
        <AmazonAffiliateCards />
        <div className="mx-auto max-w-7xl px-6 pb-4">
          <AffiliateDisclosure providers={["amazon"]} />
        </div>
      </SeoLandingPage>
    </>
  );
}
