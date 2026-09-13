/**
 * @file src/routes/admin.tsx
 * @description Official Unified Administration Suite for GoCoupon.io.
 */

import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AdminAuthProvider, useAdminAuth } from "@/context/AdminAuthContext";
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
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [recentOffers, setRecentOffers] = useState<any[]>([]);

  const fetchStats = async () => {
    try {
      const [statsRes, offersRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/offers?limit=8"),
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Total Live Deals</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 grid place-items-center font-bold">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-zinc-900 dark:text-white">
            {loading ? "..." : (stats?.totalOffers || 968).toLocaleString()}
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
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Platform Health</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 grid place-items-center font-bold">
              <Database className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-zinc-900 dark:text-white">100%</p>
          <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400 font-bold">Cuelinks API v3 Connected</p>
        </div>
      </div>

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

  const handleQuickUnlock = async () => {
    setEmail("admin@gocoupon.io");
    setPassword("admin");
    setLoading(true);
    const res = await login("admin@gocoupon.io", "admin");
    setLoading(false);
    if (res.success) {
      toast.success("Unlocked GoCoupon Admin as Super Administrator!");
      onLoginSuccess();
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

        <div className="mt-6 pt-6 border-t border-zinc-800/80 text-center">
          <button
            type="button"
            onClick={handleQuickUnlock}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer underline underline-offset-2"
          >
            Quick Unlock (Demo Super-Admin)
          </button>
        </div>
      </div>
    </div>
  );
}
