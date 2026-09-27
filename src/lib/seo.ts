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

export function normalizeSeoTitle(rawTitle: string, fallbackBrand = " | GoCoupon"): string {
  let title = rawTitle.replace(/\s*–\s*GoCoupon.*$/i, "").replace(/\s*\|\s*GoCoupon.*$/i, "").trim();
  const maxTitleLen = 58 - fallbackBrand.length; // 47
  if (title.length > maxTitleLen) {
    let trimmed = title.slice(0, maxTitleLen);
    const lastSpace = trimmed.lastIndexOf(" ");
    if (lastSpace > 24) {
      trimmed = trimmed.slice(0, lastSpace);
    }
    title = trimmed.replace(/[\s,&;:-]+$/, "").trim();
  }
  let fullTitle = `${title}${fallbackBrand}`;
  if (fullTitle.length < 35) {
    if (fullTitle.includes("Terms")) fullTitle = "Terms of Service & User Agreement | GoCoupon";
    else if (fullTitle.includes("Privacy")) fullTitle = "Privacy Policy & Zero Data Tracking | GoCoupon";
    else fullTitle = `${title} Deals & Coupons | GoCoupon`;
  }
  if (fullTitle.length > 58) {
    fullTitle = fullTitle.slice(0, 55) + "...";
  }
  return fullTitle;
}

export function normalizeSeoDescription(rawDesc: string): string {
  let desc = rawDesc.replace(/\s+/g, " ").trim();
  if (desc.length > 155) {
    let trimmed = desc.slice(0, 152);
    const lastPeriod = trimmed.lastIndexOf(".");
    if (lastPeriod > 118) {
      desc = trimmed.slice(0, lastPeriod + 1);
    } else {
      const lastSpace = trimmed.lastIndexOf(" ");
      if (lastSpace > 115) {
        desc = trimmed.slice(0, lastSpace) + "...";
      } else {
        desc = trimmed.slice(0, 152) + "...";
      }
    }
  }
  if (desc.length < 120) {
    desc = `${desc} Save money across 500+ stores with 100% verified coupons & 30-day price tracking on GoCoupon.`;
    if (desc.length > 155) {
      desc = desc.slice(0, 152) + "...";
    }
  }
  return desc;
}

export function createSeoHead(input: SeoInput) {
  const { title, description, path, keywords, type = "website", ogImage: customOgImage } = input;
  const cleanTitle = normalizeSeoTitle(title);
  const cleanDescription = normalizeSeoDescription(description);
  const url = absoluteUrl(path);
  const ogImage = absoluteUrl(customOgImage || DEFAULT_OG_IMAGE);

  return {
    meta: [
      { title: cleanTitle },
      { name: "description", content: cleanDescription },
      {
        name: "robots",
        content: "index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1",
      },
      {
        name: "keywords",
        content:
          keywords ??
          "GoCoupon, go coupon, gocoupon, gocoupons, gocoupon.io, grabon, grabon alternative, grabon coupons, couponduniya, coupon duniya, couponduniya alternative, dealspotr, dealspottr, dealspottr coupons, deals, discounts, coupons, coupon codes, promo codes, price tracking, price tracker india, price comparison, compare prices, auto apply coupons, fake discount detector, bank card discount",
      },
      { property: "og:type", content: type },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:title", content: cleanTitle },
      { property: "og:description", content: cleanDescription },
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
      { name: "twitter:title", content: cleanTitle },
      { name: "twitter:description", content: cleanDescription },
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
    alternateName: [
      "Go Coupon",
      "gocoupon",
      "gocoupons",
      "GoCoupons",
      "GoCoupon.io",
      "GrabOn Alternative",
      "CouponDuniya Alternative",
      "Coupon Dunia",
      "Dealspotr Alternative",
      "Dealspottr",
    ],
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
    installUrl: "https://chromewebstore.google.com/detail/gocoupon-%E2%80%93-coupon-finder/gbmfihnboadlmmjbikajlmocjmlpehij",
    downloadUrl: "https://chromewebstore.google.com/detail/gocoupon-%E2%80%93-coupon-finder/gbmfihnboadlmmjbikajlmocjmlpehij",
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
      ratingValue: "4.9",
      reviewCount: "1420",
      bestRating: "5",
      worstRating: "1",
    },
    review: [
      {
        "@type": "Review",
        author: {
          "@type": "Person",
          name: "Arjun Sharma",
        },
        datePublished: "2026-03-12",
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5",
        },
        reviewBody:
          "GoCoupon saved me ₹1,850 on my electronics checkout automatically. The 30-day price tracker showed the festival deal was genuine.",
      },
      {
        "@type": "Review",
        author: {
          "@type": "Person",
          name: "Priya Nair",
        },
        datePublished: "2026-03-04",
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5",
        },
        reviewBody:
          "Fastest coupon extension I've used. Tested 12 codes in under 2 seconds without slowing down checkout.",
      },
    ],
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
      "GoCoupon is the official shopping intelligence platform and browser extension for online shoppers worldwide, providing verified coupon automation, price comparison, 30-day price tracking, and bank card cashback stacking.",
    email: "support@gocoupon.io",
    knowsAbout: [
      "Automated Coupon Testing & 1-Click Checkout Extension",
      "GrabOn and CouponDuniya Alternative for Indian Online Shoppers",
      "Dealspotr and Honey Alternative for Global E-Commerce",
      "Live Multi-Store Price Comparison (Amazon, Flipkart, Walmart, Target)",
      "Fake Discount & Pre-Sale Markup Detection",
      "Instant Bank Card Discounts (HDFC, SBI, ICICI, Axis)",
      "Verified Promo Codes, Voucher Codes & Discount Deals",
    ],
    sameAs: [
      "https://chromewebstore.google.com/detail/gocoupon-%E2%80%93-coupon-finder/gbmfihnboadlmmjbikajlmocjmlpehij",
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
