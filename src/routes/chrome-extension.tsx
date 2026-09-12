import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { useCurrency } from "@/context/CurrencyContext";
import { breadcrumbSchema, createSeoHead, faqSchema, softwareAppSchema } from "@/lib/seo";
import { MagneticButton } from "@/components/MagneticButton";
import {
  ShieldCheck,
  Zap,
  Lock,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Layers,
  Copy,
  Check,
  Percent,
  ChevronDown,
  ShoppingBag,
  ExternalLink,
  Laptop,
  CheckCircle,
} from "lucide-react";

const extensionFaqs = [
  {
    question: "What is the official GoCoupon Chrome Extension?",
    answer:
      "The GoCoupon Chrome extension is the official, 100% free browser tool created by GoCoupon (https://gocoupon.io/). It automatically tests verified discount coupon codes, auto-clips Amazon vouchers, compares live store prices, and tracks 30-day price history across 200+ online stores worldwide.",
  },
  {
    question: "How does GoCoupon find and auto-apply working coupons so quickly?",
    answer:
      "GoCoupon's smart browser scanner tests active promo codes in parallel in under 850 milliseconds directly in your browser checkout. It immediately selects and applies the code that delivers the highest discount.",
  },
  {
    question: "Which online stores are supported?",
    answer:
      "GoCoupon supports 200+ top retailers globally and regionally, including Amazon (US & Global), Walmart, Target, eBay, Flipkart, Myntra, Ajio, Meesho, Croma, Nykaa, and many more.",
  },
  {
    question: "How does the Amazon voucher auto-clipper work?",
    answer:
      "Amazon frequently displays coupon checkboxes beneath product prices that many shoppers miss. GoCoupon automatically detects and clips these vouchers on product pages, ensuring the discount is applied before you proceed to checkout.",
  },
  {
    question: "Is the GoCoupon Chrome Extension safe and private?",
    answer:
      "Yes. GoCoupon is built with strict privacy-first sandboxed browser security standards. It operates locally in your browser environment, requires zero account or sign-up, never sells or logs your browsing history, and cannot view sensitive financial data like passwords, CVVs, or credit card numbers.",
  },
  {
    question: "How do I install or uninstall the extension?",
    answer:
      "To install, click 'Add to Chrome' from our Chrome Web Store page and pin GoCoupon to your browser bar. If you ever wish to uninstall, right-click the GoCoupon icon in your browser toolbar and click 'Remove from Chrome' in 1 click.",
  },
];

const supportedStoresList = [
  { name: "Amazon (Global & US)", logo: "/Brand logos/Amazon_logo.svg.webp", discount: "Voucher Auto-Clip", deals: "Lightning Deals & Prime" },
  { name: "Flipkart", logo: "/Brand logos/flipkart.webp", discount: "Up to 50% Off Codes", deals: "Bank Offers + Coupons" },
  { name: "Myntra", logo: "/Brand logos/myntra.webp", discount: "Flat Promo Codes", deals: "Fashion & Beauty" },
  { name: "Ajio", logo: "/Brand logos/Ajio.webp", discount: "Up to 70% coupons", deals: "Trends & Apparel" },
  { name: "Meesho", logo: "/Brand logos/Meesho_logo.webp", discount: "Instant Cart Savings", deals: "Daily Essentials" },
  { name: "Croma", logo: "/Brand logos/croma.svg", discount: "Electronics & Tech Deals", deals: "Partner Offers + Codes" },
];

export const Route = createFileRoute("/chrome-extension")({
  component: ChromeExtensionPage,
  head: () =>
    createSeoHead({
      title: "GoCoupon Chrome Extension: Automatically Find Working Coupons",
      description:
        "Download the official GoCoupon Chrome Extension. Automatically tests working coupons, clips Amazon vouchers, and compares prices across 200+ stores worldwide.",
      path: "/chrome-extension",
      keywords:
        "GoCoupon Chrome Extension, gocoupon extension, auto apply coupons, amazon coupon auto clip, price tracker extension, free shopping extension, promo codes worldwide",
    }),
});

export function ChromeExtensionPage() {
  const { isIndia } = useCurrency();
  const [activeTab, setActiveTab] = useState<"ready" | "applying" | "result">("applying");
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
    { name: "GoCoupon Chrome Extension", path: "/chrome-extension" },
  ]);
  const faq = faqSchema(extensionFaqs);
  const app = softwareAppSchema();

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(app) }}
      />

      {/* Hero Section */}
      <section className="relative border-b border-border px-6 pb-20 pt-20 sm:pt-28 overflow-hidden text-center bg-background">
        <div className="mx-auto max-w-5xl">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl text-balance">
            GoCoupon Chrome Extension
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground sm:text-xl leading-relaxed text-balance">
            Automatically test working coupon codes, auto-clip Amazon vouchers, and compare live store prices in 1 click.
            100% free forever — built for smart online shoppers worldwide.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <MagneticButton
              as="a"
              href="https://chromewebstore.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-md transition-all hover:scale-105"
            >
              <img src="/icons/icon.svg" alt="GoCoupon" className="h-5 w-5 object-contain" width={20} height={20} />
              <span>Add to Chrome — It&apos;s Free</span>
              <ArrowRight className="h-4 w-4" />
            </MagneticButton>
            <Link
              to="/about"
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              About GoCoupon Official Platform
            </Link>
          </div>

          {/* Compatibility Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 font-mono text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-500" /> Compatible with Chrome, Brave, Edge &amp; Opera
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-emerald-500" /> Zero Browsing History Tracking
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-primary" /> 850ms Parallel Testing
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Feature Demo */}
      <section className="border-b border-border bg-card/40 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              See How the GoCoupon Extension Works at Checkout
            </h2>
            <p className="mt-3 text-muted-foreground text-base">
              The extension stays completely dormant while you browse, and automatically awakens only when it detects a promo code box on supported merchant checkouts.
            </p>
          </div>

          {/* Interactive Extension Tab Selector */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-2xl border border-border bg-background p-1.5 shadow-sm">
              <button
                type="button"
                onClick={() => setActiveTab("ready")}
                className={`rounded-xl px-5 py-2 text-xs sm:text-sm font-medium transition-all ${
                  activeTab === "ready"
                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                1. Cart Detected
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("applying")}
                className={`rounded-xl px-5 py-2 text-xs sm:text-sm font-medium transition-all ${
                  activeTab === "applying"
                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                2. 850ms Testing
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("result")}
                className={`rounded-xl px-5 py-2 text-xs sm:text-sm font-medium transition-all ${
                  activeTab === "result"
                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                3. Best Discount Applied
              </button>
            </div>
          </div>

          {/* Extension Mockup Card */}
          <div className="max-w-2xl mx-auto rounded-3xl border border-primary/30 bg-card p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <img src="/gc-logo-dark.webp" alt="GoCoupon" className="h-6 w-auto hidden dark:block" />
                <img src="/gc-logo.webp" alt="GoCoupon" className="h-6 w-auto dark:hidden" />
                <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                  OFFICIAL EXTENSION
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs text-emerald-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Store Checkout Detected</span>
              </div>
            </div>

            <div className="py-8 text-center space-y-4">
              {activeTab === "ready" && (
                <div>
                  <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-primary/10 text-primary grid place-items-center">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-foreground">12 Active Codes Found</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                    GoCoupon found 12 verified promotional codes for your cart. Click below to test all codes in under a second.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("applying")}
                    className="mt-5 rounded-2xl bg-primary px-8 py-3 font-bold text-sm text-primary-foreground shadow-md transition-all hover:scale-105"
                  >
                    Apply Best Coupon
                  </button>
                </div>
              )}

              {activeTab === "applying" && (
                <div>
                  <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-amber-500/15 text-amber-500 grid place-items-center animate-spin">
                    <RefreshCw className="h-6 w-6" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-foreground">Testing candidate codes in parallel…</h3>
                  <p className="font-mono text-xs text-muted-foreground mt-1">
                    Testing: SAVE20 • PROMO50 • FLASHDEAL • VIPCHECKOUT
                  </p>
                  <div className="w-48 mx-auto mt-4 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-pulse w-3/4 rounded-full" />
                  </div>
                </div>
              )}

              {activeTab === "result" && (
                <div>
                  <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-emerald-500/15 text-emerald-500 grid place-items-center">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-emerald-600 dark:text-emerald-400">
                    {isIndia ? "You Saved ₹650!" : "You Saved $24.50!"}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Applied code <strong className="font-mono text-foreground">SAVE20</strong> for highest available savings.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-1.5 font-mono text-xs text-emerald-600 dark:text-emerald-400">
                    Cart Total: {isIndia ? "₹3,499 → ₹2,849" : "$120.00 → $95.50"}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>GoCoupon v2.4.1 (Manifest V3)</span>
              <a href="https://gocoupon.io/" className="text-primary hover:underline">
                https://gocoupon.io/
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Stores Grid */}
      <section className="border-b border-border px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              Supported Across 200+ Stores Worldwide
            </h2>
            <p className="mt-3 text-muted-foreground text-base">
              The GoCoupon extension automatically triggers at checkout on major global and regional e-commerce merchants.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {supportedStoresList.map((store) => (
              <div
                key={store.name}
                className="rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md flex items-center gap-4"
              >
                <div className="h-14 w-14 shrink-0 rounded-2xl bg-white p-2 border border-border/80 flex items-center justify-center">
                  <img src={store.logo} alt={store.name} className="max-h-full max-w-full object-contain" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-foreground">{store.name}</h3>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{store.discount}</p>
                  <p className="text-[11px] text-muted-foreground">{store.deals}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/stores"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <span>Explore all 200+ supported stores in the directory</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3-Step Setup Guide */}
      <section className="border-b border-border bg-muted/20 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              Get Started in 3 Easy Steps
            </h2>
            <p className="mt-3 text-muted-foreground text-base">
              No account creation, sign-up forms, or payment information required.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="font-mono text-2xl font-bold text-primary mb-3">01</div>
              <h3 className="font-display font-bold text-lg text-foreground">Install Extension</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Click “Add to Chrome” from the official Chrome Web Store listing. It installs in less than 5 seconds.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="font-mono text-2xl font-bold text-primary mb-3">02</div>
              <h3 className="font-display font-bold text-lg text-foreground">Pin to Toolbar</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Click the puzzle icon in Chrome and click the pin icon next to GoCoupon so it stays readily accessible.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="font-mono text-2xl font-bold text-primary mb-3">03</div>
              <h3 className="font-display font-bold text-lg text-foreground">Shop as Usual</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Shop on Amazon, Walmart, Target, Flipkart, or Myntra. GoCoupon pops up at checkout to auto-apply the highest savings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-b border-border px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Everything you need to know about the official GoCoupon browser extension.
            </p>
          </div>

          <div className="divide-y divide-border">
            {extensionFaqs.map((faq, index) => (
              <div key={faq.question} className="py-5">
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="flex w-full items-center justify-between text-left font-display font-bold text-base text-foreground hover:text-primary transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                      openFaq === index ? "rotate-180 text-primary" : "text-muted-foreground"
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-gradient-to-b from-card to-background p-10 text-center shadow-lg sm:p-16">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Never pay full price online again.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            Add the free GoCoupon Chrome extension to your browser and let automation find your savings.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <MagneticButton
              as="a"
              href="https://chromewebstore.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-md transition-all hover:scale-105"
            >
              <span>Add to Chrome — 100% Free</span>
              <ArrowRight className="h-4 w-4" />
            </MagneticButton>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
