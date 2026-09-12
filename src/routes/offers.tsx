import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useRef, useEffect } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import { useDeals } from "@/hooks/use-deals";
import { triggerLiveSync, type DealSortField, type Deal } from "@/lib/api/deals-api";
import { wrapAffiliateTracking } from "@/lib/services/store-registry";
import { DealGridSkeleton } from "@/components/ui/DataSkeleton";
import { StoreLogo } from "@/components/common/StoreLogo";
import { resolveStoreLogo } from "@/lib/services/store-logo-resolver";
import { RedeemCouponButton } from "@/components/common/RedeemCouponButton";
import {
  Flame,
  Tag,
  ExternalLink,
  ShoppingBag,
  Copy,
  Check,
  Zap,
  Percent,
  Search,
  Store,
  Clock,
  ShieldCheck,
  LayoutGrid,
  List,
  ChevronDown,
  X,
  Users,
  BadgePercent,
  CheckCircle2,
  SlidersHorizontal,
  RefreshCw,
  Sparkles,
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

const ALL_CATEGORY_META: Record<string, { label: string; icon: any }> = {
  all: { label: "All Offers", icon: Flame },
  Fashion: { label: "Fashion & Lifestyle", icon: ShoppingBag },
  Electronics: { label: "Electronics & Tech", icon: Zap },
  Beauty: { label: "Beauty & Cosmetics", icon: Sparkles },
  Home: { label: "Home & Kitchen", icon: Tag },
  Food: { label: "Food & Dining", icon: Store },
  Travel: { label: "Travel & Hotels", icon: Clock },
  Recharge: { label: "Recharge & Utilities", icon: Percent },
  General: { label: "Special Offers", icon: Tag },
};

const SORT_OPTIONS: { id: DealSortField; label: string; icon: typeof Flame; color: string }[] = [
  { id: "trending", label: "Trending Offers", icon: Flame, color: "text-rose-500" },
  { id: "discount", label: "Highest Discount", icon: Tag, color: "text-amber-500" },
  { id: "verified", label: "Verified First", icon: ShieldCheck, color: "text-emerald-500" },
  { id: "expiry", label: "Expiring Soon", icon: Clock, color: "text-sky-500" },
  { id: "store", label: "Store Name (A-Z)", icon: Store, color: "text-violet-500" },
];


function OffersHubPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<DealSortField>("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(36);
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

  // Fetch all active verified offers dynamically from API (no static limit)
  const { deals: allDeals, isLoading, lastSyncedAt, refetch } = useDeals({
    limit: 0, // Requests all dynamic deals from server (up to 1500)
    sortBy,
    order: "desc",
  });

  // Calculate live dynamic category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allDeals.length };
    for (const d of allDeals) {
      const cat = d.category || "General";
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [allDeals]);

  // Derive dynamic category tabs based on available deals
  const dynamicCategories = useMemo(() => {
    const tabs = [{ id: "all", label: "All Offers", icon: Flame, count: allDeals.length }];
    for (const [catId, meta] of Object.entries(ALL_CATEGORY_META)) {
      if (catId === "all") continue;
      const count = categoryCounts[catId] || 0;
      if (count > 0) {
        tabs.push({ id: catId, label: meta.label, icon: meta.icon, count });
      }
    }
    return tabs;
  }, [allDeals, categoryCounts]);

  // Filter deals dynamically based on search, category and expiry
  const filteredOffers = useMemo(() => {
    const now = Date.now();
    return allDeals.filter((deal) => {
      // Dynamic 24/7 Expiry Pruning: Drop expired deals
      if (deal.expiresIn === "Expired") return false;
      if (deal.endDate) {
        const end = new Date(deal.endDate).getTime();
        if (!isNaN(end) && end < now) return false;
      }

      if (selectedCategory !== "all") {
        const dCat = (deal.category || "").toLowerCase();
        const sel = selectedCategory.toLowerCase();
        if (dCat !== sel && !dCat.includes(sel) && !sel.includes(dCat)) {
          return false;
        }
      }

      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesSearch =
          deal.title.toLowerCase().includes(q) ||
          deal.storeName.toLowerCase().includes(q) ||
          deal.code.toLowerCase().includes(q) ||
          deal.discount.toLowerCase().includes(q) ||
          deal.category.toLowerCase().includes(q) ||
          (deal.terms && deal.terms.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [allDeals, selectedCategory, searchQuery]);

  // Reset pagination when category, search, or sort changes
  useEffect(() => {
    setVisibleCount(36);
  }, [selectedCategory, searchQuery, sortBy]);

  const visibleOffers = useMemo(() => {
    return filteredOffers.slice(0, visibleCount);
  }, [filteredOffers, visibleCount]);

  const [expandedDealIds, setExpandedDealIds] = useState<Set<string>>(new Set());

  const toggleExpand = (dealId: string) => {
    setExpandedDealIds((prev) => {
      const next = new Set(prev);
      if (next.has(dealId)) {
        next.delete(dealId);
      } else {
        next.add(dealId);
      }
      return next;
    });
  };

  const handleRedeemDeal = (deal: Deal, e?: React.MouseEvent) => {
    const hasCode = Boolean(deal.code && deal.code.trim().length > 1);
    if (hasCode) {
      const code = deal.code.trim();
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`Coupon code "${code}" copied! Opening ${deal.storeName} to auto-apply...`);
      setTimeout(() => setCopiedCode((curr) => (curr === code ? null : curr)), 5000);
    } else {
      setCopiedCode(deal.id);
      toast.success(`Activating ${deal.discount}! Opening ${deal.storeName}...`);
      setTimeout(() => setCopiedCode((curr) => (curr === deal.id ? null : curr)), 5000);
    }
  };

  const handleCardBoxClick = (deal: Deal, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, select, textarea")) {
      return;
    }
    const affiliateUrl = wrapAffiliateTracking(deal.link, "gocoupon_offers_box");
    handleRedeemDeal(deal, e);
    window.open(affiliateUrl, "_blank", "noopener,noreferrer");
  };

  const handleLiveSync = async () => {
    setIsSyncing(true);
    toast.info("Connecting to Cuelinks API v3... Ingesting fresh live deals.");
    try {
      const res = await triggerLiveSync();
      await refetch();
      if (res.success) {
        toast.success(`Synced ${res.activeCount || allDeals.length} live offers from Cuelinks API v3!`);
      } else {
        toast.success(`Refreshed ${allDeals.length} active live offers!`);
      }
    } catch {
      toast.error("Could not sync right now, using active live deals pool.");
    } finally {
      setIsSyncing(false);
    }
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
      description: `${deal.discount} at ${deal.storeName}${deal.code && deal.code.length > 1 ? ` — use code ${deal.code}` : ` — no code needed, discount auto-applied`}`,
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

      {/* ── Compact Page Header + Controls ── */}
      <section className="sticky top-0 z-30 border-b border-border bg-background px-4 sm:px-6 py-3 shadow-sm">
        <div className="mx-auto max-w-6xl space-y-2.5">

          {/* Row 1: Brand pill + title + trust badges + Live Sync button */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-rose-500">
                <Flame className="h-3 w-3 animate-pulse" />
                Live Sync
              </span>
              <h1 className="font-display text-sm sm:text-base font-extrabold tracking-tight text-foreground">
                Verified Offers, Discounts &amp; Coupon Codes
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/8 px-2.5 py-0.5 font-mono text-[10px] text-emerald-500 font-semibold">
                <CheckCircle2 className="h-3 w-3" />
                {filteredOffers.length} Live
              </span>
              <span className="hidden md:inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3 text-sky-400" />
                Auto-Updated 24/7
              </span>
              <span className="hidden md:inline-flex items-center gap-1 font-mono text-[10px] text-amber-500 font-semibold">
                <BadgePercent className="h-3 w-3" />
                Up to 80% Off
              </span>
            </div>

            {/* Live Re-sync Button */}
            <button
              type="button"
              onClick={handleLiveSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1 font-mono text-[11px] font-bold text-rose-500 hover:bg-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
              title="Click to trigger on-demand sync directly from Cuelinks API v3"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin text-rose-500" : ""}`} />
              <span>{isSyncing ? "Syncing..." : "Sync Live Offers"}</span>
            </button>
          </div>

          {/* Row 2: Search + Category Pills + Sort + View Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 min-w-[160px] max-w-xs group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search store, code or title…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/40 pl-9 pr-8 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Dynamic Category Pills — scrollable on mobile */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {dynamicCategories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-foreground text-background shadow-sm font-bold"
                        : "border border-border/80 bg-card/70 text-muted-foreground hover:text-foreground hover:border-primary/40"
                    }`}
                  >
                    <Icon className={`h-3 w-3 ${isSelected ? "text-background" : "text-primary"}`} />
                    <span>{cat.label}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 font-mono text-[9px] ${
                        isSelected ? "bg-background/20 text-background font-bold" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown */}
            <div className="relative ml-auto" ref={sortDropdownRef}>
              <button
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card/90 px-3 py-1.5 text-[11px] font-semibold text-foreground shadow-xs hover:border-primary/40 hover:bg-card transition-all cursor-pointer"
                aria-expanded={isSortOpen}
                aria-haspopup="listbox"
              >
                <CurrentSortIcon className={`h-3 w-3 ${currentSortObj.color}`} />
                <span className="hidden sm:inline font-mono text-[10px] text-muted-foreground">Sort:</span>
                <span className="font-bold">{currentSortObj.label}</span>
                <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`} />
              </button>
              {isSortOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 z-50 rounded-2xl border border-border/90 bg-card/95 backdrop-blur-xl p-1.5 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150">
                  <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">Order By</div>
                  {SORT_OPTIONS.map((opt) => {
                    const OptIcon = opt.icon;
                    const isSelected = sortBy === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => { setSortBy(opt.id); setIsSortOpen(false); }}
                        className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                          isSelected ? "bg-primary/10 text-primary font-bold" : "text-foreground hover:bg-muted/60"
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

            {/* View Toggle */}
            <div className="inline-flex items-center rounded-xl border border-border/80 bg-card p-0.5 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                  viewMode === "list" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
                title="List View"
              >
                <List className="h-3 w-3" />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                  viewMode === "grid" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-3 w-3" />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Offers Grid Section */}
      <section className="px-4 sm:px-6 py-6">
        <div className="mx-auto max-w-6xl">

          {/* Dynamic Content: Loading Skeleton, Empty State, or Beautified Offers */}
          {isLoading ? (
            <DealGridSkeleton count={8} />
          ) : filteredOffers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border py-16 text-center px-4 bg-card/20 backdrop-blur-xs">
              <SlidersHorizontal className="mx-auto h-8 w-8 text-muted-foreground/60 mb-3" />
              <p className="text-base font-bold text-foreground">No verified offers found matching &ldquo;{searchQuery}&rdquo;</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Try searching for another store or brand, or reset the filters to view all {allDeals.length} live verified savings.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all cursor-pointer"
              >
                Reset All Filters ({allDeals.length} Offers)
              </button>
            </div>
          ) : viewMode === "list" ? (
            /* ========================================================================= */
            /* BEAUTIFIED ANIMATED LIST VIEW                                             */
            /* ========================================================================= */
            <div className="space-y-4">
              {visibleOffers.map((deal, idx) => {
                const affiliateUrl = wrapAffiliateTracking(deal.link, "gocoupon_offers_list");
                const isCopied = Boolean(copiedCode && (copiedCode === deal.code || copiedCode === deal.id));
                const isExpanded = expandedDealIds.has(deal.id);

                return (
                  <div
                    key={deal.id}
                    onClick={(e) => handleCardBoxClick(deal, e)}
                    style={{ animationDelay: `${Math.min(idx * 20, 300)}ms` }}
                    className="group relative flex flex-col md:flex-row md:items-center justify-between gap-5 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md p-5 sm:p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:-translate-y-0.5 overflow-hidden animate-in fade-in-50 slide-in-from-bottom-2 cursor-pointer"
                  >
                    {/* Left Accent Indicator Strip */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/80 via-emerald-500/80 to-primary/40 opacity-70 group-hover:opacity-100 transition-opacity" />

                    {/* Main Content Info Block */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Store Avatar */}
                      <StoreLogo
                        storeName={deal.storeName}
                        storeLogo={deal.storeLogo}
                        trackingUrl={deal.link}
                        className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl p-2 group-hover:scale-105 transition-transform"
                        imageClassName="max-h-full max-w-full object-contain"
                      />

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

                        {/* Terms + Read more button */}
                        {deal.terms && (
                          <div className="mt-1">
                            <p className={`text-xs text-muted-foreground ${isExpanded ? "" : "line-clamp-1"} max-w-2xl transition-all leading-relaxed`}>
                              {deal.terms}
                            </p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(deal.id);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer pt-1"
                            >
                              <span>{isExpanded ? "Read less" : "Read more"}</span>
                              <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                            </button>

                            {isExpanded && (
                              <div className="mt-2.5 rounded-xl border border-border/80 bg-muted/30 p-3 text-xs space-y-1.5 animate-in fade-in-50 slide-in-from-top-1">
                                <div className="font-semibold text-foreground flex items-center gap-1.5">
                                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                  <span>Offer Terms &amp; How to Redeem:</span>
                                </div>
                                <p className="text-muted-foreground text-[11px] leading-relaxed">
                                  {deal.terms}
                                </p>
                                <ul className="text-muted-foreground text-[11px] space-y-0.5 list-disc list-inside pt-1 border-t border-border/50">
                                  {deal.minOrder && (
                                    <li>Minimum purchase: <strong className="text-foreground font-semibold">{deal.minOrder}</strong></li>
                                  )}
                                  {deal.endDate && (
                                    <li>Valid until: <strong className="text-foreground font-semibold">{new Date(deal.endDate).toLocaleDateString()}</strong></li>
                                  )}
                                  <li>Click the button to auto-copy code &amp; redirect to {deal.storeName}.</li>
                                </ul>
                              </div>
                            )}
                          </div>
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
                            <span>{(deal.usesCount || 1200).toLocaleString()} shoppers saved</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Action Block: Discount & Reveal Coupon Button */}
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

                      {/* Reveal Code & Auto-Redirect CTA */}
                      <div className="flex items-center">
                        <RedeemCouponButton
                          deal={deal}
                          affiliateUrl={affiliateUrl}
                          isCopied={isCopied}
                          onRedeem={handleRedeemDeal}
                          className="min-w-[210px]"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ========================================================================= */
            /* CLEAN MINIMAL GRID VIEW                                                   */
            /* ========================================================================= */
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleOffers.map((deal, idx) => {
                const affiliateUrl = wrapAffiliateTracking(deal.link, "gocoupon_offers_grid");
                const isCopied = Boolean(copiedCode && (copiedCode === deal.code || copiedCode === deal.id));
                const isExpanded = expandedDealIds.has(deal.id);

                /* Badge accent colour */
                const accentClass =
                  deal.badge === "Verified"
                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60"
                    : deal.badge === "Exclusive"
                    ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800/60"
                    : "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60";

                return (
                  <div
                    key={deal.id}
                    onClick={(e) => handleCardBoxClick(deal, e)}
                    style={{ animationDelay: `${Math.min(idx * 15, 250)}ms` }}
                    className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-lg animate-in fade-in-0 slide-in-from-bottom-2 cursor-pointer"
                  >
                    {/* ── Store row ── */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <StoreLogo
                          storeName={deal.storeName}
                          storeLogo={deal.storeLogo}
                          trackingUrl={deal.link}
                          className="h-8 w-8 rounded-lg p-1"
                          imageClassName="max-h-full max-w-full object-contain"
                        />
                        <span className="text-[13px] font-semibold text-foreground leading-none">
                          {deal.storeName}
                        </span>
                      </div>
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${accentClass}`}>
                        {deal.badge}
                      </span>
                    </div>

                    {/* ── Discount + Title ── */}
                    <div className="mb-3">
                      <div className="text-2xl font-black tracking-tight text-foreground leading-none mb-1.5">
                        {deal.discount}
                      </div>
                      <h3 className="text-[13px] font-medium text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {deal.title}
                      </h3>
                    </div>

                    {/* ── Terms + Read more ── */}
                    {deal.terms && (
                      <div className="mb-3">
                        <p className={`text-[11px] text-muted-foreground ${isExpanded ? "" : "line-clamp-1"} transition-all leading-snug`}>
                          {deal.terms}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(deal.id);
                          }}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline cursor-pointer pt-0.5"
                        >
                          <span>{isExpanded ? "Read less" : "Read more"}</span>
                          <ChevronDown className={`h-2.5 w-2.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                        </button>
                        {isExpanded && (
                          <div className="mt-2 rounded-lg border border-border/80 bg-muted/40 p-2.5 text-[10px] text-muted-foreground space-y-1 animate-in fade-in-50">
                            <p className="leading-relaxed">{deal.terms}</p>
                            {deal.minOrder && <div>• Min Order: <strong className="text-foreground">{deal.minOrder}</strong></div>}
                            {deal.endDate && <div>• Valid Until: <strong className="text-foreground">{new Date(deal.endDate).toLocaleDateString()}</strong></div>}
                            <div className="text-emerald-600 dark:text-emerald-400 font-medium pt-0.5">• Code copied automatically on click!</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── Expiry ── */}
                    <div className="flex items-center gap-1 mb-4">
                      <Clock className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                      <span className="text-[11px] text-muted-foreground">{deal.expiresIn}</span>
                      <span className="text-[11px] text-muted-foreground ml-auto font-mono text-[10px]">
                        {deal.category}
                      </span>
                    </div>

                    {/* ── Reveal Coupon CTA & Auto-Redirect ── */}
                    <div className="mt-auto pt-2">
                      <RedeemCouponButton
                        deal={deal}
                        affiliateUrl={affiliateUrl}
                        isCopied={isCopied}
                        onRedeem={handleRedeemDeal}
                        fullWidth
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Progressive Pagination / Load More Controls ── */}
          {filteredOffers.length > visibleCount && (
            <div className="mt-10 flex flex-col items-center justify-center gap-3 pt-6 border-t border-border/80 text-center">
              <p className="font-mono text-xs text-muted-foreground">
                Showing <span className="font-bold text-foreground">{visibleCount}</span> of{" "}
                <span className="font-bold text-foreground">{filteredOffers.length}</span> live deals
              </p>
              <div className="w-56 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${Math.min(100, Math.round((visibleCount / filteredOffers.length) * 100))}%` }}
                />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => Math.min(filteredOffers.length, prev + 36))}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all cursor-pointer"
                >
                  Load 36 More Deals ({filteredOffers.length - visibleCount} remaining)
                </button>
                <button
                  type="button"
                  onClick={() => setVisibleCount(filteredOffers.length)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted/80 transition-all cursor-pointer"
                >
                  Show All ({filteredOffers.length})
                </button>
              </div>
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
            Our automated engine syncs directly with merchant affiliate APIs (Cuelinks API v3) 24/7. When you click an offer, the promo code is copied automatically and the store is launched with instant verified tracking.
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
