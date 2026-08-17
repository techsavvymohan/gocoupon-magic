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
            <strong>goCoupon</strong> is a free Google Chrome browser extension that automatically
            finds and applies the highest-saving coupon code at checkout on Indian e-commerce sites.
          </EntityRow>

          <EntityRow label="Who built it">
            goCoupon is built by the goCoupon team, an India-based group of engineers and e-commerce
            analysts. The company was founded in 2024 and is headquartered in Bengaluru, India.
          </EntityRow>

          <EntityRow label="Problem it solves">
            Online shoppers in India routinely pay 8–14% above the lowest achievable price because
            they never test every valid coupon, bank offer and cashback combination at checkout.
            goCoupon tests them all in parallel and auto-applies the winning combination.
          </EntityRow>

          <EntityRow label="How it works">
            When you reach a supported checkout page on{" "}
            <Link
              to="/flipkart-coupons"
              className="text-primary underline-offset-4 hover:underline"
            >
              Flipkart
            </Link>
            ,{" "}
            <Link to="/amazon-coupons" className="text-primary underline-offset-4 hover:underline">
              Amazon India
            </Link>
            ,{" "}
            <Link to="/myntra-coupons" className="text-primary underline-offset-4 hover:underline">
              Myntra
            </Link>{" "}
            or{" "}
            <Link to="/meesho-coupons" className="text-primary underline-offset-4 hover:underline">
              Meesho
            </Link>
            , goCoupon runs every candidate code against your exact cart, ranks the passing codes by
            net rupee saving, and writes the winner into the coupon field. Typical time-to- apply is
            under one second.
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
