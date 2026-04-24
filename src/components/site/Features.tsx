const features = [
  {
    title: "Auto-apply at checkout",
    body: "We test every active code in the background and stack the winner instantly.",
    icon: BoltIcon,
  },
  {
    title: "Affiliate cashback",
    body: "Earn up to 12% back on Flipkart, Amazon, Myntra and more — paid monthly.",
    icon: CoinIcon,
  },
  {
    title: "Privacy-first",
    body: "No browsing history sold. No tracking pixels. Codes verified server-side.",
    icon: ShieldIcon,
  },
  {
    title: "Price drop alerts",
    body: "Get notified when something in your wishlist drops below your target price.",
    icon: BellIcon,
  },
  {
    title: "Verified daily",
    body: "Our crawler tests 40,000+ codes every 24h so you never see a dead one.",
    icon: CheckIcon,
  },
  {
    title: "Works everywhere",
    body: "Flipkart, Amazon, Myntra, Meesho, Ajio, Nykaa — and 200+ Indian stores.",
    icon: GlobeIcon,
  },
];

export function Features() {
  return (
    <section id="features" className="relative px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <div className="reveal mb-20 flex items-end justify-between gap-8">
          <div className="max-w-2xl">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              Features
            </p>
            <h2 className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl">
              Everything a coupon hunter wants.
              <br />
              Nothing they don't.
            </h2>
          </div>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="reveal group relative bg-background p-8 transition-colors hover:bg-card"
                style={{ transitionDelay: `${(i % 3) * 0.08}s` }}
              >
                <div
                  className="mb-5 grid h-10 w-10 place-items-center rounded-lg border border-border bg-card transition-colors group-hover:border-primary/50"
                  style={{ color: "var(--primary)" }}
                >
                  <Icon />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function BoltIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function CoinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M9 9h6M9 12h6M9 15h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 10a6 6 0 1112 0v4l2 3H4l2-3v-4zM10 20a2 2 0 004 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12l4 4L19 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
