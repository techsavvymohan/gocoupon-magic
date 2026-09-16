/**
 * @file ask.tsx
 * @description "Ask GoCoupon" AI Shopping Research Assistant Hub.
 */

import { createFileRoute, redirect } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import { AskGoCouponChat } from "@/components/shopping/AskGoCouponChat";
import { Bot, ShieldCheck, Terminal, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/ask")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: AskGoCouponPage,
  head: () =>
    createSeoHead({
      title: "Ask goCoupon – Evidence-Backed Shopping Assistant",
      description:
        "Ask goCoupon anything about prices, discounts, and product comparisons. Powered by grounded catalog data, 30-day price history, and verified tech reviews.",
      path: "/ask",
      keywords:
        "shopping assistant, ask gocoupon, product recommendation, grounded shopping agent india, price research",
    }),
});

function AskGoCouponPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Ask", path: "/ask" },
  ]);

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <section className="relative border-b border-border px-6 pb-12 pt-16 sm:pt-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 font-mono text-xs uppercase tracking-[0.2em] text-primary">
            <Bot className="h-3.5 w-3.5" aria-hidden="true" />
            Shopping Intelligence Engine
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
            Ask goCoupon Shopping Assistant
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground text-balance">
            Get instant, evidence-backed shopping answers grounded in real price history, multi-store comparisons, active coupons, and verified tech lab reviews.
          </p>
        </div>
      </section>

      {/* Search & Intelligence Workspace */}
      <section className="px-4 sm:px-6 py-10 sm:py-14 pb-28 sm:pb-20">
        <div className="mx-auto max-w-5xl">
          <AskGoCouponChat />
        </div>
      </section>
    </SiteShell>
  );
}
