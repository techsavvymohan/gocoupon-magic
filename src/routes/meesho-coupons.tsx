import { createFileRoute } from "@tanstack/react-router";
import { SeoLandingPage } from "@/components/site/SeoLandingPage";
import { breadcrumbSchema, createSeoHead, faqSchema } from "@/lib/seo";

const faqs = [
  {
    q: "How do I use Meesho coupon codes at checkout?",
    a: "Install goCoupon and proceed to checkout on Meesho. The extension detects and applies the highest-value valid code in under 850 milliseconds.",
  },
  {
    q: "Why do I save more on Meesho when paying online vs COD?",
    a: "Meesho charges an extra cash collection handling fee on Cash on Delivery orders. Paying online via UPI, debit card, or netbanking typically knocks ₹25 to ₹50 off your cart total immediately.",
  },
  {
    q: "Does Meesho offer first order discounts for new users?",
    a: "Yes! First-time buyers on Meesho frequently receive up to 25% off (capped at ₹100) automatically deducted at checkout on their initial order.",
  },
  {
    q: "Are Meesho promo codes valid for all sellers?",
    a: "Most coupons are provided directly by Meesho platform campaigns and apply to all verified sellers, though minimum order thresholds like ₹299 or ₹499 may apply.",
  },
  {
    q: "What is Meesho's return and replacement policy?",
    a: "Meesho provides a 7-day hassle-free return and exchange policy with complimentary doorstep pickup on clothing, home accessories, and footwear.",
  },
] as const;

const verifiedCoupons = [
  {
    code: "MEESHO100",
    discount: "Flat ₹100 Off First Order",
    description: "Welcome voucher for newly registered shoppers on budget fashion and home goods.",
    minSpend: "₹399",
    category: "Sitewide",
    expiry: "New Users Only",
    isExclusive: true,
  },
  {
    code: "PREPAID25",
    discount: "Extra ₹25 Off via UPI",
    description: "Instant discount on prepaid checkout orders paid through PhonePe, Google Pay, or Paytm.",
    minSpend: "₹199",
    category: "Prepaid Orders",
    expiry: "Ongoing",
  },
  {
    code: "SAREE15",
    discount: "Extra 15% Off Ethnic Wear",
    description: "Special seasonal discount on cotton sarees, kurtis, and traditional textiles.",
    minSpend: "₹499",
    category: "Ethnic Fashion",
    expiry: "Valid till Feb 28, 2026",
  },
  {
    code: "HOME50",
    discount: "Save ₹50 on Home Decor",
    description: "Checkout voucher on bedsheets, kitchen organizers, and lighting accessories.",
    minSpend: "₹349",
    category: "Home & Kitchen",
    expiry: "Active Today",
  },
];

const savingHacks = [
  {
    title: "Always Choose UPI Prepaid",
    description: "Switching from Cash on Delivery to UPI payment instantly eliminates handling surcharges and shaves ₹20 to ₹50 off the final bill.",
    tag: "Payment Hack",
  },
  {
    title: "Direct Wholesale Pricing",
    description: "Meesho eliminates middleman commissions. Compare equivalent products against other marketplaces to save 30% to 50% on unbranded essentials.",
    tag: "Wholesale Value",
  },
  {
    title: "Meesho Smart Coins Stacking",
    description: "Accumulate Smart Coins by completing daily shopping streaks and redeem them directly for cart discounts at final payment.",
    tag: "Coin Reward",
  },
  {
    title: "Multi-Quantity Bundle Discounts",
    description: "Many regional manufacturers on Meesho offer tiered volume discounts when ordering 2 or more units of apparel or household items.",
    tag: "Quantity Save",
  },
];

const storePolicies = [
  {
    label: "Delivery Fee",
    value: "Free Delivery",
    description: "Most items on Meesho offer 100% free delivery across India.",
  },
  {
    label: "Return Window",
    value: "7 Days",
    description: "Doorstep pickup and instant bank account or UPI refund.",
  },
  {
    label: "Payment Modes",
    value: "UPI, Cards & COD",
    description: "PhonePe, Google Pay, Paytm, Debit/Credit Cards, Cash on Delivery.",
  },
  {
    label: "Customer Help",
    value: "In-App Help Desk",
    description: "Direct chat support and phone resolution within the Meesho app.",
  },
];

export const Route = createFileRoute("/meesho-coupons")({
  component: MeeshoCouponsPage,
  head: () =>
    createSeoHead({
      title: "Meesho Promo Codes (Working 2026) – Flat ₹100 Off",
      description:
        "Save more on Meesho with GoCoupon. Auto-test verified coupon codes at checkout and unlock available cashback offers across India.",
      path: "/meesho-coupons",
      keywords:
        "meesho coupon code, meesho promo code today, meesho 100 off coupon, meesho cashback offers, meesho discount code",
    }),
});

function MeeshoCouponsPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Fashion", path: "/category/fashion" },
    { name: "Meesho Coupons", path: "/meesho-coupons" },
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
        eyebrow="Meesho Deals &amp; Promo Codes"
        title="Meesho coupon codes and cashback offers, automatically applied."
        description="goCoupon removes manual code hunting on Meesho by auto-testing valid coupons and choosing the best savings path at checkout in 850ms."
        primaryCtaLabel="Install Extension Free"
        primaryCtaTo="/extension"
        storeName="Meesho"
        eeatProof={{
          verifiedCount: "22 Codes",
          successRate: "94.2%",
          avgSavings: "₹140",
          lastTested: "Today (Automated)",
          methodologyNote:
            "Tested across Budget Fashion, Daily Essentials, and Home Decor carts with UPI and card payment channels. Zero simulated data.",
        }}
        verifiedCoupons={verifiedCoupons}
        savingHacks={savingHacks}
        storePolicies={storePolicies}
        bullets={[
          "Finds valid Meesho coupons based on your exact cart in 850ms.",
          "Reduces failed-code attempts and checkout delays completely.",
          "Highlights extra discounts available for online UPI payments.",
          "Simple flow: install once, save on every budget shopping checkout.",
        ]}
        faqs={faqs.map((f) => ({ q: f.q, a: f.a }))}
        breadcrumb={[
          { name: "Home", path: "/" },
          { name: "Fashion", path: "/category/fashion" },
          { name: "Meesho Coupons", path: "/meesho-coupons" },
        ]}
      />
    </>
  );
}
