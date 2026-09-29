import { useState } from "react";

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

function MarqueeLogoItem({ name, src }: { name: string; src: string }) {
  const [hasError, setHasError] = useState(false);

  return (
    <li className="flex h-11 min-w-[124px] shrink-0 items-center justify-center rounded-xl border border-border/80 bg-white dark:bg-card px-4 py-1.5 shadow-2xs transition-all duration-200 hover:scale-105 hover:border-primary/40">
      {!hasError ? (
        <img
          src={src}
          alt={`${name} — supported by goCoupon`}
          className="h-6 w-auto max-w-[100px] object-contain"
          draggable={false}
          loading="eager"
          decoding="async"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="font-display text-xs font-bold text-foreground/80 tracking-tight">{name}</span>
      )}
    </li>
  );
}

export function LogoMarquee() {
  return (
    <section className="relative overflow-hidden border-y border-border py-4 sm:py-6">
      <div className="reveal mx-auto mb-4 max-w-7xl px-6">
        <p className="text-center font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          Works on the stores you actually shop at
        </p>
      </div>
      <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <ul className="marquee-track flex shrink-0 items-center gap-6 pr-6">
          {[...stores, ...stores].map((s, i) => (
            <MarqueeLogoItem
              key={`${s.name}-${i}`}
              name={s.name}
              src={s.src}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
