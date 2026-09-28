import { useState, useEffect } from "react";
import { Activity, Gauge, RefreshCw, Zap, ShieldCheck, Smartphone, Laptop, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MetricData {
  count: number;
  avg: number;
  goodPercent: number;
  status: string;
}

interface WebVitalsPayload {
  success: boolean;
  totalSamples: number;
  vitalsThresholds: Record<string, string>;
  summary: Record<string, MetricData>;
  recentSamples: Array<{
    metric: string;
    value: number;
    rating: string;
    path: string;
    timestamp: string;
    connection?: string;
  }>;
}

export default function AdminWebVitalsWidget() {
  const [data, setData] = useState<WebVitalsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVitals = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/rum/vitals");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // Ignore network errors in poll
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVitals();
    const interval = setInterval(fetchVitals, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const getMetricFormat = (name: string, value: number) => {
    if (value === 0 && !data?.summary?.[name]?.count) return "—";
    if (name === "CLS") return value.toFixed(3);
    if (value >= 1000) return `${(value / 1000).toFixed(2)}s`;
    return `${Math.round(value)}ms`;
  };

  const getRatingBadge = (rating: string) => {
    if (rating === "good") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="h-3 w-3" />
          <span>Good</span>
        </span>
      );
    }
    if (rating === "needs-improvement") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <AlertTriangle className="h-3 w-3" />
          <span>Needs Imp.</span>
        </span>
      );
    }
    if (rating === "poor") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <AlertCircle className="h-3 w-3" />
          <span>Poor</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-500/10 px-2 py-0.5 text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
        <span>Awaiting</span>
      </span>
    );
  };

  const metricsConfig = [
    {
      key: "LCP",
      name: "Largest Contentful Paint",
      desc: "Loading speed for main hero content",
      target: "≤ 2.5s",
      isCore: true,
    },
    {
      key: "INP",
      name: "Interaction to Next Paint",
      desc: "Responsiveness to user taps/clicks",
      target: "≤ 200ms",
      isCore: true,
    },
    {
      key: "CLS",
      name: "Cumulative Layout Shift",
      desc: "Visual stability during page load",
      target: "≤ 0.1",
      isCore: true,
    },
    {
      key: "FCP",
      name: "First Contentful Paint",
      desc: "Initial DOM render timestamp",
      target: "≤ 1.8s",
      isCore: false,
    },
    {
      key: "TTFB",
      name: "Time to First Byte",
      desc: "Server response and CDN latency",
      target: "≤ 800ms",
      isCore: false,
    },
  ];

  return (
    <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-1">
            <Gauge className="h-3.5 w-3.5" />
            <span>Google Analytics 4 &amp; Web Vitals RUM</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Real User Experience &amp; Core Web Vitals Monitor
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
            Telemetry streamed directly from real shopper phones and desktops via <code className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400">navigator.sendBeacon</code> and GA4.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{data?.totalSamples || 0} samples captured</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchVitals}
            disabled={refreshing}
            className="gap-1.5 text-xs font-bold dark:bg-zinc-800 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* 5 Vitals Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {metricsConfig.map((m) => {
          const metricData = data?.summary?.[m.key];
          const hasData = (metricData?.count || 0) > 0;
          return (
            <div
              key={m.key}
              className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${
                m.isCore
                  ? "border-indigo-200/80 dark:border-indigo-900/50 bg-indigo-50/20 dark:bg-indigo-950/10"
                  : "border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-800/20"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sm font-black text-zinc-900 dark:text-white">
                      {m.key}
                    </span>
                    {m.isCore && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        Core
                      </span>
                    )}
                  </div>
                  {getRatingBadge(metricData?.status || "awaiting")}
                </div>

                <div className="mt-2">
                  <div className="text-2xl font-black text-zinc-900 dark:text-white">
                    {loading ? "..." : getMetricFormat(m.key, metricData?.avg || 0)}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Target: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{m.target}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[11px]">
                <span className="text-zinc-500 dark:text-zinc-400">
                  {hasData ? `${metricData?.count} pings` : "0 pings"}
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {hasData ? `${metricData?.goodPercent}% good` : "100% target"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Stream of Telemetry Samples */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Live Real-Device Telemetry Feed
            </h4>
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
            Zero-penalty asynchronous beaconing
          </span>
        </div>

        {(!data?.recentSamples || data.recentSamples.length === 0) ? (
          <div className="py-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
            Awaiting real visitor traffic. Telemetry automatically collects as users browse GoCoupon.io.
          </div>
        ) : (
          <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 max-h-[180px] overflow-y-auto pr-1">
            {data.recentSamples.slice(0, 5).map((sample, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono font-bold text-zinc-900 dark:text-white px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-[11px]">
                    {sample.metric}
                  </span>
                  <span className="text-zinc-600 dark:text-zinc-400 truncate max-w-[180px] sm:max-w-xs font-mono text-[11px]">
                    {sample.path}
                  </span>
                  {sample.connection && (
                    <span className="text-[10px] text-zinc-400 uppercase font-mono hidden sm:inline">
                      ({sample.connection})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">
                    {getMetricFormat(sample.metric, sample.value)}
                  </span>
                  {getRatingBadge(sample.rating)}
                  <span className="text-[10px] text-zinc-400 font-mono hidden md:inline">
                    {new Date(sample.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
