const steps = [
  {
    n: "01",
    title: "Install in 10 seconds",
    body: "Add goCoupon from the Chrome Web Store. No signup required to start saving.",
  },
  {
    n: "02",
    title: "Shop like normal",
    body: "Browse and add items to cart on any supported store. goCoupon watches in the background.",
  },
  {
    n: "03",
    title: "We do the math",
    body: "At checkout, goCoupon tests every code and applies the one that saves you the most.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <div className="reveal mb-20 max-w-2xl">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            How it works
          </p>
          <h2 className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl">
            Three steps. Then never think about it again.
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <article
              key={s.n}
              className="reveal group relative rounded-2xl border border-border bg-card/40 p-8 transition-colors hover:border-primary/40"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div
                className="font-mono text-xs"
                style={{ color: "var(--primary)" }}
              >
                {s.n}
              </div>
              <h3 className="mt-4 font-display text-xl font-bold text-foreground">
                {s.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
              <div
                aria-hidden
                className="mt-8 h-px w-full origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                style={{ background: "var(--primary)" }}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
