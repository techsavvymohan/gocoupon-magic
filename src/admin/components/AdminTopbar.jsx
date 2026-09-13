import { useEffect, useState, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { useAdminTheme } from "./AdminThemeProvider";
import { Link } from "@/admin/compat";

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg className="h-4 w-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M18.36 5.64l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="h-4 w-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function BellIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

export default function AdminTopbar({ title, breadcrumbTrail = [] }) {
  const { theme, toggleTheme } = useAdminTheme();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications", { cache: "no-store" });
      const json = await res.json();
      if (json?.data) {
        setNotifications(json.data);
      }
    } catch (err) {
      // fail silently
    }
  }, []);

  async function markAllAsRead() {
    try {
      await fetch("/api/admin/notifications", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  }

  async function handleClearAll() {
    try {
      await fetch("/api/admin/notifications", { method: "DELETE" });
      setNotifications([]);
    } catch {}
  }

  useEffect(() => {
    let active = true;

    function loadNotifications() {
      fetch("/api/admin/notifications", { cache: "no-store" })
        .then((res) => res.json())
        .then((json) => {
          if (active && json?.data) {
            setNotifications(json.data);
          }
        })
        .catch(() => {});
    }

    loadNotifications();
    const interval = setInterval(loadNotifications, 7000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="border-b border-zinc-200/80 bg-white/90 dark:bg-zinc-900/90 dark:border-zinc-800 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8 transition-colors relative z-40">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            {breadcrumbTrail.map((item, index) => {
              const label = typeof item === "string" ? item : (item?.label || "");
              const href = typeof item === "object" ? item?.href : null;
              const key = typeof item === "string" ? `${item}-${index}` : (item?.label || index);
              return (
                <div key={key} className="flex items-center gap-2">
                  {index > 0 ? <ChevronRightIcon /> : null}
                  {href ? (
                    <Link href={href} className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                      {label}
                    </Link>
                  ) : (
                    <span>{label}</span>
                  )}
                </div>
              );
            })}
          </div>
          <h2 className="mt-1.5 text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{title}</h2>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-[260px] flex-1 sm:flex-none">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
              <SearchIcon />
            </span>
            <Input className="pl-11 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-xs" placeholder="Search stores, coupons, deals..." />
          </div>

          <div className="flex items-center gap-2">
            {/* Notification Bell Dropdown Button */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer"
                aria-label="View notifications"
              >
                <BellIcon className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white border-2 border-white dark:border-zinc-900 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {open && (
                <div className="absolute right-0 mt-2.5 w-80 rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden z-50 text-zinc-900 dark:text-white">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-4 py-3 bg-zinc-50/50 dark:bg-zinc-800/40">
                    <span className="text-xs font-bold">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3.5 transition flex items-start gap-2.5 ${
                            notif.read ? "bg-white dark:bg-zinc-900" : "bg-emerald-500/5 dark:bg-emerald-500/5 font-semibold"
                          }`}
                        >
                          <span
                            className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                              notif.type === "contact" ? "bg-emerald-500" : "bg-indigo-500"
                            }`}
                          />
                          <div className="flex-1">
                            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-snug">
                              {notif.message}
                            </p>
                            <span className="text-[9px] font-medium text-zinc-400 dark:text-zinc-500 block mt-1">
                              {new Date(notif.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-xs text-zinc-500">
                        No notifications yet
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 px-4 py-2.5 bg-zinc-50/50 dark:bg-zinc-800/40 text-[10px] font-bold">
                    <Link
                      href="/admin/messages"
                      onClick={() => setOpen(false)}
                      className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition"
                    >
                      Go to Inbox
                    </Link>
                    {notifications.length > 0 && (
                      <button
                        onClick={handleClearAll}
                        className="text-rose-600 dark:text-rose-450 hover:underline cursor-pointer"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dedicated Admin Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer"
              title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
            >
              {theme === "light" ? <MoonIcon /> : <SunIcon />}
              <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
