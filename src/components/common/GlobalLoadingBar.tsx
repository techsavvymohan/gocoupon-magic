import { useEffect, useState, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useLoadingBus } from "@/context/LoadingContext";

export function GlobalLoadingBar() {
  const routerLoading = useRouterState({
    select: (s) => s.status === "pending" || Boolean((s as any).isLoading),
  });
  const { isLoading: busLoading } = useLoadingBus();
  const active = routerLoading || busLoading;

  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (active) {
      setVisible(true);
      setProgress((prev) => (prev > 0 ? prev : 15));

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev < 60) return prev + Math.random() * 12;
          if (prev < 85) return prev + Math.random() * 4;
          if (prev < 94) return prev + 0.5;
          return prev;
        });
      }, 180);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setProgress(100);
      const timeout = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
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
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[2.5px] bg-transparent overflow-hidden"
    >
      <div
        className="h-full bg-gradient-to-r from-primary via-indigo-500 to-rose-500 shadow-[0_0_12px_rgba(99,102,241,0.6)] transition-all duration-200 ease-out"
        style={{
          width: `${Math.min(100, Math.max(0, progress))}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
