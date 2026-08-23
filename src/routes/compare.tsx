/**
 * @file compare.tsx
 * @description Live Multi-Store Product Price, Metadata & Coupon Comparison Engine.
 */

import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import { CANONICAL_PRODUCTS } from "@/data/canonicalCatalogData";
import { UrlResolverSearch } from "@/components/shopping/UrlResolverSearch";
import { ProductHeroCard } from "@/components/shopping/ProductHeroCard";
import { resolveLiveUrlAndCompetitors, type LiveProductResolution } from "@/lib/services/url-metadata-extractor";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Tag,
  Layers,
  TrendingDown,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/compare")({
  component: ComparePage,
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) || "",
    url: (search.url as string) || "",
  }),
  head: () =>
    createSeoHead({
      title: "Live Price Comparison India – Compare Amazon, Flipkart & Croma in 1-Click",
      description:
        "Compare live prices, stackable coupons, delivery fees, and cashback across Amazon, Flipkart, Myntra, Croma, and Tata CLiQ with goCoupon's instant comparison engine.",
      path: "/compare",
      keywords:
        "price comparison india, amazon vs flipkart price, compare electronics price india, best online deals india, multi store price tracker",
    }),
});

const CATEGORIES = ["All", "Electronics", "Fashion", "Beauty", "Home"] as const;

function ComparePage() {
  const { q, url } = useSearch({ from: "/compare" });
  const activeSearchParam = url || q || "";

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState(activeSearchParam);
  const [liveResolution, setLiveResolution] = useState<LiveProductResolution | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // When search query is provided via URL params, automatically extract live metadata
  useEffect(() => {
    if (activeSearchParam.trim()) {
      setSearchQuery(activeSearchParam);
      runLiveExtraction(activeSearchParam.trim());
    }
  }, [activeSearchParam]);

  const runLiveExtraction = async (queryOrUrl: string) => {
    setIsExtracting(true);
    try {
      const result = await resolveLiveUrlAndCompetitors(queryOrUrl);
      setLiveResolution(result);
    } catch {
      toast.error("Unable to extract live metadata. Showing verified catalog.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    toast.success(`Copied coupon: ${code}`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const filteredProducts = useMemo(() => {
    return CANONICAL_PRODUCTS.filter((product) => {
      const matchesCat = selectedCategory === "All" || product.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Compare", path: "/compare" },
  ]);

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* Hero Header */}
      <section className="relative border-b border-border px-6 pb-14 pt-16 sm:pt-24">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 font-mono text-xs uppercase tracking-[0.2em] text-primary">
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            Live Cross-Merchant Comparison Matrix
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
            Never Overpay. Compare All Stores in Seconds.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg text-balance">
            Paste any product link from Amazon, Flipkart, Myntra, Croma, or Tata CLiQ to extract live pricing and discover the cheapest store with active coupons.
          </p>

          {/* URL Resolver & Search Box */}
          <div className="mx-auto mt-8 max-w-2xl">
            <UrlResolverSearch
              size="large"
              placeholder="Paste Amazon / Flipkart / Myntra URL or search any product…"
            />
          </div>
        </div>
      </section>

      {/* Live Extraction & Comparison Result (If active query exists) */}
      {isExtracting && (
        <section className="px-4 sm:px-6 py-10">
          <div className="mx-auto max-w-5xl rounded-3xl border border-border bg-card p-8 sm:p-12 text-center shadow-lg animate-pulse space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Loader2 className="h-7 w-7 animate-spin" aria-hidden="true" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">
              Extracting live product metadata and scanning Indian shopping stores…
            </h3>
            <p className="text-xs font-mono text-muted-foreground">
              Parsing JSON-LD schema &bull; Scraping competitor prices on Amazon, Flipkart, Myntra, Croma &bull; Stacking coupons
            </p>
          </div>
        </section>
      )}

      {!isExtracting && liveResolution && liveResolution.found && (
        <section className="px-4 sm:px-6 py-10 border-b border-border/80 bg-muted/10">
          <div className="mx-auto max-w-5xl space-y-8 animate-fade-in">
            {/* Live Extracted Product Hero Banner */}
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col md:flex-row items-start gap-6">
                {liveResolution.metadata.imageUrl ? (
                  <img
                    src={liveResolution.metadata.imageUrl}
                    alt={liveResolution.metadata.title}
                    width={140}
                    height={140}
                    className="h-36 w-36 shrink-0 rounded-2xl object-cover border border-border bg-muted"
                  />
                ) : (
                  <div className="h-36 w-36 shrink-0 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground font-mono text-xs">
                    Live Product
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                      {liveResolution.metadata.storeName}
                    </span>
                    <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 font-mono text-xs font-bold text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Live Extracted via Cheerio + SerpAPI
                    </span>
                  </div>

                  <h2 className="mt-2 font-display text-xl sm:text-2xl font-bold text-foreground leading-snug">
                    {liveResolution.metadata.title}
                  </h2>

                  <div className="mt-4 flex flex-wrap items-baseline gap-4">
                    {liveResolution.metadata.price > 0 && (
                      <div>
                        <span className="font-mono text-xs text-muted-foreground block">Pasted Store Price:</span>
                        <span className="font-display text-2xl font-bold text-foreground tabular-nums">
                          ₹{liveResolution.metadata.price.toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}

                    {liveResolution.bestDeal && (
                      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2">
                        <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                          Lowest Market Deal Available:
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                            ₹{liveResolution.bestDeal.effectiveNetPrice.toLocaleString("en-IN")}
                          </span>
                          <span className="font-mono text-xs font-bold text-foreground">
                            on {liveResolution.bestDeal.storeName}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Comparison Store Matrix */}
            <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xl">
              <div className="border-b border-border bg-muted/30 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-emerald-500 uppercase tracking-wider">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    Live Multi-Store Verification
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Comparing {liveResolution.competitors.length} Verified Stores in India
                  </h3>
                </div>

                {liveResolution.maxSavings > 0 && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5">
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      Save up to ₹{liveResolution.maxSavings.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-border">
                {liveResolution.competitors.map((row, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 transition-colors hover:bg-muted/30 ${
                      row.isBestDeal ? "bg-emerald-500/5 dark:bg-emerald-950/10" : ""
                    }`}
                  >
                    {/* Store Info */}
                    <div className="flex items-center gap-3 min-w-[180px]">
                      {row.storeLogo && (
                        <img
                          src={row.storeLogo}
                          alt={row.storeName}
                          width={28}
                          height={28}
                          className="h-7 w-7 rounded-lg border border-border bg-card p-0.5 object-contain"
                        />
                      )}
                      <div>
                        <span className="font-display text-sm font-bold text-foreground block">
                          {row.storeName}
                        </span>
                        {row.isBestDeal && (
                          <span className="rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 font-mono text-[10px] font-bold">
                            ★ BEST DEAL
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Coupons & Cashback */}
                    <div className="flex flex-wrap items-center gap-2">
                      {row.bestCouponCode ? (
                        <button
                          type="button"
                          onClick={() => handleCopy(row.bestCouponCode!)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-xs font-bold text-primary hover:bg-primary/20 transition-colors touch-manipulation"
                          aria-label={`Copy coupon ${row.bestCouponCode}`}
                        >
                          <Tag className="h-3 w-3" aria-hidden="true" />
                          <span>{row.bestCouponCode}</span>
                          {copiedCode === row.bestCouponCode ? (
                            <Check className="h-3 w-3 text-emerald-500" aria-hidden="true" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                          )}
                          <span className="text-emerald-500 tabular-nums">(-₹{row.couponSavings})</span>
                        </button>
                      ) : (
                        <span className="font-mono text-xs text-muted-foreground">Standard pricing</span>
                      )}

                      <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                        {row.cashbackRate} Cashback (~₹{row.cashbackAmount})
                      </span>
                    </div>

                    {/* Final Net Price & CTA */}
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="font-mono text-[10px] text-muted-foreground block">Effective Net Price:</span>
                        <div className="flex items-baseline gap-2 justify-end">
                          {row.price > row.effectiveNetPrice && (
                            <span className="font-mono text-xs text-muted-foreground line-through tabular-nums">
                              ₹{row.price.toLocaleString("en-IN")}
                            </span>
                          )}
                          <span className="font-display text-xl font-bold text-primary tabular-nums">
                            ₹{row.effectiveNetPrice.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      <a
                        href={row.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2.5 min-h-[40px] text-xs font-bold text-primary-foreground shadow-xs hover:scale-105 active:scale-95 transition-transform touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <span>Shop</span>
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Catalog Comparison Feed */}
      <section className="px-4 sm:px-6 py-12 sm:py-16 pb-28 sm:pb-20">
        <div className="mx-auto max-w-7xl">
          {/* Controls Bar */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all touch-manipulation ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <span className="font-mono text-xs text-muted-foreground">
              Showing {filteredProducts.length} verified canonical items
            </span>
          </div>

          {/* Products Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductHeroCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Smart Price Guarantee */}
      <section className="border-t border-border bg-muted/20 px-6 py-16">
        <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-8 sm:p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl text-balance">
            How goCoupon Calculates the True Net Price
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm text-muted-foreground leading-relaxed text-balance">
            Unlike basic price checkers that only check the sticker tag, goCoupon factors in merchant delivery charges, instant bank promo codes, active merchant coupons, and goCoupon cashback to calculate the true final checkout price.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
