import { createFileRoute } from "@tanstack/react-router";
import { SeoLandingPage } from "@/components/site/SeoLandingPage";
import { breadcrumbSchema, createSeoHead, faqSchema } from "@/lib/seo";

const faqs = [
  {
    q: "How do I use Meesho coupon codes at checkout?",
    a: "Install goCoupon and proceed to checkout on Meesho. The extension detects and applies the highest-value valid code.",
  },
  {
    q: "Does goCoupon show Meesho cashback offers too?",
    a: "Yes. Where available, goCoupon highlights cashback opportunities alongside coupon savings.",
  },
  {
    q: "Are Meesho coupons valid for every seller?",
    a: "No. Coupon eligibility depends on seller, category, cart value and campaign conditions.",
  },
] as const;

export const Route = createFileRoute("/meesho-coupons")({
  component: MeeshoCouponsPage,
  head: () =>
    createSeoHead({
      title: "Meesho Coupon Codes – Meesho Cashback & Offers",
      description:
        "Save more on Meesho with goCoupon. Auto-test and apply valid Meesho coupon codes at checkout and unlock available cashback offers.",
      path: "/meesho-coupons",
      keywords: "meesho coupon code, meesho promo code, meesho cashback offers, meesho discount code",
    }),
});

function MeeshoCouponsPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Meesho Coupons", path: "/meesho-coupons" },
  ]);
  const faq = faqSchema(faqs.map((f) => ({ question: f.q, answer: f.a })));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <SeoLandingPage
        eyebrow="Meesho deals and codes"
        title="Meesho coupon codes and cashback offers, automatically applied."
        description="goCoupon removes manual code hunting on Meesho by auto-testing valid coupons and choosing the best savings path at checkout."
        primaryCtaLabel="Install extension"
        primaryCtaTo="/extension"
        bullets={[
          "Finds valid Meesho coupons based on your cart.",
          "Reduces failed-code attempts and checkout delays.",
          "Helps identify stronger offers during peak sales.",
          "Simple flow: install once, save on every checkout.",
        ]}
        faqs={faqs.map((f) => ({ q: f.q, a: f.a }))}
        breadcrumb={[
          { name: "Home", path: "/" },
          { name: "Meesho Coupons", path: "/meesho-coupons" },
        ]}
      />
    </>
  );
}
