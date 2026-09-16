import { useState, useMemo, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { posts as defaultPosts, type Post } from "@/data/posts";
import { breadcrumbSchema, createSeoHead } from "@/lib/seo";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import {
  Search,
  ArrowRight,
  BookOpen,
  Layers,
  Flame,
  Scale,
  LineChart,
  Shield,
  Store,
  Zap,
  Check,
  Copy,
  Share2,
  Clock,
  Calendar,
  Compass,
  ArrowUpRight,
  CheckCircle2,
  TrendingDown,
  Radio,
  SlidersHorizontal,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/blog/")({
  component: BlogIndex,
  head: () =>
    createSeoHead({
      title: "The Savings Intelligence Journal – goCoupon Engineering & Arbitrage Desk",
      description:
        "Deconstructing e-commerce pricing algorithms, coupon mechanics, 30-day price tracking graphs, and discount stacking secrets from the goCoupon research lab.",
      path: "/blog",
      keywords:
        "savings intelligence blog, price tracking india, coupon stacking secrets, amazon flipkart price comparison, gocoupon research, consumer arbitrage india",
    }),
});

interface TopicCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const TOPIC_CATEGORIES: TopicCategory[] = [
  { id: "All", label: "All Dispatches", icon: BookOpen, accentColor: "primary" },
  { id: "Price Comparison", label: "Price Comparison", icon: Scale, accentColor: "cyan" },
  { id: "Deals & Discounts", label: "Deals & Stacking", icon: Flame, accentColor: "amber" },
  { id: "Price Tracking", label: "Price Tracking", icon: LineChart, accentColor: "indigo" },
  { id: "Comparisons", label: "Head-to-Head", icon: Compass, accentColor: "violet" },
  { id: "Shopping Tips", label: "Shopping Hacks", icon: Zap, accentColor: "emerald" },
  { id: "Amazon Tips", label: "Amazon & Flipkart", icon: Store, accentColor: "orange" },
  { id: "Safety & Privacy", label: "Privacy & Tech", icon: Shield, accentColor: "blue" },
];

const STARTER_TRILOGY_SLUGS = [
  "how-to-find-cheaper-products-online-price-comparison-guide",
  "online-shopping-discounts-deals-stacking-secrets-2026",
  "best-price-tracking-tools-india-price-history-guide",
];

function BlogIndex() {
  const [allPosts, setAllPosts] = useState<Post[]>(defaultPosts);
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState<"latest" | "long" | "quick">("latest");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/blogs")
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted || !json.success || !Array.isArray(json.data)) return;
        const map = new Map<string, Post>();
        json.data.forEach((b: any) => {
          if (b.status === "Published" || !b.status) {
            map.set(b.slug, {
              slug: b.slug,
              tag: b.category || b.tag || "General",
              date: b.date || (b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent"),
              title: b.title,
              excerpt: b.shortDescription || b.excerpt || "",
              read: b.readTime || b.read || "5 min read",
              author: b.author || "GoCoupon Editorial",
              cover: b.image || b.cover,
              body: Array.isArray(b.body) ? b.body : [
                { type: "p", text: b.content || b.shortDescription || "" }
              ]
            });
          }
        });
        defaultPosts.forEach((p) => {
          if (!map.has(p.slug)) {
            map.set(p.slug, p);
          }
        });
        setAllPosts(Array.from(map.values()));
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSharePost = (slug: string, title: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/blog/${slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedSlug(slug);
      toast.success(`Copied article link to clipboard!`);
      setTimeout(() => setCopiedSlug(null), 2500);
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSubscribed(true);
    toast.success("Subscribed to the Sunday Arbitrage Dispatch!");
  };

  const filteredPosts = useMemo(() => {
    let result = allPosts.filter((post) => {
      const matchesTag =
        selectedTag === "All" ||
        post.tag.toLowerCase() === selectedTag.toLowerCase() ||
        post.tag.toLowerCase().includes(selectedTag.toLowerCase()) ||
        selectedTag.toLowerCase().includes(post.tag.toLowerCase());
      const matchesSearch =
        searchQuery.trim() === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tag.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTag && matchesSearch;
    });

    if (sortOption === "long") {
      result = [...result].sort((a, b) => {
        const aMin = parseInt(a.read) || 5;
        const bMin = parseInt(b.read) || 5;
        return bMin - aMin;
      });
    } else if (sortOption === "quick") {
      result = [...result].sort((a, b) => {
        const aMin = parseInt(a.read) || 5;
        const bMin = parseInt(b.read) || 5;
        return aMin - bMin;
      });
    }

    return result;
  }, [allPosts, selectedTag, searchQuery, sortOption]);

  const featured =
    allPosts.find(
      (p) => p.slug === "how-to-find-cheaper-products-online-price-comparison-guide"
    ) || allPosts[0];

  const starterTrilogy = useMemo(() => {
    return STARTER_TRILOGY_SLUGS.map((slug) =>
      allPosts.find((p) => p.slug === slug)
    ).filter((p): p is Post => Boolean(p));
  }, [allPosts]);

  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Savings Intelligence Journal", path: "/blog" },
  ]);

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* Conceptual Telemetry Ticker */}
      <div className="border-b border-border/80 bg-muted/40 px-4 py-2 font-mono text-[11px] text-muted-foreground overflow-hidden">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-foreground/90 uppercase tracking-widest text-[10px]">
              GOCOUPON LABS TELEMETRY
            </span>
            <span className="hidden sm:inline text-muted-foreground/50">|</span>
            <span className="hidden sm:inline">24,180+ Active Promo Codes Verified</span>
            <span className="hidden md:inline text-muted-foreground/50">|</span>
            <span className="hidden md:inline">30-Day Anomaly Sensors Active</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="hidden lg:inline">COORD 12.9716° N / 77.5946° E</span>
            <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-primary font-bold">
              EDITION 2026.3
            </span>
          </div>
        </div>
      </div>

      {/* Stylish & Conceptual Editorial Hero */}
      <section className="relative border-b border-border px-4 sm:px-6 pb-16 pt-16 sm:pt-24 overflow-hidden bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-3xl">
              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.08] text-balance">
                Deconstructing algorithms, pricing anomalies &amp;{" "}
                <span className="text-primary block sm:inline">
                  consumer arbitrage.
                </span>
              </h1>
              <p className="mt-6 text-base sm:text-xl text-muted-foreground leading-relaxed max-w-2xl text-balance font-normal">
                Technical checkout dissections, 30-day historical trend benchmarks, coupon auto-apply protocols, and mathematical discount stacking from the goCoupon research team.
              </p>
            </div>

            {/* Conceptual Manifesto Stamp */}
            <div className="hidden lg:flex flex-col justify-between w-80 rounded-2xl border border-dashed border-border/80 bg-card/50 p-5 backdrop-blur-xs font-mono text-xs">
              <div className="flex items-center justify-between text-muted-foreground text-[10px] uppercase tracking-wider pb-3 border-b border-border/60">
                <span>EDITORIAL THESIS</span>
                <Terminal className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className="py-3 text-muted-foreground/90 leading-relaxed text-[11px]">
                “In an online retail world governed by artificial festive markups and phantom discount codes, verified pricing transparency is our primary mandate.”
              </p>
              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-primary font-bold">
                <span>GOCOUPON RESEARCH LAB</span>
                <span>VOL. IV</span>
              </div>
            </div>
          </div>

          {/* Interactive Control & Search Bar */}
          <div className="mt-12 space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search 36+ investigative guides (e.g. Price Comparison, 5-Layer Stacking, Amazon, Buyhatke)…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-card/80 py-3.5 pl-11 pr-20 text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 backdrop-blur-md transition-all shadow-xs touch-manipulation"
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground hover:text-foreground px-2 py-1"
                  >
                    Clear
                  </button>
                ) : (
                  <div className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 items-center gap-1 font-mono text-[10px] text-muted-foreground/60 border border-border rounded px-1.5 py-0.5">
                    <span>⌘</span>
                    <span>K</span>
                  </div>
                )}
              </div>

              {/* Sorting options */}
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-card/80 p-1.5 backdrop-blur-md">
                <span className="px-2.5 font-mono text-[11px] text-muted-foreground hidden sm:inline flex items-center gap-1">
                  <SlidersHorizontal className="h-3 w-3" /> Sort:
                </span>
                <button
                  onClick={() => setSortOption("latest")}
                  className={`rounded-xl px-3 py-1.5 font-mono text-xs font-medium transition-all ${
                    sortOption === "latest"
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Latest
                </button>
                <button
                  onClick={() => setSortOption("long")}
                  className={`rounded-xl px-3 py-1.5 font-mono text-xs font-medium transition-all ${
                    sortOption === "long"
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Deep Dives
                </button>
                <button
                  onClick={() => setSortOption("quick")}
                  className={`rounded-xl px-3 py-1.5 font-mono text-xs font-medium transition-all ${
                    sortOption === "quick"
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Quick Reads
                </button>
              </div>
            </div>

            {/* Creative Topic Archetype Chips */}
            <div className="flex flex-wrap items-center gap-2.5">
              {TOPIC_CATEGORIES.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedTag === category.id;
                const count =
                  category.id === "All"
                    ? allPosts.length
                    : allPosts.filter(
                        (p: Post) =>
                          p.tag.toLowerCase().includes(category.id.toLowerCase()) ||
                          category.id.toLowerCase().includes(p.tag.toLowerCase())
                      ).length;

                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedTag(category.id)}
                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 font-mono text-xs tracking-wider transition-all cursor-pointer ${
                      isSelected
                        ? "bg-foreground text-background font-bold shadow-md scale-[1.02]"
                        : "border border-border/80 bg-card/60 text-muted-foreground hover:border-primary/50 hover:bg-card hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{category.label}</span>
                    <span
                      className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] ${
                        isSelected
                          ? "bg-background/20 text-background font-mono"
                          : "bg-muted text-muted-foreground font-mono"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Hero Bento Showcase: Featured Lead Investigation */}
      {selectedTag === "All" && !searchQuery && featured && (
        <section className="border-b border-border px-4 sm:px-6 py-14 bg-muted/10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">
                <BookOpen className="h-4 w-4" />
                Featured Editorial Lead Investigation
              </div>
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest hidden sm:inline">
                CURATED DOSSIER
              </span>
            </div>

            <Link
              to="/blog/$slug"
              params={{ slug: featured.slug }}
              className="group grid items-stretch gap-8 rounded-3xl border border-border/90 bg-card p-6 sm:p-10 transition-all duration-300 hover:border-primary/60 hover:shadow-2xl md:grid-cols-[1.3fr_1fr]"
            >
              <div className="flex flex-col justify-between">
                <div>
                  <div className="mb-4 flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-bold text-primary">
                      {featured.tag}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {featured.date}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {featured.read}
                    </span>
                  </div>

                  <h2 className="font-display text-2xl sm:text-4xl font-extrabold leading-tight tracking-tight text-foreground group-hover:text-primary transition-colors">
                    {featured.title}
                  </h2>

                  <p className="mt-4 text-muted-foreground text-sm sm:text-base leading-relaxed line-clamp-3">
                    {featured.excerpt}
                  </p>

                  <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <div className="font-mono text-xs font-semibold text-primary uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      CORE INVESTIGATION FINDING
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-sans">
                      Shoppers who cross-reference Amazon, Flipkart, and Croma before purchase saved an average of ₹1,420 per order compared to loyal single-store buyers.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between pt-6 border-t border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center font-display text-xs font-bold text-white shadow">
                      GC
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">{featured.author}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">Intelligence Desk</div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow transition-transform group-hover:translate-x-1">
                    <span>Inspect Full Dossier</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>

              {/* Conceptual Live Arbitrage Radar Graphic */}
              <div
                aria-hidden
                className="hidden md:flex flex-col justify-between rounded-2xl border border-border/80 bg-gradient-to-br from-background via-muted/30 to-background p-6 font-mono relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="text-primary font-bold flex items-center gap-1.5">
                    <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                    LIVE CROSS-STORE BENCHMARK
                  </span>
                  <span className="text-[10px]">REAL-TIME AUDIT</span>
                </div>

                <div className="space-y-3.5 my-6">
                  <div className="rounded-xl border border-border bg-card/80 p-3 shadow-xs">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-foreground/90 font-medium">Sony WH-1000XM5 ANC</span>
                      <span className="text-emerald-500 font-bold">Save ₹2,000</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full w-[85%]" />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>Amazon: ₹26,990</span>
                      <span className="text-emerald-500 font-bold">Flipkart: ₹24,990</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-card/80 p-3 shadow-xs">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-foreground/90 font-medium">Apple MacBook Air M3</span>
                      <span className="text-emerald-500 font-bold">Save ₹2,910</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className="bg-indigo-500 h-1.5 rounded-full w-[92%]" />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>MRP: ₹96,900</span>
                      <span className="text-indigo-400 font-bold">Croma: ₹93,990</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-semibold text-[11px]">Calculated Arbitrage Advantage</span>
                  <span className="font-extrabold text-emerald-400">+18.4% Net Saved</span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Conceptual "Smart Shopper's Trilogy" (Starter Pack Shelf) */}
      {selectedTag === "All" && !searchQuery && starterTrilogy.length === 3 && (
        <section className="border-b border-border px-4 sm:px-6 py-14 bg-background">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground font-semibold">
                CURATED FOUNDATIONAL READING
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
                The Smart Shopper's Trilogy
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Three essential investigative playbooks every consumer must read before buying online.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {starterTrilogy.map((trilogyPost, index) => {
                const numbers = ["01", "02", "03"];
                const accentColors = [
                  "border-cyan-500/30 hover:border-cyan-500/60",
                  "border-amber-500/30 hover:border-amber-500/60",
                  "border-indigo-500/30 hover:border-indigo-500/60",
                ];
                const badgeColors = [
                  "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
                  "bg-amber-500/10 text-amber-400 border-amber-500/20",
                  "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
                ];

                return (
                  <Link
                    key={trilogyPost.slug}
                    to="/blog/$slug"
                    params={{ slug: trilogyPost.slug }}
                    className={`group relative flex flex-col justify-between rounded-3xl border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${accentColors[index]}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg border ${badgeColors[index]}`}>
                          VOL. {numbers[index]}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                          {trilogyPost.read}
                        </span>
                      </div>

                      <h3 className="font-display text-lg font-bold leading-snug text-foreground group-hover:text-primary transition-colors">
                        {trilogyPost.title}
                      </h3>

                      <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {trilogyPost.excerpt}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-semibold text-primary">
                      <span>Read Playbook</span>
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Main Grid of Dispatches & Investigative Stories */}
      <section className="px-4 sm:px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-4">
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {selectedTag === "All" && !searchQuery
                  ? "ALL RESEARCH DISPATCHES"
                  : `FILTERED CLUSTER: ${selectedTag.toUpperCase()}`}
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
                {searchQuery
                  ? `Investigations matching "${searchQuery}"`
                  : "All Engineering & Savings Stories"}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {filteredPosts.length} {filteredPosts.length === 1 ? "Dispatch" : "Dispatches"}
              </span>
            </div>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/60 p-16 text-center max-w-xl mx-auto">
              <div className="h-12 w-12 rounded-2xl bg-muted mx-auto flex items-center justify-center text-muted-foreground mb-4">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">No matching dispatches found</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                We couldn't find any articles matching your search query or tag filter. Try broadening your terms or reset the filters.
              </p>
              <button
                onClick={() => {
                  setSelectedTag("All");
                  setSearchQuery("");
                }}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post, idx) => {
                const isComparison =
                  post.tag.toLowerCase().includes("comparison") ||
                  post.slug.includes("vs") ||
                  post.slug.includes("alternative");
                const isPriceTracking =
                  post.tag.toLowerCase().includes("price") ||
                  post.slug.includes("price-history") ||
                  post.slug.includes("tracking");

                return (
                  <article
                    key={post.slug}
                    className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-6 transition-all duration-300 hover:border-primary/60 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div>
                      {/* Card Header with Meta & Share Button */}
                      <div className="mb-4 flex items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                        <span
                          className={`rounded-full px-3 py-0.5 text-[10px] font-bold border ${
                            isComparison
                              ? "border-violet-500/30 bg-violet-500/10 text-violet-400"
                              : isPriceTracking
                              ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                              : "border-border bg-muted/60 text-foreground/80"
                          }`}
                        >
                          {post.tag}
                        </span>

                        <div className="flex items-center gap-2">
                          <span>{post.read}</span>
                          <button
                            onClick={(e) => handleSharePost(post.slug, post.title, e)}
                            title="Copy link to clipboard"
                            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            {copiedSlug === post.slug ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Share2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {post.cover && (
                        <div className="mb-4 overflow-hidden rounded-2xl border border-border/60 bg-muted/20 aspect-video">
                          <img
                            src={getOptimizedImageUrl(post.cover, { width: 600, height: 340, crop: "fill" })}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                      )}

                      <h3 className="font-display text-lg font-bold leading-snug tracking-tight text-foreground group-hover:text-primary transition-colors">
                        <Link to="/blog/$slug" params={{ slug: post.slug }}>
                          {post.title}
                        </Link>
                      </h3>

                      <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-border/80 pt-4 text-xs">
                      <span className="font-mono text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 opacity-60" />
                        {post.date}
                      </span>

                      <Link
                        to="/blog/$slug"
                        params={{ slug: post.slug }}
                        className="inline-flex items-center gap-1 font-bold text-primary transition-transform group-hover:translate-x-0.5"
                      >
                        <span>Read</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Conceptual Newsletter: "The Sunday Arbitrage Dispatch" */}
      <section className="border-t border-border bg-gradient-to-b from-muted/20 via-background to-background px-4 sm:px-6 py-16">
        <div className="mx-auto max-w-4xl rounded-3xl border border-primary/30 bg-card p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
          />

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              <Zap className="h-3.5 w-3.5" />
              WEEKLY SAVINGS DISPATCH
            </div>

            <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Subscribe to the Sunday Arbitrage Wire
            </h2>

            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Join 48,000+ smart shoppers. We curate the top 5 verified price drop anomalies, hidden store promo codes, and discount stacking playbooks delivered once a week.
            </p>

            {subscribed ? (
              <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 px-6 py-3 text-sm font-semibold text-emerald-500">
                <CheckCircle2 className="h-5 w-5" />
                <span>You are subscribed to the Sunday Arbitrage Wire!</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address…"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 touch-manipulation"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow transition-transform hover:scale-105"
                >
                  Join the Wire
                </button>
              </form>
            )}

            <p className="mt-4 text-[11px] font-mono text-muted-foreground">
              Zero spam. Zero tracking. One-click unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

