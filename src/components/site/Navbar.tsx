import { Link, useLocation } from "@tanstack/react-router";
import { MagneticButton } from "../MagneticButton";
import { ThemeToggle } from "../ThemeToggle";

type NavLink = { label: string; hash: string; to?: string };

const links: NavLink[] = [
  { label: "Features", hash: "features" },
  { label: "How it works", hash: "how" },
  { label: "Pricing", hash: "pricing" },
  { label: "Blog", hash: "blog", to: "/blog" },
];

export function Navbar() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <header
      className="sticky top-0 z-[100] w-full border-b border-border/30 shadow-[0_1px_0_color-mix(in_srgb,var(--foreground)_6%,transparent)]"
      style={{
        background: "color-mix(in srgb, var(--background) 48%, transparent)",
        backdropFilter: "blur(28px) saturate(165%)",
        WebkitBackdropFilter: "blur(28px) saturate(165%)",
      }}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5" aria-label="goCoupon — home">
          <span className="inline-flex items-center rounded-lg px-2 py-1 transition-colors">
            <img
              src="/gc-logo.png"
              alt="goCoupon"
              className="h-7 w-auto dark:hidden"
              width={120}
              height={28}
              decoding="async"
              fetchPriority="high"
            />
            <img
              src="/gc-logo-dark.png"
              alt="goCoupon"
              className="hidden h-7 w-auto dark:block"
              width={120}
              height={28}
              decoding="async"
              fetchPriority="high"
            />
          </span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => {
            const baseClass =
              "text-sm text-muted-foreground transition-colors hover:text-foreground";

            if (l.to) {
              return (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className={baseClass}
                    activeOptions={{ exact: false }}
                    activeProps={{ className: "text-foreground" }}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            }

            return (
              <li key={l.label}>
                {isHome ? (
                  <a href={`#${l.hash}`} className={baseClass}>
                    {l.label}
                  </a>
                ) : (
                  <Link to="/" hash={l.hash} className={baseClass}>
                    {l.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isHome ? (
            <MagneticButton
              as="a"
              href="#cta"
              className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-shadow hover:shadow-[var(--shadow-accent)] sm:inline-flex"
            >
              Add to Chrome — Free
            </MagneticButton>
          ) : (
            <Link
              to="/"
              hash="cta"
              className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-shadow hover:shadow-[var(--shadow-accent)] sm:inline-flex"
            >
              Add to Chrome — Free
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
