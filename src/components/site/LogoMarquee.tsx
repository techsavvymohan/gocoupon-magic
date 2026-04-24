const stores = [
  { name: "Flipkart", src: "/Brand logos/flipkart.png" },
  { name: "Amazon", src: "/Brand logos/Amazon_logo.svg.webp" },
  { name: "Myntra", src: "/Brand logos/myntra.png" },
  { name: "Meesho", src: "/Brand logos/Meesho_logo.png" },
  { name: "Ajio", src: "/Brand logos/Ajio.png" },
  { name: "Nykaa", src: "/Brand logos/Nykaa.png" },
  { name: "Tata CLiQ", src: "/Brand logos/Tata-cliq.png" },
  { name: "FirstCry", src: "/Brand logos/FirstCry_logo.svg.png" },
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
              key={`${s.name}-${i}`}
              className="flex items-center transition-opacity hover:opacity-100 opacity-60"
            >
              <img
                src={s.src}
                alt={s.name}
                className="h-8 w-auto max-w-[120px] object-contain"
                draggable={false}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
