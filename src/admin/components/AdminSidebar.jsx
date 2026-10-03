import { Link, usePathname, useSession, signOut } from "@/admin/compat";
import Logo from "@/components/shared/Logo";
import {
  ADMIN_SECTIONS,
  getSectionForTab,
  canAccessPermission,
  getPermissionsForRole,
} from "@/lib/access-control";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { getAdminAuthHeaders } from "@/context/AdminAuthContext";
import {
  LayoutDashboard,
  Tag,
  Store,
  BookOpen,
  LayoutTemplate,
  Settings,
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";

function getSectionIcon(iconName, className = "h-4 w-4 shrink-0") {
  switch (iconName) {
    case "LayoutDashboard":
      return <LayoutDashboard className={className} />;
    case "Tag":
      return <Tag className={className} />;
    case "Store":
      return <Store className={className} />;
    case "BookOpen":
      return <BookOpen className={className} />;
    case "LayoutTemplate":
      return <LayoutTemplate className={className} />;
    case "Settings":
      return <Settings className={className} />;
    default:
      return <Sparkles className={className} />;
  }
}

function LogOutIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H2.25" />
    </svg>
  );
}

function SidebarInner({ activeTab, onSelectTab, pendingCount, session, pathname, onCloseMobile }) {
  const userRole = session?.data?.user?.role || "admin";
  const userPermissions = getPermissionsForRole(userRole, session?.data?.user?.permissions);
  const activeSection = getSectionForTab(activeTab);

  // Filter sections user is permitted to see
  const visibleSections = ADMIN_SECTIONS.filter((section) => {
    if (userRole === "admin") return true;
    return section.subTabs.some((sub) => canAccessPermission(userPermissions, sub.key));
  });

  const userName =
    session?.data?.user?.name ||
    (session?.data?.user?.email ? session.data.user.email.split("@")[0] : "Admin User");
  const userInitial = userName?.charAt(0)?.toUpperCase() || "A";

  return (
    <div className="flex h-full flex-col justify-between">
      {/* Top Header & Clean Navigation */}
      <div className="space-y-5">
        <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between">
          <div>
            <Logo />
            <div className="mt-2.5 flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                ADMIN HUB
              </span>
              <span className="text-[10px] font-semibold font-mono text-zinc-400">v3.0</span>
            </div>
          </div>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* 6 Primary Workspaces Navigation */}
        <nav className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-250px)] pr-1">
          {visibleSections.map((section) => {
            const isSectionActive = activeSection.id === section.id;
            const hasPendingInSubmissions = section.id === "offers" && pendingCount > 0;

            // Visible sub-tabs for this section
            const visibleSubTabs = section.subTabs.filter((sub) => {
              if (userRole === "admin") return true;
              return canAccessPermission(userPermissions, sub.key);
            });

            return (
              <div key={section.id} className="space-y-1">
                {/* Main Section Link */}
                <Link
                  href={`/admin?tab=${section.defaultTab}`}
                  onClick={(e) => {
                    if (onSelectTab) {
                      e.preventDefault();
                      onSelectTab(section.defaultTab);
                    }
                    if (onCloseMobile && section.subTabs.length <= 1) {
                      onCloseMobile();
                    }
                  }}
                  className={cn(
                    "group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-all duration-150 border cursor-pointer",
                    isSectionActive
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                      : "border-transparent text-zinc-700 dark:text-zinc-300 hover:border-zinc-200 dark:hover:border-zinc-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={cn(isSectionActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white")}>
                      {getSectionIcon(section.iconName)}
                    </span>
                    <span className="truncate">{section.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {hasPendingInSubmissions && (
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-black leading-none",
                          isSectionActive
                            ? "bg-white text-emerald-700 shadow-xs"
                            : "bg-amber-500 text-white animate-pulse"
                        )}
                      >
                        {pendingCount}
                      </span>
                    )}
                    {isSectionActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    )}
                  </div>
                </Link>

                {/* Sub-Tabs Accordion when this section is active */}
                {isSectionActive && visibleSubTabs.length > 1 && (
                  <div className="ml-4 pl-3 border-l-2 border-emerald-200 dark:border-emerald-800/60 space-y-0.5 py-1">
                    {visibleSubTabs.map((sub) => {
                      const isSubActive = activeTab === sub.key;
                      const hasSubPending = sub.key === "submissions" && pendingCount > 0;

                      return (
                        <Link
                          key={sub.key}
                          href={`/admin?tab=${sub.key}`}
                          onClick={(e) => {
                            if (onSelectTab) {
                              e.preventDefault();
                              onSelectTab(sub.key);
                            }
                            if (onCloseMobile) {
                              onCloseMobile();
                            }
                          }}
                          className={cn(
                            "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold transition-colors cursor-pointer",
                            isSubActive
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold"
                              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                          )}
                        >
                          <span className="truncate">{sub.label}</span>
                          {hasSubPending && (
                            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-white leading-none">
                              {pendingCount}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Pinned User Profile & Quick Actions */}
      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-4">
        <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/60 p-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-600 font-extrabold text-white text-xs shadow-2xs">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-zinc-900 dark:text-white leading-tight">{userName}</p>
              <p className="truncate text-[10.5px] font-medium capitalize text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">
                {userRole === "admin" ? "Super Administrator" : userRole}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin" })}
            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-700 hover:bg-rose-600 dark:hover:bg-rose-600 py-2 px-3 text-xs font-semibold text-white shadow-xs transition-colors duration-150 cursor-pointer"
          >
            <LogOutIcon />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSidebar({ activeTab, onSelectTab, mobileOpen, onCloseMobile }) {
  const pathname = usePathname();
  const session = useSession();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let active = true;
    async function loadPending() {
      try {
        const res = await fetch("/api/admin/submissions?status=pending", { headers: getAdminAuthHeaders() });
        const json = await res.json();
        if (active && json.counts?.pending !== undefined) {
          setPendingCount(json.counts.pending);
        }
      } catch {}
    }
    loadPending();
    const interval = setInterval(loadPending, 12000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors shrink-0 overflow-y-auto z-40 p-5">
        <SidebarInner
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          pendingCount={pendingCount}
          session={session}
          pathname={pathname}
        />
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 z-50 shadow-2xl p-5 overflow-y-auto animate-in slide-in-from-left duration-200">
            <SidebarInner
              activeTab={activeTab}
              onSelectTab={onSelectTab}
              pendingCount={pendingCount}
              session={session}
              pathname={pathname}
              onCloseMobile={onCloseMobile}
            />
          </div>
        </div>
      )}
    </>
  );
}
