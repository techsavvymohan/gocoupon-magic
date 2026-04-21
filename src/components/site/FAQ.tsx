const faqs = [
  {
    q: "Is goCoupon really free?",
    a: "Yes. The core extension — auto-apply, cashback, and price alerts — is free forever. Pro is optional and adds boosted cashback and priority crawling.",
  },
  {
    q: "How do you make money?",
    a: "When goCoupon helps you save, partner stores pay us a small affiliate fee. We split that with you as cashback. Win-win, no creepy data sales.",
  },
  {
    q: "Will it slow my browser down?",
    a: "No. goCoupon runs only on supported store pages and uses < 8 MB of memory. It's idle everywhere else.",
  },
  {
    q: "Do you sell my data?",
    a: "Never. We don't track browsing outside supported stores, we don't sell history, and we don't use third-party trackers.",
  },
  {
    q: "How do I get my cashback?",
    a: "Cashback accrues in your goCoupon dashboard and is paid out via UPI on the 3rd of every month, once you cross ₹100.",
  },
];

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
          {faqs.map((f, i) => (
            <details
              key={f.q}
              className="reveal group py-6"
              style={{ transitionDelay: `${i * 0.05}s` }}
            >
              <summary className="flex cursor-none list-none items-center justify-between gap-6 text-left text-lg font-semibold text-foreground">
                <span>{f.q}</span>
                <span
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-transform group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
