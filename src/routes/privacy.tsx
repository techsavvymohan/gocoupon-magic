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
  AlertCircle,
  Copy,
  Check,
  Mail,
  ExternalLink,
  Trash2,
  Layers,
  Server,
} from "lucide-react";

const LAST_UPDATED = "August 18, 2026";
const CONTACT_EMAIL = "support@gocoupon.io";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () =>
    createSeoHead({
      title: "Privacy Policy & Chrome Web Store Compliance – goCoupon",
      description:
        "Official goCoupon Privacy Policy. Learn about our Chrome Web Store User Data Policy compliance, Manifest V3 security, zero data selling, and strict privacy protection.",
      path: "/privacy",
      keywords:
        "goCoupon privacy policy, chrome web store user data policy, chrome extension privacy, coupon extension data collection, limited use compliance, gocoupon security",
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
    name: "goCoupon Privacy Policy",
    description:
      "Privacy Policy and Chrome Web Store User Data Policy compliance for goCoupon browser extension.",
    url: "https://gocoupon.io/privacy",
    datePublished: "2024-01-15",
    dateModified: "2026-08-18",
    publisher: {
      "@type": "Organization",
      name: "goCoupon",
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
      <section className="relative border-b border-border px-6 pb-16 pt-20 sm:pt-28 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[400px] w-[700px] -translate-x-1/2 opacity-20 blur-[100px]"
          style={{
            background:
              "radial-gradient(circle at center, var(--accent-glow-strong), transparent 70%)",
          }}
        />

        <div className="mx-auto max-w-4xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground shadow-xs">
            <ShieldCheck size={14} className="text-primary" />
            <span>Chrome Web Store Compliant · Single Purpose</span>
          </div>

          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Privacy Policy &amp; User Data Policy
          </h1>

          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            We built <strong className="text-foreground">goCoupon</strong> to save you money automatically at checkout — not to collect, track, or monetize your personal data. This document provides a transparent, comprehensive disclosure of how the goCoupon Chrome extension and website operate in full compliance with the{" "}
            <a
              href="https://developer.chrome.com/docs/webstore/program-policies"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:underline inline-flex items-center gap-1"
            >
              Google Chrome Web Store Developer Program Policies
              <ExternalLink size={12} />
            </a>{" "}
            and Limited Use requirements.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/50 px-2.5 py-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Status: Active &amp; Enforced
            </span>
            <span>Last Updated: {LAST_UPDATED}</span>
            <span>Contact: {CONTACT_EMAIL}</span>
          </div>

          {/* Single Purpose Summary Banner */}
          <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-foreground">
            <div className="flex items-start gap-3.5">
              <Sparkles className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-primary">
                  Single Purpose Statement
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  The goCoupon browser extension has a <strong className="text-foreground">single, dedicated purpose</strong>: to automatically find, test, and apply the highest-discount coupon promo codes during checkout on supported e-commerce websites and notify users of genuine money-saving opportunities.
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
                No sign-up, email, phone number, or profile required to use goCoupon.
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
              <li><a href="#introduction" className="hover:text-primary">Introduction &amp; Single Purpose</a></li>
              <li><a href="#permissions" className="hover:text-primary">Chrome Extension Permissions &amp; Rationale</a></li>
              <li><a href="#data-collection" className="hover:text-primary">Information We Collect &amp; Access</a></li>
              <li><a href="#what-we-do-not-collect" className="hover:text-primary">What We Never Collect (Zero-Access)</a></li>
              <li><a href="#limited-use" className="hover:text-primary">Chrome Web Store Limited Use Compliance</a></li>
              <li><a href="#how-we-use-data" className="hover:text-primary">How We Use &amp; Process Data</a></li>
              <li><a href="#data-sharing" className="hover:text-primary">Data Sharing &amp; Third-Party Services</a></li>
              <li><a href="#data-retention" className="hover:text-primary">Data Storage, Retention &amp; Deletion</a></li>
              <li><a href="#data-security" className="hover:text-primary">Data Security &amp; Encryption</a></li>
              <li><a href="#user-rights" className="hover:text-primary">Your Privacy Rights (GDPR, CCPA, DPDP)</a></li>
              <li><a href="#childrens-privacy" className="hover:text-primary">Children&apos;s Privacy (COPPA)</a></li>
              <li><a href="#affiliate-transparency" className="hover:text-primary">Affiliate Monetization Disclosure</a></li>
              <li><a href="#changes" className="hover:text-primary">Policy Updates &amp; Notifications</a></li>
              <li><a href="#contact" className="hover:text-primary">Contact &amp; Grievance Officer</a></li>
            </ol>
          </div>

          {/* Section 1 */}
          <h2 id="introduction">1. Introduction &amp; Single Purpose</h2>
          <p>
            goCoupon (“we”, “our”, or “us”) provides the goCoupon Chrome browser extension and related web services at <a href="https://gocoupon.io" target="_blank" rel="noopener noreferrer">gocoupon.io</a>. Our service is designed to help shoppers in India and globally automatically discover, test, and apply discount promo codes at checkout across supported e-commerce websites (including Amazon, Flipkart, Myntra, Meesho, and others).
          </p>
          <p>
            This Privacy Policy explains what information the goCoupon extension accesses, why each permission is required, how technical data is handled, and how we protect your privacy. This policy is strictly structured to meet and exceed the requirements of the{" "}
            <strong>Google Chrome Web Store Developer Program Policies</strong>, the <strong>User Data FAQ</strong>, the <strong>Chrome Web Store Limited Use Requirements</strong>, the Indian <strong>Digital Personal Data Protection (DPDP) Act 2023</strong>, the <strong>General Data Protection Regulation (GDPR)</strong>, and the <strong>California Consumer Privacy Act (CCPA/CPRA)</strong>.
          </p>

          {/* Section 2 */}
          <h2 id="permissions">2. Chrome Extension Permissions &amp; Technical Justifications</h2>
          <p>
            In accordance with the Chrome Web Store Minimal Permissions Policy, goCoupon only requests permissions that are strictly necessary to deliver its core single purpose. Below is an exhaustive breakdown of each permission requested in our <code>manifest.json</code>:
          </p>

          <div className="not-prose my-6 overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-border bg-secondary/60 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Permission</th>
                    <th className="px-4 py-3 font-semibold">Chrome Category</th>
                    <th className="px-4 py-3 font-semibold">Exact Technical Justification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  <tr className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-mono font-bold text-primary">Host Permissions / activeTab</td>
                    <td className="px-4 py-3 text-muted-foreground">Web History / Domain Access</td>
                    <td className="px-4 py-3">
                      Required solely to detect when the user visits a supported merchant checkout or cart page (e.g. <code>*://*.flipkart.com/*</code>, <code>*://*.amazon.in/*</code>) so goCoupon can present available coupons and test them. It does <em>not</em> run on unsupported websites or read browsing history on non-shopping sites.
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-mono font-bold text-primary">storage</td>
                    <td className="px-4 py-3 text-muted-foreground">Device Storage</td>
                    <td className="px-4 py-3">
                      Required solely to save user interface preferences locally on your computer (such as audio alert toggles or auto-apply settings) and temporarily cache current working coupon lists locally for ultra-fast response times. No personal data is stored.
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-mono font-bold text-primary">alarms</td>
                    <td className="px-4 py-3 text-muted-foreground">Background Scheduling</td>
                    <td className="px-4 py-3">
                      Used to schedule periodic background synchronization of the verified coupon database from the goCoupon API without keeping memory-heavy persistent background processes running.
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-mono font-bold text-primary">scripting / content_scripts</td>
                    <td className="px-4 py-3 text-muted-foreground">Page Interaction</td>
                    <td className="px-4 py-3">
                      Used to inject a sandboxed coupon helper on the merchant checkout page to input candidate coupon codes into the checkout form and read the resulting cart discount amount.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3 */}
          <h2 id="data-collection">3. Information We Collect &amp; Access (Data Categories)</h2>
          <p>
            We adhere to strict data minimization principles. Below is the exact breakdown of data categories in accordance with Chrome Web Store User Data classification:
          </p>

          <h3>3.1 Web History / URLs (Limited to Active Checkout Domain)</h3>
          <p>
            When you navigate the web, the extension checks whether the active browser tab matches a supported shopping domain. When you reach a supported merchant&apos;s cart or checkout URL, the extension activates its coupon panel.
          </p>
          <ul>
            <li>
              <strong>Scope:</strong> We only evaluate the domain and URL path on supported partner shopping sites to detect checkout eligibility.
            </li>
            <li>
              <strong>What is NOT tracked:</strong> We do <strong>not</strong> record, log, profile, store, or transmit your overall browsing history, search engine queries, visited websites, or bookmarks.
            </li>
          </ul>

          <h3>3.2 User Activity (Limited Exclusively to Coupon Form Actions)</h3>
          <p>
            During checkout on supported shopping sites, goCoupon interacts only with the coupon promo code input box, the &ldquo;Apply&rdquo; button, and the final discount total element.
          </p>
          <ul>
            <li>
              <strong>Scope:</strong> Entering test coupon codes and detecting whether the store accepted or rejected the coupon code.
            </li>
            <li>
              <strong>What is NOT tracked:</strong> We do <strong>not</strong> record mouse trajectories, general page clicks, scrolling behavior, or any keystrokes typed outside the coupon input field.
            </li>
          </ul>

          <h3>3.3 Anonymous Operational Telemetry &amp; Coupon Performance</h3>
          <p>
            To ensure discount codes remain valid and up to date, the extension sends non-identifiable, aggregated operational signals to our API (e.g. &ldquo;Code SAVE20 worked on Flipkart cart of ₹1,499&rdquo; or &ldquo;Code EXPIRED10 failed&rdquo;). This diagnostic telemetry contains no user identifier, account ID, device fingerprint, or personal information.
          </p>

          <h3>3.4 Coarse Regional Location (Server-Side Inference Only)</h3>
          <p>
            When the extension queries our backend API for fresh coupon feeds, our server inspects standard incoming HTTP network headers solely to determine the coarse country or region (e.g., India) to deliver the correct local currency codes (INR) and merchant lists. We do <strong>not</strong> access device GPS, precise geolocation coordinates, or Wi-Fi triangulation.
          </p>

          {/* Section 4 */}
          <h2 id="what-we-do-not-collect">4. What We Never Collect (Zero-Access Guarantee)</h2>
          <p>
            To eliminate any ambiguity for users and browser security reviewers, goCoupon makes the following explicit, non-negotiable commitments:
          </p>
          <ul>
            <li>
              <strong className="text-foreground">Zero Personally Identifiable Information (PII):</strong> We do not require or collect your name, email address, phone number, home address, social security/national ID, or account passwords.
            </li>
            <li>
              <strong className="text-foreground">Zero Financial &amp; Payment Data:</strong> goCoupon never inspects, captures, stores, or transmits credit/debit card numbers, CVVs, expiration dates, UPI PINs, UPI IDs, net-banking credentials, bank account numbers, or digital wallet balances. All payment details remain strictly between you and the merchant.
            </li>
            <li>
              <strong className="text-foreground">Zero Authentication &amp; Credential Access:</strong> We never access or read login credentials, passwords, session tokens, authentication cookies, or two-factor authentication (2FA/OTP) codes.
            </li>
            <li>
              <strong className="text-foreground">Zero General Browsing Surveillance:</strong> We do not monitor search queries, email messages, social media accounts, cloud documents, or non-shopping websites.
            </li>
            <li>
              <strong className="text-foreground">Zero Cross-Site Identity Profiling:</strong> We do not build user behavioral profiles, cross-device graphs, or device fingerprints.
            </li>
            <li>
              <strong className="text-foreground">Zero Sale of User Data:</strong> We do not sell, rent, lease, or trade user data to data brokers, ad networks, or third parties under any circumstances.
            </li>
          </ul>

          {/* Section 5 */}
          <h2 id="limited-use">5. Google Chrome Web Store Limited Use Compliance Declaration</h2>
          <div className="not-prose my-6 rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 text-foreground shadow-sm">
            <div className="flex items-center gap-2.5 font-display text-base font-bold text-primary">
              <ShieldCheck size={22} />
              <span>Chrome Web Store Limited Use Declaration</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground font-medium">
              &ldquo;goCoupon&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{" "}
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
                <span><strong>Purpose Limitation:</strong> Data accessed is used exclusively to provide and improve the user-facing coupon auto-apply functionality.</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>No Unrelated Data Transfers:</strong> Data is never transferred to third parties except as strictly necessary to deliver the core service, comply with legal requirements, or execute corporate reorganization.</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>No Advertising or Profiling:</strong> Data is never used or transferred for serving personalized, retargeted, or interest-based advertising.</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>No Creditworthiness Scoring:</strong> Data is never used or transferred to determine creditworthiness or for lending assessments.</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>No Human Access:</strong> No human is permitted to read user data unless affirmative user agreement is given for technical troubleshooting, required for security audits, or mandated by law.</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Zero Sale of Data:</strong> goCoupon never sells, rents, or monetizes user data with third-party data brokers.</span>
              </p>
            </div>
          </div>

          {/* Section 6 */}
          <h2 id="how-we-use-data">6. How We Use &amp; Process Data</h2>
          <p>
            The minimal technical information accessed by goCoupon is processed strictly for the following functional purposes:
          </p>
          <ul>
            <li>Detecting supported e-commerce checkout pages to display coupon savings alerts.</li>
            <li>Downloading the latest verified promo codes from our encrypted API.</li>
            <li>Sequentially testing coupon codes in the merchant checkout form to calculate the highest discount.</li>
            <li>Maintaining system performance, verifying coupon validity rates, and preventing spam or abuse.</li>
          </ul>

          {/* Section 7 */}
          <h2 id="data-sharing">7. Data Sharing &amp; Third-Party Services</h2>
          <p>
            The goCoupon extension communicates directly and exclusively with goCoupon&apos;s own backend API over encrypted HTTPS. We do not transmit page contents, cart items, or browsing information to any third party.
          </p>
          <p>
            We may utilize reputable, industry-standard cloud infrastructure providers (such as Cloudflare and AWS) strictly to host our encrypted API and deliver low-latency coupon feeds. These infrastructure providers act solely as data processors bound by strict confidentiality agreements and data processing addendums (DPAs), and are prohibited from using data for any secondary purpose.
          </p>
          <p>
            We may disclose information only where required by applicable law, a valid subpoena, or court order issued by a competent legal authority.
          </p>

          {/* Section 8 */}
          <h2 id="data-retention">8. Data Storage, Retention &amp; Deletion Mechanisms</h2>
          <ul>
            <li>
              <strong>Client-Side Session Data:</strong> Temporary coupon application state resides strictly in browser memory during an active checkout tab session and is instantly erased when the tab is closed.
            </li>
            <li>
              <strong>Local Browser Storage:</strong> Any client preferences (such as audio volume or auto-apply preference) stored in <code>chrome.storage.local</code> are permanently and automatically deleted when you uninstall the extension.
            </li>
            <li>
              <strong>Server Logs:</strong> Anonymized server access logs maintained for DDoS protection and system reliability are automatically pruned within thirty (30) days.
            </li>
            <li>
              <strong>Instant Uninstallation:</strong> You can completely remove goCoupon at any moment by visiting <code>chrome://extensions</code> and clicking &ldquo;Remove&rdquo;. Upon removal, all local extension scripts, cached data, and storage are immediately destroyed by the browser.
            </li>
            <li>
              <strong>Data Deletion Requests:</strong> If you have submitted an inquiry via our contact form and wish to have your message deleted from our support inbox, simply email us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and our privacy team will delete it within 24 to 48 hours.
            </li>
          </ul>

          {/* Section 9 */}
          <h2 id="data-security">9. Data Security &amp; Encryption Standards</h2>
          <ul>
            <li>
              <strong>TLS 1.3 / HTTPS Encryption:</strong> 100% of network communication between the extension and our backend API is encrypted using modern TLS 1.3 cryptographic protocols.
            </li>
            <li>
              <strong>Manifest V3 Sandboxing:</strong> Built strictly in compliance with Google Chrome Manifest V3 specifications. The extension executes zero remotely hosted code; all executable logic is packaged locally within the audited extension bundle.
            </li>
            <li>
              <strong>Domain Scoping:</strong> Script injection is strictly restricted to supported merchant domains and will never run on unauthorized or non-shopping websites.
            </li>
          </ul>

          {/* Section 10 */}
          <h2 id="user-rights">10. Global Privacy Frameworks &amp; User Rights</h2>
          <p>
            Regardless of your physical location, goCoupon respects your fundamental right to privacy:
          </p>
          <ul>
            <li>
              <strong>Digital Personal Data Protection (DPDP) Act 2023 (India):</strong> We practice strict data minimization, purpose limitation, and respect user consent.
            </li>
            <li>
              <strong>General Data Protection Regulation (GDPR - EU &amp; UK):</strong> Users have the right to access, rectify, restrict processing of, port, or erase any personal data held by us, and to lodge a complaint with a supervisory authority.
            </li>
            <li>
              <strong>California Consumer Privacy Act (CCPA / CPRA):</strong> California residents have the right to know what personal information is collected, the right to delete personal information, the right to non-discrimination, and the right to opt out of the sale or sharing of personal data. <strong className="text-foreground">goCoupon does not sell or share personal information.</strong>
            </li>
          </ul>

          {/* Section 11 */}
          <h2 id="childrens-privacy">11. Children&apos;s Privacy (COPPA &amp; Global Standards)</h2>
          <p>
            goCoupon is a general audience shopping utility and is not directed at children under thirteen (13) years of age (or under 16 in the European Union). We do not knowingly collect, request, or maintain personal information from children. If you believe a child has provided us with personal information, please contact us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we will take immediate steps to delete such data.
          </p>

          {/* Section 12 */}
          <h2 id="affiliate-transparency">12. Affiliate Monetization &amp; Commercial Transparency</h2>
          <p>
            goCoupon is completely free for users. To fund our servers and engineering operations, we may earn an affiliate commission from merchant affiliate networks when a user applies a valid coupon and completes a qualifying purchase.
          </p>
          <ul>
            <li>
              <strong>Zero Extra Cost:</strong> Affiliate commissions are paid entirely by merchant partner networks and never increase the price you pay.
            </li>
            <li>
              <strong>Unbiased Algorithm:</strong> Our coupon test engine always applies the promo code that gives you the highest net rupee savings, regardless of affiliate relationships.
            </li>
            <li>
              <strong>Zero User Data Sharing:</strong> We do not share personal user profiles, credit card numbers, or browsing histories with affiliate merchant networks.
            </li>
          </ul>
          <p>
            For full details, please read our dedicated{" "}
            <Link to="/disclosure">Affiliate &amp; Commercial Disclosure</Link>.
          </p>

          {/* Section 13 */}
          <h2 id="changes">13. Changes to This Privacy Policy</h2>
          <p>
            We may occasionally update this Privacy Policy to reflect changes in our service, browser extension features, or applicable legal requirements. When updates occur, we will update the &ldquo;Last Updated&rdquo; date at the top of this document. We encourage you to review this page periodically to stay informed about our privacy practices.
          </p>

          {/* Section 14 */}
          <h2 id="contact">14. Contact Information &amp; Grievance Officer</h2>
          <p>
            If you have any questions, concerns, feedback, or data privacy requests regarding this Privacy Policy or goCoupon&apos;s compliance with Chrome Web Store policies, please reach out to our dedicated support and privacy desk:
          </p>

          <div className="not-prose my-8 rounded-3xl border border-border bg-card p-8 shadow-sm">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-mono font-medium text-foreground">
                  <Mail size={14} className="text-primary" />
                  <span>Primary Official Support Contact</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  goCoupon Support &amp; Privacy Desk
                </h3>
                <p className="text-sm text-muted-foreground">
                  Official contact for user support, privacy inquiries, and Chrome Web Store compliance.
                </p>
                <div className="text-sm text-foreground">
                  <strong>Location:</strong> Bengaluru, Karnataka, India
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
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground transition-all hover:border-primary hover:text-primary"
                    aria-label="Copy support email address"
                  >
                    {copiedEmail ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    <span>{copiedEmail ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                >
                  <span>Or use our online contact form</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 text-sm text-muted-foreground pt-4 border-t border-border">
            <span>Related documentation:</span>
            <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
            <span>·</span>
            <Link to="/disclosure" className="text-primary hover:underline">Affiliate Disclosure</Link>
            <span>·</span>
            <Link to="/security" className="text-primary hover:underline">Security &amp; Trust Center</Link>
            <span>·</span>
            <Link to="/how-it-works" className="text-primary hover:underline">How It Works</Link>
            <span>·</span>
            <Link to="/faq" className="text-primary hover:underline">FAQ</Link>
          </div>
        </article>
      </section>
    </SiteShell>
  );
}
