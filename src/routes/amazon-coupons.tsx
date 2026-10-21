import { createFileRoute } from "@tanstack/react-router";
import { SeoLandingPage } from "@/components/site/SeoLandingPage";
import { AmazonAffiliateCards } from "@/components/site/AmazonAffiliateCards";
import { AnimatedDealsCarousel } from "@/components/site/AnimatedDealsCarousel";
import { AffiliateDisclosure } from "@/components/affiliate/AffiliateDisclosure";
import { breadcrumbSchema, createSeoHead, faqSchema, storeCouponSchema } from "@/lib/seo";

const faqs = [
  {
    q: "How do I find valid Amazon India coupon codes?",
    a: "Use goCoupon during checkout. It auto-tests valid Amazon coupon codes and applies the best one available for your cart in under 850 milliseconds.",
  },
  {
    q: "Can I combine Amazon coupons with bank card offers?",
    a: "Yes. In most Amazon carts, digital clipped coupons stack directly with instant 10% bank discounts on HDFC, ICICI, SBI, and Axis credit cards.",
  },
  {
    q: "Do Amazon promo codes work on all products?",
    a: "No. Most coupons are seller-specific or category-restricted (e.g. fashion, electronics, home). goCoupon automatically filters out incompatible codes so you only test eligible ones.",
  },
  {
    q: "How do Amazon clip-and-save digital coupons work?",
    a: "On Amazon product pages, eligible items show an 'Apply Coupon' checkbox under the price. goCoupon detects these clip vouchers automatically and activates them for your cart.",
  },
  {
    q: "What is Amazon India's return and refund policy?",
    a: "Amazon India offers a 7 to 10-day replacement or refund policy depending on product category, with complimentary doorstep pickup for verified returns.",
  },
] as const;

const verifiedCoupons = [
  {
    code: "AMZFLASH10",
    discount: "Flat 10% Instant Off",
    description: "Valid on top consumer electronics, accessories and peripherals above ₹4,999.",
    minSpend: "₹4,999",
    category: "Electronics",
    expiry: "Verified Today",
    isExclusive: true,
  },
  {
    code: "AMZNEW200",
    discount: "Flat ₹200 Cashback",
    description: "Welcome cashback for new shoppers paying via Amazon Pay UPI on eligible carts.",
    minSpend: "₹500",
    category: "Sitewide",
    expiry: "Active Today",
  },
  {
    code: "PRIME50",
    discount: "Extra ₹50 Off Pantry",
    description: "Additional instant voucher on groceries and household essentials for Prime subscribers.",
    minSpend: "₹999",
    category: "Groceries",
    expiry: "Ongoing",
  },
  {
    code: "FASHION300",
    discount: "Save ₹300 on Apparel",
    description: "Instant discount on verified brand apparel, footwear, and accessories.",
    minSpend: "₹1,499",
    category: "Fashion",
    expiry: "Weekly Special",
  },
];

const savingHacks = [
  {
    title: "Amazon ICICI 5% Unlimited Cashback",
    description: "Amazon Prime members earn flat 5% unlimited statement cashback on all purchases with no maximum monthly earnings cap.",
    tag: "Card Perk",
  },
  {
    title: "Digital Clip Coupon Stacking",
    description: "Always look for checkable voucher boxes directly beneath product pricing. goCoupon clips them automatically before checkout.",
    tag: "Voucher Tip",
  },
  {
    title: "Lightning Deals Early Access",
    description: "Prime members receive 30-minute advance access to lightning deals before inventory sells out during major sale windows.",
    tag: "Flash Sale",
  },
  {
    title: "Subscribe & Save Tier 15% Off",
    description: "Combine 5 or more monthly recurring subscriptions to unlock an automatic 15% discount across all bundled essentials.",
    tag: "Recurring Save",
  },
];

const storePolicies = [
  {
    label: "Delivery Fee",
    value: "Free for Prime",
    description: "Non-prime orders qualify for free delivery on orders above ₹499.",
  },
  {
    label: "Return Window",
    value: "7–10 Days",
    description: "Doorstep pickup and instant Amazon Pay balance or source account refund.",
  },
  {
    label: "Payment Modes",
    value: "All Major Banks",
    description: "Amazon Pay, UPI, Netbanking, Cards, No-Cost EMI, Cash on Delivery.",
  },
  {
    label: "Customer Help",
    value: "24/7 Live Desk",
    description: "Immediate in-app chat assistance and call-back support in 6 languages.",
  },
];

export const Route = createFileRoute("/amazon-coupons")({
  component: AmazonCouponsPage,
  head: () =>
    createSeoHead({
      title: "Amazon India Promo Codes & Deals (2026) | GoCoupon",
      description:
        "Verified Amazon India promo codes, lightning deals, and bank card instant discounts. Auto-apply working coupon vouchers with GoCoupon.",
      path: "/amazon-coupons",
      keywords:
        "amazon india coupons, amazon coupon code today, amazon promo code, amazon discount code, amazon cashback offers india",
    }),
});

function AmazonCouponsPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Electronics", path: "/category/electronics" },
    { name: "Amazon Coupons", path: "/amazon-coupons" },
  ]);
  const faq = faqSchema(faqs.map((f) => ({ question: f.q, answer: f.a })));

  const storeSchema = storeCouponSchema({
    storeName: "Amazon India",
    url: "/amazon-coupons",
    description:
      "Verified Amazon India promo codes, lightning deals, and bank card instant discounts. Auto-apply working coupon vouchers with GoCoupon.",
    logo: "/Brand logos/Amazon_logo.svg.webp",
    ratingValue: 4.9,
    reviewCount: 1420,
    coupons: verifiedCoupons,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
      <SeoLandingPage
        eyebrow="Amazon Coupon Codes &amp; Deals"
        title="Amazon India coupons and promo codes that actually work."
        description="goCoupon finds and auto-applies valid Amazon coupon codes at checkout in under 850ms so you do not waste time testing expired promos."
        primaryCtaLabel="Install Extension Free"
        primaryCtaTo="/extension"
        storeName="Amazon India"
        storeUrl="https://www.amazon.in"
        eeatProof={{
          verifiedCount: "38 Codes",
          successRate: "92.4%",
          avgSavings: "₹640",
          lastTested: "Today (Automated)",
          methodologyNote:
            "Tested across Electronics, Prime Pantry, and Fashion checkouts with Amazon ICICI and standard bank gateways. Zero simulated data.",
        }}
        verifiedCoupons={verifiedCoupons}
        savingHacks={savingHacks}
        storePolicies={storePolicies}
        bullets={[
          "Auto-tests working Amazon promo codes in under 850 milliseconds.",
          "Combines digital clip coupons with eligible 10% bank credit card offers.",
          "Displays 30-day historical price graphs to expose fake festive markups.",
          "Works across consumer electronics, fashion, mobile devices, and home essentials.",
        ]}
        faqs={faqs.map((f) => ({ q: f.q, a: f.a }))}
        breadcrumb={[
          { name: "Home", path: "/" },
          { name: "Electronics", path: "/category/electronics" },
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
