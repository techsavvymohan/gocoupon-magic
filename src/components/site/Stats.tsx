import { Counter } from "../Counter";
import { useCurrency } from "@/context/CurrencyContext";

export function Stats() {
  const { symbol } = useCurrency();

  const stats = [
    { label: "Stores supported worldwide", to: 200, suffix: "+" },
    { label: "Days price history tracked", to: 90, suffix: " Days" },
    { label: "Always 100% free to use", to: 0, prefix: symbol, suffix: "" },
    { label: "Sub-second coupon testing", to: 850, suffix: " ms" },
  ];
  return (
    <section className="relative border-y border-border px-6 py-24">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className="reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
            <div
              className="font-display text-5xl font-bold leading-none tracking-tight md:text-6xl"
              style={{ color: "var(--primary)" }}
            >
              <Counter to={s.to} prefix={s.prefix} suffix={s.suffix} duration={2000} />
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
