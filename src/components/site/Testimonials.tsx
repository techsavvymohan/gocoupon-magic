const quotes = [
  {
    body:
      "Was buying a ₹14k phone on Flipkart and goCoupon just worked — no clicking around testing 12 expired codes. Saved me ₹1,200 in literally one second.",
    name: "Aarav Mehta",
    role: "Product designer · Bangalore",
  },
  {
    body:
      "I'm cynical about extensions like this — they're usually trash. goCoupon proved me wrong every single time on Myntra. Cashback hit my UPI on the 3rd of every month.",
    name: "Priya Iyer",
    role: "Software engineer · Pune",
  },
  {
    body:
      "Run a small import business and order on Amazon weekly. The savings sound boring until you add them up — goCoupon makes them ridiculous over a year.",
    name: "Rohit Bansal",
    role: "Founder · Jaipur",
  },
];

export function Testimonials() {
  return (
    <section className="relative px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <div className="reveal mb-16 max-w-2xl">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            What people say
          </p>
          <h2 className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl">
            Loved by 180,000+ shoppers across India.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {quotes.map((q, i) => (
            <figure
              key={q.name}
              className="reveal flex h-full flex-col rounded-2xl border border-border bg-card/40 p-8"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <blockquote className="text-base leading-relaxed text-foreground/90">
                "{q.body}"
              </blockquote>
              <figcaption className="mt-6 border-t border-border pt-5">
                <div className="text-sm font-semibold text-foreground">{q.name}</div>
                <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  {q.role}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
