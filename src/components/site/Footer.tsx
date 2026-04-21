const cols = [
  { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
  { title: "Stores", links: ["Flipkart", "Amazon", "Myntra", "Meesho"] },
  { title: "Company", links: ["About", "Blog", "Press kit", "Careers"] },
  { title: "Legal", links: ["Privacy", "Terms", "Cashback policy", "Contact"] },
];

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-16">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <div className="flex items-center gap-2.5">
          <span
            className="grid h-8 w-8 place-items-center rounded-md font-display text-sm font-bold"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            aria-hidden
          >
            gC
          </span>
            <span className="font-display text-lg font-bold tracking-tight text-foreground">
              goCoupon
            </span>
          </div>
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
                <li key={l}>
                  <a
                    href="#"
                    className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {l}
                  </a>
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
          v2.4.1 — all systems operational
        </p>
      </div>
    </footer>
  );
}
