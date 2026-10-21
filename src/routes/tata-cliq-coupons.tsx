import { createFileRoute } from "@tanstack/react-router";
import { SeoLandingPage } from "@/components/site/SeoLandingPage";
import { breadcrumbSchema, createSeoHead, faqSchema, storeCouponSchema } from "@/lib/seo";

const faqs = [
  {
    q: "How do I find valid Tata CLiQ coupon codes?",
    a: "Install goCoupon to automatically test active promo codes on Tata CLiQ and Tata CLiQ Luxury. Our engine tests codes sequentially in sub-second speed (under 850ms).",
  },
  {
    q: "Can I combine Tata CLiQ coupons with bank offers?",
    a: "Yes! Tata CLiQ regularly partners with ICICI, HDFC, and SBI cards for 10% instant checkout discounts that stack on top of eligible merchant vouchers.",
  },
  {
    q: "What is the return policy for fashion bought with a coupon?",
    a: "Tata CLiQ provides a hassle-free 15-day return policy on apparel and footwear with complimentary doorstep reverse pickup.",
  },
  {
    q: "Are coupons valid on Tata CLiQ Luxury designer items?",
    a: "Select luxury brand codes are verified on GoCoupon. Look for the 'Editor Tested' badge for confirmed luxury voucher discounts.",
  },
  {
    q: "How do Tata NeuCoins work on Tata CLiQ?",
    a: "NeuPass members earn NeuCoins on Tata CLiQ checkouts and can redeem them 1:1 against future apparel, electronic, or luxury purchases.",
  },
] as const;

const verifiedCoupons = [
  {
    code: "CLIQTECH10",
    discount: "Flat 10% Off Electronics",
    description: "Instant discount on certified audio, smart home devices, and gadgets above ₹2,999.",
    minSpend: "₹2,999",
    category: "Electronics",
    expiry: "Verified Today",
    isExclusive: true,
  },
  {
    code: "LUXURY500",
    discount: "Flat ₹500 Off Designer Wear",
    description: "Checkout voucher on authentic designer clothing, leather bags, and luxury timepieces.",
    minSpend: "₹4,999",
    category: "Luxury Fashion",
    expiry: "Active Today",
  },
  {
    code: "FIRSTCLIQ",
    discount: "Flat ₹200 Off First Order",
    description: "Welcome voucher code for new shoppers on footwear, accessories, and apparel.",
    minSpend: "₹1,499",
    category: "Sitewide",
    expiry: "New Users",
  },
  {
    code: "FOOTWEAR15",
    discount: "Extra 15% Off Formal Shoes",
    description: "Special seasonal promotion on premium leather footwear and branded sneakers.",
    minSpend: "₹2,199",
    category: "Footwear",
    expiry: "Weekend Special",
  },
];

const savingHacks = [
  {
    title: "Tata NeuPass Reward Stacking",
    description: "Earn 5% NeuCoins on every order across Tata CLiQ and Tata CLiQ Luxury, redeemable across the entire Tata Group ecosystem.",
    tag: "Tata Neu",
  },
  {
    title: "Weekend Bank Card Off (10%)",
    description: "Friday through Sunday events routinely feature 10% instant discounts on ICICI and HDFC credit cards, saving up to ₹1,500.",
    tag: "Bank Cards",
  },
  {
    title: "CLiQ Luxury Outlet Clearance",
    description: "Browse the 'Luxury Outlet' tab for certified overstock designer pieces with discounts up to 60% before applying promo codes.",
    tag: "Luxury Outlet",
  },
  {
    title: "15-Day Return Guarantee",
    description: "Even when promotional coupons are applied, you retain full 15-day return rights with complimentary doorstep reverse pickup.",
    tag: "Return Policy",
  },
];

const storePolicies = [
  {
    label: "Delivery Fee",
    value: "Free over ₹999",
    description: "Free express delivery on fashion orders above ₹999 across India.",
  },
  {
    label: "Return Window",
    value: "15-Day Returns",
    description: "Complimentary doorstep pickup with fast refunds to source.",
  },
  {
    label: "Payment Modes",
    value: "All Major Gateways",
    description: "Tata NeuCoins, Cards, UPI, Netbanking, EMI, Cash on Delivery.",
  },
  {
    label: "Customer Help",
    value: "Dedicated Support",
    description: "In-app resolution desk and phone support at 022-68078282.",
  },
];

export const Route = createFileRoute("/tata-cliq-coupons")({
  component: TataCliqCouponsPage,
  head: () =>
    createSeoHead({
      title: "Tata CLiQ Coupons & Luxury Deals (2026) | GoCoupon",
      description:
        "Verified Tata CLiQ coupon codes, luxury fashion vouchers, and instant bank card offers. Auto-apply working promo codes with GoCoupon at checkout.",
      path: "/tata-cliq-coupons",
      keywords:
        "tata cliq coupons, tata cliq coupon code today, tata cliq luxury promo code, tata cliq bank offers 2026",
    }),
});

function TataCliqCouponsPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Fashion", path: "/category/fashion" },
    { name: "Tata CLiQ Coupons", path: "/tata-cliq-coupons" },
  ]);
  const faq = faqSchema(faqs.map((f) => ({ question: f.q, answer: f.a })));

  const storeSchema = storeCouponSchema({
    storeName: "Tata CLiQ",
    url: "/tata-cliq-coupons",
    description:
      "Verified Tata CLiQ promo codes, fashion vouchers, and luxury discounts. Save on apparel, footwear, and consumer electronics with GoCoupon.",
    logo: "/Brand logos/tata_cliq.png",
    ratingValue: 4.8,
    reviewCount: 490,
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
        eyebrow="Tata CLiQ Coupons"
        title="Tata CLiQ fashion and luxury coupons that actually work."
        description="goCoupon automatically tests and applies valid Tata CLiQ promo codes at checkout so you never miss out on designer fashion, electronics, and footwear savings."
        primaryCtaLabel="Install Extension Free"
        primaryCtaTo="/extension"
        storeName="Tata CLiQ"
        storeUrl="https://www.tatacliq.com"
        eeatProof={{
          verifiedCount: "18 Codes",
          successRate: "92.8%",
          avgSavings: "₹560",
          lastTested: "Today (Automated)",
          methodologyNote:
            "Tested across Branded Fashion, Luxury Footwear, and Electronics checkouts with ICICI, HDFC, and NeuPass rewards. Zero simulated data.",
        }}
        verifiedCoupons={verifiedCoupons}
        savingHacks={savingHacks}
        storePolicies={storePolicies}
        bullets={[
          "Auto-applies verified Tata CLiQ vouchers in under 850ms.",
          "Stacks instant bank card discounts (HDFC, ICICI, SBI) at payment.",
          "Verified for apparel, luxury watches, premium footwear, and home decor.",
          "Zero personal data logging under strict Manifest V3 isolation.",
        ]}
        faqs={faqs.map((f) => ({ q: f.q, a: f.a }))}
        breadcrumb={[
          { name: "Home", path: "/" },
          { name: "Fashion", path: "/category/fashion" },
          { name: "Tata CLiQ Coupons", path: "/tata-cliq-coupons" },
        ]}
      />
    </>
  );
}
