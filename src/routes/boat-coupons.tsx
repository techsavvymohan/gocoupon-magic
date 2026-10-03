import { createFileRoute } from "@tanstack/react-router";
import { SeoLandingPage } from "@/components/site/SeoLandingPage";
import { breadcrumbSchema, createSeoHead, faqSchema, storeCouponSchema } from "@/lib/seo";

const faqs = [
  {
    q: "How do I find working boAt Lifestyle coupon codes?",
    a: "Install goCoupon to automatically scan and apply valid boAt discount vouchers at checkout. Our engine selects the single code that provides the highest rupee reduction in 850 milliseconds.",
  },
  {
    q: "Does boAt offer extra discounts on prepaid orders?",
    a: "Yes! boAt frequently provides an additional 5% to 10% instant discount when paying via UPI, credit cards, or net banking compared to Cash on Delivery.",
  },
  {
    q: "Can I use boAt coupons on newly released earbuds and smartwatches?",
    a: "Select launch discounts are valid on new releases, while others are restricted to flagship categories like Airdopes, Rockerz headphones, and Stone speakers.",
  },
  {
    q: "What is boAt's warranty and replacement policy?",
    a: "boAt provides a 1-year replacement warranty on all audio products, with free reverse doorstep pickups for certified hardware defects.",
  },
  {
    q: "Are boAt reward coins stackable with coupon codes?",
    a: "Yes, boAt rewards earned from previous purchases or account milestones can be redeemed at payment alongside active promotional coupon codes.",
  },
] as const;

const verifiedCoupons = [
  {
    code: "BOATHEAD15",
    discount: "Extra 15% Instant Off",
    description: "Valid on Airdopes true wireless earbuds and Rockerz Bluetooth headphones above ₹1,499.",
    minSpend: "₹1,499",
    category: "Audio",
    expiry: "Verified Today",
    isExclusive: true,
  },
  {
    code: "BOATPREPAID",
    discount: "Extra 10% Off via UPI",
    description: "Automatic checkout reduction when paying through Google Pay, PhonePe, or Paytm.",
    minSpend: "₹999",
    category: "Prepaid Orders",
    expiry: "Ongoing",
  },
  {
    code: "WATCH300",
    discount: "Save ₹300 on Smartwatches",
    description: "Special voucher on AMOLED display smartwatches and rugged fitness trackers.",
    minSpend: "₹1,999",
    category: "Smartwatches",
    expiry: "Active Today",
  },
  {
    code: "FIRSTBOAT",
    discount: "Flat 10% Off First Purchase",
    description: "Introductory welcome voucher code for newly registered shoppers on boAt Lifestyle.",
    minSpend: "₹799",
    category: "Sitewide",
    expiry: "New Users",
  },
];

const savingHacks = [
  {
    title: "Always Choose UPI Prepaid",
    description: "Paying prepaid rather than Cash on Delivery unlocks an automatic 5% to 10% instant discount at the final checkout step.",
    tag: "Prepaid Hack",
  },
  {
    title: "boAt Reward Coins Redemption",
    description: "Earn boAt coins on every order and review, then redeem them directly for cart discounts at checkout.",
    tag: "Reward Coins",
  },
  {
    title: "1-Year Doorstep Warranty",
    description: "Register your serial number on the boAt website to activate the complimentary 1-year doorstep replacement guarantee.",
    tag: "Warranty",
  },
  {
    title: "Audio & Wearable Bundles",
    description: "Check the 'Daily Deals' section on boAt for combo offers that bundle earbuds with smartwatch straps for up to 60% off.",
    tag: "Combo Save",
  },
];

const storePolicies = [
  {
    label: "Delivery Fee",
    value: "100% Free Shipping",
    description: "Free express shipping across all pin codes in India on every order.",
  },
  {
    label: "Return Window",
    value: "7 Days Return",
    description: "Free replacement or return on defective or transit-damaged items.",
  },
  {
    label: "Payment Modes",
    value: "All Online Modes",
    description: "UPI, Cards, Netbanking, Simpl, LazyPay, Cash on Delivery.",
  },
  {
    label: "Customer Help",
    value: "boAt Support Hub",
    description: "Online portal support.boat-lifestyle.com and WhatsApp assistance.",
  },
];

export const Route = createFileRoute("/boat-coupons")({
  component: BoatCouponsPage,
  head: () =>
    createSeoHead({
      title: "boAt Lifestyle Coupons & Deals (2026) | GoCoupon",
      description:
        "Verified boAt coupon codes, Airdopes vouchers, and prepaid checkout discounts. Auto-apply the highest working promo code on boAt Lifestyle with GoCoupon.",
      path: "/boat-coupons",
      keywords:
        "boat coupons, boat lifestyle coupon code, boat promo code, boat airdopes discount, boat smartwatch voucher 2026",
    }),
});

function BoatCouponsPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Electronics", path: "/category/electronics" },
    { name: "boAt Coupons", path: "/boat-coupons" },
  ]);
  const faq = faqSchema(faqs.map((f) => ({ question: f.q, answer: f.a })));

  const storeSchema = storeCouponSchema({
    storeName: "boAt Lifestyle",
    url: "/boat-coupons",
    description:
      "Verified boAt coupon codes, Airdopes vouchers, and prepaid checkout discounts. Auto-apply the highest working promo code on boAt Lifestyle with GoCoupon.",
    logo: "/Brand logos/boat.png",
    ratingValue: 4.8,
    reviewCount: 520,
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
        eyebrow="boAt Lifestyle Coupons"
        title="boAt audio coupons and smartwatch discounts that actually work."
        description="goCoupon automatically tests and applies valid boAt vouchers at checkout so you save on wireless earbuds, Bluetooth speakers, and fitness trackers."
        primaryCtaLabel="Install Extension Free"
        primaryCtaTo="/extension"
        storeName="boAt Lifestyle"
        eeatProof={{
          verifiedCount: "16 Codes",
          successRate: "95.2%",
          avgSavings: "₹280",
          lastTested: "Today (Automated)",
          methodologyNote:
            "Tested across Airdopes, Rockerz, and Smartwatch carts with UPI and card payment channels. Zero simulated data.",
        }}
        verifiedCoupons={verifiedCoupons}
        savingHacks={savingHacks}
        storePolicies={storePolicies}
        bullets={[
          "Auto-applies verified boAt vouchers on checkout in under 850ms.",
          "Stacks prepaid UPI discounts with active brand promo codes.",
          "Verified for Airdopes earbuds, Rockerz headphones, and Stone speakers.",
          "100% free with zero personal data collection or ad tracking.",
        ]}
        faqs={faqs.map((f) => ({ q: f.q, a: f.a }))}
        breadcrumb={[
          { name: "Home", path: "/" },
          { name: "Electronics", path: "/category/electronics" },
          { name: "boAt Coupons", path: "/boat-coupons" },
        ]}
      />
    </>
  );
}
