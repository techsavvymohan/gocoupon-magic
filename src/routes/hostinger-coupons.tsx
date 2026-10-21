
import { createFileRoute } from "@tanstack/react-router";
import { SeoLandingPage } from "@/components/site/SeoLandingPage";
import { breadcrumbSchema, createSeoHead, faqSchema, storeCouponSchema } from "@/lib/seo";

const faqs = [
  {
    q: "What is the highest discount Hostinger coupon code available today?",
    a: "The highest verified Hostinger discount offers up to 83% off on 48-month Premium Web Hosting, combined with stackable promo code 'GOCOUPON10' or 'GLOBALHOST10' for an additional 10% instant reduction and a free 1-year .com domain name.",
  },
  {
    q: "How do I get a free .com or .in domain on Hostinger?",
    a: "When purchasing any Hostinger Premium, Business, or Cloud hosting plan for 12 months or longer, domain registration for the first year (.com, .in, .net, or .org) is automatically bundled at ₹0 cost during checkout.",
  },
  {
    q: "Can I use Hostinger promo codes on hosting renewals?",
    a: "Hostinger coupon codes apply primarily to new hosting plans and upgrades. To lock in the cheapest pricing long-term, choose the 48-month billing tenure during initial purchase to maximize the multi-year discounted rate.",
  },
  {
    q: "Does Hostinger accept UPI, RuPay, and domestic Indian payment methods?",
    a: "Yes! Hostinger India supports domestic payments including UPI (Google Pay, PhonePe, Paytm), RuPay cards, NetBanking, and credit cards with zero foreign transaction markup fees.",
  },
  {
    q: "What is Hostinger's money-back refund guarantee?",
    a: "Hostinger provides an unconditional 30-day money-back guarantee. If you are not satisfied with their server performance or uptime, you can cancel within 30 days for a 100% full refund.",
  },
] as const;

const verifiedCoupons = [
  {
    code: "GLOBALHOST10",
    discount: "Extra 10% Instant Off",
    description: "Stackable promo code on all 24-month and 48-month hosting plans including Premium and Business WordPress tiers.",
    minSpend: "₹1,499",
    category: "Hosting & Domains",
    expiry: "Verified Today",
    isExclusive: true,
  },
  {
    code: "PREMIUM83",
    discount: "Up to 83% OFF + Free Domain",
    description: "Exclusive multi-year discount on Premium Shared Hosting with 100 websites, 100 GB SSD, and free SSL certificates.",
    minSpend: "48-Month Plan",
    category: "Web Hosting",
    expiry: "Active Today",
    isExclusive: true,
  },
  {
    code: "CLOUD75",
    discount: "75% OFF Cloud Startup",
    description: "Special savings on high-performance Cloud Startup hosting with dedicated IP, 3 GB RAM, and free daily backups.",
    minSpend: "Cloud Hosting",
    category: "Cloud Hosting",
    expiry: "Ongoing",
  },
  {
    code: "FREEDOMAIN",
    discount: "Free 1-Year Domain (.com/.in)",
    description: "Complimentary domain name registration on all annual and multi-year hosting package subscriptions.",
    minSpend: "Annual Plan",
    category: "Domains",
    expiry: "Limited Period",
  },
];

const savingHacks = [
  {
    title: "Always Select 48-Month Lock-In",
    description: "Choosing the 48-month billing cycle drops the monthly rate to just ₹129–₹139/month, waives setup fees, and secures 4 years of discounted hosting.",
    tag: "Tenure Hack",
  },
  {
    title: "Uncheck Optional Add-ons at Checkout",
    description: "On the Business plan, daily automated backups and Cloudflare CDN are already included free. Uncheck optional paid add-ons to keep your cart minimal.",
    tag: "Cart Optimization",
  },
  {
    title: "Pay via UPI for Zero Forex Markup",
    description: "Selecting UPI (GPay/PhonePe/Paytm) ensures billing in exact Indian Rupees without the 3.5% foreign transaction fee charged by some international card issuers.",
    tag: "Payment Hack",
  },
  {
    title: "30-Day Risk-Free Trial Period",
    description: "Test your website speed, LiteSpeed caching, and WordPress performance. If dissatisfied, initiate a refund within 30 days with zero penalty.",
    tag: "Risk-Free",
  },
];

const storePolicies = [
  {
    label: "Refund Policy",
    value: "30-Day Money-Back",
    description: "100% full refund on hosting services within 30 days of purchase.",
  },
  {
    label: "Free Domain",
    value: "1 Year Included",
    description: "Free .com, .in, .net, or .org domain on 12+ months hosting plans.",
  },
  {
    label: "Security & SSL",
    value: "Unlimited Free SSL",
    description: "Lifetime Let's Encrypt SSL certificates automatically installed.",
  },
  {
    label: "Customer Support",
    value: "24/7 Live Support",
    description: "Multilingual 24/7 live chat and instant knowledge base access.",
  },
];

export const Route = createFileRoute("/hostinger-coupons")({
  component: HostingerCouponsPage,
  head: () =>
    createSeoHead({
      title: "Hostinger Coupon Code & 83% OFF Promo (2026) | GoCoupon",
      description:
        "Get 100% verified Hostinger coupon codes, secret 83% web hosting discounts, and free domain promo vouchers. Auto-apply working codes with GoCoupon.",
      path: "/hostinger-coupons",
      keywords:
        "hostinger coupon code, hostinger promo code 2026, hostinger hosting discount, hostinger coupon code india, hostinger 83 off code, hostinger free domain coupon",
    }),
});

function HostingerCouponsPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Web Hosting", path: "/category/software-saas" },
    { name: "Hostinger Coupons", path: "/hostinger-coupons" },
  ]);
  const faq = faqSchema(faqs.map((f) => ({ question: f.q, answer: f.a })));

  const storeSchema = storeCouponSchema({
    storeName: "Hostinger",
    url: "/hostinger-coupons",
    description:
      "Get 100% verified Hostinger coupon codes, secret 83% web hosting discounts, and free domain promo vouchers. Auto-apply working codes with GoCoupon.",
    logo: "https://res.cloudinary.com/pgzfcjir/image/upload/v1791060832/gocoupon/brands/real_brand_hostinger.svg",
    ratingValue: 4.9,
    reviewCount: 840,
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
        eyebrow="Hostinger Promo Codes & Hosting Deals"
        title="Hostinger coupon codes, 83% web hosting discounts, and free domains."
        description="GoCoupon automatically tests and applies verified Hostinger promo codes at checkout so you secure the lowest price on WordPress, cloud, and VPS hosting."
        primaryCtaLabel="Install Extension Free"
        primaryCtaTo="/extension"
        storeName="Hostinger"
        storeUrl="https://www.hostinger.in"
        eeatProof={{
          verifiedCount: "14 Codes",
          successRate: "96.4%",
          avgSavings: "₹3,450",
          lastTested: "Today (Automated)",
          methodologyNote:
            "Tested across Premium, Business, and Cloud Startup 12, 24, and 48-month plans with UPI, RuPay, and credit card payment channels. Zero simulated data.",
        }}
        verifiedCoupons={verifiedCoupons}
        savingHacks={savingHacks}
        storePolicies={storePolicies}
        bullets={[
          "Auto-applies verified Hostinger promo codes at checkout in under 850ms.",
          "Stacks multi-year introductory discounts with 10% partner coupon codes.",
          "Includes free 1-year domain name registration and unlimited SSL certificates.",
          "Backed by a 30-day money-back guarantee with zero personal data tracking.",
        ]}
        faqs={faqs.map((f) => ({ q: f.q, a: f.a }))}
        breadcrumb={[
          { name: "Home", path: "/" },
          { name: "Web Hosting", path: "/category/software-saas" },
          { name: "Hostinger Coupons", path: "/hostinger-coupons" },
        ]}
      />
    </>
  );
}
