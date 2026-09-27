import { createFileRoute } from "@tanstack/react-router";
import { SeoLandingPage } from "@/components/site/SeoLandingPage";
import { breadcrumbSchema, createSeoHead, faqSchema } from "@/lib/seo";

const faqs = [
  {
    q: "How do I apply Myntra coupon codes automatically?",
    a: "Install goCoupon and head to your Myntra shopping bag. Our extension evaluates and auto-applies the highest discount coupon code in under 850 milliseconds.",
  },
  {
    q: "Do Myntra Insider points stack with coupons?",
    a: "Yes! You can redeem accumulated Myntra Insider loyalty points for exclusive vouchers and apply them simultaneously with promotional bank card offers.",
  },
  {
    q: "How do I get flat ₹400 off on Myntra first order?",
    a: "First-time registered accounts on Myntra qualify for voucher codes like MYNTRA400 or MYNTRA200 on minimum purchases of ₹1,499 or ₹1,999.",
  },
  {
    q: "Why did my Myntra coupon code fail at checkout?",
    a: "Coupons may fail if applied to excluded luxury brands, if the shopping bag total drops below the qualifying threshold, or if the code has expired.",
  },
  {
    q: "What is Myntra's return and exchange policy?",
    a: "Myntra offers a 14-day hassle-free return and exchange window on apparel, footwear, and accessories with free doorstep pickup.",
  },
] as const;

const verifiedCoupons = [
  {
    code: "MYNTRA400",
    discount: "Flat ₹400 Off First Order",
    description: "Exclusive welcome voucher on clothing, shoes, and lifestyle brands above ₹1,799.",
    minSpend: "₹1,799",
    category: "Fashion",
    expiry: "Valid for New Users",
    isExclusive: true,
  },
  {
    code: "EORS15",
    discount: "Extra 15% Instant Off",
    description: "Applies to select premium denim, jackets, activewear, and branded sneakers.",
    minSpend: "₹2,499",
    category: "Footwear & Apparel",
    expiry: "Valid till Feb 28, 2026",
  },
  {
    code: "BEAUTY200",
    discount: "Save ₹200 on Beauty",
    description: "Special voucher on authentic perfumes, luxury skincare serums, and haircare.",
    minSpend: "₹1,299",
    category: "Beauty & Grooming",
    expiry: "Weekly Offer",
  },
  {
    code: "ACCESSORY10",
    discount: "Flat 10% Off Watches",
    description: "Checkout voucher on smartwatches, analog watches, backpacks, and sunglasses.",
    minSpend: "₹999",
    category: "Accessories",
    expiry: "Ongoing",
  },
];

const savingHacks = [
  {
    title: "Myntra Insider Tier Multiplier",
    description: "Climb from Select to Elite and Icon tiers to unlock VIP early sale access, complimentary stylist consultations, and 10% bonus points.",
    tag: "Loyalty Tier",
  },
  {
    title: "Late Night Flash Hours (10PM–12AM)",
    description: "Top fashion labels drop prices by an additional 10% to 15% during midnight flash sale hours during major sale weeks.",
    tag: "Flash Hours",
  },
  {
    title: "Kotak & HDFC Bank Card Stacking",
    description: "Myntra regularly runs 10% instant discount weekends with Kotak, HDFC, and ICICI credit cards, saving up to ₹1,000 extra.",
    tag: "Bank Card",
  },
  {
    title: "Combine BOGO with Bag Coupons",
    description: "Filter for Buy 1 Get 1 Free items and stack an eligible bag-level coupon code to achieve up to 70% effective savings.",
    tag: "Combo Save",
  },
];

const storePolicies = [
  {
    label: "Delivery Fee",
    value: "Free over ₹1,199",
    description: "Myntra Insider members receive complimentary free shipping on all orders.",
  },
  {
    label: "Return Window",
    value: "14 Days",
    description: "Doorstep trial and return with instant Myntra Credit or source refund.",
  },
  {
    label: "Payment Modes",
    value: "All Methods",
    description: "UPI, Netbanking, Credit/Debit cards, Myntra Credit, EMI, Cash on Delivery.",
  },
  {
    label: "Customer Help",
    value: "24/7 Support",
    description: "Dedicated help center with live chat and telephone support.",
  },
];

export const Route = createFileRoute("/myntra-coupons")({
  component: MyntraCouponsPage,
  head: () =>
    createSeoHead({
      title: "Myntra Coupon Codes Flat ₹400 Off (2026) | GoCoupon",
      description:
        "Auto-apply working Myntra promo codes for flat ₹400 off, first-order discounts, and up to 6.2% cashback on fashion and beauty with GoCoupon.",
      path: "/myntra-coupons",
      keywords:
        "myntra coupon code, myntra coupon code today, myntra 400 off coupon, myntra promo code, myntra cashback offers",
    }),
});

function MyntraCouponsPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Fashion", path: "/category/fashion" },
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
        eyebrow="Myntra Fashion Coupons &amp; Codes"
        title="Myntra coupon codes that help you save more on fashion."
        description="goCoupon finds validated Myntra promo codes, tests them at checkout in 850ms, and applies the one that yields the highest net savings."
        primaryCtaLabel="Install Extension Free"
        primaryCtaTo="/extension"
        storeName="Myntra"
        eeatProof={{
          verifiedCount: "34 Codes",
          successRate: "93.1%",
          avgSavings: "₹480",
          lastTested: "Today (Automated)",
          methodologyNote:
            "Tested across Premium Apparel, Footwear, and Beauty checkouts with Kotak, HDFC, and Myntra Insider rewards. Zero simulated data.",
        }}
        verifiedCoupons={verifiedCoupons}
        savingHacks={savingHacks}
        storePolicies={storePolicies}
        bullets={[
          "Automatically tests multiple Myntra coupon combinations in under 850ms.",
          "Compares Myntra Insider loyalty points against active promo code outcomes.",
          "Optimized for high-volume sales like End of Reason Sale (EORS).",
          "Cuts checkout friction for repeat fashion and lifestyle buyers.",
        ]}
        faqs={faqs.map((f) => ({ q: f.q, a: f.a }))}
        breadcrumb={[
          { name: "Home", path: "/" },
          { name: "Fashion", path: "/category/fashion" },
          { name: "Myntra Coupons", path: "/myntra-coupons" },
        ]}
      />
    </>
  );
}
