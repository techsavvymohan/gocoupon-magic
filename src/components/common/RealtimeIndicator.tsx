/**
 * @file src/components/common/RealtimeIndicator.tsx
 * @description Sleek live status indicator displaying realtime sync connection.
 */

import { useRealtime } from "@/context/RealtimeContext";
import { RefreshCw } from "lucide-react";

interface RealtimeIndicatorProps {
  className?: string;
  showRefreshButton?: boolean;
}

export function RealtimeIndicator({
  className = "",
  showRefreshButton = true,
}: RealtimeIndicatorProps) {
  const { isConnected, isSyncing, triggerManualRefresh } = useRealtime();

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all select-none ${
      isConnected
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
    } ${className}`}>
      <span className="relative flex h-2 w-2">
        {isConnected && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isConnected ? "bg-emerald-500" : "bg-amber-500"
          }`}
        ></span>
      </span>

      <span className="tracking-tight font-medium">
        {isConnected ? "Live Updates Active" : "Reconnecting Live Feed..."}
      </span>

      {showRefreshButton && (
        <button
          type="button"
          onClick={() => triggerManualRefresh()}
          disabled={isSyncing}
          className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
          title="Force refresh live deals and stores immediately"
          aria-label="Refresh live data"
        >
          <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
        </button>
      )}
    </div>
  );
}
