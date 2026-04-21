import { MagneticButton } from "../MagneticButton";

export function CTA() {
  return (
    <section id="cta" className="relative overflow-hidden px-6 py-32">
      <div
        className="reveal mx-auto max-w-5xl rounded-3xl border border-border p-12 text-center md:p-20"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(200,255,0,0.12), transparent 60%), var(--card)",
        }}
      >
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          Ready when you are
        </p>
        <h2 className="font-display text-4xl font-bold leading-[1.05] text-foreground md:text-6xl text-balance">
          Add goCoupon.
          <br />
          <span style={{ color: "var(--primary)" }}>Save on the next order.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground">
          10-second install. Zero signup. Works on Flipkart, Amazon, Myntra, Meesho and 200+ more.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <MagneticButton
            as="a"
            href="#"
            className="inline-flex items-center gap-3 rounded-full bg-primary px-7 py-4 text-sm font-semibold text-primary-foreground transition-shadow hover:shadow-[0_0_50px_rgba(200,255,0,0.5)]"
          >
            Add to Chrome — Free
          </MagneticButton>
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            ★ 4.9 / 5 — 12k+ reviews
          </span>
        </div>
      </div>
    </section>
  );
}
