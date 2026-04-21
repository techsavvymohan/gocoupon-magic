import { MagneticButton } from "../MagneticButton";
import { TiltCard } from "../TiltCard";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-32 pt-24 md:pt-32">
      <div className="grid-backdrop absolute inset-0" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.1fr_1fr]">
        {/* Left: copy */}
        <div className="reveal">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            v2.4 — now with Meesho support
          </div>
          <h1 className="font-display text-5xl font-bold leading-[1.05] text-foreground md:text-6xl lg:text-7xl text-balance">
            Stop overpaying.
            <br />
            <span style={{ color: "var(--primary)" }}>Apply every coupon</span>
            <br />
            in one click.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            goCoupon automatically finds and applies the best coupon code at
            checkout — on Flipkart, Amazon, Myntra and Meesho. One click.
            Maximum savings.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <MagneticButton
              as="a"
              href="#cta"
              className="inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-shadow hover:shadow-[0_0_40px_rgba(200,255,0,0.45)]"
            >
              <ChromeIcon />
              Add to Chrome — Free
            </MagneticButton>
            <a
              href="#how"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              See how it works →
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            <span>★ 4.9 / 5 — 12k+ reviews</span>
            <span>·</span>
            <span>180,000+ active users</span>
          </div>
        </div>

        {/* Right: 3D tilt mockup */}
        <div className="reveal" style={{ transitionDelay: "0.15s" }}>
          <ExtensionMockup />
        </div>
      </div>
    </section>
  );
}

function ChromeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
      <path d="M12 2v6M21 8.5l-5.2 3M3 8.5l5.2 3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ExtensionMockup() {
  return (
    <TiltCard
      className="mx-auto w-full max-w-md"
      innerClassName="relative rounded-2xl border border-border bg-card p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8),0_0_0_1px_rgba(200,255,0,0.05)]"
    >
      {/* Background glow layer */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 -z-10 opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, rgba(200,255,0,0.18), transparent 60%)",
          transform: "translateZ(0px)",
        }}
      />

      {/* Browser chrome */}
      <div className="layer flex items-center gap-1.5 pb-4" style={{ transform: "translateZ(20px)" }}>
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <div className="ml-3 flex-1 truncate rounded-md bg-black/40 px-3 py-1 font-mono text-[10px] text-muted-foreground">
          flipkart.com / checkout
        </div>
      </div>

      {/* Card body */}
      <div
        className="layer rounded-xl border border-border bg-background/60 p-5"
        style={{ transform: "translateZ(20px)" }}
      >
        <div
          className="layer flex items-center justify-between"
          style={{ transform: "translateZ(40px)" }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="grid h-8 w-8 place-items-center rounded-md font-display text-xs font-bold"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              CX
            </span>
            <div>
              <div className="text-sm font-semibold text-foreground">goCoupon</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Scanning codes…
              </div>
            </div>
          </div>
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: "var(--primary)" }} />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: "var(--primary)" }} />
          </span>
        </div>

        <ul
          className="layer mt-5 space-y-2 font-mono text-[11px]"
          style={{ transform: "translateZ(40px)" }}
        >
          {[
            { code: "FLIP200", status: "tested · invalid" },
            { code: "WELCOME10", status: "tested · –₹120" },
            { code: "BIGSAVE25", status: "best · –₹486", best: true },
            { code: "BANK50", status: "tested · –₹250" },
          ].map((c) => (
            <li
              key={c.code}
              className="flex items-center justify-between rounded-md border border-border/60 bg-black/30 px-3 py-2"
              style={c.best ? { borderColor: "var(--primary)" } : undefined}
            >
              <span className="text-foreground">{c.code}</span>
              <span style={{ color: c.best ? "var(--primary)" : "var(--muted-foreground)" }}>
                {c.status}
              </span>
            </li>
          ))}
        </ul>

        <div
          className="layer mt-5 flex items-center justify-between border-t border-border pt-4"
          style={{ transform: "translateZ(40px)" }}
        >
          <span className="text-xs text-muted-foreground">You saved</span>
          <span className="font-display text-2xl font-bold" style={{ color: "var(--primary)" }}>
            ₹486
          </span>
        </div>
      </div>

      {/* Floating badge */}
      <div
        className="layer absolute -right-4 -top-4 rounded-full border px-3 py-1.5 text-[11px] font-semibold shadow-2xl"
        style={{
          transform: "translateZ(80px)",
          background: "var(--primary)",
          color: "var(--primary-foreground)",
          borderColor: "rgba(200,255,0,0.5)",
          boxShadow: "0 10px 40px rgba(200,255,0,0.35)",
        }}
      >
        ✦ Auto-applied
      </div>
    </TiltCard>
  );
}
