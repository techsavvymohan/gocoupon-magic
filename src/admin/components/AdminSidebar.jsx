import { Link, usePathname, useSession, signOut } from "@/admin/compat";
import Logo from "@/components/shared/Logo";
import { PERMISSIONS, canAccessPermission, getPermissionsForRole } from "@/lib/access-control";
import { cn } from "@/lib/utils";

function LogOutIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H2.25" />
    </svg>
  );
}

import { useState, useEffect } from "react";

export default function AdminSidebar({ activeTab, onSelectTab }) {
  const pathname = usePathname();
  const session = useSession();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let active = true;
    async function loadPending() {
      try {
        const res = await fetch("/api/admin/submissions?status=pending");
        const json = await res.json();
        if (active && json.counts?.pending !== undefined) {
          setPendingCount(json.counts.pending);
        }
      } catch {}
    }
    loadPending();
    const interval = setInterval(loadPending, 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const permissions = getPermissionsForRole(session?.data?.user?.role, session?.data?.user?.permissions);
  const items = session?.data?.user?.role === "admin"
    ? PERMISSIONS
    : PERMISSIONS.filter((item) => canAccessPermission(permissions, item.key));
  const userName = session?.data?.user?.name || (session?.data?.user?.email ? session.data.user.email.split("@")[0] : "Admin User");
  const userInitial = userName?.charAt(0)?.toUpperCase() || "A";
  const userRole = session?.data?.user?.role || "Administrator";

  return (
    <aside className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-r lg:border-b-0 lg:shrink-0 lg:overflow-y-auto z-40">
      <div className="flex min-h-screen lg:h-full flex-col justify-between p-6">

        {/* Top Header & Navigation */}
        <div className="space-y-7">
          <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <Logo />
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                GOCOUPON ADMIN
              </span>
              <span className="text-[10px] font-semibold font-mono text-zinc-500 dark:text-zinc-400">v2.4</span>
            </div>
          </div>

          {/* Navigation Items with Spacing Gaps */}
          <nav className="space-y-2.5">
            {items.map((item) => {
              const isActive = activeTab ? activeTab === item.key : pathname === item.href;
              const hasPendingBadge = item.key === "submissions" && pendingCount > 0;

              return (
                <Link
                  key={item.href}
                  href={`/admin?tab=${item.key}`}
                  onClick={(e) => {
                    if (onSelectTab) {
                      e.preventDefault();
                      onSelectTab(item.key);
                    }
                  }}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold transition-all duration-150 border cursor-pointer",
                    isActive
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                      : "border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-800/40 text-zinc-800 dark:text-zinc-200 hover:border-emerald-500/40 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span>{item.label}</span>
                    {hasPendingBadge && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[9.5px] font-black ${isActive ? "bg-white text-emerald-700" : "bg-amber-500 text-white animate-pulse"}`}>
                        {pendingCount}
                      </span>
                    )}
                  </div>
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Pinned User Profile & Logout Box */}
        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 mt-6">
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/60 p-3.5 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-600 font-extrabold text-white text-xs shadow-2xs">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-zinc-900 dark:text-white leading-tight">{userName}</p>
                <p className="truncate text-[10.5px] font-medium capitalize text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">{userRole}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/admin" })}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-700 hover:bg-rose-600 dark:hover:bg-rose-600 py-2.5 px-3 text-xs font-semibold text-white shadow-xs transition-colors duration-150 cursor-pointer"
            >
              <LogOutIcon />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

      </div>
    </aside>
  );
}
