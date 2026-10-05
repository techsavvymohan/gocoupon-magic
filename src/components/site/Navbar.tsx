/**
 * @file Navbar.tsx
 * @description GrabOn-Style Dual-Tier Navigation Bar with Glassmorphism,
 * Integrated Instant Search, and Mobile App-Like Bottom Navigation.
 */

import { Link, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { MagneticButton } from "../MagneticButton";
import { ThemeToggle } from "../ThemeToggle";
import { CurrencyToggle } from "../CurrencyToggle";
import { LanguageToggle } from "../LanguageToggle";
import { useI18n } from "@/context/I18nContext";
import { useExtensionBridge } from "@/lib/useExtensionBridge";
import { AnnouncementBar } from "./AnnouncementBar";
import { NavbarSearch } from "./NavbarSearch";
import {
  Search,
  Menu,
  X,
  ArrowRight,
  ExternalLink,
  Tag,
  Download,
  Home,
  ShoppingBag,
  Flame,
  Zap,
  Store,
  BookOpen,
  Layers,
  TrendingDown,
  BadgePercent,
  CreditCard,
} from "lucide-react";

type NavLink = {
  label: string;
  to?: string;
  search?: Record<string, unknown>;
  href?: string;
  isExternal?: boolean;
  badge?: string;
  badgeColor?: string;
  icon?: any;
  i18nKey?: string;
};

const desktopSubLinks: NavLink[] = [
  {
    label: "Offers",
    to: "/offers",
    badge: "HOT",
    badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold",
    icon: Tag,
    i18nKey: "nav.offers",
  },
  {
    label: "Featured Deals",
    to: "/featured-deals",
    badge: "TOP",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold",
    icon: BadgePercent,
    i18nKey: "nav.featuredDeals",
  },
  {
    label: "Bank Cards",
    to: "/offers",
    search: { tab: "banks" },
    badge: "EXTRA 5%",
    badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold",
    icon: CreditCard,
    i18nKey: "nav.bankCards",
  },
  {
    label: "Stores",
    to: "/stores",
    icon: Store,
    i18nKey: "nav.stores",
  },
  {
    label: "Categories",
    to: "/categories",
    icon: Layers,
    i18nKey: "nav.categories",
  },
  {
    label: "Extension",
    to: "/chrome-extension",
    icon: Zap,
    i18nKey: "nav.extension",
  },
  {
    label: "Blog",
    to: "/blog",
    icon: BookOpen,
    i18nKey: "nav.blog",
  },
];

const mobileLinks: NavLink[] = [
  ...desktopSubLinks,
  {
    label: "Price Comparison",
    to: "/compare",
    icon: TrendingDown,
  },
];

export function Navbar() {
  const { isInstalled } = useExtensionBridge();
  const { pathname } = useLocation();
  const isOffersPage = pathname === "/offers" || pathname.startsWith("/offers");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { t } = useI18n();

  // Auto-close drawers when navigating between pages
  useEffect(() => {
    setMobileSearchOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className="sticky top-0 z-[100] w-full border-b border-border/40 shadow-[0_2px_12px_color-mix(in_srgb,var(--foreground)_4%,transparent)]"
        style={{
          background: "color-mix(in srgb, var(--background) 85%, transparent)",
          backdropFilter: "blur(24px) saturate(160%)",
          WebkitBackdropFilter: "blur(24px) saturate(160%)",
        }}
      >
        <AnnouncementBar />

        {/* ── TIER 1: PRIMARY ACTION ROW (Logo, GrabOn-Style Live Search, Controls) ── */}
        <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6">
          {/* Logo on Left */}
          <Link
            to="/"
            className="group flex items-center gap-2 shrink-0 transition-transform duration-200 hover:scale-105"
            aria-label="GoCoupon — home"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="inline-flex items-center rounded-lg px-1 py-1 transition-colors">
              <img
                src="/gc-logo.webp"
                alt="GoCoupon"
                className="h-7 sm:h-8 w-auto dark:hidden transition-transform group-hover:scale-105"
                width={59}
                height={32}
                decoding="async"
                fetchPriority="high"
              />
              <img
                src="/gc-logo-dark.webp"
                alt="GoCoupon"
                className="hidden h-7 sm:h-8 w-auto dark:block transition-transform group-hover:scale-105"
                width={58}
                height={32}
                decoding="async"
                fetchPriority="high"
              />
            </span>
          </Link>

          {/* GrabOn-Style Search Bar (Centered, Fills Space, Real-Time Autocomplete) */}
          <div className="flex-1 max-w-md lg:max-w-xl xl:max-w-2xl hidden md:block">
            <NavbarSearch placeholder="Search for brands, categories, coupons..." />
          </div>

          {/* Right Actions: Language, Currency, Theme, Add to Chrome */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Country / Currency toggles */}
            <div className="hidden lg:inline-flex items-center gap-1.5 sm:gap-2">
              <LanguageToggle />
              <CurrencyToggle />
            </div>

            {/* Mobile Search Button (Shows only on mobile screens < md) */}
            <button
              type="button"
              onClick={() => {
                setMobileSearchOpen((prev) => !prev);
                setMobileMenuOpen(false);
              }}
              className="inline-flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-border bg-card text-muted-foreground md:hidden hover:text-foreground hover:border-primary/40 active:scale-95 touch-manipulation transition-all shadow-2xs"
              aria-label="Search stores, coupons and deals"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>

            <ThemeToggle />

            {/* Add to Chrome Button with Pulsing Beacon */}
            <MagneticButton
              as="a"
              href="https://chromewebstore.google.com/detail/gbmfihnboadlmmjbikajlmocjmlpehij"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-4 sm:px-5 py-2 text-xs font-bold text-white shadow-md transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-rose-500/25 sm:inline-flex group shrink-0"
            >
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              <span>{t("nav.addToChrome", "Add to Chrome — Free")}</span>
            </MagneticButton>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                setMobileSearchOpen(false);
              }}
              className="inline-flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-border bg-card text-muted-foreground md:hidden hover:text-foreground active:scale-95 touch-manipulation"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Expandable Tray (Hidden by default; opens only when search button is tapped) */}
        {mobileSearchOpen && (
          <div className="border-b border-border bg-background/95 backdrop-blur-xl px-4 py-3 md:hidden animate-fade-in shadow-lg">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <NavbarSearch
                  placeholder="Search 300+ stores & coupons..."
                  autoFocus
                  onSelect={() => setMobileSearchOpen(false)}
                />
              </div>
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/60 text-muted-foreground hover:text-foreground active:scale-95 touch-manipulation"
                aria-label="Close search"
              >
                <X className="h-4.5 w-4.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* ── TIER 2: SUB-NAVIGATION STRIP (Desktop only: Offers, Deals, Stores, Categories, etc.) ── */}
        <nav
          aria-label="Sub Navigation"
          className="hidden md:block border-t border-border/40 bg-muted/25 dark:bg-muted/10 backdrop-blur-md"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 py-1 overflow-x-auto no-scrollbar">
            <ul className="flex items-center gap-1 sm:gap-2 whitespace-nowrap py-0.5">
              {desktopSubLinks.map((l) => {
                const IconComponent = l.icon;
                const localizedLabel = l.i18nKey ? t(l.i18nKey, l.label) : l.label;

                return (
                  <li key={l.label}>
                    <Link
                      to={l.to!}
                      search={l.search as any}
                      className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-150"
                      activeOptions={{ exact: false }}
                      activeProps={{
                        className: "text-foreground font-bold bg-card shadow-2xs border border-border/60",
                      }}
                    >
                      {IconComponent && (
                        <IconComponent className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      )}
                      <span>{localizedLabel}</span>
                      {l.badge && (
                        <span
                          className={`rounded-full px-1.5 py-0.2 font-mono text-[9px] font-bold ${
                            l.badgeColor || "bg-primary/10 text-primary"
                          }`}
                        >
                          {l.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Quick Utility Link on Right of Sub-nav: Price Comparison */}
            <div className="hidden lg:flex items-center gap-3 pl-4 shrink-0">
              <Link
                to="/compare"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors py-1"
                activeProps={{ className: "text-primary font-bold" }}
              >
                <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
                <span>Compare Store Prices</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-b border-border bg-background px-6 py-6 md:hidden animate-fade-in max-h-[80vh] overflow-y-auto">
            <ul className="space-y-3">
              {mobileLinks.map((l) => {
                const IconComponent = l.icon;
                const localizedLabel = l.i18nKey ? t(l.i18nKey, l.label) : l.label;

                return (
                  <li key={l.label}>
                    <Link
                      to={l.to!}
                      search={l.search as any}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl p-3 min-h-[44px] text-base font-semibold text-foreground hover:bg-muted touch-manipulation"
                    >
                      <div className="flex items-center gap-2.5">
                        {IconComponent && <IconComponent className="h-4 w-4 text-primary" />}
                        <span>{localizedLabel}</span>
                        {l.badge && (
                          <span
                            className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                              l.badgeColor || "bg-primary/10 text-primary"
                            }`}
                          >
                            {l.badge}
                          </span>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
              <li className="pt-2">
                <a
                  href="https://chromewebstore.google.com/detail/gbmfihnboadlmmjbikajlmocjmlpehij"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 py-3.5 min-h-[44px] text-sm font-bold text-white shadow-md touch-manipulation"
                >
                  <span>{t("nav.addToChrome", "Add to Chrome — Free")}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </li>
              <li className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground font-mono">Language:</span>
                <LanguageToggle />
              </li>
              <li className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground font-mono">Currency Preference:</span>
                <CurrencyToggle />
              </li>
            </ul>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar (Fixed 1-Thumb Reachability, >=44px touch target) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-background/90 backdrop-blur-xl md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
      >
        <div className="flex h-16 items-center justify-around px-2">
          <Link
            to="/"
            className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 px-3 py-1 text-muted-foreground hover:text-foreground active:scale-95 touch-manipulation"
            activeProps={{ className: "text-primary font-bold" }}
            aria-label="Home"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            <span className="text-[10px] font-medium">{t("nav.home", "Home")}</span>
          </Link>

          <Link
            to="/featured-deals"
            className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 px-3 py-1 text-muted-foreground hover:text-foreground active:scale-95 touch-manipulation"
            activeProps={{ className: "text-emerald-600 dark:text-emerald-400 font-bold" }}
            aria-label="Featured Partner Deals"
          >
            <Tag className="h-4 w-4" aria-hidden="true" />
            <span className="text-[10px] font-medium">Featured</span>
          </Link>

          <Link
            to="/offers"
            className="group relative flex min-h-[44px] min-w-[56px] flex-col items-center justify-center gap-0.5 px-2 py-0.5 text-rose-600 dark:text-rose-400 active:scale-95 touch-manipulation"
            activeProps={{ className: "text-rose-600 font-bold" }}
            aria-label="Click to find available offers and verified coupons"
          >
            <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500/20 via-amber-500/20 to-primary/20 border border-rose-500/35 text-rose-600 dark:text-rose-400 shadow-xs group-hover:scale-110 transition-transform">
              <Flame className="h-4 w-4 fill-rose-500 text-rose-500 animate-pulse" aria-hidden="true" />
              {!isOffersPage && (
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 ring-2 ring-background"></span>
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-foreground group-hover:text-rose-600 transition-colors">
              {t("nav.offers", "Offers")}
            </span>
          </Link>

                    <button
            type="button"
            onClick={() => {
              setMobileSearchOpen(true);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 px-3 py-1 text-muted-foreground hover:text-foreground active:scale-95 touch-manipulation cursor-pointer"
            aria-label="Search Coupons & Stores"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="text-[10px] font-medium">Search</span>
          </button>

          <Link
            to="/stores"
            className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 px-3 py-1 text-muted-foreground hover:text-foreground active:scale-95 touch-manipulation"
            activeProps={{ className: "text-primary font-bold" }}
            aria-label="Stores Directory"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            <span className="text-[10px] font-medium">{t("nav.stores", "Stores")}</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
