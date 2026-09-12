import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useRef, useEffect } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import { useDeals } from "@/hooks/use-deals";
import type { DealSortField, Deal } from "@/lib/api/deals-api";
import { wrapAffiliateTracking } from "@/lib/services/store-registry";
import { DealGridSkeleton } from "@/components/ui/DataSkeleton";
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
  LayoutGrid,
  List,
  ChevronDown,
  X,
  Users,
  BadgePercent,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/offers")({
  component: OffersHubPage,
  head: () =>
    createSeoHead({
      title: "Today's Best Online Offers, Deals & Price Drops – GoCoupon",
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
] as const;

const SORT_OPTIONS: { id: DealSortField; label: string; icon: typeof Flame; color: string }[] = [
  { id: "trending", label: "Trending Offers", icon: Flame, color: "text-rose-500" },
  { id: "discount", label: "Highest Discount", icon: Tag, color: "text-amber-500" },
  { id: "verified", label: "Verified First", icon: ShieldCheck, color: "text-emerald-500" },
  { id: "expiry", label: "Expiring Soon", icon: Clock, color: "text-sky-500" },
  { id: "store", label: "Store Name (A-Z)", icon: Store, color: "text-violet-500" },
];

function getStoreLogoUrl(deal: Deal): string | null {
  if (deal.storeLogo) return deal.storeLogo;
  const lower = deal.storeName.toLowerCase();
  if (lower.includes("flipkart")) return "/Brand logos/flipkart.webp";
  if (lower.includes("amazon")) return "/Brand logos/Amazon_logo.svg.webp";
  if (lower.includes("myntra")) return "/Brand logos/myntra.webp";
  if (lower.includes("meesho")) return "/Brand logos/Meesho_logo.webp";
  if (lower.includes("ajio")) return "/Brand logos/Ajio.webp";
  if (lower.includes("nykaa")) return "/Brand logos/Nykaa.webp";
  if (lower.includes("tata cliq") || lower.includes("tatacliq")) return "/Brand logos/Tata-cliq.webp";
  if (lower.includes("croma")) return "/Brand logos/Croma.webp";
  if (lower.includes("lenovo")) return "/Brand logos/Lenovo_logo.svg.webp";
  if (lower.includes("dell")) return "/Brand logos/Dell_logo.svg.webp";
  if (lower.includes("samsung")) return "/Brand logos/Samsung.webp";
  if (lower.includes("levi")) return "/Brand logos/Levis.webp";
  if (lower.includes("firstcry")) return "/Brand logos/firstcry.webp";
  return null;
}

function OffersHubPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<DealSortField>("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch verified offers from API (with automatic client-side static fallback)
  const { deals: allDeals, isLoading } = useDeals({
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    sortBy,
    order: "desc",
    limit: 50,
  });

  const filteredOffers = useMemo(() => {
    const now = Date.now();
    return allDeals.filter((deal) => {
      // 1. Dynamic 24/7 Expiry Pruning: Drop expired deals
      if (deal.expiresIn === "Expired") return false;
      if (deal.endDate) {
        const end = new Date(deal.endDate).getTime();
        if (!isNaN(end) && end < now) return false;
      }

      const dCat = deal.category.toLowerCase();
      let matchesCategory = true;
      if (selectedCategory === "electronics") {
        matchesCategory = dCat === "electronics" || deal.title.toLowerCase().includes("laptop") || deal.title.toLowerCase().includes("audio");
      } else if (selectedCategory === "audio") {
        matchesCategory = dCat === "electronics" && (deal.title.toLowerCase().includes("audio") || deal.title.toLowerCase().includes("airdope") || deal.title.toLowerCase().includes("sonic"));
      } else if (selectedCategory === "laptops") {
        matchesCategory = dCat === "electronics" && (deal.title.toLowerCase().includes("laptop") || deal.title.toLowerCase().includes("thinkpad") || deal.title.toLowerCase().includes("xps") || deal.title.toLowerCase().includes("yoga"));
      } else if (selectedCategory !== "all") {
        matchesCategory = dCat === selectedCategory;
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        deal.title.toLowerCase().includes(q) ||
        deal.storeName.toLowerCase().includes(q) ||
        deal.code.toLowerCase().includes(q) ||
        deal.discount.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [allDeals, selectedCategory, searchQuery]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const currentSortObj = SORT_OPTIONS.find((s) => s.id === sortBy) || SORT_OPTIONS[0];
  const CurrentSortIcon = currentSortObj.icon;

  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Exclusive Offers", path: "/offers" },
  ]);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: filteredOffers.slice(0, 10).map((deal, idx) => ({
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
      <section className="relative border-b border-border bg-gradient-to-b from-background via-background/95 to-muted/20 px-4 sm:px-6 pb-12 sm:pb-16 pt-12 sm:pt-18 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(56,189,248,0.12),transparent)] pointer-events-none" />
        
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1 font-mono text-xs uppercase tracking-[0.2em] text-rose-500 shadow-xs">
            <Flame className="h-3.5 w-3.5 animate-pulse" />
            <span>24/7 LIVE CUELINKS SYNC • VERIFIED BARGAINS</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground text-balance">
            Hand-Tested Online Offers, Discounts &amp; Coupon Codes
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-muted-foreground text-balance leading-relaxed">
            Every offer is tested with live checkout auto-apply, benchmarked against 30-day price history graphs, and bundled with instant store cashback.
          </p>

          {/* Search Input */}
          <div className="mx-auto mt-8 max-w-xl">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search by store, gadget, fashion brand, or promo code…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md pl-11 pr-10 py-3.5 text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all shadow-md"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {OFFER_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-foreground text-background shadow-md font-bold scale-[1.03]"
                      : "border border-border/80 bg-card/70 backdrop-blur-xs text-muted-foreground hover:bg-card hover:text-foreground hover:border-primary/40"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-background" : "text-primary"}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Live Verified Trust Ribbon */}
          <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-2 px-4 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-xs text-muted-foreground font-mono">
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {filteredOffers.length} Live Verified Offers
            </span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-sky-400" />
              Auto-Pruned &amp; Updated 24/7
            </span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="inline-flex items-center gap-1.5 text-amber-500 font-semibold">
              <BadgePercent className="h-3.5 w-3.5" />
              Up to 80% Instant Savings
            </span>
          </div>
        </div>
      </section>

      {/* Featured Offers Content Section */}
      <section className="px-4 sm:px-6 py-10 sm:py-16">
        <div className="mx-auto max-w-6xl">
          {/* Controls Bar: Heading, Sort Dropdown & Layout Mode Switcher */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Featured Verified Offers &amp; Discounts
                </h2>
                <span className="hidden sm:inline-flex items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-xs px-2.5 py-0.5 font-bold">
                  {filteredOffers.length} Active
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Showing {filteredOffers.length} verified promotions with working coupon codes and instant store activation
              </p>
            </div>

            {/* Right Controls: Sort & View Mode */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Custom Glassmorphic Sort Dropdown */}
              <div className="relative" ref={sortDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card/90 px-3.5 py-2 text-xs font-semibold text-foreground shadow-xs hover:border-primary/40 hover:bg-card transition-all cursor-pointer"
                  aria-expanded={isSortOpen}
                  aria-haspopup="listbox"
                >
                  <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                  <span className="text-muted-foreground font-mono text-[11px]">Sort:</span>
                  <span className="inline-flex items-center gap-1.5 font-bold">
                    <CurrentSortIcon className={`h-3.5 w-3.5 ${currentSortObj.color}`} />
                    {currentSortObj.label}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Animated Dropdown Menu */}
                {isSortOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 z-50 rounded-2xl border border-border/90 bg-card/95 backdrop-blur-xl p-1.5 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150">
                    <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                      Order Offers By
                    </div>
                    {SORT_OPTIONS.map((opt) => {
                      const OptIcon = opt.icon;
                      const isSelected = sortBy === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setSortBy(opt.id);
                            setIsSortOpen(false);
                          }}
                          className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-primary/10 text-primary font-bold"
                              : "text-foreground hover:bg-muted/60"
                          }`}
                        >
                          <span className="inline-flex items-center gap-2">
                            <OptIcon className={`h-3.5 w-3.5 ${opt.color}`} />
                            <span>{opt.label}</span>
                          </span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-primary stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* View Mode Toggle Button */}
              <div className="inline-flex items-center rounded-xl border border-border/80 bg-card p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === "list"
                      ? "bg-primary text-primary-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="List View"
                >
                  <List className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">List</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-primary text-primary-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
              </div>

              <Link
                to="/compare"
                className="hidden lg:inline-flex items-center gap-1.5 font-mono text-xs text-primary hover:underline font-bold ml-2"
              >
                Compare Prices <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Dynamic Content: Loading Skeleton, Empty State, or Beautified Offers */}
          {isLoading ? (
            <DealGridSkeleton count={6} />
          ) : filteredOffers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border py-16 text-center px-4 bg-card/20 backdrop-blur-xs">
              <SlidersHorizontal className="mx-auto h-8 w-8 text-muted-foreground/60 mb-3" />
              <p className="text-base font-bold text-foreground">No verified offers found matching &ldquo;{searchQuery}&rdquo;</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Try searching for another store or brand, or reset the filters to see all verified savings.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === "list" ? (
            /* ========================================================================= */
            /* BEAUTIFIED ANIMATED LIST VIEW                                             */
            /* ========================================================================= */
            <div className="space-y-4">
              {filteredOffers.map((deal, idx) => {
                const affiliateUrl = wrapAffiliateTracking(deal.link, "gocoupon_offers_list");
                const logoUrl = getStoreLogoUrl(deal);
                const isCopied = copiedCode === deal.code;

                return (
                  <div
                    key={deal.id}
                    style={{ animationDelay: `${Math.min(idx * 40, 400)}ms` }}
                    className="group relative flex flex-col md:flex-row md:items-center justify-between gap-5 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md p-5 sm:p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:-translate-y-0.5 overflow-hidden animate-in fade-in-50 slide-in-from-bottom-2"
                  >
                    {/* Left Accent Indicator Strip */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/80 via-emerald-500/80 to-primary/40 opacity-70 group-hover:opacity-100 transition-opacity" />

                    {/* Main Content Info Block */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Store Avatar */}
                      <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-2xl border border-border/80 bg-background/90 p-2 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform overflow-hidden">
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt={deal.storeName}
                            className="max-h-full max-w-full object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <Store className="h-6 w-6 text-primary/70" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-foreground">
                            {deal.storeName}
                          </span>
                          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            {deal.badge}
                          </span>
                          <span className="hidden sm:inline-block text-[11px] text-muted-foreground font-mono">
                            • {deal.category}
                          </span>
                        </div>

                        <h3 className="font-display text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                          {deal.title}
                        </h3>

                        {deal.terms && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-1 max-w-2xl">
                            {deal.terms}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] font-mono text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3 text-sky-400" />
                            <span>{deal.expiresIn}</span>
                          </span>
                          {deal.minOrder && (
                            <span className="inline-flex items-center gap-1">
                              <span>• Min: {deal.minOrder}</span>
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <Users className="h-3 w-3" />
                            <span>{deal.usesCount.toLocaleString()} shoppers saved</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Action Block: Discount & CTAs */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-border/60">
                      {/* Discount Callout */}
                      <div className="text-left md:text-right">
                        <div className="font-mono text-xl sm:text-2xl font-black text-foreground tracking-tight">
                          {deal.discount}
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">
                          Instant Discount
                        </span>
                      </div>

                      {/* Interactive Actions Group */}
                      <div className="flex items-center gap-2">
                        {/* Coupon Strip Button */}
                        <button
                          type="button"
                          onClick={() => handleCopyCode(deal.code)}
                          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 font-mono text-xs font-bold transition-all cursor-pointer ${
                            isCopied
                              ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-400 shadow-xs scale-105"
                              : "border-dashed border-primary/40 bg-primary/5 text-foreground hover:bg-primary/10 hover:border-primary"
                          }`}
                          title="Click to copy coupon code"
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[2.5]" />
                              <span>COPIED!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 text-primary" />
                              <span>{deal.code}</span>
                            </>
                          )}
                        </button>

                        {/* Instant Open Button */}
                        <a
                          href={affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-primary/25 transition-all group/btn cursor-pointer"
                        >
                          <span>Open Store</span>
                          <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ========================================================================= */
            /* BEAUTIFIED ANIMATED GRID VIEW                                             */
            /* ========================================================================= */
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredOffers.map((deal, idx) => {
                const affiliateUrl = wrapAffiliateTracking(deal.link, "gocoupon_offers_grid");
                const logoUrl = getStoreLogoUrl(deal);
                const isCopied = copiedCode === deal.code;

                return (
                  <div
                    key={deal.id}
                    style={{ animationDelay: `${Math.min(idx * 40, 400)}ms` }}
                    className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card/80 backdrop-blur-md p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:-translate-y-1 overflow-hidden animate-in fade-in-50 slide-in-from-bottom-2"
                  >
                    <div>
                      {/* Top Store Badge & Verified Pill */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="h-9 w-9 shrink-0 rounded-xl border border-border/80 bg-background/90 p-1.5 flex items-center justify-center shadow-2xs overflow-hidden">
                            {logoUrl ? (
                              <img
                                src={logoUrl}
                                alt={deal.storeName}
                                className="max-h-full max-w-full object-contain"
                                loading="lazy"
                              />
                            ) : (
                              <Store className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <span className="font-mono text-xs font-bold text-foreground">
                            {deal.storeName}
                          </span>
                        </div>

                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          {deal.badge}
                        </span>
                      </div>

                      {/* Discount Callout */}
                      <div className="mb-2">
                        <div className="font-mono text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                          {deal.discount}
                        </div>
                        {deal.minOrder && (
                          <span className="text-[11px] font-mono text-muted-foreground">
                            Min. order {deal.minOrder}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-display text-base font-bold leading-snug text-foreground group-hover:text-primary transition-colors">
                        {deal.title}
                      </h3>

                      {deal.terms && (
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                          {deal.terms}
                        </p>
                      )}
                    </div>

                    <div className="mt-6">
                      {/* Coupon Strip */}
                      <div className="rounded-2xl border border-border/80 bg-muted/30 p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-mono text-xs font-bold text-foreground">
                            <Tag className="h-3.5 w-3.5 text-primary" />
                            <span>{deal.code}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(deal.code)}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                              isCopied
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                : "bg-card border border-border text-foreground hover:bg-muted"
                            }`}
                          >
                            {isCopied ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-400" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 text-muted-foreground" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Footer Info & Action */}
                      <div className="flex items-center justify-between pt-3 border-t border-border/80">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3 text-sky-400" />
                          <span>{deal.expiresIn}</span>
                        </span>
                        <a
                          href={affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="inline-flex items-center gap-1.5 font-bold text-xs text-primary hover:underline group/btn"
                        >
                          <span>Open Store</span>
                          <ExternalLink className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Trust & Guarantee Callout */}
      <section className="border-t border-border bg-card/40 px-4 sm:px-6 py-14">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 font-mono text-xs font-bold text-emerald-500 uppercase tracking-wider mb-3 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 rounded-full">
            <ShieldCheck className="h-4 w-4" />
            100% Genuine &amp; Validated Discounts
          </div>
          <h2 className="font-display text-xl sm:text-3xl font-extrabold text-foreground">
            How GoCoupon Verifies Every Promo Offer
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Our automated scanner validates coupons directly against merchant checkout endpoints every 4 hours. When you click an offer, the promo code is copied automatically and the store is launched with instant cashback tracking.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="rounded-2xl border border-border/80 bg-card/60 p-5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                <Check className="h-4 w-4 stroke-[3]" />
              </div>
              <h3 className="font-bold text-sm text-foreground">No Expired Codes</h3>
              <p className="text-xs text-muted-foreground mt-1">Dead codes are instantly purged from the feed so you never waste time at checkout.</p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card/60 p-5">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Zero Fake Discounts</h3>
              <p className="text-xs text-muted-foreground mt-1">Cross-checked against 30-day historical prices to guarantee genuine savings.</p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card/60 p-5">
              <div className="h-8 w-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500 mb-3">
                <Zap className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-foreground">1-Click Auto-Apply</h3>
              <p className="text-xs text-muted-foreground mt-1">Get the free Chrome extension to test and apply codes in parallel automatically.</p>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

export default OffersHubPage;
