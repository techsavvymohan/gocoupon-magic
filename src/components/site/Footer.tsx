import { Link } from "@tanstack/react-router";

export function Footer() {
  const handleOpenCookiePreferences = () => {
    // Dispatch custom event to trigger cookie consent banner / settings dialog
    window.dispatchEvent(new CustomEvent("open-cookie-preferences"));
  };

  return (
    <footer className="w-full bg-[#fbfbfb] dark:bg-[#070709] transition-colors">
      {/* ── 1. Curved Dark Hero Banner with Top Ambient Spotlight ── */}
      <div className="relative overflow-hidden rounded-b-[36px] sm:rounded-b-[44px] md:rounded-b-[52px] bg-[#09090b] text-white px-6 py-20 sm:py-28 lg:py-32 text-center shadow-xl">
        {/* Ambient Top Spotlight Light Cone */}
        <div
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[340px] w-[500px] sm:w-[750px] lg:w-[950px] rounded-full opacity-70"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.08) 45%, transparent 75%)",
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-2xl z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white text-balance">
            Ready to save on every purchase?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-neutral-400 max-w-lg mx-auto leading-relaxed text-balance font-normal">
            Join thousands of smart shoppers who are finding verified coupons and best prices in minutes.
          </p>
          <div className="mt-8 flex items-center justify-center">
            <Link
              to="/chrome-extension"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm transition-all duration-200 hover:bg-neutral-100 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black cursor-pointer"
            >
              Start for free
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. Floating Minimalist White Footer Card ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-14 sm:pb-20">
        <div className="rounded-[28px] sm:rounded-[36px] border border-neutral-200/90 bg-white p-8 sm:p-12 lg:p-14 shadow-[0_4px_24px_rgba(0,0,0,0.02)] dark:border-neutral-800/80 dark:bg-neutral-900/95">
          {/* Main Content: Brand Column + 3 Navigation Columns */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Left Column: Brand, Description, and Socials */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2.5 group"
                  aria-label="GoCoupon — Home"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white shadow-xs dark:bg-white dark:text-black">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                    GoCoupon
                  </span>
                </Link>

                <p className="mt-5 max-w-sm text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  GoCoupon empowers shoppers to find verified coupons, track honest prices, and earn instant cashback across 500+ top Indian stores.
                </p>
              </div>

              {/* Social Icons Row */}
              <div className="mt-8 flex items-center gap-4 text-neutral-700 dark:text-neutral-300">
                <a
                  href="https://twitter.com/gocoupon_in"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow GoCoupon on X (Twitter)"
                  className="hover:text-black dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm p-1 -m-1"
                >
                  <XIcon className="h-4 w-4" />
                </a>
                <a
                  href="https://instagram.com/gocoupon.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow GoCoupon on Instagram"
                  className="hover:text-black dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm p-1 -m-1"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>
                <a
                  href="https://linkedin.com/company/gocoupon"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow GoCoupon on LinkedIn"
                  className="hover:text-black dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm p-1 -m-1"
                >
                  <LinkedInIcon className="h-4 w-4" />
                </a>
                <a
                  href="https://github.com/techsavvymohan/gocoupon-magic"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GoCoupon on GitHub"
                  className="hover:text-black dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm p-1 -m-1"
                >
                  <GitHubIcon className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Right Columns: Product, Resources, Company */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
              {/* Product */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Product</h3>
                <ul className="mt-4 space-y-3">
                  <li>
                    <Link
                      to="/how-it-works"
                      className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xs"
                    >
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/compare"
                      className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xs"
                    >
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/chrome-extension"
                      className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xs"
                    >
                      Integrations
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/price-history"
                      className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xs"
                    >
                      Changelog
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Resources</h3>
                <ul className="mt-4 space-y-3">
                  <li>
                    <Link
                      to="/how-it-works"
                      className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xs"
                    >
                      Documentation
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/stores"
                      className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xs"
                    >
                      Tutorials
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/blog"
                      className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xs"
                    >
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/faq"
                      className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xs"
                    >
                      Support
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Company</h3>
                <ul className="mt-4 space-y-3">
                  <li>
                    <Link
                      to="/about"
                      className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xs"
                    >
                      About
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/about"
                      className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xs"
                    >
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contact"
                      className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xs"
                    >
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/disclosure"
                      className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xs"
                    >
                      Partners
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Thin Clean Divider */}
          <hr className="my-10 border-neutral-100 dark:border-neutral-800" />

          {/* Bottom Copyright & Legal Links */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400 dark:text-neutral-500">
            <p>© 2026 GoCoupon. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-6">
              <Link
                to="/privacy"
                className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xs"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xs"
              >
                Terms of Service
              </Link>
              <button
                type="button"
                onClick={handleOpenCookiePreferences}
                className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xs"
              >
                Cookies Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function XIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedInIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.24c-.92 0-1.67.75-1.67 1.67 0 .91.75 1.67 1.67 1.67.92 0 1.67-.76 1.67-1.67 0-.92-.75-1.67-1.67-1.67z" />
    </svg>
  );
}

function GitHubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}
