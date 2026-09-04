import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import { HeartCrack, Send, CheckCircle2, MessageSquare, HelpCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/uninstall")({
  component: UninstallPage,
  head: () =>
    createSeoHead({
      title: "We're Sorry to See You Go – goCoupon Feedback",
      description:
        "Help us improve goCoupon. Let us know why you uninstalled the extension so we can make coupon finding faster and better for everyone.",
      path: "/uninstall",
      keywords: "gocoupon uninstall, extension feedback, uninstalled chrome extension",
    }),
});

const REASONS = [
  "Didn't find working coupons for my favorite stores",
  "The auto-apply popup didn't appear at checkout",
  "I don't shop online frequently enough",
  "Concerned about browser permissions or privacy",
  "Found another extension or tool I prefer",
  "Extension slowed down my browser",
];

function UninstallPage() {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customFeedback, setCustomFeedback] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason && !customFeedback) {
      toast.error("Please select a reason or provide your feedback.");
      return;
    }
    setIsSubmitted(true);
    toast.success("Thank you for helping us improve goCoupon!");
  };

  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Uninstall Feedback", path: "/uninstall" },
  ]);

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <section className="relative border-b border-border px-6 pb-20 pt-20 sm:pt-28">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <HeartCrack className="h-4 w-4 text-destructive" />
              Extension Uninstalled
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              We&apos;re sorry to see you go.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
              goCoupon has been successfully removed from your browser. Could you take 30 seconds to tell us why?
              Your feedback directly shapes our product roadmap.
            </p>
          </div>

          <div className="mt-12 rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-10">
            {isSubmitted ? (
              <div className="py-8 text-center animate-fade-in">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Thank you for your honesty!
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                  Your feedback has been recorded. We are continuously improving our coupon verification algorithms and store coverage.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
                  >
                    <span>Back to Homepage</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block font-display text-base font-semibold text-foreground">
                    What was the primary reason for uninstalling?
                  </label>
                  <div className="mt-4 space-y-2.5">
                    {REASONS.map((reason) => (
                      <label
                        key={reason}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm transition-colors ${
                          selectedReason === reason
                            ? "border-primary bg-primary/5 text-foreground font-medium"
                            : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        }`}
                      >
                        <input
                          type="radio"
                          name="uninstall-reason"
                          value={reason}
                          checked={selectedReason === reason}
                          onChange={(e) => setSelectedReason(e.target.value)}
                          className="h-4 w-4 text-primary focus:ring-primary"
                        />
                        <span>{reason}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-display text-sm font-semibold text-foreground">
                    Any additional comments or suggestions? (Optional)
                  </label>
                  <textarea
                    rows={4}
                    name="customFeedback"
                    value={customFeedback}
                    onChange={(e) => setCustomFeedback(e.target.value)}
                    placeholder="Tell us what we could have done better or which stores were missing…"
                    className="mt-2 w-full rounded-2xl border border-border bg-background p-4 text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 touch-manipulation"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 min-h-[44px] text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />
                    <span>Submit Feedback</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground">
              Need technical support or have an account question?{" "}
              <Link to="/contact" className="text-primary font-medium hover:underline">
                Contact our support team
              </Link>
            </p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
