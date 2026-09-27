import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { ContactForm } from "@/components/site/ContactForm";
import { breadcrumbSchema, createSeoHead, faqSchema } from "@/lib/seo";
import {
  Clock,
  ShieldCheck,
  Building2,
  Mail,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  Headphones,
  Award,
  Zap,
  Globe2,
} from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () =>
    createSeoHead({
      title: "Contact GoCoupon Team & Customer Support Desk",
      description:
        "Get in touch with the GoCoupon customer support desk in Bangalore. Inquiries on extension troubleshooting, merchant partnerships, coupon submissions, and press.",
      path: "/contact",
      keywords:
        "contact gocoupon, gocoupon customer support, coupon extension help desk, bangalore coupon team, merchant coupon partnerships, gocoupon help",
    }),
});

const contactFaqs = [
  {
    question: "What is the typical response time for support inquiries?",
    answer:
      "Our dedicated customer advocacy and engineering team in Bangalore reviews and responds to all inquiries within 2 hours during active business hours (Monday through Saturday, 9:00 AM to 8:00 PM IST). Inquiries submitted outside these hours are addressed first thing the next morning.",
  },
  {
    question: "Where can I find self-service troubleshooting guides for the Chrome extension?",
    answer:
      "Before submitting an inquiry, we encourage you to check our official Help Center (/help), which includes step-by-step guides on toolbar pinning, resolving checkout overlay conflicts, whitelisting stores, and understanding coupon auto-apply mechanics.",
  },
  {
    question: "How can retailers and affiliate networks partner with GoCoupon?",
    answer:
      "Retail brands and e-commerce stores can list active coupon codes, share exclusive voucher vouchers, or request affiliate integration by selecting 'Partnership / Merchant Inquiries' in our contact form or emailing partnerships@gocoupon.io. Submissions undergo algorithmic verification within 24 hours.",
  },
  {
    question: "How do I submit a working promo code I discovered?",
    answer:
      "If you found a working coupon or hidden store discount, please use our community submission portal at /submit-coupon. Our automated parallel verification engine tests submitted codes across store checkout forms in under 850 milliseconds before publishing to the live feed.",
  },
  {
    question: "Where can I view confirmation of my submitted contact request?",
    answer:
      "Once you submit the contact form, you will receive an on-screen confirmation and can view your ticket status and response SLA details on our dedicated Inquiry Confirmation page (/thank-you?source=contact).",
  },
];

function ContactPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Contact Support", path: "/contact" },
  ]);
  const faqStructuredData = faqSchema(contactFaqs);

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />

      <div className="pt-6">
        <ContactForm />
      </div>

      {/* Authority & E-E-A-T Support Commitments */}
      <section className="border-t border-border px-4 sm:px-6 py-16 bg-muted/20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 font-mono text-xs uppercase tracking-wider text-primary mb-3">
              <Headphones className="h-3.5 w-3.5" />
              Customer Advocacy SLA
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              Our 4 Pillars of Dedicated Consumer Support
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Every ticket is assigned directly to our consumer advocacy team in Bangalore. We do not use automated bot deflectors or canned generic brush-offs.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-base text-foreground">&lt; 2-Hour Response SLA</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Active desk coverage Monday through Saturday, 9am–8pm IST. Urgent checkout errors are flagged for immediate engineering triaging.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-base text-foreground">Zero-Data Leak Policy</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Your contact details are encrypted and never shared with third-party advertisers. Inquiries are purged after 90 days of resolution.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 mb-4">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-base text-foreground">Direct Merchant Escalation</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Direct liaison with 200+ partner store affiliate desks (Amazon, Flipkart, Myntra) to resolve missing cashback or invalid coupon reports.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 mb-4">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-base text-foreground">100% Human Verification</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Coupon corrections and store suggestions are physically verified on live shopping carts by our research team before database updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Support Telemetry Benchmarks */}
      <section className="border-t border-border px-4 sm:px-6 py-14 bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 shadow-sm">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-6 text-center sm:text-left">
              Real-World Support Telemetry (2026 Live Metrics)
            </h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
              <div className="sm:pr-6 pt-4 sm:pt-0">
                <div className="font-display text-3xl sm:text-4xl font-extrabold text-foreground">98.4%</div>
                <div className="mt-1 text-xs uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400">
                  First-Contact Resolution
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Inquiries resolved on the very first agent response without back-and-forth delays.
                </p>
              </div>
              <div className="sm:px-6 pt-4 sm:pt-0">
                <div className="font-display text-3xl sm:text-4xl font-extrabold text-foreground">1.8h</div>
                <div className="mt-1 text-xs uppercase tracking-wider font-semibold text-primary">
                  Median Resolution Time
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Average time from ticket receipt to solution dispatch across all user categories.
                </p>
              </div>
              <div className="sm:px-6 pt-4 sm:pt-0">
                <div className="font-display text-3xl sm:text-4xl font-extrabold text-foreground">14,800+</div>
                <div className="mt-1 text-xs uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400">
                  Inquiries Resolved
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Total consumer questions, bug reports, and merchant submissions handled in 2026.
                </p>
              </div>
              <div className="sm:pl-6 pt-4 sm:pt-0">
                <div className="font-display text-3xl sm:text-4xl font-extrabold text-foreground">4.9 / 5</div>
                <div className="mt-1 text-xs uppercase tracking-wider font-semibold text-amber-500">
                  User Satisfaction Score
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Verified rating calculated from post-resolution customer satisfaction surveys.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive FAQ Section */}
      <section className="border-t border-border px-4 sm:px-6 py-16 bg-muted/10">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Frequently Asked Support Questions
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Quick answers to the most common questions our support desk receives.
            </p>
          </div>

          <div className="space-y-4">
            {contactFaqs.map((faq, index) => (
              <div
                key={faq.question}
                className="rounded-2xl border border-border bg-card p-6 shadow-xs"
              >
                <h3 className="font-display font-bold text-base text-foreground flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-mono text-xs">
                    {index + 1}
                  </span>
                  <span>{faq.question}</span>
                </h3>
                <p className="mt-3 pl-9 text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          {/* Quick Contextual Links */}
          <div className="mt-12 rounded-2xl border border-border bg-card p-6 text-center">
            <h4 className="font-display font-bold text-base text-foreground mb-3">
              Explore More Self-Service Tools &amp; Guides
            </h4>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
              <Link to="/help" className="text-primary font-semibold hover:underline">
                Help Center &amp; FAQs →
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/submit-coupon" className="text-primary font-semibold hover:underline">
                Submit a Coupon →
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/featured-deals" className="text-primary font-semibold hover:underline">
                Featured Partner Deals →
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/thank-you" search={{ source: "contact" }} className="text-primary font-semibold hover:underline">
                Inquiry Confirmation Status →
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/chrome-extension" className="text-primary font-semibold hover:underline">
                Chrome Extension →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
