const stores = [
  "FLIPKART",
  "AMAZON",
  "MYNTRA",
  "MEESHO",
  "AJIO",
  "NYKAA",
  "TATA CLIQ",
  "FIRSTCRY",
];

export function LogoMarquee() {
  return (
    <section className="relative overflow-hidden border-y border-border py-10">
      <div className="reveal mx-auto mb-6 max-w-7xl px-6">
        <p className="text-center font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          Works on the stores you actually shop at
        </p>
      </div>
      <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <ul className="marquee-track flex shrink-0 items-center gap-16 pr-16">
          {[...stores, ...stores].map((s, i) => (
            <li
              key={`${s}-${i}`}
              className="font-display text-2xl font-bold tracking-tight text-muted-foreground/60 transition-colors hover:text-foreground"
            >
              {s}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
