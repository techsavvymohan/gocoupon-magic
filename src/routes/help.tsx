import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead, faqSchema } from "@/lib/seo";
import {
  HelpCircle,
  Search,
  ChevronDown,
  Sparkles,
  LifeBuoy,
  Download,
  AlertCircle,
  CreditCard,
  Shield,
  Mail,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/help")({
  component: HelpPage,
  head: () =>
    createSeoHead({
      title: "Help Center & Troubleshooting – goCoupon Support",
      description:
        "Find quick answers and troubleshooting guides for goCoupon. Learn how to install the extension, fix coupon errors, track cashback, and get direct support.",
      path: "/help",
      keywords:
        "goCoupon help, gocoupon support, coupon extension troubleshooting, how to use gocoupon, cashback help",
    }),
});

interface HelpTopic {
  id: string;
  category: "Installation" | "Coupons" | "Troubleshooting" | "Cashback" | "Privacy";
  question: string;
  answer: string;
}

const HELP_TOPICS: HelpTopic[] = [
  {
    id: "install-browsers",
    category: "Installation",
    question: "Which browsers are supported by goCoupon?",
    answer:
      "goCoupon works on all Chromium-based desktop browsers including Google Chrome, Microsoft Edge, Brave Browser, Opera, and Arc Browser. Mobile browser extensions are currently in beta development.",
  },
  {
    id: "install-pin",
    category: "Installation",
    question: "How do I pin the goCoupon icon to my browser toolbar?",
    answer:
      "Click the puzzle piece icon (🧩) in the top-right corner of your browser toolbar. Locate 'goCoupon' in the list and click the pushpin icon (📌) next to it so the goCoupon icon remains visible at all times.",
  },
  {
    id: "coupon-how",
    category: "Coupons",
    question: "How does goCoupon choose which coupon code to apply?",
    answer:
      "When you reach checkout, goCoupon runs an automated test of all known candidate promo codes for that specific store and category. It calculates the net price reduction for each code and applies the single coupon that produces the highest rupee savings for your cart.",
  },
  {
    id: "coupon-fail",
    category: "Troubleshooting",
    question: "Why did a coupon code not work or say invalid?",
    answer:
      "Coupons can fail due to merchant restrictions: minimum cart value thresholds, specific excluded product categories, brand restrictions, or requirement of a specific bank credit card. When a code fails for multiple users, our automated verification system drops it from our active index.",
  },
  {
    id: "extension-missing",
    category: "Troubleshooting",
    question: "Why is the goCoupon auto-apply popup not appearing at checkout?",
    answer:
      "Ensure the extension is enabled in your browser settings (chrome://extensions). The popup triggers automatically once you reach the final cart/checkout review step on supported merchants (Amazon, Flipkart, Myntra, Meesho). If another ad-blocker or conflicting extension is interfering, try whitelisting goCoupon.",
  },
  {
    id: "cashback-tracking",
    category: "Cashback",
    question: "How does cashback tracking work?",
    answer:
      "When you shop through goCoupon on eligible cashback stores, your purchase is recorded via our affiliate tracking parameters. Once the merchant confirms the order and the return/exchange window passes (typically 30–60 days), your cashback changes from 'Pending' to 'Confirmed'.",
  },
  {
    id: "privacy-safety",
    category: "Privacy",
    question: "Is goCoupon safe to use? Does it read my passwords or credit cards?",
    answer:
      "Yes, goCoupon is 100% safe. We operate on Google Chrome Manifest V3 with strict data isolation. We NEVER log keystrokes, access passwords, view OTPs, or read payment card details. We only inspect the coupon code input field on checkout pages.",
  },
  {
    id: "cost-free",
    category: "Installation",
    question: "Is goCoupon completely free? Are there any hidden fees?",
    answer:
      "goCoupon is 100% free to install and use. There are no paid tiers, subscriptions, or hidden charges. We earn affiliate commissions from merchant partners when you complete a purchase, which allows us to keep the service free for all consumers.",
  },
];

const CATEGORIES = ["All", "Installation", "Coupons", "Troubleshooting", "Cashback", "Privacy"] as const;

function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    "install-browsers": true,
    "coupon-how": true,
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredTopics = useMemo(() => {
    return HELP_TOPICS.filter((topic) => {
      const matchesSearch =
        topic.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || topic.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Help Center", path: "/help" },
  ]);

  const faq = faqSchema(
    HELP_TOPICS.map((t) => ({ question: t.question, answer: t.answer }))
  );

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

      {/* Hero Header */}
      <section className="relative border-b border-border px-6 pb-16 pt-20 sm:pt-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 font-mono text-xs uppercase tracking-[0.2em] text-primary">
            <LifeBuoy className="h-3.5 w-3.5" />
            Knowledge Base &amp; Support
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            How can we help you save today?
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Search our knowledge base for instant troubleshooting guides, browser setup tutorials, and answers to common questions.
          </p>

          {/* Search Box */}
          <div className="mx-auto mt-8 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                type="search"
                name="helpSearch"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by keyword (e.g. pin extension, cashback, code failed)…"
                autoComplete="off"
                spellCheck={false}
                aria-label="Search help center questions and guides"
                className="w-full rounded-full border border-border bg-card py-3.5 pl-12 pr-16 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 touch-manipulation"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search query"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground hover:text-foreground touch-manipulation min-h-[32px] px-2"
                >
                  CLEAR
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main FAQ Accordion List */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-foreground">
              {filteredTopics.length} {filteredTopics.length === 1 ? "Article" : "Articles"} Found
            </h2>
            <span className="font-mono text-xs text-muted-foreground">Click to expand</span>
          </div>

          {filteredTopics.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center">
              <p className="text-base text-muted-foreground">
                No help articles found for &ldquo;{searchQuery}&rdquo;.
              </p>
              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Clear search
                </button>
                <span>•</span>
                <Link to="/contact" className="text-sm font-semibold text-primary hover:underline">
                  Contact support directly
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTopics.map((topic) => {
                const isOpen = !!openItems[topic.id];
                return (
                  <div
                    key={topic.id}
                    className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all"
                  >
                    <button
                      onClick={() => toggleItem(topic.id)}
                      className="flex w-full items-center justify-between p-6 text-left"
                    >
                      <div className="flex items-center gap-3 pr-4">
                        <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-primary">
                          {topic.category}
                        </span>
                        <h3 className="font-display text-base font-bold text-foreground">
                          {topic.question}
                        </h3>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-primary" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-border/60 bg-muted/20 px-6 pb-6 pt-4 text-sm leading-relaxed text-muted-foreground animate-fade-in">
                        {topic.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Still Need Help Contact Box */}
      <section className="border-t border-border bg-muted/20 px-6 py-16">
        <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-8 sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-primary">
                <Mail className="h-3.5 w-3.5" />
                Dedicated Human Support
              </div>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Still have a question or need assistance?
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Our support team in Bengaluru is ready to help with store issues, partnership queries, or extension bug reports.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-105"
                >
                  <span>Open Support Ticket</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="mailto:support@gocoupon.io"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
                >
                  <span>Email: support@gocoupon.io</span>
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background p-6">
              <div className="font-mono text-xs text-muted-foreground">Response Time Target</div>
              <div className="mt-2 font-display text-3xl font-bold text-foreground">&lt; 24 Hours</div>
              <p className="mt-2 text-xs text-muted-foreground">
                Monday to Saturday, 9:00 AM – 7:00 PM IST.
              </p>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
