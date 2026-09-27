import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead, faqSchema } from "@/lib/seo";
import {
  HelpCircle,
  Search,
  ChevronDown,
  LifeBuoy,
  Download,
  AlertCircle,
  CreditCard,
  Shield,
  Mail,
  ArrowRight,
  Zap,
  CheckCircle2,
  SlidersHorizontal,
  Compass,
  Laptop,
} from "lucide-react";

export const Route = createFileRoute("/help")({
  component: HelpPage,
  head: () =>
    createSeoHead({
      title: "Help Center, Extension Setup & Troubleshooting – GoCoupon",
      description:
        "Official GoCoupon Help Center. Step-by-step troubleshooting guides, extension installation instructions, coupon validation rules, and direct customer support.",
      path: "/help",
      keywords:
        "goCoupon help, gocoupon support center, coupon extension troubleshooting, how to install gocoupon, cashback support, coupon code failed help",
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
    question: "Which browsers are officially supported by GoCoupon?",
    answer:
      "GoCoupon is built on Google Chrome Manifest V3 and runs seamlessly on all Chromium-based desktop browsers: Google Chrome, Brave Browser, Microsoft Edge, Opera, Vivaldi, and Arc Browser. Mobile browser extensions for Android Chromium browsers are currently in active beta.",
  },
  {
    id: "install-pin",
    category: "Installation",
    question: "How do I pin the GoCoupon icon to my browser toolbar?",
    answer:
      "After installing, click the puzzle piece icon (🧩) in the top-right corner of your browser toolbar. Locate 'GoCoupon – Coupon Finder' in the dropdown and click the pushpin icon (📌) next to it. For a guided visual walkthrough, visit our official Welcome & Quick-Start Guide (/welcome).",
  },
  {
    id: "coupon-how",
    category: "Coupons",
    question: "How does the automated coupon testing engine select the best code?",
    answer:
      "When you proceed to checkout on any supported merchant (Amazon, Flipkart, Myntra, Swiggy, etc.), GoCoupon automatically intercepts the promo code input box. It sends candidate promo codes from our live verified database in parallel, evaluates the exact rupee savings for your cart items, and applies the single coupon code that yields the maximum net price reduction.",
  },
  {
    id: "coupon-fail",
    category: "Troubleshooting",
    question: "Why did a coupon code say 'Invalid' or fail to apply on my cart?",
    answer:
      "Promo codes fail primarily due to retailer-enforced restrictions: minimum cart value thresholds (e.g., flat ₹500 off on minimum purchase of ₹2,499), category exclusions (e.g., coupons excluded on gold coins or Apple products), brand limitations, or specific bank credit card requirements. When multiple shoppers encounter a failed code, our autonomous crawler drops the code from our live database within 15 minutes.",
  },
  {
    id: "extension-missing",
    category: "Troubleshooting",
    question: "Why is the GoCoupon auto-apply modal not appearing at checkout?",
    answer:
      "First, check chrome://extensions to confirm GoCoupon is enabled. Second, ensure you are on the final payment or cart review stage where the promo code box is active. If you use aggressive third-party ad blockers or conflicting shopping tools, try temporarily whitelisting GoCoupon or disabling competing coupon extensions that lock checkout forms.",
  },
  {
    id: "cashback-tracking",
    category: "Cashback",
    question: "How does cashback tracking and payment confirmation work?",
    answer:
      "When you click through an eligible store offer on GoCoupon, your session is stamped with an affiliate tracking ID. The store records your order within 24–72 hours as 'Pending'. After the retailer's official return/exchange window closes (usually 30–60 days), the merchant confirms the purchase and cashback transitions to 'Payable' in your account.",
  },
  {
    id: "privacy-safety",
    category: "Privacy",
    question: "Is GoCoupon safe? Does it read my passwords, cards, or keystrokes?",
    answer:
      "Yes, GoCoupon is 100% safe. We strictly comply with Google Chrome Manifest V3 sandboxing standards. We do not inject remote scripts, log keystrokes, view passwords, or inspect credit card inputs. GoCoupon only interacts with the merchant promo code input box.",
  },
  {
    id: "cost-free",
    category: "Installation",
    question: "Is GoCoupon completely free? Are there any hidden fees or paid tiers?",
    answer:
      "GoCoupon is 100% free to install and use forever. There are zero subscription tiers, premium memberships, or hidden charges. We earn a small affiliate referral bonus from retail partners when you save money on your order, keeping the service free for all consumers.",
  },
  {
    id: "uninstall-procedure",
    category: "Troubleshooting",
    question: "How do I remove or temporarily disable the extension?",
    answer:
      "You can easily remove GoCoupon by right-clicking the GoCoupon icon in your toolbar and selecting 'Remove from Chrome'. You can also view our dedicated Uninstall & Feedback Guide (/uninstall) to share bug reports or suggestions with our engineering team.",
  },
  {
    id: "submit-new-coupon",
    category: "Coupons",
    question: "How can I share a working coupon code that GoCoupon doesn't have?",
    answer:
      "Shoppers can submit working promo codes directly through our Community Deal Submission portal (/submit-coupon). Our automated validation engine tests the code against live retailer endpoints in under 850ms before releasing it to our public deals feed.",
  },
];

const CATEGORIES = ["All", "Installation", "Coupons", "Troubleshooting", "Cashback", "Privacy"] as const;

function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    "install-browsers": true,
    "coupon-how": true,
    "coupon-fail": true,
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
      <section className="relative border-b border-border px-6 pb-16 pt-20 sm:pt-28 bg-background">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 font-mono text-xs uppercase tracking-[0.2em] text-primary">
            <LifeBuoy className="h-3.5 w-3.5" />
            GoCoupon Knowledge Base &amp; Help Desk
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
            How Can We Help You Save Today?
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed text-balance">
            Search our knowledge base for instant troubleshooting guides, browser setup tutorials, coupon mechanics, and dedicated customer support.
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
                placeholder="Search troubleshooting guides (e.g. pin extension, code failed, cashback)…"
                autoComplete="off"
                spellCheck={false}
                aria-label="Search help center questions and guides"
                className="w-full rounded-full border border-border bg-card py-3.5 pl-12 pr-16 text-base sm:text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 touch-manipulation"
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
                      ? "bg-primary text-primary-foreground shadow-sm font-semibold"
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

      {/* Key Takeaways & Quick-Start Principles */}
      <section className="border-b border-border px-6 py-14 bg-muted/20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Core Principles of GoCoupon Support
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Everything you need to know about how our automation and verification engine operates.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-base text-foreground">Parallel Testing</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                GoCoupon tests up to 25 verified promo codes in under 850 milliseconds without slowing down your checkout browser tab.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 mb-3">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-base text-foreground">15-Minute Purge Cycle</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Codes reported as invalid by users are re-tested by automated headless runners and purged from our database within 15 minutes.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 mb-3">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-base text-foreground">Manifest V3 Sandboxed</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Zero remote executable code. Runs locally within your browser sandbox with zero access to financial or identity credentials.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 mb-3">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-base text-foreground">Bank Stacking Matrix</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Identifies card-level instant discounts across HDFC, SBI, ICICI, and Axis banks to stack extra 10% savings on top of coupons.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main FAQ Accordion List */}
      <section className="px-6 py-16 bg-background">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-foreground">
              {filteredTopics.length} {filteredTopics.length === 1 ? "Guide" : "Guides"} Available
            </h2>
            <span className="font-mono text-xs text-muted-foreground">Click question to toggle details</span>
          </div>

          {filteredTopics.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center">
              <p className="text-base text-muted-foreground">
                No help articles found matching &ldquo;{searchQuery}&rdquo;.
              </p>
              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  className="text-sm font-semibold text-primary hover:underline cursor-pointer"
                >
                  Clear search query
                </button>
                <span>•</span>
                <Link to="/contact" className="text-sm font-semibold text-primary hover:underline">
                  Contact customer support desk
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
                    className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all hover:border-primary/40"
                  >
                    <button
                      type="button"
                      onClick={() => toggleItem(topic.id)}
                      className="flex w-full items-center justify-between p-6 text-left cursor-pointer"
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
                      <div className="border-t border-border/60 bg-muted/10 px-6 pb-6 pt-4 text-sm leading-relaxed text-muted-foreground animate-in fade-in">
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

      {/* Helpful Contextual Resource Links */}
      <section className="border-t border-border px-6 py-14 bg-muted/20">
        <div className="mx-auto max-w-4xl">
          <h3 className="font-display text-xl font-bold text-foreground mb-6 text-center">
            Dedicated Onboarding &amp; Support Portals
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              to="/welcome"
              className="rounded-2xl border border-border bg-card p-5 hover:border-primary/50 transition-all flex items-start gap-4 group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                  Extension Welcome Guide
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  3-step setup guide on pinning the icon, checking permissions, and running your first checkout test.
                </p>
              </div>
            </Link>

            <Link
              to="/submit-coupon"
              className="rounded-2xl border border-border bg-card p-5 hover:border-primary/50 transition-all flex items-start gap-4 group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-105 transition-transform">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-foreground group-hover:text-emerald-500 transition-colors">
                  Submit a Coupon Code
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Share a working discount or voucher code with thousands of online shoppers worldwide.
                </p>
              </div>
            </Link>

            <Link
              to="/featured-deals"
              className="rounded-2xl border border-border bg-card p-5 hover:border-primary/50 transition-all flex items-start gap-4 group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-105 transition-transform">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-foreground group-hover:text-amber-500 transition-colors">
                  Featured Partner Deals
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Hand-verified promo codes and limited-time savings across travel, health, electronics, and fashion.
                </p>
              </div>
            </Link>

            <Link
              to="/uninstall"
              className="rounded-2xl border border-border bg-card p-5 hover:border-primary/50 transition-all flex items-start gap-4 group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 group-hover:scale-105 transition-transform">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-foreground group-hover:text-rose-500 transition-colors">
                  Uninstall &amp; Feedback Guide
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Need to remove or pause the extension? Share feedback to help our engineering team improve.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Still Need Help Contact Box */}
      <section className="border-t border-border bg-background px-6 py-16">
        <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-8 sm:p-12 shadow-sm">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-primary">
                <Mail className="h-3.5 w-3.5" />
                Dedicated Human Support
              </div>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Still have a question or need assistance?
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base leading-relaxed">
                Our customer advocacy and engineering team in Bangalore responds to inquiries within 2 business hours.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-105"
                >
                  <span>Open Support Ticket</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/thank-you"
                  search={{ source: "contact" }}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
                >
                  <span>Check Confirmation Status</span>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-muted/30 p-6">
              <div className="font-mono text-xs text-muted-foreground">Average Response SLA</div>
              <div className="mt-2 font-display text-3xl font-bold text-foreground">&lt; 2 Hours</div>
              <p className="mt-2 text-xs text-muted-foreground">
                Monday to Saturday, 9:00 AM – 8:00 PM IST.
              </p>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
