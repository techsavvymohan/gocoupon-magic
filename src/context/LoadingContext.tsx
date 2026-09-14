import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";

interface LoadingContextType {
  isLoading: boolean;
  activeCount: number;
  startLoading: (key?: string) => () => void;
  stopLoading: (key?: string) => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  activeCount: 0,
  startLoading: () => () => {},
  stopLoading: () => {},
});

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [activeTasks, setActiveTasks] = useState<Set<string>>(new Set());

  const startLoading = useCallback((key = Math.random().toString(36).slice(2)) => {
    setActiveTasks((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });

    return () => {
      setActiveTasks((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    };
  }, []);

  const stopLoading = useCallback((key?: string) => {
    setActiveTasks((prev) => {
      if (!key) {
        return new Set();
      }
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      isLoading: activeTasks.size > 0,
      activeCount: activeTasks.size,
      startLoading,
      stopLoading,
    }),
    [activeTasks.size, startLoading, stopLoading]
  );

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
}

export function useLoadingBus() {
  return useContext(LoadingContext);
}
