/**
 * @file PriceHistoryChart.tsx
 * @description UI/UX Pro Max 90-Day Interactive Price History & Fake Discount Detector.
 *
 * Visualizes:
 * - Responsive Recharts Area Graph with Gradient Fill & Glow
 * - 30D / 60D / 90D / 180D Duration Pills
 * - Deal Quality Score Meter with Color Grading
 * - Artificial Pre-Sale Price Spike Warning Banner
 * - Mobile-first metrics grid and touch tooltips
 */

import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import {
  getProductPriceHistory,
  calculatePriceMetrics,
  type PriceHistoryMetrics,
} from "@/lib/services/price-history";
import { AlertTriangle, TrendingDown, Clock, ShieldAlert, Sparkles, CheckCircle2, Award } from "lucide-react";

interface PriceHistoryChartProps {
  productId: string;
  productTitle?: string;
  currentPrice?: number;
  onSetAlertClick?: () => void;
}

export function PriceHistoryChart({ productId, productTitle, currentPrice, onSetAlertClick }: PriceHistoryChartProps) {
  const [days, setDays] = useState<30 | 60 | 90 | 180>(90);

  const historyData = getProductPriceHistory(productId, days, currentPrice);
  const metrics: PriceHistoryMetrics = calculatePriceMetrics(productId, currentPrice);

  const minPrice = Math.min(...historyData.map((d) => d.price));
  const maxPrice = Math.max(...historyData.map((d) => d.price));

  const getDealScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/30";
    if (score >= 60) return "text-amber-500 bg-amber-500/10 border-amber-500/30";
    return "text-rose-500 bg-rose-500/10 border-rose-500/30";
  };

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-7 shadow-xl">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-primary uppercase tracking-wider">
            <Clock className="h-3.5 w-3.5" />
            Historical Price Intelligence
          </div>
          <h3 className="mt-1 font-display text-xl sm:text-2xl font-bold text-foreground">
            Price History &amp; Trend Tracker
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Track daily price fluctuations to identify all-time lows and detect fake pre-sale price hikes.
          </p>
        </div>

        {/* Days Window Switcher */}
        <div className="flex items-center rounded-2xl border border-border bg-muted/30 p-1">
          {([30, 60, 90, 180] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                days === d
                  ? "bg-primary text-primary-foreground shadow-xs scale-105"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {d}D
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Current Price */}
        <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">
            Current Price
          </span>
          <span className="font-display text-lg sm:text-2xl font-bold text-foreground mt-1 block">
            ₹{metrics.currentPrice.toLocaleString("en-IN")}
          </span>
        </div>

        {/* 90-Day Lowest */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            90-Day Lowest
          </span>
          <span className="font-display text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            ₹{metrics.lowestPrice90d.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Average Price */}
        <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">
            90-Day Average
          </span>
          <span className="font-display text-lg sm:text-2xl font-bold text-foreground mt-1 block">
            ₹{metrics.averagePrice90d.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Deal Score */}
        <div className={`rounded-2xl border p-4 ${getDealScoreColor(metrics.dealQualityScore)}`}>
          <span className="text-[10px] font-mono uppercase tracking-wider flex items-center gap-1">
            <Award className="h-3 w-3" />
            Deal Score
          </span>
          <span className="font-display text-lg sm:text-2xl font-bold mt-1 block">
            {metrics.dealQualityScore}/100
          </span>
        </div>
      </div>

      {/* Fake Discount Warning Banner */}
      {metrics.fakeDiscountWarning?.isDetected && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-600 dark:text-amber-400">
          <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm">
              Artificial Price Spike Detected Before Sale!
            </span>
            <p className="mt-1 leading-relaxed text-muted-foreground">
              {metrics.fakeDiscountWarning.reason}
            </p>
          </div>
        </div>
      )}

      {/* Chart Canvas */}
      <div className="mt-6 h-[260px] sm:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradientPro" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[Math.floor(minPrice * 0.92), Math.ceil(maxPrice * 1.05)]}
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-2xl border border-border bg-card/95 p-3.5 shadow-2xl backdrop-blur-xl">
                      <span className="text-[10px] font-mono text-muted-foreground block">{data.date}</span>
                      <span className="font-display text-lg font-bold text-foreground">
                        ₹{data.price.toLocaleString("en-IN")}
                      </span>
                      {data.isLowest && (
                        <span className="mt-1 inline-block rounded-md bg-emerald-500/20 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-500">
                          ★ 90-DAY LOW
                        </span>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine
              y={metrics.lowestPrice90d}
              stroke="#10b981"
              strokeDasharray="3 3"
              label={{
                value: "90d Low",
                fill: "#10b981",
                fontSize: 10,
                position: "insideBottomRight",
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="var(--primary)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#priceGradientPro)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Advice Footnote */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground border-t border-border pt-3">
        <span className="flex items-center gap-1.5 font-mono text-[11px]">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          {metrics.isAllTimeLow
            ? "Strong Buy Signal: Currently at its 90-day lowest recorded price."
            : `Price is ₹${(metrics.currentPrice - metrics.lowestPrice90d).toLocaleString("en-IN")} higher than recent low.`}
        </span>
        <span className="font-mono text-[10px]">Updated hourly • Indian Merchant Feeds</span>
      </div>
    </div>
  );
}

export default PriceHistoryChart;
