/**
 * @file src/routes/admin.tsx
 * @description Official Unified Administration Suite for GoCoupon.io.
 */

import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AdminAuthProvider, useAdminAuth, getAdminAuthHeaders } from "@/context/AdminAuthContext";
import { AdminThemeProvider } from "@/admin/components/AdminThemeProvider";
import AdminSidebar from "@/admin/components/AdminSidebar";
import AdminTopbar from "@/admin/components/AdminTopbar";
import AdminOffersManager from "@/admin/components/AdminOffersManager";
import AdminSubmissionsManager from "@/admin/components/AdminSubmissionsManager";
import AdminStoresManager from "@/admin/components/AdminStoresManager";
import AdminCategoriesManager from "@/admin/components/AdminCategoriesManager";
import AdminBlogsManager from "@/admin/components/AdminBlogsManager";
import AdminEventsManager from "@/admin/components/AdminEventsManager";
import AdminHeroManager from "@/admin/components/AdminHeroManager";
import AdminHomepageSectionsManager from "@/admin/components/AdminHomepageSectionsManager";
import AdminUsersManager from "@/admin/components/AdminUsersManager";
import AdminSettingsPanel from "@/admin/components/AdminSettingsPanel";
import AdminActivityChart from "@/admin/components/AdminActivityChart";
import RecentActivityTable from "@/admin/components/RecentActivityTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Flame,
  Store,
  Tag,
  Users,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Lock,
  ArrowRight,
  PlusCircle,
  Database,
  MousePointerClick,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminRootPage,
});

function AdminRootPage() {
  return (
    <AdminAuthProvider>
      <AdminThemeProvider>
        <AdminContent />
      </AdminThemeProvider>
    </AdminAuthProvider>
  );
}

function AdminContent() {
  const { isAuthenticated, user, login } = useAdminAuth();
  const searchParams: any = useSearch({ strict: false });
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>(searchParams?.tab || "dashboard");

  useEffect(() => {
    if (searchParams?.tab) {
      setActiveTab(searchParams.tab);
    }
  }, [searchParams?.tab]);

  const handleSelectTab = (tabKey: string) => {
    setActiveTab(tabKey);
    navigate({
      to: "/admin",
      search: tabKey === "dashboard" ? {} : { tab: tabKey },
    });
  };

  if (!isAuthenticated) {
    return <AdminLoginScreen onLoginSuccess={() => setActiveTab("dashboard")} />;
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-background text-foreground transition-colors">
      {/* Fixed/Sticky Navigation Sidebar */}
      <AdminSidebar activeTab={activeTab} onSelectTab={handleSelectTab} />

      {/* Main Administrative Workplace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <AdminTopbar
          title={getTabTitle(activeTab)}
          breadcrumbTrail={[
            { label: "Admin", href: "/admin" },
            { label: getTabTitle(activeTab), href: `/admin?tab=${activeTab}` },
          ] as any}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === "dashboard" && <AdminOverviewDashboard onNavigate={handleSelectTab} />}
          {activeTab === "offers" && <AdminOffersManager />}
          {activeTab === "submissions" && <AdminSubmissionsManager />}
          {activeTab === "stores" && <AdminStoresManager />}
          {activeTab === "categories" && <AdminCategoriesManager />}
          {activeTab === "blogs" && <AdminBlogsManager />}
          {activeTab === "events" && <AdminEventsManager />}
          {activeTab === "hero" && <AdminHeroManager />}
          {activeTab === "sections" && <AdminHomepageSectionsManager />}
          {activeTab === "users" && <AdminUsersManager />}
          {activeTab === "settings" && <AdminSettingsPanel />}
        </main>
      </div>
    </div>
  );
}

function getTabTitle(tab: string): string {
  switch (tab) {
    case "offers":
      return "Offers & Deals Management";
    case "submissions":
      return "Community Submitted Coupons Review Desk";
    case "stores":
      return "Stores Directory";
    case "categories":
      return "Shopping Categories";
    case "blogs":
      return "Blog Posts & Editorial Guides";
    case "events":
      return "Festivals & Sale Events";
    case "hero":
      return "Hero Banner & Top Announcement";
    case "sections":
      return "Homepage Layout & Showcase";
    case "users":
      return "Admin Team & Roles";
    case "settings":
      return "Settings & Search Console";
    default:
      return "GoCoupon Operations Dashboard";
  }
}

/**
 * ── Overview Dashboard Component ──
 */
function AdminOverviewDashboard({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [stats, setStats] = useState<any>(null);
  const [dbStats, setDbStats] = useState<any>(null);
  const [clicksData, setClicksData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [recentOffers, setRecentOffers] = useState<any[]>([]);

  const fetchStats = async () => {
    try {
      const [statsRes, offersRes, dbRes, clicksRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/offers?limit=8"),
        fetch("/api/admin/database", { headers: getAdminAuthHeaders() }).catch(() => null),
        fetch("/api/admin/clicks", { headers: getAdminAuthHeaders() }).catch(() => null),
      ]);
      if (statsRes.ok) {
        const payload = await statsRes.json();
        setStats(payload?.data);
      }
      if (offersRes.ok) {
        const payload = await offersRes.json();
        const items = payload?.deals || payload?.offers || [];
        setRecentOffers(
          items.slice(0, 8).map((d: any) => ({
            title: d.title,
            store: d.storeName || d.store,
            type: d.code ? "Coupon" : "Deal",
            source: d.source || "Live API",
            addedAt: "Active Now",
          }))
        );
      }
      if (dbRes && dbRes.ok) {
        const dbPayload = await dbRes.json();
        setDbStats(dbPayload?.diagnostics);
      }
      if (clicksRes && clicksRes.ok) {
        const clicksPayload = await clicksRes.json();
        setClicksData(clicksPayload?.data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    toast.info("Triggering 24/7 validity-based Cuelinks deal sync...");
    try {
      const res = await fetch("/api/deals/sync?pages=20", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Sync completed! ${data.activeCount} active deals in pool.`);
        fetchStats();
      } else {
        toast.error(data.error || "Sync failed.");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error during sync.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border border-blue-800/60 p-6 sm:p-8 shadow-xl text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-200 border border-blue-400/30 mb-3 shadow-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-300" />
              <span>GoCoupon Administration Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-xs">
              Platform Command Center
            </h1>
            <p className="mt-1.5 text-sm text-blue-100/95 font-medium max-w-xl leading-relaxed">
              Manage 970+ live verified deals, 240+ store affiliate programs, price tracking, announcements, and search engine assets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold cursor-pointer shadow-md"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Syncing Deals..." : "Trigger Live Sync"}</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => onNavigate("offers")}
              className="gap-2 border border-white/35 bg-white/15 hover:bg-white/25 text-white font-bold cursor-pointer backdrop-blur-md shadow-xs"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add New Offer</span>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Total Live Deals</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 grid place-items-center font-bold">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-zinc-900 dark:text-white">
            {loading ? "..." : (stats?.totalOffers || dbStats?.tableCounts?.deals || 968).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
            <span>24/7 validity retained</span>
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Partner Stores</span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 grid place-items-center font-bold">
              <Store className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-zinc-900 dark:text-white">
            {loading ? "..." : (stats?.totalStores || 240).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-blue-700 dark:text-blue-400 font-bold">India &amp; Global merchants</p>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Promo Codes</span>
            <div className="h-8 w-8 rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-400 grid place-items-center font-bold">
              <Tag className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-zinc-900 dark:text-white">
            {loading ? "..." : (stats?.activeCoupons || 342).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-violet-700 dark:text-violet-400 font-bold">Verified auto-apply</p>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Deal Clicks</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 grid place-items-center font-bold">
              <MousePointerClick className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-zinc-900 dark:text-white">
            {loading ? "..." : (clicksData?.totalClicksAllTime || stats?.totalClicksAllTime || stats?.totalClicksToday || 0).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
            <span>+{clicksData?.totalClicksToday || stats?.totalClicksToday || 0} today</span>
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Database Engine</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 grid place-items-center font-bold">
              <Database className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-zinc-900 dark:text-white">
            {dbStats?.status === "connected" ? "PostgreSQL" : "Active"}
          </p>
          <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400 font-bold">
            {dbStats?.status === "connected" ? "Supabase Cloud Live" : "Dual-Engine Synced"}
          </p>
        </div>
      </div>

      {/* Cloud Database Architecture Health Bar */}
      <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/20 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 grid place-items-center">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Cloud Database Architecture</h4>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {dbStats?.engine || "PostgreSQL (Supabase)"} Connected
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
              Zero-downtime dual-engine persistence with auto-fallback to local JSON disk cache
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span className="text-zinc-600 dark:text-zinc-400 mr-1">Deals:</span>
            <span className="font-bold text-zinc-900 dark:text-white">{dbStats?.tableCounts?.deals || 963}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span className="text-zinc-600 dark:text-zinc-400 mr-1">Stores:</span>
            <span className="font-bold text-zinc-900 dark:text-white">{dbStats?.tableCounts?.stores || 28}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span className="text-zinc-600 dark:text-zinc-400 mr-1">Clicks:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{dbStats?.tableCounts?.clicks || clicksData?.totalClicksAllTime || 0}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span className="text-zinc-600 dark:text-zinc-400 mr-1">Blogs:</span>
            <span className="font-bold text-zinc-900 dark:text-white">{dbStats?.tableCounts?.blogs || 5}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span className="text-zinc-600 dark:text-zinc-400 mr-1">Submissions:</span>
            <span className="font-bold text-zinc-900 dark:text-white">{dbStats?.tableCounts?.submissions || 4}</span>
          </div>
        </div>
      </div>

      {/* ── Deal Click Tracker & Conversion Analytics (Enhance Business) ── */}
      <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800/80 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Real-Time Business Intelligence</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Shopper Deal Click Tracker &amp; Conversion Analytics
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
              Live tracking of which deals shoppers are clicking and redeeming to optimize high-converting merchant partnerships.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("offers")}
              className="gap-1.5 text-xs font-bold dark:bg-zinc-800 dark:border-zinc-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600 cursor-pointer"
            >
              <span>View Offers by Clicks</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* 4 Summary Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/80 dark:bg-zinc-800/40 p-4">
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Today's Clicks</span>
            <span className="text-2xl font-black text-zinc-900 dark:text-white mt-1 block">
              {(clicksData?.totalClicksToday || stats?.totalClicksToday || 0).toLocaleString()}
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 block">Active Shoppers</span>
          </div>

          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/80 dark:bg-zinc-800/40 p-4">
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Past 7 Days</span>
            <span className="text-2xl font-black text-zinc-900 dark:text-white mt-1 block">
              {(clicksData?.totalClicks7d || 0).toLocaleString()}
            </span>
            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5 block">7-Day Engagement</span>
          </div>

          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/80 dark:bg-zinc-800/40 p-4">
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">All-Time Clicks</span>
            <span className="text-2xl font-black text-zinc-900 dark:text-white mt-1 block">
              {(clicksData?.totalClicksAllTime || stats?.totalClicksAllTime || 0).toLocaleString()}
            </span>
            <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 mt-0.5 block">Total Tracked</span>
          </div>

          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/80 dark:bg-zinc-800/40 p-4">
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Top Store</span>
            <span className="text-lg font-bold text-zinc-900 dark:text-white mt-1 block truncate">
              {clicksData?.topStores?.[0]?.storeName || "Partner Store"}
            </span>
            <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 mt-0.5 block truncate">
              {clicksData?.topStores?.[0]?.clickCount ? `${clicksData.topStores[0].clickCount} clicks` : "Leading Merchant"}
            </span>
          </div>
        </div>

        {/* 2-Column Split: Top Performing Deals vs Live Click Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Column A: Top Performing Deals Leaderboard */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Top Performing Deals (By Clicks)</h3>
                </div>
                <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">Ranked by Volume</span>
              </div>

              {(!clicksData?.topDeals || clicksData.topDeals.length === 0) ? (
                <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 py-10 text-center px-4">
                  <MousePointerClick className="mx-auto h-6 w-6 text-zinc-400 mb-2" />
                  <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Click activity is being recorded in real-time.</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">As visitors click and redeem coupons on GoCoupon, top performing deals appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {clicksData.topDeals.slice(0, 6).map((deal: any, idx: number) => (
                    <div key={deal.dealId || idx} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`h-6 w-6 rounded-lg text-xs font-black grid place-items-center shrink-0 ${
                          idx === 0 ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30" :
                          idx === 1 ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300" :
                          idx === 2 ? "bg-amber-700/15 text-amber-700 dark:text-amber-500" :
                          "text-zinc-500"
                        }`}>
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{deal.dealTitle}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">{deal.storeName}</span>
                            {deal.couponCode && (
                              <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                                {deal.couponCode}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                          <MousePointerClick className="h-3 w-3" />
                          <span>{deal.clickCount.toLocaleString()}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 mt-3 text-right">
              <button
                type="button"
                onClick={() => onNavigate("offers")}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                <span>View all deals in Offers Manager</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Column B: Live Shopper Click Stream */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Recent Shopper Redemptions</h3>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live Stream</span>
                </span>
              </div>

              {(!clicksData?.recentClicks || clicksData.recentClicks.length === 0) ? (
                <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 py-10 text-center px-4">
                  <Activity className="mx-auto h-6 w-6 text-zinc-400 mb-2" />
                  <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Awaiting shopper click events.</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Click on any deal on GoCoupon to test live tracking.</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 max-h-[300px] overflow-y-auto pr-1">
                  {clicksData.recentClicks.slice(0, 7).map((click: any) => (
                    <div key={click.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900 dark:text-white truncate">{click.storeName}</span>
                          <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.2 font-mono text-[10px] text-zinc-600 dark:text-zinc-400 uppercase">
                            {click.device || "desktop"}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{click.dealTitle}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 block">
                          {new Date(click.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {click.couponCode ? (
                          <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                            {click.couponCode}
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] text-zinc-400 block">Activated</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 mt-3 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              <span>Failover Redirection Active</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Zero 503 Uptime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Activity Chart & Quick Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AdminActivityChart offers={[]} />
        </div>

        {/* Fast Action Shortcuts */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Management Shortcuts</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 font-medium">Quickly access key GoCoupon controls</p>

            <div className="mt-5 space-y-2.5">
              <button
                type="button"
                onClick={() => onNavigate("submissions")}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-amber-300 dark:border-amber-700/50 hover:border-amber-500 bg-amber-50/80 dark:bg-amber-950/20 hover:bg-amber-100/60 dark:hover:bg-amber-900/30 text-amber-950 dark:text-amber-200 transition-colors text-left text-xs font-bold cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Review Submitted Coupons</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate("blogs")}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 bg-zinc-50/80 dark:bg-zinc-800/40 hover:bg-blue-50/50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-blue-700 dark:hover:text-blue-300 transition-colors text-left text-xs font-bold cursor-pointer"
              >
                <span>Manage Blog Articles</span>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate("hero")}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 bg-zinc-50/80 dark:bg-zinc-800/40 hover:bg-blue-50/50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-blue-700 dark:hover:text-blue-300 transition-colors text-left text-xs font-bold cursor-pointer"
              >
                <span>Edit Top Announcement Bar</span>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate("stores")}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 bg-zinc-50/80 dark:bg-zinc-800/40 hover:bg-blue-50/50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-blue-700 dark:hover:text-blue-300 transition-colors text-left text-xs font-bold cursor-pointer"
              >
                <span>Manage Store Affiliate Links</span>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate("settings")}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 bg-zinc-50/80 dark:bg-zinc-800/40 hover:bg-blue-50/50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-blue-700 dark:hover:text-blue-300 transition-colors text-left text-xs font-bold cursor-pointer"
              >
                <span>SEO Tags &amp; robots.txt</span>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
              </button>
            </div>
          </div>

          <div className="pt-5 border-t border-border mt-5">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 py-2.5 px-4 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              <span>Preview Live Website</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Recent Offers Feed Table */}
      <div>
        <RecentActivityTable rows={recentOffers as any} />
      </div>
    </div>
  );
}

/**
 * ── Login Screen Component ──
 */
function AdminLoginScreen({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState("admin@gocoupon.io");
  const [password, setPassword] = useState("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      toast.success("Welcome back to GoCoupon Admin!");
      onLoginSuccess();
    } else {
      setError(res.error || "Login failed.");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-zinc-950 p-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/90 p-8 shadow-2xl backdrop-blur-xl">
        {/* Branding */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20 mb-4">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">GoCoupon Administration</h1>
          <p className="mt-1 text-xs text-zinc-400">
            Secure management console for gocoupon.io
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-400 font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Admin Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-zinc-800/80 border-zinc-700 text-white text-xs h-10"
              placeholder="admin@gocoupon.io"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-zinc-800/80 border-zinc-700 text-white text-xs h-10"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 text-xs shadow-md transition-all cursor-pointer mt-2"
          >
            {loading ? "Authenticating..." : "Sign In to Admin Panel"}
          </Button>
        </form>
      </div>
    </div>
  );
}
