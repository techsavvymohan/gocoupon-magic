import { useEffect, useState, useRef } from "react";
import { useRouterState, useLocation } from "@tanstack/react-router";
import { useLoadingBus } from "@/context/LoadingContext";

export function GlobalLoadingBar() {
  const routerLoading = useRouterState({
    select: (s) => s.status === "pending" || Boolean(s.isLoading),
  });
  const location = useLocation();
  const { isLoading: busLoading } = useLoadingBus();
  const active = routerLoading || busLoading;

  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPathRef = useRef(location.pathname);

  // Trigger immediate feedback on route transitions
  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      setVisible(true);
      setProgress(40);
      const timer = setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setVisible(false);
          setProgress(0);
        }, 250);
      }, 180);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (active) {
      setVisible(true);
      setProgress((prev) => (prev > 0 ? prev : 25));

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev < 65) return prev + Math.random() * 15;
          if (prev < 88) return prev + Math.random() * 5;
          if (prev < 95) return prev + 0.8;
          return prev;
        });
      }, 150);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setProgress(100);
      const timeout = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(timeout);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [active]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[3px] bg-transparent overflow-hidden"
    >
      <div
        className="h-full bg-gradient-to-r from-primary via-indigo-500 to-rose-500 shadow-[0_0_14px_rgba(99,102,241,0.7)] transition-all duration-200 ease-out"
        style={{
          width: `${Math.min(100, Math.max(0, progress))}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}

