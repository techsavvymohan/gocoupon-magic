/**
 * @file src/routes/featured-deals.tsx
 * @description Permanent Global Featured Deals Hub for GoCoupon.io.
 *
 * Merchandises high-priority partner campaigns (Launch: Analytics Clouds)
 * with instant coupon copying, direct merchant tracking, category filters,
 * verification status badges, and SEO metadata.
 *
 * Strictly adheres to clean, premium UI design:
 * - Sharp typography
 * - Zero sparkle icons
 * - Clear merchant terms & trust indicators
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
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
  Filter,
  ArrowRight,
  Clock,
  Globe,
  Plane,
  HeartPulse,
  Dumbbell,
  Laptop,
  GraduationCap,
  Shirt,
  Flame,
  HelpCircle,
  ChevronDown,
  Info,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/featured-deals")({
  component: FeaturedDealsPage,
  head: () =>
    createSeoHead({
      title: "Featured Deals & Exclusive Coupons | GoCoupon",
      description:
        "Discover handpicked featured deals, verified coupon codes and exclusive savings from trusted brands worldwide. Shop smarter with GoCoupon.",
      path: "/featured-deals",
      keywords:
        "featured deals, verified coupon codes, exclusive discount offers, partner deals, best online discounts, India coupon offers, international coupon deals, working promo codes",
    }),
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
    a: "Featured Deals are handpicked promotional campaigns curated directly in partnership with verified brand networks like Analytics Clouds. Every offer on this page undergoes manual merchant link verification and active coupon code validation.",
  },
  {
    q: "How do I redeem a featured coupon code?",
    a: "Simply click 'Copy Code' on any offer card to copy the discount code to your clipboard. Then click 'Get Deal' to open the merchant's official checkout page in a new tab, and paste your code into the coupon/promo box before making payment.",
  },
  {
    q: "Are these deals valid for shoppers in India?",
    a: "Yes. All offers in the current Featured Partner Campaign are verified for India-eligible customers, with payments supported in Indian Rupees (INR) across UPI, cards, and net banking.",
  },
  {
    q: "Why do some offers show 'Pending Verification'?",
    a: "GoCoupon upholds strict zero-deception standards. If a partner merchant URL or discount rate is being updated by the brand, we label it as 'Pending Verification' or 'Offer Details Being Verified' until 100% verified.",
  },
];

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
    badge: d.badge || (isTop ? "Best Saving" : "Featured Partner"),
    badgeColor: isTop ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : undefined,
    priorityLevel: priority,
    campaignSource: d.campaignSource || "analytics_clouds",
    verificationStatus: (d.verificationStatus as any) || (d.verified ? "verified" : "pending_verification"),
    lastVerifiedAt: d.verifiedDate || "Today",
    terms: d.terms || "Standard merchant terms apply.",
    topPriority: isTop,
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
            mapped.sort((a, b) => a.priorityLevel - b.priorityLevel);
            setDealsList(mapped);
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

  // Top 6 priority offers
  const topPriorityOffers = useMemo(() => {
    const priorityItems = dealsList.filter((d) => d.topPriority || d.priorityLevel <= 6);
    return (priorityItems.length > 0 ? priorityItems.slice(0, 6) : dealsList.slice(0, 6)).sort(
      (a, b) => a.priorityLevel - b.priorityLevel
    );
  }, [dealsList]);

  // Filtered complete directory
  const filteredDirectoryOffers = useMemo(() => {
    return dealsList.filter((item) => {
      const matchesCat =
        selectedCategory === "all" || item.category.toLowerCase() === selectedCategory.toLowerCase();
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.brandName.toLowerCase().includes(q) ||
        item.subTitle.toLowerCase().includes(q) ||
        item.couponCode.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    }).sort((a, b) => a.priorityLevel - b.priorityLevel);
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
        placement: item.topPriority ? "top_priority_grid" : "directory_grid",
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
    if (item.couponCode && item.verificationStatus !== "pending_verification") {
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

      {/* ── 1. Hero Section ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-card/80 via-background to-background px-4 pb-14 pt-16 sm:px-6 sm:pb-20 sm:pt-24">
        <div className="mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-widest text-primary shadow-xs">
            <Tag className="h-3.5 w-3.5 text-primary" />
            Curated Merchandising Hub
          </div>

          <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl sm:leading-[1.15]">
            Featured Deals. Bigger Savings.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Discover handpicked offers, verified coupon codes and exclusive savings from trusted
            brands worldwide.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href="#top-offers"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-md transition-all hover:opacity-95 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Explore Top Offers</span>
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#all-deals"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground shadow-xs transition-all hover:bg-muted/50 hover:border-border/80"
            >
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span>Browse All Deals</span>
            </a>
          </div>

          {/* Trust / Value Strip */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 border-t border-border/60 pt-6 font-mono text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Verified offers
            </span>
            <span className="hidden text-border sm:inline">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-sky-500" />
              Direct merchant links
            </span>
            <span className="hidden text-border sm:inline">•</span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-indigo-500" />
              Easy coupon redemption
            </span>
          </div>
        </div>
      </section>

      {/* ── 2. Featured Partner Campaign Showcase ─────────────────────────── */}
      <section className="border-b border-border bg-muted/20 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-primary">
                  {FEATURED_CAMPAIGN_INFO.partnerBadge}
                </div>
                <h2 className="mt-2.5 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {FEATURED_CAMPAIGN_INFO.campaignName}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {FEATURED_CAMPAIGN_INFO.campaignSubtitle} Copy your coupon code and shop directly
                  from the official merchant website.
                </p>
              </div>
              <div className="shrink-0">
                <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-center sm:text-right">
                  <div className="font-mono text-xs text-muted-foreground">Campaign Status</div>
                  <div className="mt-0.5 font-display text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    Live &amp; Verified Today
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Top Priority Offers (Top 6) ─────────────────────────────────── */}
      <section id="top-offers" className="border-b border-border px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
                <Flame className="h-3.5 w-3.5 text-primary" />
                Handpicked Savings
              </div>
              <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Top Featured Offers
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Highest-converting promo codes with immediate checkout eligibility.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {topPriorityOffers.map((item) => {
              const isCopied = copiedCode === item.couponCode;
              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <div>
                    {/* Top Row: Brand & Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/50 font-display text-base font-bold text-foreground group-hover:border-primary/40">
                          {item.brandName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate font-display text-lg font-bold text-foreground">
                            {item.brandName}
                          </h3>
                          <span className="font-mono text-xs text-muted-foreground">
                            {item.category}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-semibold ${
                          item.badgeColor || "bg-primary/10 text-primary border-primary/20"
                        }`}
                      >
                        {item.badge}
                      </span>
                    </div>

                    {/* Discount Headline */}
                    <div className="mt-5">
                      <div className="font-display text-3xl font-extrabold tracking-tight text-foreground">
                        {item.discountText}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {item.subTitle}
                      </p>
                    </div>

                    {/* Coupon Code Block */}
                    <div className="mt-5 rounded-xl border border-dashed border-border/90 bg-muted/30 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="font-mono text-[10px] uppercase text-muted-foreground block">
                            Coupon Code
                          </span>
                          <span className="font-mono text-base font-bold tracking-wider text-foreground select-all">
                            {item.couponCode}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleCopyCode(item, e)}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-all cursor-pointer ${
                            isCopied
                              ? "bg-emerald-600 text-white"
                              : "bg-primary text-primary-foreground hover:opacity-90 active:scale-95"
                          }`}
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

                  {/* Card Bottom CTA & Metadata */}
                  <div className="mt-6 pt-4 border-t border-border/60">
                    <button
                      type="button"
                      onClick={() => handleGetDeal(item)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-xs font-bold text-background shadow-xs transition-all hover:bg-foreground/90 active:scale-98 cursor-pointer"
                    >
                      <span>Get Deal</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>

                    <div className="mt-3 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        {item.targetCountry}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedTermsId(expandedTermsId === item.id ? null : item.id)
                        }
                        className="hover:text-foreground underline underline-offset-2 cursor-pointer"
                      >
                        Terms apply
                      </button>
                    </div>

                    {/* Expandable Terms */}
                    {expandedTermsId === item.id && (
                      <div className="mt-3 rounded-lg border border-border bg-background p-2.5 text-[11px] text-muted-foreground leading-relaxed">
                        {item.terms}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. Complete Directory with Filters ─────────────────────────────── */}
      <section id="all-deals" className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between pb-8">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
                <Globe className="h-3.5 w-3.5 text-primary" />
                Directory Catalog
              </div>
              <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                All Featured Partner Offers
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Showing {filteredDirectoryOffers.length} handpicked offers sorted by verified campaign
                priority.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search brand, category, code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
            {CATEGORY_TABS.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 font-mono text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-xs font-bold"
                      : "border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Offers Grid */}
          {filteredDirectoryOffers.length > 0 ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDirectoryOffers.map((item) => {
                const isCopied = copiedCode === item.couponCode;
                const isHold = item.verificationStatus === "pending_verification";
                const isCheckingTerms = item.verificationStatus === "verifying_terms";

                return (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all hover:border-border hover:shadow-sm"
                  >
                    <div>
                      {/* Brand Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40 font-display text-sm font-bold text-foreground">
                            {item.brandName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate font-display text-base font-bold text-foreground">
                              {item.brandName}
                            </h3>
                            <span className="font-mono text-xs text-muted-foreground">
                              {item.category}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold ${
                            item.badgeColor || "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {item.badge}
                        </span>
                      </div>

                      {/* Discount info */}
                      <div className="mt-4">
                        <div className="font-display text-2xl font-bold tracking-tight text-foreground">
                          {item.discountText}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {item.subTitle}
                        </p>
                      </div>

                      {/* Code Box */}
                      <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/20 p-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="font-mono text-[9px] uppercase text-muted-foreground block">
                              Promo Code
                            </span>
                            <span className="font-mono text-sm font-bold tracking-wider text-foreground select-all truncate block">
                              {item.couponCode}
                            </span>
                          </div>

                          <button
                            type="button"
                            disabled={isHold}
                            onClick={(e) => handleCopyCode(item, e)}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-mono text-[11px] font-bold transition-all cursor-pointer ${
                              isHold
                                ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                                : isCopied
                                ? "bg-emerald-600 text-white"
                                : "bg-primary text-primary-foreground hover:opacity-90 active:scale-95"
                            }`}
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

                    {/* Actions & Verification */}
                    <div className="mt-5 pt-3 border-t border-border/50">
                      {isHold ? (
                        <div className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Link Pending Partner Verification</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleGetDeal(item)}
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-foreground px-3 py-2 text-xs font-bold text-background shadow-2xs transition-all hover:bg-foreground/90 active:scale-98 cursor-pointer"
                        >
                          <span>Get Deal</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      )}

                      <div className="mt-2.5 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                        <span>{item.targetCountry}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedTermsId(expandedTermsId === item.id ? null : item.id)
                          }
                          className="hover:text-foreground underline cursor-pointer"
                        >
                          Terms
                        </button>
                      </div>

                      {expandedTermsId === item.id && (
                        <div className="mt-2 rounded-lg border border-border bg-background p-2 text-[10px] text-muted-foreground leading-normal">
                          {item.terms}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-12 rounded-2xl border border-dashed border-border p-12 text-center">
              <Info className="mx-auto h-8 w-8 text-muted-foreground" />
              <h3 className="mt-3 font-display text-lg font-bold text-foreground">
                No featured offers found
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Try selecting &ldquo;All Deals&rdquo; or clearing your search term.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── 5. How to Redeem (4 Step Process) ──────────────────────────────── */}
      <section className="border-t border-border bg-muted/20 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Simple 4-Step Process
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How to Use a Featured Coupon
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Follow these simple steps to ensure your savings are successfully applied at checkout.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                Click &ldquo;Copy Code&rdquo; on the card to instantly save the promo voucher to your clipboard.
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

      {/* ── 6. Verification & Terms Notice ─────────────────────────────────── */}
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

      {/* ── 7. Frequently Asked Questions (Accordion) ─────────────────────── */}
      <section className="border-t border-border bg-muted/10 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
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

      {/* ── 8. Final CTA Banner ────────────────────────────────────────────── */}
      <section className="border-t border-border bg-gradient-to-b from-card to-background px-4 py-16 text-center sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
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
