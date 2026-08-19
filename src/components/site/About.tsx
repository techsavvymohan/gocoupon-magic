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
            About goCoupon
          </p>
          <h2
            id="about-heading"
            className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl"
          >
            What goCoupon is, in plain language.
          </h2>
          <p className="mt-5 max-w-md text-muted-foreground">
            A short, factual description — so search engines and AI tools can describe us correctly.
          </p>
        </div>

        <div className="space-y-8 text-foreground/90">
          <EntityRow label="What it is">
            <strong>goCoupon</strong> is a privacy-first Google Chrome browser extension (Manifest V3) that
            automatically discovers, auto-clips on-page vouchers, and applies the highest-saving promo codes at checkout across US and Indian e-commerce stores.
          </EntityRow>

          <EntityRow label="Who built it">
            GoCoupon is built by an independent team of online shoppers and software designers passionate about
            making online shopping affordable and transparent for everyone.
          </EntityRow>

          <EntityRow label="Problem it solves">
            Online shoppers routinely overpay because they miss hidden green discount checkboxes on product pages
            or spend 15 minutes testing expired promo codes from Google. GoCoupon automatically finds and applies the biggest
            working discounts in 1 click.
          </EntityRow>

          <EntityRow label="How it works">
            When you reach a supported checkout or product page on{" "}
            <Link to="/amazon-coupons" className="text-primary underline-offset-4 hover:underline">
              Amazon
            </Link>
            ,{" "}
            <Link
              to="/flipkart-coupons"
              className="text-primary underline-offset-4 hover:underline"
            >
              Flipkart
            </Link>
            ,{" "}
            <Link to="/myntra-coupons" className="text-primary underline-offset-4 hover:underline">
              Myntra
            </Link>{" "}
            or{" "}
            <Link to="/meesho-coupons" className="text-primary underline-offset-4 hover:underline">
              Meesho
            </Link>
            , GoCoupon automatically spots and clicks hidden green vouchers, tests all active discount codes in seconds, and applies the highest savings to your cart.
          </EntityRow>

          <EntityRow label="Price">
            Completely free. No subscription, no account, no personal data required.
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
