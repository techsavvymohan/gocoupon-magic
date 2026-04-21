import { Counter } from "../Counter";

const stats = [
  { label: "Total saved by users", to: 12400, prefix: "₹", suffix: " Cr" },
  { label: "Active installs", to: 180000, suffix: "+" },
  { label: "Codes tested every day", to: 41200 },
  { label: "Stores supported", to: 214 },
];

export function Stats() {
  return (
    <section className="relative border-y border-border px-6 py-24">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="reveal"
            style={{ transitionDelay: `${i * 0.1}s` }}
          >
            <div
              className="font-display text-5xl font-bold leading-none tracking-tight md:text-6xl"
              style={{ color: "var(--primary)" }}
            >
              <Counter
                to={s.to}
                prefix={s.prefix}
                suffix={s.suffix}
                duration={2000}
              />
            </div>
            <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
