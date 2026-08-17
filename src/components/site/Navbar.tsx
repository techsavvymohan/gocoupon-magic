import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { MagneticButton } from "../MagneticButton";
import { ThemeToggle } from "../ThemeToggle";
import { Menu, X, ArrowRight, ExternalLink } from "lucide-react";

type NavLink = {
  label: string;
  to?: string;
  href?: string;
  isExternal?: boolean;
  badge?: string;
};

const links: NavLink[] = [
  { label: "Stores", to: "/stores" },
  { label: "Categories", to: "/categories" },
  { label: "Deals", href: "https://deals.gocoupon.io", isExternal: true, badge: "HOT" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "Extension", to: "/extension" },
  { label: "Blog", to: "/blog" },
];

export function Navbar() {
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-[100] w-full border-b border-border/40 shadow-[0_2px_10px_color-mix(in_srgb,var(--foreground)_4%,transparent)]"
      style={{
        background: "color-mix(in srgb, var(--background) 75%, transparent)",
        backdropFilter: "blur(24px) saturate(160%)",
        WebkitBackdropFilter: "blur(24px) saturate(160%)",
      }}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          to="/"
          className="group flex items-center gap-2.5 transition-transform duration-200 hover:scale-105"
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

        {/* Desktop Nav Links */}
        <ul className="hidden items-center gap-7 md:flex">
          {links.map((l) => {
            const baseClass =
              "group relative py-1 text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:-translate-y-0.5 flex items-center gap-1.5";

            const animatedContent = (
              <>
                <span>{l.label}</span>
                {l.badge && (
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.2 font-mono text-[9px] font-bold text-primary">
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
                  activeProps={{ className: "text-foreground font-semibold" }}
                >
                  {animatedContent}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <MagneticButton
            as="a"
            href="https://chromewebstore.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full bg-primary px-4.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-[0_8px_25px_var(--accent-glow-strong)] sm:inline-flex group"
          >
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <span>Add to Chrome — Free</span>
          </MagneticButton>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground md:hidden hover:text-foreground"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-background px-6 py-6 md:hidden animate-fade-in">
          <ul className="space-y-4">
            {links.map((l) => (
              <li key={l.label}>
                {l.isExternal && l.href ? (
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl p-2.5 text-base font-semibold text-foreground hover:bg-muted"
                  >
                    <div className="flex items-center gap-2">
                      <span>{l.label}</span>
                      {l.badge && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                          {l.badge}
                        </span>
                      )}
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                ) : (
                  <Link
                    to={l.to!}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl p-2.5 text-base font-semibold text-foreground hover:bg-muted"
                  >
                    <div className="flex items-center gap-2">
                      <span>{l.label}</span>
                      {l.badge && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                          {l.badge}
                        </span>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                )}
              </li>
            ))}
            <li className="pt-2">
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-xl p-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                About goCoupon
              </Link>
              <Link
                to="/help"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-xl p-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Help &amp; Support
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-xl p-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Contact Us
              </Link>
            </li>
            <li className="pt-4">
              <a
                href="https://chromewebstore.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm"
              >
                <span>Add to Chrome — Free</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
