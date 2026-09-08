import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  CreditCard,
  CheckCircle2,
  Copy,
  Check,
  Mail,
  ExternalLink,
  Trash2,
  Layers,
  Server,
  AlertTriangle,
  Clock,
  Globe,
  Database,
} from "lucide-react";

const LAST_UPDATED = "September 9, 2026";
const PRODUCT_NAME = "GoCoupon – Coupon Finder";
const EXTENSION_ID = "bbdcjoadldgankjdhdlmncacpkengnid";
const CONTACT_EMAIL = "support@gocoupon.io";
const SECONDARY_EMAIL = "gocoupon13@gmail.com";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () =>
    createSeoHead({
      title: "Privacy Policy & Chrome Web Store User Data Disclosure – GoCoupon",
      description:
        "Official GoCoupon Privacy Policy. Learn about our Chrome Web Store User Data Policy compliance, Manifest V3 security, zero data selling, and strict privacy protection.",
      path: "/privacy",
      keywords:
        "GoCoupon privacy policy, chrome web store user data policy, chrome extension privacy, coupon extension data collection, limited use compliance, gocoupon security, Purple Nickel compliance",
    }),
});

function PrivacyPage() {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(CONTACT_EMAIL);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Privacy Policy", path: "/privacy" },
  ]);

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "GoCoupon Privacy Policy & User Data Disclosure",
    description:
      "Privacy Policy and Chrome Web Store User Data Policy compliance for GoCoupon browser extension.",
    url: "https://gocoupon.io/privacy",
    datePublished: "2024-01-15",
    dateModified: "2026-09-09",
    publisher: {
      "@type": "Organization",
      name: "GoCoupon",
      url: "https://gocoupon.io",
      logo: "https://gocoupon.io/gc-logo.webp",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Customer Support & Privacy Inquiries",
        email: CONTACT_EMAIL,
      },
    },
  };

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />

      {/* Header / Hero */}
      <section className="relative border-b border-border px-6 pb-16 pt-20 sm:pt-28 overflow-hidden bg-background">
        <div className="mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-6 uppercase tracking-wider">
            <ShieldCheck size={14} />
            <span>Official Chrome Web Store Compliance Document</span>
          </div>

          <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Privacy Policy &amp; User Data Disclosure
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span><strong>Product:</strong> {PRODUCT_NAME}</span>
            <span>&bull;</span>
            <span><strong>Extension ID:</strong> <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-foreground">{EXTENSION_ID}</code></span>
            <span>&bull;</span>
            <span><strong>Website:</strong> <a href="https://gocoupon.io" className="text-primary hover:underline">https://gocoupon.io</a></span>
          </div>

          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            We built <strong className="text-foreground">GoCoupon</strong> to save you money automatically at checkout — not to collect, track, or monetize your personal data. This document provides a transparent, comprehensive disclosure of how the GoCoupon Chrome extension and website operate in full compliance with the{" "}
            <a
              href="https://developer.chrome.com/docs/webstore/program-policies"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:underline inline-flex items-center gap-1"
            >
              Google Chrome Web Store Developer Program Policies
              <ExternalLink size={12} />
            </a>
            , the Chrome Web Store User Data FAQ, and the Limited Use Requirements.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/50 px-2.5 py-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Status: Active &amp; Enforced
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/50 px-2.5 py-1">
              <Clock size={12} className="text-primary" />
              Effective Date: {LAST_UPDATED}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/50 px-2.5 py-1">
              <Mail size={12} className="text-primary" />
              {CONTACT_EMAIL}
            </span>
          </div>

          {/* Single Purpose Summary Banner */}
          <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-foreground">
            <div className="flex items-start gap-3.5">
              <ShieldCheck className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-primary">
                  Single Purpose Statement
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-foreground">
                  GoCoupon has a single, narrow purpose: <strong className="text-foreground font-semibold">automatically finding, testing, and applying promotional discount coupon codes and comparing product prices at checkout on supported online retail stores to save consumers money.</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Guarantees Grid */}
      <section className="border-b border-border bg-card/30 px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
              <div className="flex items-center gap-2.5 text-primary">
                <EyeOff size={18} />
                <span className="font-display text-sm font-bold text-foreground">Zero Account</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                No sign-up, email, phone number, or profile required to use GoCoupon.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
              <div className="flex items-center gap-2.5 text-emerald-500">
                <CreditCard size={18} />
                <span className="font-display text-sm font-bold text-foreground">Zero Payment Access</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Never inspects cards, CVVs, bank logins, UPI PINs, or wallet credentials.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
              <div className="flex items-center gap-2.5 text-primary">
                <ShieldCheck size={18} />
                <span className="font-display text-sm font-bold text-foreground">Zero Data Selling</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                We never sell, rent, or trade your data to third-party data brokers or advertisers.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
              <div className="flex items-center gap-2.5 text-amber-500">
                <Lock size={18} />
                <span className="font-display text-sm font-bold text-foreground">Manifest V3 Sandboxed</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Operates strictly within Chrome's isolated, sandboxed environment without remote scripts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Privacy Policy Content */}
      <section className="px-6 py-16">
        <article className="prose-policy mx-auto max-w-4xl text-foreground">
          {/* Table of Contents */}
          <div className="mb-12 rounded-2xl border border-border bg-card p-6 shadow-xs">
            <h2 className="!mt-0 !mb-4 font-display text-lg font-bold text-foreground">
              Table of Contents
            </h2>
            <ol className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 list-decimal pl-5">
              <li><a href="#overview" className="hover:text-primary">Overview &amp; Single Purpose Statement</a></li>
              <li><a href="#data-collection" className="hover:text-primary">User Data Collection &amp; Access</a></li>
              <li><a href="#data-handling" className="hover:text-primary">User Data Handling &amp; Processing</a></li>
              <li><a href="#data-storage" className="hover:text-primary">User Data Storage, Retention &amp; Deletion</a></li>
              <li><a href="#data-sharing" className="hover:text-primary">User Data Sharing &amp; Third-Party Disclosure</a></li>
              <li><a href="#limited-use" className="hover:text-primary">Chrome Web Store Limited Use Compliance</a></li>
              <li><a href="#permissions" className="hover:text-primary">Chrome Extension Permissions Justification</a></li>
              <li><a href="#affiliate" className="hover:text-primary">Affiliate &amp; Commercial Transparency</a></li>
              <li><a href="#contact" className="hover:text-primary">Contact Information &amp; Privacy Desk</a></li>
            </ol>
          </div>

          {/* Section 1 */}
          <h2 id="overview">1. Overview &amp; Single Purpose Statement</h2>
          <p>
            This Privacy Policy governs the <strong>{PRODUCT_NAME}</strong> browser extension (ID: <code>{EXTENSION_ID}</code>) and the <strong>gocoupon.io</strong> web platform. GoCoupon is committed to consumer transparency, data minimization, and strict compliance with the <strong>Google Chrome Web Store Developer Program Policies</strong>, the <strong>Chrome Web Store User Data FAQ</strong>, and the <strong>Limited Use Requirements</strong>.
          </p>
          <div className="not-prose my-4 rounded-xl border border-border bg-secondary/40 p-4 text-sm">
            <strong className="text-primary font-semibold">Single Purpose Statement:</strong><br />
            GoCoupon has a single, narrow purpose: <strong>automatically finding, testing, and applying promotional discount coupon codes and comparing product prices at checkout on supported online retail stores to save consumers money.</strong>
          </div>

          {/* Section 2 */}
          <h2 id="data-collection">2. User Data Collection &amp; Access</h2>
          <p>
            In accordance with Chrome Web Store Minimal Data requirements, GoCoupon accesses and collects only the technical data strictly necessary to execute coupon testing:
          </p>

          <h3>2.1 Data Categories We Access or Collect:</h3>
          <ol className="space-y-3 pl-5 list-decimal">
            <li>
              <strong>Shopping URLs and Merchant Domains (Web History / Scoped URLs):</strong><br />
              <em>What is accessed:</em> When you navigate to a supported e-commerce store (e.g., Amazon, Flipkart, Myntra, Meesho, Tata CLiQ, Croma, Reliance Digital, Walmart, Target, Best Buy), the extension detects the merchant hostname and checkout path to verify if coupon codes exist for that retailer.<br />
              <em>Scope:</em> GoCoupon <strong>never</strong> tracks, logs, or inspects broad web browsing history across non-supported or non-shopping websites.
            </li>
            <li>
              <strong>Website Content &amp; Checkout Form Fields (Website Content):</strong><br />
              <em>What is accessed:</em> On checkout pages, our sandboxed content scripts locate the discount/coupon code input box and the order total element to test candidate coupons and calculate savings.<br />
              <em>Scope:</em> GoCoupon only interacts with coupon input fields and order total numbers. We never read, capture, or inspect private cart items, personal customer details, or shipping addresses.
            </li>
            <li>
              <strong>Coupon Telemetry &amp; Anonymized Savings Results (User Activity):</strong><br />
              <em>What is collected:</em> When coupon codes are auto-applied, the extension transmits anonymous performance telemetry: the merchant name, the coupon code tested, whether it succeeded or failed, and the discount amount. Telemetry includes a cryptographic one-way hash of the checkout domain (<code>page_url_hash</code>). This contains <strong>zero</strong> personal identifiers.
            </li>
            <li>
              <strong>Local Extension Preferences (Local Storage):</strong><br />
              <em>What is collected:</em> User interface preferences (e.g., sound toggles, auto-apply preferences, recent store cache) stored locally on your device via <code>chrome.storage.local</code>.
            </li>
            <li>
              <strong>Affiliate Click Audit Records (User-Initiated Action):</strong><br />
              <em>What is collected:</em> If and only when a user explicitly clicks the &ldquo;Activate Cash Back Bonus&rdquo; button, an audit log containing the merchant identifier, affiliate network tag, and timestamp is recorded to ensure compliance with merchant operating agreements.
            </li>
          </ol>

          <h3>2.2 Data We NEVER Collect (Zero-Access Guarantee):</h3>
          <ul className="space-y-2 pl-5 list-disc text-muted-foreground">
            <li><strong className="text-rose-400">NO Personally Identifiable Information (PII):</strong> No names, email addresses, phone numbers, home addresses, government IDs, or age.</li>
            <li><strong className="text-rose-400">NO Financial or Payment Data:</strong> We never read, touch, log, or transmit credit/debit card numbers, CVVs, expiration dates, UPI PINs, bank accounts, or billing information. All checkout transactions occur directly and securely on the merchant&apos;s platform.</li>
            <li><strong className="text-rose-400">NO Passwords or Authentication Data:</strong> We never access passwords, session cookies, login credentials, or two-factor authentication (2FA/OTP) tokens.</li>
            <li><strong className="text-rose-400">NO Keystroke Logging:</strong> We do not track general keyboard input. Script interaction is strictly limited to injecting coupon strings into merchant promo code boxes.</li>
            <li><strong className="text-rose-400">NO General Browsing Monitoring:</strong> Search queries, private emails, social media, and web browsing on non-shopping websites are completely inaccessible and invisible to GoCoupon.</li>
          </ul>

          {/* Section 3 */}
          <h2 id="data-handling">3. User Data Handling &amp; Processing</h2>
          <p>
            GoCoupon processes accessed data strictly under the following rules and Chrome Web Store requirements:
          </p>
          <ul>
            <li><strong>Purpose Limitation (Single Purpose):</strong> All data handling is confined exclusively to retrieving verified promo codes, testing them in parallel on merchant forms, and applying the code with the highest dollar savings.</li>
            <li><strong>Local Client-Side Processing &amp; Offline Resilience:</strong> Coupon injection and testing occur locally within your active browser tab through sandboxed content scripts. The extension is designed to operate locally using cached data even when offline or disconnected from our API.</li>
            <li><strong>No User Profiling:</strong> We do not build personal behavioral profiles, cross-device graphs, or device fingerprints.</li>
            <li><strong>Fair &amp; Unbiased Algorithm:</strong> The coupon engine sorts and selects coupons strictly by highest calculated savings. Working non-affiliate codes are never deprioritized or replaced with lower-value affiliate codes.</li>
            <li><strong>Affirmative User Consent &amp; Opt-Out (Purple Nickel):</strong> Affirmative user consent is established when you install and enable the extension. Users maintain complete control: you may opt out of anonymous coupon telemetry reporting at any time via the extension popup settings, or completely revoke consent and purge all data by uninstalling the extension.</li>
            <li><strong>Protection of Sensitive Categories (Purple Magnesium):</strong> In strict compliance with Chrome Web Store handling requirements, GoCoupon never publicly discloses or abuses sensitive data:
              <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                <li>• <em>Web Browsing Activity:</em> Scoped strictly to verifying store URLs on supported merchant checkout pages solely to deliver our core coupon savings feature. General browsing history is never tracked, stored, or shared.</li>
                <li>• <em>Financial &amp; Payment Data:</em> Zero collection and zero disclosure. All transactions happen directly on merchant gateways.</li>
                <li>• <em>Authentication Information:</em> Zero collection and zero disclosure. Passwords, session cookies, and login credentials are completely untouched.</li>
              </ul>
            </li>
          </ul>

          {/* Section 4 */}
          <h2 id="data-storage">4. User Data Storage, Retention &amp; Deletion</h2>
          <p>
            We maintain strict data retention and storage boundaries:
          </p>

          <div className="not-prose my-6 overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-border bg-secondary/60 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Data Type</th>
                    <th className="px-4 py-3 font-semibold">Storage Location</th>
                    <th className="px-4 py-3 font-semibold">Retention Period</th>
                    <th className="px-4 py-3 font-semibold">Deletion &amp; Revocation Mechanism</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  <tr className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium text-primary">User Settings &amp; UI Preferences</td>
                    <td className="px-4 py-3 text-muted-foreground">Local Device (<code>chrome.storage.local</code>)</td>
                    <td className="px-4 py-3">Until extension is uninstalled or cleared by user</td>
                    <td className="px-4 py-3">Automatically deleted by Chrome upon uninstall, or cleared via Chrome Settings.</td>
                  </tr>
                  <tr className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium text-primary">Temporary Checkout Memory</td>
                    <td className="px-4 py-3 text-muted-foreground">Ephemeral Browser RAM</td>
                    <td className="px-4 py-3">Duration of active checkout tab session</td>
                    <td className="px-4 py-3">Erased immediately upon tab or browser closure.</td>
                  </tr>
                  <tr className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium text-primary">Local Coupon Cache</td>
                    <td className="px-4 py-3 text-muted-foreground">Local Device (<code>chrome.storage.session</code>)</td>
                    <td className="px-4 py-3">Max 30 minutes</td>
                    <td className="px-4 py-3">Automatically wiped every 30 minutes via background alarm (<code>gocoupon_cache_cleanup</code>).</td>
                  </tr>
                  <tr className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium text-primary">Anonymous Coupon Telemetry</td>
                    <td className="px-4 py-3 text-muted-foreground">Secure Cloud DB (Supabase Inc.)</td>
                    <td className="px-4 py-3">90 days for aggregate code ranking</td>
                    <td className="px-4 py-3">Aggregated and purged on automated 90-day cycles.</td>
                  </tr>
                  <tr className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium text-primary">Server Security &amp; Access Logs</td>
                    <td className="px-4 py-3 text-muted-foreground">Encrypted Cloud Server</td>
                    <td className="px-4 py-3">30 days</td>
                    <td className="px-4 py-3">Automatically deleted after 30 days.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <h3>How Users Can Delete Data &amp; Revoke Access:</h3>
          <ol className="space-y-2 pl-5 list-decimal text-muted-foreground">
            <li>
              <strong className="text-foreground">Immediate Local Data Deletion:</strong> Users can completely delete all locally stored data, cached files, and preferences at any time by uninstalling the extension via <code>chrome://extensions</code> (click &ldquo;Remove&rdquo;).
            </li>
            <li>
              <strong className="text-foreground">Clearing Browser Extension Data:</strong> Users can manually purge extension storage via Chrome Settings at <code>chrome://settings/siteData</code>.
            </li>
            <li>
              <strong className="text-foreground">Data Inquiries &amp; Server Deletion Requests:</strong> Because GoCoupon does not collect PII or require user accounts, telemetry is anonymous and cannot be tied to individual identities. However, users may contact <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">{CONTACT_EMAIL}</a> for any data handling inquiries or deletion assistance.
            </li>
          </ol>

          {/* Section 5 */}
          <h2 id="data-sharing">5. User Data Sharing &amp; Third-Party Disclosure</h2>
          <p className="font-semibold text-foreground">
            GoCoupon does NOT sell, rent, trade, or monetize personal user data under any circumstances.
          </p>
          <ul>
            <li><strong>Zero Data Selling:</strong> We never sell user data, shopping patterns, or browsing habits to data brokers, advertising networks, or third parties.</li>
            <li><strong>No Personalized Advertising:</strong> We never transfer user data to third parties for targeted, retargeted, or interest-based advertising.</li>
            <li><strong>No Credit Scoring:</strong> We never use or disclose user data to evaluate creditworthiness or for lending assessments.</li>
            <li><strong>Authorized Technical Service Providers:</strong> We transmit anonymous API queries exclusively to our secure backend database hosted by <strong>Supabase Inc.</strong> (PostgreSQL API over TLS 1.3 / HTTPS) to fetch verified coupons and store anonymous aggregate success metrics. Supabase acts strictly as a data processor bound by strict confidentiality and data protection obligations.</li>
            <li><strong>Secure Transmission via Modern Cryptography (Purple Copper):</strong> All data communication between the extension and backend database is encrypted in transit using modern cryptography (TLS 1.3 over HTTPS). In accordance with CWS security guidelines, GoCoupon never transmits data over insecure HTTP, and strictly avoids encoding user data into URL query parameters or unencrypted headers.</li>
            <li><strong>Legal Compliance:</strong> We will disclose information only if strictly compelled by a valid legal subpoena, warrant, or court order from a competent judicial authority.</li>
          </ul>

          {/* Section 6 */}
          <h2 id="limited-use">6. Chrome Web Store Limited Use Compliance Declaration</h2>
          <div className="not-prose my-6 rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 text-foreground shadow-sm">
            <div className="flex items-center gap-2.5 font-display text-base font-bold text-primary">
              <ShieldCheck size={22} />
              <span>Chrome Web Store Limited Use Declaration</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground font-medium">
              &ldquo;GoCoupon&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{" "}
              <a
                href="https://developer.chrome.com/docs/webstore/program-policies"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:opacity-80"
              >
                Chrome Web Store User Data Policy
              </a>
              , including the Limited Use requirements.&rdquo;
            </p>
            <div className="mt-4 space-y-2 text-xs text-muted-foreground">
              <p className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Prominent Feature Usage:</strong> Data access is restricted to providing and improving prominent, user-facing features (auto-applying coupons and verifying checkout discounts).</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Prohibited Transfers:</strong> Data is never transferred to third parties except as strictly necessary to provide or improve these core features, comply with applicable law, or as part of a merger/acquisition with user notification.</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Zero Advertising Transfers:</strong> Data is never used or transferred to serve personalized ads.</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Human Review Restrictions:</strong> No humans are permitted to read user data unless affirmative consent is granted for debugging, it is necessary to respond to security incidents, or it is required to comply with law.</span>
              </p>
            </div>
          </div>

          {/* Section 7 */}
          <h2 id="permissions">7. Chrome Extension Permissions Justification Table</h2>
          <p>
            In accordance with Chrome Web Store Minimal Permissions guidelines, GoCoupon requests only the permissions necessary to deliver savings:
          </p>

          <div className="not-prose my-6 overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-border bg-secondary/60 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Permission</th>
                    <th className="px-4 py-3 font-semibold">Permission Type</th>
                    <th className="px-4 py-3 font-semibold">Exact Technical Justification</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-border text-foreground">
                  <tr className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-mono font-bold text-primary">activeTab</td>
                    <td className="px-4 py-3 text-muted-foreground">User Interaction</td>
                    <td className="px-4 py-3">Granted only when user interacts with the extension on an active shopping tab to read the merchant URL and locate checkout coupon boxes.</td>
                  </tr>
                  <tr className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-mono font-bold text-primary">storage</td>
                    <td className="px-4 py-3 text-muted-foreground">Local Device</td>
                    <td className="px-4 py-3">Required to store user preferences (e.g., sound toggles, notification settings) locally on your device without transmitting them externally.</td>
                  </tr>
                  <tr className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-mono font-bold text-primary">alarms</td>
                    <td className="px-4 py-3 text-muted-foreground">System Utility</td>
                    <td className="px-4 py-3">Used to run an idempotent 30-minute background job (<code>gocoupon_cache_cleanup</code>) to prune expired coupon entries and release memory.</td>
                  </tr>
                  <tr className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-mono font-bold text-primary">https://*.supabase.co/*</td>
                    <td className="px-4 py-3 text-muted-foreground">Backend Host</td>
                    <td className="px-4 py-3">Required to fetch real-time verified coupons from our database and log anonymous aggregate code success rates.</td>
                  </tr>
                  <tr className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-mono font-bold text-primary">Merchant Shopping Hosts</td>
                    <td className="px-4 py-3 text-muted-foreground">Content Scripts</td>
                    <td className="px-4 py-3">Strictly scoped to supported retail checkout pages (Amazon, Flipkart, Myntra, Walmart, Target, Best Buy, Croma) to display the savings overlay and test discount codes.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 8 */}
          <h2 id="affiliate">8. Affiliate &amp; Commercial Monetization Transparency (Grey Titanium Compliance)</h2>
          <p>
            GoCoupon is 100% free for consumers. To maintain servers and engineering operations, GoCoupon may receive an affiliate commission from merchant affiliate networks (e.g., Amazon Associates, Cuelinks, Skimlinks, Impact) when a user applies a working coupon and completes a qualifying purchase. In accordance with Chrome Web Store Affiliate Ads policy (Grey Titanium):
          </p>
          <ul>
            <li><strong>Prominently Disclosed Before Installation:</strong> All affiliate monetization is prominently disclosed in our Chrome Web Store listing page, on our website, and prior to installation.</li>
            <li><strong>Related User Action Strictly Required:</strong> In accordance with CWS policy, inclusion of any affiliate code, link, or cookie is strictly preceded by an explicit, affirmative user action (e.g., clicking &ldquo;Activate Cash Back Bonus&rdquo; or clicking to apply an affiliate-supported coupon).</li>
            <li><strong>Zero Involuntary Cookie Stuffing:</strong> Affiliate links or cookies are never loaded in background iframes or on passive web browsing. We never update or inject cookies without your explicit knowledge and interaction.</li>
            <li><strong>Amazon Associates Disclosure:</strong> <em>&ldquo;As an Amazon Associate, GoCoupon earns from qualifying purchases.&rdquo;</em></li>
            <li><strong>No Added Cost:</strong> Affiliate monetization occurs at <strong>zero additional cost</strong> to the consumer.</li>
            <li><strong>Unbiased Algorithm:</strong> The coupon engine always sorts and applies codes strictly by highest calculated net savings. We never deprioritize working non-affiliate codes in favor of affiliate codes.</li>
          </ul>

          {/* Section 9 */}
          <h2 id="contact">9. Contact Information &amp; Privacy Desk</h2>
          <p>
            For questions, feedback, or privacy inquiries regarding this policy or GoCoupon&apos;s Chrome Web Store compliance:
          </p>

          <div className="not-prose my-8 rounded-3xl border border-border bg-card p-8 shadow-sm">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-mono font-medium text-foreground">
                  <Mail size={14} className="text-primary" />
                  <span>Primary Official Support Contact</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  GoCoupon Support &amp; Privacy Desk
                </h3>
                <p className="text-sm text-muted-foreground">
                  Official contact for user support, privacy inquiries, and Chrome Web Store compliance.
                </p>
                <div className="text-sm text-foreground space-y-1">
                  <div><strong>Operator:</strong> GoCoupon Team</div>
                  <div><strong>Location:</strong> Bengaluru, Karnataka, India</div>
                  <div><strong>Secondary Contact:</strong> <a href={`mailto:${SECONDARY_EMAIL}`} className="text-primary hover:underline">{SECONDARY_EMAIL}</a></div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:items-end">
                <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/60 px-4 py-3">
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="font-mono text-sm font-bold text-primary hover:underline"
                  >
                    {CONTACT_EMAIL}
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="ml-2 rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    title="Copy email to clipboard"
                  >
                    {copiedEmail ? (
                      <Check size={16} className="text-emerald-500" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
                <span className="text-xs text-muted-foreground">
                  Typical response time: Under 24 hours
                </span>
              </div>
            </div>
          </div>
        </article>
      </section>
    </SiteShell>
  );
}
