/**
 * @file src/hooks/use-live-stats.ts
 * @description Real-time telemetry and deals stats hook for home page & site headers.
 * Provides dynamically calculated counts, verification rate, and speed metrics.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchLiveStats, type LiveTelemetryStats } from "@/lib/api/deals-api";

const DEFAULT_STATS: LiveTelemetryStats = {
  totalDeals: 1625,
  verifiedCount: 1623,
  verificationRate: "96.4%",
  autoApplySpeed: "1.4s",
  formattedCount: "1,620+",
  dealsUpdatedLabel: "Updated Today: 1,620+ Deals",
  browseButtonLabel: "Browse 1,620+ Deals →",
};

export function useLiveStats(): LiveTelemetryStats {
  const { data } = useQuery({
    queryKey: ["live-deals-stats"],
    queryFn: fetchLiveStats,
    initialData: DEFAULT_STATS,
    staleTime: 60 * 1000, // 1 minute fresh
    refetchInterval: 30 * 1000, // Background refresh every 30s
    refetchOnWindowFocus: true,
  });

  return data ?? DEFAULT_STATS;
}
