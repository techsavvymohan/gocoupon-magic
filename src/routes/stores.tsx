import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import { STORES_DATA, type Store } from "@/data/storesData";
import { Search, Store as StoreIcon, Tag, Sparkles, ExternalLink, ArrowRight, Check, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/stores")({
  component: StoresPage,
  head: () =>
    createSeoHead({
      title: "All Stores & Brands Coupons Directory – goCoupon",
      description:
        "Browse verified coupon codes, discounts, and cashback offers across 25+ top Indian online shopping stores including Flipkart, Amazon, Myntra, Meesho, Nykaa, and Swiggy.",
      path: "/stores",
      keywords:
        "all stores coupons, indian online store deals, flipkart amazon myntra coupons, store directory, brand promo codes india",
    }),
});

const CATEGORIES = ["All", "General", "Fashion", "Electronics", "Food", "Travel", "Beauty", "Home"] as const;

function StoresPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredStores = useMemo(() => {
    return STORES_DATA.filter((store) => {
      const matchesSearch =
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.popularCoupon.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || store.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleCopy = (code: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied to clipboard!`);
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

      {/* Hero Section */}
      <section className="relative border-b border-border px-6 pb-16 pt-20 sm:pt-28">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 font-mono text-xs uppercase tracking-[0.2em] text-primary">
            <StoreIcon className="h-3.5 w-3.5" />
            Merchant Directory
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Verified Coupons for Top Indian Stores
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Explore active discount codes, promo vouchers, and cashback rates across India's most popular online shopping portals.
          </p>

          {/* Search & Filter Controls */}
          <div className="mx-auto mt-8 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by store name, category, or coupon..."
                className="w-full rounded-full border border-border bg-card py-3.5 pl-12 pr-4 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground hover:text-foreground"
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

      {/* Stores Grid */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-foreground">
              Showing {filteredStores.length} {filteredStores.length === 1 ? "Store" : "Stores"}
            </h2>
            <span className="font-mono text-xs text-muted-foreground">
              Updated hourly • Auto-tested
            </span>
          </div>

          {filteredStores.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center">
              <p className="text-base text-muted-foreground">No stores found matching &ldquo;{searchQuery}&rdquo;.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStores.map((store) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  onCopy={handleCopy}
                  isCopied={copiedCode === store.popularCoupon.code}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Extension Promotion Banner */}
      <section className="border-t border-border bg-muted/20 px-6 py-16">
        <div className="mx-auto max-w-5xl rounded-3xl border border-border bg-card p-8 sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Never Copy Codes Manually
              </div>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Tired of searching for coupons across every store?
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Install the free goCoupon Chrome extension. Whenever you reach checkout on any of these stores,
                goCoupon automatically finds and applies the highest saving coupon in 1 click.
              </p>
              <div className="mt-6">
                <Link
                  to="/extension"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-105"
                >
                  <span>Get the Extension — Free</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-background p-6">
              <div className="font-mono text-xs text-muted-foreground">Supported Stores Count</div>
              <div className="mt-2 font-display text-4xl font-bold text-foreground">25+</div>
              <p className="mt-2 text-xs text-muted-foreground">
                Flipkart, Amazon, Myntra, Meesho, AJIO, Nykaa, Tata CLiQ, Swiggy, Zomato, and more added weekly.
              </p>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function StoreCard({
  store,
  onCopy,
  isCopied,
}: {
  store: Store;
  onCopy: (code: string, e: React.MouseEvent) => void;
  isCopied: boolean;
}) {
  const CardContent = (
    <article className="group relative flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-background p-1.5 overflow-hidden">
              {store.logo ? (
                <img
                  src={store.logo}
                  alt={`${store.name} logo`}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              ) : (
                <span className="text-2xl">{store.fallbackIcon}</span>
              )}
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                {store.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{store.category}</span>
                <span>•</span>
                <span className="text-emerald-500 font-medium">{store.cashbackRate} Cashback</span>
              </div>
            </div>
          </div>

          {store.badge && (
            <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] font-medium text-primary">
              {store.badge}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {store.description}
        </p>

        {/* Popular Coupon Preview Box */}
        <div className="mt-4 rounded-xl border border-border/80 bg-muted/40 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="inline-block font-mono text-xs font-bold text-foreground">
                {store.popularCoupon.code}
              </span>
              <p className="truncate text-[11px] text-muted-foreground">
                {store.popularCoupon.description}
              </p>
            </div>
            <button
              onClick={(e) => onCopy(store.popularCoupon.code, e)}
              className="inline-flex shrink-0 items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              title="Copy Coupon Code"
            >
              {isCopied ? (
                <>
                  <Check className="h-3 w-3" />
                  <span>Copied</span>
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

      {/* Footer Info */}
      <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs font-medium">
        <span className="font-mono text-muted-foreground">
          {store.couponsCount} active coupons
        </span>
        <div className="inline-flex items-center gap-1 text-primary group-hover:underline">
          <span>{store.isInternalRoute ? "View store deals" : "Visit store"}</span>
          {store.isInternalRoute ? (
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          ) : (
            <ExternalLink className="h-3.5 w-3.5" />
          )}
        </div>
      </div>
    </article>
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
      rel="noopener noreferrer"
      className="block h-full"
    >
      {CardContent}
    </a>
  );
}
