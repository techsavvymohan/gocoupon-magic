import { Link } from "@tanstack/react-router";

const cols = [
  {
    title: "Product",
    links: [
      { label: "How it works", to: "/how-it-works" },
      { label: "Chrome extension", to: "/extension" },
      { label: "Cashback rewards", to: "/cashback-rewards" },
      { label: "FAQ", to: "/faq" },
    ],
  },
  {
    title: "Stores",
    links: [
      { label: "Flipkart coupons", to: "/flipkart-coupons" },
      { label: "Amazon coupons", to: "/amazon-coupons" },
      { label: "Myntra coupons", to: "/myntra-coupons" },
      { label: "Meesho coupons", to: "/meesho-coupons" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Blog", to: "/blog" },
      { label: "Resources", to: "/resources" },
      { label: "Press", to: "/press" },
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Home", to: "/" },
    ],
  },
];

const socials = [
  {
    href: "https://facebook.com/gocouponapp",
    label: "GoCoupon on Facebook",
    name: "Facebook",
    icon: FacebookIcon,
  },
  {
    href: "https://twitter.com/gocoupon_in",
    label: "GoCoupon on Twitter",
    name: "Twitter",
    icon: TwitterIcon,
  },
  {
    href: "https://instagram.com/gocoupon.io",
    label: "GoCoupon on Instagram",
    name: "Instagram",
    icon: InstagramIcon,
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-16">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Link to="/" className="flex items-center gap-2.5" aria-label="goCoupon — home">
            <span className="inline-flex items-center rounded-lg px-2 py-1 transition-colors">
              <img
                src="/gc-logo.png"
                alt="goCoupon"
                className="h-7 w-auto dark:hidden"
                width={120}
                height={28}
                loading="lazy"
                decoding="async"
              />
              <img
                src="/gc-logo-dark.png"
                alt="goCoupon"
                className="hidden h-7 w-auto dark:block"
                width={120}
                height={28}
                loading="lazy"
                decoding="async"
              />
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            The Chrome extension that finds and applies the best coupon code for you, automatically.
          </p>

          <ul className="mt-6 flex items-center gap-3" aria-label="goCoupon on social media">
            {socials.map(({ href, label, name, icon: Icon }) => (
              <li key={name}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={name}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Icon />
                </a>
              </li>
            ))}
          </ul>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {c.title}
            </div>
            <ul className="space-y-2.5">
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="inline-flex min-h-11 items-center text-sm text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-16 flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
        <p className="font-mono text-xs text-muted-foreground">© 2026 goCoupon. Made in India 🇮🇳</p>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          © 2026 goCoupon. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function FacebookIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M22 12a10 10 0 1 0-11.56 9.88V15H7.9V12h2.54V9.79c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 3h-2.33v6.88A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M18.244 2H21l-6.52 7.455L22 22h-6.164l-4.83-6.31L5.4 22H2.64l6.98-7.98L2 2h6.32l4.37 5.77L18.244 2Zm-2.16 18h1.705L7.02 4H5.22l10.865 16Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
