import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead, faqSchema } from "@/lib/seo";
import {
  ShoppingBag,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  MousePointerClick,
  Percent,
  Check,
  ChevronDown,
  Gift,
  HelpCircle,
  Clock,
  RotateCcw,
  Smartphone,
  Laptop,
  Lock,
} from "lucide-react";
import { MagneticButton } from "@/components/MagneticButton";

const faqs = [
  {
    question: "Is GoCoupon really 100% free? How do you make money?",
    answer:
      "Yes! GoCoupon is 100% free to install and use. You will never be asked for a subscription or credit card. When we help you find a great discount, retail stores (like Amazon or Flipkart) sometimes pay us a small referral bonus from their advertising budget. You always pay the lowest price possible, and it costs you nothing.",
  },
  {
    question: "How does the Instant Price Drop (IPD) Engine differ from normal price trackers?",
    answer:
      "Traditional price tracking tools make you passively wait weeks for an email alert that may never trigger. GoCoupon's Instant Price Drop engine works immediately at checkout by simultaneously testing promo codes, clipping vouchers, and applying eligible bank card rebates for an instant price reduction.",
  },
  {
    question: "How does GoCoupon calculate my True Landed Cost?",
    answer:
      "Sticker prices can be deceiving due to hidden delivery charges or unapplied payment deals. GoCoupon calculates True Landed Cost: (Sticker Price) − (Auto-Applied Store Coupon) − (Card Instant Rebate) − (Cashback Reward) + (Shipping). You see the net out-of-pocket amount before paying.",
  },
  {
    question: "Do I have to search, copy, or paste coupon codes myself?",
    answer:
      "No! You never have to hunt for codes again. When you reach the checkout page of any supported store, GoCoupon automatically tests all active discounts in seconds and applies the one that saves you the most money.",
  },
  {
    question: "What is an Amazon green clip coupon and how does GoCoupon click it?",
    answer:
      "Amazon often puts a little green discount checkbox (like 'Save $10 with coupon') right below product prices. Many shoppers miss clicking it! GoCoupon automatically finds and clicks these discount boxes for you so the savings are ready when you check out.",
  },
  {
    question: "Will GoCoupon slow down my browser or computer?",
    answer:
      "Not at all. GoCoupon is designed to be ultra-lightweight (smaller than a single phone photo). It stays completely asleep while you browse normal websites and only wakes up for a few seconds at checkout to find your savings.",
  },
  {
    question: "Is my credit card, password, and shopping information safe?",
    answer:
      "100% safe. GoCoupon can never see your credit card numbers, CVVs, UPI PINs, bank passwords, or personal messages. We strictly look for the coupon code box at checkout. We never track your personal web searches or sell your personal data to anyone.",
  },
  {
    question: "What happens if a coupon code doesn't work on my cart?",
    answer:
      "Some coupons require a minimum order value (like $50 or ₹1,000) or only work on specific items. GoCoupon tests every available code and automatically applies only the codes that are valid for your exact cart items.",
  },
];

export const Route = createFileRoute("/how-it-works")({
  component: HowItWorksPage,
  head: () =>
    createSeoHead({
      title: "How GoCoupon Works – Simple 1-Click Online Savings Guide",
      description:
        "Learn how GoCoupon automatically finds and applies the best discount codes and Amazon green coupons at checkout so you never overpay online.",
      path: "/how-it-works",
      keywords:
        "how coupon extension works, auto apply coupon code, amazon coupon clip, save money online, free discount finder",
    }),
});

// Interactive Simulator Store Data
const STORES = [
  {
    id: "amazon",
    name: "Amazon",
    icon: "🛒",
    item: "Sony Noise-Canceling Headphones",
    price: 149.99,
    currency: "$",
    hasClipCoupon: true,
    clipDiscount: 20.0,
    bestPromo: "SAVE25TECH",
    promoDiscount: 25.0,
    cardName: "Chase / Prime Visa",
    cardDiscount: 15.0,
  },
  {
    id: "flipkart",
    name: "Flipkart",
    icon: "🛍️",
    item: "Smart Fitness Watch & Band",
    price: 3499,
    currency: "₹",
    hasClipCoupon: true,
    clipDiscount: 500,
    bestPromo: "BIGSAVER20",
    promoDiscount: 450,
    cardName: "HDFC / SBI Card",
    cardDiscount: 350,
  },
  {
    id: "myntra",
    name: "Myntra",
    icon: "👗",
    item: "Designer Winter Denim Jacket",
    price: 2499,
    currency: "₹",
    hasClipCoupon: false,
    clipDiscount: 0,
    bestPromo: "MYNTRAFIRST",
    promoDiscount: 600,
    cardName: "ICICI / Axis Bank",
    cardDiscount: 250,
  },
  {
    id: "walmart",
    name: "Walmart / Target",
    icon: "🏬",
    item: "Digital Air Fryer 6-Quart",
    price: 89.99,
    currency: "$",
    hasClipCoupon: true,
    clipDiscount: 15.0,
    bestPromo: "HOMECHEF10",
    promoDiscount: 10.0,
    cardName: "Capital One / Amex",
    cardDiscount: 10.0,
  },
];

function HowItWorksPage() {
  // Simulator State
  const [selectedStore, setSelectedStore] = useState(STORES[0]);
  const [simStep, setSimStep] = useState<"initial" | "scanning" | "done">("initial");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleStartSimulation = () => {
    setSimStep("scanning");
    setTimeout(() => {
      setSimStep("done");
    }, 1800);
  };

  const handleResetSimulation = () => {
    setSimStep("initial");
  };

  const totalSaved =
    simStep === "done"
      ? selectedStore.clipDiscount + selectedStore.promoDiscount + selectedStore.cardDiscount
      : 0;
  const finalPrice =
    simStep === "done" ? selectedStore.price - totalSaved : selectedStore.price;

  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "How It Works", path: "/how-it-works" },
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
      <section className="relative border-b border-border px-6 pb-20 pt-20 sm:pt-28 overflow-hidden text-center bg-background">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            How GoCoupon Saves You Money{" "}
            <span className="text-primary font-extrabold">
              in 1 Click
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
            No more copying broken coupon codes from old websites. GoCoupon automatically finds,
            tests, and applies the biggest working discounts at checkout — 100% free.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <MagneticButton
              as="a"
              href="https://chromewebstore.google.com/detail/gbmfihnboadlmmjbikajlmocjmlpehij"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-md transition-all hover:scale-105"
            >
              <span>Add to Chrome — Free</span>
              <ArrowRight className="h-4 w-4" />
            </MagneticButton>
            <a
              href="#try-it"
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Try Interactive Simulator ↓
            </a>
          </div>
        </div>
      </section>

      {/* 3 Simple Steps for Everyday Shoppers */}
      <section className="border-b border-border px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              Simple 3-Step Process
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Saving Money Has Never Been Easier
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You shop as usual. GoCoupon handles the coupon hunting for you in the background.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm transition-all hover:border-primary/50 hover:shadow-lg">
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 font-display text-lg font-bold text-primary">
                  1
                </span>
                <span className="font-mono text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  10-Second Setup
                </span>
              </div>
              <h3 className="mt-6 font-display text-xl font-bold text-foreground">
                Add GoCoupon to Chrome
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Click &ldquo;Add to Chrome&rdquo; and pin GoCoupon to your browser bar. It is completely free.
                No sign-up, no password, and no credit card required.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm transition-all hover:border-primary/50 hover:shadow-lg">
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 font-display text-lg font-bold text-emerald-500">
                  2
                </span>
                <span className="font-mono text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Normal Shopping
                </span>
              </div>
              <h3 className="mt-6 font-display text-xl font-bold text-foreground">
                Shop Like You Always Do
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Browse stores like Amazon, Flipkart, Walmart, or Nike. GoCoupon automatically verifies price honesty against 30-day baselines and auto-clips hidden store vouchers.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm transition-all hover:border-primary/50 hover:shadow-lg">
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-500/10 font-display text-lg font-bold text-sky-500">
                  3
                </span>
                <span className="font-mono text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Instant Price Drop
                </span>
              </div>
              <h3 className="mt-6 font-display text-xl font-bold text-foreground">
                4-Tier Stack at Checkout
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                At checkout, our Savings Capsule tests all promo codes in 1.8s and stacks your best bank card discount for the true lowest landed cost.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive & Immersive Cart Simulator */}
      <section id="try-it" className="border-b border-border bg-muted/20 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-primary">
              <MousePointerClick className="h-3.5 w-3.5" aria-hidden="true" />
              Live Savings Simulator
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
              See How Much You Can Save Right Now
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
              Pick a store below and click “Test GoCoupon” to watch how our smart scanner lowers your total bill.
            </p>

            {/* Store Picker Pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
              {STORES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedStore(s);
                    setSimStep("initial");
                  }}
                  className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                    selectedStore.id === s.id
                      ? "bg-primary text-primary-foreground shadow-md scale-105"
                      : "border border-border bg-card text-foreground hover:border-primary/40"
                  }`}
                >
                  <span>{s.icon}</span>
                  <span>{s.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Simulation Window */}
          <div className="mt-10 mx-auto max-w-2xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl backdrop-blur-xl">
            {/* Window Bar */}
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 font-mono text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>checkout.{selectedStore.name.toLowerCase().replace(/[^a-z]/g, "")}.com</span>
              </div>
              <span className="font-mono text-xs text-primary font-bold">GoCoupon v2.4</span>
            </div>

            {/* Cart Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Product Info */}
              <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-3.5">
                  <div className="text-3xl">{selectedStore.icon}</div>
                  <div>
                    <h4 className="font-display font-bold text-foreground text-sm sm:text-base">
                      {selectedStore.item}
                    </h4>
                    <p className="text-xs text-muted-foreground">Quantity: 1 · In Stock</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Original Price</div>
                  <div className="font-display font-bold text-foreground text-base sm:text-lg">
                    {selectedStore.currency}
                    {selectedStore.price.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* On-Page Green Coupon Feature */}
              {selectedStore.hasClipCoupon && (
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🎟️</span>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-foreground">
                        Amazon Green Discount Box
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Save an extra {selectedStore.currency}
                        {selectedStore.clipDiscount.toLocaleString()} immediately
                      </div>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold font-mono ${
                      simStep !== "initial"
                        ? "bg-emerald-500 text-white shadow-xs"
                        : "border border-emerald-500 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {simStep !== "initial" ? "✓ AUTO-CLIPPED" : "AVAILABLE"}
                  </span>
                </div>
              )}

              {/* Simulation Status & Results */}
              {simStep === "initial" && (
                <div className="text-center py-4 space-y-4">
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs sm:text-sm text-foreground/90 leading-relaxed">
                    GoCoupon found <strong>working discount codes</strong> for this cart!
                  </div>

                  <button
                    onClick={handleStartSimulation}
                    className="w-full rounded-2xl bg-primary py-4 font-display text-base font-bold text-primary-foreground shadow-lg transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Test GoCoupon on This Cart</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              )}

              {simStep === "scanning" && (
                <div className="text-center py-6 space-y-4">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary animate-spin">
                    <RotateCcw className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-display text-base font-bold text-foreground">
                      Testing 8 Discount Codes in Real-Time...
                    </h4>
                    <p className="mt-1 text-xs font-mono text-emerald-500">
                      Checking: {selectedStore.bestPromo} · Comparing net savings...
                    </p>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary animate-pulse" style={{ width: "80%" }} />
                  </div>
                </div>
              )}

              {simStep === "done" && (
                <div className="space-y-5">
                  {/* Big Savings Announcement */}
                  <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-center space-y-1">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-500">
                      🎉 Highest Savings Applied!
                    </span>
                    <div className="font-display text-3xl sm:text-4xl font-extrabold text-foreground">
                      You Saved {selectedStore.currency}
                      {totalSaved.toLocaleString()}!
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Applied winning coupon <strong>{selectedStore.bestPromo}</strong> + Bank Card Offer
                    </p>
                  </div>

                  {/* Price Summary Breakdown */}
                  <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-2 font-mono text-xs sm:text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>1. Original Subtotal:</span>
                      <span className="line-through">
                        {selectedStore.currency}
                        {selectedStore.price.toLocaleString()}
                      </span>
                    </div>
                    {selectedStore.hasClipCoupon && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                        <span>2. On-Page Voucher:</span>
                        <span>
                          – {selectedStore.currency}
                          {selectedStore.clipDiscount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>3. Auto-Applied Promo Code:</span>
                      <span>
                        – {selectedStore.currency}
                        {selectedStore.promoDiscount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-blue-600 dark:text-blue-400">
                      <span>4. Bank Instant Rebate ({selectedStore.cardName}):</span>
                      <span>
                        – {selectedStore.currency}
                        {selectedStore.cardDiscount.toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground text-base">
                      <span>True Landed Cost:</span>
                      <span className="text-primary tabular-nums">
                        {selectedStore.currency}
                        {finalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Reset Simulation Button */}
                  <button
                    type="button"
                    onClick={handleResetSimulation}
                    className="w-full rounded-xl border border-border bg-card py-3 min-h-[44px] text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Try Another Store
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Reassuring Safety & Privacy Pillars */}
      <section className="border-b border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center max-w-2xl mx-auto">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              Your Peace of Mind
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Safe, Private, and 100% Free
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We built GoCoupon to protect your wallet and your privacy.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-center">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">Zero Keystroke Tracking</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                We never record your passwords, personal messages, or emails. We only check the discount box at checkout.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-center">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">No Bank or Card Access</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Your payment cards, bank logins, and UPI PINs are 100% hidden and invisible to GoCoupon.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-center">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-sky-500/10 text-sky-500">
                <Percent className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">100% Free Forever</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                No subscriptions, no hidden fees, and no locked features. GoCoupon is free for everyone, always.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Clear Plain-English FAQs Accordion */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              Got Questions?
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Everything you need to know in plain, simple English.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((f, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs transition-all"
                >
                  <button
                    onClick={() => toggleFaq(i)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <span className="font-display text-base font-bold text-foreground sm:text-lg">
                      {f.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-sm leading-relaxed text-muted-foreground border-t border-border/50">
                      {f.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom CTA Box */}
          <div className="mt-16 rounded-3xl border border-border bg-gradient-to-b from-card to-background p-10 text-center shadow-lg sm:p-14">
            <h3 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Start saving in the next 10 seconds.
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              Add GoCoupon to Chrome and never pay full price when you shop online.
            </p>
            <div className="mt-8">
              <MagneticButton
                as="a"
                href="https://chromewebstore.google.com/detail/gbmfihnboadlmmjbikajlmocjmlpehij"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-md transition-all hover:scale-105"
              >
                <span>Add GoCoupon to Chrome — It&apos;s Free</span>
                <ArrowRight className="h-4 w-4" />
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
