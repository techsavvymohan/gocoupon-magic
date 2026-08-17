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
    <section id="pricing" className="relative px-6 py-28 overflow-hidden">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-14 text-center">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Pricing
          </p>
          <h2 className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl">
            Free forever. Pro if you want more.
          </h2>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid gap-8 md:grid-cols-2 items-stretch">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative flex flex-col justify-between rounded-3xl p-8 transition-colors duration-200 ${
                t.highlighted
                  ? "border-2 border-primary bg-card shadow-lg ring-2 ring-primary/20"
                  : "border border-border bg-card shadow-sm hover:border-border/80"
              }`}
            >
              {/* Pro Badge */}
              {t.highlighted && (
                <div
                  className="absolute -top-3.5 right-6 flex items-center gap-1.5 rounded-full px-3.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider shadow-sm"
                  style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                >
                  Most popular
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl font-bold text-foreground">
                    {t.name}
                  </span>
                  {t.highlighted && (
                    <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-primary">
                      PRO ⚡
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground min-h-[40px]">
                  {t.blurb}
                </p>

                {/* Price Display */}
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="font-display text-5xl font-extrabold tracking-tight text-foreground">
                    {t.price}
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">
                    {t.period}
                  </span>
                </div>

                {/* Feature List */}
                <ul className="mt-8 space-y-3.5 text-sm">
                  {t.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-3 text-foreground font-medium"
                    >
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold"
                        style={{ color: "var(--primary)" }}
                      >
                        ✓
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action CTA Button */}
              <div className="mt-10">
                <button
                  type="button"
                  className={`w-full rounded-full py-3.5 text-sm font-bold transition-colors duration-200 ${
                    t.highlighted
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
                  }`}
                >
                  {t.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
