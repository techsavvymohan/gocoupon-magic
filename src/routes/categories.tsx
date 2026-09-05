import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import {
  Smartphone,
  Shirt,
  Utensils,
  Plane,
  Heart,
  Home,
  Baby,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  Tag,
  ShieldCheck,
} from "lucide-react";
import { MagneticButton } from "@/components/MagneticButton";

export const Route = createFileRoute("/categories")({
  component: CategoriesPage,
  head: () =>
    createSeoHead({
      title: "Browse Coupon Categories – Electronics, Fashion, Food, Travel & More | GoCoupon",
      description:
        "Find discounts across top online shopping categories: Electronics, Fashion, Food Delivery, Travel Bookings, Beauty & Home. Save up to 80% with GoCoupon.",
      path: "/categories",
      keywords:
        "coupon categories, electronics coupons, fashion promo codes, food discount codes, flight deals, beauty cashback worldwide",
    }),
});

interface CategoryItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  tagline: string;
  avgSavings: string;
  popularStores: Array<{ name: string; to?: string; href?: string }>;
  description: string;
  bestDealsTime: string;
  highlight: string;
}

const CATEGORIES_LIST: CategoryItem[] = [
  {
    id: "fashion",
    name: "Fashion & Lifestyle",
    icon: Shirt,
    tagline: "Clothing, Footwear, Watches & Accessories",
    avgSavings: "25% – 60% OFF",
    popularStores: [
      { name: "Myntra", to: "/myntra-coupons" },
      { name: "Flipkart Fashion", to: "/flipkart-coupons" },
      { name: "Meesho", to: "/meesho-coupons" },
      { name: "AJIO", href: "https://www.ajio.com" },
    ],
    description:
      "Save on branded apparel, ethnic sarees, sneakers, luxury handbags, and accessories. Combine first-time app codes with seasonal flash discounts.",
    bestDealsTime: "End of Season Sales (July/Jan) & Big Billion Days",
    highlight: "Stack Myntra Insider points with brand promo codes",
  },
  {
    id: "electronics",
    name: "Electronics & Mobiles",
    icon: Smartphone,
    tagline: "Smartphones, Laptops, Audio & Smart TVs",
    avgSavings: "10% – 45% OFF",
    popularStores: [
      { name: "Amazon India", to: "/amazon-coupons" },
      { name: "Flipkart Electronics", to: "/flipkart-coupons" },
      { name: "Tata CLiQ", href: "https://www.tatacliq.com" },
      { name: "boAt Lifestyle", href: "https://www.boat-lifestyle.com" },
    ],
    description:
      "Get instant bank discounts on 5G smartphones, gaming laptops, smart TVs, noise-cancelling headphones, and home smart appliances.",
    bestDealsTime: "Prime Day, Black Friday, Cyber Monday & Festive Mega Sales",
    highlight: "Combine exchange bonus with HDFC/ICICI bank credit card EMI codes",
  },
  {
    id: "food",
    name: "Food Delivery & Dining",
    icon: Utensils,
    tagline: "Restaurant Food, Midnight Snacks & Pizza",
    avgSavings: "30% – 50% OFF",
    popularStores: [
      { name: "Swiggy", href: "https://www.swiggy.com" },
      { name: "Zomato", href: "https://www.zomato.com" },
      { name: "Domino's Pizza", href: "https://www.dominos.co.in" },
    ],
    description:
      "Auto-test coupon codes on Swiggy and Zomato food orders, gourmet cloud kitchens, party pizza combos, and weekend dine-in bookings.",
    bestDealsTime: "Friday–Sunday dinner hours & IPL cricket season",
    highlight: "Stack bank cashback with restaurant coupons for maximum savings",
  },
  {
    id: "travel",
    name: "Travel, Flights & Hotels",
    icon: Plane,
    tagline: "Domestic & International Flights, Resorts & Trains",
    avgSavings: "Flat ₹1,200 – ₹5,000 OFF",
    popularStores: [
      { name: "MakeMyTrip", href: "https://www.makemytrip.com" },
      { name: "Cleartrip", href: "https://www.cleartrip.com" },
    ],
    description:
      "Unlock discounted flight tickets, zero cancellation charges, boutique resort packages, and instant bank card promo codes.",
    bestDealsTime: "Tuesday flight sales & Holiday Advance Booking windows",
    highlight: "Use credit card portal vouchers and zero convenience fee offers",
  },
  {
    id: "beauty",
    name: "Beauty & Personal Care",
    icon: Heart,
    tagline: "Skincare, Makeup, Haircare & Fragrances",
    avgSavings: "20% – 50% OFF",
    popularStores: [
      { name: "Nykaa", href: "https://www.nykaa.com" },
      { name: "Mamaearth", href: "https://mamaearth.in" },
      { name: "Amazon Beauty", to: "/amazon-coupons" },
      { name: "Myntra Beauty", to: "/myntra-coupons" },
    ],
    description:
      "Stock up on authentic cosmetics, Korean skincare serums, organic hair oils, and luxury perfumes with free trial sample kits.",
    bestDealsTime: "Nykaa Pink Friday Sale (Nov) & Summer Beauty Festivals",
    highlight: "Buy 1 Get 1 (BOGO) midweek special codes",
  },
  {
    id: "home",
    name: "Home, Kitchen & Decor",
    icon: Home,
    tagline: "Cookware, Furnishing, Mattresses & Lighting",
    avgSavings: "30% – 70% OFF",
    popularStores: [
      { name: "Amazon Home", to: "/amazon-coupons" },
      { name: "Flipkart Home", to: "/flipkart-coupons" },
      { name: "Meesho Home Decor", to: "/meesho-coupons" },
    ],
    description:
      "Upgrade your living room and kitchen with discounted air fryers, non-stick cookware sets, ergonomic office chairs, and bedding.",
    bestDealsTime: "Diwali Home Makeover sales (Sep–Nov)",
    highlight: "No Cost EMI plus instant cart checkout coupons",
  },
  {
    id: "baby",
    name: "Baby, Kids & Parenting",
    icon: Baby,
    tagline: "Diapers, Toys, Baby Clothes & Strollers",
    avgSavings: "25% – 55% OFF",
    popularStores: [
      { name: "FirstCry", href: "https://www.firstcry.com" },
      { name: "Amazon Family", to: "/amazon-coupons" },
      { name: "Meesho Kids", to: "/meesho-coupons" },
    ],
    description:
      "Save on monthly diaper subscription packs, organic baby formula, educational toys, school supplies, and trendy kids fashion.",
    bestDealsTime: "FirstCry Club Carnival & Monthly Mega Diaper Days",
    highlight: "Club member extra 10% coupon stackability",
  },
  {
    id: "grocery",
    name: "Grocery & Quick Commerce",
    icon: ShoppingBag,
    tagline: "10-Minute Grocery, Fresh Produce & Pantry Essentials",
    avgSavings: "15% – 40% OFF",
    popularStores: [
      { name: "Amazon Fresh", to: "/amazon-coupons" },
      { name: "Flipkart Minutes", to: "/flipkart-coupons" },
      { name: "Swiggy Instamart", href: "https://www.swiggy.com" },
    ],
    description:
      "Get cashback and coupon discounts on daily milk, fresh fruits, organic pantry staples, breakfast cereals, and household cleaners.",
    bestDealsTime: "1st to 7th of every month (Super Value Days)",
    highlight: "SuperCoins cashback on repeat grocery orders",
  },
];

function CategoriesPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Categories", path: "/categories" },
  ]);

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* Hero Header */}
      <section className="relative border-b border-border px-6 pb-16 pt-20 sm:pt-28">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 font-mono text-xs uppercase tracking-[0.2em] text-primary">
            <Tag className="h-3.5 w-3.5" />
            Shop by Category
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Explore Deals by Shopping Category
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Discover verified promo codes, seasonal buying secrets, and top cashback merchants tailored to every product category.
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2">
            {CATEGORIES_LIST.map((category) => (
              <div
                key={category.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-border bg-card p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <category.icon className="h-7 w-7" />
                      </div>
                      <div>
                        <h2 className="font-display text-2xl font-bold text-foreground">
                          {category.name}
                        </h2>
                        <p className="text-xs text-muted-foreground">{category.tagline}</p>
                      </div>
                    </div>
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-semibold text-emerald-500">
                      {category.avgSavings}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                    {category.description}
                  </p>

                  {/* Insider Pro Tip */}
                  <div className="mt-5 rounded-2xl border border-border/80 bg-muted/40 p-4">
                    <div className="flex items-center gap-2 font-mono text-xs font-semibold text-primary">
                      <TrendingUp className="h-3.5 w-3.5" />
                      PRO SAVING TIP
                    </div>
                    <p className="mt-1 text-xs text-foreground/90">{category.highlight}</p>
                    <div className="mt-2 text-[11px] text-muted-foreground">
                      <span className="font-medium text-foreground">Best Sale Timing:</span>{" "}
                      {category.bestDealsTime}
                    </div>
                  </div>
                </div>

                {/* Popular Stores in this category */}
                <div className="mt-6 border-t border-border pt-4">
                  <div className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Top Stores in this Category:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.popularStores.map((st) =>
                      st.to ? (
                        <Link
                          key={st.name}
                          to={st.to as any}
                          className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                        >
                          <span>{st.name}</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      ) : (
                        <a
                          key={st.name}
                          href={st.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                        >
                          <span>{st.name}</span>
                          <ArrowRight className="h-3 w-3" />
                        </a>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auto Apply Banner */}
      <section className="border-t border-border bg-muted/20 px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Save across all categories with one extension.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            You don't need separate coupon apps for electronics, fashion, or food. goCoupon handles them all automatically.
          </p>
          <div className="mt-8 flex justify-center">
            <MagneticButton
              as="a"
              href="https://chromewebstore.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-105"
            >
              <span>Add goCoupon to Chrome — Free</span>
              <ArrowRight className="h-4 w-4" />
            </MagneticButton>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
