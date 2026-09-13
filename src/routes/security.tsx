import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  KeyRound,
  CheckCircle2,
  XCircle,
  ArrowRight,
  HeartHandshake,
} from "lucide-react";
import { MagneticButton } from "@/components/MagneticButton";

export const Route = createFileRoute("/security")({
  component: SecurityPage,
  head: () =>
    createSeoHead({
      title: "Security & Trust Center – How GoCoupon Protects Your Privacy",
      description:
        "Learn how GoCoupon protects your privacy with bank-grade encryption, zero password tracking, no card access, and zero data selling.",
      path: "/security",
      keywords:
        "gocoupon security, is gocoupon safe, chrome extension safety, coupon extension privacy, safe shopping extension",
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
      <section className="relative border-b border-border px-6 pb-16 pt-20 sm:pt-28 overflow-hidden text-center bg-background">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Your Privacy &amp; Safety Come First. Always.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
            We understand that installing a browser extension requires trust. Here is the plain-English
            breakdown of how we keep your shopping fast, private, and 100% safe.
          </p>
        </div>
      </section>

      {/* 3 Core Safety Pillars */}
      <section className="border-b border-border px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              Our Privacy Guarantees
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How GoCoupon Protects You
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Built with zero-knowledge privacy standards so you can shop with total confidence.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {/* Box 1 */}
            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm text-center">
              <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">
                Bank-Grade Encryption
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                All saved preferences on your browser use the same high-standard AES encryption trusted by financial apps to keep your device secure.
              </p>
              <div className="mt-4 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                ✓ 100% Encrypted on Your Device
              </div>
            </div>

            {/* Box 2 */}
            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm text-center">
              <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <EyeOff className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">
                Zero Keystroke Tracking
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                We never watch what you type, read your emails, or record your passwords. We only check for the coupon box when you reach checkout.
              </p>
              <div className="mt-4 font-mono text-[11px] text-primary font-bold">
                ✓ Passwords &amp; Chats 100% Private
              </div>
            </div>

            {/* Box 3 */}
            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm text-center">
              <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-sky-500/10 text-sky-500">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">
                No Banking or Card Access
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Payment gateways (Credit Card numbers, CVVs, UPI PINs, bank OTPs) are strictly blocked and invisible to GoCoupon.
              </p>
              <div className="mt-4 font-mono text-[11px] text-sky-500 font-bold">
                ✓ Payments Completely Sandboxed
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table: What we access vs what we don't */}
      <section className="border-b border-border bg-muted/20 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Complete Transparency: What We See vs. What We Don&apos;t
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A clear, honest comparison so you know exactly how GoCoupon operates.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {/* What we access */}
            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border pb-4 font-display text-lg font-bold text-emerald-500">
                <CheckCircle2 className="h-5 w-5" />
                What GoCoupon Checks
              </div>
              <ul className="mt-6 space-y-4 text-sm text-foreground/90">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>The store website name (e.g. amazon.com or flipkart.com) to find matching discount codes.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>The promo code input box and green coupon buttons to apply discounts for you.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Your cart total before and after testing codes so we can tell you how much money you saved.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Anonymous code success metrics so other shoppers get working codes.</span>
                </li>
              </ul>
            </div>

            {/* What we NEVER access */}
            <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-8 shadow-sm">
              <div className="flex items-center gap-2 border-b border-destructive/20 pb-4 font-display text-lg font-bold text-destructive">
                <XCircle className="h-5 w-5" />
                What GoCoupon NEVER Sees
              </div>
              <ul className="mt-6 space-y-4 text-sm text-foreground/90">
                <li className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <span>Your passwords, 2FA codes, or login details on any website.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <span>Credit/debit card numbers, CVVs, or bank payment credentials.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <span>Your web browsing history, search queries, or personal tabs.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <span>Personal identity data (we never sell user data to brokers or advertisers).</span>
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
            Privacy Standards
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Compliant with Global Privacy Policies
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>
              GoCoupon strictly complies with Google Chrome Web Store&apos;s <strong>Single Purpose &amp; User Data Policy</strong>, the <strong>General Data Protection Regulation (GDPR)</strong>, and India&apos;s <strong>Digital Personal Data Protection Act</strong>.
            </p>
            <p>
              You do not need to create an account, enter your email, or provide personal details to start saving with GoCoupon.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display text-base font-bold text-foreground">
              Questions or Security Reports?
            </h3>
            <p className="mt-2 text-xs text-muted-foreground">
              If you have any questions regarding your privacy, please contact us at{" "}
              <a href="mailto:support@gocoupon.io" className="text-primary font-medium hover:underline">
                support@gocoupon.io
              </a>
              . We respond to all inquiries within 24 hours.
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
            Add GoCoupon to Google Chrome in 10 seconds. No account, no credit card, no risk.
          </p>
          <div className="mt-8">
            <MagneticButton
              as="a"
              href="https://chromewebstore.google.com/detail/gbmfihnboadlmmjbikajlmocjmlpehij"
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
