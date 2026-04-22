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
      { label: "Home", to: "/" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-16">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Link to="/" className="flex items-center gap-2.5">
            <span className="inline-flex items-center rounded-lg px-2 py-1 transition-colors dark:bg-white/90 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.25),0_4px_18px_rgba(255,255,255,0.08)] dark:ring-1 dark:ring-white/40">
              <img src="/gc-logo.png" alt="goCoupon" className="h-7 w-auto" />
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            The Chrome extension that finds and applies the best coupon code for you, automatically.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {c.title}
            </div>
            <ul className="space-y-2.5">
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-foreground/80 transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-16 flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
        <p className="font-mono text-xs text-muted-foreground">
          © 2026 goCoupon. Made in India 🇮🇳
        </p>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          © 2026 goCoupon. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
