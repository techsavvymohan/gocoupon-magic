import { MagneticButton } from "../MagneticButton";
import { TiltCard } from "../TiltCard";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-32 pt-24 md:pt-32">
      <div className="grid-backdrop absolute inset-0" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl items-start gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
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
            goCoupon automatically finds and applies the best coupon code at checkout — on Flipkart,
            Amazon, Myntra and Meesho. One click. Maximum savings.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <MagneticButton
              as="a"
              href="#cta"
              className="inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-shadow hover:shadow-[var(--shadow-accent)]"
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
        <div className="reveal relative lg:-top-6" style={{ transitionDelay: "0.15s" }}>
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
      className="mx-auto w-full max-w-[360px]"
      innerClassName="relative rounded-2xl border border-foreground/15 bg-card/95 p-5 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.35),var(--shadow-accent)] ring-1 ring-black/10 dark:ring-white/15 backdrop-blur-2xl transition-all duration-300"
    >
      {/* Background radial glow layer */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 -z-10 opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 40% 30%, var(--accent-glow-strong), transparent 65%)",
          transform: "translateZ(0px)",
        }}
      />

      {/* Browser chrome header */}
      <div
        className="layer flex items-center justify-between border-b border-border/60 pb-3"
        style={{ transform: "translateZ(30px)" }}
      >
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56] shadow-xs" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e] shadow-xs" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f] shadow-xs" />
        </div>
        <div className="flex flex-1 items-center justify-center px-3">
          <div className="flex items-center gap-1.5 rounded-full border border-border/80 bg-secondary/80 px-3 py-1 font-mono text-[10px] font-medium text-foreground shadow-inner">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-muted-foreground opacity-60">https://</span>
            <span className="font-semibold text-foreground">amazon.in</span>
            <span className="text-muted-foreground">/ checkout</span>
          </div>
        </div>
      </div>

      {/* Extension popup card body */}
      <div
        className="layer mt-3 rounded-xl border border-border/80 bg-background/90 p-4 shadow-xl ring-1 ring-black/5 dark:ring-white/5"
        style={{ transform: "translateZ(45px)" }}
      >
        {/* Header inside popup */}
        <div
          className="layer flex items-center justify-between border-b border-border/50 pb-3"
          style={{ transform: "translateZ(60px)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="grid h-8 w-8 place-items-center rounded-lg font-display text-xs font-bold shadow-md shadow-primary/25"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
              aria-hidden
            >
              gC
            </div>
            <div>
              <div className="text-xs font-bold text-foreground tracking-tight">goCoupon Pro</div>
              <div className="flex items-center gap-1 font-mono text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                Scanning 14 coupons…
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[9px] font-bold text-primary">
            LIVE ⚡
          </span>
        </div>

        {/* Tested Coupon list with 3D Pop */}
        <ul
          className="layer mt-3 space-y-2 font-mono text-[11px]"
          style={{ transform: "translateZ(70px)" }}
        >
          {[
            { code: "AMZ200", status: "tested · invalid", isInvalid: true },
            { code: "WELCOME10", status: "tested · –₹120", isSave: true },
            { code: "BIGSAVE25", status: "BEST DEAL · –₹486", best: true },
            { code: "BANK50", status: "tested · –₹250", isSave: true },
          ].map((c) => {
            if (c.best) {
              return (
                <li
                  key={c.code}
                  className="relative flex items-center justify-between rounded-lg border-2 border-primary bg-card px-3 py-2 shadow-lg ring-2 ring-primary/20 transition-all"
                  style={{ transform: "translateZ(85px)" }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-md bg-primary/15 px-1.5 py-0.5 font-mono font-bold text-primary text-[11px]">
                      {c.code}
                    </span>
                    <span className="rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-300 border border-amber-400/30">
                      ★ BEST
                    </span>
                  </div>
                  <span className="font-bold text-primary text-xs tracking-tight">
                    –₹486 SAVED
                  </span>
                </li>
              );
            }

            return (
              <li
                key={c.code}
                className="flex items-center justify-between rounded-lg border border-border/70 bg-secondary/50 px-2.5 py-1.5 text-[10px] transition-colors"
              >
                <span className="font-semibold text-foreground/90">{c.code}</span>
                <span
                  className={
                    c.isInvalid
                      ? "text-rose-500 font-medium"
                      : "text-emerald-600 dark:text-emerald-400 font-medium"
                  }
                >
                  {c.status}
                </span>
              </li>
            );
          })}
        </ul>

        {/* Savings Footer */}
        <div
          className="layer mt-3.5 flex items-center justify-between rounded-lg border border-border/60 bg-card px-3 py-2.5 shadow-sm"
          style={{ transform: "translateZ(75px)" }}
        >
          <div>
            <span className="block text-[10px] font-medium text-muted-foreground">
              Total Discount Applied
            </span>
            <span className="font-mono text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
              ✓ Lowest price unlocked
            </span>
          </div>
          <span className="font-display text-2xl font-extrabold tracking-tight text-primary drop-shadow-sm">
            ₹486
          </span>
        </div>
      </div>

      {/* Floating 3D Badge */}
      <div
        className="layer absolute -right-2.5 -top-2.5 flex items-center gap-1 rounded-full border border-white/40 dark:border-white/20 px-3 py-1.5 text-[10px] font-bold text-primary-foreground shadow-xl transition-transform hover:scale-105"
        style={{
          transform: "translateZ(110px)",
          background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
          boxShadow: "0 8px 24px rgba(79,70,229,0.45)",
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
        ✦ Auto-applied in 0.4s
      </div>
    </TiltCard>
  );
}
