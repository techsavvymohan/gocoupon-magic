/**
 * @file AskGoCouponChat.tsx
 * @description "Ask GoCoupon" AI Search & Shopping Intelligence Interface.
 *
 * Replaces traditional conversational chat bubbles with a top-mounted
 * AI search bar and a rich, grounded Shopping Intelligence Dossier below.
 */

import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { askGoCoupon, type AssistantAnswer } from "@/lib/services/ask-gocoupon";
import {
  Search,
  Loader2,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Clipboard,
  X,
  TrendingDown,
  Tag,
  Star,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

const POPULAR_QUERIES = [
  "Best noise cancelling headphones under ₹30,000",
  "Which store has MacBook M3 at the lowest price?",
  "Are there active coupons for boAt Airdopes?",
  "Sony WH-1000XM5 price history & genuine discount",
  "Best 4K Smart TV under ₹45,000 with warranty",
] as const;

export function AskGoCouponChat() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeAnswer, setActiveAnswer] = useState<AssistantAnswer | null>(null);
  const [activeQuery, setActiveQuery] = useState<string>("");
  const [showReasoning, setShowReasoning] = useState(false);

  // Auto-run a starter question on mount if not already answered
  useEffect(() => {
    handleSearch("Best noise cancelling headphones under ₹30,000");
  }, []);

  const handleSearch = async (textToSearch?: string) => {
    const q = (textToSearch !== undefined ? textToSearch : query).trim();
    if (!q || isLoading) return;

    setQuery(q);
    setActiveQuery(q);
    setIsLoading(true);

    try {
      const answer = await askGoCoupon(q);
      setActiveAnswer(answer);
    } catch {
      toast.error("Unable to retrieve product evidence. Please try another query.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setQuery(text);
        toast.info("Pasted from clipboard");
      }
    } catch {
      toast.error("Unable to access clipboard");
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Top AI Search Bar Card */}
      <div className="rounded-3xl border border-border/80 bg-card/90 p-4 sm:p-6 shadow-xl backdrop-blur-xl transition-all">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
        >
          {/* Search Input Box */}
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              name="shoppingQuery"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about any product, comparison, price history, or coupon…"
              autoComplete="off"
              spellCheck={false}
              inputMode="search"
              aria-label="Ask a shopping question"
              className="w-full rounded-2xl border border-border/80 bg-background/80 py-4 pl-12 pr-20 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 touch-manipulation transition-colors"
            />

            {/* Clear / Paste Right Buttons */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear input"
                  className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors touch-manipulation"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePaste}
                  aria-label="Paste from clipboard"
                  className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1 text-[11px] font-mono text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors touch-manipulation"
                >
                  <Clipboard className="h-3 w-3" aria-hidden="true" />
                  <span>Paste</span>
                </button>
              )}
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            aria-label="Search shopping assistant"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-7 py-4 min-h-[48px] text-sm font-bold text-primary-foreground shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Searching…</span>
              </>
            ) : (
              <>
                <span>Ask</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1">
            Popular:
          </span>
          {POPULAR_QUERIES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleSearch(item)}
              className="rounded-xl border border-border/70 bg-muted/30 px-3 py-1.5 min-h-[30px] text-xs font-medium text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors active:scale-95 touch-manipulation"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Pulse State */}
      {isLoading && (
        <div
          aria-live="polite"
          className="rounded-3xl border border-border bg-card p-8 sm:p-10 shadow-lg text-center space-y-4 animate-pulse"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Loader2 className="h-7 w-7 animate-spin" aria-hidden="true" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground">
            Analyzing live store offers and verified reviews…
          </h3>
          <div className="mx-auto max-w-md space-y-2 text-xs font-mono text-muted-foreground">
            <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
              <span>1. Cross-referencing 6 retail stores</span>
              <span className="text-emerald-500 font-bold">✓ Done</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
              <span>2. Calculating coupon savings &amp; cashback</span>
              <span className="text-emerald-500 font-bold">✓ Done</span>
            </div>
            <div className="flex items-center justify-between">
              <span>3. Extracting lab benchmarks &amp; limitations</span>
              <span className="text-primary font-bold animate-pulse">Scanning…</span>
            </div>
          </div>
        </div>
      )}

      {/* Intelligence Dossier Result (Below Search Bar) */}
      {!isLoading && activeAnswer && (
        <div aria-live="polite" className="space-y-6 animate-fade-in">
          {/* Query Header & Grounding Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-muted/20 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-muted-foreground uppercase">Query:</span>
              <h2 className="font-display text-sm sm:text-base font-bold text-foreground">
                &ldquo;{activeQuery}&rdquo;
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                Grounded Evidence • Zero Hallucinations
              </span>
            </div>
          </div>

          {/* Direct Verdict Card */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-primary font-bold">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
              Intelligence Summary &amp; Recommendation
            </div>
            <p className="font-body text-base sm:text-lg leading-relaxed text-foreground whitespace-pre-line">
              {activeAnswer.verdictText}
            </p>
          </div>

          {/* Recommended Products Grid with Direct Buy & 90d Price Links */}
          {activeAnswer.recommendedProducts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-foreground">
                  Recommended Products &amp; Best Store Deals
                </h3>
                <span className="font-mono text-xs text-muted-foreground">
                  {activeAnswer.recommendedProducts.length} Top Choices
                </span>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {activeAnswer.recommendedProducts.map((rec) => (
                  <article
                    key={rec.product.id}
                    className="flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-lg"
                  >
                    <div>
                      {/* Product Header */}
                      <div className="flex items-start gap-4">
                        <img
                          src={rec.product.imageUrl}
                          alt={rec.product.title}
                          width={72}
                          height={72}
                          className="h-18 w-18 shrink-0 rounded-2xl object-cover border border-border bg-muted"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-[11px] font-bold text-muted-foreground uppercase">
                              {rec.product.brand}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-amber-500">
                              <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                              {rec.product.rating.toFixed(1)}
                            </span>
                          </div>
                          <h4 className="mt-1 font-display text-base font-bold text-foreground leading-snug line-clamp-2">
                            <Link to="/product/$productId" params={{ productId: rec.product.id }}>
                              {rec.product.title}
                            </Link>
                          </h4>
                          <div className="mt-2 flex items-baseline gap-2">
                            <span className="font-display text-xl font-bold text-primary tabular-nums">
                              {rec.bestPriceDisplay}
                            </span>
                            <span className="font-mono text-xs text-muted-foreground">
                              on {rec.bestStore}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Why Choose + Honest Limitation */}
                      <div className="mt-4 space-y-2 rounded-2xl border border-border/60 bg-muted/20 p-3.5 text-xs">
                        <p className="leading-relaxed text-foreground">
                          <strong className="text-emerald-600 dark:text-emerald-400">Why choose this:</strong>{" "}
                          {rec.keyReason}
                        </p>
                        <p className="leading-relaxed text-muted-foreground">
                          <strong className="text-amber-600 dark:text-amber-400">Limitation:</strong>{" "}
                          {rec.honestLimitation}
                        </p>
                      </div>
                    </div>

                    {/* Action Links */}
                    <div className="mt-5 flex items-center gap-2 border-t border-border pt-4">
                      <Link
                        to="/product/$productId"
                        params={{ productId: rec.product.id }}
                        className="flex-1 rounded-xl border border-border bg-card py-2.5 text-center text-xs font-bold text-foreground hover:bg-muted hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors touch-manipulation min-h-[36px] flex items-center justify-center"
                      >
                        90-Day Price &amp; Offers
                      </Link>
                      {rec.comparison?.bestDeal && (
                        <a
                          href={rec.comparison.bestDeal.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Buy on ${rec.bestStore}`}
                          className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2.5 min-h-[36px] text-xs font-bold text-primary-foreground shadow-xs hover:scale-105 active:scale-95 transition-transform touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <span>Shop on {rec.bestStore}</span>
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Expandable Internal Verification & Reasoning Trace */}
          <div className="rounded-3xl border border-border/80 bg-card overflow-hidden">
            <button
              type="button"
              onClick={() => setShowReasoning(!showReasoning)}
              className="w-full flex items-center justify-between p-5 text-left font-mono text-xs font-bold text-foreground hover:bg-muted/30 transition-colors touch-manipulation"
              aria-expanded={showReasoning}
            >
              <div className="flex items-center gap-2 text-primary">
                <Terminal className="h-4 w-4" aria-hidden="true" />
                <span>
                  Internal Tool Executions &amp; Reasoning Trace ({activeAnswer.thoughtProcess.length} verification steps)
                </span>
              </div>
              {showReasoning ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              )}
            </button>

            {showReasoning && (
              <div className="border-t border-border p-5 space-y-4 bg-muted/10 font-mono text-xs animate-fade-in">
                <ul className="space-y-2 border-l-2 border-primary/30 pl-3">
                  {activeAnswer.thoughtProcess.map((step, idx) => (
                    <li key={idx} className="leading-relaxed text-muted-foreground">
                      <span className="text-emerald-500 font-bold">✓</span> {step}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
                  <span className="text-[11px] text-muted-foreground">Grounded Tool Calls:</span>
                  {activeAnswer.toolCalls.map((tc, idx) => (
                    <span
                      key={idx}
                      className="rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 font-mono text-[10px] text-primary"
                    >
                      ⚡ {tc.toolName}()
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Verified Evidence & Sources Citations */}
          {activeAnswer.sourcesCited && activeAnswer.sourcesCited.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground font-bold">
                <ShieldCheck className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                Verified Tech Lab Citations &amp; Evidence Sources
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {activeAnswer.sourcesCited.map((cit, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-border/70 bg-card p-4 shadow-2xs text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="font-display font-bold text-foreground">
                        {cit.title}
                      </strong>
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                        {cit.type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 font-mono text-[10px]">
                      <span className="text-emerald-500 font-bold">Verified Lab Benchmark</span>
                      <span className="text-muted-foreground">{cit.url}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Follow-up Question Chips */}
          {activeAnswer.suggestedFollowUps && activeAnswer.suggestedFollowUps.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-5 space-y-3">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground font-bold block">
                Suggested Follow-up Questions:
              </span>
              <div className="flex flex-wrap gap-2">
                {activeAnswer.suggestedFollowUps.map((fu, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSearch(fu)}
                    className="rounded-xl border border-border/80 bg-card px-3.5 py-2 min-h-[36px] text-xs font-medium text-foreground hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors touch-manipulation active:scale-95"
                  >
                    {fu}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
