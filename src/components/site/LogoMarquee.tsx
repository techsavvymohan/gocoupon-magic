const stores = [
  { name: "Flipkart", src: "/Brand logos/flipkart.webp" },
  { name: "Amazon", src: "/Brand logos/Amazon_logo.svg.webp" },
  { name: "Myntra", src: "/Brand logos/myntra.webp" },
  { name: "Meesho", src: "/Brand logos/Meesho_logo.webp" },
  { name: "Ajio", src: "/Brand logos/Ajio.webp?v=2" },
  { name: "Nykaa", src: "/Brand logos/Nykaa.webp" },
  { name: "Tata CLiQ", src: "/Brand logos/Tata-cliq.webp" },
  { name: "FirstCry", src: "/Brand logos/FirstCry_logo.svg.webp" },
];

export function LogoMarquee() {
  return (
    <section className="relative overflow-hidden border-y border-border py-6 sm:py-8">
      <div className="reveal mx-auto mb-6 max-w-7xl px-6">
        <p className="text-center font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          Works on the stores you actually shop at
        </p>
      </div>
      <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <ul className="marquee-track flex shrink-0 items-center gap-8 pr-8">
          {[...stores, ...stores].map((s, i) => (
            <li
              key={`${s.name}-${i}`}
              className="flex h-12 min-w-[130px] shrink-0 items-center justify-center rounded-xl border border-border/80 bg-white px-5 py-2 shadow-sm transition-all duration-200 hover:scale-105"
            >
              <img
                src={s.src}
                alt={`${s.name} — supported by goCoupon`}
                className="h-7 w-auto max-w-[110px] object-contain opacity-100"
                draggable={false}
                loading="lazy"
                decoding="async"
                width={120}
                height={32}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
