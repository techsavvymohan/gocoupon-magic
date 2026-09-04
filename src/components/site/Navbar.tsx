/**
 * @file Navbar.tsx
 * @description UI/UX Pro Max Navigation Bar with Glassmorphism & Mobile App-Like Bottom Navigation.
 */

import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { MagneticButton } from "../MagneticButton";
import { ThemeToggle } from "../ThemeToggle";
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
} from "lucide-react";

type NavLink = {
  label: string;
  to?: string;
  href?: string;
  isExternal?: boolean;
  badge?: string;
  badgeColor?: string;
};

const primaryLinks: NavLink[] = [
  { label: "Compare", to: "/compare", badge: "NEW", badgeColor: "bg-primary/10 text-primary" },
  { label: "Price Tracker", to: "/price-history" },
  { label: "Ask", to: "/ask" },
  { label: "Stores", to: "/stores" },
  { label: "Deals", href: "https://deals.gocoupon.io", isExternal: true, badge: "HOT", badgeColor: "bg-rose-500/15 text-rose-500" },
  { label: "Extension", to: "/extension" },
  { label: "Blog", to: "/blog" },
];

export function Navbar() {
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-2 transition-transform duration-200 hover:scale-105"
            aria-label="goCoupon — home"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="inline-flex items-center rounded-lg px-2 py-1 transition-colors">
              <img
                src="/gc-logo.webp"
                alt="goCoupon"
                className="h-7 w-auto dark:hidden transition-transform group-hover:scale-105"
                width={120}
                height={28}
                decoding="async"
                fetchPriority="high"
              />
              <img
                src="/gc-logo-dark.webp"
                alt="goCoupon"
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
            {primaryLinks.map((l) => {
              const baseClass =
                "group relative py-1 text-xs lg:text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:-translate-y-0.5 flex items-center gap-1.5";

              const animatedContent = (
                <>
                  <span>{l.label}</span>
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
          <div className="flex items-center gap-2.5 sm:gap-3">
            <ThemeToggle />

            <MagneticButton
              as="a"
              href="https://chromewebstore.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-4 sm:px-5 py-2 text-xs font-bold text-white shadow-md transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-rose-500/25 sm:inline-flex group"
            >
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              <span>Add to Chrome</span>
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
              {primaryLinks.map((l) => (
                <li key={l.label}>
                  {l.isExternal && l.href ? (
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
                  ) : (
                    <Link
                      to={l.to!}
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
                      <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  )}
                </li>
              ))}
              <li className="pt-2">
                <a
                  href="https://chromewebstore.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 min-h-[44px] text-sm font-bold text-primary-foreground shadow-md touch-manipulation"
                >
                  <span>Add to Chrome — Free</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
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
            <span className="text-[10px] font-medium">Home</span>
          </Link>

          <Link
            to="/compare"
            className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 px-3 py-1 text-muted-foreground hover:text-foreground active:scale-95 touch-manipulation"
            activeProps={{ className: "text-primary font-bold" }}
            aria-label="Compare prices"
          >
            <Layers className="h-4 w-4" aria-hidden="true" />
            <span className="text-[10px] font-medium">Compare</span>
          </Link>

          <Link
            to="/price-history"
            className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 px-3 py-1 text-muted-foreground hover:text-foreground active:scale-95 touch-manipulation"
            activeProps={{ className: "text-primary font-bold" }}
            aria-label="Price Tracker"
          >
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span className="text-[10px] font-medium">Tracker</span>
          </Link>

          <Link
            to="/ask"
            className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 px-3 py-1 text-muted-foreground hover:text-foreground active:scale-95 touch-manipulation"
            activeProps={{ className: "text-primary font-bold" }}
            aria-label="Shopping Assistant"
          >
            <Bot className="h-4 w-4" aria-hidden="true" />
            <span className="text-[10px] font-medium">Ask</span>
          </Link>

          <Link
            to="/stores"
            className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 px-3 py-1 text-muted-foreground hover:text-foreground active:scale-95 touch-manipulation"
            activeProps={{ className: "text-primary font-bold" }}
            aria-label="Stores Directory"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            <span className="text-[10px] font-medium">Stores</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
