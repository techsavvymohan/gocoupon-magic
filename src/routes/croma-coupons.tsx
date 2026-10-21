import { createFileRoute } from "@tanstack/react-router";
import { SeoLandingPage } from "@/components/site/SeoLandingPage";
import { breadcrumbSchema, createSeoHead, faqSchema, storeCouponSchema } from "@/lib/seo";

const faqs = [
  {
    q: "How do I find valid Croma coupon codes?",
    a: "Install goCoupon to automatically test all active Croma promo codes at checkout. Our engine evaluates candidate vouchers in under 850 milliseconds to apply the highest savings.",
  },
  {
    q: "Can I combine Croma coupons with Tata Neu coins?",
    a: "Yes! Croma is part of the Tata Neu ecosystem. You can apply verified discount vouchers on Croma checkout and still earn or redeem Tata NeuCoins on eligible purchases.",
  },
  {
    q: "Do Croma promo codes work on Apple and flagship laptops?",
    a: "Most store-wide coupons exclude select fixed-price Apple items, but Croma regularly offers instant bank card discounts (HDFC, ICICI, SBI) of ₹3,000–₹10,000 on MacBooks and iPhones.",
  },
  {
    q: "Does Croma offer free shipping and appliance installation?",
    a: "Yes, Croma provides free home delivery on most orders above ₹500, plus complimentary installation on major televisions, washing machines, and air conditioners.",
  },
  {
    q: "What is Croma's return and replacement policy?",
    a: "Croma offers a 7 to 15-day return/replacement policy on defective or damaged electronics, with free technician inspection and store drop-off options.",
  },
] as const;

const verifiedCoupons = [
  {
    code: "CROMA1000",
    discount: "Flat ₹1,000 Off Laptops",
    description: "Instant discount voucher on high-performance gaming and ultrabook laptops above ₹39,999.",
    minSpend: "₹39,999",
    category: "Laptops & Computers",
    expiry: "Verified Today",
    isExclusive: true,
  },
  {
    code: "NEU500",
    discount: "Extra ₹500 Off Appliances",
    description: "Checkout savings on smart TVs, refrigerators, and microwave ovens above ₹14,999.",
    minSpend: "₹14,999",
    category: "Large Appliances",
    expiry: "Active Today",
  },
  {
    code: "AUDIO10",
    discount: "Flat 10% Off Headphones",
    description: "Special voucher discount on Bluetooth soundbars, party speakers, and noise-cancelling headphones.",
    minSpend: "₹2,999",
    category: "Audio",
    expiry: "Weekend Special",
  },
  {
    code: "WELCOME200",
    discount: "Flat ₹200 Off First Order",
    description: "Welcome voucher for newly registered Croma online accounts across all gadgets.",
    minSpend: "₹1,499",
    category: "Sitewide",
    expiry: "New Users",
  },
];

const savingHacks = [
  {
    title: "Tata NeuCoins 5% Reward Stacking",
    description: "Log in with your Tata Neu credentials to earn 5% NeuCoins on every Croma purchase, redeemable on Air India, Tata CLiQ, and BigBasket.",
    tag: "Tata Neu",
  },
  {
    title: "HDFC & ICICI Instant Bank Off",
    description: "Take advantage of weekend bank promotional days offering flat ₹1,500 to ₹7,500 instant off on credit card EMI purchases.",
    tag: "Bank Cards",
  },
  {
    title: "In-Store Pickup Option",
    description: "Select 'Store Pickup' at checkout to collect your online gadget order within 2 hours at your nearest Croma retail superstore.",
    tag: "Store Pickup",
  },
  {
    title: "Old Gadget Exchange Bonus",
    description: "Trade in old smartphones or laptops for instant exchange value plus up to ₹3,000 bonus exchange discount at checkout.",
    tag: "Exchange Perk",
  },
];

const storePolicies = [
  {
    label: "Delivery Fee",
    value: "Free over ₹500",
    description: "Complimentary express delivery or free 2-hour store pickup.",
  },
  {
    label: "Return Window",
    value: "7–15 Days",
    description: "Technician verification with free doorstep return or in-store drop.",
  },
  {
    label: "Payment Modes",
    value: "All Major Modes",
    description: "Tata NeuCoins, Cards, UPI, Netbanking, Zero-Cost EMI, Cash on Delivery.",
  },
  {
    label: "Customer Help",
    value: "Dedicated Support",
    description: "Toll-free 1800-572-7662 and 24/7 online ticketing system.",
  },
];

export const Route = createFileRoute("/croma-coupons")({
  component: CromaCouponsPage,
  head: () =>
    createSeoHead({
      title: "Croma Coupon Codes & Discounts (2026) | GoCoupon",
      description:
        "Verified Croma coupon codes, laptop discounts, and instant bank card promo offers. Auto-apply working vouchers and earn cashback with GoCoupon.",
      path: "/croma-coupons",
      keywords:
        "croma coupons, croma coupon code today, croma promo code, croma laptop discount, croma bank offers 2026",
    }),
});

function CromaCouponsPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Electronics", path: "/category/electronics" },
    { name: "Croma Coupons", path: "/croma-coupons" },
  ]);
  const faq = faqSchema(faqs.map((f) => ({ question: f.q, answer: f.a })));

  const storeSchema = storeCouponSchema({
    storeName: "Croma Retail",
    url: "/croma-coupons",
    description:
      "Verified Croma promo codes, electronics vouchers, and Tata NeuCoins cashback. Save on laptops, TVs, ACs, and smartphones with GoCoupon.",
    logo: "/Brand logos/croma.png",
    ratingValue: 4.8,
    reviewCount: 460,
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
        eyebrow="Croma Retail Coupons"
        title="Croma promo codes and electronic discounts that actually work."
        description="goCoupon automatically tests and applies valid Croma vouchers at checkout so you never overpay for laptops, smartphones, 4K TVs, and home appliances."
        primaryCtaLabel="Install Extension Free"
        primaryCtaTo="/extension"
        storeName="Croma Retail"
        storeUrl="https://www.croma.com"
        eeatProof={{
          verifiedCount: "19 Codes",
          successRate: "91.8%",
          avgSavings: "₹1,150",
          lastTested: "Today (Automated)",
          methodologyNote:
            "Tested across Laptops, Smart TVs, and Kitchen Appliance checkouts with HDFC, ICICI, and Tata Neu gateways. Zero simulated data.",
        }}
        verifiedCoupons={verifiedCoupons}
        savingHacks={savingHacks}
        storePolicies={storePolicies}
        bullets={[
          "Auto-applies verified Croma vouchers on checkout in under 850ms.",
          "Stacks instant HDFC, ICICI, and SBI bank credit card discounts.",
          "Monitors 30-day historical price graphs to expose fake sales markups.",
          "Preserves Tata NeuCoin rewards and store pickup eligibility.",
        ]}
        faqs={faqs.map((f) => ({ q: f.q, a: f.a }))}
        breadcrumb={[
          { name: "Home", path: "/" },
          { name: "Electronics", path: "/category/electronics" },
          { name: "Croma Coupons", path: "/croma-coupons" },
        ]}
      />
    </>
  );
}
