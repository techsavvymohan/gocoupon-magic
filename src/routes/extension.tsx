import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead, faqSchema } from "@/lib/seo";
import { MagneticButton } from "@/components/MagneticButton";
import {
  ShieldCheck,
  Zap,
  Lock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Layers,
  Copy,
  Check,
  Percent,
  Sliders,
  DollarSign,
  Flame,
  ChevronDown,
  ShoppingBag,
  HeartHandshake,
} from "lucide-react";

const faqs = [
  {
    question: "How does GoCoupon find the best discounts so fast?",
    answer:
      "Our smart scanner keeps track of working discounts tested by shoppers every hour. When you reach checkout, it automatically tests the highest-saving verified codes first, giving you the biggest discount in under 2 seconds.",
  },
  {
    question: "How does GoCoupon click Amazon green coupon boxes?",
    answer:
      "Amazon often puts a little green discount checkbox below item prices. Many shoppers forget to click it! GoCoupon automatically finds and clicks these green voucher boxes so your extra discount is applied before checkout.",
  },
  {
    question: "Is GoCoupon really 100% free? Are there any hidden fees?",
    answer:
      "GoCoupon is 100% free forever. No monthly fees, no premium plans, and no credit card required. We earn a small thank-you bonus from retail stores when we help you find a great deal, at zero cost to you.",
  },
  {
    question: "Is my credit card, bank info, and password safe?",
    answer:
      "100% safe. GoCoupon can never see your credit cards, passwords, bank logins, or personal searches. We use bank-grade encryption and only interact with the promo code box on shopping pages.",
  },
  {
    question: "Will GoCoupon slow down my browser or computer?",
    answer:
      "No. GoCoupon is ultra-lightweight (smaller than a single phone photo). It stays completely asleep while you browse normal websites and only activates for a few seconds at checkout.",
  },
];

export const Route = createFileRoute("/extension")({
  component: ExtensionPage,
  head: () =>
    createSeoHead({
      title: "Download GoCoupon Chrome Extension – Free Automatic Coupon & Deal Finder",
      description:
        "Install the free GoCoupon Chrome extension. Automatically tests working coupon codes, auto-clips Amazon green vouchers, and saves you money in 1 click.",
      path: "/extension",
      keywords:
        "download gocoupon extension, free chrome coupon extension, amazon coupon auto clip, auto apply promo codes, best shopping extension chrome",
    }),
});

function ExtensionPage() {
  const [activeTab, setActiveTab] = useState<"ready" | "applying" | "result" | "cashback">("ready");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

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

      {/* Hero Header */}
      <section className="relative border-b border-border px-6 pb-20 pt-20 sm:pt-28 overflow-hidden text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 opacity-25 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle at center, var(--accent-glow-strong), transparent 70%)",
          }}
        />

        <div className="mx-auto max-w-5xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-primary shadow-xs">
            <Sparkles className="h-4 w-4" />
            <span>100% Free · Safe &amp; Private · 1-Click Savings</span>
          </div>

          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Never Pay Full Price Online Again.{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              Auto-Apply Coupons in 1 Click
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
            GoCoupon automatically tests all active promo codes and clicks Amazon&apos;s hidden green coupon boxes
            for you. Get the biggest discount every time you shop online — completely free.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <MagneticButton
              as="a"
              href="https://chromewebstore.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-md transition-all hover:scale-105"
            >
              <span>Add to Chrome — It&apos;s Free</span>
              <ArrowRight className="h-4 w-4" />
            </MagneticButton>
            <Link
              to="/how-it-works"
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              See How It Works
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-14 grid grid-cols-2 gap-4 border-t border-border/80 pt-8 sm:grid-cols-4">
            {[
              { label: "Price", value: "100% Free", sub: "No subscriptions or fees" },
              { label: "Speed", value: "Under 2 Secs", sub: "Fast 1-click auto-testing" },
              { label: "Amazon Vouchers", value: "Auto-Clipped", sub: "Never miss green coupons" },
              { label: "Privacy", value: "Bank-Grade", sub: "Never sees your cards or passwords" },
            ].map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-border bg-card/60 p-4 text-center">
                <div className="font-display text-xl font-bold text-foreground sm:text-2xl">
                  {metric.value}
                </div>
                <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-primary font-bold">
                  {metric.label}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">{metric.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Extension Interface Simulator */}
      <section className="border-b border-border bg-muted/20 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-primary">
              <Sliders className="h-3.5 w-3.5" />
              Interactive Preview
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              See How GoCoupon Looks &amp; Works
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Clean, simple, and automatic. Click the tabs below to preview each step of the savings experience.
            </p>

            {/* Tab Switches */}
            <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-border bg-card p-1.5 shadow-sm">
              {[
                { id: "ready", label: "1. Coupons Found" },
                { id: "applying", label: "2. Fast Auto-Testing" },
                { id: "result", label: "3. Big Savings Unlocked" },
                { id: "cashback", label: "4. Extra Cashback" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-sm scale-105"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Simulated Browser & Popup Frame */}
          <div className="mt-12 mx-auto max-w-lg">
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-2xl backdrop-blur-xl">
              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 font-mono text-[10px] text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>https://amazon.com/checkout</span>
                </div>
                <div className="font-mono text-[10px] text-primary font-bold">FREE</div>
              </div>

              {/* Popup Body */}
              <div className="p-6">
                {activeTab === "ready" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary font-display text-xs font-bold text-primary-foreground">
                          gC
                        </div>
                        <div>
                          <div className="text-sm font-bold text-foreground">GoCoupon</div>
                          <div className="font-mono text-[10px] text-emerald-500 font-semibold">
                            ✓ 4 Working Coupons Found
                          </div>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-500">
                        SAVINGS READY
                      </span>
                    </div>

                    {/* Green Clip Coupon Banner */}
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-500 text-sm">🎟️</span>
                        <div className="text-xs">
                          <strong className="text-foreground">Amazon Green Coupon Auto-Clipped</strong>
                          <div className="text-muted-foreground text-[11px]">Save $15.00 instantly on this item</div>
                        </div>
                      </div>
                      <span className="rounded bg-emerald-500 text-primary-foreground font-mono text-[10px] font-bold px-2 py-1">
                        CLIPPED ✓
                      </span>
                    </div>

                    {/* Coupons Preview List */}
                    <div className="space-y-2">
                      {[
                        { code: "PRIME25", desc: "25% Off Electronics", status: "Verified Working" },
                        { code: "SAVE50AMZ", desc: "Flat $50 off above $199", status: "Verified Working" },
                        { code: "DEALS10", desc: "10% off Fashion & Gear", status: "Verified Working" },
                      ].map((item) => (
                        <div
                          key={item.code}
                          className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-foreground">{item.code}</span>
                              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 font-mono text-[9px] text-emerald-500">
                                {item.status}
                              </span>
                            </div>
                            <div className="text-[11px] text-muted-foreground">{item.desc}</div>
                          </div>
                          <button
                            onClick={() => handleCopy(item.code)}
                            className="flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-[10px] font-mono text-foreground hover:bg-accent cursor-pointer"
                          >
                            {copiedCode === item.code ? (
                              <span className="text-emerald-500 font-bold flex items-center gap-1">
                                <Check size={10} /> Copied!
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Copy size={10} /> Copy
                              </span>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setActiveTab("applying")}
                      className="w-full rounded-xl bg-primary py-3 font-display text-sm font-bold text-primary-foreground shadow-md transition-all hover:opacity-90 cursor-pointer"
                    >
                      Apply Best Savings (1-Click)
                    </button>
                  </div>
                )}

                {activeTab === "applying" && (
                  <div className="space-y-5 py-4 text-center">
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary animate-pulse">
                      <RefreshCw className="h-7 w-7 animate-spin" />
                    </div>

                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground">
                        Testing Codes Automatically...
                      </h3>
                      <p className="mt-1 font-mono text-xs text-emerald-500 font-semibold">
                        Finding your maximum discount
                      </p>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <div className="flex justify-between text-xs font-mono text-muted-foreground">
                        <span>Testing code: SAVE50AMZ</span>
                        <span className="text-primary font-bold">2 of 4 Codes Tested</span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-primary transition-all duration-500" style={{ width: "60%" }} />
                      </div>
                    </div>

                    <div className="rounded-xl border-2 border-primary/50 bg-primary/5 p-4 text-left font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                          Testing code: SAVE50AMZ
                        </span>
                        <span className="text-emerald-500 font-bold">-$50.00 Drop!</span>
                      </div>
                      <div className="mt-2 text-[11px] text-muted-foreground">
                        Subtotal: $149.99 ➔ New Price: $99.99
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab("result")}
                      className="rounded-full border border-border px-4 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      See Final Savings →
                    </button>
                  </div>
                )}

                {activeTab === "result" && (
                  <div className="space-y-4 text-center">
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                      <Sparkles className="h-6 w-6" />
                    </div>

                    <div>
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-500">
                        🎉 Big Savings Unlocked!
                      </span>
                      <h3 className="font-display text-4xl font-extrabold text-foreground mt-1">
                        $50.00 SAVED
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Applied winning code <strong className="text-foreground">SAVE50AMZ</strong> + Green Coupon
                      </p>
                    </div>

                    <div className="rounded-xl border border-border bg-muted/40 p-3.5 text-left font-mono text-xs space-y-1.5">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Original Cart Total:</span>
                        <span className="line-through">$149.99</span>
                      </div>
                      <div className="flex justify-between text-emerald-500 font-bold">
                        <span>GoCoupon Discount Applied:</span>
                        <span>– $50.00</span>
                      </div>
                      <div className="border-t border-border pt-1 flex justify-between font-bold text-foreground text-sm">
                        <span>You Pay Only:</span>
                        <span>$99.99</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab("cashback")}
                      className="w-full rounded-xl bg-emerald-500 py-3 font-display text-sm font-bold text-primary-foreground shadow-md transition-all hover:opacity-90 cursor-pointer"
                    >
                      Check Extra Cash Back Bonus
                    </button>
                  </div>
                )}

                {activeTab === "cashback" && (
                  <div className="space-y-4 text-center">
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                      <Percent className="h-6 w-6" />
                    </div>

                    <div>
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
                        Extra Bonus
                      </span>
                      <h3 className="font-display text-xl font-bold text-foreground mt-1">
                        ✨ Cash Back Bonus Ready!
                      </h3>
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                        Earn cash back on eligible purchases. Your $50.00 coupon discount stays 100% untouched.
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab("ready")}
                      className="w-full rounded-xl border border-border bg-card py-2.5 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer"
                    >
                      Reset Preview
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Plain-English Benefits Grid */}
      <section className="border-b border-border px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              Why Shoppers Love GoCoupon
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything You Need to Save Money Online
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Benefit 1 */}
            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm hover:border-primary/40 transition-colors">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">
                1-Click Auto-Apply
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Sit back and relax. We test every active promo code in under 2 seconds and apply the one that gives you the biggest discount.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm hover:border-primary/40 transition-colors">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                <Flame className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">
                Amazon Green Coupon Clicker
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Amazon has hidden green discount boxes on product pages. GoCoupon spots and clicks them automatically so you never miss out.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm hover:border-primary/40 transition-colors">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">
                100% Safe &amp; Private
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                We never see your credit cards, passwords, or personal messages. We strictly look for coupon code fields on checkout.
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm hover:border-primary/40 transition-colors">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">
                Cart Safety Protection
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                We test codes gently and safely. Your cart items and existing store discounts are always 100% protected.
              </p>
            </div>

            {/* Benefit 5 */}
            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm hover:border-primary/40 transition-colors">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">
                100% Fair Savings Promise
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                We always give you the biggest discount code first, with zero exceptions. Your savings always come first.
              </p>
            </div>

            {/* Benefit 6 */}
            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm hover:border-primary/40 transition-colors">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">
                Ultra Lightweight &amp; Fast
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Smaller than a single photo on your phone. GoCoupon stays asleep while you browse and never slows down your computer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Clear Plain-English FAQs */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              Got Questions?
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Extension FAQs
            </h2>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faqItem, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs transition-all"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <span className="font-display text-base font-bold text-foreground sm:text-lg">
                      {faqItem.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-sm leading-relaxed text-muted-foreground border-t border-border/50">
                      {faqItem.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 rounded-3xl border border-border bg-gradient-to-b from-card to-background p-10 text-center shadow-lg sm:p-14">
            <h3 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Ready to start saving?
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              Add GoCoupon to Google Chrome in 10 seconds. 100% free forever.
            </p>
            <div className="mt-8">
              <MagneticButton
                as="a"
                href="https://chromewebstore.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-md transition-all hover:scale-105"
              >
                <span>Add GoCoupon to Chrome — Free</span>
                <ArrowRight className="h-4 w-4" />
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
