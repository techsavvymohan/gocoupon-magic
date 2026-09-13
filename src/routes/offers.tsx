import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useRef, useEffect } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import { useDeals } from "@/hooks/use-deals";
import { useInternationalDeals } from "@/hooks/use-international-deals";
import { triggerLiveSync, type DealSortField, type Deal } from "@/lib/api/deals-api";
import { wrapAffiliateTracking } from "@/lib/services/store-registry";
import { DealGridSkeleton } from "@/components/ui/DataSkeleton";
import { StoreLogo } from "@/components/common/StoreLogo";
import { RedeemCouponButton } from "@/components/common/RedeemCouponButton";
import { SubmitCouponButton } from "@/components/submit_coupon";
import {
  Flame,
  Tag,
  ExternalLink,
  ShoppingBag,
  Copy,
  Check,
  Zap,
  Percent,
  Search,
  Store,
  Clock,
  ShieldCheck,
  List,
  ChevronDown,
  X,
  Users,
  BadgePercent,
  CheckCircle2,
  SlidersHorizontal,
  RefreshCw,
  Globe,
  Grid,
  Columns2,
  Columns3,
  Columns4,
  Landmark,
  Gift,
  Plus,
  Calendar,
  Filter,
  ArrowRight,
  Heart,
  Compass,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/offers")({
  component: OffersHubPage,
  head: () =>
    createSeoHead({
      title: "Today's Best Online Offers, Deals & Coupons – GoCoupon (Go Coupon)",
      description:
        "Explore 970+ hand-verified online shopping offers, exclusive brand promo codes, 30-80% discounts, and bank card savings across 240+ stores with GoCoupon. A verified alternative to GrabOn, CouponDuniya & Dealspotr.",
      path: "/offers",
      keywords:
        "GoCoupon, go coupon, gocoupon, gocoupons, grabon offers, grabon coupons, couponduniya deals, coupon duniya offers, dealspottr, dealspotr coupons, offers, deals, discounts, today's offers, popular brands coupons, amazon offers, flipkart offers, myntra discount coupons, electronics offers, coupon codes, daily offers",
    }),
});

// Category definitions with clean icons (No sparkle icons)
const ALL_CATEGORY_META: Record<string, { label: string; icon: any }> = {
  all: { label: "All Categories", icon: Flame },
  Fashion: { label: "Fashion & Apparel", icon: ShoppingBag },
  Electronics: { label: "Electronics & Tech", icon: Zap },
  Beauty: { label: "Beauty & Personal Care", icon: Heart },
  Home: { label: "Home & Appliances", icon: Tag },
  Food: { label: "Food & Dining", icon: Store },
  Travel: { label: "Travel & Flights", icon: Clock },
  Recharge: { label: "Recharge & Bills", icon: Percent },
  General: { label: "General & Megastores", icon: Tag },
};

// Sort options
const SORT_OPTIONS: { id: DealSortField; label: string; icon: any; color: string }[] = [
  { id: "trending", label: "Trending Offers", icon: Flame, color: "text-rose-500" },
  { id: "discount", label: "Highest Discount", icon: Tag, color: "text-amber-500" },
  { id: "verified", label: "Verified First", icon: ShieldCheck, color: "text-emerald-500" },
  { id: "expiry", label: "Expiring Soon", icon: Clock, color: "text-sky-500" },
  { id: "store", label: "Brand Name (A-Z)", icon: Store, color: "text-violet-500" },
];

// Sidebar Discovery Tabs
type SidebarTab = "brands" | "categories" | "stores" | "banks" | "festivals" | "product-deals";

const SIDEBAR_TABS: { id: SidebarTab; label: string; icon: any; badge?: string }[] = [
  { id: "categories", label: "Categories", icon: Grid, badge: "8" },
  { id: "brands", label: "Brands", icon: Tag, badge: "Popular" },
  { id: "stores", label: "Stores", icon: Store, badge: "240+" },
  { id: "banks", label: "Banks", icon: Landmark, badge: "Extra 10%" },
  { id: "festivals", label: "Festivals", icon: Gift, badge: "Hot" },
  { id: "product-deals", label: "Product Deals", icon: ShoppingBag },
];

// Alphabet bar for instant brand search
const ALPHABET = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

// Top Curated Popular Brands (matching the screenshot reference)
interface PopularBrand {
  name: string;
  query: string;
  logo: string;
  tagline: string;
  couponsCount: number;
  offersCount: number;
  bgClass?: string;
  textColorClass?: string;
}

const DEFAULT_POPULAR_BRANDS: PopularBrand[] = [
  {
    name: "Samsung",
    query: "samsung",
    logo: "https://www.google.com/s2/favicons?domain=samsung.com&sz=128",
    tagline: "Smartphones & Appliances",
    couponsCount: 2,
    offersCount: 52,
  },
  {
    name: "OnePlus",
    query: "oneplus",
    logo: "https://www.google.com/s2/favicons?domain=oneplus.in&sz=128",
    tagline: "Never Settle Tech",
    couponsCount: 1,
    offersCount: 31,
  },
  {
    name: "Adidas",
    query: "adidas",
    logo: "https://www.google.com/s2/favicons?domain=adidas.co.in&sz=128",
    tagline: "Sportswear & Footwear",
    couponsCount: 1,
    offersCount: 29,
  },
  {
    name: "Lenovo",
    query: "lenovo",
    logo: "https://www.google.com/s2/favicons?domain=lenovo.com&sz=128",
    tagline: "Laptops & Tablets",
    couponsCount: 2,
    offersCount: 30,
    bgClass: "bg-red-600",
    textColorClass: "text-white",
  },
];

interface BankOffer {
  bankName: string;
  logo: string;
  cardType: string;
  discount: string;
  code: string;
  applicableStores: string[];
  minOrder: string;
  maxSavings: string;
}

// Curated Bank Offers for the "Banks" Discovery Tab
const BANK_OFFERS_DATA: BankOffer[] = [
  {
    bankName: "HDFC Bank",
    logo: "/icons/hdfc.svg",
    cardType: "Credit & Debit Cards",
    discount: "10% Instant Discount",
    code: "HDFC10",
    applicableStores: ["Amazon", "Flipkart", "Croma", "Samsung"],
    minOrder: "₹5,000",
    maxSavings: "Up to ₹2,500",
  },
  {
    bankName: "SBI Card",
    logo: "/icons/sbi.svg",
    cardType: "Credit Card EMI & Non-EMI",
    discount: "Flat ₹1,500 OFF",
    code: "SBISAVE",
    applicableStores: ["Flipkart", "Reliance Digital", "Myntra"],
    minOrder: "₹10,000",
    maxSavings: "Flat ₹1,500",
  },
  {
    bankName: "ICICI Bank",
    logo: "/icons/icici.svg",
    cardType: "Netbanking & Credit Cards",
    discount: "Flat ₹2,000 OFF",
    code: "ICICITECH",
    applicableStores: ["Croma", "OnePlus", "Lenovo", "Tata CLiQ"],
    minOrder: "₹15,000",
    maxSavings: "Up to ₹3,000",
  },
  {
    bankName: "Axis Bank",
    logo: "/icons/axis.svg",
    cardType: "Flipkart Axis & Neo Cards",
    discount: "5% Unlimited Cashback",
    code: "AXIS5CB",
    applicableStores: ["Flipkart", "Myntra", "Swiggy", "Zomato"],
    minOrder: "No Min Order",
    maxSavings: "Unlimited",
  },
  {
    bankName: "Kotak Mahindra Bank",
    logo: "/icons/kotak.svg",
    cardType: "Credit Cards & 811 Accounts",
    discount: "Flat 10% OFF",
    code: "KOTAK10",
    applicableStores: ["Amazon", "Swiggy", "Ajio", "BigBasket"],
    minOrder: "₹2,500",
    maxSavings: "Up to ₹1,000",
  },
  {
    bankName: "American Express",
    logo: "/icons/amex.svg",
    cardType: "Membership Rewards Cards",
    discount: "₹5,000 Gift Voucher",
    code: "AMEXLIV",
    applicableStores: ["Apple", "MakeMyTrip", "Samsung", "Ajio Luxe"],
    minOrder: "₹30,000",
    maxSavings: "₹5,000 Voucher",
  },
];

function OffersHubPage() {
  // Navigation & Filtering State
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>("categories");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [marketRegion, setMarketRegion] = useState<"all" | "in" | "intl">("all");
  const [sortBy, setSortBy] = useState<DealSortField>("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlphabet, setSelectedAlphabet] = useState<string>("All");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string | null>(null);

  // Grid Density / View Mode (4 columns, 3 columns, 2 columns, list)
  const [viewDensity, setViewDensity] = useState<"4-col" | "3-col" | "2-col" | "list">("4-col");

  // Interactive UI State
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(36);
  const [expandedDealIds, setExpandedDealIds] = useState<Set<string>>(new Set());

  // Store Directory Search & Alphabet Filters
  const [storeSearchQuery, setStoreSearchQuery] = useState("");
  const [storeAlphabetFilter, setStoreAlphabetFilter] = useState("All");

  // Popular Brands from Backend API
  const [popularBrands, setPopularBrands] = useState<PopularBrand[]>(DEFAULT_POPULAR_BRANDS);

  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const dealsGridRef = useRef<HTMLDivElement>(null);

  // Fetch backend popular brands on mount
  useEffect(() => {
    async function loadPopularBrands() {
      try {
        const res = await fetch("/api/deals/popular-brands");
        if (res.ok) {
          const data = await res.json();
          if (data.brands && data.brands.length > 0) {
            setPopularBrands(data.brands.slice(0, 8));
          }
        }
      } catch {
        // Fallback to DEFAULT_POPULAR_BRANDS
      }
    }
    loadPopularBrands();
  }, []);

  // Close sort dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch active verified Indian offers from Cuelinks API
  const { deals: indianDeals, isLoading: isIndianLoading, refetch: refetchIndian } = useDeals({
    limit: 0,
    sortBy,
    order: "desc",
  });

  // Fetch live international offers from Admitad API
  const { deals: intlDeals, isLoading: isIntlLoading, refetch: refetchIntl } = useInternationalDeals({
    sortBy: sortBy === "discount" ? "discount" : "trending",
  });

  const isLoading = isIndianLoading && isIntlLoading;

  // Active pool based on selected market region
  const allDeals = useMemo(() => {
    if (marketRegion === "in") return indianDeals;
    if (marketRegion === "intl") return intlDeals;
    return [...intlDeals, ...indianDeals];
  }, [marketRegion, indianDeals, intlDeals]);

  // Real dynamic categories computed directly from allDeals (live database pool)
  const allRealCategories = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        slug: string;
        offersCount: number;
        couponsCount: number;
        stores: Set<string>;
        maxDiscount: string;
      }
    >();

    for (const d of allDeals) {
      const cat = (d.category || "General").trim();
      if (!cat) continue;
      const existing = map.get(cat) || {
        name: cat,
        slug: cat.toLowerCase(),
        offersCount: 0,
        couponsCount: 0,
        stores: new Set<string>(),
        maxDiscount: "",
      };
      existing.offersCount += 1;
      if (d.code && d.code.length > 1) existing.couponsCount += 1;
      if (d.storeName) existing.stores.add(d.storeName.trim());
      if (d.discount && (!existing.maxDiscount || d.discount.includes("%"))) {
        existing.maxDiscount = d.discount;
      }
      map.set(cat, existing);
    }

    return Array.from(map.values())
      .map((c) => ({
        ...c,
        storesCount: c.stores.size,
        topStores: Array.from(c.stores).slice(0, 4),
        maxDiscount: c.maxDiscount || "Up to 70% OFF",
        description:
          c.name === "Fashion" ? "Apparel, footwear, ethnic wear, and fashion accessories." :
          c.name === "Beauty" ? "Skincare, cosmetics, haircare, fragrances, and grooming." :
          c.name === "Electronics" ? "Laptops, smartphones, audio, home appliances, and gadgets." :
          c.name === "Food" ? "Food delivery, groceries, gourmet dining, and cloud kitchen offers." :
          c.name === "Travel" ? "Flight bookings, hotel stays, holidays, and cab rentals." :
          c.name === "Home" ? "Furniture, home decor, kitchenware, and home improvements." :
          c.name === "Recharge" ? "Prepaid mobile recharges, DTH top-ups, and utility bill discounts." :
          `Verified ${c.name} coupons, promo codes, and exclusive deals.`,
      }))
      .sort((a, b) => b.offersCount - a.offersCount);
  }, [allDeals]);

  // Real dynamic stores computed directly from allDeals (240+ live stores)
  const allRealStores = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        slug: string;
        query: string;
        logo?: string;
        couponsCount: number;
        offersCount: number;
        maxDiscount: string;
        category: string;
      }
    >();

    for (const d of allDeals) {
      const sName = (d.storeName || "").trim();
      if (!sName) continue;
      const key = sName.toLowerCase();
      const existing = map.get(key);

      const hasCode = Boolean(d.code && d.code.length > 1);
      const disc = d.discount || "";

      if (!existing) {
        map.set(key, {
          name: sName,
          slug: d.storeSlug || sName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          query: key,
          logo: d.storeLogo,
          couponsCount: hasCode ? 1 : 0,
          offersCount: 1,
          maxDiscount: disc,
          category: d.category || "General",
        });
      } else {
        existing.offersCount += 1;
        if (hasCode) existing.couponsCount += 1;
        if (d.storeLogo && !existing.logo) existing.logo = d.storeLogo;
        if (disc && (!existing.maxDiscount || disc.includes("%"))) {
          existing.maxDiscount = disc;
        }
      }
    }

    return Array.from(map.values()).sort(
      (a, b) => b.couponsCount * 2 + b.offersCount - (a.couponsCount * 2 + a.offersCount)
    );
  }, [allDeals]);

  // Filtered stores for the Stores Directory tab
  const filteredStoresList = useMemo(() => {
    return allRealStores.filter((store) => {
      if (storeSearchQuery) {
        const q = storeSearchQuery.toLowerCase().trim();
        if (!store.name.toLowerCase().includes(q) && !store.category.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (storeAlphabetFilter !== "All") {
        const first = store.name.trim().charAt(0).toUpperCase();
        if (first !== storeAlphabetFilter) return false;
      }
      return true;
    });
  }, [allRealStores, storeSearchQuery, storeAlphabetFilter]);

  // Unique brand/store count across all active offers
  const totalBrandsCount = useMemo(() => {
    return allRealStores.length > 0 ? allRealStores.length : 241;
  }, [allRealStores]);

  // Dynamic current month name for header sales link
  const currentMonthSalesLabel = useMemo(() => {
    const now = new Date();
    const month = now.toLocaleString("en-US", { month: "long" });
    return `${month} Sales`;
  }, []);

  // Filter deals dynamically based on all user filters
  const filteredOffers = useMemo(() => {
    const now = Date.now();
    return allDeals.filter((deal) => {
      // 1. Drop expired deals
      if (deal.expiresIn === "Expired") return false;
      if (deal.endDate) {
        const end = new Date(deal.endDate).getTime();
        if (!isNaN(end) && end < now) return false;
      }

      // 2. Filter by Popular Brand click
      if (selectedBrandFilter) {
        const sName = (deal.storeName || "").toLowerCase();
        const bFilter = selectedBrandFilter.toLowerCase();
        if (!sName.includes(bFilter) && !deal.title.toLowerCase().includes(bFilter)) {
          return false;
        }
      }

      // 3. Filter by Alphabet (A-Z)
      if (selectedAlphabet !== "All") {
        const firstLetter = (deal.storeName || "").trim().charAt(0).toUpperCase();
        if (firstLetter !== selectedAlphabet) {
          return false;
        }
      }

      // 4. Filter by Category
      if (selectedCategory !== "all") {
        const dCat = (deal.category || "").toLowerCase();
        const sel = selectedCategory.toLowerCase();
        if (dCat !== sel && !dCat.includes(sel) && !sel.includes(dCat)) {
          return false;
        }
      }

      // 5. Filter by Festivals
      if (activeSidebarTab === "festivals") {
        const text = `${deal.title} ${deal.category} ${deal.terms || ""}`.toLowerCase();
        const isFestive =
          text.includes("sale") ||
          text.includes("festival") ||
          text.includes("festive") ||
          text.includes("diwali") ||
          text.includes("dhamaka") ||
          text.includes("mega") ||
          text.includes("super") ||
          deal.badge === "Exclusive" ||
          deal.badge === "Trending";
        if (!isFestive) return false;
      }

      // 6. Filter by Product Deals (50%+ discount)
      if (activeSidebarTab === "product-deals") {
        const dText = deal.discount.toLowerCase();
        const hasHighDiscount =
          dText.includes("50%") ||
          dText.includes("60%") ||
          dText.includes("70%") ||
          dText.includes("80%") ||
          dText.includes("₹1000") ||
          dText.includes("₹2000") ||
          dText.includes("₹500");
        if (!hasHighDiscount && deal.badge !== "Trending") return false;
      }

      // 7. Filter by Search Query
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesSearch =
          deal.title.toLowerCase().includes(q) ||
          deal.storeName.toLowerCase().includes(q) ||
          deal.code.toLowerCase().includes(q) ||
          deal.discount.toLowerCase().includes(q) ||
          deal.category.toLowerCase().includes(q) ||
          (deal.terms && deal.terms.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [allDeals, selectedBrandFilter, selectedAlphabet, selectedCategory, activeSidebarTab, searchQuery]);

  // Reset pagination when filter criteria change
  useEffect(() => {
    setVisibleCount(36);
  }, [selectedCategory, searchQuery, sortBy, selectedAlphabet, selectedBrandFilter, activeSidebarTab]);

  const visibleOffers = useMemo(() => {
    return filteredOffers.slice(0, visibleCount);
  }, [filteredOffers, visibleCount]);

  const toggleExpand = (dealId: string) => {
    setExpandedDealIds((prev) => {
      const next = new Set(prev);
      if (next.has(dealId)) {
        next.delete(dealId);
      } else {
        next.add(dealId);
      }
      return next;
    });
  };

  const handleRedeemDeal = (deal: Deal, e?: React.MouseEvent) => {
    const hasCode = Boolean(deal.code && deal.code.trim().length > 1);
    if (hasCode) {
      const code = deal.code.trim();
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`Coupon code "${code}" copied! Opening ${deal.storeName} to auto-apply...`);
      setTimeout(() => setCopiedCode((curr) => (curr === code ? null : curr)), 5000);
    } else {
      setCopiedCode(deal.id);
      toast.success(`Activating ${deal.discount}! Opening ${deal.storeName}...`);
      setTimeout(() => setCopiedCode((curr) => (curr === deal.id ? null : curr)), 5000);
    }
  };

  const handleCardBoxClick = (deal: Deal, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, select, textarea")) {
      return;
    }
    const affiliateUrl = wrapAffiliateTracking(deal.link, "gocoupon_offers_box");
    handleRedeemDeal(deal, e);
    window.open(affiliateUrl, "_blank", "noopener,noreferrer");
  };

  const handleLiveSync = async () => {
    setIsSyncing(true);
    toast.info("Connecting to Cuelinks & Admitad APIs... Ingesting fresh live deals.");
    try {
      const res = await triggerLiveSync();
      await Promise.allSettled([refetchIndian(), refetchIntl()]);
      if (res.success) {
        toast.success(`Synced fresh live offers from partner networks!`);
      } else {
        toast.success(`Refreshed ${allDeals.length} active live offers!`);
      }
    } catch {
      toast.error("Could not sync right now, using active live deals pool.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePopularBrandClick = (brandQuery: string) => {
    if (selectedBrandFilter === brandQuery) {
      setSelectedBrandFilter(null);
    } else {
      setSelectedBrandFilter(brandQuery);
      setSelectedAlphabet("All");
      setActiveSidebarTab("brands");
      setTimeout(() => {
        dealsGridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };


  const currentSortObj = SORT_OPTIONS.find((s) => s.id === sortBy) || SORT_OPTIONS[0];
  const CurrentSortIcon = currentSortObj.icon;

  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Brands & Offers", path: "/offers" },
  ]);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: filteredOffers.slice(0, 10).map((deal, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: deal.title,
      description: `${deal.discount} at ${deal.storeName}${
        deal.code && deal.code.length > 1 ? ` — use code ${deal.code}` : ` — no code needed, discount auto-applied`
      }`,
      url: wrapAffiliateTracking(deal.link, "gocoupon_schema_offers"),
    })),
  };

  const hasActiveFilters = Boolean(
    selectedBrandFilter ||
      selectedAlphabet !== "All" ||
      selectedCategory !== "all" ||
      searchQuery.trim().length > 0
  );

  const resetAllFilters = () => {
    setSelectedBrandFilter(null);
    setSelectedAlphabet("All");
    setSelectedCategory("all");
    setSearchQuery("");
  };

  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* 1. TOP QUICK NAVIGATION BAR                                              */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <div className="border-b border-border/80 bg-background/95 backdrop-blur-md px-4 sm:px-6 py-2.5 sticky top-0 z-30 shadow-xs">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left Quick Category & Festive Links */}
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar font-semibold">
            <button
              type="button"
              onClick={() => setActiveSidebarTab("categories")}
              className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeSidebarTab === "categories" ? "text-primary font-bold" : "text-foreground/80 hover:text-primary"
              }`}
            >
              <Grid className="h-4 w-4 text-primary" />
              <span>Categories</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSidebarTab("stores")}
              className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeSidebarTab === "stores" ? "text-primary font-bold" : "text-foreground/80 hover:text-primary"
              }`}
            >
              <Store className="h-4 w-4 text-primary" />
              <span>Stores</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSidebarTab("festivals")}
              className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeSidebarTab === "festivals" ? "text-primary font-bold" : "text-foreground/80 hover:text-primary"
              }`}
            >
              <Calendar className="h-4 w-4 text-amber-500" />
              <span>{currentMonthSalesLabel}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSidebarTab("product-deals")}
              className="hidden md:inline-flex items-center gap-1.5 text-foreground/80 hover:text-primary transition-colors cursor-pointer"
            >
              <Compass className="h-4 w-4 text-violet-500" />
              <span>Indulge</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSortBy("discount");
                setActiveSidebarTab("product-deals");
              }}
              className="inline-flex items-center gap-1.5 text-foreground/80 hover:text-primary transition-colors cursor-pointer"
            >
              <Zap className="h-4 w-4 text-amber-500" />
              <span>Deals Of The Day</span>
            </button>
          </div>

          {/* Right Action: Submit Coupon + Festive Special Pill Button */}
          <div className="flex items-center gap-2.5 ml-auto">
            <SubmitCouponButton variant="header" />

            {/* Festive Highlight Pill */}
            <button
              type="button"
              onClick={() => {
                setActiveSidebarTab("festivals");
                toast.info("Showing Festive & Seasonal Shopping Offers!");
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#1e3a8a] dark:bg-[#2563eb] text-white px-3.5 py-1.5 text-xs font-bold shadow-sm hover:brightness-110 transition-all cursor-pointer"
            >
              <Gift className="h-3.5 w-3.5" />
              <span>Festive Super Offers</span>
            </button>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* 2. BREADCRUMB & PAGE HEADER STATS                                         */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <section className="bg-background px-4 sm:px-6 pt-5 pb-4 border-b border-border/60">
        <div className="mx-auto max-w-7xl space-y-3">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <a href="/" className="hover:text-foreground transition-colors">
              Home
            </a>
            <span>&rsaquo;</span>
            <span className="font-semibold text-foreground capitalize">
              {activeSidebarTab === "brands"
                ? "Brands"
                : activeSidebarTab === "categories"
                ? "Categories"
                : activeSidebarTab === "stores"
                ? "Stores"
                : activeSidebarTab === "banks"
                ? "Bank Offers"
                : activeSidebarTab === "festivals"
                ? "Festive Offers"
                : "Product Deals"}
            </span>
          </div>

          {/* Header Row with Icon, Title, and Verification Metrics */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border/80 bg-card shadow-xs text-primary">
                <Tag className="h-6 w-6 stroke-[2.2]" />
              </div>
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {activeSidebarTab === "brands"
                    ? "Brands"
                    : activeSidebarTab === "banks"
                    ? "Bank Offers & Discounts"
                    : activeSidebarTab === "festivals"
                    ? "Festive Shopping Offers"
                    : activeSidebarTab === "categories"
                    ? "Shop By Category"
                    : activeSidebarTab === "stores"
                    ? "Merchant Stores"
                    : "Product Deals Of The Day"}
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Hand-verified coupons, exclusive brand promotions &amp; price-drop discounts
                </p>
              </div>
            </div>

            {/* Metrics Box */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-xs">
              <div className="border-l border-border/80 pl-4 sm:pl-6 first:border-0 first:pl-0">
                <div className="font-mono text-base sm:text-lg font-black text-foreground">
                  {totalBrandsCount}
                </div>
                <div className="text-[11px] text-muted-foreground font-medium">Total Brands</div>
              </div>

              <div className="border-l border-border/80 pl-4 sm:pl-6">
                <div className="font-mono text-base sm:text-lg font-black text-foreground">
                  {allDeals.length > 0 ? allDeals.length.toLocaleString() : "966"}
                </div>
                <div className="text-[11px] text-muted-foreground font-medium">Total Coupons &amp; Offers</div>
              </div>

              {/* Sync Button */}
              <button
                type="button"
                onClick={handleLiveSync}
                disabled={isSyncing}
                className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary hover:bg-primary/20 transition-all cursor-pointer disabled:opacity-50"
                title="Refresh deals feed from Cuelinks and Admitad"
              >
                <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
                <span>{isSyncing ? "Syncing..." : "Sync Live Deals"}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* 3. MAIN BODY: LEFT SIDEBAR + CONTENT AREA                                 */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row items-start gap-8">

          {/* ── Left Discovery Sidebar ── */}
          <aside className="w-full lg:w-56 shrink-0 lg:sticky lg:top-20 z-20">
            <div className="rounded-2xl border border-border/70 bg-card p-2.5 shadow-xs">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold hidden lg:block">
                Navigation
              </div>

              <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto no-scrollbar py-1 lg:py-0">
                {SIDEBAR_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeSidebarTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveSidebarTab(tab.id);
                        if (tab.id === "brands") {
                          setSelectedBrandFilter(null);
                        }
                      }}
                      className={`group flex items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150 cursor-pointer shrink-0 ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm font-bold"
                          : "text-foreground/80 hover:bg-muted/70 hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`h-4 w-4 ${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"}`} />
                        <span>{tab.label}</span>
                      </div>
                      {tab.badge && (
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Market Region Filter */}
              <div className="mt-4 pt-3 border-t border-border/70 hidden lg:block">
                <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                  Region Pool
                </div>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setMarketRegion("all")}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                      marketRegion === "all" ? "bg-muted font-bold text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-primary" />
                      <span>All Regions</span>
                    </span>
                    <span className="text-[10px] font-mono opacity-70">
                      {(indianDeals?.length || 0) + (intlDeals?.length || 0)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMarketRegion("in")}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                      marketRegion === "in" ? "bg-muted font-bold text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>🇮🇳 India Retail</span>
                    <span className="text-[10px] font-mono opacity-70">{indianDeals?.length || 0}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMarketRegion("intl")}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                      marketRegion === "intl" ? "bg-muted font-bold text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>🌍 Global / US</span>
                    <span className="text-[10px] font-mono opacity-70">{intlDeals?.length || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main Content Area ── */}
          <main className="flex-1 min-w-0 space-y-8 w-full">

            {/* ───────────────────────────────────────────────────────────────── */}
            {/* VIEW A: BANK OFFERS TAB                                           */}
            {/* ───────────────────────────────────────────────────────────────── */}
            {activeSidebarTab === "banks" && (
              <div className="space-y-6 animate-in fade-in-50 duration-200">
                <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 p-6">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <Landmark className="h-5 w-5" />
                    <span>Bank Discount Arbitrage</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-foreground mt-1">
                    Instant Bank Card Offers &amp; Stacking Discounts
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
                    Save an additional 5% to 15% off by pairing these exclusive bank partner codes with existing merchant discounts at checkout.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {BANK_OFFERS_DATA.map((bank, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Top: Official Bank Logo + Bank Name & Type + Discount Badge */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-11 w-11 rounded-xl bg-white dark:bg-card border border-border/80 p-1.5 shrink-0 flex items-center justify-center shadow-xs">
                              <img
                                src={bank.logo}
                                alt={`${bank.bankName} logo`}
                                className="max-h-full max-w-full object-contain"
                                loading="lazy"
                              />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-display font-bold text-base text-foreground truncate">
                                {bank.bankName}
                              </h3>
                              <div className="text-xs text-muted-foreground mt-0.5 font-medium truncate">
                                {bank.cardType}
                              </div>
                            </div>
                          </div>

                          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0 font-mono">
                            {bank.discount}
                          </span>
                        </div>

                        {/* Order & Savings Specs */}
                        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-muted-foreground">Min Order: </span>
                            <strong className="text-foreground font-mono">{bank.minOrder}</strong>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Max Savings: </span>
                            <strong className="text-foreground font-mono">{bank.maxSavings}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-2">
                        {/* Coupon Code Block */}
                        <div className="flex items-center justify-between gap-3 bg-muted/40 rounded-xl p-2.5 border border-border/60">
                          <div className="font-mono text-xs font-bold text-foreground">
                            Code: <span className="text-primary font-black tracking-wider text-sm">{bank.code}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(bank.code);
                              toast.success(`Bank code "${bank.code}" copied to clipboard!`);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary px-3 py-1.5 text-xs font-bold transition-all cursor-pointer"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy Code</span>
                          </button>
                        </div>

                        {/* Applicable Stores */}
                        <div className="mt-3 text-[11px] text-muted-foreground flex flex-wrap items-center gap-1.5">
                          <span className="font-medium text-muted-foreground/80">Valid on:</span>
                          {bank.applicableStores.map((st) => (
                            <span key={st} className="rounded-md bg-muted/70 px-1.5 py-0.5 text-[10px] font-medium text-foreground">
                              {st}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* ───────────────────────────────────────────────────────────────── */}
            {/* VIEW B: ALL REAL CATEGORIES HUB                                   */}
            {/* ───────────────────────────────────────────────────────────────── */}
            {activeSidebarTab === "categories" && (
              <section className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-4 sm:p-5">
                  <div>
                    <div className="flex items-center gap-2 text-primary font-bold text-xs">
                      <Grid className="h-4 w-4" />
                      <span>Live Category Directory</span>
                    </div>
                    <h2 className="font-display text-xl sm:text-2xl font-black text-foreground mt-0.5">
                      All Available Categories ({allRealCategories.length})
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Explore hand-verified deals and coupon codes across all shopping categories.
                    </p>
                  </div>

                  {selectedCategory !== "all" && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("all")}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-primary hover:bg-muted transition-all cursor-pointer"
                    >
                      <span>Filtered by: <strong>{selectedCategory}</strong></span>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {allRealCategories.map((cat) => {
                    const meta = ALL_CATEGORY_META[cat.name] || { label: cat.name, icon: Tag };
                    const CatIcon = meta.icon;
                    const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();

                    return (
                      <div
                        key={cat.name}
                        onClick={() => {
                          setSelectedCategory(isSelected ? "all" : cat.name);
                          dealsGridRef.current?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className={`group flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                              <CatIcon className="h-5 w-5" />
                            </div>
                            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {cat.maxDiscount || "Verified Deals"}
                            </span>
                          </div>

                          <h3 className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors">
                            {cat.name}
                          </h3>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                            {cat.description || `Hand-verified ${cat.name} discount coupons & deals.`}
                          </p>

                          {cat.topStores.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {cat.topStores.map((st) => (
                                <span key={st} className="rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium">
                                  {st}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-foreground">
                            {cat.offersCount} Deals
                          </span>
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            {cat.couponsCount} Codes
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ───────────────────────────────────────────────────────────────── */}
            {/* VIEW C: ALL STORES DIRECTORY (Real Data across 240+ Stores)        */}
            {/* ───────────────────────────────────────────────────────────────── */}
            {activeSidebarTab === "stores" && (
              <section className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-4 sm:p-5">
                  <div>
                    <div className="flex items-center gap-2 text-primary font-bold text-xs">
                      <Store className="h-4 w-4" />
                      <span>Live Merchant Directory</span>
                    </div>
                    <h2 className="font-display text-xl sm:text-2xl font-black text-foreground mt-0.5">
                      All Available Stores ({allRealStores.length})
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Browse and filter coupons across all {allRealStores.length} partner stores.
                    </p>
                  </div>

                  {selectedBrandFilter && (
                    <button
                      type="button"
                      onClick={() => setSelectedBrandFilter(null)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-primary hover:bg-muted transition-all cursor-pointer self-start sm:self-auto"
                    >
                      <span>Filtered by: <strong>{selectedBrandFilter}</strong></span>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Stores Search Bar & Alphabet Filter */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card border border-border rounded-2xl p-3 shadow-xs">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder={`Search ${allRealStores.length} stores & brands...`}
                      value={storeSearchQuery}
                      onChange={(e) => setStoreSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background pl-9 pr-8 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                    />
                    {storeSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setStoreSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Alphabet Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                    {ALPHABET.map((letter) => {
                      const isSelected = storeAlphabetFilter === letter;
                      return (
                        <button
                          key={letter}
                          type="button"
                          onClick={() => setStoreAlphabetFilter(letter)}
                          className={`inline-flex items-center justify-center shrink-0 min-w-[28px] h-7 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-primary text-primary-foreground shadow-xs font-extrabold"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          {letter}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Store Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                  {filteredStoresList.map((store) => {
                    const isSelected = selectedBrandFilter?.toLowerCase() === store.name.toLowerCase();
                    return (
                      <div
                        key={store.name}
                        onClick={() => {
                          setSelectedBrandFilter(isSelected ? null : store.name);
                          dealsGridRef.current?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className={`group relative flex flex-col justify-between rounded-2xl border p-3.5 transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </div>
                        )}

                        <div className="flex flex-col items-center text-center">
                          <StoreLogo
                            storeName={store.name}
                            storeLogo={store.logo}
                            className="h-12 w-12 rounded-xl p-1.5 mb-2 shadow-xs"
                            imageClassName="max-h-full max-w-full object-contain"
                          />
                          <h4 className="font-display font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {store.name}
                          </h4>
                          <span className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                            {store.category}
                          </span>
                        </div>

                        <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-foreground font-bold">{store.offersCount} Deals</span>
                          {store.couponsCount > 0 ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{store.couponsCount} Codes</span>
                          ) : (
                            <span className="text-muted-foreground">Active</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ───────────────────────────────────────────────────────────────── */}
            {/* VIEW D: POPULAR BRANDS SECTION (Brands Tab)                       */}
            {/* ───────────────────────────────────────────────────────────────── */}
            {activeSidebarTab === "brands" && (
              <section className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    Popular Brands
                  </h2>
                  {selectedBrandFilter && (
                    <button
                      type="button"
                      onClick={() => setSelectedBrandFilter(null)}
                      className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Clear Brand Filter</span>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* 4-Column Grid of Popular Brands */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {popularBrands.map((brand) => {
                    const isSelected = selectedBrandFilter === brand.query;
                    return (
                      <div
                        key={brand.name}
                        onClick={() => handlePopularBrandClick(brand.query)}
                        className={`group relative flex flex-col justify-between rounded-2xl border bg-card p-4 transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${
                          isSelected
                            ? "border-primary ring-2 ring-primary/20 shadow-md bg-primary/5"
                            : "border-border/80 hover:border-primary/50"
                        }`}
                      >
                        {/* Selected Indicator */}
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        )}

                        {/* Centered Brand Logo Box */}
                        <div
                          className={`h-24 sm:h-28 w-full rounded-xl flex items-center justify-center p-3 mb-3 transition-colors ${
                            brand.bgClass || "bg-muted/20 group-hover:bg-muted/40"
                          }`}
                        >
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="max-h-12 max-w-[120px] object-contain drop-shadow-xs group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                        </div>

                        {/* Brand Name & Counts */}
                        <div>
                          <h3 className="font-display font-bold text-sm sm:text-base text-foreground leading-snug">
                            {brand.name}
                          </h3>
                          <div className="text-xs text-muted-foreground mt-0.5 font-medium">
                            {brand.couponsCount} Coupons &bull; {brand.offersCount} Offers
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ───────────────────────────────────────────────────────────────── */}
            {/* VIEW D: ALL BRANDS & OFFERS MATRIX                                */}
            {/* ───────────────────────────────────────────────────────────────── */}
            <section ref={dealsGridRef} className="space-y-4 pt-2">
              {/* Header with Title & Grid Density / View Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    {selectedCategory !== "all"
                      ? `${selectedCategory} Coupons & Deals`
                      : selectedBrandFilter
                      ? `${selectedBrandFilter} Offers`
                      : "All Brands & Offers"}
                  </h2>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-mono font-semibold text-muted-foreground">
                    {filteredOffers.length} Live
                  </span>
                </div>

                {/* View Switcher Icons */}
                <div className="flex items-center gap-1 rounded-xl border border-border/80 bg-card p-1 shadow-xs">
                  {/* 2 Columns */}
                  <button
                    type="button"
                    onClick={() => setViewDensity("2-col")}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      viewDensity === "2-col"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="2 Columns View"
                  >
                    <Columns2 className="h-4 w-4" />
                  </button>

                  {/* 3 Columns */}
                  <button
                    type="button"
                    onClick={() => setViewDensity("3-col")}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      viewDensity === "3-col"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="3 Columns View"
                  >
                    <Columns3 className="h-4 w-4" />
                  </button>

                  {/* 4 Columns */}
                  <button
                    type="button"
                    onClick={() => setViewDensity("4-col")}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      viewDensity === "4-col"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="4 Columns View"
                  >
                    <Columns4 className="h-4 w-4" />
                  </button>

                  {/* List View */}
                  <button
                    type="button"
                    onClick={() => setViewDensity("list")}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      viewDensity === "list"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="List View"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Alphabet Navigation & Search Bar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 bg-card/80 border border-border/80 rounded-2xl p-3 shadow-xs">
                {/* Alphabet Pills Bar */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                  {ALPHABET.map((letter) => {
                    const isSelected = selectedAlphabet === letter;
                    return (
                      <button
                        key={letter}
                        type="button"
                        onClick={() => {
                          setSelectedAlphabet(letter);
                          setSelectedBrandFilter(null);
                        }}
                        className={`inline-flex items-center justify-center shrink-0 min-w-[28px] h-7 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-xs font-extrabold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>

                {/* Search Bar */}
                <div className="relative shrink-0 w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by brands or offer name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background pl-9 pr-8 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full text-muted-foreground hover:text-foreground"
                      aria-label="Clear search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Secondary Controls Bar: Active Filters Chips + Category Pills + Sort */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {Object.entries(ALL_CATEGORY_META).map(([catId, meta]) => {
                    const isSelected = selectedCategory === catId;
                    const Icon = meta.icon;
                    return (
                      <button
                        key={catId}
                        type="button"
                        onClick={() => setSelectedCategory(catId)}
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-foreground text-background shadow-xs font-bold"
                            : "border border-border/80 bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
                        }`}
                      >
                        <Icon className="h-3 w-3" />
                        <span>{meta.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Sort Dropdown */}
                <div className="relative ml-auto" ref={sortDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3 py-1 text-xs font-semibold text-foreground shadow-xs hover:border-primary/40 transition-all cursor-pointer"
                  >
                    <CurrentSortIcon className={`h-3.5 w-3.5 ${currentSortObj.color}`} />
                    <span className="text-muted-foreground">Sort:</span>
                    <span className="font-bold">{currentSortObj.label}</span>
                    <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isSortOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 z-50 rounded-2xl border border-border bg-card p-1.5 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150">
                      <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                        Sort Offers
                      </div>
                      {SORT_OPTIONS.map((opt) => {
                        const OptIcon = opt.icon;
                        const isSelected = sortBy === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setSortBy(opt.id);
                              setIsSortOpen(false);
                            }}
                            className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                              isSelected ? "bg-primary/10 text-primary font-bold" : "text-foreground hover:bg-muted/60"
                            }`}
                          >
                            <span className="inline-flex items-center gap-2">
                              <OptIcon className={`h-3.5 w-3.5 ${opt.color}`} />
                              <span>{opt.label}</span>
                            </span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-primary stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Active Filter Badges with Quick Reset */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 pt-1 animate-in fade-in-50">
                  <span className="text-xs text-muted-foreground font-medium">Active filters:</span>

                  {selectedBrandFilter && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      Brand: {selectedBrandFilter}
                      <button onClick={() => setSelectedBrandFilter(null)} className="hover:text-foreground">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}

                  {selectedAlphabet !== "All" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      Letter: {selectedAlphabet}
                      <button onClick={() => setSelectedAlphabet("All")} className="hover:text-foreground">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}

                  {selectedCategory !== "all" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      Category: {selectedCategory}
                      <button onClick={() => setSelectedCategory("all")} className="hover:text-foreground">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}

                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      Search: &ldquo;{searchQuery}&rdquo;
                      <button onClick={() => setSearchQuery("")} className="hover:text-foreground">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}


                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="text-xs text-rose-500 font-bold hover:underline cursor-pointer ml-1"
                  >
                    Reset All
                  </button>
                </div>
              )}

              {/* ───────────────────────────────────────────────────────────────── */}
              {/* OFFERS CARDS RENDERING                                            */}
              {/* ───────────────────────────────────────────────────────────────── */}
              {isLoading ? (
                <DealGridSkeleton count={8} />
              ) : filteredOffers.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border py-16 text-center px-4 bg-card/40">
                  <SlidersHorizontal className="mx-auto h-8 w-8 text-muted-foreground/60 mb-3" />
                  <p className="text-base font-bold text-foreground">
                    No verified offers found matching your current filter.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Try clearing your brand or letter selection to view all {allDeals.length} live verified offers.
                  </p>
                  <button
                    onClick={resetAllFilters}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all cursor-pointer"
                  >
                    View All {allDeals.length} Verified Offers
                  </button>
                </div>
              ) : viewDensity === "list" ? (
                /* ── LIST VIEW ── */
                <div className="space-y-3.5">
                  {visibleOffers.map((deal) => {
                    const affiliateUrl = wrapAffiliateTracking(deal.link, "gocoupon_offers_list");
                    const isCopied = Boolean(copiedCode && (copiedCode === deal.code || copiedCode === deal.id));
                    const isExpanded = expandedDealIds.has(deal.id);

                    return (
                      <div
                        key={deal.id}
                        onClick={(e) => handleCardBoxClick(deal, e)}
                        className="group relative flex flex-col md:flex-row md:items-center justify-between gap-5 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 transition-all duration-200 hover:border-primary/50 hover:shadow-md cursor-pointer"
                      >
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <StoreLogo
                            storeName={deal.storeName}
                            storeLogo={deal.storeLogo}
                            trackingUrl={deal.link}
                            className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl p-2 shrink-0 group-hover:scale-105 transition-transform"
                            imageClassName="max-h-full max-w-full object-contain"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-bold text-xs text-foreground">{deal.storeName}</span>
                              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.2 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                {deal.badge || "Verified"}
                              </span>
                              <span className="text-[11px] text-muted-foreground font-mono">
                                &bull; {deal.category}
                              </span>
                            </div>

                            <h3 className="font-display text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                              {deal.title}
                            </h3>

                            {deal.terms && (
                              <div className="mt-1">
                                <p className={`text-xs text-muted-foreground ${isExpanded ? "" : "line-clamp-1"} leading-relaxed`}>
                                  {deal.terms}
                                </p>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpand(deal.id);
                                  }}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer pt-0.5"
                                >
                                  <span>{isExpanded ? "Read less" : "Read more"}</span>
                                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                                </button>
                              </div>
                            )}

                            <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] font-mono text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3 text-sky-400" />
                                <span>{deal.expiresIn}</span>
                              </span>
                              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                <Users className="h-3 w-3" />
                                <span>{(deal.usesCount || 1200).toLocaleString()} shoppers saved</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Action */}
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-border/60">
                          <div className="text-left md:text-right">
                            <div className="font-mono text-xl sm:text-2xl font-black text-foreground">
                              {deal.discount}
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">
                              Instant Discount
                            </span>
                          </div>

                          <RedeemCouponButton
                            deal={deal}
                            affiliateUrl={affiliateUrl}
                            isCopied={isCopied}
                            onRedeem={handleRedeemDeal}
                            className="min-w-[200px]"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* ── GRID VIEWS (4 cols, 3 cols, or 2 cols) ── */
                <div
                  className={`grid gap-4 ${
                    viewDensity === "2-col"
                      ? "grid-cols-1 sm:grid-cols-2"
                      : viewDensity === "3-col"
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  }`}
                >
                  {visibleOffers.map((deal) => {
                    const affiliateUrl = wrapAffiliateTracking(deal.link, "gocoupon_offers_grid");
                    const isCopied = Boolean(copiedCode && (copiedCode === deal.code || copiedCode === deal.id));
                    const isExpanded = expandedDealIds.has(deal.id);

                    const accentClass =
                      deal.badge === "Verified"
                        ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60"
                        : deal.badge === "Exclusive"
                        ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800/60"
                        : "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60";

                    return (
                      <div
                        key={deal.id}
                        onClick={(e) => handleCardBoxClick(deal, e)}
                        className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md cursor-pointer overflow-hidden"
                      >
                        {/* Top: Store logo + Badge */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <StoreLogo
                                storeName={deal.storeName}
                                storeLogo={deal.storeLogo}
                                trackingUrl={deal.link}
                                className="h-7 w-7 rounded-lg p-1 shrink-0"
                                imageClassName="max-h-full max-w-full object-contain"
                              />
                              <span className="text-xs font-bold text-foreground truncate leading-none">
                                {deal.storeName}
                              </span>
                            </div>
                            <span className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide shrink-0 ${accentClass}`}>
                              {deal.badge || "Verified"}
                            </span>
                          </div>

                          {/* Discount + Title */}
                          <div className="mb-2.5">
                            <div className="text-xl font-black tracking-tight text-foreground leading-none mb-1 truncate">
                              {deal.discount}
                            </div>
                            <h3 className="text-xs font-medium text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                              {deal.title}
                            </h3>
                          </div>

                          {/* Terms & Conditions toggle */}
                          {deal.terms && (
                            <div className="mb-2.5">
                              <p className={`text-[11px] text-muted-foreground ${isExpanded ? "" : "line-clamp-1"} leading-snug`}>
                                {deal.terms}
                              </p>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpand(deal.id);
                                }}
                                className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-primary hover:underline cursor-pointer pt-0.5"
                              >
                                <span>{isExpanded ? "Less" : "Terms"}</span>
                                <ChevronDown className={`h-2.5 w-2.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                              </button>
                            </div>
                          )}

                          {/* Expiry line */}
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-3 font-mono">
                            <Clock className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                            <span>{deal.expiresIn}</span>
                            <span className="ml-auto opacity-70">{deal.category}</span>
                          </div>
                        </div>

                        {/* Bottom CTA Button */}
                        <div className="pt-2 border-t border-border/50">
                          <RedeemCouponButton
                            deal={deal}
                            affiliateUrl={affiliateUrl}
                            isCopied={isCopied}
                            onRedeem={handleRedeemDeal}
                            fullWidth
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Progressive Load More Controls */}
              {filteredOffers.length > visibleCount && (
                <div className="mt-8 flex flex-col items-center justify-center gap-3 pt-6 border-t border-border/80 text-center">
                  <p className="font-mono text-xs text-muted-foreground">
                    Showing <strong className="text-foreground">{visibleCount}</strong> of{" "}
                    <strong className="text-foreground">{filteredOffers.length}</strong> live offers
                  </p>
                  <div className="w-48 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300 rounded-full"
                      style={{ width: `${Math.min(100, Math.round((visibleCount / filteredOffers.length) * 100))}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => Math.min(filteredOffers.length, prev + 36))}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
                    >
                      Load 36 More Offers ({filteredOffers.length - visibleCount} remaining)
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisibleCount(filteredOffers.length)}
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-all cursor-pointer"
                    >
                      Show All ({filteredOffers.length})
                    </button>
                  </div>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>



      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* 5. TRUST & VERIFICATION GUARANTEE                                         */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <section className="border-t border-border bg-card/30 px-4 sm:px-6 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 font-mono text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2.5 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 rounded-full">
            <ShieldCheck className="h-4 w-4" />
            100% Genuine &amp; Validated Discounts
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-foreground">
            How GoCoupon Verifies Every Brand Offer
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Our automated engine syncs directly with merchant affiliate APIs 24/7. When you click an offer, the promo code is copied automatically and the store is launched with instant verified tracking.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="rounded-2xl border border-border/80 bg-card/80 p-4">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2.5">
                <Check className="h-4 w-4 stroke-[3]" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-foreground">No Expired Codes</h3>
              <p className="text-[11px] text-muted-foreground mt-1">
                Dead codes are dynamically purged from the feed in real-time.
              </p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card/80 p-4">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-2.5">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-foreground">Zero Fake Discounts</h3>
              <p className="text-[11px] text-muted-foreground mt-1">
                Cross-checked against 30-day historical prices to guarantee authentic value.
              </p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card/80 p-4">
              <div className="h-8 w-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500 mb-2.5">
                <Zap className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-foreground">1-Click Auto-Apply</h3>
              <p className="text-[11px] text-muted-foreground mt-1">
                Install the free Chrome extension to test and apply codes automatically at checkout.
              </p>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

export default OffersHubPage;
