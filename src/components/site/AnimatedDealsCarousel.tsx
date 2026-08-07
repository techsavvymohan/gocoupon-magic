import { useState } from "react";
import { Link } from "@tanstack/react-router";

export type CarouselDealItem = {
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

export const carouselDeals: CarouselDealItem[] = [
  {
    id: "tech-audio-hub",
    category: "Electronics & Tech",
    title: "Premium Wireless Noise-Cancelling Headphones",
    badge: "Prime Deal • 45% OFF",
    discount: "Save ₹4,500",
    originalPrice: "₹9,999",
    dealPrice: "₹5,499",
    couponCode: "AMZTECH10",
    image: "/amazon-deals-tech.png",
    rating: "4.8 ★",
    reviewsCount: "12.4k ratings",
    affiliateUrl: "https://www.amazon.in/dp/B08L5VJYV3?tag=gocoupon0e-21",
    tags: ["Auto-Apply Coupon", "Bank Offer Stackable"],
  },
  {
    id: "home-kitchen-appliances",
    category: "Home & Appliances",
    title: "Smart Espresso Machine & Compact Home Setup",
    badge: "Trending • 38% OFF",
    discount: "Save ₹3,200",
    originalPrice: "₹8,499",
    dealPrice: "₹5,299",
    couponCode: "AMZHOME15",
    image: "/amazon-deals-home.png",
    rating: "4.7 ★",
    reviewsCount: "8.9k ratings",
    affiliateUrl: "https://www.amazon.in/b?node=976442031&tag=gocoupon0e-21",
    tags: ["Extra 10% ICICI Card", "Zero Cost EMI"],
  },
  {
    id: "fashion-lifestyle-essentials",
    category: "Fashion & Style",
    title: "Minimalist Smartwatches & Accessories Bundle",
    badge: "Limited Deal • 52% OFF",
    discount: "Save ₹2,600",
    originalPrice: "₹4,999",
    dealPrice: "₹2,399",
    couponCode: "AMZFASH20",
    image: "/amazon-deals-fashion.png",
    rating: "4.9 ★",
    reviewsCount: "15.1k ratings",
    affiliateUrl: "https://www.amazon.in/b?node=6648217031&tag=gocoupon0e-21",
    tags: ["Instant Coupon -₹300", "SBI Cashback"],
  },
  {
    id: "beauty-organic-skincare",
    category: "Beauty & Grooming",
    title: "Minimalist Luxury Skincare & Organic Botanical Set",
    badge: "Best Seller • 40% OFF",
    discount: "Save ₹1,800",
    originalPrice: "₹4,500",
    dealPrice: "₹2,700",
    couponCode: "AMZGLOW15",
    image: "/amazon-deals-beauty.png",
    rating: "4.9 ★",
    reviewsCount: "9.3k ratings",
    affiliateUrl: "https://www.amazon.in/b?node=1355016031&tag=gocoupon0e-21",
    tags: ["Dermatologist Approved", "Extra 15% Vouchers"],
  },
  {
    id: "watches-leather-chronograph",
    category: "Watches & Luxury",
    title: "Sleek Chronograph Watch with Genuine Leather",
    badge: "Hot Offer • 50% OFF",
    discount: "Save ₹3,500",
    originalPrice: "₹6,999",
    dealPrice: "₹3,499",
    couponCode: "AMZTIME20",
    image: "/amazon-deals-watches.png",
    rating: "4.8 ★",
    reviewsCount: "11.7k ratings",
    affiliateUrl: "https://www.amazon.in/b?node=1350387031&tag=gocoupon0e-21",
    tags: ["2-Year Warranty", "Free Premium Case"],
  },
  {
    id: "gadgets-desk-charging",
    category: "Smart Gadgets",
    title: "Wireless Charging Pad & Smart Home Audio Hub",
    badge: "Top Choice • 35% OFF",
    discount: "Save ₹1,500",
    originalPrice: "₹4,299",
    dealPrice: "₹2,799",
    couponCode: "AMZDESK10",
    image: "/amazon-deals-gadgets.png",
    rating: "4.7 ★",
    reviewsCount: "6.8k ratings",
    affiliateUrl: "https://www.amazon.in/b?node=976419031&tag=gocoupon0e-21",
    tags: ["Fast Charging 15W", "Prime One-Day"],
  },
];

export function AnimatedDealsCarousel() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Duplicate deals array to create seamless infinite right-to-left marquee loop
  const doubleDeals = [...carouselDeals, ...carouselDeals];

  return (
    <section className="border-t border-b border-border bg-card/20 py-20 overflow-hidden relative">
      <div className="mx-auto max-w-7xl px-6 mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Auto-Sliding Amazon Deals
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Featured Amazon Products & Stackable Promos
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Auto-sliding right-to-left deal marquee. Hover any card to pause sliding and copy valid promo codes.
          </p>
        </div>
        <Link
          to="/amazon-coupons"
          className="text-xs font-mono uppercase tracking-[0.15em] text-primary hover:underline"
        >
          View All Amazon Deals →
        </Link>
      </div>

      {/* Marquee Track Container */}
      <div className="relative w-full overflow-hidden">
        {/* Left/Right Fading Gradients */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

        <div className="flex w-max space-x-6 animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused] px-6">
          {doubleDeals.map((deal, idx) => (
            <div
              key={`${deal.id}-${idx}`}
              className="group relative flex w-[320px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border/80 bg-card p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5"
            >
              {/* Image Container */}
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted">
                <img
                  src={deal.image}
                  alt={deal.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-2.5 left-2.5 rounded-full bg-background/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-medium text-foreground border border-border/50">
                  {deal.badge}
                </div>
                <div className="absolute top-2.5 right-2.5 rounded-full bg-primary/90 px-2 py-0.5 font-mono text-[10px] font-bold text-primary-foreground">
                  {deal.rating}
                </div>
              </div>

              {/* Card Details */}
              <div className="mt-3 flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                    <span>{deal.category}</span>
                    <span>{deal.reviewsCount}</span>
                  </div>

                  <h3 className="mt-1.5 font-display text-base font-bold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    <a
                      href={deal.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {deal.title}
                    </a>
                  </h3>

                  {/* Price Row */}
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-display text-xl font-bold text-foreground">
                      {deal.dealPrice}
                    </span>
                    <span className="text-xs text-muted-foreground line-through">
                      {deal.originalPrice}
                    </span>
                    <span className="text-[11px] font-medium text-emerald-500 font-mono">
                      {deal.discount}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {deal.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3">
                  <button
                    onClick={() => handleCopy(deal.couponCode)}
                    className="flex-1 rounded-xl border border-dashed border-primary/40 bg-primary/5 py-1.5 px-2.5 text-center text-xs font-mono font-medium text-primary hover:bg-primary/10 transition-colors"
                  >
                    {copiedCode === deal.couponCode ? "Copied!" : deal.couponCode}
                  </button>
                  <a
                    href={deal.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 shrink-0"
                  >
                    Get Deal ↗
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
