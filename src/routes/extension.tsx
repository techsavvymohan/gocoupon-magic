import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead, faqSchema } from "@/lib/seo";

const faqs = [
  {
    question: "How do I install the goCoupon Chrome extension?",
    answer:
      "Open the extension listing, click Add to Chrome, and pin goCoupon to your toolbar. Then shop normally and let it auto-apply coupons.",
  },
  {
    question: "Is the extension free?",
    answer:
      "Yes, goCoupon is free to install and use for automatic coupon application and cashback support.",
  },
  {
    question: "Will the extension slow Chrome?",
    answer:
      "goCoupon runs on supported shopping pages only and stays idle elsewhere to avoid unnecessary browser overhead.",
  },
];

export const Route = createFileRoute("/extension")({
  component: ExtensionPage,
  head: () =>
    createSeoHead({
      title: "Download goCoupon Chrome Extension – Save with Coupons",
      description:
        "Install the free goCoupon Chrome extension to auto-apply coupon codes and unlock cashback on Amazon, Flipkart, Myntra, Meesho and more.",
      path: "/extension",
      keywords:
        "download coupon extension, chrome coupon extension, best coupon extension chrome, install goCoupon extension",
    }),
});

function ExtensionPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Chrome Extension", path: "/extension" },
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
            Chrome extension
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Download goCoupon and stop manual coupon hunting.
          </h1>
          <p className="mt-5 max-w-3xl text-base text-muted-foreground sm:text-lg">
            Install once and let goCoupon auto-apply coupon codes at checkout while surfacing better
            savings opportunities from cashback and bank offers.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#cta"
              className="inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-shadow hover:shadow-[var(--shadow-accent)]"
            >
              Add to Chrome — Free
            </a>
            <Link
              to="/how-it-works"
              className="inline-flex items-center rounded-full border border-border px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-card"
            >
              See how it works
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Installation checklist
          </h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              "Install goCoupon from the Chrome extension page.",
              "Pin the extension so it is easy to access.",
              "Open Amazon, Flipkart, Myntra or Meesho checkout.",
              "Allow goCoupon to test and apply the best coupon code.",
            ].map((item, index) => (
              <li
                key={item}
                className="rounded-xl border border-border bg-card p-5 text-muted-foreground"
              >
                <span className="mr-2 font-semibold text-foreground">{index + 1}.</span>
                {item}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </SiteShell>
  );
}
