/**
 * @file src/routes/featured-deals.tsx
 * @description Permanent Global Featured Deals Hub for GoCoupon.io.
 *
 * Merchandises high-priority partner campaigns (Launch: Analytics Clouds)
 * in a clean, systematic, single-directory layout:
 * - Instant coupon copying with toast feedback
 * - Direct merchant affiliate tracking
 * - Real-time category pills with counts & instant search
 * - Zero duplicated deal cards
 * - 100% verified status & terms transparency
 * - Responsive, modern typography and clean UI design
 */

import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema } from "@/lib/seo";
import {
  FEATURED_CAMPAIGN_INFO,
  FEATURED_DEALS_COLLECTION,
  type FeaturedDealItem,
} from "@/data/featured-deals-campaign";
import {
  ShieldCheck,
  Tag,
  Copy,
  Check,
  ExternalLink,
  Search,
  ArrowRight,
  Plane,
  HeartPulse,
  Dumbbell,
  Laptop,
  GraduationCap,
  Shirt,
  Flame,
  ChevronDown,
  Info,
  CheckCircle2,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createLazyFileRoute("/featured-deals")({
  component: FeaturedDealsPage,
});

const CATEGORY_TABS = [
  { id: "all", label: "All Deals", icon: Flame },
  { id: "Travel", label: "Travel", icon: Plane },
  { id: "Health", label: "Health", icon: HeartPulse },
  { id: "Nutrition", label: "Nutrition", icon: Dumbbell },
  { id: "Electronics", label: "Electronics", icon: Laptop },
  { id: "Perfumes", label: "Perfumes", icon: Tag },
  { id: "Fashion", label: "Fashion", icon: Shirt },
  { id: "Education", label: "Education", icon: GraduationCap },
  { id: "Beauty", label: "Beauty", icon: Tag },
];

const FAQS = [
  {
    q: "What are Featured Deals on GoCoupon?",
    a: "Featured Deals are handpicked promotional campaigns curated directly in partnership with verified brand networks. Every offer on this page is tested and verified by admins for active coupon codes and working merchant links.",
  },
  {
    q: "How do I redeem a featured coupon code?",
    a: "Simply click 'Copy' on any offer card to copy the discount code to your clipboard. Then click 'Get Deal' to open the merchant's official checkout page in a new tab, and paste your code into the coupon/promo box before making payment.",
  },
  {
    q: "Are these deals valid for shoppers in India?",
    a: "Yes. All offers in the current Featured Partner Campaign are verified for India-eligible customers, with payments supported in Indian Rupees (INR) across UPI, cards, and net banking.",
  },
  {
    q: "How are Featured Deals verified?",
    a: "All Featured Deals are manually configured, tested, and published by GoCoupon administrators. Coupons and direct checkout links are guaranteed active and ready for immediate redemption without pending verification delays.",
  },
];

function DealBrandLogo({ brandName, logoUrl }: { brandName: string; logoUrl?: string }) {
  const [imgError, setImgError] = useState(false);
  const initials = brandName.slice(0, 2).toUpperCase();

  if (logoUrl && !imgError) {
    return (
      <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-white p-1 sm:p-1.5 shadow-2xs group-hover:border-primary/40 transition-colors overflow-hidden">
        <img
          src={logoUrl}
          alt={`${brandName} logo`}
          className="h-full w-full object-contain"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/40 font-display text-sm sm:text-base font-bold text-foreground group-hover:border-primary/40 transition-colors">
      {initials}
    </div>
  );
}

function mapDealToFeaturedItem(d: any, index: number): FeaturedDealItem {
  const priority = d.featuredPriority !== undefined ? Number(d.featuredPriority) : index + 1;
  const isTop = priority <= 6;
  return {
    id: d.id,
    brandName: d.storeName || d.title,
    brandSlug: d.storeSlug || (d.storeName || "brand").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    campaignId: d.campaignSource ? `${d.campaignSource}-${d.id}` : d.id,
    category: (d.category as any) || "General",
    couponCode: d.code || "",
    discountText: d.discount || (d.code ? "Special Discount" : "Exclusive Deal"),
    subTitle: d.description || d.title,
    merchantUrl: d.merchantUrl || d.url || d.link || "https://gocoupon.io",
    affiliateUrl: d.affiliateLink || d.link || d.url || "https://gocoupon.io",
    targetCountry: d.targetCountry || "India Eligible",
    badge: d.badge || (isTop ? "Best Saving" : "Verified Offer"),
    badgeColor: isTop ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : undefined,
    priorityLevel: priority,
    campaignSource: d.campaignSource || "analytics_clouds",
    verificationStatus: "verified",
    lastVerifiedAt: d.verifiedDate || "Today",
    terms: d.terms || "Standard merchant terms apply.",
    topPriority: isTop,
    logoUrl: d.logoUrl || d.storeLogo || d.logo || d.image || undefined,
  };
}

function FeaturedDealsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedTermsId, setExpandedTermsId] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [dealsList, setDealsList] = useState<FeaturedDealItem[]>(FEATURED_DEALS_COLLECTION);

  // Dynamic live fetch from /api/offers?featured=true
  useEffect(() => {
    let active = true;
    async function loadLiveFeaturedDeals() {
      try {
        const res = await fetch("/api/offers?featured=true", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          const serverItems = json.data || json.deals;
          if (Array.isArray(serverItems) && serverItems.length > 0 && active) {
            const mapped = serverItems.map((item: any, idx: number) => mapDealToFeaturedItem(item, idx));
            const seenIds = new Set(mapped.map((d: any) => d.id));
            const merged = [...mapped];
            for (const defItem of FEATURED_DEALS_COLLECTION) {
              if (!seenIds.has(defItem.id)) {
                merged.push(defItem);
              }
            }
            merged.sort((a, b) => a.priorityLevel - b.priorityLevel);
            setDealsList(merged);
          }
        }
      } catch {
        // Retain initial seeded collection
      }
    }
    loadLiveFeaturedDeals();
    return () => {
      active = false;
    };
  }, []);

  // Category counts computed systematically from dealsList
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: dealsList.length };
    for (const deal of dealsList) {
      counts[deal.category] = (counts[deal.category] || 0) + 1;
    }
    return counts;
  }, [dealsList]);

  // Unified single filtered directory (zero duplicates)
  const filteredOffers = useMemo(() => {
    return dealsList
      .filter((item) => {
        const matchesCat =
          selectedCategory === "all" ||
          item.category.toLowerCase() === selectedCategory.toLowerCase();
        const q = searchQuery.trim().toLowerCase();
        const matchesQuery =
          !q ||
          item.brandName.toLowerCase().includes(q) ||
          item.subTitle.toLowerCase().includes(q) ||
          item.couponCode.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q);
        return matchesCat && matchesQuery;
      })
      .sort((a, b) => a.priorityLevel - b.priorityLevel);
  }, [dealsList, selectedCategory, searchQuery]);

  // Copy coupon code handler
  const handleCopyCode = (item: FeaturedDealItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(item.couponCode);
    }
    setCopiedCode(item.couponCode);
    toast.success(`Coupon code ${item.couponCode} copied!`, {
      description: `Use it at ${item.brandName} checkout for ${item.discountText}.`,
    });

    // Fire custom analytics event
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: "featured_coupon_copy",
        brand_name: item.brandName,
        campaign_id: item.campaignId,
        coupon_code: item.couponCode,
        category: item.category,
        discount_value: item.discountText,
        placement: "featured_catalog",
        campaign_source: item.campaignSource,
      });
    }

    setTimeout(() => {
      setCopiedCode((current) => (current === item.couponCode ? null : current));
    }, 2500);
  };

  // Get deal redirect handler
  const handleGetDeal = (item: FeaturedDealItem) => {
    // Copy code automatically when opening deal
    if (item.couponCode) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(item.couponCode);
      }
      toast.success(`Code ${item.couponCode} auto-copied!`, {
        description: `Opening ${item.brandName} in a new tab...`,
      });
    }

    // Fire analytics event
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: "featured_get_deal_click",
        brand_name: item.brandName,
        campaign_id: item.campaignId,
        coupon_code: item.couponCode,
        category: item.category,
        discount_value: item.discountText,
        campaign_source: item.campaignSource,
      });
    }

    window.open(item.affiliateUrl || item.merchantUrl, "_blank", "noopener,noreferrer");
  };

  const hasActiveFilters = selectedCategory !== "all" || Boolean(searchQuery.trim());

  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Featured Deals", path: "/featured-deals" },
  ]);

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* ── 1. Clean Systematic Header (Mobile Compact + Desktop Rich) ──── */}
      <section className="border-b border-border/80 bg-card/40 px-3.5 py-3 sm:px-6 sm:py-6">
        <div className="mx-auto max-w-6xl">
          {/* Mobile Ultra-Compact Header (Takes ~40px total, zero wasted space) */}
          <div className="flex sm:hidden items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold text-primary">
                <Tag className="h-2.5 w-2.5 text-primary" />
                <span className="uppercase tracking-wider">India Hub</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Verified</span>
              </div>
              <h1 className="font-display text-base font-extrabold tracking-tight text-foreground truncate mt-0.5">
                Featured Deals &amp; Coupons
              </h1>
            </div>
            <div className="shrink-0 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 shadow-2xs">
              <div className="font-display text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>{dealsList.length} Live</span>
              </div>
            </div>
          </div>

          {/* Desktop Spacious Header */}
          <div className="hidden sm:flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold text-primary">
                <Tag className="h-3 w-3 text-primary" />
                <span className="uppercase tracking-wider">{FEATURED_CAMPAIGN_INFO.partnerBadge}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Hand-Verified</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
                Featured Deals &amp; Exclusive Coupons
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                Handpicked verified promo codes from partner brands. Copy code directly and claim instant savings at official merchant checkout.
              </p>
            </div>

            {/* Quick Trust Metrics Strip */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <div className="rounded-xl border border-border bg-card px-4 py-2.5 shadow-2xs">
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Active Catalog</div>
                <div className="font-display text-base font-bold text-foreground">
                  {dealsList.length} Partner Deals
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card px-4 py-2.5 shadow-2xs">
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Verification</div>
                <div className="font-display text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>100% Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Unified Systematic Catalog (Zero Duplicates) ────────────────── */}
      <section id="featured-catalog" className="px-3.5 py-3 sm:px-6 sm:py-8 pb-28 sm:pb-16">
        <div className="mx-auto max-w-6xl">
          {/* Controls: Search + Counter in compact layout */}
          <div className="flex flex-col gap-2.5 sm:gap-4 md:flex-row md:items-center md:justify-between pb-3 sm:pb-5 border-b border-border/70">
            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search brand, category, code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-card py-2 sm:py-2.5 pl-8 sm:pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground cursor-pointer rounded-md hover:bg-muted"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Active Filter Counter & Reset */}
            <div className="flex items-center justify-between md:justify-end gap-2 font-mono text-[11px] sm:text-xs text-muted-foreground">
              <span>
                Showing <strong className="text-foreground">{filteredOffers.length}</strong> of{" "}
                <strong className="text-foreground">{dealsList.length}</strong> verified offers
              </span>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchQuery("");
                  }}
                  className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-primary hover:underline font-semibold cursor-pointer"
                >
                  <X className="h-3 w-3" />
                  <span>Reset filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills with Item Counts */}
          <div className="pt-2.5 sm:pt-4 pb-1 sm:pb-2 flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none">
            {CATEGORY_TABS.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              const count = categoryCounts[cat.id] ?? 0;

              // Don't show pills for categories with 0 items unless it's "all"
              if (cat.id !== "all" && count === 0) return null;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-xl px-2.5 py-1.5 sm:px-3.5 sm:py-2 font-mono text-[11px] sm:text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-xs font-bold"
                      : "border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span>{cat.label}</span>
                  <span
                    className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[9px] sm:text-[10px] ${
                      isSelected
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Unified Deals Grid (Every deal appears exactly ONCE) */}
          {filteredOffers.length > 0 ? (
            <div className="mt-3.5 sm:mt-6 grid gap-3.5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredOffers.map((item) => {
                const isCopied = copiedCode === item.couponCode;

                return (
                  <div
                    key={item.id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 sm:p-6 shadow-2xs transition-all duration-200 hover:border-primary/40 hover:shadow-md"
                  >
                    <div>
                      {/* Top Row: Brand & Category + Badge */}
                      <div className="flex items-start justify-between gap-2.5 sm:gap-3">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <DealBrandLogo brandName={item.brandName} logoUrl={item.logoUrl} />
                          <div className="min-w-0">
                            <h3 className="truncate font-display text-sm sm:text-base font-bold text-foreground">
                              {item.brandName}
                            </h3>
                            <span className="font-mono text-[11px] sm:text-xs text-muted-foreground">
                              {item.category}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] sm:text-[11px] font-semibold ${
                            item.badgeColor || "bg-primary/10 text-primary border-primary/20"
                          }`}
                        >
                          {item.badge}
                        </span>
                      </div>

                      {/* Discount Headline */}
                      <div className="mt-3 sm:mt-4">
                        <div className="font-display text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
                          {item.discountText}
                        </div>
                        <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-2">
                          {item.subTitle}
                        </p>
                      </div>

                      {/* Coupon Code Block */}
                      <div className="mt-3 sm:mt-4 rounded-xl border border-dashed border-border/90 bg-muted/30 p-2.5 sm:p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground block">
                              Coupon Code
                            </span>
                            <span className="font-mono text-xs sm:text-sm md:text-base font-bold tracking-wider text-foreground select-all truncate block">
                              {item.couponCode}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleCopyCode(item, e)}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-1.5 font-mono text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                              isCopied
                                ? "bg-emerald-600 text-white"
                                : "bg-primary text-primary-foreground hover:opacity-90 active:scale-95"
                            }`}
                          >
                            {isCopied ? (
                              <>
                                <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Card Bottom CTA & Metadata */}
                    <div className="mt-3.5 pt-3 sm:mt-5 sm:pt-4 border-t border-border/60">
                      <button
                        type="button"
                        onClick={() => handleGetDeal(item)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2 sm:py-2.5 text-xs font-bold text-background shadow-xs transition-all hover:bg-foreground/90 active:scale-98 cursor-pointer"
                      >
                        <span>Get Deal</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>

                      <div className="mt-2.5 sm:mt-3 flex items-center justify-between font-mono text-[10px] sm:text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          {item.targetCountry}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedTermsId(expandedTermsId === item.id ? null : item.id)
                          }
                          className="hover:text-foreground underline underline-offset-2 cursor-pointer transition-colors"
                        >
                          {expandedTermsId === item.id ? "Hide Terms" : "Terms apply"}
                        </button>
                      </div>

                      {/* Expandable Terms */}
                      {expandedTermsId === item.id && (
                        <div className="mt-2 rounded-lg border border-border bg-background p-2.5 text-[11px] text-muted-foreground leading-relaxed animate-in fade-in duration-150">
                          {item.terms}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty Filter State */
            <div className="mt-12 rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
              <Info className="mx-auto h-8 w-8 text-muted-foreground" />
              <h3 className="mt-3 font-display text-lg font-bold text-foreground">
                No featured offers found
              </h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                No deals matched your search &ldquo;{searchQuery}&rdquo; in category &ldquo;{selectedCategory}&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 cursor-pointer"
              >
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── 3. How to Redeem (4 Step Process) ──────────────────────────────── */}
      <section className="border-t border-border bg-muted/20 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Simple 4-Step Process
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              How to Use a Featured Coupon
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Follow these simple steps to ensure your savings are successfully applied at checkout.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-mono text-sm font-bold text-primary-foreground">
                01
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-foreground">
                Choose an Offer
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Browse our curated categories to select the offer matching your shopping needs.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-mono text-sm font-bold text-primary-foreground">
                02
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-foreground">
                Copy the Code
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Click &ldquo;Copy&rdquo; on any card to instantly save the promo voucher to your clipboard.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-mono text-sm font-bold text-primary-foreground">
                03
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-foreground">
                Click Get Deal
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Open the official merchant store directly in a secure new tab with verified tracking.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-mono text-sm font-bold text-primary-foreground">
                04
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-foreground">
                Apply at Checkout
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Paste the coupon in the cart promotion box and watch your payable order amount drop!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Verification & Trust Policy ─────────────────────────────────── */}
      <section className="border-t border-border px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-2xl border border-border/80 bg-card p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <ShieldCheck className="h-6 w-6 text-emerald-500 shrink-0 mt-1" />
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">
                Offer Verification &amp; Merchandising Policy
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                GoCoupon&apos;s Featured Deals collection brings together selected coupon codes and promotional
                offers from trusted brand networks. Each offer is organized by category and designed to help shoppers
                find savings faster. Before publishing, offers are checked for merchant availability, coupon details,
                and destination-link accuracy. Brand logos and trademarks remain the property of their respective owners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Frequently Asked Questions (Accordion) ─────────────────────── */}
      <section className="border-t border-border bg-muted/10 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Everything you need to know about featured merchant partner offers.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={faq.q}
                  className="rounded-xl border border-border bg-card transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-4 text-left font-display text-sm font-semibold text-foreground cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-border/60 px-4 pb-4 pt-3 text-xs leading-relaxed text-muted-foreground">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 6. Final CTA Banner ────────────────────────────────────────────── */}
      <section className="border-t border-border bg-gradient-to-b from-card to-background px-4 py-16 text-center sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Looking for More Store Discounts?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Explore 970+ live everyday deals, trending coupons, and store-specific promos across Flipkart,
            Amazon, Myntra, Swiggy, and 240+ retail partners.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/offers"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90"
            >
              <span>Explore All Live Offers</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/stores"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-xs font-semibold text-foreground shadow-2xs hover:bg-muted/50"
            >
              <span>Browse All 200+ Stores</span>
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
