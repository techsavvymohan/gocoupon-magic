import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";

const LAST_UPDATED = "April 30, 2026";
const CONTACT_EMAIL = "hello@gocoupon.io";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () =>
    createSeoHead({
      title: "Privacy Policy – goCoupon Chrome Extension",
      description:
        "Read the goCoupon privacy policy. Learn what data the Chrome extension accesses, why it is needed, what is never collected, and how your information stays safe.",
      path: "/privacy",
      keywords:
        "goCoupon privacy policy, chrome extension privacy, coupon extension data usage, gocoupon data collection",
    }),
});

function PrivacyPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Privacy Policy", path: "/privacy" },
  ]);

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <section className="border-b border-border px-6 pb-16 pt-20 sm:pt-28">
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Legal
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-5 text-base text-muted-foreground sm:text-lg">
            We built goCoupon to save you money — not to collect your data. This page explains, in
            plain language, exactly what the extension does and does not access.
          </p>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <article className="prose-policy mx-auto max-w-3xl text-foreground">
          <h2 id="introduction">1. Introduction</h2>
          <p>
            goCoupon (“we”, “our”, “us”) is a free Chrome browser extension that automatically finds
            and applies the best available coupon codes at checkout on supported e-commerce websites
            such as Amazon, Flipkart, Myntra and Meesho. This Privacy Policy describes how the
            extension and the website at <span className="whitespace-nowrap">gocoupon.io</span>{" "}
            handle information when you use them.
          </p>
          <p>
            By installing or using the goCoupon Chrome extension, you agree to the practices
            described below. This policy is written to comply with the{" "}
            <a
              href="https://developer.chrome.com/docs/webstore/program-policies"
              target="_blank"
              rel="noopener noreferrer"
            >
              Chrome Web Store Developer Program Policies
            </a>
            , including the User Data Policy and the Limited Use requirements.
          </p>

          <h2 id="data-collection">2. Data Collection</h2>
          <p>
            goCoupon is designed to operate with the smallest possible footprint. The extension only
            accesses the information it strictly needs to apply coupon codes for you.
          </p>
          <h3>2.1 What we access</h3>
          <ul>
            <li>
              <strong>Current page URL (web history, limited).</strong> When you visit a supported
              shopping site, the extension reads the URL of the active tab to determine whether you
              are on a checkout or cart page where a coupon can be applied. This is required so the
              extension knows when to activate and which store’s coupon list to use.
            </li>
            <li>
              <strong>Limited page interaction (user activity).</strong> While you are on a
              supported checkout page, the extension may read coupon-input fields and observe clicks
              tied to coupon application (such as the “Apply” button) so it can test codes and
              surface the one that gives you the highest discount. It does not record general
              browsing activity, mouse movement, scrolling, keystrokes outside the coupon field, or
              any interaction outside the coupon-application flow.
            </li>
            <li>
              <strong>Anonymous, aggregated extension events.</strong> We may log non-identifying
              events such as “coupon applied successfully” or “no working coupon found” to measure
              whether the extension is functioning. These events are not linked to your identity,
              account or device fingerprint.
            </li>
          </ul>

          <h3>2.2 What we do NOT collect</h3>
          <ul>
            <li>
              <strong>No personally identifiable information (PII).</strong> No name, email, phone
              number, address, IP address profile, or government ID is collected by the extension.
            </li>
            <li>
              <strong>No financial or payment data.</strong> goCoupon never reads card numbers, CVV,
              UPI IDs, net-banking credentials, wallet balances or any payment-related fields. It
              does not interact with the payment page beyond having already applied the coupon at
              the cart/checkout step.
            </li>
            <li>
              <strong>No passwords or authentication data.</strong> goCoupon does not read login
              forms, password fields, OTPs, session cookies or authentication tokens.
            </li>
            <li>
              <strong>No general browsing history.</strong> We do not track the websites you visit
              outside the supported shopping sites, and we do not build a browsing profile of you.
            </li>
            <li>
              <strong>No selling of data, ever.</strong> We do not sell, rent or trade user data to
              any third party.
            </li>
          </ul>

          <h2 id="how-we-use-data">3. How We Use Data</h2>
          <p>The limited information the extension accesses is used only to:</p>
          <ul>
            <li>
              Detect when you are on a supported checkout page so the extension can offer to apply
              coupons.
            </li>
            <li>
              Fetch the latest list of working coupon codes for the relevant store from our backend
              API over an encrypted connection (HTTPS).
            </li>
            <li>
              Test eligible codes in the coupon field and apply the one that yields the highest
              discount on your order.
            </li>
            <li>
              Maintain and improve the extension by understanding, in aggregate and without
              identifying any individual, which stores and flows are working correctly.
            </li>
          </ul>
          <p>
            We follow the principle of <em>limited use</em>: data accessed for one of the purposes
            above is not repurposed for advertising, profiling, or any unrelated feature.
          </p>

          <h2 id="data-sharing">4. Data Sharing</h2>
          <p>
            We do <strong>not</strong> sell, rent, trade or share your data with advertisers, data
            brokers, or marketing networks.
          </p>
          <p>
            The extension communicates only with goCoupon’s own backend API to download coupon data.
            It does not transmit your URL history, page contents, cart items or interactions to any
            third party. Where we use standard infrastructure providers (such as cloud hosting and
            error monitoring) to keep the service running, those providers process information
            solely on our behalf under a contractual obligation to maintain confidentiality, and
            only to the minimum extent required to deliver the service.
          </p>
          <p>
            We may disclose information only where strictly required by applicable law, valid legal
            process, or to protect the rights, safety and property of goCoupon or its users.
          </p>

          <h2 id="data-security">5. Data Security</h2>
          <ul>
            <li>
              All communication between the extension and our backend API takes place over encrypted
              HTTPS/TLS connections.
            </li>
            <li>
              No user data is stored permanently on our servers. Operational logs that may be
              generated for debugging are aggregated, non-identifying and retained only for the
              minimum period required to keep the service stable.
            </li>
            <li>
              The extension is scoped to run only on supported shopping domains, so it cannot read
              content on unrelated websites.
            </li>
            <li>
              Even though no scheme is perfectly immune to risk, we follow industry-standard
              security practices to protect the limited information that does pass through our
              systems.
            </li>
          </ul>

          <h2 id="user-control">6. User Control</h2>
          <ul>
            <li>
              <strong>Install and uninstall any time.</strong> You can remove the extension from{" "}
              <code>chrome://extensions</code> at any moment. Once removed, it cannot access any
              page or perform any action on your browser.
            </li>
            <li>
              <strong>Disable on demand.</strong> You can disable goCoupon temporarily without
              uninstalling it from the same Chrome extensions page.
            </li>
            <li>
              <strong>No account, no sign-up.</strong> goCoupon does not require you to create an
              account or share personal details to work, so there is no profile to delete on our
              side.
            </li>
            <li>
              <strong>Questions and requests.</strong> If you believe we hold any information
              relating to you and you want it reviewed or deleted, contact us at the address below
              and we will respond promptly.
            </li>
          </ul>

          <h2 id="childrens-privacy">7. Children’s Privacy</h2>
          <p>
            goCoupon is a shopping utility intended for general audiences and is not directed at
            children under 13. We do not knowingly collect information from children. If you believe
            a child has used the extension in a way that requires our attention, please contact us.
          </p>

          <h2 id="changes">8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy to reflect changes in the extension, in our practices,
            or in applicable law. When we do, we will revise the “Last updated” date at the top of
            this page. Material changes will be communicated through the extension’s store listing
            or this website. Continued use of goCoupon after an update means you accept the revised
            policy.
          </p>

          <h2 id="contact">9. Contact Information</h2>
          <p>
            For any questions, concerns, or requests regarding this Privacy Policy or your
            information, please reach out to us:
          </p>
          <ul>
            <li>
              Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </li>
            <li>
              Website:{" "}
              <a href="https://gocoupon.io" target="_blank" rel="noopener noreferrer">
                https://gocoupon.io
              </a>
            </li>
          </ul>

          <p className="text-sm text-muted-foreground">
            Looking for product details instead? Read{" "}
            <Link to="/how-it-works">how goCoupon works</Link> or visit the{" "}
            <Link to="/faq">FAQ</Link>.
          </p>
        </article>
      </section>
    </SiteShell>
  );
}
