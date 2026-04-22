import { couponFaqs } from "@/data/faqs";

export function FAQ() {
  return (
    <section className="relative px-6 py-32">
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1fr_1.4fr]">
        <div className="reveal">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            FAQ
          </p>
          <h2 className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl">
            Quick answers.
          </h2>
        </div>
        <div className="divide-y divide-border border-y border-border">
          {couponFaqs.map((f, i) => (
            <details
              key={f.question}
              className="reveal group py-6"
              style={{ transitionDelay: `${i * 0.05}s` }}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left text-lg font-semibold text-foreground">
                <span>{f.question}</span>
                <span
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-transform group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {f.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
