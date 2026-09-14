/**
 * @file src/routes/pricing-intelligence.tsx
 * @description Enterprise B2B Pricing Intelligence & MAP Compliance SaaS Platform.
 *
 * Monetizes GoCoupon's multi-store price crawling engine as an enterprise data product:
 * - Real-time competitor tracking across Amazon, Flipkart, Croma, and Blinkit
 * - Automated MAP (Minimum Advertised Price) violation detection & webhook alerts
 * - Developer API documentation with interactive code snippets
 * - Enterprise subscription tiers ($99/mo Starter, $299/mo Pro, Custom Enterprise)
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { createSeoHead } from "@/lib/seo";
import {
  TrendingDown,
  ShieldAlert,
  Zap,
  CheckCircle2,
  Terminal,
  Activity,
  Code2,
  ExternalLink,
  Search,
  Server,
  Database,
  ArrowRight,
  Sparkles,
  BarChart3,
  Sliders,
  BellRing,
} from "lucide-react";

export const Route = createFileRoute("/pricing-intelligence")({
  component: PricingIntelligencePage,
  head: () =>
    createSeoHead({
      title: "Enterprise Pricing Intelligence & MAP Monitoring API – GoCoupon",
      description:
        "Real-time e-commerce competitor price monitoring, MAP violation tracking, and historical trend APIs for consumer brands and D2C sellers across Amazon, Flipkart, and Croma.",
      path: "/pricing-intelligence",
      keywords: "pricing intelligence api, map monitoring software, e-commerce price tracker b2b, competitor price scraping api, buyhatke enterprise alternative",
    }),
});

interface DemoQueryResult {
  sku: string;
  mapPrice?: number;
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  storesMonitored: number;
  violationsFound: number;
  merchants: Array<{
    store: string;
    price: number;
    originalPrice: number;
    status: "COMPLIANT" | "VIOLATION";
    violationDelta?: number;
  }>;
}

function PricingIntelligencePage() {
  const [demoQuery, setDemoQuery] = useState("Sony WH-1000XM5");
  const [demoMap, setDemoMap] = useState("26990");
  const [isLoading, setIsLoading] = useState(false);
  const [demoResult, setDemoResult] = useState<DemoQueryResult | null>({
    sku: "Sony WH-1000XM5",
    mapPrice: 26990,
    lowestPrice: 24990,
    highestPrice: 29990,
    averagePrice: 27150,
    storesMonitored: 5,
    violationsFound: 2,
    merchants: [
      { store: "Amazon.in", price: 26990, originalPrice: 29990, status: "COMPLIANT" },
      { store: "Flipkart", price: 24990, originalPrice: 29990, status: "VIOLATION", violationDelta: 2000 },
      { store: "Croma", price: 26990, originalPrice: 29990, status: "COMPLIANT" },
      { store: "Reliance Digital", price: 25490, originalPrice: 29990, status: "VIOLATION", violationDelta: 1500 },
      { store: "Tata CLiQ", price: 26990, originalPrice: 29990, status: "COMPLIANT" },
    ],
  });
  const [activeCodeTab, setActiveCodeTab] = useState<"curl" | "node" | "python">("curl");
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleTestApi = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const mapVal = parseFloat(demoMap) || 0;
      const res = await fetch(`/api/v1/intelligence/live-price?q=${encodeURIComponent(demoQuery)}&mapPrice=${mapVal}`);
      if (res.ok) {
        const json = await res.json();
        const merchants = (json.merchants || []).map((m: any) => ({
          store: m.store,
          price: m.price,
          originalPrice: m.originalPrice,
          status: m.mapCompliance?.status === "VIOLATION_DETECTED" ? "VIOLATION" : "COMPLIANT",
          violationDelta: m.mapCompliance?.violationDelta || 0,
        }));

        setDemoResult({
          sku: json.sku || demoQuery,
          mapPrice: mapVal,
          lowestPrice: json.summary?.lowestPrice || 0,
          highestPrice: json.summary?.highestPrice || 0,
          averagePrice: json.summary?.averagePrice || 0,
          storesMonitored: json.summary?.storesMonitored || merchants.length,
          violationsFound: json.summary?.violationsFound || 0,
          merchants,
        });
      }
    } catch {
      // Keep existing data on network error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <a href="/" className="hover:text-primary transition-colors">Home</a>
          <span>/</span>
          <span className="text-foreground font-semibold">B2B Pricing Intelligence</span>
        </nav>

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-950/40 via-background to-purple-950/20 p-8 sm:p-12 shadow-2xl">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-bold text-blue-400">
              <Server className="h-3.5 w-3.5" />
              GoCoupon Enterprise Data Cloud
            </div>
            <h1 className="mt-4 font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              Real-Time E-Commerce <br />
              <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                Pricing Intelligence &amp; MAP Radar
              </span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Empower your brand with sub-second competitive price monitoring across Amazon, Flipkart, Blinkit, and Croma. Automatically detect unauthorized seller discounting and enforce MAP compliance at scale.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#demo-playground"
                className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105"
              >
                Try Interactive API Sandbox
              </a>
              <a
                href="#pricing-tiers"
                className="rounded-xl border border-border bg-muted/40 px-5 py-2.5 text-xs font-bold text-foreground transition-colors hover:bg-muted"
              >
                View Enterprise Tiers
              </a>
            </div>
          </div>
        </div>

        {/* Key Feature Pillars */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-base font-bold text-foreground">Omni-Channel Price Feeds</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Track real-time landed pricing across 8+ premier Indian marketplaces, capturing hidden seller coupons and bank cart discounts.
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-base font-bold text-foreground">MAP Violation Sentinel</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Instant webhook and email alerts when rogue third-party marketplace resellers breach your Minimum Advertised Price guidelines.
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-base font-bold text-foreground">90-Day Volatility Modeling</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Access deep historical time-series data with outlier rejection, algorithmic moving averages, and pre-festival price hike detection.
            </p>
          </div>
        </div>

        {/* Interactive API Playground */}
        <div id="demo-playground" className="mt-16 scroll-mt-8 rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-primary uppercase tracking-wider">
                <Terminal className="h-3.5 w-3.5" />
                Live API Console
              </div>
              <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold text-foreground">
                Live Pricing Intelligence Playground
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Query our live multi-store engine and test instant MAP compliance verification.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              API Status: Operational (84ms)
            </div>
          </div>

          {/* Playground Form */}
          <form onSubmit={handleTestApi} className="mt-6 grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Target Product / SKU</label>
              <input
                type="text"
                value={demoQuery}
                onChange={(e) => setDemoQuery(e.target.value)}
                placeholder="e.g. iPhone 16 128GB, Sony WH-1000XM5"
                className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Approved MAP Price (₹)</label>
              <input
                type="number"
                value={demoMap}
                onChange={(e) => setDemoMap(e.target.value)}
                placeholder="26990"
                className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
              >
                {isLoading ? "Executing…" : "Execute Query"}
              </button>
            </div>
          </form>

          {/* Playground Results Card */}
          {demoResult && (
            <div className="mt-6 space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                  <span className="text-[10px] uppercase font-mono text-muted-foreground">Lowest Market Price</span>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">₹{demoResult.lowestPrice.toLocaleString()}</div>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                  <span className="text-[10px] uppercase font-mono text-muted-foreground">Highest Market Price</span>
                  <div className="text-lg font-bold text-foreground mt-0.5">₹{demoResult.highestPrice.toLocaleString()}</div>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                  <span className="text-[10px] uppercase font-mono text-muted-foreground">Stores Monitored</span>
                  <div className="text-lg font-bold text-foreground mt-0.5">{demoResult.storesMonitored} Merchants</div>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                  <span className="text-[10px] uppercase font-mono text-muted-foreground">MAP Violations</span>
                  <div className={`text-lg font-bold mt-0.5 ${demoResult.violationsFound > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                    {demoResult.violationsFound} Detected
                  </div>
                </div>
              </div>

              {/* Merchant Breakdown Table */}
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase">
                    <tr>
                      <th className="p-3">Merchant</th>
                      <th className="p-3">Current Price</th>
                      <th className="p-3">MAP Status</th>
                      <th className="p-3">Violation Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {demoResult.merchants.map((m, idx) => (
                      <tr key={idx} className="hover:bg-muted/20">
                        <td className="p-3 font-semibold text-foreground">{m.store}</td>
                        <td className="p-3 font-mono font-bold text-foreground">₹{m.price.toLocaleString()}</td>
                        <td className="p-3">
                          {m.status === "VIOLATION" ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30">
                              <ShieldAlert className="h-3 w-3" /> VIOLATION
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="h-3 w-3" /> COMPLIANT
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono">
                          {m.violationDelta && m.violationDelta > 0 ? (
                            <span className="text-rose-400 font-bold">-₹{m.violationDelta.toLocaleString()}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Developer Integration Snippets */}
        <div className="mt-16 rounded-3xl border border-border/80 bg-zinc-950 p-6 sm:p-10 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-blue-400 uppercase tracking-wider">
                <Code2 className="h-3.5 w-3.5" />
                Developer Documentation
              </div>
              <h3 className="mt-1 font-display text-xl font-bold text-white">
                Simple 3-Line REST Integration
              </h3>
            </div>
            <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-900 p-1">
              {(["curl", "node", "python"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveCodeTab(tab)}
                  className={`rounded-lg px-3 py-1 text-xs font-mono font-bold transition-all ${
                    activeCodeTab === tab
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Code Block */}
          <pre className="mt-6 overflow-x-auto rounded-2xl bg-zinc-900/90 p-5 font-mono text-xs text-zinc-200 border border-zinc-800/80 leading-relaxed">
            {activeCodeTab === "curl" &&
`curl -X GET "https://gocoupon.io/api/v1/intelligence/live-price?q=Sony+WH-1000XM5&mapPrice=26990" \\
     -H "Authorization: Bearer YOUR_ENTERPRISE_API_KEY"`}

            {activeCodeTab === "node" &&
`const response = await fetch("https://gocoupon.io/api/v1/intelligence/live-price?q=Sony+WH-1000XM5&mapPrice=26990", {
  headers: { "Authorization": "Bearer YOUR_ENTERPRISE_API_KEY" }
});
const data = await response.json();
console.log(\`MAP Violations detected: \${data.summary.violationsFound}\`);`}

            {activeCodeTab === "python" &&
`import requests

url = "https://gocoupon.io/api/v1/intelligence/live-price"
headers = {"Authorization": "Bearer YOUR_ENTERPRISE_API_KEY"}
params = {"q": "Sony WH-1000XM5", "mapPrice": 26990}

response = requests.get(url, headers=headers, params=params)
data = response.json()
print("Stores monitored:", data["summary"]["storesMonitored"])`}
          </pre>
        </div>

        {/* Pricing Tiers Section */}
        <div id="pricing-tiers" className="mt-16 scroll-mt-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Predictable Enterprise Pricing</span>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-foreground">
              Scale Your Brand Intelligence
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              Whether you are a rising D2C brand or an established multinational manufacturer, GoCoupon provides high-throughput pricing infrastructure.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {/* Starter Plan */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-md flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Starter Tier</span>
                <div className="mt-2 font-display text-3xl font-extrabold text-foreground">$99 <span className="text-xs font-normal text-muted-foreground">/ month</span></div>
                <p className="mt-2 text-xs text-muted-foreground">Essential price monitoring for emerging D2C brand catalogues.</p>
                <ul className="mt-6 space-y-2.5 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Up to 500 Monitored SKUs</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Hourly Refresh Frequency</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Amazon &amp; Flipkart Tracking</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Daily MAP Violation Email Digest</li>
                </ul>
              </div>
              <a href="/contact?tier=starter" className="mt-8 block text-center rounded-xl border border-border bg-muted/30 py-2.5 text-xs font-bold text-foreground hover:bg-muted">
                Choose Starter
              </a>
            </div>

            {/* Pro Plan */}
            <div className="relative rounded-3xl border-2 border-primary bg-card p-6 shadow-xl flex flex-col justify-between">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary-foreground">
                Most Popular
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Pro Tier</span>
                <div className="mt-2 font-display text-3xl font-extrabold text-foreground">$299 <span className="text-xs font-normal text-muted-foreground">/ month</span></div>
                <p className="mt-2 text-xs text-muted-foreground">Comprehensive intelligence &amp; automated webhook enforcement.</p>
                <ul className="mt-6 space-y-2.5 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Up to 5,000 Monitored SKUs</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> 15-Minute Refresh Frequency</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Amazon, Flipkart, Croma, Blinkit</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Instant Real-Time Webhook Alerts</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> 90-Day Historical Volatility API</li>
                </ul>
              </div>
              <a href="/contact?tier=pro" className="mt-8 block text-center rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:brightness-110">
                Start 14-Day Free Trial
              </a>
            </div>

            {/* Enterprise Plan */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-md flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Enterprise Tier</span>
                <div className="mt-2 font-display text-3xl font-extrabold text-foreground">Custom <span className="text-xs font-normal text-muted-foreground">/ SLA</span></div>
                <p className="mt-2 text-xs text-muted-foreground">Dedicated infrastructure for large retail conglomerates.</p>
                <ul className="mt-6 space-y-2.5 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Unlimited Catalog SKUs</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Sub-Minute Streaming Feeds</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Custom Retailer Connector Scraping</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> 99.99% Uptime SLA Guarantee</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Dedicated Account Engineer</li>
                </ul>
              </div>
              <a href="/contact?tier=enterprise" className="mt-8 block text-center rounded-xl border border-border bg-muted/30 py-2.5 text-xs font-bold text-foreground hover:bg-muted">
                Contact Enterprise Sales
              </a>
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
