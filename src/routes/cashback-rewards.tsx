import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead, faqSchema } from "@/lib/seo";

const faqs = [
  {
    question: "How is cashback calculated?",
    answer:
      "Cashback is calculated from eligible partner commission on completed orders and credited after validation windows.",
  },
  {
    question: "When do I receive cashback?",
    answer:
      "Cashback appears as pending first, then becomes payable after merchant confirmation and return windows.",
  },
  {
    question: "Can I combine cashback with coupon codes?",
    answer:
      "Yes, in many cases you can combine coupon savings with cashback and card offers for higher total savings.",
  },
];

export const Route = createFileRoute("/cashback-rewards")({
  component: CashbackRewardsPage,
  head: () =>
    createSeoHead({
      title: "Cashback Rewards – Earn Cashback with goCoupon",
      description:
        "Understand how goCoupon cashback works, how to track reward status, and how to maximize savings with coupons, bank offers and cashback together.",
      path: "/cashback-rewards",
      keywords: "cashback rewards india, cashback extension, coupon and cashback, earn cashback online",
    }),
});

function CashbackRewardsPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Cashback Rewards", path: "/cashback-rewards" },
  ]);
  const faq = faqSchema(faqs);

  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />

      <section className="border-b border-border px-6 pb-16 pt-20 sm:pt-28">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Cashback and rewards
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Track cashback clearly and maximize your total checkout savings.
          </h1>
          <p className="mt-5 max-w-3xl text-base text-muted-foreground sm:text-lg">
            goCoupon helps you combine coupon codes, card benefits and cashback logic so you get the
            strongest final value on each order.
          </p>
        </div>
      </section>

      <section className="border-b border-border px-6 py-16">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {[
            "Cashback shown as pending immediately after tracked checkout.",
            "Order validation updates status from pending to confirmed.",
            "Confirmed rewards become redeemable per payout rules.",
          ].map((item) => (
            <article key={item} className="rounded-2xl border border-border bg-card p-6 text-muted-foreground">
              {item}
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Keep exploring
          </h2>
          <p className="mt-3 text-muted-foreground">
            Read <Link to="/how-it-works" className="text-primary">how goCoupon works</Link>, install from{" "}
            <Link to="/extension" className="text-primary">the extension page</Link>, and compare store pages
            like <Link to="/amazon-coupons" className="text-primary">Amazon coupons</Link>.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
