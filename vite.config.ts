import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

function searxngDevPlugin() {
  return {
    name: "vite-plugin-searxng-dev",
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url?.startsWith("/api/shopping")) {
          try {
            const urlObj = new URL(req.url, "http://localhost:8080");
            const q = urlObj.searchParams.get("q")?.trim();
            if (!q) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Query 'q' is required" }));
              return;
            }

            // Check in-memory cache (15 min TTL)
            const cacheKey = q.toLowerCase();
            const cached = (globalThis as any).__shoppingCache?.get(cacheKey);
            if (cached && cached.expiry > Date.now()) {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.end(JSON.stringify(cached.data));
              return;
            }

            const apiKey = process.env.SERPAPI_API_KEY || process.env.SERPAPI_KEY || "";
            if (!apiKey) {
              console.warn("SERPAPI_API_KEY not set in environment. Returning empty shopping results.");
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.end(JSON.stringify({ shopping_results: [] }));
              return;
            }

            const serpUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(
              q
            )}&gl=in&hl=en&api_key=${apiKey}&num=20`;

            const upstream = await fetch(serpUrl, { signal: AbortSignal.timeout(12000) });
            if (upstream.ok) {
              const data = await upstream.json();
              if (data.shopping_results && data.shopping_results.length > 0) {
                if (!(globalThis as any).__shoppingCache) {
                  (globalThis as any).__shoppingCache = new Map();
                }
                (globalThis as any).__shoppingCache.set(cacheKey, {
                  data,
                  expiry: Date.now() + 15 * 60 * 1000,
                });
              }
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.end(JSON.stringify(data));
              return;
            }
          } catch (err: any) {
            console.warn("Shopping dev proxy error:", err.message);
          }

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.end(JSON.stringify({ shopping_results: [] }));
          return;
        }

        if (req.url?.startsWith("/api/deals")) {
          try {
            const fs = await import("node:fs");
            const path = await import("node:path");
            const dataPath = path.resolve(process.cwd(), "src/data/live-deals.json");

            if (req.url.startsWith("/api/deals/sync")) {
              try {
                // @ts-ignore
                const { runCuelinksSync } = (await import("./scripts/sync-cuelinks-live.mjs")) as any;
                const syncRes = await runCuelinksSync(0);
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.end(JSON.stringify({
                  success: true,
                  message: `Synced ${syncRes.activeCount} live deals from Cuelinks API v3`,
                  ...syncRes,
                }));
                return;
              } catch (syncErr: any) {
                console.warn("[Vite Deals Dev] Sync error:", syncErr?.message);
              }
            }

            let snapshot: any = {};
            if (fs.existsSync(dataPath)) {
              snapshot = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
            }

            const now = Date.now();
            let deals: any[] = Array.isArray(snapshot.deals) ? snapshot.deals : [];
            deals = deals.filter((d: any) => {
              if (d.expiresIn === "Expired") return false;
              if (d.endDate) {
                const end = new Date(d.endDate).getTime();
                if (!isNaN(end) && end < now) return false;
              }
              return true;
            });

            const urlObj = new URL(req.url, "http://localhost:8080");
            const category = (urlObj.searchParams.get("category") || "").toLowerCase().trim();
            const q = (urlObj.searchParams.get("q") || "").toLowerCase().trim();
            const store = (urlObj.searchParams.get("store") || urlObj.searchParams.get("merchant") || "").toLowerCase().trim();
            const badge = urlObj.searchParams.get("badge") || "";
            const sortBy = urlObj.searchParams.get("sortBy") || "trending";
            const order = urlObj.searchParams.get("order") || "desc";
            const rawLimit = parseInt(urlObj.searchParams.get("limit") || "", 10);
            const limit = isNaN(rawLimit) ? 100 : rawLimit <= 0 ? 2000 : Math.min(rawLimit, 2000);
            const rawOffset = parseInt(urlObj.searchParams.get("offset") || "", 10);
            const offset = isNaN(rawOffset) ? 0 : rawOffset;

            if (category && category !== "all") {
              deals = deals.filter((d: any) => {
                const dCat = (d.category || "").toLowerCase();
                return dCat === category || dCat.includes(category) || category.includes(dCat);
              });
            }

            if (store && store !== "all") {
              const cleanStore = store.replace(/[^a-z0-9]/g, "");
              deals = deals.filter((d: any) => {
                const dStore = (d.storeName || d.storeSlug || "").toLowerCase().replace(/[^a-z0-9]/g, "");
                return dStore.includes(cleanStore) || cleanStore.includes(dStore);
              });
            }

            if (badge && badge !== "all") {
              deals = deals.filter((d: any) => (d.badge || "").toLowerCase() === badge.toLowerCase());
            }

            if (q) {
              deals = deals.filter(
                (d: any) =>
                  (d.title || "").toLowerCase().includes(q) ||
                  (d.storeName || "").toLowerCase().includes(q) ||
                  (d.code || "").toLowerCase().includes(q) ||
                  (d.discount || "").toLowerCase().includes(q)
              );
            }

            deals.sort((a: any, b: any) => {
              let comp = 0;
              if (sortBy === "discount") {
                const aD = parseInt((a.discount || "").replace(/[^\d]/g, ""), 10) || 0;
                const bD = parseInt((b.discount || "").replace(/[^\d]/g, ""), 10) || 0;
                comp = aD - bD;
              } else if (sortBy === "verified") {
                comp = ((a.badge || "").toLowerCase() === "verified" ? 1 : 0) - ((b.badge || "").toLowerCase() === "verified" ? 1 : 0);
              } else if (sortBy === "store") {
                comp = (a.storeName || "").localeCompare(b.storeName || "");
              } else {
                comp = (a.usesCount || 0) - (b.usesCount || 0);
              }
              return order === "asc" ? comp : -comp;
            });

            const total = deals.length;
            const paginated = deals.slice(offset, offset + limit);

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.end(JSON.stringify({
              deals: paginated,
              total,
              count: paginated.length,
              page: Math.floor(offset / limit) + 1,
              hasMore: offset + limit < total,
              isDynamic: true,
              provider: "Cuelinks API v3 (Live Dynamic Feed)",
              lastSyncedAt: snapshot.updatedAt || new Date().toISOString(),
              cached: false,
            }));
            return;
          } catch (err: any) {
            console.warn("[Vite Deals Dev] Route error:", err?.message);
          }
        }

        if (!req.url?.startsWith("/api/searxng")) {
          return next();
        }
        try {
          const urlObj = new URL(req.url, "http://localhost:8080");
          const q = urlObj.searchParams.get("q");
          if (!q) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Query 'q' is required" }));
            return;
          }

          const categories = urlObj.searchParams.get("categories") || "general";
          const language = urlObj.searchParams.get("language") || "en";
          const pageno = urlObj.searchParams.get("pageno") || "1";

          const instances = [
            process.env.SEARXNG_URL,
            "https://search.mectov.my.id",
            "https://etsi.me",
            "https://sx.xo.st",
          ].filter(Boolean) as string[];

          for (const instance of instances) {
            try {
              const target = new URL(`${instance.replace(/\/+$/, "")}/search`);
              target.searchParams.set("q", q);
              target.searchParams.set("format", "json");
              target.searchParams.set("categories", categories);
              target.searchParams.set("language", language);
              target.searchParams.set("pageno", pageno);

              const upstream = await fetch(target.toString(), {
                headers: {
                  Accept: "application/json",
                  "User-Agent": "Mozilla/5.0 (compatible; goCoupon/2.0)",
                },
                signal: AbortSignal.timeout(4500),
              });

              if (upstream.ok && upstream.headers.get("content-type")?.includes("json")) {
                const data = await upstream.json();
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.end(JSON.stringify(data));
                return;
              }
            } catch {
              // Try next instance
            }
          }

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ query: q, number_of_results: 0, results: [], suggestions: [], fallback: true }));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    searxngDevPlugin(),
    TanStackRouterVite({
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
    }),
    react(),
    tailwindcss(),
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
    },
  },
  server: {
    port: 8080,
    host: true,
    headers: {
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://utt.impactcdn.com https://www.thunderbolt.com https://www.googletagmanager.com https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.thunderbolt.com; img-src 'self' data: blob: https: http:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https: wss: http://localhost:* http://127.0.0.1:*; frame-src 'self' https://www.thunderbolt.com https://chromewebstore.google.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self' https:; upgrade-insecure-requests;",
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
      "Permissions-Policy":
        'camera=(), microphone=(self "https://www.thunderbolt.com"), geolocation=(), payment=(self)',
      "X-XSS-Protection": "1; mode=block",
      "X-Permitted-Cross-Domain-Policies": "none",
    },
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
    },
    watch: {
      ignored: ["**/docs/**"],
    },
  },
  preview: {
    port: 8080,
    host: true,
    headers: {
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://utt.impactcdn.com https://www.thunderbolt.com https://www.googletagmanager.com https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.thunderbolt.com; img-src 'self' data: blob: https: http:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https: wss: http://localhost:* http://127.0.0.1:*; frame-src 'self' https://www.thunderbolt.com https://chromewebstore.google.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self' https:; upgrade-insecure-requests;",
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
      "Permissions-Policy":
        'camera=(), microphone=(self "https://www.thunderbolt.com"), geolocation=(), payment=(self)',
      "X-XSS-Protection": "1; mode=block",
      "X-Permitted-Cross-Domain-Policies": "none",
    },
  },
  optimizeDeps: {
    entries: ["index.html", "src/**/*.{ts,tsx}"],
    exclude: ["solid-js", "svelte", "vue", "caramel-ui"],
  },
  build: {
    outDir: "dist",
    // esbuild is Vite's default minifier — fast, no extra devDep required.
    // Swap to 'terser' once `terser` is installed (npm i -D terser) for slightly
    // smaller output at the cost of build speed.
    minify: "esbuild",
    cssMinify: true,
    sourcemap: false,
    target: "es2020",
    // Split vendor + feature chunks so first paint ships less JS and caching is long-lived.
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          const normalized = id.replace(/\\/g, "/");

          // 1. Heavy application data modules
          if (normalized.includes("/src/data/posts")) {
            return "data-posts";
          }
          if (normalized.includes("/src/data/")) {
            return "data-catalog";
          }

          // 2. Heavy feature page route modules
          if (normalized.includes("/src/routes/offers") || normalized.includes("/src/components/offers/")) {
            return "page-offers";
          }
          if (normalized.includes("/src/routes/admin") || normalized.includes("/src/admin/")) {
            return "page-admin";
          }
          if (normalized.includes("/src/routes/stores")) {
            return "page-stores";
          }
          if (normalized.includes("/src/routes/blog/")) {
            return "page-blog";
          }
          if (normalized.includes("/src/routes/compare")) {
            return "page-compare";
          }
          if (normalized.includes("/src/routes/product/")) {
            return "page-product";
          }
          if (normalized.includes("/src/routes/collections/")) {
            return "page-collections";
          }

          // 3. Third-party vendor dependencies
          if (normalized.includes("node_modules")) {
            if (
              normalized.includes("react-dom") ||
              normalized.includes("/react/") ||
              normalized.includes("scheduler")
            ) {
              return "vendor-react";
            }
            if (normalized.includes("@tanstack")) {
              return "vendor-tanstack";
            }
            if (normalized.includes("@radix-ui")) {
              return "vendor-radix";
            }
            if (normalized.includes("lucide-react")) {
              return "vendor-icons";
            }
            if (
              normalized.includes("recharts") ||
              normalized.includes("embla-carousel") ||
              normalized.includes("d3-")
            ) {
              return "vendor-charts";
            }
            if (
              normalized.includes("react-hook-form") ||
              normalized.includes("@hookform") ||
              normalized.includes("zod")
            ) {
              return "vendor-forms";
            }
            if (normalized.includes("@supabase")) {
              return "vendor-supabase";
            }
            if (
              normalized.includes("clsx") ||
              normalized.includes("tailwind-merge") ||
              normalized.includes("class-variance-authority") ||
              normalized.includes("sonner")
            ) {
              return "vendor-ui";
            }
            return "vendor";
          }

          return undefined;
        },
      },
    },
  },
});
