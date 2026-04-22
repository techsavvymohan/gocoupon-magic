import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/seo";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "goCoupon — Auto-Apply Coupon Codes & Cashback Extension" },
      {
        name: "description",
        content:
          "Get automatic coupons and cashback on Flipkart, Amazon, Myntra, Meesho and more with goCoupon. Install the Chrome extension and save at checkout.",
      },
      {
        name: "keywords",
        content:
          "coupon code India, promo codes India, cashback extension, amazon coupon code, flipkart coupon code, myntra coupon code, meesho coupon code",
      },
      { name: "robots", content: "index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" },
      { name: "author", content: "goCoupon" },
      { property: "og:title", content: "goCoupon — Auto-Apply Coupon Codes & Cashback Extension" },
      {
        property: "og:description",
        content:
          "Automatically find and apply the best coupon code at checkout. Save on Amazon, Flipkart, Myntra and Meesho with goCoupon.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: `${SITE_URL}/gc-logo.png` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "goCoupon — Auto-Apply Coupon Codes & Cashback Extension" },
      {
        name: "twitter:description",
        content:
          "Automatically find and apply the best coupon code at checkout. Save on top Indian stores with goCoupon.",
      },
      { name: "twitter:image", content: `${SITE_URL}/gc-logo.png` },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "canonical", href: SITE_URL },
      { rel: "alternate", hrefLang: "en-in", href: SITE_URL },
      { rel: "alternate", hrefLang: "x-default", href: SITE_URL },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

// Runs before React hydrates — sets the theme class to prevent flash.
const noFlickerScript = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}var r=document.documentElement;r.classList.remove('light','dark');r.classList.add(t);r.style.colorScheme=t;}catch(e){document.documentElement.classList.add('dark');}})();`;
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "goCoupon",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/blog?query={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "goCoupon",
  url: SITE_URL,
  logo: `${SITE_URL}/gc-logo.png`,
  sameAs: [],
};

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: noFlickerScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
