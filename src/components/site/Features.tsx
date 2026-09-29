import { Link } from "@tanstack/react-router";
import {
  Zap,
  Ticket,
  ShieldCheck,
  Lock,
  Search,
  TrendingDown,
} from "lucide-react";

const features = [
  {
    title: "Smart Store & Deal Search Engine",
    body: "Search across 240+ partner stores (Booking.com, Myntra, Swiggy, Amazon) or find deals by keyword (Shoes, Hotels, Flights) with instant 1-click coupon auto-copy.",
    icon: Search,
  },
  {
    title: "1-Click Auto-Apply Chrome Extension",
    body: "Never type coupon codes manually. When you reach checkout on 240+ stores, GoCoupon tests all working codes in parallel and applies the highest savings in under 2 seconds.",
    icon: Zap,
  },
  {
    title: "24/7 Live Verified Deals Sync",
    body: "Connected directly to merchant affiliate APIs around the clock. Every deal is tested and timestamped live, automatically purging dead or expired vouchers.",
    icon: TrendingDown,
  },
  {
    title: "Bank & Credit Card Discount Stacking",
    body: "Pair merchant coupon codes with exclusive bank partner offers (HDFC, SBI, ICICI, Axis, Amex) to unlock an extra 5% to 15% instant checkout savings.",
    icon: Ticket,
  },
  {
    title: "Zero 503 Outbound Redirection",
    body: "Smart failover router guarantees you are never blocked by broken affiliate links or proxy downtime, ensuring seamless 1-click checkout hand-offs every time.",
    icon: ShieldCheck,
  },
  {
    title: "Bank-Grade Privacy & 100% Free Forever",
    body: "Operates in a local sandboxed browser environment with zero keystroke logging, zero personal data collection, and no annoying spam popups.",
    icon: Lock,
  },
];

export function Features() {
  return (
    <section id="features" className="relative px-4 sm:px-6 py-14 sm:py-20 overflow-hidden border-t border-border">
      <div className="mx-auto max-w-7xl">
        <div className="reveal mb-14 max-w-2xl">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground text-balance">
            Real Working Coupons.
            <span className="text-primary block mt-1">Verified Every 15 Minutes.</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            From our 1-click Chrome Extension and 24/7 Live Deal Sync to our Smart Store Search and Bank Stacking Engine — built so you never overpay online again.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="reveal group relative rounded-xl border border-border bg-card p-6 sm:p-7 shadow-xs transition-colors hover:border-primary/50"
                style={{ transitionDelay: `${(i % 3) * 0.08}s` }}
              >
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <h3 className="font-display text-base sm:text-lg font-bold text-foreground">
                  {f.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            );
          })}
        </div>

        {/* Contextual Navigation Pill Bar */}
        <div className="mt-12 rounded-2xl border border-border bg-muted/30 p-5 flex flex-wrap items-center justify-between gap-4">
          <span className="text-sm font-semibold text-foreground">
            Explore GoCoupon shopping tools:
          </span>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link to="/featured-deals" className="text-primary hover:underline font-medium">
              Featured Deals →
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/chrome-extension" className="text-primary hover:underline font-medium">
              Chrome Extension →
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/submit-coupon" className="text-primary hover:underline font-medium">
              Submit a Coupon →
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/help" className="text-primary hover:underline font-medium">
              Help Center →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
