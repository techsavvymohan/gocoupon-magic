import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead, faqSchema } from "@/lib/seo";

const faqs = [
  {
    question: "How does goCoupon auto-apply coupon codes?",
    answer:
      "At checkout, goCoupon tests eligible coupon combinations in the background and applies the highest working discount.",
  },
  {
    question: "Do I need to copy and paste coupon codes?",
    answer:
      "No. The extension automates coupon testing so you do not have to manually try codes one by one.",
  },
  {
    question: "Which stores are supported?",
    answer:
      "goCoupon supports major Indian e-commerce stores including Amazon, Flipkart, Myntra and Meesho, with support expanding over time.",
  },
];

export const Route = createFileRoute("/how-it-works")({
  component: HowItWorksPage,
  head: () =>
    createSeoHead({
      title: "How goCoupon Works – Automatic Coupon & Cashback Extension",
      description:
        "Learn how goCoupon finds and applies the best coupon code automatically at checkout, and how cashback is tracked on eligible purchases.",
      path: "/how-it-works",
      keywords:
        "how coupon extension works, auto apply coupon code, cashback extension how it works, goCoupon guide",
    }),
});

function HowItWorksPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "How It Works", path: "/how-it-works" },
  ]);
  const faq = faqSchema(faqs);

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />

      <section className="border-b border-border px-6 pb-16 pt-20 sm:pt-28">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            How it works
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            From coupon hunt to one-click savings.
          </h1>
          <p className="mt-5 max-w-3xl text-base text-muted-foreground sm:text-lg">
            goCoupon is designed to automate the most frustrating part of online shopping: finding a
            valid coupon code that actually reduces your final payable amount.
          </p>
        </div>
      </section>

      <section className="border-b border-border px-6 py-16">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {[
            {
              title: "1. Install extension",
              text: "Add goCoupon to Chrome. No signup required to get started.",
            },
            {
              title: "2. Shop normally",
              text: "Go to checkout on supported stores like Amazon, Flipkart, Myntra or Meesho.",
            },
            {
              title: "3. Auto-apply best code",
              text: "goCoupon tests coupon logic and applies the highest valid savings automatically.",
            },
          ].map((step) => (
            <article key={step.title} className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                {step.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Related guides
          </h2>
          <p className="mt-3 text-muted-foreground">
            Learn more about{" "}
            <Link to="/extension" className="text-primary">
              installing the extension
            </Link>
            ,{" "}
            <Link to="/cashback-rewards" className="text-primary">
              cashback tracking
            </Link>
            , and{" "}
            <Link to="/faq" className="text-primary">
              coupon troubleshooting
            </Link>
            .
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
