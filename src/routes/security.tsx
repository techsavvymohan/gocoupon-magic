import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Cpu,
  KeyRound,
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { MagneticButton } from "@/components/MagneticButton";

export const Route = createFileRoute("/security")({
  component: SecurityPage,
  head: () =>
    createSeoHead({
      title: "Security & Trust Center – How goCoupon Protects Your Privacy",
      description:
        "Learn how goCoupon secures your shopping sessions. We use Chrome Manifest V3, zero keystroke logging, no banking data access, and strict data minimization.",
      path: "/security",
      keywords:
        "goCoupon security, is gocoupon safe, chrome extension safety, coupon extension privacy, data protection india",
    }),
});

function SecurityPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Security & Trust Center", path: "/security" },
  ]);

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* Hero Header */}
      <section className="relative border-b border-border px-6 pb-16 pt-20 sm:pt-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1 font-mono text-xs uppercase tracking-[0.2em] text-emerald-500">
            <ShieldCheck className="h-4 w-4" />
            Security &amp; Trust Center
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Built with Privacy &amp; Security from Day One.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            We understand that installing a browser extension requires trust. Here is the technical breakdown of how we keep your browsing fast, private, and secure.
          </p>
        </div>
      </section>

      {/* Security Architecture Grid */}
      <section className="border-b border-border px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <EyeOff className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">
                Zero Keystroke Logging
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                goCoupon never intercepts passwords, search queries, personal messages, or emails. We only inspect the coupon code input field on verified checkout pages.
              </p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">
                No Banking or Card Access
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Payment gateways (UPI, CVV, OTP, Credit Card numbers) are sandboxed and completely invisible to goCoupon. Your financial details remain 100% private.
              </p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">
                Chrome Manifest V3
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Built strictly on Google's modern Manifest V3 platform, which prohibits remotely hosted executable code and guarantees sandboxed execution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table: What we see vs what we don't */}
      <section className="border-b border-border bg-muted/20 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Data Visibility: Complete Transparency
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A clear comparison of what our extension accesses vs. what is strictly blocked.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {/* What we access */}
            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border pb-4 font-display text-lg font-bold text-emerald-500">
                <CheckCircle2 className="h-5 w-5" />
                What goCoupon Accesses
              </div>
              <ul className="mt-6 space-y-4 text-sm text-foreground/90">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>The store domain name (e.g. flipkart.com) to fetch relevant active promo codes.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>The coupon input box element on checkout to write candidate promo codes.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>The cart subtotal before and after coupon tests to compute net rupee savings.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Aggregated anonymized success/fail metrics for codes to update our global index.</span>
                </li>
              </ul>
            </div>

            {/* What we NEVER access */}
            <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-8 shadow-sm">
              <div className="flex items-center gap-2 border-b border-destructive/20 pb-4 font-display text-lg font-bold text-destructive">
                <XCircle className="h-5 w-5" />
                What goCoupon NEVER Accesses
              </div>
              <ul className="mt-6 space-y-4 text-sm text-foreground/90">
                <li className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <span>Your passwords, OTPs, or login credentials on any website.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <span>Credit/debit card numbers, CVVs, or UPI PINs.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <span>Your browsing activity, search history, or personal tabs outside store checkout.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <span>Personal identity details (we never sell user data to data brokers or advertisers).</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance & Standards */}
      <section className="border-b border-border px-6 py-20">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
            Regulatory Compliance
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Compliance with Global &amp; Indian Privacy Standards
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>
              goCoupon complies with the <strong>Digital Personal Data Protection (DPDP) Act 2023</strong> of India, the <strong>General Data Protection Regulation (GDPR)</strong>, and Google Chrome Web Store&apos;s strict <strong>Single Purpose &amp; User Data Policy</strong>.
            </p>
            <p>
              All communications between the extension and our verification servers occur over encrypted TLS 1.3 channels. We do not require you to create an account, enter your email, or provide personal details to start saving.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display text-base font-bold text-foreground">
              Vulnerability Disclosure &amp; Bug Bounty
            </h3>
            <p className="mt-2 text-xs text-muted-foreground">
              Security researchers: If you discover a potential vulnerability in goCoupon, please report it responsibly to{" "}
              <a href="mailto:security@gocoupon.io" className="text-primary font-medium hover:underline">
                security@gocoupon.io
              </a>
              . We review and respond to reports within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-10 text-center shadow-lg sm:p-14">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Experience 100% safe, automated savings.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Add goCoupon to Google Chrome in seconds. No account, no credit card, no risk.
          </p>
          <div className="mt-8">
            <MagneticButton
              as="a"
              href="https://chromewebstore.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:scale-105"
            >
              <span>Add to Chrome — Free</span>
              <ArrowRight className="h-4 w-4" />
            </MagneticButton>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
