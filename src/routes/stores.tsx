import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useRef } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import { useStores } from "@/hooks/use-stores";
import type { Store, StoreSortField } from "@/lib/api/stores-api";
import { StoreGridSkeleton, FetchError } from "@/components/ui/DataSkeleton";
import { useCurrency } from "@/context/CurrencyContext";
import {
  Search,
  Store as StoreIcon,
  Tag,
  ExternalLink,
  ArrowRight,
  Check,
  Copy,
  Star,
  ShieldCheck,
  Clock,
  Percent,
  TrendingDown,
  X,
  Zap,
  Layers,
  Compass,
  CheckCircle2,
  Box,
  Flame,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/stores")({
  component: StoresPage,
  head: () =>
    createSeoHead({
      title: "Top 200+ Online Stores Coupons & Deals Directory (2026) – GoCoupon",
      description:
        "Browse verified working coupon codes, promo vouchers, and up to 10% cashback across 200+ top online shopping stores worldwide including Amazon, Walmart, Target, Flipkart, Myntra, and more.",
      path: "/stores",
      keywords:
        "all stores coupons, online store deals, shopping discounts, store directory, brand promo codes worldwide, amazon coupons, walmart deals, flipkart promo codes",
    }),
});

const CATEGORIES = ["All", "General", "Fashion", "Electronics", "Beauty", "Food", "Travel", "Home"] as const;

function StoresPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<StoreSortField>("popularity");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { formatPriceString, isIndia } = useCurrency();

  // ── Live API fetch — data comes from /api/stores, sorted dynamically by backend ──
  const { stores: allStores, isLoading, isError, refetch } = useStores({
    category: selectedCategory !== "All" ? selectedCategory.toLowerCase() : undefined,
    sortBy,
    order: sortBy === "name" ? "asc" : "desc",
  });

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allStores.length };
    allStores.forEach((s) => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  }, [allStores]);

  const filteredStores = useMemo(() => {
    return allStores.filter((store) => {
      const matchesSearch =
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.popularCoupon.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.popularCoupon.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || store.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, allStores]);

  const handleCopy = (code: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "All Stores", path: "/stores" },
  ]);

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* ── HERO SECTION: "The Spatial Merchant Matrix" ── */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background via-background/95 to-muted/20 px-3.5 sm:px-6 pb-14 sm:pb-20 pt-10 sm:pt-20 perspective-1200">
        {/* Background Radial Spotlights & Geometric Grid Mesh */}
        <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-25" aria-hidden="true">
          <div className="absolute left-1/2 -top-40 -translate-x-1/2 h-[550px] w-[800px] rounded-full bg-gradient-to-tr from-primary/30 via-amber-500/15 to-transparent blur-3xl" />
          <div className="absolute right-10 top-1/3 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl text-center">
          {/* Live Scanner Pill */}
          <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-card/90 px-3.5 py-1 sm:px-4 sm:py-1.5 shadow-[0_4px_20px_rgba(var(--primary-rgb),0.15)] backdrop-blur-xl">
            <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-foreground">
              Storeverse Matrix • 200+ Live Retailers
            </span>
          </div>

          <h1 className="font-display text-[22px] xs:text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground text-balance break-words px-1">
            Explore the Merchant Storeverse
          </h1>

          <p className="mx-auto mt-3 sm:mt-4 max-w-2xl text-xs sm:text-base md:text-lg text-muted-foreground text-balance leading-relaxed px-2 sm:px-0">
            Discover verified promotional vouchers, auto-clipped coupon checkouts, and real-time cashback across 200+ top global and regional retail portals.
          </p>

          {/* Floating Brand Orbital Deck — Responsive: Touch Snap Carousel on Mobile, Floating Deck on Desktop */}
          <div className="relative mt-6 sm:mt-10">
            <div className="flex items-center justify-start md:justify-center gap-3 sm:gap-4 md:gap-6 overflow-x-auto no-scrollbar py-2 px-2 -mx-3.5 sm:mx-0 snap-x snap-mandatory md:animate-storeverse-float">
              {[
                { name: "Amazon", logo: "/Brand logos/Amazon_logo.svg.webp", deal: "75% OFF" },
                { name: "Walmart", logo: "/icons/WMT-Wordmark-Small-TrueBlue-RGB.png", deal: "Rollback $20" },
                { name: "Flipkart", logo: "/Brand logos/flipkart.webp", deal: "Flat ₹500" },
                { name: "Target", logo: "/icons/target.svg", deal: "Circle 20%" },
                { name: "Myntra", logo: "/Brand logos/myntra.webp", deal: "Flat ₹500" },
                { name: "Best Buy", icon: "💻", deal: "Save $50" },
              ].map((b, idx) => (
                <div
                  key={b.name}
                  onClick={() => setSearchQuery(b.name)}
                  className="group/orbital relative flex shrink-0 snap-center flex-col items-center gap-1.5 sm:gap-2 rounded-2xl border border-border/80 bg-card/90 p-2.5 sm:p-3 shadow-md backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-primary active:scale-95 cursor-pointer touch-manipulation min-w-[76px] sm:min-w-[90px]"
                  style={{
                    transform: `translateZ(${(idx % 3) * 8}px)`,
                  }}
                >
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-background border border-border/60 p-1 shadow-2xs overflow-hidden">
                    {b.logo ? (
                      <img src={b.logo} alt={b.name} className="h-full w-full object-contain" width={48} height={48} />
                    ) : (
                      <span className="text-xl sm:text-2xl">{b.icon}</span>
                    )}
                  </div>
                  <span className="font-display text-[11px] sm:text-xs font-bold text-foreground truncate max-w-[70px] sm:max-w-none">
                    {b.name}
                  </span>
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 font-mono text-[8px] sm:text-[9px] font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {b.deal}
                  </span>
                </div>
              ))}
            </div>
            {/* Subtle mobile swipe indicator */}
            <div className="flex md:hidden items-center justify-center gap-1 mt-1 text-[10px] font-mono text-muted-foreground/60">
              <span>← Swipe popular brands →</span>
            </div>
          </div>

          {/* Noticeable Search Bar with Luminous Ambient Aura */}
          <div className="mx-auto mt-6 sm:mt-10 max-w-2xl text-left">
            <div className="group/search relative">
              {/* Luminous Glow Backdrop */}
              <div
                className="absolute -inset-1 sm:-inset-1.5 rounded-full bg-gradient-to-r from-primary/30 via-amber-500/20 to-primary/30 opacity-75 blur-lg sm:blur-xl transition-all duration-500 group-hover/search:opacity-100 group-focus-within/search:opacity-100 pointer-events-none"
                aria-hidden="true"
              />

              <div className="relative flex items-center w-full rounded-full border-2 border-primary/40 dark:border-primary/50 hover:border-primary/80 bg-card/98 backdrop-blur-2xl shadow-lg shadow-primary/10 hover:shadow-2xl hover:shadow-primary/20 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20 focus-within:shadow-2xl focus-within:shadow-primary/25 transition-all duration-300 min-h-[50px] sm:min-h-[60px] px-3.5 sm:px-4">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0 mr-2 sm:mr-3" aria-hidden="true" />
                <input
                  type="search"
                  name="storeSearch"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stores, brands, or coupons (Amazon, Nike)…"
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="Search stores and coupons"
                  className="w-full flex-1 bg-transparent border-none text-foreground placeholder:text-muted-foreground/70 text-sm sm:text-base font-normal focus:outline-hidden focus:ring-0 py-2 pr-2 touch-manipulation min-w-0 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search query"
                    className="rounded-full p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors touch-manipulation"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tactile Category Console Switcher — Centered & Fully Responsive (No Cut-Off) */}
          <div className="mx-auto mt-5 sm:mt-6 max-w-4xl px-2">
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              {CATEGORIES.map((cat) => {
                const count = categoryCounts[cat] || 0;
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`group relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 min-h-[36px] text-xs font-semibold transition-all duration-150 touch-manipulation border ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 font-mono text-[9px] sm:text-[10px] ${
                        isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Spatial Metrics Row — Responsive 2x2 Grid on Mobile */}
          <div className="mt-8 sm:mt-12 grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4 max-w-4xl mx-auto">
            <div className="rounded-2xl sm:rounded-3xl border border-border/70 bg-card/70 p-2.5 sm:p-4 shadow-xs backdrop-blur-md transition-transform hover:-translate-y-1">
              <span className="font-display text-lg sm:text-2xl lg:text-3xl font-black text-foreground block">200+</span>
              <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground uppercase tracking-wider block mt-0.5 sm:mt-1 truncate">
                Stores Scanned
              </span>
            </div>
            <div className="rounded-2xl sm:rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 sm:p-4 shadow-xs backdrop-blur-md transition-transform hover:-translate-y-1">
              <span className="font-display text-lg sm:text-2xl lg:text-3xl font-black text-emerald-600 dark:text-emerald-400 block">100%</span>
              <span className="text-[10px] sm:text-[11px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mt-0.5 sm:mt-1 truncate">
                Auto-Tested Daily
              </span>
            </div>
            <div className="rounded-2xl sm:rounded-3xl border border-primary/30 bg-primary/10 p-2.5 sm:p-4 shadow-xs backdrop-blur-md transition-transform hover:-translate-y-1">
              <span className="font-display text-lg sm:text-2xl lg:text-3xl font-black text-primary block truncate">Up to 8.5%</span>
              <span className="text-[10px] sm:text-[11px] font-mono text-primary uppercase tracking-wider block mt-0.5 sm:mt-1 truncate">
                Instant Cashback
              </span>
            </div>
            <div className="rounded-2xl sm:rounded-3xl border border-border/70 bg-card/70 p-2.5 sm:p-4 shadow-xs backdrop-blur-md transition-transform hover:-translate-y-1">
              <span className="font-display text-lg sm:text-2xl lg:text-3xl font-black text-foreground block truncate">&lt; 850 ms</span>
              <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground uppercase tracking-wider block mt-0.5 sm:mt-1 truncate">
                Fast Injection
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── STORES GRID MATRIX ── */}
      <section className="px-3.5 sm:px-6 py-10 sm:py-16 perspective-1200">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <h2 className="font-display text-lg sm:text-2xl font-black text-foreground flex items-center gap-2">
                <Box className="h-5 w-5 text-primary shrink-0" />
                <span>Active Storefront Vault ({filteredStores.length})</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedCategory === "All" ? "Showing all verified partner stores" : `Filtered by ${selectedCategory}`}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="store-sort-select" className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                  <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                  <span>Sort:</span>
                </label>
                <select
                  id="store-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as StoreSortField)}
                  className="rounded-xl border border-border bg-card/90 px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="popularity">Most Popular</option>
                  <option value="rating">Highest Rated (★)</option>
                  <option value="couponsCount">Most Coupons</option>
                  <option value="maxDiscount">Max Discount %</option>
                  <option value="cashback">Highest Cashback</option>
                  <option value="name">Alphabetical (A–Z)</option>
                </select>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[11px] sm:text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Auto-verified daily</span>
              </span>
            </div>
          </div>

          {isLoading ? (
            <StoreGridSkeleton count={6} />
          ) : isError ? (
            <FetchError
              message="Could not load stores from the server. Please try again."
              onRetry={refetch}
            />
          ) : filteredStores.length === 0 ? (
            <div className="rounded-2xl sm:rounded-3xl border border-dashed border-border py-12 sm:py-16 text-center px-4">
              <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-muted/50 grid place-items-center text-muted-foreground">
                <StoreIcon className="h-6 w-6" />
              </div>
              <p className="text-sm sm:text-base font-semibold text-foreground">No stores found matching &ldquo;{searchQuery}&rdquo;.</p>
              <p className="text-xs text-muted-foreground mt-1">Try searching for Amazon, Walmart, Target, or another merchant category.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors touch-manipulation min-h-[40px]"
              >
                <span>Reset search filters</span>
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStores.map((store) => (
                <StoreCard

                  key={store.id}
                  store={store}
                  onCopy={handleCopy}
                  isCopied={copiedCode === store.popularCoupon.code}
                  formatPriceString={formatPriceString}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CONCEPTUAL FEATURE: "Automated Checkout Injector" (with mobile clearance) ── */}
      <section className="border-t border-border bg-gradient-to-b from-muted/20 to-background px-3.5 sm:px-6 py-14 sm:py-20 pb-28 sm:pb-20 perspective-1200">
        <div className="mx-auto max-w-5xl rounded-2xl sm:rounded-3xl border border-primary/30 bg-card p-5 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-primary/15 blur-3xl pointer-events-none" />

          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 font-mono text-[11px] sm:text-xs uppercase tracking-wider text-primary font-bold">
                <Zap className="h-3.5 w-3.5" />
                <span>Auto-Injector Technology</span>
              </div>
              <h2 className="mt-3 font-display text-xl sm:text-3xl font-black tracking-tight text-foreground">
                How GoCoupon Injects Discounts at Checkout
              </h2>
              <p className="mt-2.5 text-xs sm:text-base text-muted-foreground leading-relaxed">
                The extension stays dormant while you browse. When you reach checkout on Amazon, Walmart, Target, or 200+ partner stores, GoCoupon awakens, parallel-tests candidate vouchers in 850 milliseconds, and applies the highest savings.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  to="/chrome-extension"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 min-h-[48px] text-sm font-bold text-primary-foreground shadow-md transition-transform hover:scale-105 active:scale-95 touch-manipulation"
                >
                  <span>Install Free Chrome Extension</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/compare"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-3.5 min-h-[48px] text-sm font-bold text-foreground hover:bg-muted transition-colors touch-manipulation"
                >
                  <span>Compare Prices</span>
                </Link>
              </div>
            </div>

            {/* Isometric Interactive Cart Mockup Card */}
            <div className="relative">
              <div className="rounded-2xl border border-border/80 bg-background/90 p-4 sm:p-5 shadow-xl backdrop-blur-md md:hover:rotate-1 transition-transform duration-300">
                <div className="flex items-center justify-between border-b border-border/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                    <span className="font-mono text-[10px] sm:text-[11px] text-muted-foreground ml-1">Store Checkout</span>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono text-[9px] sm:text-[10px] font-bold px-2 py-0.5">
                    ● Active
                  </span>
                </div>

                <div className="py-3.5 space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Original Cart Total:</span>
                    <span className="font-mono line-through text-muted-foreground">{isIndia ? "₹3,499" : "$120.00"}</span>
                  </div>

                  {/* Floating Injected Coupon Voucher */}
                  <div className="relative overflow-hidden rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-2.5 sm:p-3 shadow-2xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Tag className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div className="min-w-0">
                          <span className="font-mono text-[11px] sm:text-xs font-black text-emerald-700 dark:text-emerald-300 block truncate">
                            SAVE20 (Auto-Applied)
                          </span>
                          <span className="text-[9px] sm:text-[10px] text-muted-foreground truncate block">Highest verified discount</span>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0">
                        -{isIndia ? "₹650" : "$24.50"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/80 pt-2 text-xs sm:text-sm">
                    <span className="font-bold text-foreground">Final Net Cost:</span>
                    <span className="font-display text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
                      {isIndia ? "₹2,849" : "$95.50"}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border/60 pt-2 text-[9px] sm:text-[10px] font-mono text-muted-foreground text-center">
                  100% Client-Side Manifest V3 Sandbox
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

/**
 * Interactive Store Card with Multi-Layer Elevation (Mobile-First)
 */
function StoreCard({
  store,
  onCopy,
  isCopied,
  formatPriceString,
}: {
  store: Store;
  onCopy: (code: string, e: React.MouseEvent) => void;
  isCopied: boolean;
  formatPriceString: (str: string) => string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const formattedDiscount = formatPriceString(store.popularCoupon.discount);
  const formattedDescription = formatPriceString(store.popularCoupon.description);

  const CardContent = (
    <div
      ref={cardRef}
      className="group relative flex h-full flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/80 bg-card/95 p-4 sm:p-6 shadow-2xs transition-all duration-300 hover:-translate-y-1.5 sm:hover:-translate-y-2 hover:border-primary/60 hover:shadow-xl cursor-pointer"
    >
      {/* Top Row: Elevated Brand Podium + Floating Cashback Badge */}
      <div>
        <div className="flex items-start justify-between gap-2.5 sm:gap-4 translate-z-20">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            {/* Elevated Logo Podium */}
            <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border border-border/80 bg-background p-2 shadow-md transition-transform duration-300 group-hover:scale-105 overflow-hidden">
              {store.logo ? (
                <img
                  src={store.logo}
                  alt={`${store.name} logo`}
                  className="h-full w-full object-contain"
                  loading="lazy"
                  width={48}
                  height={48}
                />
              ) : (
                <span className="text-xl sm:text-2xl" role="img" aria-label={store.name}>
                  {store.fallbackIcon}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <h3 className="font-display text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">
                {store.name}
              </h3>
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground mt-0.5">
                <span className="font-mono text-[10px] sm:text-[11px] font-semibold">{store.category}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-0.5 text-amber-500 font-bold font-mono text-[10px] sm:text-[11px]">
                  <Star className="h-3 w-3 fill-current" />
                  {store.rating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Glowing Cashback Pill */}
          {store.cashbackRate && (
            <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 sm:px-3 sm:py-1 font-mono text-[9px] sm:text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shadow-2xs whitespace-nowrap">
              {store.cashbackRate}
            </span>
          )}
        </div>

        {/* Description Snippet */}
        <p className="mt-3 sm:mt-4 text-xs leading-relaxed text-muted-foreground line-clamp-2 translate-z-10">
          {store.description}
        </p>

        {/* Holographic Perforated Coupon Ticket */}
        <div className="relative mt-4 sm:mt-5 rounded-xl sm:rounded-2xl border border-dashed border-primary/40 bg-gradient-to-r from-primary/5 via-muted/40 to-primary/5 p-3 sm:p-4 shadow-2xs transition-all duration-300 group-hover:border-primary/70 translate-z-20 overflow-hidden">
          {/* Holographic light sweep sheen */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-holographic-shine pointer-events-none" />

          <div className="relative flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                <Tag className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="font-mono text-xs font-black text-foreground truncate tracking-wide">
                  {store.popularCoupon.code}
                </span>
                <span className="rounded-md bg-primary/15 border border-primary/20 px-1.5 py-0.2 sm:px-2 sm:py-0.5 text-[9px] sm:text-[10px] font-mono font-bold text-primary shrink-0">
                  {formattedDiscount}
                </span>
              </div>
              <p className="truncate text-[10px] sm:text-[11px] text-muted-foreground mt-1">
                {formattedDescription}
              </p>
            </div>

            {/* 1-Click Tactile Copy Button */}
            <button
              type="button"
              onClick={(e) => onCopy(store.popularCoupon.code, e)}
              className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 py-2 min-h-[38px] min-w-[68px] text-xs font-bold transition-all duration-200 touch-manipulation active:scale-95 ${
                isCopied
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                  : "border border-primary/40 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-xs shadow-2xs"
              }`}
              title="Copy Coupon Code"
              aria-label={`Copy coupon code ${store.popularCoupon.code}`}
            >
              {isCopied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Row: Verification pill + Outbound Action */}
      <div className="mt-4 sm:mt-5 flex items-center justify-between border-t border-border/80 pt-3 sm:pt-4 text-xs font-medium translate-z-10">
        <span className="inline-flex items-center gap-1 font-mono text-muted-foreground text-[10px] sm:text-[11px]">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span>{store.couponsCount} active coupons</span>
        </span>

        <div className="inline-flex items-center gap-1 text-xs font-bold text-primary min-h-[36px] group-hover:underline">
          <span>{store.isInternalRoute ? "View store deals" : "Visit store"}</span>
          {store.isInternalRoute ? (
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          ) : (
            <ExternalLink className="h-3.5 w-3.5" />
          )}
        </div>
      </div>
    </div>
  );

  if (store.isInternalRoute) {
    return (
      <Link to={store.link} className="block h-full">
        {CardContent}
      </Link>
    );
  }

  return (
    <a
      href={store.link}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="block h-full"
    >
      {CardContent}
    </a>
  );
}

export default StoresPage;
