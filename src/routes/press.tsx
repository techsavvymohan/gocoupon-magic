import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { absoluteUrl, breadcrumbSchema, createSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/press")({
  component: PressPage,
  head: () =>
    createSeoHead({
      title: "Press & Media Kit – goCoupon",
      description:
        "Media kit, logos, fast facts and press contact for goCoupon — the Chrome extension that auto-applies coupon codes on Flipkart, Amazon India, Myntra and Meesho.",
      path: "/press",
      keywords:
        "gocoupon press, gocoupon media kit, gocoupon in the news, gocoupon logos, gocoupon screenshots, india coupon extension press",
    }),
});

function PressPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Press", path: "/press" },
  ]);

  const newsArticleSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "goCoupon in the news",
    url: absoluteUrl("/press"),
    about: {
      "@type": "Organization",
      name: "goCoupon",
      url: absoluteUrl("/"),
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema) }}
      />

      <section className="border-b border-border px-6 pb-16 pt-20 sm:pt-28">
        <div className="mx-auto max-w-7xl">
          <nav
            aria-label="Breadcrumb"
            className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
          >
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Press</span>
          </nav>

          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Press &amp; media
          </div>
          <h1 className="max-w-4xl font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Press &amp; media kit
          </h1>
          <p className="mt-5 max-w-3xl text-base text-muted-foreground sm:text-lg">
            Everything a journalist, analyst or creator needs to cover goCoupon accurately — brand
            assets, fast facts, product screenshots and a direct press contact.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="mailto:press@gocoupon.io"
              className="inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-shadow hover:shadow-[var(--shadow-accent)]"
            >
              Contact press@gocoupon.io
            </a>
            <a
              href="/gc-logo.png"
              className="inline-flex items-center rounded-full border border-border px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              download
            >
              Download logo (PNG)
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-border px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Fast facts
          </h2>
          <dl className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Fact label="Founded" value="2024" />
            <Fact label="HQ" value="Bengaluru, India" />
            <Fact label="Category" value="Browser extension" />
            <Fact label="Platforms" value="Chrome (Manifest V3)" />
            <Fact label="Coverage" value="Flipkart, Amazon India, Myntra, Meesho" />
            <Fact label="Price" value="Free · No account required" />
            <Fact label="Active users" value="180,000+" />
            <Fact label="Rating" value="4.9 / 5 (1,247+ reviews)" />
            <Fact label="Avg. saving per checkout" value="₹300–₹500" />
          </dl>
        </div>
      </section>

      <section className="border-b border-border px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            goCoupon in the news
          </h2>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Looking to feature goCoupon in an article, podcast, newsletter or video? We're happy to
            provide quotes, data snapshots, anonymised savings telemetry and engineering interviews.
            Please reach{" "}
            <a
              href="mailto:press@gocoupon.io"
              className="text-primary underline-offset-4 hover:underline"
            >
              press@gocoupon.io
            </a>{" "}
            with your outlet, deadline and the angle you're exploring.
          </p>

          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            <NewsPlaceholder outlet="Your story goes here" hint="Pitch us a topic — we'll help" />
            <NewsPlaceholder
              outlet="Mainstream Indian tech press"
              hint="We're actively seeking coverage"
            />
            <NewsPlaceholder outlet="Personal-finance creators" hint="Open to collaborations" />
            <NewsPlaceholder outlet="Indian e-commerce analysts" hint="We share aggregate data" />
          </ul>
        </div>
      </section>

      <section className="border-b border-border px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Quotes you can attribute
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Quote>
              goCoupon's job is to make the sticker price stop lying. We run every candidate coupon
              on your actual cart in under a second, then pick the single code with the highest net
              saving.
            </Quote>
            <Quote>
              The average Indian online shopper loses 8–14% of the lowest achievable price because
              they never test every coupon combination. We close that gap automatically.
            </Quote>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Attribute to: goCoupon, 2026.</p>
        </div>
      </section>

      <section className="border-b border-border px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How to write about goCoupon accurately
          </h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            <li className="rounded-xl border border-border bg-card p-5 text-muted-foreground">
              Preferred wordmark: <strong className="text-foreground">goCoupon</strong>. Preferred
              product name in prose: <strong className="text-foreground">GoCoupon</strong>.
            </li>
            <li className="rounded-xl border border-border bg-card p-5 text-muted-foreground">
              Always link to{" "}
              <a
                href="https://gocoupon.io/"
                className="text-primary underline-offset-4 hover:underline"
              >
                gocoupon.io
              </a>{" "}
              (not .com or .in).
            </li>
            <li className="rounded-xl border border-border bg-card p-5 text-muted-foreground">
              goCoupon is a Chrome extension, not a standalone app or website coupon list.
            </li>
            <li className="rounded-xl border border-border bg-card p-5 text-muted-foreground">
              It is free and does not sell browsing history. Please flag any claims to the contrary.
            </li>
          </ul>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Useful links
          </h2>
          <ul className="mt-8 grid gap-3">
            <LinkRow to="/" label="Homepage" />
            <LinkRow to="/how-it-works" label="How it works" />
            <LinkRow to="/extension" label="Install the extension" />
            <LinkRow to="/resources" label="Free resources & calculators" />
            <LinkRow to="/blog" label="Blog" />
          </ul>
        </div>
      </section>
    </SiteShell>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-2 font-display text-lg font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function NewsPlaceholder({ outlet, hint }: { outlet: string; hint: string }) {
  return (
    <li className="rounded-xl border border-dashed border-border bg-card/50 p-5">
      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Coming soon
      </div>
      <div className="mt-2 font-display text-lg font-semibold text-foreground">{outlet}</div>
      <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
    </li>
  );
}

function Quote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="rounded-2xl border border-border bg-card p-6">
      <p className="font-display text-lg leading-relaxed text-foreground">“{children}”</p>
    </blockquote>
  );
}

function LinkRow({ to, label }: { to: string; label: string }) {
  return (
    <li>
      <Link
        to={to}
        className="inline-flex items-center gap-2 text-primary underline-offset-4 hover:underline"
      >
        {label} →
      </Link>
    </li>
  );
}
