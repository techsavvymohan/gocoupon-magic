import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import {
  Flame,
  Tag,
  TrendingDown,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Zap,
  Percent,
  Search,
  Store,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/deals")({
  component: DealsHubPage,
  head: () =>
    createSeoHead({
      title: "Today's Best Online Deals, Discounts & Price Drops in India – goCoupon",
      description:
        "Explore hand-verified online shopping deals, 30-75% discounts, and all-time low price drops across Amazon, Flipkart, Myntra, and Croma with goCoupon.",
      path: "/deals",
      keywords:
        "deals, discounts, today's deals, online shopping discounts, best deals in india, amazon deals, flipkart deals, electronics discounts, price drop deals, coupon codes deals, daily deals, flash discounts",
    }),
});

const DEAL_CATEGORIES = [
  { id: "all", label: "All Deals", icon: Flame },
  { id: "electronics", label: "Electronics & Tech", icon: Zap },
  { id: "audio", label: "Headphones & Audio", icon: Percent },
  { id: "laptops", label: "Laptops & Computing", icon: Tag },
  { id: "fashion", label: "Fashion & Lifestyle", icon: Sparkles },
];

const CURATED_DEALS = [
  {
    id: "deal_sony_xm5",
    title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    store: "Amazon India",
    category: "audio",
    dealPrice: "₹24,990",
    originalPrice: "₹34,990",
    discount: "29% OFF",
    couponCode: "AMZAUDIO15",
    badge: "Lowest in 90 Days",
    verifiedTime: "Verified 2 hrs ago",
    link: "https://deals.gocoupon.io",
  },
  {
    id: "deal_macbook_m3",
    title: "Apple MacBook Air M3 Chip (13.6-inch, 8GB Unified Memory, 256GB SSD)",
    store: "Flipkart",
    category: "laptops",
    dealPrice: "₹94,990",
    originalPrice: "₹1,14,900",
    discount: "17% OFF",
    couponCode: "FKTECH1500",
    badge: "Bank Discount Stackable",
    verifiedTime: "Verified 1 hr ago",
    link: "https://deals.gocoupon.io",
  },
  {
    id: "deal_s24_ultra",
    title: "Samsung Galaxy S24 Ultra 5G (Titanium Gray, 256GB)",
    store: "Amazon India",
    category: "electronics",
    dealPrice: "₹1,19,999",
    originalPrice: "₹1,34,999",
    discount: "₹15,000 OFF",
    couponCode: "PRIMEBONUS500",
    badge: "Includes ₹500 Coupon",
    verifiedTime: "Verified 30 mins ago",
    link: "https://deals.gocoupon.io",
  },
  {
    id: "deal_boat_nirvana",
    title: "boAt Nirvana Ion ANC True Wireless Earbuds (120H Playtime)",
    store: "boAt Lifestyle",
    category: "audio",
    dealPrice: "₹1,999",
    originalPrice: "₹7,990",
    discount: "75% OFF",
    couponCode: "BOATMAGIC15",
    badge: "Extra 15% at Checkout",
    verifiedTime: "Verified 4 hrs ago",
    link: "https://deals.gocoupon.io",
  },
  {
    id: "deal_nike_jordan",
    title: "Nike Air Jordan 1 Low Men's Sneakers (Triple White)",
    store: "Myntra",
    category: "fashion",
    dealPrice: "₹6,895",
    originalPrice: "₹8,295",
    discount: "17% OFF",
    couponCode: "MYNTRA500",
    badge: "Flat ₹500 Coupon",
    verifiedTime: "Verified 3 hrs ago",
    link: "https://deals.gocoupon.io",
  },
  {
    id: "deal_croma_tv",
    title: "LG 55-inch 4K Ultra HD Smart OLED TV (4K Cinema HDR)",
    store: "Croma",
    category: "electronics",
    dealPrice: "₹89,990",
    originalPrice: "₹1,39,990",
    discount: "36% OFF",
    couponCode: "CROMAOFF3000",
    badge: "₹3,000 Instant Card Off",
    verifiedTime: "Verified 1 hr ago",
    link: "https://deals.gocoupon.io",
  },
];

function DealsHubPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const filteredDeals = CURATED_DEALS.filter((deal) => {
    const matchesCategory =
      selectedCategory === "all" || deal.category === selectedCategory;
    const matchesSearch =
      deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.store.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.couponCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Deals & Discounts", path: "/deals" },
  ]);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: CURATED_DEALS.map((deal, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: deal.title,
      description: `${deal.discount} at ${deal.store} with coupon ${deal.couponCode}`,
      url: "https://deals.gocoupon.io",
    })),
  };

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      {/* Hero Header */}
      <section className="relative border-b border-border bg-gradient-to-b from-background via-background/95 to-muted/20 px-4 sm:px-6 pb-16 pt-16 sm:pt-24">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 font-mono text-xs uppercase tracking-[0.2em] text-amber-500">
            <Flame className="h-3.5 w-3.5 animate-pulse" />
            TODAY'S VERIFIED DEALS &amp; DISCOUNTS
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground text-balance">
            Today's Verified Deals, Price Drops &amp; Shopping Discounts in India
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-muted-foreground text-balance">
            Every deal is benchmarked against 90-day price history graphs and verified with working coupon codes so you never fall for fake sale markups.
          </p>

          {/* Search & External Platform Launch */}
          <div className="mx-auto mt-8 max-w-2xl flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search deals, smartphones, laptops, or coupons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <a
              href="https://deals.gocoupon.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:scale-[1.02]"
            >
              <span>Launch Live Deals Engine</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {DEAL_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-foreground text-background shadow"
                      : "border border-border bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Deals Grid */}
      <section className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Featured Verified Deals &amp; Discounts
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Showing {filteredDeals.length} active verified bargains with working coupon codes
              </p>
            </div>
            <Link
              to="/compare"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-primary hover:underline font-semibold"
            >
              Compare Live Prices Across Stores <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDeals.map((deal) => (
              <div
                key={deal.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
                      <Store className="h-3 w-3" />
                      {deal.store}
                    </span>
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-500">
                      {deal.badge}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                    {deal.title}
                  </h3>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-foreground font-mono">
                      {deal.dealPrice}
                    </span>
                    <span className="text-sm line-through text-muted-foreground font-mono">
                      {deal.originalPrice}
                    </span>
                    <span className="ml-auto rounded bg-red-500/10 px-2 py-0.5 text-xs font-bold text-red-500">
                      {deal.discount}
                    </span>
                  </div>

                  {/* Coupon Strip */}
                  <div className="mt-4 rounded-xl border border-border/80 bg-muted/30 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-primary" />
                        <span className="font-mono text-xs font-bold tracking-wide text-foreground">
                          {deal.couponCode}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyCode(deal.couponCode)}
                        className="inline-flex items-center gap-1 rounded-md bg-card px-2 py-1 text-[11px] font-medium border border-border hover:bg-muted transition-colors"
                      >
                        {copiedCode === deal.couponCode ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {deal.verifiedTime}
                  </span>
                  <a
                    href={deal.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>View Deal</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Shopping Intelligence Features */}
      <section className="border-t border-border bg-muted/20 px-4 sm:px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Why Shoppers Save More with goCoupon Deals
            </h2>
            <p className="mt-2 text-muted-foreground text-sm max-w-2xl mx-auto">
              We combine automated price tracking, real-time code verification, and cross-store pricing so you never pay full retail price.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                <TrendingDown className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">90-Day Fake Sale Detection</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Before highlighting a deal, our algorithm inspects 90 days of historical pricing across Amazon and Flipkart to confirm the discount is genuine and not an artificial pre-sale price hike.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">Auto-Tested Working Coupons</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Every promo code listed is verified in real-time carts. Dead or expired coupons are cleaned up automatically so you never waste time copying non-working voucher codes.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">Live Cross-Store Benchmarking</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Found a discount on Flipkart? goCoupon simultaneously checks Amazon, Croma, and Tata CLiQ to confirm if a competitor sells the exact same product cheaper.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="border-t border-border px-4 sm:px-6 py-12 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Never Miss an All-Time Low Price Drop
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Add goCoupon to your Chrome browser to automatically test coupons and compare live prices at checkout.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/extension"
              className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition-transform hover:scale-105"
            >
              Add to Chrome — It's Free
            </Link>
            <Link
              to="/compare"
              className="rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Compare Live Prices
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
