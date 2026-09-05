import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Sparkles,
  ShieldCheck,
  ArrowUp,
  ChevronRight,
  Check,
  ExternalLink,
  Zap,
  Store,
  Building2,
  Lock,
  Activity,
  Mail,
  Heart,
  Globe,
} from "lucide-react";

interface NavLinkItem {
  label: string;
  to?: string;
  href?: string;
  isExternal?: boolean;
  badge?: string;
  badgeColor?: string;
}

interface NavColumn {
  title: string;
  icon: typeof Zap;
  links: NavLinkItem[];
}

const navColumns: NavColumn[] = [
  {
    title: "Product & Intelligence",
    icon: Zap,
    links: [
      {
        label: "GoCoupon Official Extension",
        to: "/chrome-extension",
        badge: "v3.2 MV3",
        badgeColor:
          "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      },
      {
        label: "GoCoupon Price Comparison",
        to: "/compare",
        badge: "New",
        badgeColor: "bg-primary/15 text-primary border-primary/20",
      },
      {
        label: "GoCoupon 90-Day Price Tracker",
        to: "/price-history",
        badge: "Live Chart",
        badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
      },
      { label: "How GoCoupon Works", to: "/how-it-works" },
      { label: "Cashback Rewards Tiers", to: "/cashback-rewards" },
      {
        label: "Trending Deals & Drops",
        href: "https://deals.gocoupon.io",
        isExternal: true,
        badge: "HOT",
        badgeColor: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20",
      },
      { label: "Frequently Asked Questions", to: "/faq" },
    ],
  },
  {
    title: "Stores & Categories",
    icon: Store,
    links: [
      { label: "Flipkart Coupons & Offers", to: "/flipkart-coupons" },
      { label: "Amazon India Verified Deals", to: "/amazon-coupons" },
      { label: "Myntra Fashion Vouchers", to: "/myntra-coupons" },
      { label: "Meesho Direct Manufacturer Deals", to: "/meesho-coupons" },
      {
        label: "All 200+ Stores Directory",
        to: "/stores",
        badge: "200+ Stores",
        badgeColor: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/20",
      },
      { label: "Browse Shopping Categories", to: "/categories" },
    ],
  },
  {
    title: "Company & Ecosystem",
    icon: Building2,
    links: [
      { label: "About GoCoupon", to: "/about" },
      { label: "Identify Official Website", to: "/blog/how-to-identify-official-gocoupon-website" },
      {
        label: "Savings Intelligence Blog",
        to: "/blog",
        badge: "Weekly",
        badgeColor: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20",
      },
      { label: "Free Calculators & Guides", to: "/resources" },
      { label: "Press & Media Kit", to: "/press" },
      { label: "Help & Support Center", to: "/help" },
      { label: "Contact Engineering HQ", to: "/contact" },
      { label: "HTML Sitemap", to: "/sitemap" },
    ],
  },
  {
    title: "Trust & Architecture",
    icon: ShieldCheck,
    links: [
      { label: "Affiliate Transparency Disclosure", to: "/disclosure" },
      {
        label: "Security & Privacy Architecture",
        to: "/security",
        badge: "AES-256",
        badgeColor:
          "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      },
      { label: "Privacy Policy (Zero Data-Sale)", to: "/privacy" },
      { label: "Terms of Service", to: "/terms" },
      { label: "Extension Uninstall Survey", to: "/uninstall" },
    ],
  },
];

const partnerStores = [
  {
    name: "Amazon",
    logo: "/Brand logos/Amazon_logo.svg.webp",
    deal: "Verified Promo Codes",
    tag: "Lowest Price",
  },
  {
    name: "Flipkart",
    logo: "/Brand logos/flipkart.webp",
    deal: "Bank & SuperCoins",
    tag: "Fast Delivery",
  },
  { name: "Myntra", logo: "/Brand logos/myntra.webp", deal: "Up to 70% Off", tag: "Fashion" },
  { name: "Ajio", logo: "/Brand logos/Ajio.webp", deal: "Instant Cart Coupons", tag: "Trends" },
  { name: "Nykaa", logo: "/Brand logos/Nykaa.webp", deal: "Beauty Freebies", tag: "Wellness" },
  { name: "Croma", logo: "/Brand logos/croma.svg", deal: "Electronics Warranty", tag: "Gadgets" },
  {
    name: "Meesho",
    logo: "/Brand logos/Meesho_logo.webp",
    deal: "Factory Direct Deals",
    tag: "Budget",
  },
  {
    name: "Tata CLiQ",
    logo: "/Brand logos/Tata-cliq.webp",
    deal: "Luxury & Tech Coupons",
    tag: "Official",
  },
  {
    name: "FirstCry",
    logo: "/Brand logos/FirstCry_logo.svg.webp",
    deal: "Baby & Kids Savings",
    tag: "Family",
  },
  {
    name: "Reliance",
    logo: "/Brand logos/reliance.svg",
    deal: "Store Pickup Deals",
    tag: "Digital",
  },
];

const socials = [
  {
    href: "https://twitter.com/gocoupon_in",
    label: "GoCoupon on Twitter / X",
    name: "X (Twitter)",
    icon: TwitterIcon,
  },
  {
    href: "https://instagram.com/gocoupon.io",
    label: "GoCoupon on Instagram",
    name: "Instagram",
    icon: InstagramIcon,
  },
  {
    href: "https://facebook.com/gocouponapp",
    label: "GoCoupon on Facebook",
    name: "Facebook",
    icon: FacebookIcon,
  },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [emailError, setEmailError] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    setSubscribed(true);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative overflow-hidden border-t border-border/80 bg-background pt-20 pb-12 transition-colors">
      {/* ── Ambient Spatial Lighting & Subtle Background Grid ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-20"
        style={{
          backgroundImage: `radial-gradient(var(--border) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
        aria-hidden="true"
      />
      {/* Floating Aurora Glow Orbs */}
      <div
        className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[100px] animate-ambient-pulse-slow"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 -right-20 h-96 w-96 rounded-full bg-indigo-500/10 dark:bg-emerald-500/10 blur-[120px] animate-ambient-pulse-slow [animation-delay:3s]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── 1. Interactive Savings Radar Hub (Conceptual Top CTA Card) ── */}
        <div className="relative mb-20 overflow-hidden rounded-3xl border border-border/80 bg-card/60 p-8 shadow-2xl backdrop-blur-xl sm:p-12">
          {/* Subtle linear top border gradient highlight */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"
            aria-hidden="true"
          />

          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            {/* Left: Value Proposition & Live Beacon */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-radar-beacon" />
                </span>
                <span className="font-mono uppercase tracking-wider">
                  Live Savings Radar Active
                </span>
                <span className="text-emerald-400/50">•</span>
                <span className="font-medium text-emerald-700 dark:text-emerald-300">
                  200+ Stores Monitored 24/7
                </span>
              </div>

              <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl text-balance">
                Never Overpay Online Again.
              </h2>
              <p className="max-w-xl text-base text-muted-foreground leading-relaxed">
                GoCoupon is the high-precision shopping intelligence platform that tests verified
                promo codes, compares live multi-store prices, and locks in highest category
                cashback automatically.
              </p>

              {/* Feature Trust Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  100% Free Forever
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Chrome Manifest V3 Private
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Zero Account Required
                </span>
              </div>
            </div>

            {/* Right: Interactive Actions & Instant Drop Alerts */}
            <div className="flex flex-col gap-5 lg:border-l lg:border-border/60 lg:pl-10">
              {/* Primary Chrome Action Button */}
              <Link
                to="/chrome-extension"
                className="group relative inline-flex min-h-[52px] w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/35 focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer-fast"
                  aria-hidden="true"
                />
                <Sparkles className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                <span>Get GoCoupon for Chrome</span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">
                  Free
                </span>
              </Link>

              {/* Instant Price Drop Alerts Form */}
              <div className="rounded-2xl border border-border/80 bg-background/80 p-4 shadow-xs">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-foreground">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    Instant Price Drop Radar
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">Zero Spam</span>
                </div>

                {subscribed ? (
                  <div
                    className="flex items-center gap-2 rounded-xl bg-emerald-500/15 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    role="status"
                    aria-live="polite"
                  >
                    <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span>
                      You&apos;re connected! We&apos;ll ping you when your monitored items drop in
                      price.
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) setEmailError("");
                        }}
                        placeholder="your.email@example.com…"
                        autoComplete="email"
                        spellCheck={false}
                        inputMode="email"
                        aria-label="Email for price drop alerts"
                        className="min-h-[44px] flex-1 rounded-xl border border-border bg-card px-3.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary"
                      />
                      <button
                        type="submit"
                        className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl bg-secondary px-4 text-xs font-bold text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        Join
                      </button>
                    </div>
                    {emailError && (
                      <p
                        className="text-xs font-medium text-rose-500"
                        role="alert"
                        aria-live="polite"
                      >
                        {emailError}
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Infinite Partner Stream Marquee ── */}
        <div className="mb-20 space-y-3">
          <div className="flex items-center justify-between px-1 text-xs font-mono tracking-wider uppercase text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-primary" />
              Connected Merchant Ecosystem
            </span>
            <span>200+ Retailers Integrated</span>
          </div>

          <div
            className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card/40 py-3 backdrop-blur-sm"
            style={{
              maskImage:
                "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            }}
          >
            <div className="flex w-max gap-4 marquee-track group-hover:[animation-play-state:paused]">
              {/* Render twice for continuous seamless infinite loop */}
              {[...partnerStores, ...partnerStores].map((store, idx) => (
                <div
                  key={`${store.name}-${idx}`}
                  className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/80 px-4 py-2 shadow-xs transition-transform duration-200 hover:scale-105"
                >
                  <div className="flex h-7 w-12 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-card p-1 border border-border/60">
                    <img
                      src={store.logo}
                      alt={store.name}
                      width={48}
                      height={24}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">{store.name}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {store.deal}
                    </span>
                  </div>
                  <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[9px] font-semibold text-primary">
                    {store.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3. Conceptual 4-Pillar Navigation Grid ── */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 mb-16">
          {/* Brand Col */}
          <div className="space-y-4 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2.5" aria-label="GoCoupon — home">
              <span className="inline-flex items-center rounded-lg transition-transform hover:scale-105">
                <img
                  src="/gc-logo.webp"
                  alt="GoCoupon"
                  className="h-8 w-auto dark:hidden"
                  width={130}
                  height={32}
                  loading="lazy"
                  decoding="async"
                />
                <img
                  src="/gc-logo-dark.webp"
                  alt="GoCoupon"
                  className="hidden h-8 w-auto dark:block"
                  width={130}
                  height={32}
                  loading="lazy"
                  decoding="async"
                />
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Official free Chrome extension and shopping intelligence platform for online shoppers
              across India and worldwide.
            </p>

            <div className="pt-2 text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Globe className="h-3.5 w-3.5 text-primary" />
                Global Store Coverage
              </div>
              <p>Engineering HQ in Bengaluru, India</p>
              <p className="font-mono text-primary font-medium">https://gocoupon.io/</p>
            </div>

            {/* Social Icons with Interactive Hover Ring */}
            <div className="pt-2">
              <div className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Follow GoCoupon
              </div>
              <ul className="flex items-center gap-2.5" aria-label="goCoupon on social media">
                {socials.map(({ href, label, name, icon: Icon }) => (
                  <li key={name}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      title={name}
                      className="group relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-all duration-300 hover:border-primary/50 hover:bg-primary/10 hover:text-primary hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <Icon />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 4 Thematic Columns */}
          {navColumns.map((col) => {
            const Icon = col.icon;
            return (
              <div key={col.title} className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-foreground">
                    {col.title}
                  </h3>
                </div>

                <ul className="space-y-1.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.isExternal && link.href ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex min-h-[36px] items-center justify-between text-sm text-muted-foreground transition-all duration-200 hover:text-foreground hover:translate-x-1"
                        >
                          <span className="flex items-center gap-1.5">
                            <ChevronRight className="h-3 w-3 -ml-3 opacity-0 text-primary transition-all duration-200 group-hover:ml-0 group-hover:opacity-100" />
                            <span>{link.label}</span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            {link.badge && (
                              <span
                                className={`rounded-md border px-1.5 py-0.5 font-mono text-[9px] font-bold ${
                                  link.badgeColor || "bg-muted text-muted-foreground border-border"
                                }`}
                              >
                                {link.badge}
                              </span>
                            )}
                            <ExternalLink className="h-3 w-3 text-muted-foreground/60 opacity-0 transition-opacity group-hover:opacity-100" />
                          </div>
                        </a>
                      ) : (
                        <Link
                          to={link.to!}
                          className="group flex min-h-[36px] items-center justify-between text-sm text-muted-foreground transition-all duration-200 hover:text-foreground hover:translate-x-1"
                        >
                          <span className="flex items-center gap-1.5">
                            <ChevronRight className="h-3 w-3 -ml-3 opacity-0 text-primary transition-all duration-200 group-hover:ml-0 group-hover:opacity-100" />
                            <span>{link.label}</span>
                          </span>
                          {link.badge && (
                            <span
                              className={`rounded-md border px-1.5 py-0.5 font-mono text-[9px] font-bold ${
                                link.badgeColor || "bg-muted text-muted-foreground border-border"
                              }`}
                            >
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* ── 4. Real-Time Telemetry & Trust Matrix ── */}
        <div className="mb-12 rounded-2xl border border-border/80 bg-card/30 p-4 backdrop-blur-xs">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-center sm:text-left">
            <div className="flex items-center gap-2.5 sm:border-r sm:border-border/60 sm:pr-4">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div>
                <div className="text-[11px] font-mono uppercase text-muted-foreground">
                  Platform Engine
                </div>
                <div className="text-xs font-bold text-foreground">100% Operational</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:border-r sm:border-border/60 sm:pr-4">
              <Lock className="h-3.5 w-3.5 text-primary shrink-0" />
              <div>
                <div className="text-[11px] font-mono uppercase text-muted-foreground">
                  Privacy Isolation
                </div>
                <div className="text-xs font-bold text-foreground">Manifest V3 Sandboxed</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:border-r sm:border-border/60 sm:pr-4">
              <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <div>
                <div className="text-[11px] font-mono uppercase text-muted-foreground">
                  Edge Matching
                </div>
                <div className="text-xs font-bold text-foreground">&lt;15ms Latency</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Building2 className="h-3.5 w-3.5 text-sky-500 shrink-0" />
              <div>
                <div className="text-[11px] font-mono uppercase text-muted-foreground">
                  Engineering HQ
                </div>
                <div className="text-xs font-bold text-foreground">Bengaluru, India</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 5. Bottom Copyright, Trust Statement & Smooth Back-to-Top ── */}
        <div className="flex flex-col items-center justify-between gap-6 border-t border-border/80 pt-8 sm:flex-row">
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <p className="font-mono text-xs text-muted-foreground flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
              <span>© 2026 GoCoupon.io • Crafted with</span>
              <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 animate-pulse" />
              <span>for smart shoppers • 100% Free Forever</span>
            </p>
            <p className="text-[11px] text-muted-foreground/80">
              Prices, promo coupons, and cashback tiering verified against real-time merchant
              partner feeds.
            </p>
          </div>

          {/* Back to Top Smooth Scroll Button */}
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll back to top of page"
            className="group inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground shadow-xs transition-all duration-300 hover:border-primary/50 hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span>Back to top</span>
            <ArrowUp className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-1" />
          </button>
        </div>
      </div>
    </footer>
  );
}

function FacebookIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className="transition-transform duration-200 group-hover:scale-110"
    >
      <path d="M22 12a10 10 0 1 0-11.56 9.88V15H7.9V12h2.54V9.79c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 3h-2.33v6.88A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className="transition-transform duration-200 group-hover:scale-110"
    >
      <path d="M18.244 2H21l-6.52 7.455L22 22h-6.164l-4.83-6.31L5.4 22H2.64l6.98-7.98L2 2h6.32l4.37 5.77L18.244 2Zm-2.16 18h1.705L7.02 4H5.22l10.865 16Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="transition-transform duration-200 group-hover:scale-110"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
