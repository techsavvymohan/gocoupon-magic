import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { couponFaqs } from "@/data/faqs";
import { breadcrumbSchema, createSeoHead, faqSchema } from "@/lib/seo";

export const Route = createFileRoute("/faq")({
  component: FaqPage,
  head: () =>
    createSeoHead({
      title: "goCoupon FAQ – Coupons, Cashback, Installation and Safety",
      description:
        "Read frequently asked questions about goCoupon, including coupon usage, cashback rules, extension installation and privacy safety.",
      path: "/faq",
      keywords:
        "coupon extension faq, cashback faq, goCoupon installation help, are coupon extensions safe",
    }),
});

function FaqPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "FAQ", path: "/faq" },
  ]);
  const faq = faqSchema(couponFaqs.map((f) => ({ question: f.question, answer: f.answer })));

  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />

      <section className="border-b border-border px-6 pb-16 pt-20 sm:pt-28">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            FAQ
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Coupon, cashback and extension questions answered.
          </h1>
          <p className="mt-5 max-w-3xl text-base text-muted-foreground sm:text-lg">
            Everything users usually ask before installing a coupon extension: safety, code validity,
            cashback timings and troubleshooting.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl divide-y divide-border border-y border-border">
          {couponFaqs.map((f) => (
            <details key={f.question} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left text-lg font-semibold text-foreground">
                <span>{f.question}</span>
                <span
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-transform group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{f.answer}</p>
            </details>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-5xl text-sm text-muted-foreground">
          Looking for strategy tips? Explore the <Link to="/blog" className="text-primary">blog</Link> or
          compare store pages like <Link to="/amazon-coupons" className="text-primary">Amazon coupons</Link>,{" "}
          <Link to="/flipkart-coupons" className="text-primary">Flipkart coupons</Link> and{" "}
          <Link to="/myntra-coupons" className="text-primary">Myntra coupons</Link>.
        </div>
      </section>
    </SiteShell>
  );
}
