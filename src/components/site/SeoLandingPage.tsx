import { StoreLogo } from "@/components/common/StoreLogo";
import {
  getStoreEarnKaroLink,
  wrapAffiliateTracking,
  findStoreByNameOrSlug,
  buildDealRedirectUrl,
} from "@/lib/services/store-registry";
import { toast } from "sonner";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import {
  CheckCircle2,
  ExternalLink,
  Flame,
  Sparkles,
  Store,
  Copy,
  Check,
  ShieldCheck,
  TrendingDown,
  Tag,
  Zap,
  Clock,
  ArrowRight,
  Truck,
  RotateCcw,
  CreditCard,
  Headphones,
} from "lucide-react";

import { StoreCardCrossSellBanner } from "@/components/shopping/StoreCardCrossSellBanner";

export type VerifiedCoupon = {
  code: string;
  discount: string;
  description: string;
  minSpend?: string;
  category?: string;
  expiry?: string;
  isExclusive?: boolean;
  dealLink?: string;
};

export type SavingHack = {
  title: string;
  description: string;
  tag?: string;
};

export type StorePolicy = {
  label: string;
  value: string;
  description: string;
};

export type EeatProof = {
  verifiedCount: number | string;
  successRate: string;
  avgSavings: string;
  lastTested: string;
  methodologyNote?: string;
};

export type RelatedStore = {
  name: string;
  path: string;
  discount: string;
};

export type SeoLandingPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaTo: string;
  bullets: string[];
  faqs: Array<{ q: string; a: string }>;
  breadcrumb: Array<{ name: string; path: string }>;
  children?: React.ReactNode;
  storeName?: string;
  storeLogo?: string;
  storeUrl?: string;
  category?: string;
  eeatProof?: EeatProof;
  verifiedCoupons?: VerifiedCoupon[];
  savingHacks?: SavingHack[];
  storePolicies?: StorePolicy[];
  relatedStores?: RelatedStore[];
};

export function SeoLandingPage(props: SeoLandingPageProps) {
  const {
    eyebrow,
    title,
    description,
    primaryCtaLabel,
    primaryCtaTo,
    bullets,
    faqs,
    breadcrumb,
    children,
    storeName,
    storeLogo,
    storeUrl,
    category,
    eeatProof,
    verifiedCoupons,
    savingHacks,
    storePolicies,
    relatedStores,
  } = props;

    const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const resolvedStoreSlug = (storeName || "store").toLowerCase().replace(/[^\w]/g, "-");
  const registeredStore = findStoreByNameOrSlug(storeName || (breadcrumb && breadcrumb[breadcrumb.length - 1]?.name) || "");
  const effectiveStoreName = storeName || registeredStore?.name || "Partner Store";
  const effectiveStoreUrl = (storeUrl && /^https?:\/\//i.test(storeUrl))
    ? storeUrl
    : (registeredStore?.storeUrl || getStoreEarnKaroLink(storeName || resolvedStoreSlug) || `https://${resolvedStoreSlug.replace(/-+/g, "")}.com`);

  const storeAffiliateUrl = buildDealRedirectUrl({
    url: effectiveStoreUrl,
    storeName: effectiveStoreName,
    storeSlug: resolvedStoreSlug,
    source: "seo_landing_hero",
  });

  const handleCopyCode = (code: string, targetAffiliateUrl?: string, e?: React.MouseEvent) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);

    // Track click intent beacon in background
    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/redirect/deals/click",
          JSON.stringify({
            dealId: code,
            dealTitle: `Coupon ${code} Copied`,
            storeName: effectiveStoreName,
            storeSlug: resolvedStoreSlug,
            couponCode: code,
            source: "seo_landing_copy",
          })
        );
      }
    } catch {
      // Beacon fallback
    }

    toast.success(`Coupon code "${code}" copied!`, {
      description: "Opening store with verified tracking. ⚠️ Tip: Disable third-party extensions (Honey, Coupert) at checkout so discounts & cashback track properly.",
      duration: 4500,
    });

    const dest = targetAffiliateUrl || storeAffiliateUrl;
    const isAnchor = Boolean(e?.currentTarget && (e.currentTarget as HTMLElement).tagName === "A");
    if (!isAnchor && dest && dest !== "#") {
      window.open(dest, "_blank", "noopener");
    }
    setTimeout(() => {
      setCopiedCode((current) => (current === code ? null : current));
    }, 2500);
  };

  return (
    <SiteShell>
      {/* 1. HERO & BREADCRUMB */}
      <section className="border-b border-border px-6 pb-12 pt-16 sm:pt-24 bg-gradient-to-b from-card/40 to-transparent">
        <div className="mx-auto max-w-7xl">
          <nav
            aria-label="Breadcrumb"
            className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground flex flex-wrap items-center gap-1.5"
          >
            {breadcrumb.map((item, index) => (
              <span key={item.path} className="flex items-center gap-1.5">
                {index > 0 && <span className="text-muted-foreground/60">/</span>}
                {index === breadcrumb.length - 1 ? (
                  <span className="text-foreground font-semibold">{item.name}</span>
                ) : (
                  <Link to={item.path} className="hover:text-foreground transition-colors">
                    {item.name}
                  </Link>
                )}
              </span>
            ))}
          </nav>

          {storeName ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-4">
              <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-2xl border border-border/80 bg-white shadow-xl p-3 flex items-center justify-center overflow-hidden">
                <StoreLogo
                  storeName={storeName}
                  storeLogo={storeLogo}
                  className="h-full w-full border-0 bg-transparent shadow-none p-0"
                  imageClassName="h-full w-full object-contain"
                />
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-sky-400 mb-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                  </span>
                  {eyebrow}
                </div>
                <h1 className="max-w-4xl font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  {title}
                </h1>
              </div>
            </div>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-sky-400 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            {eyebrow}
          </div>

          <h1 className="max-w-4xl font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {title}
          </h1>
            </>
          )}
          <p className="mt-5 max-w-3xl text-base text-muted-foreground sm:text-lg leading-relaxed">
            {description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to={primaryCtaTo}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]"
            >
              <span>{primaryCtaLabel}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            {storeName && (
              <a
                href={storeAffiliateUrl}
                target="_blank"
                rel="noopener sponsored nofollow"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 backdrop-blur-md px-5 py-3.5 text-sm font-semibold text-foreground hover:bg-card hover:border-primary/50 transition-all hover:scale-[1.02] shadow-xs cursor-pointer"
              >
                <span>Shop at {storeName}</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> 100% Free
              </span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-sky-400" /> Manifest V3 Safe
              </span>
              <span className="inline-flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-amber-400" /> Auto-Apply
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE E-E-A-T TELEMETRY BAR */}
      {eeatProof && (
        <section className="border-b border-border/80 bg-card/60 px-6 py-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/40">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Verified Testing Telemetry &bull; {storeName || "Merchant Lab"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Direct automated headless browser cart validation &bull; Updated {eeatProof.lastTested}
                  </p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground font-mono bg-background/80 px-3 py-1.5 rounded-full border border-border">
                Status: <span className="text-emerald-400 font-semibold">Active &amp; Monitoring</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <div className="rounded-xl border border-border/60 bg-background/50 p-4">
                <div className="text-xs font-medium text-muted-foreground">Active Tested Codes</div>
                <div className="mt-1 text-2xl font-bold text-foreground flex items-center gap-2">
                  {eeatProof.verifiedCount}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-normal">
                    Working
                  </span>
                </div>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/50 p-4">
                <div className="text-xs font-medium text-muted-foreground">Cart Success Rate</div>
                <div className="mt-1 text-2xl font-bold text-emerald-400">
                  {eeatProof.successRate}
                </div>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/50 p-4">
                <div className="text-xs font-medium text-muted-foreground">Avg. Verified Savings</div>
                <div className="mt-1 text-2xl font-bold text-sky-400">
                  {eeatProof.avgSavings}
                </div>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/50 p-4">
                <div className="text-xs font-medium text-muted-foreground">Verification Engine</div>
                <div className="mt-1 text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Every 6 Hours
                </div>
              </div>
            </div>

            {eeatProof.methodologyNote && (
              <p className="mt-3 text-xs text-muted-foreground/80 leading-relaxed italic">
                {eeatProof.methodologyNote}
              </p>
            )}
          </div>
        </section>
      )}

      {/* 3. VERIFIED COUPONS TABLE / CARDS */}
      {verifiedCoupons && verifiedCoupons.length > 0 && (
        <section className="border-b border-border px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Verified {storeName || "Active"} Coupon Codes (Updated Daily)
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Click any code to copy directly. Use goCoupon extension to auto-apply all codes in 850ms at checkout.
                </p>
              </div>
              <div className="text-xs font-mono text-muted-foreground bg-card px-3 py-1.5 rounded-lg border border-border">
                {verifiedCoupons.length} Active Offers Ready
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {verifiedCoupons.map((coupon, idx) => {
                const cleanCode = (coupon.code || "").trim();
                const isPlaceholder = ["ACTIVATEOFFER", "DEALACTIVATED", "NO_CODE_DEAL", "ACTIVATE DEAL", "CASHBACKACTIVE"].includes(cleanCode.toUpperCase());
                const hasRealCode = Boolean(cleanCode && !isPlaceholder && cleanCode.length > 1);
                const isCopied = copiedCode === cleanCode;

                const couponAffiliateUrl = buildDealRedirectUrl({
                  url: coupon.dealLink || effectiveStoreUrl,
                  storeName: effectiveStoreName,
                  storeSlug: resolvedStoreSlug,
                  title: coupon.discount || coupon.description,
                  code: cleanCode,
                  dealId: cleanCode || `deal_${idx}`,
                  source: "seo_landing_coupon",
                });

                return (
                  <div
                    key={`${cleanCode || "deal"}-${idx}`}
                    className="relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all hover:border-sky-500/40 hover:shadow-lg hover:shadow-sky-500/5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" /> Verified
                        </span>
                        {coupon.isExclusive && (
                          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-500 border border-amber-500/20">
                            Exclusive
                          </span>
                        )}
                        {coupon.expiry && (
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {coupon.expiry}
                          </span>
                        )}
                      </div>

                      <div className="text-lg font-bold text-foreground mb-1">
                        {coupon.discount}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                        {coupon.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border/60">
                      {hasRealCode ? (
                        <a
                          href={couponAffiliateUrl}
                          target="_blank"
                          rel="noopener sponsored nofollow"
                          onClick={(e) => handleCopyCode(cleanCode, couponAffiliateUrl, e)}
                          className={`group/stub relative w-full flex items-stretch h-11 sm:h-12 rounded-xl sm:rounded-2xl overflow-hidden border border-indigo-200/50 dark:border-indigo-900/50 shadow-md shadow-indigo-500/10 hover:shadow-lg transition-all active:scale-[0.98] select-none cursor-pointer ${
                            isCopied
                              ? "bg-emerald-600 ring-2 ring-emerald-500/30"
                              : "bg-[#3f38d6] dark:bg-indigo-600 hover:bg-[#352fc4]"
                          }`}
                          title={`Copy code ${cleanCode} and open ${effectiveStoreName}`}
                        >
                          {/* Left Action Button (vibrant royal indigo-blue) */}
                          <div className="flex-1 min-w-0 flex items-center justify-center gap-2 px-3 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors">
                            {isCopied ? (
                              <>
                                <Check className="h-4 w-4 stroke-[2.5] text-white animate-bounce shrink-0" />
                                <span className="truncate">COPIED! OPENING STORE...</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 stroke-[2.2] text-white shrink-0 group-hover/stub:scale-105 transition-transform" />
                                <span className="truncate font-sans font-bold">
                                  {coupon.discount && coupon.discount !== "Deal"
                                    ? `REDEEM ${coupon.discount.replace(/₹/g, "RS ").toUpperCase()}`
                                    : "REDEEM CODE"}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Right Teaser Tab: Solid light silver background with bold white spaced digits (e.g. 2  6) */}
                          <div
                            className={`w-14 sm:w-16 shrink-0 border-l border-white/20 flex items-center justify-center font-sans font-extrabold text-sm sm:text-base text-white tracking-widest select-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] ${
                              isCopied
                                ? "bg-emerald-700/90 text-white"
                                : "bg-[#d4d4d8] dark:bg-zinc-700 text-white"
                            }`}
                          >
                            <span>
                              {isCopied
                                ? "100%"
                                : cleanCode.length >= 2
                                ? `${cleanCode.slice(-2, -1)} ${cleanCode.slice(-1)}`
                                : cleanCode}
                            </span>
                          </div>
                        </a>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                            <Sparkles className="h-3 w-3 shrink-0" />
                            <span>No Code Needed</span>
                          </div>
                          <a
                            href={couponAffiliateUrl}
                            target="_blank"
                            rel="noopener sponsored nofollow"
                            className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white shadow-xs transition-all cursor-pointer"
                            title={`Activate ${coupon.discount} at ${storeName || "store"}`}
                          >
                            <Flame className="h-3.5 w-3.5 fill-white shrink-0" />
                            <span>ACTIVATE DEAL</span>
                            <ExternalLink className="h-3 w-3 opacity-80" />
                          </a>
                        </div>
                      )}

                      {coupon.minSpend && (
                        <div className="mt-2 text-[10px] text-muted-foreground">
                          Requirement: {coupon.minSpend}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Anti-Extension Cookie Hijack Advisory */}
            <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    Guaranteed Savings Protection
                    <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 border border-emerald-500/30 uppercase">
                      Active
                    </span>
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed max-w-2xl">
                    Third-party browser extensions (Honey, Coupert, Capital One) often overwrite checkout cookies and cancel out GoCoupon promo discounts. For guaranteed coupon redemption and cashback tracking, temporarily pause other shopping extensions at checkout.
                  </p>
                </div>
              </div>
              <a
                href={storeAffiliateUrl}
                target="_blank"
                rel="noopener sponsored nofollow"
                className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2.5 transition-all shadow-xs cursor-pointer"
              >
                <span>Activate Clean Session</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* 3.5. STORE-SPECIFIC BANK CARD ARBITRAGE (DOUBLE MONETIZATION) */}
      <section className="border-b border-border px-4 sm:px-6 py-10 bg-muted/15">
        <div className="mx-auto max-w-7xl">
          <StoreCardCrossSellBanner storeName={storeName} category={category} />
        </div>
      </section>

      {/* 4. WHY SHOPPERS USE GOCOUPON */}
      <section className="border-b border-border px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why shoppers use goCoupon for {storeName || "online shopping"}
          </h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {bullets.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3.5 rounded-xl border border-border bg-card p-5 text-muted-foreground transition-colors hover:border-border/80"
              >
                <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sky-500/10 text-sky-400 mt-0.5">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 5. CHILDREN (e.g. deals carousel, affiliate cards) */}
      {children}

      {/* 6. STORE-SPECIFIC SAVING HACKS & STRATEGIES */}
      {savingHacks && savingHacks.length > 0 && (
        <section className="border-b border-border px-6 py-16 bg-card/30">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Expert Saving Strategies for {storeName || "This Store"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Insider techniques tested by our shopping team to stack coupons, credit card cashbacks, and loyalty points.
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {savingHacks.map((hack, idx) => (
                <div
                  key={`${hack.title}-${idx}`}
                  className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between"
                >
                  <div>
                    {hack.tag && (
                      <span className="inline-block rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-sky-400 mb-3">
                        {hack.tag}
                      </span>
                    )}
                    <h3 className="text-base font-semibold text-foreground mb-2">
                      {hack.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {hack.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/40 text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <TrendingDown className="h-3.5 w-3.5" /> Tested Savings
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. STORE POLICIES MATRIX */}
      {storePolicies && storePolicies.length > 0 && (
        <section className="border-b border-border px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {storeName || "Store"} Shipping, Returns &amp; Policy Facts
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Essential checkout policies verified before you apply your promotional code.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {storePolicies.map((p, idx) => (
                <div
                  key={`${p.label}-${idx}`}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono uppercase tracking-wider mb-2">
                    {idx === 0 && <Truck className="h-4 w-4 text-sky-400" />}
                    {idx === 1 && <RotateCcw className="h-4 w-4 text-amber-400" />}
                    {idx === 2 && <CreditCard className="h-4 w-4 text-emerald-400" />}
                    {idx === 3 && <Headphones className="h-4 w-4 text-purple-400" />}
                    <span>{p.label}</span>
                  </div>
                  <div className="text-base font-bold text-foreground mb-1">
                    {p.value}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {p.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. FREQUENTLY ASKED QUESTIONS */}
      <section className="border-b border-border px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently asked questions about {storeName || "coupons"}
          </h2>
          <div className="mt-8 divide-y divide-border border-y border-border">
            {faqs.map((item) => (
              <details key={item.q} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left text-lg font-semibold text-foreground">
                  <span>{item.q}</span>
                  <span
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-transform group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 9. INTERNAL INTERLINKING HUB */}
      <section className="px-6 py-12 bg-card/20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-base font-semibold text-foreground">
              Explore More Popular Store Promo Codes &amp; Categories
            </h3>
            <Link to="/stores" className="text-xs text-sky-400 hover:underline">
              View All 200+ Stores &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {[
              { name: "Amazon", path: "/amazon-coupons", tag: "Up to 50% Off" },
              { name: "Flipkart", path: "/flipkart-coupons", tag: "Flat ₹500 Off" },
              { name: "Myntra", path: "/myntra-coupons", tag: "Flat ₹400 Off" },
              { name: "Croma", path: "/croma-coupons", tag: "Up to 45% Off" },
              { name: "boAt", path: "/boat-coupons", tag: "Extra 15% Off" },
              { name: "Tata CLiQ", path: "/tata-cliq-coupons", tag: "Up to 60% Off" },
              { name: "Nykaa", path: "/nykaa-coupons", tag: "Up to 50% Off" },
              { name: "Meesho", path: "/meesho-coupons", tag: "Flat ₹100 Off" },
              { name: "Hostinger", path: "/hostinger-coupons", tag: "83% Off + Domain" },
            ].map((store) => (
              <Link
                key={store.path}
                to={store.path}
                className="group flex flex-col items-center justify-center rounded-xl border border-border/70 bg-card p-3 text-center transition-all hover:border-sky-500/50 hover:bg-card/80"
              >
                <span className="text-xs font-semibold text-foreground group-hover:text-sky-400">
                  {store.name}
                </span>
                <span className="mt-1 text-[10px] text-muted-foreground">
                  {store.tag}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
