export const SITE_URL = "https://gocoupon.io";
export const SITE_NAME = "goCoupon";
export const DEFAULT_OG_IMAGE = "/og-image.png";

export type SeoInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string;
  type?: "website" | "article";
};

export function absoluteUrl(path: string): string {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function createSeoHead(input: SeoInput) {
  const { title, description, path, keywords, type = "website" } = input;
  const url = absoluteUrl(path);
  const ogImage = absoluteUrl(DEFAULT_OG_IMAGE);

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
        content: keywords ?? "coupon codes, promo codes, cashback, chrome extension, India deals",
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
        content: `${SITE_NAME} — auto-apply coupon codes on Flipkart, Amazon, Myntra & Meesho`,
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
  items: ReadonlyArray<{ readonly question: string; readonly answer: string }>,
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
