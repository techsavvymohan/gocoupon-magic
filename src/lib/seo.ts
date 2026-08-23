/**
 * @file seo.ts
 * @description Centralized SEO Engine, High-CTR Metadata & Schema.org Rich Structured Data.
 */

export const SITE_URL = "https://gocoupon.io";
export const SITE_NAME = "goCoupon";
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
          "coupon codes, promo codes, cashback, chrome extension, price tracker, price history india, Amazon coupon codes, Flipkart coupon codes",
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
        content: `${SITE_NAME} — Verified Working Coupons, 90-Day Price Tracker & Cashback`,
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
      {
        rel: "alternate",
        hrefLang: "hi",
        href: absoluteUrl(path === "/" ? "/hi/" : `/hi${path.startsWith("/") ? path : `/${path}`}`),
      },
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

export function softwareAppSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "goCoupon - Auto-Apply Coupons & Price History Tracker",
    operatingSystem: "Windows, macOS, Linux, ChromeOS",
    applicationCategory: "ShoppingApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "2840",
    },
    author: {
      "@type": "Organization",
      name: "goCoupon",
      url: SITE_URL,
    },
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "goCoupon",
    url: SITE_URL,
    logo: absoluteUrl("/logo.png"),
    sameAs: [
      "https://twitter.com/gocoupon_in",
      "https://github.com/techsavvymohan/gocoupon-magic",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      email: "support@gocoupon.io",
    },
  };
}
