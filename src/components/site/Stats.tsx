import { Counter } from "../Counter";
import { useCurrency } from "@/context/CurrencyContext";

export function Stats() {
  const { symbol, isIndia } = useCurrency();

  const stats = [
    { label: "Avg. Annual Household Savings", to: isIndia ? 48500 : 650, prefix: symbol, suffix: "+" },
    { label: "Instant Price Drop At Checkout", to: 18, suffix: ".4%" },
    { label: "Verified Stores & Brands Monitored", to: 500, suffix: "+" },
    { label: "Cost to You, Forever", to: 0, prefix: symbol, suffix: " Free" },
  ];
  return (
    <section className="relative border-y border-border px-4 sm:px-6 py-16 sm:py-20 bg-card/20">
      <div className="mx-auto grid max-w-7xl gap-8 grid-cols-2 md:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className="reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
            <div className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-primary">
              <Counter to={s.to} prefix={s.prefix} suffix={s.suffix} duration={2000} />
            </div>
            <div className="mt-2 text-xs sm:text-sm font-medium text-muted-foreground">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
