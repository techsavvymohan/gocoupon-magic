/**
 * @file Navbar.tsx
 * @description UI/UX Pro Max Navigation Bar with Glassmorphism & Mobile App-Like Bottom Navigation.
 */

import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { MagneticButton } from "../MagneticButton";
import { ThemeToggle } from "../ThemeToggle";
import { CurrencyToggle } from "../CurrencyToggle";
import { LanguageToggle } from "../LanguageToggle";
import { useI18n } from "@/context/I18nContext";
import { AnnouncementBar } from "./AnnouncementBar";
import {
  Menu,
  X,
  ArrowRight,
  ExternalLink,
  Layers,
  Clock,
  Bot,
  Award,
  Bell,
  Home,
  ShoppingBag,
  Flame,
  Zap,
} from "lucide-react";

type NavLink = {
  label: string;
  to?: string;
  href?: string;
  isExternal?: boolean;
  badge?: string;
  badgeColor?: string;
  isAction?: boolean;
  i18nKey?: string;
};

const desktopLinks: NavLink[] = [
  { label: "Offers", to: "/offers", badge: "HOT", badgeColor: "bg-rose-500/15 text-rose-500", i18nKey: "nav.offers" },
  { label: "Featured Deals", to: "/featured-deals", badge: "TOP", badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  { label: "Compare", to: "/compare", badge: "NEW", badgeColor: "bg-primary/10 text-primary", i18nKey: "nav.compare" },
  { label: "Stores", to: "/stores", i18nKey: "nav.stores" },
  { label: "Ask", to: "/ask", i18nKey: "nav.ask" },
  { label: "Extension", to: "/chrome-extension", i18nKey: "nav.extension" },
  { label: "Blog", to: "/blog", i18nKey: "nav.blog" },
];

const mobileLinks: NavLink[] = [
  ...desktopLinks,
  { label: "Chat Assistant", isAction: true },
];

export function Navbar() {
  const { pathname } = useLocation();
  const isOffersPage = pathname === "/offers" || pathname.startsWith("/offers");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useI18n();

  return (
    <>
      <header
        className="sticky top-0 z-[100] w-full border-b border-border/40 shadow-[0_2px_10px_color-mix(in_srgb,var(--foreground)_4%,transparent)]"
        style={{
          background: "color-mix(in srgb, var(--background) 80%, transparent)",
          backdropFilter: "blur(24px) saturate(160%)",
          WebkitBackdropFilter: "blur(24px) saturate(160%)",
        }}
      >
        <AnnouncementBar />
        <nav className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-2 transition-transform duration-200 hover:scale-105"
            aria-label="GoCoupon — home"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="inline-flex items-center rounded-lg px-2 py-1 transition-colors">
              <img
                src="/gc-logo.webp"
                alt="GoCoupon"
                className="h-7 w-auto dark:hidden transition-transform group-hover:scale-105"
                width={120}
                height={28}
                decoding="async"
                fetchPriority="high"
              />
              <img
                src="/gc-logo-dark.webp"
                alt="GoCoupon"
                className="hidden h-7 w-auto dark:block transition-transform group-hover:scale-105"
                width={120}
                height={28}
                decoding="async"
                fetchPriority="high"
              />
            </span>
          </Link>

          {/* Desktop Nav Links (Compact & Responsive) */}
          <ul className="hidden items-center gap-5 lg:gap-6 md:flex">
            {desktopLinks.map((l) => {
              const baseClass =
                "group relative py-1 text-xs lg:text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:-translate-y-0.5 flex items-center gap-1.5";

              const localizedLabel = l.i18nKey ? t(l.i18nKey, l.label) : l.label;

              const animatedContent = (
                <>
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
                  <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full rounded-full" />
                </>
              );

              if (l.isAction) {
                return (
                  <li key={l.label}>
                    <button
                      type="button"
                      data-thunderbolt-launcher
                      onClick={() => {
                        if (typeof (window as any).openThunderboltChat === "function") {
                          (window as any).openThunderboltChat();
                        } else {
                          (window as any).Thunderbolt?.open();
                        }
                      }}
                      className={baseClass}
                    >
                      {animatedContent}
                    </button>
                  </li>
                );
              }

              if (l.isExternal && l.href) {
                return (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={baseClass}
                    >
                      {animatedContent}
                    </a>
                  </li>
                );
              }

              return (
                <li key={l.label}>
                  <Link
                    to={l.to!}
                    className={baseClass}
                    activeOptions={{ exact: false }}
                    activeProps={{ className: "text-foreground font-bold" }}
                  >
                    {animatedContent}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Country flags / Currency hidden on mobile screens to save navbar space */}
            <div className="hidden md:inline-flex items-center gap-1.5 sm:gap-2">
              <LanguageToggle />
              <CurrencyToggle />
            </div>
            <ThemeToggle />

            <MagneticButton
              as="a"
              href="https://chromewebstore.google.com/detail/gbmfihnboadlmmjbikajlmocjmlpehij"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-4 sm:px-5 py-2 text-xs font-bold text-white shadow-md transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-rose-500/25 sm:inline-flex group"
            >
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              <span>{t("nav.addToChrome", "Add to Chrome")}</span>
            </MagneticButton>
            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-border bg-card text-muted-foreground md:hidden hover:text-foreground active:scale-95 touch-manipulation"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-b border-border bg-background px-6 py-6 md:hidden animate-fade-in max-h-[80vh] overflow-y-auto">
            <ul className="space-y-3">
              {mobileLinks.map((l) => {
                if (l.isAction) {
                  return (
                    <li key={l.label}>
                      <button
                        type="button"
                        data-thunderbolt-launcher
                        onClick={() => {
                          setMobileMenuOpen(false);
                          if (typeof (window as any).openThunderboltChat === "function") {
                            (window as any).openThunderboltChat();
                          } else {
                            (window as any).Thunderbolt?.open();
                          }
                        }}
                        className="flex w-full items-center justify-between rounded-xl p-3 min-h-[44px] text-base font-semibold text-foreground hover:bg-muted touch-manipulation text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span>{l.label}</span>
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
                      </button>
                    </li>
                  );
                }

                if (l.isExternal && l.href) {
                  return (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between rounded-xl p-3 min-h-[44px] text-base font-semibold text-foreground hover:bg-muted touch-manipulation"
                      >
                        <div className="flex items-center gap-2">
                          <span>{l.label}</span>
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
                        <ExternalLink className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      </a>
                    </li>
                  );
                }

                return (
                  <li key={l.label}>
                    <Link
                      to={l.to!}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl p-3 min-h-[44px] text-base font-semibold text-foreground hover:bg-muted touch-manipulation"
                    >
                      <div className="flex items-center gap-2">
                        <span>{l.i18nKey ? t(l.i18nKey, l.label) : l.label}</span>
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
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 min-h-[44px] text-sm font-bold text-primary-foreground shadow-md touch-manipulation"
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
            to="/compare"
            className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 px-3 py-1 text-muted-foreground hover:text-foreground active:scale-95 touch-manipulation"
            activeProps={{ className: "text-primary font-bold" }}
            aria-label="Compare prices"
          >
            <Layers className="h-4 w-4" aria-hidden="true" />
            <span className="text-[10px] font-medium">{t("nav.compare", "Compare")}</span>
          </Link>

          <Link
            to="/offers"
            className="group relative flex min-h-[44px] min-w-[56px] flex-col items-center justify-center gap-0.5 px-2 py-0.5 text-rose-600 dark:text-rose-400 active:scale-95 touch-manipulation"
            activeProps={{ className: "text-rose-600 font-bold" }}
            aria-label="Click to find available offers and verified coupons"
          >
            {/* Animated Attention Badge informing users to click for offers — hidden when already on /offers */}
            {!isOffersPage && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-1.5 py-0.5 text-[8.5px] font-extrabold uppercase tracking-tight bg-gradient-to-r from-amber-500 via-rose-500 to-primary text-white rounded-full shadow-md shadow-rose-500/30 pointer-events-none whitespace-nowrap animate-bounce ring-1 ring-background">
                <Zap className="h-2 w-2 fill-current" />
                <span>Tap for Deals</span>
              </span>
            )}

            <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500/20 via-amber-500/20 to-primary/20 border border-rose-500/35 text-rose-600 dark:text-rose-400 shadow-xs group-hover:scale-110 transition-transform">
              <Flame className="h-4 w-4 fill-rose-500 text-rose-500 animate-pulse" aria-hidden="true" />
            </div>
            <span className="text-[10px] font-bold text-foreground group-hover:text-rose-600 transition-colors">
              {t("nav.offers", "Offers")}
            </span>
          </Link>

          <Link
            to="/ask"
            className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 px-3 py-1 text-muted-foreground hover:text-foreground active:scale-95 touch-manipulation"
            activeProps={{ className: "text-primary font-bold" }}
            aria-label="Shopping Assistant"
          >
            <Bot className="h-4 w-4" aria-hidden="true" />
            <span className="text-[10px] font-medium">{t("nav.ask", "Ask")}</span>
          </Link>

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
