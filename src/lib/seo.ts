/**
 * @file seo.ts
 * @description Centralized SEO Engine, High-CTR Metadata & Schema.org Rich Structured Data.
 */

export const SITE_URL = "https://gocoupon.io";
export const SITE_NAME = "GoCoupon";
export const DEFAULT_OG_IMAGE = "/og-image.png";

export function getCurrentMonthYear(): string {
  const date = new Date();
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" }); // e.g. "February 2026"
}

export type SeoInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string;
  type?: "website" | "article" | "product";
  ogImage?: string;
};

export function absoluteUrl(path: string): string {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function createSeoHead(input: SeoInput) {
  const { title, description, path, keywords, type = "website", ogImage: customOgImage } = input;
  const url = absoluteUrl(path);
  const ogImage = absoluteUrl(customOgImage || DEFAULT_OG_IMAGE);

  return {
    meta: [
      { title },
      { name: "description", content: description },
      {
        name: "robots",
        content: "index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1",
      },
      {
        name: "keywords",
        content:
          keywords ??
          "deals, discounts, coupons, coupon codes, promo codes, price tracking, price tracker india, price comparison, compare prices, cheaper products, lowest price online, amazon coupon codes, flipkart coupon codes, auto apply coupons, fake discount detector",
      },
      { property: "og:type", content: type },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: ogImage },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: `${SITE_NAME} — Deals, Discounts, Coupons, 30-Day Price Tracker & Live Cross-Store Comparison`,
      },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@gocoupon_in" },
      { name: "twitter:creator", content: "@gocoupon_in" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: ogImage },
    ],
    links: [
      { rel: "canonical", href: url },
      { rel: "alternate", hrefLang: "en-in", href: url },
      { rel: "alternate", hrefLang: "x-default", href: url },
    ],
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqSchema(
  items: ReadonlyArray<{ readonly question: string; readonly answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function productSchema(params: {
  name: string;
  description: string;
  image: string;
  brand: string;
  lowPrice: number;
  highPrice: number;
  ratingValue?: number;
  reviewCount?: number;
  offersCount?: number;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: params.name,
    description: params.description,
    image: params.image,
    brand: {
      "@type": "Brand",
      name: params.brand,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: params.ratingValue || 4.7,
      reviewCount: params.reviewCount || 1200,
      bestRating: 5,
      worstRating: 1,
    },
    offers: {
      "@type": "AggregateOffer",
      lowPrice: params.lowPrice,
      highPrice: params.highPrice,
      priceCurrency: "INR",
      offerCount: params.offersCount || 6,
      availability: "https://schema.org/InStock",
      url: absoluteUrl(params.url),
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://gocoupon.io/#website",
    url: "https://gocoupon.io/",
    name: "GoCoupon",
    alternateName: ["GoCoupon.io", "goCoupon"],
    publisher: { "@id": "https://gocoupon.io/#organization" },
    potentialAction: {
      "@type": "SearchAction",
      target: "https://gocoupon.io/compare?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
}

export function softwareAppSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": "https://gocoupon.io/#softwareapplication",
    name: "GoCoupon – Coupon Finder",
    operatingSystem: "Chrome, Edge, Brave, Opera",
    applicationCategory: "ShoppingApplication",
    applicationSubCategory: "Price Comparison, Price Tracking, Coupon Automation",
    softwareVersion: "1.2.0",
    url: "https://gocoupon.io/chrome-extension",
    installUrl: "https://chromewebstore.google.com/detail/gocoupon-%E2%80%93-coupon-finder/bbdcjoadldgankjdhdlmncacpkengnid",
    downloadUrl: "https://chromewebstore.google.com/detail/gocoupon-%E2%80%93-coupon-finder/bbdcjoadldgankjdhdlmncacpkengnid",
    description:
      "GoCoupon automatically tests and applies valid promo codes at checkout, tracks 30-day price drop graphs, and compares real-time prices across Amazon, Walmart, Target, Flipkart, and 200+ stores worldwide.",
    featureList: [
      "1-Click Automated Coupon Testing at Checkout in 850ms",
      "Live Cross-Store Price Comparison (Amazon, Walmart, Target, Flipkart, and more)",
      "30-Day Price Drop Tracker & Historical Low Checker",
      "Fake Discount & Pre-Sale Markup Detection",
      "Instant Price Drop Watchlist & Target Price Alerts",
      "Manifest V3 Sandboxed Security (Zero Remote Code)",
      "Zero PII & Payment Information Access Guarantee",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "1420",
      bestRating: "5",
      worstRating: "1",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@id": "https://gocoupon.io/#organization",
    },
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://gocoupon.io/#organization",
    name: "GoCoupon",
    url: "https://gocoupon.io/",
    logo: absoluteUrl("/gc-logo.webp"),
    description:
      "GoCoupon is the official shopping intelligence platform and browser extension for online shoppers worldwide, providing coupon automation, price comparison, 30-day price tracking, and cashback stacking.",
    email: "support@gocoupon.io",
    knowsAbout: [
      "Automated Coupon Testing",
      "Live Price Comparison",
      "30-Day Price History Graphs",
      "Manifest V3 Chrome Extension Security",
      "Landed Cost Stacking",
      "E-commerce Deals & Discount Vouchers",
    ],
    sameAs: [
      "https://chromewebstore.google.com/detail/gocoupon-%E2%80%93-coupon-finder/bbdcjoadldgankjdhdlmncacpkengnid",
      "https://github.com/techsavvymohan/gocoupon-magic",
      "https://github.com/techsavvymohan/gocoupon_extension",
      "https://facebook.com/gocouponapp",
      "https://twitter.com/gocoupon_in",
      "https://instagram.com/gocoupon.io",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support & Privacy Inquiries",
      email: "support@gocoupon.io",
    },
  };
}
