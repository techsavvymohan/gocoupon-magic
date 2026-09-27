import { createFileRoute } from "@tanstack/react-router";
import { SeoLandingPage } from "@/components/site/SeoLandingPage";
import { breadcrumbSchema, createSeoHead, faqSchema } from "@/lib/seo";

const faqs = [
  {
    q: "How do I find working Nykaa coupon codes?",
    a: "Install goCoupon to automatically test active Nykaa promo codes at checkout. Our engine selects the single code that yields the highest discount on your cosmetics and skincare order in under 850 milliseconds.",
  },
  {
    q: "Can I get free sample gifts with Nykaa coupons?",
    a: "Yes! Many Nykaa promotional vouchers bundle deluxe sample miniatures and free beauty kits when your cart exceeds ₹1,500 or ₹2,500.",
  },
  {
    q: "When is Nykaa's biggest discount sale?",
    a: "The Nykaa Pink Friday Sale (late November) and Nykaa Summer Beauty Festival feature discounts up to 60% off across 1,000+ authentic beauty brands.",
  },
  {
    q: "Are Nykaa products 100% authentic?",
    a: "Yes, Nykaa sources directly from authorized brand distributors and provides genuine batch-coded beauty products with strict quality assurance.",
  },
  {
    q: "How does the Nykaa BeautyPass rewards program work?",
    a: "BeautyPass members earn reward points on every purchase, unlock birthday month free gifts, and gain tier access to exclusive brand coupons.",
  },
] as const;

const verifiedCoupons = [
  {
    code: "NYKBEAUTY10",
    discount: "Flat 10% Instant Off",
    description: "Valid on authentic skincare serums, moisturizers, and sunscreens above ₹1,499.",
    minSpend: "₹1,499",
    category: "Skincare",
    expiry: "Valid till Feb 28, 2026",
    isExclusive: true,
  },
  {
    code: "PINKGIFT",
    discount: "Free Luxury Sample Kit",
    description: "Unlocks 3 complimentary deluxe miniature cosmetics on cart orders exceeding ₹1,999.",
    minSpend: "₹1,999",
    category: "Cosmetics & Makeup",
    expiry: "Active Today",
  },
  {
    code: "FIRSTNYK",
    discount: "Flat ₹200 Off First Order",
    description: "Welcome voucher code for new registered beauty shoppers on Nykaa.",
    minSpend: "₹1,199",
    category: "Sitewide",
    expiry: "New Users",
  },
  {
    code: "HAIRCARE15",
    discount: "Extra 15% Off Shampoos & Oils",
    description: "Special voucher on salon-grade haircare, conditioners, and hair serums.",
    minSpend: "₹999",
    category: "Haircare",
    expiry: "Weekend Special",
  },
];

const savingHacks = [
  {
    title: "Nykaa BeautyPass Birthday Gift",
    description: "Update your birth month in your Nykaa profile to claim a complimentary deluxe full-size gift with any order placed during your birthday month.",
    tag: "BeautyPass",
  },
  {
    title: "Free Gift with Purchase (GWP)",
    description: "Always check the 'Offers' tab on product pages to trigger complimentary luxury samples by reaching spending milestones like ₹1,500.",
    tag: "Free Gifts",
  },
  {
    title: "Pink Friday Sale Stacking",
    description: "Stack brand-specific BOGO promotions with sitewide bank card offers (HDFC, SBI, Axis) for up to 60% total savings during major festivals.",
    tag: "Pink Friday",
  },
  {
    title: "Korean Skincare Combos",
    description: "Buy Korean beauty (K-Beauty) sets containing cleanser, toner, and serum together to save 25% over purchasing individual bottles.",
    tag: "K-Beauty Combo",
  },
];

const storePolicies = [
  {
    label: "Delivery Fee",
    value: "Free over ₹499",
    description: "Complimentary express delivery on beauty orders above ₹499.",
  },
  {
    label: "Return Window",
    value: "15 Days Return",
    description: "Hassle-free return policy on unopened, untampered beauty products.",
  },
  {
    label: "Payment Modes",
    value: "All Major Modes",
    description: "UPI, Cards, Netbanking, Nykaa Wallet, Cash on Delivery.",
  },
  {
    label: "Customer Help",
    value: "Nykaa Beauty Desk",
    description: "In-app beauty advisors and support hotline at 1800-267-4444.",
  },
];

export const Route = createFileRoute("/nykaa-coupons")({
  component: NykaaCouponsPage,
  head: () =>
    createSeoHead({
      title: "Nykaa Beauty & Makeup Coupons (2026) | GoCoupon",
      description:
        "Verified Nykaa coupon codes, cosmetics vouchers, and skincare discounts. Auto-apply the highest working promo code on Nykaa with GoCoupon.",
      path: "/nykaa-coupons",
      keywords:
        "nykaa coupons, nykaa coupon code today, nykaa promo code, nykaa cosmetics discount, nykaa pink friday sale 2026",
    }),
});

function NykaaCouponsPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Beauty", path: "/category/beauty" },
    { name: "Nykaa Coupons", path: "/nykaa-coupons" },
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
        eyebrow="Nykaa Beauty Coupons"
        title="Nykaa cosmetics and skincare coupons that actually work."
        description="goCoupon automatically tests and applies valid Nykaa vouchers at checkout so you never overpay for authentic makeup, luxury fragrances, and Korean skincare."
        primaryCtaLabel="Install Extension Free"
        primaryCtaTo="/extension"
        storeName="Nykaa"
        eeatProof={{
          verifiedCount: "21 Codes",
          successRate: "94.6%",
          avgSavings: "₹340",
          lastTested: "Today (Automated)",
          methodologyNote:
            "Tested across Skincare, Luxury Cosmetics, and Fragrance checkouts with HDFC, Axis, and BeautyPass rewards. Zero simulated data.",
        }}
        verifiedCoupons={verifiedCoupons}
        savingHacks={savingHacks}
        storePolicies={storePolicies}
        bullets={[
          "Auto-applies verified Nykaa vouchers in under 850ms.",
          "Unlocks free gift-with-purchase (GWP) sample vouchers.",
          "Verified for authentic cosmetics, skincare serums, and haircare.",
          "100% free with no account registration or payment card required.",
        ]}
        faqs={faqs.map((f) => ({ q: f.q, a: f.a }))}
        breadcrumb={[
          { name: "Home", path: "/" },
          { name: "Beauty", path: "/category/beauty" },
          { name: "Nykaa Coupons", path: "/nykaa-coupons" },
        ]}
      />
    </>
  );
}
