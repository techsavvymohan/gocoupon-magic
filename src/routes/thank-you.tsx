import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import {
  CheckCircle2,
  ArrowRight,
  Zap,
  Layers,
  Flame,
  Home,
  ShieldCheck,
  Clock,
} from "lucide-react";

export const Route = createFileRoute("/thank-you")({
  component: ThankYouPage,
  validateSearch: (search: Record<string, unknown>) => ({
    source: (search.source as string) || "contact",
  }),
  head: () =>
    createSeoHead({
      title: "Thank You – goCoupon Official Confirmation",
      description:
        "Thank you for contacting goCoupon. Our team has received your message and will respond promptly. Explore top coupons, live price comparison, and browser extension savings.",
      path: "/thank-you",
      keywords: "thank you gocoupon, contact confirmation, gocoupon support inquiry",
    }),
});

function ThankYouPage() {
  const { source } = Route.useSearch();
  const isContact = source === "contact";

  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Thank You", path: "/thank-you" },
  ]);

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <section className="relative min-h-[85vh] flex items-center justify-center px-4 sm:px-6 py-20 sm:py-28 overflow-hidden bg-background">
        <div className="mx-auto max-w-3xl text-center">
          {/* Success Animated Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-500 ring-8 ring-emerald-500/10 animate-in zoom-in-75 duration-300">
            <CheckCircle2 className="h-10 w-10" aria-hidden="true" />
          </div>

          {/* Status Pill */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            {isContact ? "INQUIRY CONFIRMED & QUEUED" : "ACTION COMPLETED"}
          </div>

          {/* Headline */}
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground text-balance">
            {isContact ? "Thank You for Reaching Out!" : "You're All Set!"}
          </h1>

          {/* Subheading */}
          <p className="mx-auto mt-4 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            {isContact
              ? "Our support team in Bangalore has received your message. We typically review and respond to inquiries within 2 hours during active business hours (Mon–Sat: 9am–8pm IST)."
              : "Thank you for using GoCoupon. Your request has been processed successfully."}
          </p>

          {/* Response Promise Card */}
          <div className="mx-auto mt-6 max-w-md rounded-2xl border border-border/80 bg-card/60 p-4 backdrop-blur-md flex items-center justify-center gap-4 text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-emerald-500" />
              <span>&lt; 2h Avg Response</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Zero-Spam Guarantee</span>
            </div>
          </div>

          {/* Next Steps: While You Wait */}
          <div className="mt-12 text-left">
            <h2 className="text-center font-display text-lg font-bold text-foreground mb-6">
              While you wait, start saving on your shopping:
            </h2>

            <div className="grid gap-4 sm:grid-cols-3">
              {/* Option 1: Chrome Extension */}
              <Link
                to="/chrome-extension"
                className="group relative rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-primary/50 hover:shadow-md active:scale-98"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3.5 group-hover:scale-110 transition-transform">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                  Chrome Extension
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  Auto-apply valid promo codes at checkout in under 850ms.
                </p>
              </Link>

              {/* Option 2: Price Comparison */}
              <Link
                to="/compare"
                className="group relative rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-primary/50 hover:shadow-md active:scale-98"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 mb-3.5 group-hover:scale-110 transition-transform">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                  Price Comparison
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  Compare prices across Amazon, Flipkart, and 200+ retailers.
                </p>
              </Link>

              {/* Option 3: Today's Deals */}
              <Link
                to="/deals"
                className="group relative rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-primary/50 hover:shadow-md active:scale-98"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 mb-3.5 group-hover:scale-110 transition-transform">
                  <Flame className="h-5 w-5" />
                </div>
                <h3 className="font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                  Verified Deals
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  Discover today's lightning deals and lowest prices.
                </p>
              </Link>
            </div>
          </div>

          {/* Home Link */}
          <div className="mt-10 flex items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted active:scale-95 transition-all shadow-2xs"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Return to Homepage</span>
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
