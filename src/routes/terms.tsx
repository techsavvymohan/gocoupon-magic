import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import { ShieldCheck, FileText, Scale, AlertCircle, HelpCircle, CheckCircle2 } from "lucide-react";

const LAST_UPDATED = "April 30, 2026";
const CONTACT_EMAIL = "support@gocoupon.io";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () =>
    createSeoHead({
      title: "Terms of Service – goCoupon Chrome Extension",
      description:
        "Read the goCoupon terms of service. Understand extension usage rules, affiliate disclosures, intellectual property rights, and user agreements.",
      path: "/terms",
      keywords:
        "goCoupon terms of service, chrome extension terms, coupon extension agreement, goCoupon legal, user terms",
    }),
});

function TermsPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Terms of Service", path: "/terms" },
  ]);

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* Hero Header */}
      <section className="relative border-b border-border px-6 pb-16 pt-20 sm:pt-28">
        <div className="mx-auto max-w-4xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            <Scale className="h-3.5 w-3.5" />
            Legal Agreement
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Terms of Service
          </h1>
          <p className="mt-5 text-base text-muted-foreground sm:text-lg">
            Please read these terms carefully before using the goCoupon browser extension or website.
            By using goCoupon, you agree to be bound by these provisions.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-6 font-mono text-xs text-muted-foreground">
            <span>Last revised: {LAST_UPDATED}</span>
            <span>•</span>
            <span>Effective date: January 1, 2024</span>
          </div>
        </div>
      </section>

      {/* Quick Summary Banner */}
      <section className="border-b border-border bg-muted/40 px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Quick Summary (Plain English)
            </h2>
            <ul className="mt-3 grid gap-2.5 text-sm text-muted-foreground sm:grid-cols-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>goCoupon is 100% free to install and use without paid tiers.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>We never sell or monetize your private personal information.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>We earn affiliate commissions from merchant partners when you save.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>Coupon availability and discount values are determined by merchants.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Main Legal Content */}
      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-4xl gap-12">
          <div className="space-y-12 text-foreground/90">
            <article id="acceptance" className="space-y-4">
              <h2 className="font-display text-2xl font-bold text-foreground">
                1. Acceptance of Terms
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you
                (&ldquo;User&rdquo;, &ldquo;you&rdquo;) and goCoupon (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;), governing your access to
                and use of the goCoupon Chrome extension, website at{" "}
                <Link to="/" className="text-primary hover:underline">
                  gocoupon.io
                </Link>
                , and associated services.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                By downloading, installing, accessing, or using goCoupon, you acknowledge that you have read,
                understood, and agree to be bound by these Terms and our{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                . If you do not agree, you must uninstall and discontinue using goCoupon immediately.
              </p>
            </article>

            <article id="license" className="space-y-4">
              <h2 className="font-display text-2xl font-bold text-foreground">
                2. Grant of Limited License
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                Subject to your compliance with these Terms, goCoupon grants you a personal, revocable,
                non-exclusive, non-transferable, and royalty-free license to install and use the goCoupon
                browser extension solely for your personal, non-commercial shopping use.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                You agree not to:
              </p>
              <ul className="list-inside list-disc space-y-1.5 text-sm text-muted-foreground">
                <li>Reverse-engineer, decompile, disassemble, or derive the source code of goCoupon.</li>
                <li>Use automated scripts, scrapers, or bots to harvest data or abuse our coupon servers.</li>
                <li>Distribute, sell, lease, sublicense, or commercially exploit any part of goCoupon.</li>
                <li>Interfere with or bypass any security features or network endpoints of the extension.</li>
              </ul>
            </article>

            <article id="service-description" className="space-y-4">
              <h2 className="font-display text-2xl font-bold text-foreground">
                3. Description of Service &amp; Automation
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                goCoupon is an automated shopping companion designed to assist users by identifying, testing,
                and applying coupon codes and displaying cashback or reward opportunities on supported merchant
                websites (including Flipkart, Amazon India, Myntra, Meesho, and others).
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                While we strive to provide accurate and active coupon codes, promotional discounts and
                cashback rates are subject to third-party merchant rules, inventory status, minimum cart
                thresholds, and geographic eligibility. goCoupon does not guarantee that a coupon will always
                succeed or yield a discount.
              </p>
            </article>

            <article id="affiliate-disclosure" className="space-y-4">
              <h2 className="font-display text-2xl font-bold text-foreground">
                4. Affiliate Disclosure &amp; Commercial Relationships
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                goCoupon is free for all users. To support our development and infrastructure, we participate in
                affiliate marketing programs (including Amazon Associates, Flipkart Affiliate Program, and major
                affiliate networks). When you click our links or use our extension to complete a purchase, we
                may receive an affiliate commission from the merchant at <strong>no additional cost to you</strong>.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                For detailed disclosures, please read our dedicated{" "}
                <Link to="/disclosure" className="text-primary hover:underline">
                  Affiliate Disclosure
                </Link>
                .
              </p>
            </article>

            <article id="third-party-merchants" className="space-y-4">
              <h2 className="font-display text-2xl font-bold text-foreground">
                5. Third-Party Merchants &amp; External Links
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                goCoupon is an independent software tool and is not owned, operated, or endorsed by Amazon,
                Flipkart, Myntra, Meesho, or any other merchant unless explicitly stated. Any purchases,
                shipping, returns, warranties, or payment disputes are strictly between you and the respective
                merchant.
              </p>
            </article>

            <article id="intellectual-property" className="space-y-4">
              <h2 className="font-display text-2xl font-bold text-foreground">
                6. Intellectual Property Rights
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                The goCoupon name, logo, extension codebase, user interface, graphics, and proprietary
                algorithms are the exclusive property of goCoupon and protected by intellectual property laws.
                All merchant logos and trademarks displayed on this site belong to their respective owners and
                are used solely for identification purposes.
              </p>
            </article>

            <article id="disclaimers" className="space-y-4">
              <h2 className="font-display text-2xl font-bold text-foreground">
                7. Disclaimer of Warranties
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                GOCOUPON IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS WITHOUT WARRANTIES OF
                ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A
                PARTICULAR PURPOSE, ACCURACY OF COUPONS, OR UNINTERRUPTED SERVICE.
              </p>
            </article>

            <article id="liability" className="space-y-4">
              <h2 className="font-display text-2xl font-bold text-foreground">
                8. Limitation of Liability
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, GOCOUPON AND ITS FOUNDERS, EMPLOYEES, AND
                PARTNERS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES,
                INCLUDING LOSS OF PROFITS, DATA, SAVINGS, OR GOODWILL ARISING FROM YOUR USE OF THE EXTENSION.
              </p>
            </article>

            <article id="governing-law" className="space-y-4">
              <h2 className="font-display text-2xl font-bold text-foreground">
                9. Governing Law &amp; Jurisdiction
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of India, under the
                provisions of the Information Technology Act, 2000. Any disputes arising hereunder shall be subject
                to the exclusive jurisdiction of the competent courts in Bengaluru, Karnataka, India.
              </p>
            </article>

            <article id="security-manifest" className="space-y-4">
              <h2 className="font-display text-2xl font-bold text-foreground">
                10. Technical Sandboxing &amp; Manifest V3 Security
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                GoCoupon operates in strict conformance with Google Chrome Manifest V3 guidelines. All script execution
                is sandboxed locally within the browser client. The extension does not load remote scripts, inspect
                passwords, intercept multi-factor authentication tokens, or capture keyboard inputs outside designated
                retailer promo code form elements.
              </p>
            </article>

            <article id="community-submissions" className="space-y-4">
              <h2 className="font-display text-2xl font-bold text-foreground">
                11. Community Deals &amp; User Submissions
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                Users who submit promo codes or deals via our{" "}
                <Link to="/submit-coupon" className="text-primary hover:underline font-semibold">
                  Community Coupon Submission Portal
                </Link>{" "}
                grant GoCoupon a perpetual, irrevocable, royalty-free, worldwide license to verify, format, test,
                and publish the submitted promo code to the public deals index. You warrant that submitted coupons do not
                violate non-disclosure agreements or proprietary confidentiality obligations.
              </p>
            </article>

            <article id="uninstallation-reversal" className="space-y-4">
              <h2 className="font-display text-2xl font-bold text-foreground">
                12. Discontinuation, Feedback &amp; Uninstallation
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                You may discontinue use of GoCoupon at any time by right-clicking the extension icon in your browser toolbar
                and selecting &ldquo;Remove from Chrome&rdquo;. To report bugs or review offboarding instructions, visit our{" "}
                <Link to="/uninstall" className="text-primary hover:underline font-semibold">
                  Extension Uninstall &amp; Feedback Guide
                </Link>
                . For setup instructions, see our{" "}
                <Link to="/welcome" className="text-primary hover:underline font-semibold">
                  Welcome Setup Guide
                </Link>
                .
              </p>
            </article>

            <article id="contact-legal" className="space-y-4 border-t border-border pt-8">
              <h2 className="font-display text-2xl font-bold text-foreground">
                13. Legal Inquiries &amp; Customer Support
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                If you have questions or concerns regarding these Terms of Service or affiliate operations, please reach our
                support desk at{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline font-semibold">
                  {CONTACT_EMAIL}
                </a>{" "}
                or submit a ticket via our{" "}
                <Link to="/contact" className="text-primary hover:underline font-semibold">
                  Contact Support Page
                </Link>
                . Submitted inquiries can be tracked on our{" "}
                <Link to="/thank-you" search={{ source: "contact" }} className="text-primary hover:underline font-semibold">
                  Inquiry Confirmation Desk
                </Link>
                .
              </p>
            </article>
          </div>

          {/* Quick Legal & Support Directory Links */}
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <h3 className="font-display font-bold text-base text-foreground mb-3">
              Helpful GoCoupon Shopping &amp; Support Links
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
              <Link to="/help" className="text-primary font-semibold hover:underline">
                Help Center &amp; FAQs →
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/featured-deals" className="text-primary font-semibold hover:underline">
                Featured Deals →
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/submit-coupon" className="text-primary font-semibold hover:underline">
                Submit a Coupon →
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/welcome" className="text-primary font-semibold hover:underline">
                Welcome Guide →
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/uninstall" className="text-primary font-semibold hover:underline">
                Uninstall Guide →
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
