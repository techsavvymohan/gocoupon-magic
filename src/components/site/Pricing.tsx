const tiers = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    blurb: "Everything you need to save on every order.",
    features: [
      "Auto-apply best coupon",
      "Cashback on 200+ stores",
      "Price drop alerts",
      "Privacy-first, no account",
    ],
    cta: "Add to Chrome",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₹99",
    period: "/ month",
    blurb: "For power shoppers and resellers who want maximum return.",
    features: [
      "Everything in Free",
      "2× cashback boost",
      "Priority code crawler",
      "Wishlist auto-watch",
      "Early access to deals",
    ],
    cta: "Start 14-day trial",
    highlighted: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative px-6 py-32">
      <div className="mx-auto max-w-5xl">
        <div className="reveal mb-16 text-center">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Pricing
          </p>
          <h2 className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl">
            Free forever. Pro if you want more.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {tiers.map((t, i) => (
            <div
              key={t.name}
              className="reveal relative rounded-2xl border bg-card/40 p-8"
              style={{
                transitionDelay: `${i * 0.1}s`,
                borderColor: t.highlighted ? "var(--primary)" : "var(--border)",
                background: t.highlighted ? "rgba(200,255,0,0.04)" : undefined,
              }}
            >
              {t.highlighted && (
                <div
                  className="absolute -top-3 right-6 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider"
                  style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                >
                  Most popular
                </div>
              )}
              <div className="font-display text-xl font-bold text-foreground">{t.name}</div>
              <div className="mt-2 text-sm text-muted-foreground">{t.blurb}</div>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold text-foreground">{t.price}</span>
                <span className="text-sm text-muted-foreground">{t.period}</span>
              </div>
              <ul className="mt-8 space-y-3 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-foreground/90">
                    <span style={{ color: "var(--primary)" }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="mt-8 w-full rounded-full px-5 py-3 text-sm font-semibold transition-colors"
                style={
                  t.highlighted
                    ? { background: "var(--primary)", color: "var(--primary-foreground)" }
                    : { background: "var(--secondary)", color: "var(--secondary-foreground)" }
                }
              >
                {t.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
