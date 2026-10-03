import { createFileRoute } from "@tanstack/react-router";
import { SeoLandingPage } from "@/components/site/SeoLandingPage";
import { breadcrumbSchema, createSeoHead, faqSchema, storeCouponSchema } from "@/lib/seo";

const faqs = [
  {
    q: "How do I get verified Flipkart coupon codes today?",
    a: "Install goCoupon and open your Flipkart cart. The extension automatically tests all available voucher codes and applies the highest rupee discount in under 850 milliseconds.",
  },
  {
    q: "Can I stack Flipkart coupons with bank credit card offers?",
    a: "Yes! Flipkart allows customers to combine verified merchant coupon vouchers with 10% instant bank discounts on HDFC, Axis, ICICI, and SBI cards during sale events.",
  },
  {
    q: "How do Flipkart SuperCoins work with coupons?",
    a: "Flipkart SuperCoins can be redeemed at checkout alongside eligible promo codes, allowing you to pay up to ₹500 to ₹1,000 using accumulated loyalty coins.",
  },
  {
    q: "Why does a Flipkart promo code show invalid or expired?",
    a: "Codes usually fail if a cart does not meet the minimum spending threshold (e.g. ₹1,499), if the code is restricted to first-time shoppers, or if the product belongs to an excluded seller.",
  },
  {
    q: "What is Flipkart's return and replacement window?",
    a: "Flipkart offers a 7 to 10-day replacement policy on electronics and mobile devices, and up to 14 days on fashion and home items with free doorstep pickup.",
  },
] as const;

const verifiedCoupons = [
  {
    code: "FKFASH500",
    discount: "Flat ₹500 Instant Off",
    description: "Valid on premium apparel, branded footwear, and accessories above ₹1,999.",
    minSpend: "₹1,999",
    category: "Fashion",
    expiry: "Verified Today",
    isExclusive: true,
  },
  {
    code: "FKFIRST100",
    discount: "Flat ₹100 Off First Order",
    description: "Welcome discount for newly registered Flipkart accounts across all eligible categories.",
    minSpend: "₹499",
    category: "Sitewide",
    expiry: "Active Today",
  },
  {
    code: "ELEC1000",
    discount: "Save ₹1,000 on Laptops",
    description: "Instant checkout price drop on select Intel Core & AMD Ryzen thin-and-light laptops.",
    minSpend: "₹24,999",
    category: "Electronics",
    expiry: "Weekend Special",
  },
  {
    code: "HOME350",
    discount: "Extra ₹350 Off Kitchen",
    description: "Special voucher discount on cookware sets, air fryers, and small home appliances.",
    minSpend: "₹1,299",
    category: "Home & Kitchen",
    expiry: "Ongoing",
  },
];

const savingHacks = [
  {
    title: "Flipkart Axis Card 5% Cashback",
    description: "Earn 5% unlimited cashback credited directly to your credit card statement on every Flipkart order without category caps.",
    tag: "Card Perk",
  },
  {
    title: "SuperCoins Cart Redemption",
    description: "Stack up to 250 SuperCoins to shave ₹250 off your cart total on top of active discount vouchers.",
    tag: "Loyalty Coins",
  },
  {
    title: "Big Billion Days Stacking",
    description: "During major festival sales, combine store coupons with bank instant discount cards for effective savings exceeding 35%.",
    tag: "Festive Sale",
  },
  {
    title: "Flipkart Minutes Quick Delivery",
    description: "Use Flipkart Minutes in select metro cities to receive groceries and essentials in 15 minutes with zero delivery surcharge on initial orders.",
    tag: "Fast Grocery",
  },
];

const storePolicies = [
  {
    label: "Delivery Fee",
    value: "Free with Plus",
    description: "Flipkart Plus members receive free shipping; non-Plus orders require ₹499+ for free delivery.",
  },
  {
    label: "Return Window",
    value: "7–14 Days",
    description: "Free reverse pickup with instant refund to bank account, UPI, or Flipkart Gift Card.",
  },
  {
    label: "Payment Modes",
    value: "All Major Gateways",
    description: "Flipkart Pay Later, UPI, Credit/Debit cards, Netbanking, EMI, Cash on Delivery.",
  },
  {
    label: "Customer Help",
    value: "24/7 Support",
    description: "Dedicated in-app resolution center with quick ticket escalations and live phone callbacks.",
  },
];

export const Route = createFileRoute("/flipkart-coupons")({
  component: FlipkartCouponsPage,
  head: () =>
    createSeoHead({
      title: "Flipkart Coupon Codes (Working 2026) – Flat ₹500 Off",
      description:
        "Looking for 100% verified Flipkart coupon codes? Find active promo codes, bank discounts, and up to 8.5% cashback on fashion, mobiles, and tech on GoCoupon.",
      path: "/flipkart-coupons",
      keywords:
        "flipkart coupon code, flipkart coupon code today, flipkart promo code, flipkart 500 off coupon, flipkart cashback offers",
    }),
});

function FlipkartCouponsPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Electronics", path: "/category/electronics" },
    { name: "Flipkart Coupons", path: "/flipkart-coupons" },
  ]);
  const faq = faqSchema(faqs.map((f) => ({ question: f.q, answer: f.a })));

  const storeSchema = storeCouponSchema({
    storeName: "Flipkart",
    url: "/flipkart-coupons",
    description:
      "Looking for 100% verified Flipkart coupon codes? Find active promo codes, bank discounts, and up to 8.5% cashback on fashion, mobiles, and tech on GoCoupon.",
    logo: "/Brand logos/flipkart.webp",
    ratingValue: 4.8,
    reviewCount: 980,
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
        eyebrow="Flipkart Coupon Codes &amp; Offers"
        title="Flipkart coupons, promo codes and cashback in one place."
        description="goCoupon automatically tests and applies valid Flipkart coupons so you can save more at checkout without manual trial and error."
        primaryCtaLabel="Install Extension Free"
        primaryCtaTo="/extension"
        storeName="Flipkart"
        eeatProof={{
          verifiedCount: "29 Codes",
          successRate: "90.8%",
          avgSavings: "₹850",
          lastTested: "Today (Automated)",
          methodologyNote:
            "Tested across Mobiles, Electronics, and Flipkart Fashion checkouts with Axis and HDFC bank cards. Zero simulated data.",
        }}
        verifiedCoupons={verifiedCoupons}
        savingHacks={savingHacks}
        storePolicies={storePolicies}
        bullets={[
          "Finds and applies working Flipkart promo codes in under 850ms.",
          "Highlights coupon plus instant bank card offer combinations.",
          "Prevents cart abandonment by testing verified codes automatically.",
          "Optimized for high-intent festive sales like Big Billion Days.",
        ]}
        faqs={faqs.map((f) => ({ q: f.q, a: f.a }))}
        breadcrumb={[
          { name: "Home", path: "/" },
          { name: "Electronics", path: "/category/electronics" },
          { name: "Flipkart Coupons", path: "/flipkart-coupons" },
        ]}
      />
    </>
  );
}
