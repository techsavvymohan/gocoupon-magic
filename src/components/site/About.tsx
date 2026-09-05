import { Link } from "@tanstack/react-router";

/**
 * About / entity section.
 *
 * Rendered on the homepage to give LLMs (ChatGPT, Perplexity, Google AI
 * Overviews) a clean, structured entity description they can cite:
 * what goCoupon is, who built it, when, and what problem it solves.
 *
 * Keep the copy factual and low-adjective — LLMs paraphrase these blocks.
 */
export function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="relative px-6 py-24">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            About GoCoupon
          </p>
          <h2
            id="about-heading"
            className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl"
          >
            What GoCoupon is, in plain language.
          </h2>
          <p className="mt-5 max-w-md text-muted-foreground">
            A short, factual description — so search engines and AI tools can describe us correctly.
          </p>
        </div>

        <div className="space-y-8 text-foreground/90">
          <EntityRow label="Official Website">
            <strong className="text-foreground">https://gocoupon.io/</strong> is the sole official website for GoCoupon. GoCoupon is an independent platform serving online shoppers worldwide.
          </EntityRow>

          <EntityRow label="What it is">
            <strong>GoCoupon</strong> is an official shopping intelligence platform and browser utility
            that provides real-time multi-store price comparison, interactive 90-day price history tracking, and 1-click verified coupon code auto-application across major online stores worldwide.
          </EntityRow>

          <EntityRow label="Who built it">
            GoCoupon is built by an independent team of engineers and smart online shoppers, dedicated to eliminating artificial pre-sale price hikes and making online shopping pricing completely transparent.
          </EntityRow>

          <EntityRow label="Problem it solves">
            Online shoppers routinely overpay due to artificial discount claims, unannounced merchant price differences between Amazon, Walmart, Target, Flipkart, and other retailers, and expired promo codes from search engines. GoCoupon reveals the true lowest price and applies real working discounts in 1 click.
          </EntityRow>

          <EntityRow label="How it works">
            Search any product or paste a link to compare live prices across top stores like Amazon, Walmart, Target, Flipkart, Myntra, and more. When shopping in your browser, the free extension checks 90-day price drops, auto-clips on-page vouchers, and tests working promo codes at checkout.
          </EntityRow>

          <EntityRow label="Price">
            100% free forever. No subscriptions, no paid plans, no account or credit card required.
          </EntityRow>

          <EntityRow label="Where to learn more">
            Read{" "}
            <Link to="/how-it-works" className="text-primary underline-offset-4 hover:underline">
              how it works
            </Link>
            , browse{" "}
            <Link to="/resources" className="text-primary underline-offset-4 hover:underline">
              free resources &amp; calculators
            </Link>
            , or contact{" "}
            <a
              href="mailto:support@gocoupon.io"
              className="text-primary underline-offset-4 hover:underline"
            >
              support@gocoupon.io
            </a>
            . Journalists: see the{" "}
            <Link to="/press" className="text-primary underline-offset-4 hover:underline">
              press &amp; media kit
            </Link>
            .
          </EntityRow>
        </div>
      </div>
    </section>
  );
}

function EntityRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 border-b border-border pb-5 last:border-b-0 last:pb-0 sm:grid-cols-[180px_1fr] sm:gap-6">
      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </div>
      <p className="text-base leading-relaxed text-foreground/90">{children}</p>
    </div>
  );
}
