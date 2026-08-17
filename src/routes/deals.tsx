import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { createSeoHead } from "@/lib/seo";
import { Flame, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/deals")({
  component: DealsRedirectPage,
  head: () =>
    createSeoHead({
      title: "Redirecting to goCoupon Deals Hub...",
      description: "Redirecting to the official goCoupon deals and coupons platform at deals.gocoupon.io.",
      path: "/deals",
    }),
});

function DealsRedirectPage() {
  useEffect(() => {
    // Perform instant redirect
    window.location.replace("https://deals.gocoupon.io");
  }, []);

  return (
    <SiteShell>
      <div className="flex min-h-[65vh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 font-mono text-xs uppercase tracking-[0.2em] text-primary">
          <Flame className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
          goCoupon Deals Hub
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
          Taking you to deals.gocoupon.io...
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          If you are not redirected automatically, click the button below.
        </p>
        <div className="mt-6">
          <a
            href="https://deals.gocoupon.io"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-105"
          >
            <span>Open Deals Platform</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </SiteShell>
  );
}
