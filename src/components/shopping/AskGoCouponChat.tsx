/**
 * @file AskGoCouponChat.tsx
 * @description "Ask GoCoupon" Conversational AI Assistant Interface.
 *
 * Demonstrates:
 * - Structured reasoning & thought process
 * - Grounded internal tool calls (Catalog search, Price comparison, Coupon lookups)
 * - Interactive product cards & citations of stored evidence
 * - Suggestion prompt chips & zero-hallucination guardrails
 */

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { askGoCoupon, type AssistantAnswer } from "@/lib/services/ask-gocoupon";
import {
  Bot,
  Loader2,
  Send,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Tag,
  Clock,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

export function AskGoCouponChat() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content?: string; answer?: AssistantAnswer }>
  >([
    {
      role: "assistant",
      content:
        "Hello! I am your **GoCoupon AI Research Assistant**. I analyze live retailer prices, 90-day price history graphs, and verified lab benchmarks to find you the best evidence-backed deals. What are you shopping for today?",
    },
  ]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || query;
    if (!text.trim() || isLoading) return;

    const userMsg = text.trim();
    setQuery("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const answer = await askGoCoupon(userMsg);
      setMessages((prev) => [...prev, { role: "assistant", answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I had trouble retrieving product evidence. Please try a different query.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col rounded-3xl border border-border bg-card shadow-2xl overflow-hidden min-h-[600px] max-w-4xl mx-auto">
      {/* Top Assistant Header */}
      <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xs">
            <Bot className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-foreground">Ask GoCoupon Assistant</h3>
            <span className="font-mono text-[10px] text-emerald-500 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Grounded Catalog • Zero Hallucination Mode
            </span>
          </div>
        </div>
        <span className="hidden sm:inline-block font-mono text-[10px] text-muted-foreground border border-border px-2 py-0.5 rounded-md">
          v2.4 Engine
        </span>
      </div>

      {/* Message Feed */}
      <div
        className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[600px]"
        aria-live="polite"
        aria-atomic="false"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            {msg.role === "user" ? (
              <div className="rounded-2xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground max-w-[85%] shadow-sm">
                {msg.content}
              </div>
            ) : msg.answer ? (
              <div className="w-full space-y-5 rounded-3xl border border-border/80 bg-muted/10 p-6">
                {/* Thought Process Accordion */}
                <div className="rounded-2xl border border-border/60 bg-muted/30 p-3.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-primary mb-2">
                    <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
                    INTERNAL VERIFICATION ENGINE
                  </div>
                  <ul className="space-y-1 font-mono text-[11px]">
                    {msg.answer.thoughtProcess.map((tp, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="text-emerald-500">✓</span> {tp}
                      </li>
                    ))}
                  </ul>

                  {/* Tool Call Badges */}
                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/60 pt-2">
                    {msg.answer.toolCalls.map((tc, i) => (
                      <span
                        key={i}
                        className="rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 font-mono text-[10px] text-primary"
                      >
                        ⚡ {tc.toolName}()
                      </span>
                    ))}
                  </div>
                </div>

                {/* Main Recommendation Text */}
                <div className="text-sm text-foreground leading-relaxed">
                  <p>{msg.answer.verdictText}</p>
                </div>

                {/* Recommended Products Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {msg.answer.recommendedProducts.map((rec) => (
                    <div
                      key={rec.product.id}
                      className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <img
                            src={rec.product.imageUrl}
                            alt={rec.product.title}
                            width={56}
                            height={56}
                            className="h-14 w-14 rounded-xl object-cover border border-border"
                          />
                          <div className="min-w-0">
                            <h4 className="font-display text-sm font-bold text-foreground truncate">
                              {rec.product.title}
                            </h4>
                            <span className="font-mono text-xs text-primary font-bold tabular-nums">
                              {rec.bestPriceDisplay}{" "}
                              <span className="text-[10px] text-muted-foreground font-normal">on {rec.bestStore}</span>
                            </span>
                          </div>
                        </div>

                        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                          <strong>Why choose this:</strong> {rec.keyReason}
                        </p>
                        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                          <strong>Limitation:</strong> {rec.honestLimitation}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                        <Link
                          to="/product/$productId"
                          params={{ productId: rec.product.id }}
                          className="text-xs font-semibold text-primary hover:underline touch-manipulation min-h-[32px] flex items-center"
                        >
                          View 90d Price &amp; Offers →
                        </Link>
                        {rec.comparison?.bestDeal && (
                          <a
                            href={rec.comparison.bestDeal.affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Buy best deal on ${rec.bestStore}`}
                            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            Buy Best Deal
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Suggested Follow-Ups */}
                {msg.answer.suggestedFollowUps && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {msg.answer.suggestedFollowUps.map((fu, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSend(fu)}
                        className="rounded-full border border-border bg-card px-3 py-1.5 min-h-[32px] text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        {fu}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-muted/20 px-5 py-3.5 text-sm text-foreground max-w-[85%]">
                {msg.content}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground font-mono w-fit animate-pulse">
            <Loader2 className="h-4 w-4 text-primary animate-spin" aria-hidden="true" />
            Querying verified catalog, checking price history, and extracting reviewer evidence…
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="border-t border-border bg-background p-4">
        {/* Suggestion Chips */}
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground font-mono text-[10px]">Popular questions:</span>
          {[
            "Best noise cancelling headphones under ₹30,000",
            "Which store has MacBook M3 at the lowest price?",
            "Are there active coupons for boAt Airdopes?",
          ].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSend(prompt)}
              className="rounded-lg border border-border/80 bg-muted/40 px-2.5 py-1 min-h-[28px] text-[11px] text-muted-foreground hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors touch-manipulation"
            >
              {prompt}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="search"
            name="assistantPrompt"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about any product, comparison, coupon, or price history…"
            autoComplete="off"
            spellCheck={false}
            aria-label="Ask GoCoupon assistant a shopping question"
            className="flex-1 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 touch-manipulation"
          />
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            aria-label="Send message"
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
