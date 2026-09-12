import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import { useDeals } from "@/hooks/use-deals";
import type { DealSortField } from "@/lib/api/deals-api";
import { wrapAffiliateTracking } from "@/lib/services/store-registry";
import { DealGridSkeleton, FetchError } from "@/components/ui/DataSkeleton";
import {
  Flame,
  Tag,
  ExternalLink,
  ShoppingBag,
  Copy,
  Check,
  ArrowRight,
  Zap,
  Percent,
  Search,
  Store,
  Clock,
  ArrowUpDown,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/offers")({
  component: OffersHubPage,
  head: () =>
    createSeoHead({
      title: "Today's Best Online Offers, Deals & Price Drops in India – GoCoupon",
      description:
        "Explore hand-verified online shopping offers, exclusive brand promotions, 30-75% discounts, and all-time low price drops across Amazon, Flipkart, Myntra, Tata CLiQ, and Croma with GoCoupon.",
      path: "/offers",
      keywords:
        "offers, deals, discounts, today's offers, exclusive shopping offers in india, amazon offers, flipkart offers, myntra discount coupons, electronics offers, coupon codes, daily offers",
    }),
});

const OFFER_CATEGORIES = [
  { id: "all", label: "All Offers", icon: Flame },
  { id: "electronics", label: "Electronics & Tech", icon: Zap },
  { id: "audio", label: "Headphones & Audio", icon: Percent },
  { id: "laptops", label: "Laptops & Computing", icon: Tag },
  { id: "fashion", label: "Fashion & Lifestyle", icon: ShoppingBag },
];

function OffersHubPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<DealSortField>("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Live API fetch — deals and offers come from /api/deals
  const { deals: allDeals, isLoading, isError, refetch } = useDeals({
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    sortBy,
    order: "desc",
    limit: 50,
  });

  const filteredOffers = useMemo(() => {
    return allDeals.filter((deal) => {
      const matchesCategory =
        selectedCategory === "all" || deal.category.toLowerCase() === selectedCategory;
      const matchesSearch =
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allDeals, selectedCategory, searchQuery]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Exclusive Offers", path: "/offers" },
  ]);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: allDeals.slice(0, 10).map((deal, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: deal.title,
      description: `${deal.discount} at ${deal.storeName} with coupon ${deal.code}`,
      url: wrapAffiliateTracking(deal.link, "gocoupon_schema_offers"),
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
      <section className="relative border-b border-border bg-gradient-to-b from-background via-background/95 to-muted/20 px-4 sm:px-6 pb-14 sm:pb-20 pt-14 sm:pt-22">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1 font-mono text-xs uppercase tracking-[0.2em] text-rose-500">
            <Flame className="h-3.5 w-3.5 animate-pulse" />
            TODAY'S VERIFIED OFFERS &amp; PROMOTIONS
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground text-balance">
            Today's Exclusive Offers, Discounts &amp; Verified Promo Codes
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-muted-foreground text-balance">
            Every offer is tested with live coupon auto-apply, benchmarked against real 30-day price history graphs, and bundled with top cashback savings.
          </p>

          {/* Search Input */}
          <div className="mx-auto mt-8 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search offers, smartphones, fashion, or promo codes…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary touch-manipulation shadow-xs"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {OFFER_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-foreground text-background shadow-xs font-bold"
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

      {/* Featured Offers Grid */}
      <section className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Featured Verified Offers &amp; Discounts
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Showing {filteredOffers.length} active verified bargains with working coupon codes
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="offer-sort-select" className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                  <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                  <span>Sort:</span>
                </label>
                <select
                  id="offer-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as DealSortField)}
                  className="rounded-xl border border-border bg-card/90 px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="trending">🔥 Trending Offers</option>
                  <option value="discount">🏷️ Highest Discount</option>
                  <option value="verified">🛡️ Verified First</option>
                  <option value="expiry">⏰ Expiring Soon</option>
                  <option value="store">🏬 Store Name (A-Z)</option>
                </select>
              </div>
              <Link
                to="/compare"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-primary hover:underline font-semibold"
              >
                Compare Prices Across Stores <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {isLoading ? (
            <DealGridSkeleton count={6} />
          ) : isError ? (
            <FetchError
              message="Could not load offers from the server. Please try again."
              onRetry={refetch}
            />
          ) : filteredOffers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-12 text-center px-4">
              <p className="text-sm font-semibold text-foreground">No offers found matching &ldquo;{searchQuery}&rdquo;.</p>
              <button
                onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredOffers.map((deal) => {
                const affiliateUrl = wrapAffiliateTracking(deal.link, "gocoupon_offers_hub");

                return (
                  <div
                    key={deal.id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-xl"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
                          <Store className="h-3 w-3" />
                          {deal.storeName}
                        </span>
                        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          {deal.badge}
                        </span>
                      </div>

                      <h3 className="font-display text-base font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                        {deal.title}
                      </h3>

                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xl font-extrabold text-foreground font-mono">
                          {deal.discount}
                        </span>
                        {deal.minOrder && (
                          <span className="text-xs text-muted-foreground">min. {deal.minOrder}</span>
                        )}
                      </div>

                      {/* Coupon Strip */}
                      <div className="mt-4 rounded-xl border border-border/80 bg-muted/30 p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Tag className="h-3.5 w-3.5 text-primary" />
                            <span className="font-mono text-xs font-bold tracking-wide text-foreground">
                              {deal.code}
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopyCode(deal.code)}
                            className="inline-flex items-center gap-1 rounded-md bg-card px-2 py-1 text-[11px] font-medium border border-border hover:bg-muted transition-colors cursor-pointer"
                          >
                            {copiedCode === deal.code ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-500" />
                                <span className="text-emerald-500 font-semibold">Copied</span>
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
                        {deal.expiresIn}
                      </span>
                      <a
                        href={affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        <span>View Offer</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Trust Callout */}
      <section className="border-t border-border bg-card/40 px-4 sm:px-6 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 font-mono text-xs font-bold text-primary uppercase tracking-wider mb-3">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            100% Genuine &amp; Validated
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            How goCoupon Verifies Every Offer
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Our automated scanner validates coupons directly against merchant checkout endpoints. When you click an offer, the code is copied and the store is launched with instant cashback tracking.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}

export default OffersHubPage;
