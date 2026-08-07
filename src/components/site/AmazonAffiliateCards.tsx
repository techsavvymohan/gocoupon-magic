import { useState } from "react";
import { Link } from "@tanstack/react-router";

export type AmazonDealCard = {
  id: string;
  category: string;
  title: string;
  badge: string;
  discount: string;
  originalPrice: string;
  dealPrice: string;
  couponCode: string;
  image: string;
  rating: string;
  reviewsCount: string;
  affiliateUrl: string;
  tags: string[];
};

const amazonDeals: AmazonDealCard[] = [
  {
    id: "tech-audio-hub",
    category: "Electronics & Tech",
    title: "Premium Wireless Noise-Cancelling Headphones & Audio",
    badge: "Prime Deal • 45% OFF",
    discount: "Save ₹4,500",
    originalPrice: "₹9,999",
    dealPrice: "₹5,499",
    couponCode: "AMZTECH10",
    image: "/amazon-deals-tech.png",
    rating: "4.8 ★",
    reviewsCount: "12.4k ratings",
    affiliateUrl: "https://www.amazon.in/dp/B08L5VJYV3?tag=gocoupon0e-21",
    tags: ["Auto-Apply Coupon", "Bank Offer Stackable", "Free One-Day Delivery"],
  },
  {
    id: "home-kitchen-appliances",
    category: "Home & Appliances",
    title: "Smart Espresso Machine & Compact Home Kitchen Setup",
    badge: "Trending • 38% OFF",
    discount: "Save ₹3,200",
    originalPrice: "₹8,499",
    dealPrice: "₹5,299",
    couponCode: "AMZHOME15",
    image: "/amazon-deals-home.png",
    rating: "4.7 ★",
    reviewsCount: "8.9k ratings",
    affiliateUrl: "https://www.amazon.in/b?node=976442031&tag=gocoupon0e-21",
    tags: ["Extra 10% ICICI Card", "Zero Cost EMI", "Manufacturer Warranty"],
  },
  {
    id: "fashion-lifestyle-essentials",
    category: "Fashion & Watches",
    title: "Minimalist Smartwatches & Luxury Accessories Bundle",
    badge: "Limited Deal • 52% OFF",
    discount: "Save ₹2,600",
    originalPrice: "₹4,999",
    dealPrice: "₹2,399",
    couponCode: "AMZFASH20",
    image: "/amazon-deals-fashion.png",
    rating: "4.9 ★",
    reviewsCount: "15.1k ratings",
    affiliateUrl: "https://www.amazon.in/b?node=6648217031&tag=gocoupon0e-21",
    tags: ["Instant Coupon -₹300", "SBI Card Cashback", "Easy 10-Day Return"],
  },
];

export function AmazonAffiliateCards() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <section className="border-t border-border px-6 py-20 bg-card/30">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              Amazon Verified Affiliate Deals
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Curated Amazon India Deals & Stackable Promo Codes
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Handpicked top-rated products eligible for goCoupon auto-apply promos and instant bank card discounts.
            </p>
          </div>
          <Link
            to="/extension"
            className="inline-flex items-center text-xs font-mono uppercase tracking-[0.15em] text-primary hover:underline"
          >
            Auto-Apply All Coupons via Extension →
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {amazonDeals.map((deal) => (
            <div
              key={deal.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
            >
              {/* Top Image Container */}
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted">
                <img
                  src={deal.image}
                  alt={deal.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur-md px-3 py-1 text-[11px] font-medium text-foreground border border-border/50">
                  {deal.badge}
                </div>
                <div className="absolute top-3 right-3 rounded-full bg-primary/90 px-2.5 py-1 font-mono text-[10px] font-bold text-primary-foreground">
                  {deal.rating}
                </div>
              </div>

              {/* Card Body */}
              <div className="mt-4 flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                    <span>{deal.category}</span>
                    <span className="text-[11px]">{deal.reviewsCount}</span>
                  </div>

                  <h3 className="mt-2 font-display text-lg font-bold leading-snug text-foreground group-hover:text-primary transition-colors">
                    <a
                      href={deal.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus:outline-none"
                    >
                      {deal.title}
                    </a>
                  </h3>

                  {/* Price Section */}
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="font-display text-2xl font-bold text-foreground">
                      {deal.dealPrice}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      {deal.originalPrice}
                    </span>
                    <span className="text-xs font-medium text-emerald-500 font-mono">
                      {deal.discount}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {deal.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer Action */}
                <div className="mt-6 flex items-center gap-2 border-t border-border/60 pt-4">
                  <button
                    onClick={() => handleCopy(deal.couponCode)}
                    className="flex-1 rounded-xl border border-dashed border-primary/40 bg-primary/5 py-2 px-3 text-center text-xs font-mono font-medium text-primary hover:bg-primary/10 transition-colors"
                  >
                    {copiedCode === deal.couponCode ? "Copied Code!" : `Code: ${deal.couponCode}`}
                  </button>
                  <a
                    href={deal.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 shrink-0"
                  >
                    View Deal ↗
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
